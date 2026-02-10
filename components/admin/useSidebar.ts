'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * 侧边栏逻辑 Hook
 * 处理移动端适配、路由同步、菜单展开以及退出登录逻辑
 * @returns {Object} 侧边栏状态和处理函数
 */
export function useSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['文章']); // 默认展开文章菜单

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 路由变化时，移动端自动收起侧边栏
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  /**
   * 切换菜单展开状态
   * @param {string} label - 菜单项标签
   */
  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return {
    isOpen,
    setIsOpen,
    isMobile,
    pathname,
    openMenus,
    toggleMenu,
    showLogoutModal,
    setShowLogoutModal,
    handleLogout
  };
}
