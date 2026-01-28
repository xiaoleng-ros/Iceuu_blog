'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, LogOut, Menu, X, Globe, UserCog, ChevronDown, List, PlusCircle, FileEdit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { label: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
  { 
    label: '文章', 
    icon: FileText,
    children: [
      { label: '文章管理', href: '/admin/blogs', icon: List },
      { label: '新建文章', href: '/admin/blogs/new', icon: PlusCircle },
      { label: '草稿箱', href: '/admin/blogs/drafts', icon: FileEdit },
      { label: '回收站', href: '/admin/blogs/trash', icon: Trash2 },
    ]
  },
  { label: '媒体库', href: '/admin/media', icon: ImageIcon },
  { label: '站点设置', href: '/admin/settings', icon: Globe },
  { label: '系统设置', href: '/admin/system', icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['文章']); // 默认展开文章菜单

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  /**
   * 切换菜单展开状态
   * @param label 菜单项标签
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

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1D2129] text-white rounded-md shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 bg-gradient-to-b from-[#EBF2FF] to-[#F5F7FA] text-[#1D2129] z-40 transition-transform duration-300 ease-in-out flex flex-col w-64 border-r border-[#E5E8EF]/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1D2129] tracking-tight">管理后台</h1>
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="text-[#86909C] hover:text-[#1D2129] transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isMenuOpen = openMenus.includes(item.label);
            const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
            
            // 如果有子项目，检查子项目是否处于激活状态
            const isChildActive = hasChildren && item.children?.some(child => pathname === child.href);

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
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
                      <span className="text-[14px]">{item.label}</span>
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
                      {item.children?.map((child) => {
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
                key={item.href}
                href={item.href || '#'}
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
                <span className="text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#1D2129]/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full relative z-10 animate-in zoom-in-95 fade-in duration-300">
            <h3 className="text-lg font-semibold text-[#1D2129] mb-2">确认退出</h3>
            <p className="text-[#4E5969] mb-6">您确定要退出登录吗？</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5F7FA] text-[#4E5969] font-medium hover:bg-[#E5E8EF] transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F53F3F] text-white font-medium hover:bg-[#D33030] shadow-lg shadow-red-200 transition-all"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
