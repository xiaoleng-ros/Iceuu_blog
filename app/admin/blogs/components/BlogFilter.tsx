'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, RotateCcw, XCircle, Loader2 } from 'lucide-react';
import { FilterConfig } from '../hooks/useBlogManagement';

const CustomDateRangePicker = dynamic(() => import('@/components/admin/pages/CustomDateRangePicker').then(mod => mod.CustomDateRangePicker), { ssr: false });
const CustomSelect = dynamic(() => import('@/components/admin/pages/CustomSelect').then(mod => mod.CustomSelect), { ssr: false });

interface BlogFilterProps {
  filters: FilterConfig;
  categories: string[];
  tags: string[];
  onFilterChange: (filters: Partial<FilterConfig>) => void;
  onReset: () => void;
  onSearch: () => void;
  loading: boolean;
  dateLabel?: string;
  showExport?: boolean;
  onExport?: () => void;
}

/**
 * 博客列表筛选组件
 * @param props - 筛选相关的属性
 * @returns 筛选区域渲染结果
 */
export function BlogFilter({
  filters,
  categories,
  tags,
  onFilterChange,
  onReset,
  onSearch,
  loading,
  dateLabel = "时间范围",
  showExport = false,
  onExport
}: BlogFilterProps) {
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
                value={filters.title}
                onChange={(e) => onFilterChange({ title: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
              {filters.title && (
                <button 
                  onClick={() => onFilterChange({ title: '' })}
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
              value={filters.category}
              onChange={(val) => onFilterChange({ category: val })}
              options={categories}
            />
          </div>
          
          <div className="w-full sm:w-[140px]">
            <CustomSelect 
              label="标签"
              placeholder="请选择标签"
              value={filters.tag}
              onChange={(val) => onFilterChange({ tag: val })}
              options={tags}
            />
          </div>
          
          <div className="w-full sm:w-[280px]">
            <CustomDateRangePicker 
              label={dateLabel}
              value={filters.dateRange}
              onChange={(val) => onFilterChange({ dateRange: val })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              className="bg-[#E8F3FF] text-[#165DFF] hover:bg-[#D1E9FF] h-8 px-4 border border-[#165DFF]/20 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-none flex items-center gap-1.5"
              onClick={onSearch}
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

          {showExport && onExport && (
            <div className="ml-auto flex items-center gap-3">
              <Button 
                className="bg-[#EFFFF0] text-[#00B42A] hover:bg-[#D1FFD6] h-8 px-4 border border-[#00B42A]/20 rounded-lg transition-all active:scale-95 shadow-none font-bold text-xs flex items-center justify-center whitespace-nowrap"
                onClick={onExport}
              >
                导出文章
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
