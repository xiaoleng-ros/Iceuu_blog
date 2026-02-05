import { NextResponse } from 'next/server';
import { supabase, createClientWithToken } from '@/lib/supabase';

export const runtime = 'edge';

/**
 * 处理获取博客列表的 GET 请求
 * 支持分页、分类筛选、标签筛选及状态筛选（已发布、草稿、回收站）
 * @param request - Request 对象，包含查询参数
 * @returns Promise<NextResponse> - 返回博客列表及分页元数据
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const status = searchParams.get('status'); // 'published', 'draft', 'deleted'
  
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const requestSupabase = token ? createClientWithToken(token) : supabase;

  let query = requestSupabase
    .from('blogs')
    .select('id, title, excerpt, cover_image, category, tags, created_at, draft', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (tag) query = query.contains('tags', [tag]);

  // Handle status filtering
  if (status === 'deleted') {
    // If the database doesn't have is_deleted column yet, we return empty for deleted status
    // to avoid 500 errors. Once the user runs the SQL, we can revert this.
    try {
      const { data, error, count } = await requestSupabase
        .from('blogs')
        .select('id, title, excerpt, cover_image, category, tags, created_at, draft, is_deleted, deleted_at', { count: 'exact' })
        .eq('is_deleted', true)
        .range((page - 1) * limit, page * limit - 1);
      
      if (error && error.message.includes('is_deleted')) {
        return NextResponse.json({ data: [], meta: { total: 0, page, limit, totalPages: 0 } });
      }
      
      if (error) throw error;
      
      return NextResponse.json({
        data,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (e) {
      return NextResponse.json({ data: [], meta: { total: 0, page, limit, totalPages: 0 } });
    }
  } else {
    // For all other statuses, we should filter out deleted articles
    // We use a try-catch or check to avoid errors if the column doesn't exist yet
    query = query.or('is_deleted.is.null,is_deleted.eq.false');
    
    if (status === 'draft') {
      query = query.eq('draft', true);
    } else if (status === 'published') {
      query = query.eq('draft', false);
    } else {
      // Default: show all non-deleted if admin, or only published if public
      if (!token) {
        query = query.eq('draft', false);
      }
    }
  }

  query = query.range((page - 1) * limit, page * limit - 1);
  
  let { data, error, count } = await query;

  // If we get an error about is_deleted, it might be because the column doesn't exist yet
  if (error && error.message.includes('is_deleted')) {
    // Retry without the is_deleted filter
    let retryQuery = requestSupabase
      .from('blogs')
      .select('id, title, excerpt, cover_image, category, tags, created_at, draft', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (category) retryQuery = retryQuery.eq('category', category);
    if (tag) retryQuery = retryQuery.contains('tags', [tag]);

    if (status === 'draft') {
      retryQuery = retryQuery.eq('draft', true);
    } else if (status === 'published') {
      retryQuery = retryQuery.eq('draft', false);
    } else if (!token) {
      retryQuery = retryQuery.eq('draft', false);
    }

    retryQuery = retryQuery.range((page - 1) * limit, page * limit - 1);
    const retryResult = await retryQuery;
    data = retryResult.data;
    error = retryResult.error;
    count = retryResult.count;
  }

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
 * 处理创建博客的 POST 请求
 * 需要管理员权限，包含基本字段校验和分类校验
 * @param request - Request 对象，包含博客内容 Body
 * @returns Promise<NextResponse> - 返回创建成功的博客数据或错误信息
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // Verify token
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Category validation
    const ALLOWED_CATEGORIES = ['生活边角料', '情绪随笔', '干货分享', '成长复盘'];
    if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` 
      }, { status: 400 });
    }

    // Filter allowed fields to avoid errors with missing columns like 'slug'
    const allowedFields = [
      'title', 'content', 'excerpt', 'cover_image', 
      'category', 'tags', 'draft', 'images'
    ];
    
    const insertData: any = {};
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 });
  }
}

/**
 * 处理批量更新博客的 PATCH 请求
 * 用于批量修改状态（如发布、设为草稿等）
 * @param request - Request 对象，包含 ids 和 updates
 * @returns Promise<NextResponse> - 返回操作成功状态或错误信息
 */
export async function PATCH(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // Verify token
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids, updates } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs are required' }, { status: 400 });
    }

    const { error } = await requestSupabase
      .from('blogs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      if (error.message.includes('is_deleted')) {
        return NextResponse.json({ 
          error: '数据库缺少 is_deleted 列，操作失败。请先运行 supabase_schema.sql 中的更新语句。' 
        }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 });
  }
}

/**
 * 处理批量删除博客的 DELETE 请求
 * 支持移入回收站（软删除）和永久删除
 * @param request - Request 对象，URL 包含 permanent 参数，Body 包含 ids
 * @returns Promise<NextResponse> - 返回操作成功状态或错误信息
 */
export async function DELETE(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestSupabase = createClientWithToken(token);
  
  // Verify token
  const { data: { user }, error: authError } = await requestSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs are required' }, { status: 400 });
    }

    let query = requestSupabase.from('blogs');
    
    if (permanent) {
      const { error } = await query.delete().in('id', ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // Check if is_deleted column exists by trying a simple update
      const { error: updateError } = await query
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .in('id', ids);
      
      if (updateError) {
        if (updateError.message.includes('is_deleted')) {
          // Fallback: If column doesn't exist, we might have to do a permanent delete 
          // or return an error explaining the missing column.
          // For safety, let's return a specific error message.
          return NextResponse.json({ 
            error: '数据库缺少 is_deleted 列，无法移入回收站。请先运行 supabase_schema.sql 中的更新语句。' 
          }, { status: 400 });
        }
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 });
  }
}
