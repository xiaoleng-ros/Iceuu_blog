/**
 * 用户角色
 */
export type UserRole = 'admin' | 'user' | 'editor';

/**
 * 用户信息（public.users 表）
 */
export interface User {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Supabase Auth 用户信息
 */
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 博客文章
 */
export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: string;
  tags?: string[];
  draft: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at?: string;
  images?: string[];
}

/**
 * 媒体文件
 */
export interface Media {
  id: string;
  filename: string;
  url: string;
  path: string;
  size: number;
  type: 'avatar' | 'post' | 'site' | 'other' | 'blog';
  created_at: string;
}

/**
 * 站点配置
 */
export interface SiteConfig {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

/**
 * 分类
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

/**
 * 标签
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/**
 * 数据库表类型
 */
export type DatabaseTable = 'blogs' | 'media' | 'site_config' | 'categories' | 'tags' | 'users';

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 查询过滤器
 */
export interface QueryFilters {
  category?: string;
  tag?: string;
  status?: 'published' | 'draft' | 'deleted';
}
