import { NextResponse } from 'next/server';
import { supabase, createClientWithToken } from '@/lib/supabase';

/**
 * 获取指定 ID 的博客详情
 * @param {Request} request - 请求对象
 * @param {Object} params - 路由参数
 * @returns {Promise<NextResponse>} - 返回博客详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  // 如果有 token 则使用身份化的客户端
  const requestSupabase = token ? createClientWithToken(token) : supabase;

  const { data, error } = await requestSupabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .or('is_deleted.is.null,is_deleted.eq.false')
    .single();

  if (error) {
    console.error(`获取文章详情失败 [ID: ${id}]:`, error.message);
    return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
  }

  return NextResponse.json({ data });
}

/**
 * 更新指定 ID 的博客内容
 * @param {Request} request - 请求对象，包含更新的博客字段
 * @param {Object} params - 路由参数
 * @returns {Promise<NextResponse>} - 返回更新后的博客数据
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // 验证管理员身份
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // 验证分类合法性
    const ALLOWED_CATEGORIES = ['生活边角料', '情绪随笔', '干货分享', '成长复盘'];
    if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: `无效的分类。必须是以下之一: ${ALLOWED_CATEGORIES.join(', ')}` 
      }, { status: 400 });
    }

    // 过滤允许更新的字段
    const allowedFields = [
      'title', 'content', 'excerpt', 'cover_image', 
      'category', 'tags', 'draft', 'images', 'is_deleted', 'deleted_at'
    ] as const;
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const { data, error } = await requestSupabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`更新文章失败 [ID: ${id}]:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error(`更新文章异常 [ID: ${id}]:`, e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 部分更新指定 ID 的博客字段
 * @param {Request} request - 请求对象，包含要更新的博客字段
 * @param {Object} params - 路由参数
 * @returns {Promise<NextResponse>} - 返回更新后的博客数据
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // 验证用户身份
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // 分类合法性验证
    const ALLOWED_CATEGORIES = ['生活边角料', '情绪随笔', '干货分享', '成长复盘'];
    if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: `无效的分类。必须是以下之一: ${ALLOWED_CATEGORIES.join(', ')}` 
      }, { status: 400 });
    }

    // 过滤允许更新的字段
    const allowedFields = [
      'title', 'content', 'excerpt', 'cover_image', 
      'category', 'tags', 'draft', 'images', 'is_deleted', 'deleted_at'
    ] as const;
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const { data, error } = await requestSupabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`部分更新文章失败 [ID: ${id}]:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error(`部分更新文章异常 [ID: ${id}]:`, e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 删除指定 ID 的博客
 * 支持逻辑删除（移入回收站）、恢复以及永久删除
 * @param {Request} request - 请求对象，URL 包含 permanent 或 restore 参数
 * @param {Object} params - 路由参数
 * @returns {Promise<NextResponse>} - 返回操作成功状态或错误信息
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';
  const restore = searchParams.get('restore') === 'true';
  
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // 验证用户身份
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '用户信息验证失败' }, { status: 401 });
  }

  try {
    if (restore) {
      // 从回收站恢复
      const { error } = await requestSupabase
        .from('blogs')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id);

      if (error) {
        console.error(`恢复文章失败 [ID: ${id}]:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: '文章已从回收站恢复' });
    }

    if (permanent) {
      // 永久删除
      const { error } = await requestSupabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`永久删除文章失败 [ID: ${id}]:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // 逻辑删除（移入回收站）
      const { error } = await requestSupabase
        .from('blogs')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error(`移动文章到回收站失败 [ID: ${id}]:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error(`删除文章异常 [ID: ${id}]:`, e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
