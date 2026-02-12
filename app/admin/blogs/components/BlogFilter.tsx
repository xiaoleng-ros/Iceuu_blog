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
 * 标题筛选输入框组件
 * @param props - 标题筛选相关属性
 * @returns 标题输入框渲染结果
 */
function TitleFilter({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-[180px]">
      <span className="text-[#6B6B6B] text-sm whitespace-nowrap min-w-[32px] font-medium">标题:</span>
      <div className="relative w-full">
        <Input 
          placeholder="请输入关键词" 
          className="h-9 border-[#E8E8E8] focus:border-[#7EB6E8] focus:ring-[#7EB6E8]/15 transition-all text-xs rounded-xl w-full pr-7 bg-white/50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button 
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C0C0C0] hover:text-[#7EB6E8] transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 筛选操作按钮组组件
 * @param props - 按钮操作相关属性
 * @returns 按钮组渲染结果
 */
function FilterActions({
  loading,
  onSearch,
  onReset
}: {
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button 
        className="bg-gradient-to-r from-[#7EB6E8] to-[#5A9BD5] text-white hover:shadow-lg hover:shadow-[#7EB6E8]/25 h-9 px-5 rounded-xl font-medium text-xs transition-all active:scale-95 flex items-center gap-2 border-0"
        onClick={onSearch}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        筛 选
      </Button>
      <Button 
        variant="outline"
        className="h-9 px-4 border-[#E8E8E8] text-[#6B6B6B] hover:bg-white/80 hover:text-[#7EB6E8] hover:border-[#7EB6E8]/30 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-none text-xs whitespace-nowrap"
        onClick={onReset}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        重置
      </Button>
    </div>
  );
}

/**
 * 导出按钮组件
 * @param onExport - 导出回调函数
 * @returns 导出按钮渲染结果
 */
function ExportButton({ onExport }: { onExport: () => void }) {
  return (
    <div className="ml-auto flex items-center gap-3">
      <Button 
        className="bg-gradient-to-r from-[#98D8AA] to-[#7BC98E] text-white hover:shadow-lg hover:shadow-[#98D8AA]/25 h-9 px-5 rounded-xl transition-all active:scale-95 font-medium text-xs flex items-center justify-center whitespace-nowrap border-0"
        onClick={onExport}
      >
        导出文章
      </Button>
    </div>
  );
}

/**
 * 博客列表筛选组件
 * 采用日系动漫风格设计
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
    <Card className="border-0 rounded-3xl bg-white/70 backdrop-blur-xl relative z-20 shadow-[0_4px_30px_rgba(126,182,232,0.06)] overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#7EB6E8] via-[#FFB5C5] to-[#C9A8E0]" />
      
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
          <TitleFilter 
            value={filters.title}
            onChange={(value) => onFilterChange({ title: value })}
          />
          
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

          <FilterActions 
            loading={loading}
            onSearch={onSearch}
            onReset={onReset}
          />

          {showExport && onExport && <ExportButton onExport={onExport} />}
        </div>
      </CardContent>
    </Card>
  );
}
