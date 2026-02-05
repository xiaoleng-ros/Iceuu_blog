/**
 * 博客服务层
 * 提供博客相关的业务逻辑
 */

import { supabase } from '@/lib/supabase';
import { Blog, PaginationParams, QueryFilters } from '@/types/database';
import { BLOG_CATEGORIES, PAGINATION, BLOG_STATUS } from '@/lib/constants';

/**
 * 获取博客列表
 * 根据分页、分类、标签和状态筛选文章
 * @param {PaginationParams & QueryFilters} [params={}] - 分页和过滤参数
 * @returns {Promise<{ data: any[], total: number, page: number, limit: number, totalPages: number }>} - 返回博客列表及分页信息
 */
export async function getBlogs(params: PaginationParams & QueryFilters = {}) {
  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, category, tag, status } = params;

  let query = supabase
    .from('blogs')
    .select('id, title, excerpt, cover_image, category, tags, created_at, draft, is_deleted, deleted_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  if (status === BLOG_STATUS.DELETED) {
    query = query.eq('is_deleted', true);
  } else {
    query = query.or('is_deleted.is.null,is_deleted.eq.false');
    
    if (status === BLOG_STATUS.DRAFT) {
      query = query.eq('draft', true);
    } else if (status === BLOG_STATUS.PUBLISHED) {
      query = query.eq('draft', false);
    }
  }

  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`获取博客列表失败: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * 根据 ID 获取博客
 * @param {string} id - 博客 ID
 * @returns {Promise<any>} - 返回博客详情
 */
export async function getBlogById(id: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`获取博客失败: ${error.message}`);
  }

  return data;
}

/**
 * 创建博客
 * 验证数据有效性并插入新文章
 * @param {Partial<Blog>} blog - 博客数据
 * @returns {Promise<any>} - 返回创建成功的博客数据
 */
export async function createBlog(blog: Partial<Blog>) {
  const { title, content, category } = blog;

  if (!title || !content) {
    throw new Error('标题和内容不能为空');
  }

  if (category && !BLOG_CATEGORIES.includes(category as any)) {
    throw new Error(`无效的分类，必须是: ${BLOG_CATEGORIES.join(', ')}`);
  }

  const allowedFields = ['title', 'content', 'excerpt', 'cover_image', 'category', 'tags', 'draft', 'images'] as const;
  const insertData: Partial<Blog> = {};
  
  allowedFields.forEach(field => {
    const value = blog[field as keyof Blog];
    if (value !== undefined) {
      (insertData as any)[field] = value;
    }
  });

  const { data, error } = await supabase
    .from('blogs')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`创建博客失败: ${error.message}`);
  }

  return data;
}

/**
 * 更新博客
 * 支持批量更新多个博客的字段
 * @param {string[]} ids - 博客 ID 数组
 * @param {Partial<Blog>} updates - 更新的数据内容
 * @returns {Promise<any[]>} - 返回更新后的博客数据列表
 */
export async function updateBlogs(ids: string[], updates: Partial<Blog>) {
  const { data, error } = await supabase
    .from('blogs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .in('id', ids)
    .select();

  if (error) {
    if (error.message.includes('is_deleted')) {
      throw new Error('数据库缺少 is_deleted 列，请先运行数据库迁移脚本');
    }
    throw new Error(`更新博客失败: ${error.message}`);
  }

  return data;
}

/**
 * 删除博客
 * 支持软删除（进入回收站）或永久从数据库删除
 * @param {string[]} ids - 博客 ID 数组
 * @param {boolean} [permanent=false] - 是否永久删除
 * @returns {Promise<{ success: boolean }>} - 返回删除操作结果
 */
export async function deleteBlogs(ids: string[], permanent = false) {
  if (permanent) {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`永久删除博客失败: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from('blogs')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      if (error.message.includes('is_deleted')) {
        throw new Error('数据库缺少 is_deleted 列，无法移入回收站');
      }
      throw new Error(`删除博客失败: ${error.message}`);
    }
  }

  return { success: true };
}

/**
 * 获取博客统计
 * 统计总数、已发布、草稿以及已删除的数量
 * @returns {Promise<{ total: number, published: number, draft: number, deleted: number }>} - 返回各项统计结果
 */
export async function getBlogStats() {
  const { count: total } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true });

  const { count: published } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .eq('draft', false)
    .or('is_deleted.is.null,is_deleted.eq.false');

  const { count: draft } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .eq('draft', true);

  const { count: deleted } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', true);

  return {
    total: total || 0,
    published: published || 0,
    draft: draft || 0,
    deleted: deleted || 0,
  };
}
