'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  created_at: string;
  draft: boolean;
  is_deleted: boolean;
}

/**
 * 草稿箱列表管理自定义 Hook
 * @returns 包含草稿列表、筛选、批量操作、分页等状态和操作
 */
export function useDraftsList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'info',
    onConfirm: () => {},
  });
  
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const fetchBlogs = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/blog?limit=100&status=draft`;
      if (filterCategory) url += `&category=${encodeURIComponent(filterCategory)}`;
      if (filterTag) url += `&tag=${encodeURIComponent(filterTag)}`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      const json = await res.json();
      if (res.ok) {
        let filteredData = json.data || [];
        if (filterTitle) {
          filteredData = filteredData.filter((b: Blog) => b.title.toLowerCase().includes(filterTitle.toLowerCase()));
        }
        if (filterDateRange.start) {
          filteredData = filteredData.filter((b: Blog) => new Date(b.created_at) >= new Date(filterDateRange.start));
        }
        if (filterDateRange.end) {
          const endDate = new Date(filterDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          filteredData = filteredData.filter((b: Blog) => new Date(b.created_at) <= endDate);
        }
        setBlogs(filteredData);
        if (!isInitial && filteredData.length === 0) {
          showToast('未找到匹配内容', 'info');
        }
      } else {
        showToast(json.error || '获取草稿失败', 'error');
      }
    } catch (_error) {
      console.error('Error fetching blogs:', _error);
      showToast('网络请求失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterTag, filterTitle, filterDateRange, showToast]);

  const fetchFilters = useCallback(async () => {
    const [catRes, tagRes] = await Promise.all([
      supabase.from('categories').select('name'),
      supabase.from('tags').select('name')
    ]);
    setCategories(catRes.data?.map(c => c.name) || []);
    setTags(tagRes.data?.map(t => t.name) || []);
  }, []);

  useEffect(() => {
    fetchFilters();
    fetchBlogs(true);
  }, [fetchFilters, fetchBlogs]);

  const handleFilter = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setCurrentPage(1);
    debounceTimer.current = setTimeout(() => fetchBlogs(), 300);
  }, [fetchBlogs]);

  const handleReset = useCallback(() => {
    setFilterTitle('');
    setFilterCategory('');
    setFilterTag('');
    setFilterDateRange({ start: '', end: '' });
    setCurrentPage(1);
    setTimeout(() => fetchBlogs(true), 100);
  }, [fetchBlogs]);

  const handlePublish = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认发布',
      description: '确定要发布这篇草稿吗？发布后文章将对读者可见。',
      confirmText: '立即发布',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`/api/blog/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ draft: false }),
          });
          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showToast('文章发布成功', 'success');
          } else {
            showToast('发布失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '移入回收站',
      description: '确定要将这篇草稿移入回收站吗？您稍后可以在回收站中找回它。',
      confirmText: '移入回收站',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`/api/blog/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            showToast('已移入回收站', 'success');
          } else {
            showToast('移动失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBatchPublish = async () => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: '批量发布',
      description: `确定要发布选中的 ${selectedIds.length} 篇草稿吗？`,
      confirmText: '全部发布',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const results = await Promise.all(
            selectedIds.map(id => 
              fetch(`/api/blog/${id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ draft: false }),
              })
            )
          );
          const successCount = results.filter(r => r.ok).length;
          if (successCount > 0) {
            const successIds = selectedIds.filter((_, i) => results[i]?.ok);
            setBlogs(prev => prev.filter(b => !successIds.includes(b.id)));
            setSelectedIds(prev => prev.filter(id => !successIds.includes(id)));
            showToast(`成功发布 ${successCount} 篇文章`, 'success');
          } else {
            showToast('发布失败', 'error');
          }
        } catch (_error) {
          showToast('批量操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: '批量删除',
      description: `确定要将选中的 ${selectedIds.length} 篇草稿移入回收站吗？`,
      confirmText: '全部删除',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const results = await Promise.all(
            selectedIds.map(id => 
              fetch(`/api/blog/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              })
            )
          );
          const successCount = results.filter(r => r.ok).length;
          if (successCount > 0) {
            const successIds = selectedIds.filter((_, i) => results[i]?.ok);
            setBlogs(prev => prev.filter(b => !successIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`成功将 ${successCount} 篇文章移入回收站`, 'success');
          } else {
            showToast('删除失败', 'error');
          }
        } catch (_error) {
          showToast('批量删除出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return blogs.slice(start, start + pageSize);
  }, [blogs, currentPage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedBlogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBlogs.map(b => b.id));
    }
  };

  const totalPages = Math.ceil(blogs.length / pageSize) || 1;

  return {
    blogs,
    loading,
    categories,
    tags,
    toast,
    setToast,
    selectedIds,
    confirmConfig,
    setConfirmConfig,
    filterTitle,
    setFilterTitle,
    filterCategory,
    setFilterCategory,
    filterTag,
    setFilterTag,
    filterDateRange,
    setFilterDateRange,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedBlogs,
    handleFilter,
    handleReset,
    handlePublish,
    handleDelete,
    handleBatchPublish,
    handleBatchDelete,
    toggleSelect,
    toggleSelectAll
  };
}
