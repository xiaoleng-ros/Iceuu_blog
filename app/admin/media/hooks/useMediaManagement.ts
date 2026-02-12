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
 * 带有身份验证的 fetch 辅助函数
 * @param url - 请求地址
 * @param options - 请求配置
 * @returns 返回响应 JSON 数据，如果失败则抛出错误
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('未登录');

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.access_token}`,
  };

  const res = await fetch(url, { ...options, headers });
  const json = await res.json();

  if (!res.ok) throw new Error(json.error || '请求失败');
  return json;
}

/**
 * 媒体上传操作 Hook
 * @param showToast - 显示提示函数
 * @param fetchMedia - 刷新媒体列表函数
 * @returns 上传相关状态和方法
 */
function useMediaUpload(
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void,
  fetchMedia: () => void
) {
  const [uploading, setUploading] = useState(false);

  /**
   * 处理上传
   */
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'site');

      await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData,
      });

      showToast('图片上传成功', 'success');
      fetchMedia();
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      showToast('上传失败: ' + message, 'error');
    } finally {
      setUploading(false);
    }
  }, [showToast, fetchMedia]);

  return { uploading, handleUpload };
}

/**
 * 媒体删除操作 Hook
 * @param setMedia - 更新媒体列表函数
 * @param showToast - 显示提示函数
 * @returns 删除相关状态和方法
 */
function useMediaDelete(
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>,
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * 处理删除
   */
  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetchWithAuth(`/api/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });

      setMedia(prev => prev.filter(item => item.id !== id));
      showToast('文件已从数据库和 GitHub 同步删除', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      showToast('删除失败: ' + message, 'error');
    } finally {
      setDeletingId(null);
    }
  }, [setMedia, showToast]);

  return { deletingId, setDeletingId, handleDelete };
}

/**
 * 媒体库管理逻辑 Hook
 * @returns 媒体库相关的状态和处理函数
 */
export function useMediaManagement() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  /**
   * 获取媒体资源列表
   */
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL('/api/media', window.location.origin);
      url.searchParams.append('limit', '100');
      if (selectedType !== 'all') url.searchParams.append('type', selectedType);

      const json = await fetchWithAuth(url.toString());
      if (json) setMedia(json.data || []);
    } catch {
      showToast('获取媒体库失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedType]);

  const { uploading, handleUpload } = useMediaUpload(showToast, fetchMedia);
  const { deletingId, setDeletingId, handleDelete } = useMediaDelete(setMedia, showToast);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, selectedType]);

  /**
   * 复制链接
   */
  const copyToClipboard = useCallback((url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('链接已复制到剪贴板', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  }, [showToast]);

  const filteredMedia = media.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    media: filteredMedia,
    loading, uploading, copiedId, viewMode, setViewMode,
    selectedType, setSelectedType, searchQuery, setSearchQuery,
    deletingId, setDeletingId, previewItem, setPreviewItem,
    toast, setToast, handleUpload, handleDelete, copyToClipboard, fetchMedia
  };
}
