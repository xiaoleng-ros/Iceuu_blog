'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { useSiteStore } from '@/lib/store/useSiteStore';
import IconCloud from './IconCloud';
import { useState, useEffect } from 'react';

/**
 * 侧边栏组件
 * 展示博主个人资料、社交媒体链接、运行统计以及 3D 标签云
 * 站点配置信息从 useSiteStore 全局状态中获取，确保跨页面同步
 * @returns {JSX.Element} - 返回侧边栏组件 JSX
 */
export default function Sidebar() {
  // 从全局 Store 中获取站点配置
  const config = useSiteStore((state) => state.config);
  const [svgIcons, setSvgIcons] = useState<string[]>([]);
  
  // 自动获取图标列表
  useEffect(() => {
    /**
     * 从 API 获取所有 SVG 图标列表
     * @returns {Promise<void>}
     */
    const fetchIcons = async () => {
      try {
        const res = await fetch('/api/icons');
        const data = await res.json();
        if (Array.isArray(data)) {
          setSvgIcons(data);
        }
      } catch (err) {
        console.error('获取图标列表失败:', err);
      }
    };
    
    fetchIcons();
  }, []);
  
  // Calculate days running from config or fallback date
  const startDateStr = config.site_start_date || '2024-01-01';
  const startDate = new Date(startDateStr);
  const daysRunning = Math.max(0, Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
        <div className="h-24 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative">
              <Image 
                src={config.avatar_url || 'https://github.com/shadcn.png'} 
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
        <CardContent className="pt-12 pb-6 flex flex-col items-center">
          <h3 className="font-bold text-lg text-gray-900 text-center">
            {config.site_name || '赵阿卷'}
          </h3>
          <p className="text-sm text-gray-500 mt-2 px-4 text-center break-words max-w-full">
            {(config.intro || '写代码，爱生活').trim()}
          </p>
          
          {/* 社交账号模块 */}
          <div className="w-full mt-6 px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <span className="text-[12px] font-medium text-gray-400 tracking-wider">社交账号</span>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            
            <div className="flex justify-center items-center gap-4">
              {config.github_url && (
                <a 
                  href={config.github_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 hover:bg-black/10 transition-all duration-300"
                  title="GitHub"
                >
                  <Image src="/svg/github.svg" alt="GitHub" width={20} height={20} className="transition-transform group-hover:scale-110" />
                </a>
              )}
              {config.gitee_url && (
                <a 
                  href={config.gitee_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 hover:bg-[#c71d23]/10 transition-all duration-300"
                  title="Gitee"
                >
                  <Image src="/svg/gitee.svg" alt="Gitee" width={20} height={20} className="transition-transform group-hover:scale-110" />
                </a>
              )}
              {config.wechat_url && (
                <a 
                  href={config.wechat_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 hover:bg-[#07c160]/10 transition-all duration-300"
                  title="微信"
                >
                  <Image src="/svg/weixin.svg" alt="微信" width={20} height={20} className="transition-transform group-hover:scale-110" />
                </a>
              )}
              {config.douyin_url && (
                <a 
                  href={config.douyin_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 hover:bg-black/5 transition-all duration-300"
                  title="抖音"
                >
                  <Image src="/svg/抖音.svg" alt="抖音" width={20} height={20} className="transition-transform group-hover:scale-110" />
                </a>
              )}
              {config.qq_url && (
                <a 
                  href={config.qq_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 hover:bg-[#12b7f5]/10 transition-all duration-300"
                  title="QQ"
                >
                  <Image src="/svg/QQ.svg" alt="QQ" width={20} height={20} className="transition-transform group-hover:scale-110" />
                </a>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="border-none shadow-sm bg-white rounded-2xl p-5">
        <div className="flex items-center justify-center">
           <div className="flex-1 text-center">
             <div className="text-[13px] text-[#86909C] mb-1.5 font-medium">站点运行</div>
             <div className="text-xl font-bold text-[#1D2129] tracking-tight">
               {daysRunning} <span className="text-sm font-semibold ml-0.5">天</span>
             </div>
           </div>
        </div>
      </Card>

      {/* Icon Cloud (3D Tag Cloud) */}
      <Card className="border-none shadow-sm bg-white rounded-2xl">
        <CardHeader className="pb-3 border-b border-gray-50 px-5 pt-5">
          <CardTitle className="text-sm font-bold flex items-center justify-center gap-2 text-blue-500">
            <GraduationCap className="w-5 h-5" /> 学无止境
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 flex justify-center items-center min-h-[240px]">
          <IconCloud icons={svgIcons} />
        </CardContent>
      </Card>
    </div>
  );
}
