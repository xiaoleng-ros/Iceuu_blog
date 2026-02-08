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
    /** 博客 API 基础路径 */
    BASE: '/api/blog',
    /** 
     * 获取指定 ID 的博客 API 路径 
     * @param {string} id - 博客 ID
     * @returns {string} - API 路径字符串
     */
    BY_ID: (id: string) => `/api/blog/${id}`,
  },
  /** 文件上传 API 路径 */
  UPLOAD: '/api/upload',
  /** 分类管理 API 路径 */
  CATEGORIES: '/api/categories',
  /** 标签管理 API 路径 */
  TAGS: '/api/tags',
  /** 媒体资源 API 路径 */
  MEDIA: '/api/media',
  /** 站点设置 API 路径 */
  SETTINGS: '/api/settings',
  /** 图标管理 API 路径 */
  ICONS: '/api/icons',
} as const;

/**
 * 分页配置
 */
export const PAGINATION = {
  /** 默认起始页码 */
  DEFAULT_PAGE: 1,
  /** 默认每页记录数 */
  DEFAULT_LIMIT: 10,
  /** 最大每页记录数限制 */
  MAX_LIMIT: 100,
} as const;

/**
 * 存储路径常量
 * 用于 Supabase Storage Bucket 中的文件夹命名
 */
export const STORAGE_PATHS = {
  /** 用户头像文件夹 */
  AVATAR: 'avatars',
  /** 文章资源文件夹 */
  POSTS: 'posts',
  /** 站点资源文件夹 */
  SITE: 'site',
  /** 其他资源文件夹 */
  OTHERS: 'others',
} as const;

/**
 * 媒体类型常量
 */
export const MEDIA_TYPES = {
  /** 头像类型 */
  AVATAR: 'avatar',
  /** 文章类型 */
  POST: 'post',
  /** 站点类型 */
  SITE: 'site',
  /** 其他类型 */
  OTHER: 'other',
  /** 博客类型 */
  BLOG: 'blog',
} as const;

/**
 * 文章状态常量
 */
export const BLOG_STATUS = {
  /** 已发布 */
  PUBLISHED: 'published',
  /** 草稿 */
  DRAFT: 'draft',
  /** 已删除 */
  DELETED: 'deleted',
} as const;

/**
 * 默认站点配置
 */
export const DEFAULT_SITE_CONFIG = {
  /** 默认站点名称 */
  SITE_NAME: '赵阿卷',
  /** 默认站点描述 */
  SITE_DESCRIPTION: '基于 Next.js + Supabase 构建的个人博客 system',
  /** 默认站点关键词 */
  SITE_KEYWORDS: '博客,Next.js,React,Supabase,个人博客',
} as const;

/**
 * Toast 消息类型
 */
export const TOAST_TYPES = {
  /** 成功提示 */
  SUCCESS: 'success',
  /** 错误提示 */
  ERROR: 'error',
  /** 信息提示 */
  INFO: 'info',
  /** 警告提示 */
  WARNING: 'warning',
} as const;

export type ToastType = typeof TOAST_TYPES[keyof typeof TOAST_TYPES];

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  /** 新建文章草稿缓存键 */
  BLOG_DRAFT: 'blog_new_draft',
  /** 
   * 编辑文章时的缓存键 
   * @param {string} id - 文章 ID
   * @returns {string} - 缓存键字符串
   */
  BLOG_EDIT: (id: string) => `blog_edit_${id}`,
  /** 站点配置持久化键 */
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
