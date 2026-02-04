/**
 * API 接口类型定义
 * 定义 API 请求和响应的数据结构
 */

import { Blog, Media, SiteConfig, User } from './database';

/**
 * 登录请求
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: User;
  };
}

/**
 * 创建博客请求
 */
export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: string;
  tags?: string[];
  draft?: boolean;
  images?: string[];
}

/**
 * 更新博客请求
 */
export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
  ids: string[];
  updates: Partial<Blog>;
}

/**
 * 删除博客请求
 */
export interface DeleteBlogRequest {
  ids: string[];
  permanent?: boolean;
}

/**
 * 文件上传请求
 */
export interface UploadRequest {
  file: File;
  type: 'avatar' | 'post' | 'site' | 'other';
  contextId?: string;
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  url: string;
  id: string;
}

/**
 * 分页查询参数
 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  category?: string;
  tag?: string;
  status?: 'published' | 'draft' | 'deleted';
}

/**
 * 分页元数据
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T = Blog> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * API 成功响应
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API 错误响应
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

/**
 * 更新站点配置请求
 */
export interface UpdateSiteConfigRequest {
  key: string;
  value: string;
}

/**
 * 批量更新请求
 */
export interface BatchUpdateRequest {
  ids: string[];
  updates: Record<string, unknown>;
}
