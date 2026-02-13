import { NextResponse } from 'next/server';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { supabase, createClientWithToken } from '@/lib/supabase';

/**
 * 构建博客列表查询基础对象
 * @param supabaseClient - Supabase 客户端实例
 * @param category - 分类筛选
 * @param tag - 标签筛选
 * @returns 查询对象
 */
function buildBaseQuery(supabaseClient: SupabaseClient, category: string | null, tag: string | null) {
  let query = supabaseClient
    .from('blogs')
    .select('id, title, excerpt, cover_image, category, tags, created_at, draft', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (tag) query = query.contains('tags', [tag]);
  
  return query;
}

/**
 * 处理 GET 请求中的分页和元数据
 */
function getPaginationMeta(count: number | null, page: number, limit: number) {
  return {
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * 获取回收站中的博客
 * @param supabaseClient - Supabase 客户端实例
 * @param page - 页码
 * @param limit - 每页数量
 * @returns 博客数据、总数和错误信息
 */
async function getDeletedBlogs(
  supabaseClient: SupabaseClient, 
  page: number, 
  limit: number
): Promise<{ data: unknown[] | null; count: number; error: PostgrestError | null }> {
  try {
    const { data, error, count } = await supabaseClient
      .from('blogs')
      .select('id, title, excerpt, cover_image, category, tags, created_at, draft, is_deleted, deleted_at', { count: 'exact' })
      .eq('is_deleted', true)
      .range((page - 1) * limit, page * limit - 1);
    
    if (error && error.message.includes('is_deleted')) {
      return { data: [], count: 0, error: null };
    }
    
    return { data, count: count ?? 0, error };
  } catch (e) {
    console.error('获取已删除文章异常:', e);
    return { data: null, count: 0, error: e as PostgrestError };
  }
}

/**
 * 根据状态获取查询构建器
 * @param query - 基础查询对象
 * @param status - 状态筛选 (draft, published)
 * @param hasToken - 是否有认证令牌
 * @returns 配置后的查询对象
 */
function applyStatusFilter(query: ReturnType<typeof buildBaseQuery>, status: string | null, hasToken: boolean) {
  if (status === 'draft') {
    return query.eq('draft', true);
  }
  if (status === 'published') {
    return query.eq('draft', false);
  }
  if (!hasToken) {
    return query.eq('draft', false);
  }
  return query;
}

/**
 * 获取回收站数据
 */
async function fetchDeletedBlogs(requestSupabase: SupabaseClient, page: number, limit: number) {
  const { data, count, error } = await getDeletedBlogs(requestSupabase, page, limit);
  if (error) {
    return { data: [], meta: getPaginationMeta(count, page, limit), error: error.message };
  }
  return { data, meta: getPaginationMeta(count, page, limit), error: null };
}

/**
 * 获取正常博客数据
 */
async function fetchNormalBlogs(params: {
  requestSupabase: SupabaseClient;
  category: string | null;
  tag: string | null;
  status: string | null;
  hasToken: boolean;
  page: number;
  limit: number;
}) {
  const { requestSupabase, category, tag, status, hasToken, page, limit } = params;
  
  let query = buildBaseQuery(requestSupabase, category, tag);
  query = query.or('is_deleted.is.null,is_deleted.eq.false');
  query = applyStatusFilter(query, status, hasToken);

  const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1);

  if (error && error.message.includes('is_deleted')) {
    let retryQuery = buildBaseQuery(requestSupabase, category, tag);
    retryQuery = applyStatusFilter(retryQuery, status, hasToken);
    const { data: rData, error: rError, count: rCount } = await retryQuery.range((page - 1) * limit, page * limit - 1);
    if (rError) {
      return { data: [], meta: getPaginationMeta(rCount, page, limit), error: rError.message };
    }
    return { data: rData, meta: getPaginationMeta(rCount, page, limit), error: null };
  }

  if (error) {
    return { data: [], meta: getPaginationMeta(count, page, limit), error: error.message };
  }

  return { data, meta: getPaginationMeta(count, page, limit), error: null };
}

/**
 * 处理获取博客列表的 GET 请求
 * 支持分页、分类筛选、标签筛选及状态筛选（已发布、草稿、回收站）
 * @param {Request} request - Request 对象，包含查询参数 (page, limit, category, tag, status)
 * @returns {Promise<NextResponse>} - 返回博客列表及分页元数据
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const status = searchParams.get('status');
  
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const requestSupabase = token ? createClientWithToken(token) : supabase;
  const hasToken = !!token;

  let result;
  if (status === 'deleted') {
    result = await fetchDeletedBlogs(requestSupabase, page, limit);
  } else {
    result = await fetchNormalBlogs({ requestSupabase, category, tag, status, hasToken, page, limit });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data, meta: result.meta });
}

/**
 * 处理创建博客的 POST 请求
 * 需要管理员权限，包含基本字段校验和分类校验
 * @param {Request} request - Request 对象，包含博客内容 Body
 * @returns {Promise<NextResponse>} - 返回创建成功的博客数据或错误信息
 */
export async function POST(request: Request) {
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
    
    // 基础字段验证
    if (!body.title || !body.content) {
      return NextResponse.json({ error: '标题和内容是必填项' }, { status: 400 });
    }

    // 分类合法性验证
    const ALLOWED_CATEGORIES = ['生活边角料', '情绪随笔', '干货分享', '成长复盘'];
    if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: `无效的分类。必须是以下之一: ${ALLOWED_CATEGORIES.join(', ')}` 
      }, { status: 400 });
    }

    // 过滤允许的字段，避免因数据库缺失列（如 slug）导致报错
    const allowedFields = [
      'title', 'content', 'excerpt', 'cover_image', 
      'category', 'tags', 'draft', 'images'
    ] as const;
    
    const insertData: Record<string, unknown> = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        insertData[field] = body[field];
      }
    });

    const { data, error } = await requestSupabase
      .from('blogs')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('创建博客失败:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error('创建博客异常:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 处理批量更新博客的 PATCH 请求
 * 用于批量修改状态（如发布、设为草稿等）
 * @param {Request} request - Request 对象，包含 ids 和 updates
 * @returns {Promise<NextResponse>} - 返回操作成功状态或错误信息
 */
export async function PATCH(request: Request) {
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
    const { ids, updates } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '必须提供文章 ID 列表' }, { status: 400 });
    }

    const { error } = await requestSupabase
      .from('blogs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      console.error('批量更新博客失败:', error.message);
      if (error.message.includes('is_deleted')) {
        return NextResponse.json({ 
          error: '数据库缺少 is_deleted 列，操作失败。请先运行 supabase_schema.sql 中的更新语句。' 
        }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error('批量更新博客异常:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 处理批量删除博客的 DELETE 请求
 * 支持移入回收站（软删除）和永久删除
 * @param {Request} request - Request 对象，URL 包含 permanent 参数，Body 包含 ids
 * @returns {Promise<NextResponse>} - 返回操作成功状态或错误信息
 */
export async function DELETE(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';

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
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '必须提供文章 ID 列表' }, { status: 400 });
    }

    if (permanent) {
      // 永久删除
      const { error } = await requestSupabase
        .from('blogs')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('永久删除文章失败:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // 软删除（移入回收站）
      const { error } = await requestSupabase
        .from('blogs')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .in('id', ids);

      if (error) {
        console.error('移动文章到回收站失败:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '服务器内部错误';
    console.error('批量删除文章异常:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
