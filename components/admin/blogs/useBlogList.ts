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
  views?: number;
  comments_count?: number;
}

interface SortConfig {
  key: keyof Blog;
  direction: 'asc' | 'desc' | null;
}

/**
 * 博客列表管理自定义 Hook
 * @returns 包含博客列表、筛选、排序、分页等状态和操作
 */
export function useBlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState<string | null>(null);
  
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([{ key: 'id', direction: 'desc' }]);
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

  const fetchFilters = useCallback(async () => {
    try {
      const { data: catData } = await supabase.from('categories').select('name');
      const { data: tagData } = await supabase.from('tags').select('name');
      setCategories(catData?.map(c => c.name) || []);
      setTags(tagData?.map(t => t.name) || []);
    } catch (_error) {
      console.error('Error fetching filters:', _error);
      showToast('获取筛选条件失败', 'error');
    }
  }, [showToast]);

  const fetchBlogs = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/blog?limit=100&status=published`;
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
          filteredData = filteredData.filter((b: Blog) => 
            b.title.toLowerCase().includes(filterTitle.toLowerCase())
          );
        }
        if (filterDateRange.start) {
          filteredData = filteredData.filter((b: Blog) => 
            new Date(b.created_at) >= new Date(filterDateRange.start)
          );
        }
        if (filterDateRange.end) {
          const endDate = new Date(filterDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          filteredData = filteredData.filter((b: Blog) => 
            new Date(b.created_at) <= endDate
          );
        }
        setBlogs(filteredData);
        if (!isInitial && filteredData.length === 0) {
          showToast('未找到匹配内容', 'info');
        }
      } else {
        showToast(json.error || '获取文章列表失败', 'error');
      }
    } catch (_error) {
      console.error('Error fetching blogs:', _error);
      showToast('网络请求失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterTag, filterTitle, filterDateRange, showToast]);

  useEffect(() => {
    fetchFilters();
    fetchBlogs(true);
  }, [fetchFilters, fetchBlogs]);

  const handleFilter = useCallback(() => {
    const hasValue = filterTitle.trim() !== '' || 
                     filterCategory !== '' || 
                     filterTag !== '' || 
                     (filterDateRange.start !== '' || filterDateRange.end !== '');

    if (!hasValue) {
      showToast('筛选条件不能为空', 'warning');
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setCurrentPage(1);
    debounceTimer.current = setTimeout(() => {
      fetchBlogs();
    }, 300);
  }, [filterTitle, filterCategory, filterTag, filterDateRange, fetchBlogs, showToast]);

  const handleReset = useCallback(() => {
    setFilterTitle('');
    setFilterCategory('');
    setFilterTag('');
    setFilterDateRange({ start: '', end: '' });
    setCurrentPage(1);
    setLoading(true);
    setTimeout(() => {
      fetchBlogs(true);
    }, 100);
  }, [fetchBlogs]);

  const handleSort = (key: keyof Blog, multiSort = false) => {
    setSortConfigs(prev => {
      const existingConfig = prev.find(c => c.key === key);
      if (multiSort) {
        if (existingConfig) {
          const nextDir = existingConfig.direction === 'desc' ? 'asc' : 'desc';
          return prev.map(c => c.key === key ? { ...c, direction: nextDir } : c);
        } else {
          return [...prev, { key, direction: 'desc' }];
        }
      } else {
        if (existingConfig) {
          const nextDir = existingConfig.direction === 'desc' ? 'asc' : 'desc';
          return [{ key, direction: nextDir }];
        } else {
          return [{ key, direction: 'desc' }];
        }
      }
    });
  };

  const sortedBlogs = useMemo(() => {
    if (sortConfigs.length === 0) return blogs;
    return [...blogs].sort((a, b) => {
      for (const config of sortConfigs) {
        const { key, direction } = config;
        if (!direction) continue;
        let valA: string | number = a[key] as string | number;
        let valB: string | number = b[key] as string | number;
        if (key === 'views' || key === 'comments_count') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else if (key === 'created_at') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [blogs, sortConfigs]);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBlogs.slice(start, start + pageSize);
  }, [sortedBlogs, currentPage]);

  const totalPages = Math.ceil(sortedBlogs.length / pageSize) || 1;

  const handleExport = () => {
    const headers = ['ID', '标题', '摘要', '分类', '标签', '创建时间', '状态'];
    const csvContent = [
      headers.join(','),
      ...blogs.map(b => [
        b.id,
        `"${b.title.replace(/"/g, '""')}"`,
        `"${(b.excerpt || '').replace(/"/g, '""')}"`,
        b.category || '',
        (b.tags || []).join(';'),
        b.created_at,
        b.draft ? '草稿' : '已发布'
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `blog_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDelete = (id: string) => {
    setBlogIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
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
    } catch (_error) {
      console.error('Delete error:', _error);
      showToast('操作出错', 'error');
    } finally {
      setBlogIdToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  return {
    blogs,
    loading,
    categories,
    tags,
    toast,
    setToast,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    blogIdToDelete,
    sortConfigs,
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
    handleSort,
    handleFilter,
    handleReset,
    handleExport,
    handleDelete,
    confirmDelete,
    showToast
  };
}
