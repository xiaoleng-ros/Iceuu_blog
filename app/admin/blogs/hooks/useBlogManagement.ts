'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 博客文章对象接口
 */
export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  created_at: string;
  deleted_at?: string;
  draft: boolean;
  views?: number;
  comments_count?: number;
}

/**
 * 排序配置接口
 */
export interface SortConfig {
  key: keyof Blog;
  direction: 'asc' | 'desc' | null;
}

/**
 * 筛选条件接口
 */
export interface FilterConfig {
  title: string;
  category: string;
  tag: string;
  dateRange: { start: string; end: string };
}

/**
 * 博客管理通用逻辑 Hook
 * @param status - 博客状态筛选：'published' | 'draft' | 'deleted'
 * @param pageSize - 每页条数，默认为 10
 * @returns 博客列表管理相关的状态和方法
 */
export function useBlogManagement(status: 'published' | 'draft' | 'deleted', pageSize = 10) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([{ key: 'created_at', direction: 'desc' }]);
  
  const [filters, setFilters] = useState<FilterConfig>({
    title: '',
    category: '',
    tag: '',
    dateRange: { start: '', end: '' }
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 获取分类和标签列表
   */
  const fetchFilters = useCallback(async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        supabase.from('categories').select('name'),
        supabase.from('tags').select('name')
      ]);
      setCategories(catRes.data?.map(c => c.name) || []);
      setTags(tagRes.data?.map(t => t.name) || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  }, []);

  /**
   * 获取博客列表数据
   */
  const fetchBlogs = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/blog?limit=100&status=${status}`;
      if (filters.category) url += `&category=${encodeURIComponent(filters.category)}`;
      if (filters.tag) url += `&tag=${encodeURIComponent(filters.tag)}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      const json = await res.json();
      if (res.ok) {
        let data = json.data || [];
        
        // 标题模糊筛选
        if (filters.title) {
          data = data.filter((b: Blog) => b.title.toLowerCase().includes(filters.title.toLowerCase()));
        }

        // 时间范围筛选
        const dateField = status === 'deleted' ? 'deleted_at' : 'created_at';
        if (filters.dateRange.start) {
          data = data.filter((b: Blog) => new Date(b[dateField as keyof Blog] as string) >= new Date(filters.dateRange.start));
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          data = data.filter((b: Blog) => new Date(b[dateField as keyof Blog] as string) <= endDate);
        }

        setBlogs(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [status, filters]);

  useEffect(() => {
    fetchFilters();
    fetchBlogs(true);
  }, [fetchFilters, fetchBlogs]);

  /**
   * 处理筛选搜索
   */
  const handleFilterChange = useCallback((newFilters: Partial<FilterConfig>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchBlogs(), 300);
  }, [fetchBlogs]);

  /**
   * 重置筛选条件
   */
  const handleReset = useCallback(() => {
    setFilters({
      title: '',
      category: '',
      tag: '',
      dateRange: { start: '', end: '' }
    });
    setCurrentPage(1);
    setTimeout(() => fetchBlogs(true), 100);
  }, [fetchBlogs]);

  /**
   * 处理排序逻辑
   */
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

  /**
   * 排序后的博客列表
   */
  const sortedBlogs = useMemo(() => {
    if (sortConfigs.length === 0) return blogs;
    return [...blogs].sort((a, b) => {
      for (const config of sortConfigs) {
        const { key, direction } = config;
        if (!direction) continue;

        let valA = a[key];
        let valB = b[key];

        if (key === 'views' || key === 'comments_count') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else if (key === 'created_at' || key === 'deleted_at') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
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

  /**
   * 分页后的博客列表
   */
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBlogs.slice(start, start + pageSize);
  }, [sortedBlogs, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedBlogs.length / pageSize) || 1;

  return {
    blogs,
    setBlogs,
    loading,
    categories,
    tags,
    filters,
    handleFilterChange,
    handleReset,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedBlogs,
    sortConfigs,
    handleSort,
    fetchBlogs
  };
}
