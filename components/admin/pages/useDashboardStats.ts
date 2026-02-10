'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 博客文章简要接口
 */
export interface Blog {
  id: string;
  title: string;
  draft: boolean;
  status?: string;
}

/**
 * 仪表盘统计数据接口
 */
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  trashPosts: number;
  totalMedia: number;
}

/**
 * 仪表盘统计数据 Hook
 * 处理数据获取和状态管理
 * @returns {Object} 统计数据、加载状态和获取函数
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    trashPosts: 0,
    totalMedia: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      // 并发获取数据
      const [postsRes, trashRes, mediaRes] = await Promise.all([
        fetch('/api/blog?limit=2000', { headers }),
        fetch('/api/blog?limit=2000&status=deleted', { headers }),
        fetch('/api/media', { headers })
      ]);

      const [postsJson, trashJson, mediaJson] = await Promise.all([
        postsRes.json(),
        trashRes.json(),
        mediaRes.json()
      ]);

      const activePosts: Blog[] = postsJson.data || [];
      const trashPosts: Blog[] = trashJson.data || [];
      const mediaList = mediaJson.data || [];
      
      setStats({
        totalPosts: activePosts.length,
        publishedPosts: activePosts.filter((p: Blog) => !p.draft).length,
        draftPosts: activePosts.filter((p: Blog) => p.draft).length,
        trashPosts: trashPosts.length,
        totalMedia: mediaList.length,
      });
    } catch (_error) {
      console.error('获取仪表盘统计数据失败:', _error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, fetchStats };
}
