import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Blog } from './useBlogManagement';

/**
 * 博客删除操作 Hook
 * @param setBlogs - 更新博客列表的函数
 * @param showToast - 显示提示的函数
 * @returns 删除相关的状态和方法
 */
export function useBlogDelete(
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState<string | null>(null);

  /**
   * 处理删除确认
   * @param id - 文章 ID
   */
  const handleDelete = useCallback((id: string) => {
    setBlogIdToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  /**
   * 确认删除操作
   */
  const confirmDelete = useCallback(async () => {
    if (!blogIdToDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/blog/${blogIdToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setBlogs(prev => prev.filter(b => b.id !== blogIdToDelete));
        showToast('文章已移入回收站', 'success');
      } else {
        showToast('移动失败', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('操作出错', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setBlogIdToDelete(null);
    }
  }, [blogIdToDelete, setBlogs, showToast]);

  /**
   * 关闭删除确认框
   */
  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setBlogIdToDelete(null);
  }, []);

  return {
    deleteConfirmOpen,
    blogIdToDelete,
    handleDelete,
    confirmDelete,
    closeDeleteConfirm,
  };
}
