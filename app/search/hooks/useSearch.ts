'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Blog } from '@/types/database';

/**
 * 搜索逻辑 Hook
 * 处理搜索关键词、结果列表、加载状态及搜索触发标记
 * @returns {Object} 搜索状态和处理函数
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  /**
   * 处理搜索表单提交
   * 调用 Supabase 进行标题模糊搜索，过滤掉草稿和逻辑删除的文章
   * @param {React.FormEvent} e - React 表单提交事件
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, excerpt, created_at, category, content, draft, tags')
        .eq('draft', false)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setResults((data as Blog[]) || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '未知错误';
      console.error('全站搜索失败:', message);
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    loading,
    searched,
    handleSearch
  };
}
