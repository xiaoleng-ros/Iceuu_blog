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
  deleted_at: string;
  draft: boolean;
  is_deleted: boolean;
}

/**
 * 回收站列表管理自定义 Hook
 * @returns 包含回收站列表、筛选、批量操作、分页等状态和操作
 */
export function useTrashList() {
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
    variant: 'danger',
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

      let url = `/api/blog?limit=100&status=deleted`;
      if (filterCategory) url += `&category=${encodeURIComponent(filterCategory)}`;
      if (filterTag) url += `&tag=${encodeURIComponent(filterTag)}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      const json = await res.json();
      if (res.ok) {
        let filteredData = json.data || [];
        if (filterTitle) filteredData = filteredData.filter((b: Blog) => b.title.toLowerCase().includes(filterTitle.toLowerCase()));
        if (filterDateRange.start) filteredData = filteredData.filter((b: Blog) => new Date(b.deleted_at) >= new Date(filterDateRange.start));
        if (filterDateRange.end) {
          const endDate = new Date(filterDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          filteredData = filteredData.filter((b: Blog) => new Date(b.deleted_at) <= endDate);
        }
        setBlogs(filteredData);
        if (!isInitial && filteredData.length === 0) {
          showToast('未找到匹配内容', 'info');
        }
      } else {
        showToast(json.error || '获取回收站失败', 'error');
      }
    } catch (_error) {
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

  const handleRestore = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认恢复文章',
      description: '确定要恢复这篇文章吗？恢复后文章将重新出现在已发布列表中。',
      confirmText: '确认恢复',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`/api/blog/${id}?restore=true`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showToast('文章已恢复', 'success');
          } else {
            showToast('恢复失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handlePermanentDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认彻底删除',
      description: '确定要彻底删除这篇文章吗？此操作不可撤销，文章数据将永久丢失！',
      confirmText: '彻底删除',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`/api/blog/${id}?permanent=true`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            showToast('文章已彻底删除', 'success');
          } else {
            showToast('删除失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBatchRestore = () => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: '确认批量恢复',
      description: `确定要恢复选中的 ${selectedIds.length} 篇文章吗？`,
      confirmText: '批量恢复',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`/api/blog`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}` 
            },
            body: JSON.stringify({
              ids: selectedIds,
              updates: { is_deleted: false, deleted_at: null }
            })
          });
          if (res.ok) {
            setBlogs(prev => prev.filter(b => !selectedIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`已成功恢复 ${selectedIds.length} 篇文章`, 'success');
          } else {
            showToast('批量恢复失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleBatchPermanentDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: '确认批量彻底删除',
      description: `确定要彻底删除选中的 ${selectedIds.length} 篇文章吗？此操作不可撤销！`,
      confirmText: '批量彻底删除',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          const res = await fetch(`/api/blog?permanent=true`, {
            method: 'DELETE',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}` 
            },
            body: JSON.stringify({ ids: selectedIds })
          });
          if (res.ok) {
            setBlogs(prev => prev.filter(b => !selectedIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`已成功彻底删除 ${selectedIds.length} 篇文章`, 'success');
          } else {
            showToast('批量删除失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
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
    handleRestore,
    handlePermanentDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    toggleSelect,
    toggleSelectAll
  };
}
