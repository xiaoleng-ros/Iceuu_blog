'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 作者信息状态接口
 */
interface AuthorState {
  authorName: string;
}

/**
 * 作者信息状态管理 Store
 * 模拟 Zustand 接口，提供作者名称的获取和实时更新
 * @template T
 * @param {(state: AuthorState) => T} selector - 选择器函数，用于从状态中提取特定部分
 * @returns {T} - 返回选中的状态数据
 */
export function useAuthorStore<T>(selector: (state: AuthorState) => T): T {
  const [authorName, setAuthorName] = useState('加载中...');

  useEffect(() => {
    // 初始获取
    const fetchAuthor = async () => {
      try {
        const { data, error } = await supabase
          .from('authors')
          .select('name')
          .single();
        
        if (error) throw error;
        if (data) setAuthorName(data.name);
      } catch (error) {
        console.error('Failed to fetch author:', error);
        setAuthorName('Iceuu'); // 降级默认值
      }
    };

    fetchAuthor();

    // 订阅实时更新
    const channel = supabase
      .channel('author_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'authors' },
        (payload: any) => {
          if (payload.new && payload.new.name) {
            setAuthorName(payload.new.name);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return selector({ authorName });
}
