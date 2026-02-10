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
 * 对博客列表进行多字段排序
 * @param blogs - 待排序博客数组
 * @param sortConfigs - 排序配置数组
 * @returns 排序后的博客数组
 */
function sortBlogs(blogs: Blog[], sortConfigs: SortConfig[]): Blog[] {
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
}

/**
 * 根据筛选条件过滤博客列表
 * @param blogs - 待过滤博客数组
 * @param filters - 筛选条件
 * @param status - 博客状态
 * @returns 过滤后的博客数组
 */
function filterBlogs(blogs: Blog[], filters: FilterConfig, status: string): Blog[] {
  let data = [...blogs];
  
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

  return data;
}

/**
 * 更新排序配置数组
 * @param prev - 之前的排序配置
 * @param key - 排序字段
 * @param multiSort - 是否为多字段排序
 * @returns 更新后的排序配置数组
 */
function updateSortConfigs(prev: SortConfig[], key: keyof Blog, multiSort: boolean): SortConfig[] {
  const existingConfig = prev.find(c => c.key === key);
  if (multiSort) {
    if (existingConfig) {
      const nextDir = existingConfig.direction === 'desc' ? 'asc' : 'desc';
      return prev.map(c => c.key === key ? { ...c, direction: nextDir } : c);
    }
    return [...prev, { key, direction: 'desc' }];
  }
  const nextDir = existingConfig?.direction === 'desc' ? 'asc' : 'desc';
  return [{ key, direction: nextDir }];
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

  const fetchBlogs = useCallback(async (_isInitial = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/blog?limit=100&status=${status}${filters.category ? `&category=${encodeURIComponent(filters.category)}` : ''}${filters.tag ? `&tag=${encodeURIComponent(filters.tag)}` : ''}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (res.ok) {
        const data = filterBlogs(json.data || [], filters, status);
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

  const handleFilterChange = useCallback((newFilters: Partial<FilterConfig>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchBlogs(), 300);
  }, [fetchBlogs]);

  const handleReset = useCallback(() => {
    setFilters({ title: '', category: '', tag: '', dateRange: { start: '', end: '' } });
    setCurrentPage(1);
    setTimeout(() => fetchBlogs(true), 100);
  }, [fetchBlogs]);

  const handleSort = (key: keyof Blog, multiSort = false) => {
    setSortConfigs(prev => updateSortConfigs(prev, key, multiSort));
  };

  const sortedBlogs = useMemo(() => sortBlogs(blogs, sortConfigs), [blogs, sortConfigs]);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBlogs.slice(start, start + pageSize);
  }, [sortedBlogs, currentPage, pageSize]);

  return {
    blogs, setBlogs, loading, categories, tags, filters, handleFilterChange, handleReset,
    currentPage, setCurrentPage, totalPages: Math.ceil(sortedBlogs.length / pageSize) || 1,
    paginatedBlogs, sortConfigs, handleSort, fetchBlogs
  };
}
