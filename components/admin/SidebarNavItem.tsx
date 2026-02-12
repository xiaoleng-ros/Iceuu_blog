'use client';

import Link from 'next/link';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemChild {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface SidebarNavItemProps {
  label: string;
  href?: string;
  icon: LucideIcon;
  subItems?: NavItemChild[];
  pathname: string;
  openMenus: string[];
  toggleMenu: (label: string) => void;
}

/**
 * 侧边栏单个导航项组件（支持子菜单）
 * 采用日系动漫风格设计，柔和色彩与轻盈动效
 */
export function SidebarNavItem({
  label,
  href,
  icon: Icon,
  subItems,
  pathname,
  openMenus,
  toggleMenu
}: SidebarNavItemProps) {
  const hasChildren = subItems && subItems.length > 0;
  const isMenuOpen = openMenus.includes(label);
  const isActive = href ? (pathname === href || pathname.startsWith(href + '/')) : false;
  const isChildActive = hasChildren && subItems?.some(child => pathname === child.href);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleMenu(label)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
            isChildActive 
              ? "bg-gradient-to-r from-[#7EB6E8]/15 to-[#FFB5C5]/10 text-[#7EB6E8] font-medium shadow-sm" 
              : "text-[#6B6B6B] hover:bg-white/60 hover:text-[#7EB6E8]"
          )}
        >
          {/* 活跃状态指示器 */}
          {isChildActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#7EB6E8] to-[#FFB5C5] rounded-r-full" />
          )}
          
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
              isChildActive 
                ? "bg-gradient-to-br from-[#7EB6E8] to-[#5A9BD5] text-white shadow-lg shadow-[#7EB6E8]/20" 
                : "bg-white/50 text-[#9B9B9B] group-hover:bg-[#7EB6E8]/10 group-hover:text-[#7EB6E8]"
            )}>
              <Icon size={16} />
            </div>
            <span className="text-[13px] font-medium">{label}</span>
          </div>
          <ChevronDown 
            size={16} 
            className={cn(
              "text-[#9B9B9B] transition-transform duration-300",
              isMenuOpen ? "rotate-180 text-[#7EB6E8]" : ""
            )} 
          />
        </button>
        
        {/* 子菜单 */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="pl-4 pr-2 py-1 space-y-1">
            {subItems.map((child) => {
              const isSubActive = pathname === child.href;
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-2.5 text-[13px] rounded-xl transition-all duration-200 relative",
                    isSubActive
                      ? "bg-gradient-to-r from-[#7EB6E8]/10 to-[#FFB5C5]/5 text-[#7EB6E8] font-medium"
                      : "text-[#9B9B9B] hover:text-[#7EB6E8] hover:bg-white/40"
                  )}
                >
                  {/* 子菜单活跃指示器 */}
                  {isSubActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-[#FFB5C5] to-[#C9A8E0] rounded-r-full" />
                  )}
                  
                  {ChildIcon && (
                    <ChildIcon size={14} className={cn(
                      "transition-colors",
                      isSubActive ? "text-[#7EB6E8]" : "text-[#B0B0B0]"
                    )} />
                  )}
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href || '#'}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
        isActive 
          ? "bg-gradient-to-r from-[#7EB6E8]/15 to-[#FFB5C5]/10 text-[#7EB6E8] font-medium shadow-sm" 
          : "text-[#6B6B6B] hover:bg-white/60 hover:text-[#7EB6E8]"
      )}
    >
      {/* 活跃状态指示器 */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#7EB6E8] to-[#FFB5C5] rounded-r-full" />
      )}
      
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
        isActive 
          ? "bg-gradient-to-br from-[#7EB6E8] to-[#5A9BD5] text-white shadow-lg shadow-[#7EB6E8]/20" 
          : "bg-white/50 text-[#9B9B9B] group-hover:bg-[#7EB6E8]/10 group-hover:text-[#7EB6E8]"
      )}>
        <Icon size={16} />
      </div>
      <span className="text-[13px] font-medium">{label}</span>
      
      {/* 悬浮时的光效 */}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </Link>
  );
}
