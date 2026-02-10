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
 * 媒体库管理逻辑 Hook
 * @returns 媒体库相关的状态和处理函数
 */
export function useMediaManagement() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    } catch (_error) {
      showToast('获取媒体库失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedType]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, selectedType]);

  /**
   * 处理上传
   */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'site');

      const json = await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (json) {
        showToast('图片上传成功', 'success');
        fetchMedia();
      }
    } catch (err: any) {
      showToast('上传失败: ' + (err.message || '未知错误'), 'error');
    } finally {
      setUploading(false);
    }
  };

  /**
   * 处理删除
   */
  const handleDelete = async (id: string) => {
    try {
      const json = await fetchWithAuth(`/api/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });

      if (json) {
        setMedia(prev => prev.filter(item => item.id !== id));
        showToast('文件已从数据库和 GitHub 同步删除', 'success');
      }
    } catch (err: any) {
      showToast('删除失败: ' + (err.message || '未知错误'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * 复制链接
   */
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
    media: filteredMedia,
    loading, uploading, copiedId, viewMode, setViewMode,
    selectedType, setSelectedType, searchQuery, setSearchQuery,
    deletingId, setDeletingId, previewItem, setPreviewItem,
    toast, setToast, handleUpload, handleDelete, copyToClipboard, fetchMedia
  };
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

