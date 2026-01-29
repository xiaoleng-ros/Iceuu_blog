import { NextResponse } from 'next/server';
import { supabase, createClientWithToken } from '@/lib/supabase';
import { deleteFileFromGitHub } from '@/lib/github';

export const runtime = 'edge';

/**
 * 获取媒体列表
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type');
  
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const requestSupabase = token ? createClientWithToken(token) : supabase;

  let query = requestSupabase
    .from('media')
    .select('*', { count: 'exact' });

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

/**
 * 删除媒体资源
 * 注意：目前仅删除数据库记录，GitHub 上的文件由于 CDN 缓存和删除复杂度，暂不物理删除
 */
export async function DELETE(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // 验证用户
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '缺少资源ID' }, { status: 400 });
    }

    // 1. 获取要删除的媒体路径，以便同步从 GitHub 删除
    const { data: mediaFiles, error: fetchError } = await requestSupabase
      .from('media')
      .select('path')
      .in('id', ids);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 2. 从 GitHub 同步删除文件
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        if (file.path) {
          try {
            await deleteFileFromGitHub(file.path, `Delete media: ${file.path}`);
          } catch (ghError) {
            console.error(`Failed to delete file from GitHub: ${file.path}`, ghError);
            // 这里我们选择记录错误但继续删除数据库记录，或者根据需求决定是否中断
          }
        }
      }
    }

    // 3. 从数据库删除记录
    const { error: deleteError } = await requestSupabase
      .from('media')
      .delete()
      .in('id', ids);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '请求解析失败' }, { status: 400 });
  }
}
