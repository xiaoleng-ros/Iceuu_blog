'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Image as ImageIcon, Eye, Clock } from 'lucide-react';
import Link from 'next/link';

/**
 * 仪表盘主内容组件
 * 已从 page.tsx 抽离，以便通过 dynamic(ssr: false) 导入，减小服务端 Worker 体积
 */
export function DashboardContent() {
  const [stats, setStats] = useState({
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

        // 获取所有非删除文章
        const postsRes = await fetch('/api/blog?limit=2000', { headers }); 
        const postsJson = await postsRes.json();
        const activePosts = postsJson.data || [];

        // 获取回收站文章
        const trashRes = await fetch('/api/blog?limit=2000&status=deleted', { headers });
        const trashJson = await trashRes.json();
        const trashPosts = trashJson.data || [];
        
        // 获取媒体数量
        const mediaRes = await fetch('/api/media', { headers });
        const mediaJson = await mediaRes.json();
        
        setStats({
          totalPosts: activePosts.length,
          publishedPosts: activePosts.filter((p: any) => !p.draft).length,
          draftPosts: activePosts.filter((p: any) => p.draft).length,
          trashPosts: trashPosts.length,
          totalMedia: (mediaJson.data || []).length,
        });
      } catch (error) {
        console.error('获取仪表盘统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5]">
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">仪表盘</h1>
        <p className="text-[#86909C] mt-1 text-sm">欢迎回来，这里是您的博客概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 文章总数卡片 */}
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-[#E8F3FF] to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-5">
            <CardTitle className="text-sm font-medium text-[#4E5969]">文章总数</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-[#165DFF]/10 flex items-center justify-center transition-colors group-hover:bg-[#165DFF] group-hover:text-white">
              <FileText className="h-4.5 w-4.5 text-[#165DFF] group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-[#1D2129] mb-0.5">{loading ? '-' : stats.totalPosts}</div>
            <p className="text-xs text-[#86909C]">累计创作内容</p>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <FileText size={70} />
            </div>
          </CardContent>
        </Card>

        {/* 已发布卡片 */}
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-[#E8FFEA] to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-5">
            <CardTitle className="text-sm font-medium text-[#4E5969]">已发布</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-[#36D399]/10 flex items-center justify-center transition-colors group-hover:bg-[#36D399] group-hover:text-white">
              <Eye className="h-4.5 w-4.5 text-[#36D399] group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-[#1D2129] mb-0.5">{loading ? '-' : stats.publishedPosts}</div>
            <p className="text-xs text-[#86909C]">公开可见的文章</p>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Eye size={70} />
            </div>
          </CardContent>
        </Card>

        {/* 草稿箱卡片 */}
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-[#FFF7E8] to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-5">
            <CardTitle className="text-sm font-medium text-[#4E5969]">草稿箱</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-[#FFAB00]/10 flex items-center justify-center transition-colors group-hover:bg-[#FFAB00] group-hover:text-white">
              <Clock className="h-4.5 w-4.5 text-[#FFAB00] group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-[#1D2129] mb-0.5">{loading ? '-' : stats.draftPosts}</div>
            <p className="text-xs text-[#86909C]">待编辑或发布</p>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Clock size={70} />
            </div>
          </CardContent>
        </Card>

        {/* 媒体资源卡片 */}
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-[#F5F2FF] to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-5">
            <CardTitle className="text-sm font-medium text-[#4E5969]">媒体资源</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-[#926BFF]/10 flex items-center justify-center transition-colors group-hover:bg-[#926BFF] group-hover:text-white">
              <ImageIcon className="h-4.5 w-4.5 text-[#926BFF] group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-[#1D2129] mb-0.5">{loading ? '-' : stats.totalMedia}</div>
            <p className="text-xs text-[#86909C]">图片与文件</p>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <ImageIcon size={70} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
          <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-3 px-6">
            <CardTitle className="text-base font-bold text-[#1D2129] flex items-center gap-2">
              <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 p-5">
            <Link href="/admin/blogs/new" className="flex flex-col items-center justify-center p-6 bg-[#F8FAFF] rounded-[16px] border border-[#EBF2FF] hover:bg-white hover:shadow-[0_8px_24px_rgba(22,93,255,0.08)] hover:border-[#165DFF]/20 hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-[#165DFF] p-3.5 rounded-2xl mb-3 shadow-[0_8px_16px_rgba(22,93,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-[#1D2129] text-base">撰写新文章</span>
              <span className="text-xs text-[#86909C] mt-1.5">开启新的灵感与创作</span>
            </Link>
            
            <Link href="/admin/media" className="flex flex-col items-center justify-center p-6 bg-[#FBF9FF] rounded-[16px] border border-[#F5F2FF] hover:bg-white hover:shadow-[0_8px_24px_rgba(146,107,255,0.08)] hover:border-[#926BFF]/20 hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-[#926BFF] p-3.5 rounded-2xl mb-3 shadow-[0_8px_16px_rgba(146,107,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-[#1D2129] text-base">上传图片</span>
              <span className="text-xs text-[#86909C] mt-1.5">丰富您的媒体资源库</span>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-3 border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
          <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-3 px-6">
            <CardTitle className="text-base font-bold text-[#1D2129] flex items-center gap-2">
              <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#F2F3F5]">
              <div className="flex justify-between items-center p-4 hover:bg-[#F9FBFF] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-lg">⚛️</div>
                  <div>
                    <p className="text-[#1D2129] font-bold text-sm">Next.js 版本</p>
                    <p className="text-[#86909C] text-[11px]">框架核心引擎</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-gray-100 rounded-full font-mono text-[#1D2129] font-bold text-[11px]">14.x</span>
              </div>
              <div className="flex justify-between items-center p-4 hover:bg-[#F9FBFF] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-lg">🗄️</div>
                  <div>
                    <p className="text-[#1D2129] font-bold text-sm">数据库</p>
                    <p className="text-[#86909C] text-[11px]">云端实时同步</p>
                  </div>
                </div>
                <span className="text-[#36D399] flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#36D399] animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center p-4 hover:bg-[#F9FBFF] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-lg">🖼️</div>
                  <div>
                    <p className="text-[#1D2129] font-bold text-sm">图片存储</p>
                    <p className="text-[#86909C] text-[11px]">CDN加速分发</p>
                  </div>
                </div>
                <span className="text-[#165DFF] text-[11px] font-bold bg-blue-50 px-2.5 py-0.5 rounded-full">GitHub + jsDelivr</span>
              </div>
              <div className="p-4 bg-gray-50/50">
                <div className="flex items-center justify-center gap-2 text-[#86909C]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-[11px] font-medium">系统所有服务运行正常</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
