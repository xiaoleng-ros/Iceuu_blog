'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const categories = [
  { label: '全部', value: 'all' },
  { label: '文章配图', value: 'post' },
  { label: '头像', value: 'avatar' },
  { label: '站点资源', value: 'site' },
  { label: '其他', value: 'other' },
];

/**
 * 媒体库筛选过滤组件
 * @param props - 组件属性
 * @returns 筛选区域渲染结果
 */
export function MediaFilter({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange
}: MediaFilterProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#F2F3F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onTypeChange(cat.value)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              selectedType === cat.value
                ? "bg-[#E8F3FF] text-[#165DFF] shadow-sm"
                : "text-[#4E5969] hover:bg-[#F2F3F5] hover:text-[#1D2129]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86909C]" />
          <input
            type="text"
            placeholder="搜索文件名..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F2F3F5] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#40A9FF]/20 transition-all placeholder:text-[#86909C]"
          />
        </div>
        <div className="flex items-center bg-[#F2F3F5] p-1 rounded-xl">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === 'grid' ? "bg-white text-[#165DFF] shadow-sm" : "text-[#86909C] hover:text-[#4E5969]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === 'list' ? "bg-white text-[#165DFF] shadow-sm" : "text-[#86909C] hover:text-[#4E5969]"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
