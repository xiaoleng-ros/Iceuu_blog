'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Search, RotateCcw, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const CustomDateRangePicker = dynamic(() => import('@/components/admin/pages/CustomDateRangePicker').then(mod => mod.CustomDateRangePicker), { ssr: false });
const CustomSelect = dynamic(() => import('@/components/admin/pages/CustomSelect').then(mod => mod.CustomSelect), { ssr: false });

/**
 * 博客列表筛选栏组件接口
 */
interface BlogFilterBarProps {
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
  loading: boolean;
  onFilter: () => void;
  onReset: () => void;
  onExport?: () => void;
  exportLabel?: string;
}

/**
 * 博客列表筛选栏组件
 * @param props - 筛选状态和操作回调
 * @returns JSX.Element
 */
export function BlogFilterBar({
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
  loading,
  onFilter,
  onReset,
  onExport,
  exportLabel = '导出文章'
}: BlogFilterBarProps) {
  return (
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
              onClick={() => setFilterTitle('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C9CDD4] hover:text-[#86909C] transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="w-full sm:w-[140px]">
        <CustomSelect 
          label="分类"
          placeholder="请选择分类"
          value={filterCategory}
          onChange={setFilterCategory}
          options={categories}
        />
      </div>
      
      <div className="w-full sm:w-[140px]">
        <CustomSelect 
          label="标签"
          placeholder="请选择标签"
          value={filterTag}
          onChange={setFilterTag}
          options={tags}
        />
      </div>
      
      <div className="w-full sm:w-[280px]">
        <CustomDateRangePicker 
          label="时间范围"
          value={filterDateRange}
          onChange={setFilterDateRange}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button 
          className="bg-[#E8F3FF] text-[#165DFF] hover:bg-[#D1E9FF] h-8 px-4 border border-[#165DFF]/20 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-none flex items-center gap-1.5"
          onClick={onFilter}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          筛 选
        </Button>
        <Button 
          variant="outline"
          className="h-8 px-4 border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] hover:text-[#1D2129] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-none text-xs whitespace-nowrap"
          onClick={onReset}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </Button>
      </div>

      {onExport && (
        <div className="ml-auto flex items-center gap-3">
          <Button 
            className="bg-[#EFFFF0] text-[#00B42A] hover:bg-[#D1FFD6] h-8 px-4 border border-[#00B42A]/20 rounded-lg transition-all active:scale-95 shadow-none font-bold text-xs flex items-center justify-center whitespace-nowrap"
            onClick={onExport}
          >
            {exportLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
