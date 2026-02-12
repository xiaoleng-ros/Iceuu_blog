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
 * 获取图标容器样式
 * @param isActive - 是否活跃状态
 * @returns 样式类名
 */
function getIconContainerClass(isActive: boolean): string {
  return cn(
    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
    isActive 
      ? "bg-gradient-to-br from-[#7EB6E8] to-[#5A9BD5] text-white shadow-lg shadow-[#7EB6E8]/20" 
      : "bg-white/50 text-[#9B9B9B] group-hover:bg-[#7EB6E8]/10 group-hover:text-[#7EB6E8]"
  );
}

/**
 * 获取按钮样式
 * @param isActive - 是否活跃状态
 * @returns 样式类名
 */
function getButtonClass(isActive: boolean): string {
  return cn(
    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
    isActive 
      ? "bg-gradient-to-r from-[#7EB6E8]/15 to-[#FFB5C5]/10 text-[#7EB6E8] font-medium shadow-sm" 
      : "text-[#6B6B6B] hover:bg-white/60 hover:text-[#7EB6E8]"
  );
}

/**
 * 子菜单项组件
 */
function SubMenuItem({ child, pathname }: { child: NavItemChild; pathname: string }) {
  const isSubActive = pathname === child.href;
  const ChildIcon = child.icon;

  return (
    <Link href={child.href} className={cn(
      "flex items-center space-x-3 px-4 py-2.5 text-[13px] rounded-xl transition-all duration-200 relative",
      isSubActive
        ? "bg-gradient-to-r from-[#7EB6E8]/10 to-[#FFB5C5]/5 text-[#7EB6E8] font-medium"
        : "text-[#9B9B9B] hover:text-[#7EB6E8] hover:bg-white/40"
    )}>
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
}

/**
 * 子菜单组件
 */
function SubMenu({ subItems, isMenuOpen, pathname }: { 
  subItems: NavItemChild[]; 
  isMenuOpen: boolean; 
  pathname: string;
}) {
  return (
    <div className={cn(
      "overflow-hidden transition-all duration-300 ease-out",
      isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
    )}>
      <div className="pl-4 pr-2 py-1 space-y-1">
        {subItems.map((child) => (
          <SubMenuItem key={child.href} child={child} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}

/**
 * 菜单项（带子菜单）
 */
function MenuButton({
  label,
  icon: Icon,
  subItems,
  isChildActive,
  isMenuOpen,
  pathname,
  toggleMenu
}: {
  label: string;
  icon: LucideIcon;
  subItems: NavItemChild[];
  isChildActive: boolean;
  isMenuOpen: boolean;
  pathname: string;
  toggleMenu: () => void;
}) {
  return (
    <div className="space-y-1">
      <button onClick={toggleMenu} className={getButtonClass(isChildActive)}>
        {isChildActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#7EB6E8] to-[#FFB5C5] rounded-r-full" />
        )}
        <div className="flex items-center space-x-3">
          <div className={getIconContainerClass(isChildActive)}>
            <Icon size={16} />
          </div>
          <span className="text-[13px] font-medium">{label}</span>
        </div>
        <ChevronDown size={16} className={cn(
          "text-[#9B9B9B] transition-transform duration-300",
          isMenuOpen ? "rotate-180 text-[#7EB6E8]" : ""
        )} />
      </button>
      <SubMenu subItems={subItems} isMenuOpen={isMenuOpen} pathname={pathname} />
    </div>
  );
}

/**
 * 导航链接组件
 */
function NavLinkItem({
  href,
  label,
  icon: Icon,
  isActive
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <Link href={href} className={cn(
      "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
      isActive 
        ? "bg-gradient-to-r from-[#7EB6E8]/15 to-[#FFB5C5]/10 text-[#7EB6E8] font-medium shadow-sm" 
        : "text-[#6B6B6B] hover:bg-white/60 hover:text-[#7EB6E8]"
    )}>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#7EB6E8] to-[#FFB5C5] rounded-r-full" />
      )}
      <div className={getIconContainerClass(isActive)}>
        <Icon size={16} />
      </div>
      <span className="text-[13px] font-medium">{label}</span>
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </Link>
  );
}

/**
 * 侧边栏单个导航项组件
 */
export function SidebarNavItem({
  label,
  href,
  icon,
  subItems,
  pathname,
  openMenus,
  toggleMenu
}: SidebarNavItemProps) {
  const hasChildren = subItems && subItems.length > 0;
  const isMenuOpen = openMenus.includes(label);
  const isActive = href ? (pathname === href || pathname.startsWith(href + '/')) : false;
  const isChildActive = hasChildren ? (subItems?.some(child => pathname === child.href) ?? false) : false;

  if (hasChildren) {
    return (
      <MenuButton
        label={label}
        icon={icon}
        subItems={subItems}
        isChildActive={isChildActive}
        isMenuOpen={isMenuOpen}
        pathname={pathname}
        toggleMenu={() => toggleMenu(label)}
      />
    );
  }

  return (
    <NavLinkItem href={href || '#'} label={label} icon={icon} isActive={isActive} />
  );
}
