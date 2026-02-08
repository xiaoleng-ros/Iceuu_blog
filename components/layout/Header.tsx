'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useSiteStore } from '@/lib/store/useSiteStore';

interface HeaderProps {
  transparent?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  hasDropdown?: boolean;
}

const navItems: NavItem[] = [
  { label: '🏠 首页', href: '/' },
  { label: '👋 生活边角料', href: '/category/生活边角料' },
  { label: '📝 情绪随笔', href: '/category/情绪随笔' },
  { label: '💡 干货分享', href: '/category/干货分享' },
  { label: '📈 成长复盘', href: '/category/成长复盘' },
  { label: '👤 关于我', href: 'https://ice-website-2ba.pages.dev/', external: true },
];

/**
 * 网站 Logo 组件
 * @param {Object} props - 组件属性
 * @param {string} props.siteName - 站点名称
 * @param {boolean} props.isTransparent - 是否透明
 * @returns {JSX.Element}
 */
function Logo({ siteName, isTransparent }: { siteName: string; isTransparent: boolean }) {
  return (
    <Link href="/" className="flex items-center group">
      <span className={cn(
        "text-lg font-bold tracking-tight transition-all duration-300",
        isTransparent ? "text-white drop-shadow-md" : "text-gray-800"
      )}>
        {siteName}
      </span>
    </Link>
  );
}

/**
 * 桌面端导航组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isTransparent - 是否透明
 * @returns {JSX.Element}
 */
function DesktopNav({ isTransparent }: { isTransparent: boolean }) {
  return (
    <nav className="hidden md:flex items-center gap-8">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "text-[15px] font-bold transition-all duration-300 flex items-center gap-1.5 group/item",
            isTransparent
              ? "text-white/90 hover:text-white drop-shadow-sm"
              : "text-gray-600 hover:text-blue-600"
          )}
          {...item.external ? { target: "_blank", rel: "noopener noreferrer" } : {}}
        >
          {item.label}
          {item.hasDropdown && (
            <ChevronDown className={cn(
              "w-3 h-3 transition-transform duration-300 group-hover/item:rotate-180",
              isTransparent ? "text-white/70" : "text-gray-400"
            )} />
          )}
        </Link>
      ))}
    </nav>
  );
}

/**
 * 右侧功能按钮组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isTransparent - 是否透明
 * @returns {JSX.Element}
 */
function ActionButtons({ isTransparent }: { isTransparent: boolean }) {
  return (
    <div className="hidden md:flex items-center gap-1">
      <Button variant="ghost" size="icon" className={cn(
        "h-9 w-9 transition-all duration-300",
        isTransparent ? "text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
      )}>
        <Search className="h-[18px] w-[18px]" />
      </Button>
      <Link href="/admin">
        <Button
          variant="ghost"
          size="icon"
          title="管理后台"
          className={cn(
            "h-9 w-9 transition-all duration-300",
            isTransparent ? "text-white hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Globe className="h-[18px] w-[18px]" />
        </Button>
      </Link>
    </div>
  );
}

/**
 * 移动端菜单组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 菜单是否打开
 * @param {Function} props.onClose - 关闭菜单的回调
 * @returns {JSX.Element | null}
 */
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t p-4 space-y-3 bg-white/95 backdrop-blur-md shadow-xl absolute w-full left-0 top-[56px] animate-in slide-in-from-top-2 duration-300">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 transition-all"
          onClick={onClose}
          {...item.external ? { target: "_blank", rel: "noopener noreferrer" } : {}}
        >
          <span>{item.label}</span>
          {item.hasDropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}
        </Link>
      ))}
      <div className="h-px bg-gray-100 my-2" />
      <Link href="/search" className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3" onClick={onClose}>
        <Search className="h-4 w-4" />
        <span>搜索</span>
      </Link>
      <Link href="/admin" className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3" onClick={onClose}>
        <Globe className="h-4 w-4" />
        <span>管理后台</span>
      </Link>
    </div>
  );
}

/**
 * 网站顶部导航栏组件
 * 使用全局 Store 获取站点名称，确保页面跳转后立即同步更新
 * @param {HeaderProps} props - 组件属性
 * @param {boolean} [props.transparent] - 是否透明显示
 * @returns {JSX.Element} - 返回顶部导航栏 JSX
 */
export default function Header({ transparent = false }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 从全局 Store 中获取站点配置
  const config = useSiteStore((state) => state.config);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = transparent && !isScrolled && !isOpen;
  // 优先从全局配置获取，Store 已实现持久化，页面跳转后可立即读取
  const siteName = config?.site_name || '赵阿卷';

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isTransparent 
          ? "bg-transparent border-transparent" 
          : "bg-[#fdfdfd]/70 backdrop-blur-2xl border-b border-white/20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo siteName={siteName} isTransparent={isTransparent} />
          <DesktopNav isTransparent={isTransparent} />
        </div>

        <div className="flex items-center gap-1">
          <ActionButtons isTransparent={isTransparent} />
          <button 
            className={cn("md:hidden p-2 transition-colors", isTransparent ? "text-white" : "text-gray-600")}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
}

