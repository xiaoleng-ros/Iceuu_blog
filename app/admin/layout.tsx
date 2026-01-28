'use client';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AuthGuard from '@/components/admin/AuthGuard';
import { usePathname } from 'next/navigation';

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
      <div className="flex min-h-screen bg-[#F5F7FA]">
        <Sidebar />
        <main className="flex-1 lg:ml-64 transition-all duration-300 min-h-screen flex flex-col">
          <AdminHeader />
          <div className="flex-1 p-4 md:p-8 lg:p-10 pt-2 md:pt-2 lg:pt-2">
            <div className="max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
