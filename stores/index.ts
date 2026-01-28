'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 作者信息状态管理 Store
 * 模拟 Zustand 接口，提供作者名称的获取和实时更新
 * @param selector 选择器函数
 * @returns 选中的状态数据
 */
export function useAuthorStore(selector: (state: any) => any) {
  const [author, setAuthor] = useState({ name: '管理员' });

  useEffect(() => {
    // 1. 初始获取作者名称 (site_name)
    const fetchAuthor = async () => {
      const { data } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'site_name')
        .single();
      
      if (data?.value) {
        setAuthor({ name: data.value });
      }
    };

    fetchAuthor();

    // 2. 监听 site_config 表的变化，实时更新作者名称
    const channel = supabase
      .channel('author_name_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_config',
          filter: 'key=eq.site_name'
        },
        (payload: any) => {
          if (payload.new && payload.new.value) {
            setAuthor({ name: payload.new.value });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const state = {
    author,
  };

  return selector(state);
}
