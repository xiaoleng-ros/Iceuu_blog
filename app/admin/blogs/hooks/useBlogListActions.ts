import { useState, useCallback } from 'react';
import { Blog, FilterConfig } from './useBlogManagement';
import { useBlogDelete } from './useBlogDelete';

/**
 * Toast 消息接口
 */
interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

/**
 * 检查筛选条件是否有值
 * @param filters - 筛选条件
 * @returns 是否有有效筛选条件
 */
function hasFilterValue(filters: FilterConfig): boolean {
  return filters.title.trim() !== '' || 
         filters.category !== '' || 
         filters.tag !== '' || 
         (filters.dateRange.start !== '' || filters.dateRange.end !== '');
}

/**
 * 博客列表操作 Hook
 * @param setBlogs - 更新博客列表的函数
 * @returns 操作相关的状态和方法
 */
export function useBlogListActions(setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /**
   * 显示 Toast 提示
   * @param message - 提示消息
   * @param type - 消息类型
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const {
    deleteConfirmOpen,
    handleDelete,
    confirmDelete,
    closeDeleteConfirm
  } = useBlogDelete(setBlogs, showToast);

  /**
   * 处理搜索操作
   * @param filters - 筛选条件
   * @param fetchBlogs - 获取博客列表函数
   */
  const handleSearch = useCallback((filters: FilterConfig, fetchBlogs: () => void) => {
    if (!hasFilterValue(filters)) {
      showToast('筛选条件不能为空', 'warning');
      return;
    }
    fetchBlogs();
  }, [showToast]);

  /**
   * 切换选中状态
   * @param id - 文章 ID
   */
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  /**
   * 全选/取消全选
   * @param allIds - 所有文章 ID
   */
  const toggleSelectAll = useCallback((allIds: string[]) => {
    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
  }, []);

  return {
    toast,
    setToast,
    deleteConfirmOpen,
    selectedIds,
    handleSearch,
    handleDelete,
    confirmDelete,
    closeDeleteConfirm,
    toggleSelect,
    toggleSelectAll,
  };
}
