'use client';

import { useEffect } from 'react';
import { useSiteStore } from '@/lib/store/useSiteStore';

/**
 * 全局状态初始化组件
 * 负责在应用启动时初始化站点配置和用户信息，并开启实时监听
 * @returns {null} - 此组件不渲染任何内容
 */
export default function StoreInitializer() {
  const initConfig = useSiteStore((state) => state.initConfig);

  useEffect(() => {
    // 初始化 Store 并获取清理函数
    const cleanup = initConfig();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initConfig]);

  return null;
}
