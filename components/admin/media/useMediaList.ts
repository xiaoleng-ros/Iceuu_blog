'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  path: string;
  created_at: string;
  size?: number;
  type?: string;
}

/**
 * 媒体库变更操作 Hook
 * 处理媒体文件的上传和删除
 * @param fetchMedia - 刷新列表的回调函数
 * @param setMedia - 更新媒体列表状态的函数
 * @param showToast - 显示提示信息的函数
 * @returns 上传状态及操作函数
 */
function useMediaMutations(
  fetchMedia: () => Promise<void>,
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'site');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (res.ok) {
        showToast('图片上传成功', 'success');
        fetchMedia();
      } else {
        showToast('上传失败: ' + json.error, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('上传出错', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, onSuccess: () => void) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/media`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ids: [id] })
      });

      if (res.ok) {
        setMedia(prev => prev.filter(item => item.id !== id));
        showToast('文件已从数据库和 GitHub 同步删除', 'success');
        onSuccess();
      } else {
        const json = await res.json();
        showToast('删除失败: ' + (json.error || '未知错误'), 'error');
        onSuccess();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('删除出错', 'error');
      onSuccess();
    }
  };

  return { uploading, handleUpload, handleDelete };
}

/**
 * 媒体库核心操作 Hook
 * 处理媒体资源的获取、上传和删除
 * @param selectedType - 当前选中的媒体类型
 * @param showToast - 显示提示信息的函数
 * @returns 媒体数据、加载状态及操作函数
 */
function useMediaOperations(
  selectedType: string, 
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const url = new URL('/api/media', window.location.origin);
      url.searchParams.append('limit', '100');
      if (selectedType !== 'all') {
        url.searchParams.append('type', selectedType);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const json = await res.json();
      if (res.ok) {
        setMedia(json.data || []);
      }
    } catch (error) {
      console.error('Fetch media error:', error);
      showToast('获取媒体库失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedType]);

  const { uploading, handleUpload, handleDelete } = useMediaMutations(
    fetchMedia,
    setMedia,
    showToast
  );

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, selectedType]);

  return {
    media,
    loading,
    uploading,
    handleUpload,
    handleDelete,
    fetchMedia
  };
}


/**
 * 媒体库逻辑处理 Hook
 * 封装了媒体文件的获取、上传、删除、搜索和筛选逻辑
 * @returns {Object} 包含状态和操作函数的对象
 */
export function useMediaList() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const {
    media,
    loading,
    uploading,
    handleUpload,
    handleDelete,
  } = useMediaOperations(selectedType, showToast);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('链接已复制到剪贴板', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    media,
    loading,
    uploading,
    copiedId,
    viewMode,
    setViewMode,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    deletingId,
    setDeletingId,
    previewItem,
    setPreviewItem,
    toast,
    setToast,
    handleUpload,
    handleDelete: (id: string) => handleDelete(id, () => setDeletingId(null)),
    copyToClipboard,
    filteredMedia,
  };
}

