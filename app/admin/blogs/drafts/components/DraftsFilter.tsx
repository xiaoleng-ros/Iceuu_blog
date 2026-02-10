'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { XCircle, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const CustomDateRangePicker = dynamic(() => import('@/components/admin/pages/CustomDateRangePicker').then(mod => mod.CustomDateRangePicker), { ssr: false });
const CustomSelect = dynamic(() => import('@/components/admin/pages/CustomSelect').then(mod => mod.CustomSelect), { ssr: false });

interface DraftsFilterProps {
  filterTitle: string;
  setFilterTitle: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterTag: string;
  setFilterTag: (val: string) => void;
  filterDateRange: { start: string; end: string };
  setFilterDateRange: (val: { start: string; end: string }) => void;
  categories: string[];
  tags: string[];
  onFilter: () => void;
  onReset: () => void;
}

/**
 * 草稿箱筛选器组件
 * @param props - 筛选器相关的属性
 * @returns 筛选器渲染结果
 */
export function DraftsFilter({
  filterTitle,
  setFilterTitle,
  filterCategory,
  setFilterCategory,
  filterTag,
  setFilterTag,
  filterDateRange,
  setFilterDateRange,
  categories,
  tags,
  onFilter,
  onReset
}: DraftsFilterProps) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white relative z-20">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
          <div className="flex items-center gap-2 w-full sm:w-[180px]">
            <span className="text-[#4E5969] text-sm whitespace-nowrap min-w-[32px]">标题:</span>
            <div className="relative w-full">
              <Input 
                placeholder="请输入关键词" 
                className="h-8 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-[#165DFF]/10 transition-all text-xs rounded-lg w-full pr-7"
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onFilter()}
              />
              {filterTitle && (
                <button 
                  onClick={() => { setFilterTitle(''); setTimeout(onFilter, 0); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C9CDD4] hover:text-[#86909C] transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="w-full sm:w-[140px]">
            <CustomSelect label="分类" placeholder="请选择分类" value={filterCategory} onChange={setFilterCategory} options={categories} />
          </div>
          <div className="w-full sm:w-[140px]">
            <CustomSelect label="标签" placeholder="请选择标签" value={filterTag} onChange={setFilterTag} options={tags} />
          </div>
          <div className="flex-1 min-w-[300px]">
            <CustomDateRangePicker label="保存时间" value={filterDateRange} onChange={setFilterDateRange} />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              onClick={onFilter} 
              className="h-8 px-4 text-xs bg-[#E8F3FF] text-[#165DFF] hover:bg-[#D1E9FF] border border-[#165DFF]/10 rounded-lg transition-all flex items-center gap-1.5 shadow-none font-bold"
            >
              搜索
            </Button>
            <Button 
              variant="outline" 
              onClick={onReset} 
              className="h-8 px-4 text-xs border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] rounded-lg shadow-none flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
