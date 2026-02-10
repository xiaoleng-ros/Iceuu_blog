'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Blog, SortConfig } from '../hooks/useBlogManagement';

/**
 * 表格列配置接口
 */
export interface ColumnConfig<T> {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface BlogTableProps {
  blogs: Blog[];
  loading: boolean;
  columns: ColumnConfig<Blog>[];
  selectedIds?: string[];
  onSelectAll?: () => void;
  onSelect?: (id: string) => void;
  sortConfigs?: SortConfig[];
  onSort?: (key: keyof Blog, multiSort: boolean) => void;
  emptyState?: ReactNode;
}

/**
 * 博客列表表格组件
 * @param props - 表格相关的属性
 * @returns 表格渲染结果
 */
export function BlogTable({
  blogs,
  loading,
  columns,
  selectedIds = [],
  onSelectAll,
  onSelect,
  sortConfigs = [],
  onSort,
  emptyState
}: BlogTableProps) {
  
  /**
   * 渲染排序指示器
   */
  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    const config = sortConfigs.find(c => c.key === columnKey);
    const orderIndex = sortConfigs.findIndex(c => c.key === columnKey);
    
    return (
      <span className="inline-flex flex-col ml-2 align-middle gap-[2px] relative group/indicator">
        <span className={cn(
          "text-[9px] leading-none transition-colors duration-200 select-none",
          config?.direction === 'asc' ? "text-[#165DFF] scale-110" : "text-[#C9CDD4] group-hover/indicator:text-[#86909C]"
        )}>
          ▲
        </span>
        <span className={cn(
          "text-[9px] leading-none transition-colors duration-200 select-none",
          config?.direction === 'desc' ? "text-[#165DFF] scale-110" : "text-[#C9CDD4] group-hover/indicator:text-[#86909C]"
        )}>
          ▼
        </span>
        {sortConfigs.length > 1 && orderIndex > -1 && (
          <span className="absolute -right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-[#165DFF] font-black bg-white rounded-full w-3 h-3 flex items-center justify-center border border-[#165DFF]/20 shadow-sm z-10">
            {orderIndex + 1}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {loading && blogs.length > 0 && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-30 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white/80 p-4 rounded-2xl shadow-xl border border-[#F2F3F5] flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#165DFF]" />
            <span className="text-sm font-medium text-[#4E5969]">正在加载内容...</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E5E6EB] scrollbar-track-transparent">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-[13px] text-[#4E5969] font-bold bg-[#F9FBFF]/50 border-b border-[#F2F3F5]">
            <tr>
              {onSelectAll && (
                <th scope="col" className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
                    checked={blogs.length > 0 && selectedIds.length === blogs.length}
                    onChange={onSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th 
                  key={col.key}
                  scope="col" 
                  className={cn(
                    "px-6 py-4 font-bold transition-colors",
                    col.sortable && "cursor-pointer hover:bg-[#F2F3F5]",
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right"
                  )}
                  style={{ width: col.width }}
                  onClick={(e) => col.sortable && onSort?.(col.key as keyof Blog, e.shiftKey)}
                >
                  <div className={cn(
                    "flex items-center relative",
                    col.align === 'center' && "justify-center",
                    col.align === 'right' && "justify-end"
                  )}>
                    {col.header}
                    {col.sortable && <SortIndicator columnKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F3F5]">
            {!loading && blogs.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectAll ? 1 : 0)}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr 
                  key={blog.id} 
                  className={cn(
                    "hover:bg-[#F9FBFF] transition-colors group",
                    selectedIds.includes(blog.id) && "bg-[#F9FBFF]"
                  )}
                >
                  {onSelect && (
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
                        checked={selectedIds.includes(blog.id)}
                        onChange={() => onSelect(blog.id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td 
                      key={`${blog.id}-${col.key}`}
                      className={cn(
                        "px-6 py-4",
                        col.align === 'center' && "text-center",
                        col.align === 'right' && "text-right"
                      )}
                    >
                      {col.render(blog)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
