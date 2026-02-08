'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 站点配置信息接口
 * 采用键值对形式存储站点各项配置
 */
interface SiteConfig {
  /** 配置键值对，键为配置项名称，值为配置内容 */
  [key: string]: string | undefined;
}

/**
 * 实时获取和监听网站配置的 Hook
 * 负责建立 Supabase 实时订阅，并在配置变更时同步更新状态
 * @param {SiteConfig} initialConfig - 初始配置数据（通常来自服务端获取）
 * @returns {SiteConfig} - 实时更新的配置状态数据
 */
export function useSiteConfig(initialConfig: SiteConfig) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);

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
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            setConfig((prev) => ({
              ...prev,
              [newRecord.key]: newRecord.value
            }));
          } else if (eventType === 'DELETE') {
            setConfig((prev) => {
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
  }, [initialConfig, config]);

  return config;
}
