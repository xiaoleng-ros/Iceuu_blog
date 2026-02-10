'use client';
import { LayoutDashboard, FileText, Image as ImageIcon, Menu, X, Globe, UserCog, List, PlusCircle, FileEdit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from './SidebarNavItem';
import { LogoutModal } from './LogoutModal';
import { useSidebar } from './useSidebar';

const navItems = [
  { label: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
  { 
    label: '文章', 
    icon: FileText,
    subItems: [
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

/**
 * 管理后台侧边栏组件
 * 提供导航菜单、移动端适配以及退出登录功能
 * @returns {JSX.Element}
 */
export default function Sidebar() {
  const {
    isOpen,
    setIsOpen,
    isMobile,
    pathname,
    openMenus,
    toggleMenu,
    showLogoutModal,
    setShowLogoutModal,
    handleLogout
  } = useSidebar();

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
          {navItems.map((item) => (
            <SidebarNavItem 
              key={item.label}
              label={item.label}
              href={item.href}
              icon={item.icon}
              subItems={item.subItems}
              pathname={pathname}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
            />
          ))}
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
}
