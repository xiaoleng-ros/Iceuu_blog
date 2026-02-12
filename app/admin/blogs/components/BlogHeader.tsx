'use client';

import { ReactNode } from 'react';

interface BlogHeaderProps {
  title: string;
  description: string;
  extra?: ReactNode;
}

/**
 * 博客列表页面头部组件
 * 采用日系动漫风格设计
 * @param props - 头部相关的属性
 * @returns 头部渲染结果
 */
export function BlogHeader({ title, description, extra }: BlogHeaderProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_4px_30px_rgba(126,182,232,0.06)] border border-white/50 flex justify-between items-center relative overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7EB6E8]/10 to-[#FFB5C5]/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#C9A8E0]/10 to-transparent rounded-full blur-xl" />
      
      <div className="relative z-10">
        <h1 className="text-2xl font-medium text-[#4A4A4A] tracking-wide">{title}</h1>
        <p className="text-[#9B9B9B] mt-1 text-sm">{description}</p>
      </div>
      {extra && (
        <div className="flex items-center gap-3 relative z-10">
          {extra}
        </div>
      )}
    </div>
  );
}
