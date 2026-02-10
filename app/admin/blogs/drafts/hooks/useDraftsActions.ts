import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Blog } from '../../hooks/useBlogManagement';

interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

/**
 * 执行发布操作
 */
async function executePublish(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false };

  return fetch(`/api/blog/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ draft: false }),
  });
}

/**
 * 执行删除操作
 */
async function executeDelete(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false };

  return fetch(`/api/blog/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

/**
 * 草稿箱操作 Hook
 * 处理发布、删除及批量操作逻辑
 */
export function useDraftsActions(
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false, title: '', description: '', confirmText: '', variant: 'info', onConfirm: () => {},
  });

  const closeConfirm = useCallback(() => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handlePublish = async (id: string) => {
    setConfirmConfig({
      isOpen: true, title: '确认发布', description: '确定要发布这篇草稿吗？', confirmText: '立即发布', variant: 'info',
      onConfirm: async () => {
        try {
          const res = await executePublish(id);
          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showToast('文章发布成功', 'success');
          } else showToast('发布失败', 'error');
        } catch { showToast('操作出错', 'error'); } finally { closeConfirm(); }
      }
    });
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true, title: '移入回收站', description: '确定要将这篇草稿移入回收站吗？', confirmText: '移入回收站', variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await executeDelete(id);
          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            showToast('已移入回收站', 'success');
          } else showToast('移动失败', 'error');
        } catch { showToast('操作出错', 'error'); } finally { closeConfirm(); }
      }
    });
  };

  const handleBatchPublish = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true, title: '批量发布', description: `确定要发布选中的 ${selectedIds.length} 篇草稿吗？`, confirmText: '全部发布', variant: 'info',
      onConfirm: async () => {
        try {
          const results = await Promise.all(selectedIds.map(id => executePublish(id)));
          const successIds = selectedIds.filter((_, i) => results[i]?.ok);
          if (successIds.length > 0) {
            setBlogs(prev => prev.filter(b => !successIds.includes(b.id)));
            setSelectedIds(prev => prev.filter(id => !successIds.includes(id)));
            showToast(`成功发布 ${successIds.length} 篇文章`, 'success');
          } else showToast('发布失败', 'error');
        } catch { showToast('批量操作出错', 'error'); } finally { closeConfirm(); }
      }
    });
  };

  const handleBatchDelete = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true, title: '批量删除', description: `确定要将选中的 ${selectedIds.length} 篇草稿移入回收站吗？`, confirmText: '全部删除', variant: 'danger',
      onConfirm: async () => {
        try {
          const results = await Promise.all(selectedIds.map(id => executeDelete(id)));
          const successIds = selectedIds.filter((_, i) => results[i]?.ok);
          if (successIds.length > 0) {
            setBlogs(prev => prev.filter(b => !successIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`成功将 ${successIds.length} 篇文章移入回收站`, 'success');
          } else showToast('删除失败', 'error');
        } catch { showToast('批量删除出错', 'error'); } finally { closeConfirm(); }
      }
    });
  };

  return { confirmConfig, setConfirmConfig, handlePublish, handleDelete, handleBatchPublish, handleBatchDelete, closeConfirm };
}
