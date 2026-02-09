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
 * @returns {JSX.Element} - 返回侧边栏组件 JSX
 */
export default function Sidebar() {
  const config = useSiteStore((state) => state.config);
  const [svgIcons, setSvgIcons] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const res = await fetch('/api/icons');
        const data = await res.json();
        if (Array.isArray(data)) setSvgIcons(data);
      } catch (err) {
        console.error('获取图标列表失败:', err);
      }
    };
    fetchIcons();
  }, []);
  
  const startDateStr = config.site_start_date || '2024-01-01';
  const daysRunning = Math.max(0, Math.floor((new Date().getTime() - new Date(startDateStr).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      <ProfileCard config={config} />
      <StatsCard daysRunning={daysRunning} />
      <SkillsCard icons={svgIcons} />
    </div>
  );
}

/**
 * 个人信息卡片组件
 */
function ProfileCard({ config }: { config: any }) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
      <div className="h-24 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative">
            <Image src={config.avatar_url || 'https://github.com/shadcn.png'} alt="Profile" fill className="object-cover" unoptimized />
          </div>
        </div>
      </div>
      <CardContent className="pt-12 pb-6 flex flex-col items-center">
        <h3 className="font-bold text-lg text-gray-900 text-center">{config.site_name || '赵阿卷'}</h3>
        <p className="text-sm text-gray-500 mt-2 px-4 text-center break-words max-w-full">{(config.intro || '写代码，爱生活').trim()}</p>
        <SocialLinks config={config} />
      </CardContent>
    </Card>
  );
}

/**
 * 社交链接组件
 */
function SocialLinks({ config }: { config: any }) {
  const socials = [
    { key: 'github_url', icon: 'github.svg', title: 'GitHub', color: 'hover:bg-black/10' },
    { key: 'gitee_url', icon: 'gitee.svg', title: 'Gitee', color: 'hover:bg-[#c71d23]/10' },
    { key: 'wechat_url', icon: 'weixin.svg', title: '微信', color: 'hover:bg-[#07c160]/10' },
    { key: 'douyin_url', icon: '抖音.svg', title: '抖音', color: 'hover:bg-black/5' },
    { key: 'qq_url', icon: 'QQ.svg', title: 'QQ', color: 'hover:bg-[#12b7f5]/10' },
  ];

  return (
    <div className="w-full mt-6 px-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-[1px] flex-1 bg-gray-100"></div>
        <span className="text-[12px] font-medium text-gray-400 tracking-wider">社交账号</span>
        <div className="h-[1px] flex-1 bg-gray-100"></div>
      </div>
      <div className="flex justify-center items-center gap-4">
        {socials.map(social => config[social.key] && (
          <a 
            key={social.key} 
            href={config[social.key]} 
            target="_blank" 
            rel="noreferrer" 
            className={`group relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 transition-all duration-300 ${social.color}`}
            title={social.title}
          >
            <Image src={`/svg/${social.icon}`} alt={social.title} width={20} height={20} className="transition-transform group-hover:scale-110" />
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * 站点统计卡片组件
 */
function StatsCard({ daysRunning }: { daysRunning: number }) {
  return (
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
  );
}

/**
 * 技能云卡片组件
 */
function SkillsCard({ icons }: { icons: string[] }) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl">
      <CardHeader className="pb-3 border-b border-gray-50 px-5 pt-5">
        <CardTitle className="text-sm font-bold flex items-center justify-center gap-2 text-blue-500">
          <GraduationCap className="w-5 h-5" /> 学无止境
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex justify-center items-center min-h-[240px]">
        <IconCloud icons={icons} />
      </CardContent>
    </Card>
  );
}
