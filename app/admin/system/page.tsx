'use client';

import dynamic from 'next/dynamic';

const SystemSettings = dynamic(() => import('@/components/admin/settings/SystemSettings'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-500">正在加载系统设置...</div>
});

/**
 * 系统设置页面
 * 包含账户配置和个人配置
 */
export default function SystemSettingsPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <SystemSettings />
    </div>
  );
}
