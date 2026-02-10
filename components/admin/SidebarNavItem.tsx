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
            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group outline-none relative",
            isChildActive 
              ? "text-[#3491FA] font-bold" 
              : "text-[#4E5969] hover:bg-white/60 hover:text-[#3491FA]"
          )}
        >
          <div className="flex items-center space-x-3">
            <Icon size={18} className={cn(
              "transition-colors",
              isChildActive ? "text-[#3491FA]" : "text-[#86909C] group-hover:text-[#3491FA]"
            )} />
            <span className="text-[14px]">{label}</span>
          </div>
          <ChevronDown 
            size={14} 
            className={cn(
              "transition-transform duration-300",
              isMenuOpen ? "rotate-180" : ""
            )} 
          />
        </button>
        
        {isMenuOpen && (
          <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {subItems.map((child) => {
              const isSubActive = pathname === child.href;
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-2 text-[13px] rounded-lg transition-all duration-200",
                    isSubActive
                      ? "text-[#3491FA] font-medium bg-[#3491FA]/5"
                      : "text-[#86909C] hover:text-[#3491FA] hover:bg-white/40"
                  )}
                >
                  {ChildIcon && <ChildIcon size={14} className={cn(
                    "transition-colors",
                    isSubActive ? "text-[#3491FA]" : "text-[#86909C]"
                  )} />}
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href || '#'}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group outline-none relative",
        isActive 
          ? "bg-white text-[#3491FA] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#3491FA]/10" 
          : "text-[#4E5969] hover:bg-white/60 hover:text-[#3491FA] hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      )}
    >
      <Icon size={18} className={cn(
        "transition-colors",
        isActive ? "text-[#3491FA]" : "text-[#86909C] group-hover:text-[#3491FA]"
      )} />
      <span className="text-[14px]">{label}</span>
    </Link>
  );
}
