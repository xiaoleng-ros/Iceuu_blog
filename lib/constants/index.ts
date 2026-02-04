/**
 * 全局常量定义
 * 集中管理项目中的常量值，避免硬编码
 */

/**
 * 文章分类列表
 */
export const BLOG_CATEGORIES = [
  '生活边角料',
  '情绪随笔',
  '干货分享',
  '成长复盘',
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

/**
 * 文件上传限制
 */
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024,
  MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const;

/**
 * API 路径常量
 */
export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/auth/login',
  },
  BLOG: {
    BASE: '/api/blog',
    BY_ID: (id: string) => `/api/blog/${id}`,
  },
  UPLOAD: '/api/upload',
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',
  MEDIA: '/api/media',
  SETTINGS: '/api/settings',
  ICONS: '/api/icons',
} as const;

/**
 * 分页配置
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * 存储路径常量
 */
export const STORAGE_PATHS = {
  AVATAR: 'avatars',
  POSTS: 'posts',
  SITE: 'site',
  OTHERS: 'others',
} as const;

/**
 * 媒体类型常量
 */
export const MEDIA_TYPES = {
  AVATAR: 'avatar',
  POST: 'post',
  SITE: 'site',
  OTHER: 'other',
  BLOG: 'blog',
} as const;

/**
 * 文章状态常量
 */
export const BLOG_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  DELETED: 'deleted',
} as const;

/**
 * 默认站点配置
 */
export const DEFAULT_SITE_CONFIG = {
  SITE_NAME: '赵阿卷',
  SITE_DESCRIPTION: '基于 Next.js + Supabase 构建的个人博客系统',
  SITE_KEYWORDS: '博客,Next.js,React,Supabase,个人博客',
} as const;

/**
 * Toast 消息类型
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export type ToastType = typeof TOAST_TYPES[keyof typeof TOAST_TYPES];

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  BLOG_DRAFT: 'blog_new_draft',
  BLOG_EDIT: (id: string) => `blog_edit_${id}`,
  SITE_CONFIG: 'site-config-storage',
} as const;

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: '未授权，请先登录',
  MISSING_ENV_VAR: '缺少必需的环境变量',
  INVALID_CATEGORY: '无效的分类',
  FILE_TOO_LARGE: '文件大小超过限制',
  INVALID_FILE_TYPE: '不支持的文件类型',
  UPLOAD_FAILED: '文件上传失败',
  NETWORK_ERROR: '网络错误，请重试',
} as const;
