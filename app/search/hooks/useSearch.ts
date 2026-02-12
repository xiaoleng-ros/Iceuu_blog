'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Blog } from '@/types/database';
import { useSearchParams, useRouter } from 'next/navigation';

const PAGE_SIZE = 10;

/**
 * 搜索结果数据获取 Hook
 * @param pageSize - 每页条数
 * @returns 搜索结果相关状态和方法
 */
function useSearchResults(pageSize: number) {
  const [results, setResults] = useState<Blog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  /**
   * 执行搜索的核心函数
   * @param searchTerm - 搜索关键词
   * @param currentPage - 当前页码
   * @param append - 是否追加结果（用于加载更多）
   */
  const performSearch = useCallback(async (searchTerm: string, currentPage: number, append: boolean = false) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('blogs')
        .select('id, title, excerpt, created_at, category, content, draft, tags, cover_image', { count: 'exact' })
        .eq('draft', false)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      const newResults = (data as Blog[]) || [];
      if (append) {
        setResults(prev => [...prev, ...newResults]);
      } else {
        setResults(newResults);
      }
      setTotalCount(count || 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误';
      console.error('全站搜索失败:', message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]);

  return { results, setResults, totalCount, loading, loadingMore, performSearch };
}

/**
 * 搜索逻辑 Hook
 * 支持多字段模糊搜索、加载更多、防抖、URL 同步等功能
 * @returns {Object} 搜索状态和处理函数
 */
export function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(!!initialQuery);
  const [page, setPage] = useState(1);

  const { results, totalCount, loading, loadingMore, performSearch } = useSearchResults(PAGE_SIZE);

  // 当 URL 参数变化时更新状态并重置搜索
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setPage(1);
    setSearched(!!q);
    performSearch(q, 1, false);
  }, [searchParams, performSearch]);

  /**
   * 处理搜索提交
   * @param newQuery - 新的搜索关键词
   */
  const handleSearch = useCallback((newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      params.set('q', newQuery.trim());
    } else {
      params.delete('q');
    }
    router.push(`/search?${params.toString()}`);
  }, [searchParams, router]);

  /**
   * 加载更多结果
   */
  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage, true);
  }, [page, query, performSearch]);

  return {
    query,
    setQuery,
    results,
    loading,
    loadingMore,
    searched,
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    handleSearch,
    loadMore
  };
}
