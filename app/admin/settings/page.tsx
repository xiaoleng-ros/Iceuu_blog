'use client';

import dynamic from 'next/dynamic';

const SiteSettings = dynamic(() => import('@/components/admin/settings/SiteSettings'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-500">正在加载设置...</div>
});

/**
 * 站点设置页面
 * 配置网站标题、描述、SEO及社交链接
 */
export default function SettingsPage() {
  return <SiteSettings />;
}