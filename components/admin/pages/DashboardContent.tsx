'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Image as ImageIcon, Eye, Clock } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  trashPosts: number;
  totalMedia: number;
}

interface DashboardPost {
  draft: boolean;
  [key: string]: unknown;
}

/**
 * 仪表盘统计卡片组件
 * 采用日系动漫风格设计，马卡龙色系与柔和光影
 * @param {Object} props - 组件参数
 * @param {string} props.title - 卡片标题
 * @param {number|string} props.value - 统计数值
 * @param {string} props.description - 描述文本
 * @param {React.ReactNode} props.icon - 图标
 * @param {string} props.gradientClass - 背景渐变样式类
 * @param {string} props.iconBgClass - 图标背景样式类
 * @param {string} props.iconColorClass - 图标颜色样式类
 * @param {string} props.accentColor - 强调色
 * @returns {JSX.Element} - 返回统计卡片 JSX
 */
function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  gradientClass, 
  iconBgClass, 
  iconColorClass,
  accentColor
}: { 
  title: string; 
  value: number | string; 
  description: string; 
  icon: React.ElementType; 
  gradientClass: string;
  iconBgClass: string;
  iconColorClass: string;
  accentColor: string;
}) {
  return (
    <Card className={cn(
      "border-0 rounded-3xl relative overflow-hidden group transition-all duration-500",
      "hover:shadow-[0_20px_50px_rgba(126,182,232,0.15)] hover:-translate-y-2",
      gradientClass
    )}>
      {/* 装饰性背景图案 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      </div>
      
      {/* 顶部装饰线 */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", accentColor)} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6 relative z-10">
        <CardTitle className="text-sm font-medium text-[#6B6B6B]">{title}</CardTitle>
        <div className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300",
          "group-hover:scale-110 group-hover:shadow-lg",
          iconBgClass
        )}>
          <Icon className={cn("h-5 w-5 transition-colors", iconColorClass)} />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 relative z-10">
        <div className="text-4xl font-bold text-[#4A4A4A] mb-1 tracking-tight">{value}</div>
        <p className="text-xs text-[#9B9B9B] font-light">{description}</p>
      </CardContent>
      
      {/* 底部装饰图标 */}
      <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
        <Icon size={100} />
      </div>
    </Card>
  );
}

/**
 * 快速操作组件
 * 采用日系动漫风格设计
 * @returns {JSX.Element} - 返回快速操作卡片 JSX
 */
function QuickActions() {
  return (
    <Card className="col-span-4 border-0 rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden shadow-[0_4px_30px_rgba(126,182,232,0.08)]">
      {/* 顶部装饰渐变 */}
      <div className="h-1 bg-gradient-to-r from-[#7EB6E8] via-[#FFB5C5] to-[#C9A8E0]" />
      
      <CardHeader className="border-b border-[#F5F5F5] bg-gradient-to-r from-[#FFF5F8]/50 to-[#F8FCFF]/50 py-4 px-6">
        <CardTitle className="text-base font-medium text-[#4A4A4A] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7EB6E8] to-[#FFB5C5] flex items-center justify-center shadow-lg shadow-[#7EB6E8]/20">
            <span className="text-white text-sm">✦</span>
          </div>
          快速操作
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2 p-6">
        <Link 
          href="/admin/blogs/new" 
          className="group flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#F0F8FF] to-[#FFF5F8] rounded-2xl border border-[#7EB6E8]/10 hover:border-[#7EB6E8]/30 hover:shadow-[0_12px_40px_rgba(126,182,232,0.12)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden"
        >
          {/* 悬浮光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <div className="bg-gradient-to-br from-[#7EB6E8] to-[#5A9BD5] p-4 rounded-2xl mb-4 shadow-lg shadow-[#7EB6E8]/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#7EB6E8]/30 transition-all duration-300">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <span className="font-medium text-[#4A4A4A] text-base mb-1">撰写新文章</span>
          <span className="text-xs text-[#9B9B9B]">开启新的灵感与创作</span>
        </Link>
        
        <Link 
          href="/admin/media" 
          className="group flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#FAF5FF] to-[#FFF5F8] rounded-2xl border border-[#C9A8E0]/10 hover:border-[#C9A8E0]/30 hover:shadow-[0_12px_40px_rgba(201,168,224,0.12)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden"
        >
          {/* 悬浮光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <div className="bg-gradient-to-br from-[#C9A8E0] to-[#B794D4] p-4 rounded-2xl mb-4 shadow-lg shadow-[#C9A8E0]/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#C9A8E0]/30 transition-all duration-300">
            <ImageIcon className="h-7 w-7 text-white" />
          </div>
          <span className="font-medium text-[#4A4A4A] text-base mb-1">上传图片</span>
          <span className="text-xs text-[#9B9B9B]">丰富您的媒体资源库</span>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * 系统状态组件
 * 采用日系动漫风格设计
 * @returns {JSX.Element} - 返回系统状态卡片 JSX
 */
function SystemStatus() {
  return (
    <Card className="col-span-3 border-0 rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden shadow-[0_4px_30px_rgba(126,182,232,0.08)]">
      {/* 顶部装饰渐变 */}
      <div className="h-1 bg-gradient-to-r from-[#98D8AA] via-[#7EB6E8] to-[#FFD699]" />
      
      <CardHeader className="border-b border-[#F5F5F5] bg-gradient-to-r from-[#F5FFF8]/50 to-[#FFF8F0]/50 py-4 px-6">
        <CardTitle className="text-base font-medium text-[#4A4A4A] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#98D8AA] to-[#7EB6E8] flex items-center justify-center shadow-lg shadow-[#98D8AA]/20">
            <span className="text-white text-sm">◈</span>
          </div>
          系统状态
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#F5F5F5]">
          <div className="flex justify-between items-center p-5 hover:bg-gradient-to-r hover:from-[#F0F8FF]/50 hover:to-transparent transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8F4FC] to-[#FFF5F8] flex items-center justify-center text-lg shadow-sm">⚛️</div>
              <div>
                <p className="text-[#4A4A4A] font-medium text-sm">Next.js 版本</p>
                <p className="text-[#9B9B9B] text-[11px]">框架核心引擎</p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#F0F8FF] to-[#FFF5F8] rounded-xl font-mono text-[#7EB6E8] font-medium text-xs border border-[#7EB6E8]/10">14.x</span>
          </div>
          
          <div className="flex justify-between items-center p-5 hover:bg-gradient-to-r hover:from-[#F5FFF8]/50 hover:to-transparent transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0FFF4] to-[#E8F4FC] flex items-center justify-center text-lg shadow-sm">🗄️</div>
              <div>
                <p className="text-[#4A4A4A] font-medium text-sm">数据库</p>
                <p className="text-[#9B9B9B] text-[11px]">云端实时同步</p>
              </div>
            </div>
            <span className="text-[#98D8AA] flex items-center gap-2 text-xs font-medium bg-gradient-to-r from-[#F0FFF4] to-[#E8F4FC] px-3 py-1.5 rounded-xl border border-[#98D8AA]/20">
              <span className="w-2 h-2 rounded-full bg-[#98D8AA] animate-pulse" />
              Connected
            </span>
          </div>
          
          <div className="flex justify-between items-center p-5 hover:bg-gradient-to-r hover:from-[#FFF8F0]/50 hover:to-transparent transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF8F0] to-[#FAF5FF] flex items-center justify-center text-lg shadow-sm">🖼️</div>
              <div>
                <p className="text-[#4A4A4A] font-medium text-sm">图片存储</p>
                <p className="text-[#9B9B9B] text-[11px]">CDN加速分发</p>
              </div>
            </div>
            <span className="text-[#FFD699] text-xs font-medium bg-gradient-to-r from-[#FFF8F0] to-[#FAF5FF] px-3 py-1.5 rounded-xl border border-[#FFD699]/20">GitHub + jsDelivr</span>
          </div>
          
          <div className="p-5 bg-gradient-to-r from-[#F5FFF8]/30 to-[#FFF5F8]/30">
            <div className="flex items-center justify-center gap-3 text-[#98D8AA]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#98D8AA] opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#98D8AA]"></span>
              </span>
              <p className="text-xs font-medium">系统所有服务运行正常 ✧</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 获取仪表盘统计数据的 Hook
 * @returns {Object} - 返回统计数据和加载状态
 */
function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    trashPosts: 0,
    totalMedia: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const headers = { Authorization: `Bearer ${session.access_token}` };

        const postsRes = await fetch('/api/blog?limit=2000', { headers }); 
        const postsJson = await postsRes.json();
        const activePosts: DashboardPost[] = postsJson.data || [];

        const trashRes = await fetch('/api/blog?limit=2000&status=deleted', { headers });
        const trashJson = await trashRes.json();
        const trashPosts = trashJson.data || [];
        
        const mediaRes = await fetch('/api/media', { headers });
        const mediaJson = await mediaRes.json();
        
        setStats({
          totalPosts: activePosts.length,
          publishedPosts: activePosts.filter((p: DashboardPost) => !p.draft).length,
          draftPosts: activePosts.filter((p: DashboardPost) => p.draft).length,
          trashPosts: trashPosts.length,
          totalMedia: (mediaJson.data || []).length,
        });
      } catch (_error) {
        console.error('获取仪表盘统计数据失败:', _error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

/**
 * 仪表盘主内容组件
 * 采用日系动漫风格设计，马卡龙色系与治愈美学
 */
export function DashboardContent() {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 页面标题 */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_4px_30px_rgba(126,182,232,0.06)] border border-white/50 relative overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#7EB6E8]/10 to-[#FFB5C5]/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <h1 className="text-2xl font-medium text-[#4A4A4A] tracking-wide">仪表盘</h1>
          <p className="text-[#9B9B9B] mt-1 text-sm">欢迎回来，这里是您的博客概览 ✧</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="文章总数" 
          value={loading ? '-' : stats.totalPosts} 
          description="累计创作内容" 
          icon={FileText} 
          gradientClass="bg-gradient-to-br from-[#E8F4FC] via-white to-[#FFF5F8]"
          iconBgClass="bg-gradient-to-br from-[#7EB6E8] to-[#5A9BD5]"
          iconColorClass="text-white"
          accentColor="bg-gradient-to-r from-[#7EB6E8] to-[#5A9BD5]"
        />
        <StatCard 
          title="已发布" 
          value={loading ? '-' : stats.publishedPosts} 
          description="公开可见的文章" 
          icon={Eye} 
          gradientClass="bg-gradient-to-br from-[#E8FFF0] via-white to-[#F0FFF4]"
          iconBgClass="bg-gradient-to-br from-[#98D8AA] to-[#7BC98E]"
          iconColorClass="text-white"
          accentColor="bg-gradient-to-r from-[#98D8AA] to-[#7BC98E]"
        />
        <StatCard 
          title="草稿箱" 
          value={loading ? '-' : stats.draftPosts} 
          description="待编辑或发布" 
          icon={Clock} 
          gradientClass="bg-gradient-to-br from-[#FFF8E8] via-white to-[#FFF5F0]"
          iconBgClass="bg-gradient-to-br from-[#FFD699] to-[#FFC966]"
          iconColorClass="text-white"
          accentColor="bg-gradient-to-r from-[#FFD699] to-[#FFC966]"
        />
        <StatCard 
          title="媒体资源" 
          value={loading ? '-' : stats.totalMedia} 
          description="图片与文件" 
          icon={ImageIcon} 
          gradientClass="bg-gradient-to-br from-[#F5F0FF] via-white to-[#FAF5FF]"
          iconBgClass="bg-gradient-to-br from-[#C9A8E0] to-[#B794D4]"
          iconColorClass="text-white"
          accentColor="bg-gradient-to-r from-[#C9A8E0] to-[#B794D4]"
        />
      </div>

      {/* 快速操作与系统状态 */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
        <QuickActions />
        <SystemStatus />
      </div>
    </div>
  );
}
