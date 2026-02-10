import { NextResponse } from 'next/server';
import { createClientWithToken } from '@/lib/supabase';
import { uploadImageToGitHub, getJsDelivrUrl, deleteFileFromGitHub } from '@/lib/github';

export const runtime = 'edge';

/**
 * 获取 GitHub 配置
 * @param requestSupabase - Supabase 客户端
 * @returns GitHub 配置对象或 undefined
 */
async function getGitHubConfig(requestSupabase: any) {
  const { data: configData } = await requestSupabase
    .from('site_config')
    .select('key, value')
    .in('key', ['github_token', 'github_owner', 'github_repo', 'github_branch']);

  const dbConfig = configData?.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  if (!dbConfig?.github_token) return undefined;

  return {
    token: dbConfig.github_token,
    owner: dbConfig.github_owner,
    repo: dbConfig.github_repo,
    branch: dbConfig.github_branch || 'main',
  };
}

/**
 * 根据上传类型生成文件存储路径
 * @param type - 上传类型 (avatar, post, site, other)
 * @param userId - 用户 ID
 * @param fileName - 原始文件名
 * @param contextId - 上下文 ID (如文章 ID)
 * @returns 存储路径字符串
 */
function generateFilePath(type: string, userId: string, fileName: string, contextId?: string): string {
  const ext = fileName.split('.').pop() || 'jpg';
  const uuid = crypto.randomUUID();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  switch (type) {
    case 'avatar':
      return `avatars/${userId}.${ext}`;
    case 'post':
      return `posts/${contextId || 'draft'}-${dateStr}/${uuid}.${ext}`;
    case 'site':
      return `site/${uuid}.${ext}`;
    default:
      return `others/${dateStr}/${uuid}.${ext}`;
  }
}

/**
 * 处理文件上传请求
 * 1. 验证用户身份
 * 2. 获取 GitHub 配置（优先从数据库 site_config 表获取）
 * 3. 处理 FormData 中的文件
 * 4. 将文件转换为 Base64 并上传至 GitHub
 * 5. 将上传记录保存到数据库 media 表
 * @param {Request} request - 包含 FormData 的请求对象
 * @returns {Promise<NextResponse>} - 返回上传成功的媒体记录或错误信息
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });
  }

  const githubConfig = await getGitHubConfig(requestSupabase);
  let filePath = '';
  let uploadedToGithub = false;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'other';
    const contextId = formData.get('contextId') as string;

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('base64');

    filePath = generateFilePath(type, user.id, file.name, contextId);

    // 步骤 1: 上传至 GitHub
    await uploadImageToGitHub(content, filePath, `上传 ${type} 图片: ${filePath}`, githubConfig);
    uploadedToGithub = true;
    
    // 步骤 2: 获取 CDN 地址
    const url = getJsDelivrUrl(filePath, githubConfig);

    // 步骤 3: 保存记录到 media 表
    const { data: mediaData, error: dbError } = await requestSupabase
      .from('media')
      .insert({
        filename: file.name,
        url,
        path: filePath,
        size: file.size,
        type: type === 'post' ? 'blog' : type,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`保存媒体记录到数据库失败: ${dbError.message}`);
    }

    return NextResponse.json({ data: mediaData });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error('上传过程中发生异常:', e);
    
    if (uploadedToGithub && filePath) {
      try {
        await deleteFileFromGitHub(filePath, '回滚: 上传失败');
        console.warn(`由于错误，已从 GitHub 回滚文件 ${filePath}`);
      } catch (rollbackError) {
        console.error('回滚失败:', rollbackError);
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
