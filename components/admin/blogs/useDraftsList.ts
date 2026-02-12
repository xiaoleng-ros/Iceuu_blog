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
 * 管理草稿筛选条件获取的 Hook
 */
function useDraftsFiltersFetch() {
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
 * 管理草稿获取逻辑的 Hook
 */
function useDraftsFetch({
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
 * 发布草稿操作
 */
async function publishBlog(
  id: string,
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 删除草稿操作
 */
async function deleteBlog(
  id: string,
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 批量发布操作
 */
async function batchPublishBlogs(
  selectedIds: string[],
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 批量删除操作
 */
async function batchDeleteBlogs(
  selectedIds: string[],
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
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
  }
}

/**
 * 管理草稿操作逻辑的 Hook
 */
function useDraftsActions(
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
) {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'info',
    onConfirm: () => {},
  });

  const openPublishConfirm = (id: string) => {
    setConfirmConfig(createConfirmConfig({
      title: '确认发布',
      description: '确定要发布这篇草稿吗？发布后文章将对读者可见。',
      confirmText: '立即发布',
      variant: 'info',
      onConfirm: async () => {
        await publishBlog(id, setBlogs, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  const openDeleteConfirm = (id: string) => {
    setConfirmConfig(createConfirmConfig({
      title: '移入回收站',
      description: '确定要将这篇草稿移入回收站吗？您稍后可以在回收站中找回它。',
      confirmText: '移入回收站',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBlog(id, setBlogs, setSelectedIds, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  const openBatchPublishConfirm = (ids: string[]) => {
    if (ids.length === 0) return;
    setConfirmConfig(createConfirmConfig({
      title: '批量发布',
      description: `确定要发布选中的 ${ids.length} 篇草稿吗？`,
      confirmText: '全部发布',
      variant: 'info',
      onConfirm: async () => {
        await batchPublishBlogs(ids, setBlogs, setSelectedIds, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  const openBatchDeleteConfirm = (ids: string[]) => {
    if (ids.length === 0) return;
    setConfirmConfig(createConfirmConfig({
      title: '批量删除',
      description: `确定要将选中的 ${ids.length} 篇草稿移入回收站吗？`,
      confirmText: '全部删除',
      variant: 'danger',
      onConfirm: async () => {
        await batchDeleteBlogs(ids, setBlogs, setSelectedIds, showToast);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    }));
  };

  return {
    confirmConfig,
    setConfirmConfig,
    handlePublish: openPublishConfirm,
    handleDelete: openDeleteConfirm,
    handleBatchPublish: openBatchPublishConfirm,
    handleBatchDelete: openBatchDeleteConfirm
  };
}

/**
 * 管理筛选状态和逻辑的 Hook
 */
function useDraftsFilters() {
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
function useDraftsPagination(blogs: Blog[], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return blogs.slice(start, start + pageSize);
  }, [blogs, currentPage, pageSize]);

  const totalPages = Math.ceil(blogs.length / pageSize) || 1;

  return { currentPage, setCurrentPage, paginatedBlogs, totalPages };
}

/**
 * 草稿箱列表管理自定义 Hook
 */
export function useDraftsList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageSize = 10;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const { categories, tags, fetchFilters } = useDraftsFiltersFetch();
  
  const { filterTitle, setFilterTitle, filterCategory, setFilterCategory, filterTag, setFilterTag, filterDateRange, setFilterDateRange, handleFilter, handleReset } = useDraftsFilters();
  
  const { fetchBlogs } = useDraftsFetch({
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
    handlePublish,
    handleDelete,
    handleBatchPublish,
    handleBatchDelete
  } = useDraftsActions(setBlogs, setSelectedIds, showToast);

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

  const { currentPage, setCurrentPage, paginatedBlogs, totalPages } = useDraftsPagination(blogs, pageSize);

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
    handlePublish,
    handleDelete,
    handleBatchPublish,
    handleBatchDelete,
    toggleSelect,
    toggleSelectAll
  };
}
