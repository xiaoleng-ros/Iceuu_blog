'use client';

import { Settings, LogOut, User, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AdminUserDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fullName: string;
  avatarUrl: string;
  handleGoToSettings: () => void;
  handleLogout: () => void;
}

/**
 * 后台管理页面用户下拉菜单组件
 * @param {AdminUserDropdownProps} props - 组件属性
 * @returns {JSX.Element}
 */
export function AdminUserDropdown({
  isOpen,
  setIsOpen,
  fullName,
  avatarUrl,
  handleGoToSettings,
  handleLogout
}: AdminUserDropdownProps) {
  return (
    <div className="relative mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:gap-3 hover:bg-white/50 p-1.5 rounded-lg transition-all duration-200 group"
      >
        <div className="text-right hidden sm:block">
          <p className="text-[14px] font-bold text-[#1D2129] leading-tight group-hover:text-[#165DFF] transition-colors">
            {fullName}
          </p>
          <p className="text-[12px] text-[#86909C]">管理员</p>
        </div>
        
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white flex items-center justify-center relative">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt="Avatar" 
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#165DFF]/10 to-[#165DFF]/5 flex items-center justify-center">
              <User className="text-[#165DFF]" size={20} />
            </div>
          )}
        </div>
        
        <ChevronDown 
          className={cn(
            "text-[#86909C] transition-transform duration-200 group-hover:text-[#1D2129]",
            isOpen && "rotate-180"
          )} 
          size={14} 
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E5E6EB] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 sm:hidden border-b border-[#F2F3F5] mb-1">
            <p className="text-[14px] font-bold text-[#1D2129] truncate">{fullName}</p>
            <p className="text-[12px] text-[#86909C]">管理员</p>
          </div>
          
          <button
            onClick={handleGoToSettings}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#4E5969] hover:bg-[#F2F3F5] hover:text-[#165DFF] transition-colors group"
          >
            <Settings size={18} className="text-[#86909C] group-hover:text-[#165DFF]" />
            <span className="font-medium">系统设置</span>
          </button>
          <div className="h-[1px] bg-[#F2F3F5] my-1 mx-2" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#F53F3F] hover:bg-[#FFF2F0] transition-colors group"
          >
            <LogOut size={18} className="text-[#F53F3F]/70 group-hover:text-[#F53F3F]" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      )}
    </div>
  );
}
