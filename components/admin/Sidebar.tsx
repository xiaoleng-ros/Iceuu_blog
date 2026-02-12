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
 * 移动端切换按钮组件
 */
function MobileToggleButton({
  isOpen,
  onToggle
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button 
      className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-br from-[#7EB6E8] to-[#FFB5C5] text-white rounded-2xl shadow-lg shadow-[#7EB6E8]/20 backdrop-blur-sm border border-white/20"
      onClick={onToggle}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}

/**
 * 移动端遮罩层组件
 */
function MobileOverlay({
  visible,
  onClose
}: {
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-[#7EB6E8]/20 to-[#FFB5C5]/20 z-30 backdrop-blur-md transition-opacity"
      onClick={onClose}
    />
  );
}

/**
 * 侧边栏背景装饰组件
 * 包含渐变背景、云朵和樱花装饰
 */
function SidebarBackground() {
  return (
    <>
      {/* 背景层 - 日系渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F8] via-[#F8FCFF] to-[#F5FFF8]" />
      
      {/* 装饰性云朵背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-10 w-32 h-16 bg-white/40 rounded-full blur-xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 -right-5 w-24 h-12 bg-white/30 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-5 w-20 h-10 bg-white/35 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* 樱花装饰 */}
      <div className="absolute top-8 right-4 text-[#FFB5C5]/40 text-2xl animate-sparkle">✿</div>
      <div className="absolute top-32 right-8 text-[#7EB6E8]/30 text-lg animate-sparkle" style={{ animationDelay: '0.5s' }}>✿</div>
      <div className="absolute bottom-32 left-6 text-[#C9A8E0]/30 text-xl animate-sparkle" style={{ animationDelay: '1s' }}>✿</div>
      
      {/* 边框装饰 */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#FFB5C5]/30 to-transparent" />
    </>
  );
}

/**
 * 侧边栏标题区域组件
 */
function SidebarHeader({
  isMobile,
  onClose
}: {
  isMobile: boolean;
  onClose: () => void;
}) {
  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7EB6E8] to-[#FFB5C5] flex items-center justify-center shadow-lg shadow-[#7EB6E8]/20">
          <span className="text-white text-sm font-bold">✦</span>
        </div>
        <h1 className="text-lg font-medium text-[#4A4A4A] tracking-wide">管理后台</h1>
      </div>
      {isMobile && (
        <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#7EB6E8] transition-colors p-1.5 rounded-xl hover:bg-white/50">
          <X size={18} />
        </button>
      )}
    </div>
  );
}

/**
 * 侧边栏导航菜单组件
 */
function SidebarNav({
  pathname,
  openMenus,
  toggleMenu
}: {
  pathname: string;
  openMenus: string[];
  toggleMenu: (label: string) => void;
}) {
  return (
    <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
      {navItems.map((item, index) => (
        <div 
          key={item.label} 
          className="animate-slide-up-fade" 
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <SidebarNavItem 
            label={item.label}
            href={item.href}
            icon={item.icon}
            subItems={item.subItems}
            pathname={pathname}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
          />
        </div>
      ))}
    </nav>
  );
}

/**
 * 侧边栏底部装饰组件
 */
function SidebarFooter() {
  return (
    <div className="p-4">
      <div className="h-px bg-gradient-to-r from-transparent via-[#FFB5C5]/30 to-transparent" />
      <p className="text-center text-xs text-[#9B9B9B]/60 mt-3 font-light tracking-wider">
        ✧ 日系动漫风 ✧
      </p>
    </div>
  );
}

/**
 * 管理后台侧边栏组件
 * 提供导航菜单、移动端适配以及退出登录功能
 * 采用日系动漫风格设计，柔和渐变与梦幻光影
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
      <MobileToggleButton isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      
      <MobileOverlay visible={isMobile && isOpen} onClose={() => setIsOpen(false)} />

      {/* 侧边栏容器 */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 z-40 transition-transform duration-500 ease-out flex flex-col w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarBackground />
        
        {/* 内容层 */}
        <div className="relative z-10 flex flex-col h-full">
          <SidebarHeader isMobile={isMobile} onClose={() => setIsOpen(false)} />
          <SidebarNav pathname={pathname} openMenus={openMenus} toggleMenu={toggleMenu} />
          <SidebarFooter />
        </div>
      </div>

      {/* 退出确认弹窗 */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
}
