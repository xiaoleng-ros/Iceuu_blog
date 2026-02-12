'use client';
import dynamic from 'next/dynamic';
import AuthGuard from '@/components/admin/AuthGuard';
import { usePathname } from 'next/navigation';

const Sidebar = dynamic(() => import('@/components/admin/Sidebar'), { ssr: false });
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { ssr: false });

/**
 * 管理后台布局组件
 * 采用日系动漫风格设计
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen relative">
        {/* 背景装饰层 */}
        <div className="fixed inset-0 pointer-events-none">
          {/* 主背景色 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDF8F5] via-[#FDF9F7] to-[#F8FDF9]" />
          
          {/* 装饰性渐变斑点 */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#7EB6E8]/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFB5C5]/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#C9A8E0]/3 via-[#7EB6E8]/3 to-[#FFB5C5]/3 rounded-full blur-3xl" />
          
          {/* 网格纹理 */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #7EB6E8 1px, transparent 1px),
                linear-gradient(to bottom, #7EB6E8 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        <Sidebar />
        <main className="flex-1 lg:ml-64 transition-all duration-500 min-h-screen flex flex-col relative z-10">
          <AdminHeader />
          <div className="flex-1 p-4 md:p-6 lg:p-8 pt-2 md:pt-2 lg:pt-2">
            <div className="max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
