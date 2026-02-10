'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  loading: boolean;
  colorClass: string;
  iconBgClass: string;
  iconColorClass: string;
  gradientClass: string;
}

/**
 * 仪表盘统计卡片组件
 * @param {StatsCardProps} props - 组件属性
 * @returns {JSX.Element}
 */
export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  loading,
  iconBgClass,
  iconColorClass,
  gradientClass
}: StatsCardProps) {
  return (
    <Card className={`border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ${gradientClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-5 pt-5">
        <CardTitle className="text-sm font-medium text-[#4E5969]">{title}</CardTitle>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:bg-opacity-100 ${iconBgClass} group-hover:text-white`}>
          <Icon className={`h-4.5 w-4.5 transition-colors ${iconColorClass} group-hover:text-white`} />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-3xl font-bold text-[#1D2129] mb-0.5">{loading ? '-' : value}</div>
        <p className="text-xs text-[#86909C]">{description}</p>
        <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <Icon size={70} />
        </div>
      </CardContent>
    </Card>
  );
}
