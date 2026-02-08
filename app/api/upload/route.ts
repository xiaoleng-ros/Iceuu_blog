import { NextResponse } from 'next/server';
import { createClientWithToken } from '@/lib/supabase';
import { uploadImageToGitHub, getJsDelivrUrl, deleteFileFromGitHub } from '@/lib/github';

export const runtime = 'edge';

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

  // 从 site_config 表获取 GitHub 配置，实现动态图床配置
  const { data: configData } = await requestSupabase
    .from('site_config')
    .select('key, value')
    .in('key', ['github_token', 'github_owner', 'github_repo', 'github_branch']);

  const dbConfig = configData?.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const githubConfig = dbConfig?.github_token ? {
    token: dbConfig.github_token,
    owner: dbConfig.github_owner,
    repo: dbConfig.github_repo,
    branch: dbConfig.github_branch || 'main',
  } : undefined;

  let filePath = '';
  let uploadedToGithub = false;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'other'; // avatar, post, site
    const contextId = formData.get('contextId') as string; // e.g. articleId

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 读取文件内容并转换为 Base64
    const arrayBuffer = await file.arrayBuffer();
    // Edge Runtime 下 Buffer 是可用的，但也可以使用更通用的方式
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('base64');

    // 根据类型生成文件存储路径
    const ext = file.name.split('.').pop() || 'jpg';
    const uuid = crypto.randomUUID();
    
    const date = new Date();
    // 格式化日期为 YYYYMMDD
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    switch (type) {
      case 'avatar':
        // 头像路径：avatars/[user_id].[ext]
        filePath = `avatars/${user.id}.${ext}`;
        break;
      case 'post':
        // 文章图片路径：posts/[context_id]-[date]/[uuid].[ext]
        const articlePart = contextId || 'draft';
        filePath = `posts/${articlePart}-${dateStr}/${uuid}.${ext}`;
        break;
      case 'site':
        // 站点图片路径：site/[uuid].[ext]
        filePath = `site/${uuid}.${ext}`;
        break;
      default:
        // 其他图片路径：others/[date]/[uuid].[ext]
        filePath = `others/${dateStr}/${uuid}.${ext}`;
        break;
    }

    // 步骤 1: 上传至 GitHub
    await uploadImageToGitHub(content, filePath, `上传 ${type} 图片: ${filePath}`, githubConfig);
    uploadedToGithub = true;
    
    // 步骤 2: 获取 CDN 地址
    const url = getJsDelivrUrl(filePath, githubConfig);

    // 步骤 3: 保存记录到 media 表
    let { data: mediaData, error: dbError } = await requestSupabase
      .from('media')
      .insert({
        filename: file.name,
        url,
        path: filePath,
        size: file.size,
        type: type === 'post' ? 'blog' : type, // 统一映射到数据库枚举类型
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`保存媒体记录到数据库失败: ${dbError.message}`);
    }

    return NextResponse.json({ data: mediaData });
  } catch (e: any) {
    console.error('上传过程中发生异常:', e);
    
    // 如果已上传至 GitHub 但后续失败（如数据库写入失败），则尝试回滚
    if (uploadedToGithub && filePath) {
      try {
        await deleteFileFromGitHub(filePath, '回滚: 上传失败');
        console.info(`由于错误，已从 GitHub 回滚文件 ${filePath}`);
      } catch (rollbackError) {
        console.error('回滚失败:', rollbackError);
      }
    }

    return NextResponse.json({ error: e.message || '服务器内部错误' }, { status: 500 });
  }
}
