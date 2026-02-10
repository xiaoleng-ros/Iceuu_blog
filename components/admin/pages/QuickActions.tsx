'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Image as ImageIcon } from 'lucide-react';

/**
 * 仪表盘快速操作组件
 * @returns {JSX.Element}
 */
export function QuickActions() {
  return (
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
  );
}
