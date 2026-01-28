'use client';

import SystemSettings from '@/components/admin/settings/SystemSettings';

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
