'use client';

import { 
  UploadCloud, 
  Loader2, 
  LayoutGrid, 
  List, 
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface MediaToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  categories: { label: string; value: string }[];
  uploading: boolean;
  onUploadClick: () => void;
}

/**
 * 媒体库工具栏组件
 * @param props - 组件属性
 * @returns {JSX.Element} 工具栏界面
 */
export function MediaToolbar({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  viewMode,
  setViewMode,
  categories,
  uploading,
  onUploadClick,
}: MediaToolbarProps) {
  return (
    <>
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">媒体库</h1>
          <p className="text-[#86909C] mt-1 text-sm">管理和组织您上传的所有图片及文件资源</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={onUploadClick}
            disabled={uploading}
            className="w-full md:w-auto h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white rounded-xl shadow-[0_4px_12px_rgba(64,169,255,0.2)] transition-all flex items-center gap-2 px-5"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            <span className="font-medium text-sm">{uploading ? '正在上传...' : '上传图片'}</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white/50 p-2 rounded-2xl border border-[#F2F3F5]/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86909C]" />
            <input
              type="text"
              placeholder="搜索媒体文件名..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#E5E6EB] focus:border-[#165DFF] focus:ring-4 focus:ring-[#165DFF]/5 rounded-xl text-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-1 bg-[#F2F3F5]/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedType(cat.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  selectedType === cat.value
                    ? "bg-white text-[#165DFF] shadow-sm"
                    : "text-[#4E5969] hover:text-[#1D2129] hover:bg-white/50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#E5E6EB] shadow-sm ml-auto lg:ml-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center gap-2 px-3 text-sm font-medium",
              viewMode === 'grid' 
                ? "bg-[#F2F3F5] text-[#165DFF]" 
                : "text-[#4E5969] hover:bg-[#F7F8FA]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">网格</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center gap-2 px-3 text-sm font-medium",
              viewMode === 'list' 
                ? "bg-[#F2F3F5] text-[#165DFF]" 
                : "text-[#4E5969] hover:bg-[#F7F8FA]"
            )}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">列表</span>
          </button>
        </div>
      </div>
    </>
  );
}
