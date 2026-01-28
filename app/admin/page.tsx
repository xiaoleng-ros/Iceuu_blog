import { redirect } from 'next/navigation';

/**
 * 管理后台根路由
 * 自动重定向到仪表盘页面
 */
export default function AdminPage() {
  redirect('/admin/dashboard');
}
