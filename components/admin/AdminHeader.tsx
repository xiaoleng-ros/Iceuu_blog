'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteStore } from '@/lib/store/useSiteStore';

/**
 * 后台管理页面顶部导航栏组件 - 个人资料展示部分
 * 采用日系动漫风格设计
 */
function UserProfile({ fullName, avatarUrl }: { fullName: string, avatarUrl: string }) {
  return (
    <>
      <div className="text-right hidden sm:block">
        <p className="text-[13px] font-medium text-[#4A4A4A] leading-tight group-hover:text-[#7EB6E8] transition-colors">
          {fullName}
        </p>
        <p className="text-[11px] text-[#9B9B9B]">管理员</p>
      </div>
      
      <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-lg shadow-[#7EB6E8]/10 bg-white flex items-center justify-center relative ring-2 ring-[#FFB5C5]/20">
        {avatarUrl ? (
          <Image 
            src={avatarUrl} 
            alt="Avatar" 
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7EB6E8]/20 to-[#FFB5C5]/20 flex items-center justify-center">
            <User className="text-[#7EB6E8]" size={18} />
          </div>
        )}
      </div>
    </>
  );
}

/**
 * 后台管理页面顶部导航栏组件 - 下拉菜单部分
 * 采用日系动漫风格设计
 */
function UserDropdown({ 
  fullName, 
  handleGoToSettings, 
  handleLogout 
}: { 
  fullName: string, 
  handleGoToSettings: () => void, 
  handleLogout: () => void 
}) {
  return (
    <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(126,182,232,0.12)] border border-[#FFB5C5]/20 py-2 animate-in fade-in slide-in-from-top-3 duration-300 overflow-hidden">
      {/* 装饰性渐变顶部 */}
      <div className="h-1 bg-gradient-to-r from-[#7EB6E8] via-[#FFB5C5] to-[#C9A8E0]" />
      
      <div className="px-4 py-3 sm:hidden border-b border-[#F5F5F5] mb-1">
        <p className="text-[13px] font-medium text-[#4A4A4A] truncate">{fullName}</p>
        <p className="text-[11px] text-[#9B9B9B]">管理员</p>
      </div>
      
      <button
        onClick={handleGoToSettings}
        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#6B6B6B] hover:bg-gradient-to-r hover:from-[#7EB6E8]/5 hover:to-[#FFB5C5]/5 hover:text-[#7EB6E8] transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-xl bg-[#7EB6E8]/10 flex items-center justify-center group-hover:bg-[#7EB6E8] transition-colors">
          <Settings size={15} className="text-[#7EB6E8] group-hover:text-white transition-colors" />
        </div>
        <span className="font-medium">系统设置</span>
      </button>
      
      <div className="h-px bg-gradient-to-r from-transparent via-[#F0F0F0] to-transparent mx-3 my-1" />
      
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#FF9B9B] hover:bg-[#FF9B9B]/5 transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-xl bg-[#FF9B9B]/10 flex items-center justify-center group-hover:bg-[#FF9B9B] transition-colors">
          <LogOut size={15} className="text-[#FF9B9B] group-hover:text-white transition-colors" />
        </div>
        <span className="font-medium">退出登录</span>
      </button>
    </div>
  );
}

/**
 * 后台管理页面顶部导航栏组件
 * 使用全局 Store 获取用户信息，确保在个人资料更新后立即同步显示
 * 采用日系动漫风格设计，毛玻璃效果与柔和光影
 * @returns {JSX.Element} - 返回顶部导航栏 JSX 结构
 */
export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);
  
  const user = useSiteStore((state) => state.user);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    /**
     * 处理外部点击事件，用于关闭下拉菜单
     * @param {MouseEvent} event - 鼠标事件
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * 处理退出登录
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  /**
   * 跳转到系统设置
   * @returns {void}
   */
  const handleGoToSettings = () => {
    router.push('/admin/system');
    setIsOpen(false);
  };

  const fullName = user?.fullName || '管理员';
  const avatarUrl = user?.avatarUrl || '';

  return (
    <header className="h-20 flex items-center justify-end px-4 md:px-8 sticky top-0 z-30">
      {/* 背景层 - 毛玻璃效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFF5F8]/80 via-[#F8FCFF]/80 to-[#F5FFF8]/80 backdrop-blur-xl" />
      
      {/* 装饰性底部边框 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFB5C5]/30 to-transparent" />
      
      {/* 装饰性云朵 */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-8 bg-white/30 rounded-full blur-lg pointer-events-none" />
      
      {/* 内容层 */}
      <div className="relative z-10" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 md:gap-3 hover:bg-white/50 p-2 rounded-2xl transition-all duration-300 group"
        >
          <UserProfile fullName={fullName} avatarUrl={avatarUrl} />
          
          <ChevronDown 
            className={cn(
              "text-[#9B9B9B] transition-transform duration-300 group-hover:text-[#7EB6E8]",
              isOpen && "rotate-180 text-[#7EB6E8]"
            )} 
            size={16} 
          />
        </button>

        {/* 下拉菜单 */}
        {isOpen && (
          <UserDropdown 
            fullName={fullName} 
            handleGoToSettings={handleGoToSettings} 
            handleLogout={handleLogout} 
          />
        )}
      </div>
    </header>
  );
}
