'use client';

import { ReactNode } from 'react';

interface BlogHeaderProps {
  title: string;
  description: string;
  extra?: ReactNode;
}

/**
 * 博客列表页面头部组件
 * @param props - 头部相关的属性
 * @returns 头部渲染结果
 */
export function BlogHeader({ title, description, extra }: BlogHeaderProps) {
  return (
    <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">{title}</h1>
        <p className="text-[#86909C] mt-1 text-sm">{description}</p>
      </div>
      {extra && (
        <div className="flex items-center gap-2">
          {extra}
        </div>
      )}
    </div>
  );
}
