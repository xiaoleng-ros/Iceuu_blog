'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 实时获取和监听网站配置的 Hook
 * @param initialConfig 初始配置数据（通常来自服务端获取）
 * @returns 实时更新的配置数据
 */
export function useSiteConfig(initialConfig: any) {
  const [config, setConfig] = useState(initialConfig);

  useEffect(() => {
    // 只有当 initialConfig 真正发生变化且与当前 state 不同时才更新
    // 使用 JSON.stringify 进行深比较，并确保 initialConfig 有值
    if (initialConfig) {
      const configStr = JSON.stringify(initialConfig);
      const currentConfigStr = JSON.stringify(config);
      if (configStr !== currentConfigStr) {
        setConfig(initialConfig);
      }
    }

    // 创建实时订阅
    const channel = supabase
      .channel('site_config_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_config'
        },
        (payload) => {
          console.log('Site config changed:', payload);
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            setConfig((prev: any) => ({
              ...prev,
              [newRecord.key]: newRecord.value
            }));
          } else if (eventType === 'DELETE') {
            setConfig((prev: any) => {
              const next = { ...prev };
              delete next[oldRecord.key];
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialConfig]);

  return config;
}
