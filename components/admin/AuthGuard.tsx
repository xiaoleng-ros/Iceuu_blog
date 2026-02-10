'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * 身份验证守卫组件
 * 负责检查用户的登录状态，并根据状态进行路由重定向
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件内容
 * @returns {JSX.Element} - 返回受保护的页面内容或加载状态
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoginPage = pathname === '/admin/login';

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (!isLoginPage) {
          router.push('/admin/login');
        } else {
          setLoading(false);
        }
      } else {
        if (isLoginPage) {
          router.push('/admin/dashboard');
        } else {
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (!isLoginPage) {
          router.push('/admin/login');
        }
      } else if (event === 'SIGNED_IN' && isLoginPage) {
        router.push('/admin/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return <>{children}</>;
}
