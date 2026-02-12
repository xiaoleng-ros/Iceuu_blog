'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Globe, ChevronDown, Command } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useSiteStore } from '@/lib/store/useSiteStore';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  transparent?: boolean;
}

/**
 * 搜索遮罩层组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否打开
 * @param {Function} props.onClose - 关闭回调
 * @returns {JSX.Element | null}
 */
function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setError(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="max-w-2xl mx-auto mt-24 px-4 transition-transform duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <SearchFormContent 
          query={query}
          error={error}
          onQueryChange={setQuery}
          onErrorChange={setError}
          onSubmit={handleSubmit}
          onClear={() => { setQuery(''); setError(false); }}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function SearchFormContent({
  query,
  error,
  onQueryChange,
  onErrorChange,
  onSubmit,
  onClear,
  onClose,
}: {
  query: string;
  error: boolean;
  onQueryChange: (value: string) => void;
  onErrorChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative">
      <form onSubmit={onSubmit} className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-700">内容搜索</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-all duration-300 group"
            title="关闭 (Esc)"
          >
            <X className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-90 stroke-[2.5px]" />
          </button>
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            autoFocus
            className={cn(
              "w-full bg-gray-50 border focus:ring-2 text-lg pl-10 pr-10 h-12 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all",
              error ? "border-red-300 focus:ring-red-100 ring-2 ring-red-50" : "border-transparent focus:ring-blue-100"
            )}
            placeholder="搜索文章、分类或标签..."
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              if (error && e.target.value.trim()) onErrorChange(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <div className="absolute right-3 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-gray-200/50 rounded text-[10px] font-medium text-gray-500">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
            {query && (
              <button 
                type="button"
                onClick={onClear}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="px-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-xs font-medium text-red-500 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
              请输入搜索内容
            </p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-sans">Enter</span> 
              确认
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-sans">Esc</span> 
              关闭
            </span>
          </div>
          <Button 
            type="submit"
            className="h-9 px-6 rounded-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-100 transition-all active:scale-95 shrink-0 text-sm border-none"
          >
            搜索
          </Button>
        </div>
      </form>
    </div>
  );
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
 * @param {Function} props.onSearchClick - 点击搜索的回调
 * @returns {JSX.Element}
 */
function ActionButtons({ isTransparent, onSearchClick }: { isTransparent: boolean; onSearchClick: () => void }) {
  return (
    <div className="hidden md:flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onSearchClick}
        className={cn(
          "h-9 w-9 transition-all duration-300",
          isTransparent ? "text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
        )}
      >
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
 * @param {Function} props.onSearchClick - 点击搜索的回调
 * @returns {JSX.Element | null}
 */
function MobileMenu({ isOpen, onClose, onSearchClick }: { isOpen: boolean; onClose: () => void; onSearchClick: () => void }) {
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
      <button 
        onClick={() => {
          onClose();
          onSearchClick();
        }}
        className="w-full flex items-center gap-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 transition-all"
      >
        <Search className="h-4 w-4" />
        <span>搜索</span>
      </button>
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // 从全局 Store 中获取站点配置
  const config = useSiteStore((state) => state.config);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isTransparent = transparent && !isScrolled && !isOpen;
  // 优先从全局配置获取，Store 已实现持久化，页面跳转后可立即读取
  const siteName = config?.site_name || '赵阿卷';

  return (
    <>
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
            <ActionButtons isTransparent={isTransparent} onSearchClick={() => setIsSearchOpen(true)} />
            <button 
              className={cn("md:hidden p-2 transition-colors", isTransparent ? "text-white" : "text-gray-600")}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} onSearchClick={() => setIsSearchOpen(true)} />
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

