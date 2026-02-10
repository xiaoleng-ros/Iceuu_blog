'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

/**
 * 仪表盘系统状态组件
 * @returns {JSX.Element}
 */
export function SystemStatus() {
  return (
    <Card className="col-span-3 border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
      <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-3 px-6">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center gap-2">
          <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
          系统状态
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#F2F3F5]">
          <SystemStatusItem 
            emoji="⚛️" 
            title="Next.js 版本" 
            desc="框架核心引擎" 
            tag="14.x" 
            tagBg="bg-gray-100" 
            tagColor="text-[#1D2129]" 
          />
          <SystemStatusItem 
            emoji="🗄️" 
            title="数据库" 
            desc="云端实时同步" 
            tag="Connected" 
            tagBg="bg-emerald-50" 
            tagColor="text-[#36D399]" 
            isStatus
          />
          <SystemStatusItem 
            emoji="🖼️" 
            title="图片存储" 
            desc="CDN加速分发" 
            tag="GitHub + jsDelivr" 
            tagBg="bg-blue-50" 
            tagColor="text-[#165DFF]" 
          />
          
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
  );
}

interface SystemStatusItemProps {
  emoji: string;
  title: string;
  desc: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  isStatus?: boolean;
}

function SystemStatusItem({ emoji, title, desc, tag, tagBg, tagColor, isStatus }: SystemStatusItemProps) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-[#F9FBFF] transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${isStatus ? 'bg-emerald-50' : tagBg === 'bg-blue-50' ? 'bg-blue-50' : 'bg-gray-50'}`}>{emoji}</div>
        <div>
          <p className="text-[#1D2129] font-bold text-sm">{title}</p>
          <p className="text-[#86909C] text-[11px]">{desc}</p>
        </div>
      </div>
      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${tagBg} ${tagColor} flex items-center gap-1.5`}>
        {isStatus && <span className="w-1.5 h-1.5 rounded-full bg-[#36D399] animate-pulse" />}
        {tag}
      </span>
    </div>
  );
}
