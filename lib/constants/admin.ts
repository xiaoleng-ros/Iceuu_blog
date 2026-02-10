import { LayoutDashboard, FileText, List, PlusCircle, FileEdit, Trash2, Image as ImageIcon, Globe, UserCog } from 'lucide-react';

/**
 * 管理后台侧边栏导航配置
 */
export const ADMIN_NAV_ITEMS = [
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
