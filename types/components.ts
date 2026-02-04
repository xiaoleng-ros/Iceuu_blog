/**
 * 组件 Props 类型定义
 * 定义 React 组件的 Props 接口
 */

import { Blog, Media, SiteConfig } from './database';

/**
 * 博客表单 Props
 */
export interface BlogFormProps {
  initialData?: Partial<Blog>;
  isEditing?: boolean;
}

/**
 * 编辑器 Props
 */
export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  articleId?: string;
}

/**
 * 文章列表 Props
 */
export interface PostListProps {
  posts: Blog[];
}

/**
 * 宽卡片文章 Props
 */
export interface WidePostCardProps {
  post: Blog;
  index: number;
}

/**
 * 导航项 Props
 */
export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  hasDropdown?: boolean;
}

/**
 * Header Props
 */
export interface HeaderProps {
  transparent?: boolean;
}

/**
 * Toast Props
 */
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

/**
 * 按钮 Props
 */
export interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * 输入框 Props
 */
export interface InputProps {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 卡片 Props
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 分页 Props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * 确认对话框 Props
 */
export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * 媒体列表 Props
 */
export interface MediaListProps {
  media: Media[];
  onDelete?: (id: string) => void;
}

/**
 * 站点设置表单 Props
 */
export interface SiteSettingsFormProps {
  config: Record<string, string>;
  onUpdate: (key: string, value: string) => void;
}

/**
 * 侧边栏 Props
 */
export interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * 标签 Props
 */
export interface TagProps {
  name: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}
