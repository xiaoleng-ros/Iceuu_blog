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

interface FilterDateRange {
  start: string;
  end: string;
}

interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

/**
 * 管理回收站筛选条件获取的 Hook
 */
function useTrashFiltersFetch() {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const fetchFilters = useCallback(async () => {
    const [catRes, tagRes] = await Promise.all([
      supabase.from('categories').select('name'),
      supabase.from('tags').select('name')
    ]);
    setCategories(catRes.data?.map(c => c.name) || []);
    setTags(tagRes.data?.map(t => t.name) || []);
  }, []);

  return { categories, tags, fetchFilters };
}

/**
 * 管理回收站文章获取逻辑的 Hook
 */
function useTrashFetch({
  filterCategory,
  filterTag,
  filterTitle,
  filterDateRange,
  showToast,
  setBlogs,
  setLoading
}: {
  filterCategory: string;
  filterTag: string;
  filterTitle: string;
  filterDateRange: FilterDateRange;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
  }, [filterCategory, filterTag, filterTitle, filterDateRange, showToast, setBlogs, setLoading]);

  return { fetchBlogs };
}

/**
 * 确认配置参数接口
 */
interface ConfirmConfigParams {
  title: string;
  description: string;
  confirmText: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

/**
 * 创建确认配置
 */
function createConfirmConfig({
  title,
  description,
  confirmText,
  variant,
  onConfirm
}: ConfirmConfigParams): ConfirmConfig {
  return {
    isOpen: true,
    title,
    description,
    confirmText,
    variant,
    onConfirm
  };
}

/**
 * 恢复文章操作
 */
async function restoreBlog(
  id: string,
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 永久删除文章操作
 */
async function permanentDeleteBlog(
  id: string,
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 批量恢复文章操作
 */
async function batchRestoreBlogs(
  selectedIds: string[],
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 批量永久删除文章操作
 */
async function batchPermanentDeleteBlogs(
  selectedIds: string[],
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 管理回收站操作逻辑的 Hook
 */
function useTrashActions(
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'danger',
    onConfirm: () => {},
  });

  const openRestoreConfirm = (id: string) => {
    setConfirmConfig(createConfirmConfig({
      title: '确认恢复文章',
      description: '确定要恢复这篇文章吗？恢复后文章将重新出现在已发布列表中。',
      confirmText: '确认恢复',
      variant: 'info',
      onConfirm: async () => {
        await restoreBlog(id, setBlogs, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  const openPermanentDeleteConfirm = (id: string) => {
    setConfirmConfig(createConfirmConfig({
      title: '确认彻底删除',
      description: '确定要彻底删除这篇文章吗？此操作不可撤销，文章数据将永久丢失！',
      confirmText: '彻底删除',
      variant: 'danger',
      onConfirm: async () => {
        await permanentDeleteBlog(id, setBlogs, setSelectedIds, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  const openBatchRestoreConfirm = (ids: string[]) => {
    if (ids.length === 0) return;
    setConfirmConfig(createConfirmConfig({
      title: '确认批量恢复',
      description: `确定要恢复选中的 ${ids.length} 篇文章吗？`,
      confirmText: '批量恢复',
      variant: 'info',
      onConfirm: async () => {
        await batchRestoreBlogs(ids, setBlogs, setSelectedIds, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  const openBatchPermanentDeleteConfirm = (ids: string[]) => {
    if (ids.length === 0) return;
    setConfirmConfig(createConfirmConfig({
      title: '确认批量彻底删除',
      description: `确定要彻底删除选中的 ${ids.length} 篇文章吗？此操作不可撤销！`,
      confirmText: '批量彻底删除',
      variant: 'danger',
      onConfirm: async () => {
        await batchPermanentDeleteBlogs(ids, setBlogs, setSelectedIds, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  return {
    confirmConfig,
    setConfirmConfig,
    handleRestore: openRestoreConfirm,
    handlePermanentDelete: openPermanentDeleteConfirm,
    handleBatchRestore: openBatchRestoreConfirm,
    handleBatchPermanentDelete: openBatchPermanentDeleteConfirm
  };
}

/**
 * 管理筛选状态和逻辑的 Hook
 */
function useTrashFilters() {
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<FilterDateRange>({ start: '', end: '' });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleFilter = useCallback((fetchBlogs: (isInitial?: boolean) => void) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchBlogs(), 300);
  }, []);

  const handleReset = useCallback((fetchBlogs: (isInitial?: boolean) => void) => {
    setFilterTitle('');
    setFilterCategory('');
    setFilterTag('');
    setFilterDateRange({ start: '', end: '' });
    setTimeout(() => fetchBlogs(true), 100);
  }, []);

  return {
    filterTitle, setFilterTitle,
    filterCategory, setFilterCategory,
    filterTag, setFilterTag,
    filterDateRange, setFilterDateRange,
    handleFilter, handleReset
  };
}

/**
 * 管理分页逻辑的 Hook
 */
function useTrashPagination(blogs: Blog[], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return blogs.slice(start, start + pageSize);
  }, [blogs, currentPage, pageSize]);

  const totalPages = Math.ceil(blogs.length / pageSize) || 1;

  return { currentPage, setCurrentPage, paginatedBlogs, totalPages };
}

/**
 * 回收站列表管理自定义 Hook
 */
export function useTrashList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageSize = 10;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const { categories, tags, fetchFilters } = useTrashFiltersFetch();
  
  const { filterTitle, setFilterTitle, filterCategory, setFilterCategory, filterTag, setFilterTag, filterDateRange, setFilterDateRange, handleFilter, handleReset } = useTrashFilters();
  
  const { fetchBlogs } = useTrashFetch({
    filterCategory,
    filterTag,
    filterTitle,
    filterDateRange,
    showToast,
    setBlogs,
    setLoading
  });

  const {
    confirmConfig,
    setConfirmConfig,
    handleRestore,
    handlePermanentDelete,
    handleBatchRestore,
    handleBatchPermanentDelete
  } = useTrashActions(setBlogs, setSelectedIds, showToast);

  useEffect(() => {
    fetchFilters();
    fetchBlogs(true);
  }, [fetchFilters, fetchBlogs]);

  const onHandleFilter = useCallback(() => {
    handleFilter(fetchBlogs);
  }, [handleFilter, fetchBlogs]);

  const onHandleReset = useCallback(() => {
    handleReset(fetchBlogs);
  }, [handleReset, fetchBlogs]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const { currentPage, setCurrentPage, paginatedBlogs, totalPages } = useTrashPagination(blogs, pageSize);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === paginatedBlogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBlogs.map(b => b.id));
    }
  }, [selectedIds, paginatedBlogs]);

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
    handleFilter: onHandleFilter,
    handleReset: onHandleReset,
    handleRestore,
    handlePermanentDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    toggleSelect,
    toggleSelectAll
  };
}
