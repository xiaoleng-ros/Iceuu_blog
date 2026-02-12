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
 * 排序指示器组件
 * 采用日系动漫风格设计
 * @param props - 排序配置和列键
 * @returns 排序图标渲染
 */
const SortIndicator = ({ 
  columnKey, 
  sortConfigs 
}: { 
  columnKey: string; 
  sortConfigs: SortConfig[];
}) => {
  const config = sortConfigs.find(c => c.key === columnKey);
  const orderIndex = sortConfigs.findIndex(c => c.key === columnKey);
  
  return (
    <span className="inline-flex flex-col ml-2 align-middle gap-[2px] relative group/indicator">
      <span className={cn(
        "text-[9px] leading-none transition-all duration-200 select-none",
        config?.direction === 'asc' ? "text-[#7EB6E8] scale-125" : "text-[#D4D4D4] group-hover/indicator:text-[#9B9B9B]"
      )}>
        ▲
      </span>
      <span className={cn(
        "text-[9px] leading-none transition-all duration-200 select-none",
        config?.direction === 'desc' ? "text-[#7EB6E8] scale-125" : "text-[#D4D4D4] group-hover/indicator:text-[#9B9B9B]"
      )}>
        ▼
      </span>
      {sortConfigs.length > 1 && orderIndex > -1 && (
        <span className="absolute -right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-[#7EB6E8] font-bold bg-gradient-to-br from-[#7EB6E8]/10 to-[#FFB5C5]/10 rounded-full w-4 h-4 flex items-center justify-center border border-[#7EB6E8]/20 shadow-sm z-10">
          {orderIndex + 1}
        </span>
      )}
    </span>
  );
};

/**
 * 加载遮罩层组件
 * 采用日系动漫风格设计
 * @returns 加载动画渲染
 */
const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-30 flex items-center justify-center animate-in fade-in duration-300">
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_32px_rgba(126,182,232,0.15)] border border-[#FFB5C5]/20 flex flex-col items-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7EB6E8] to-[#FFB5C5] rounded-full blur-md opacity-30 animate-pulse" />
        <Loader2 className="w-10 h-10 animate-spin text-[#7EB6E8] relative z-10" />
      </div>
      <span className="text-sm font-medium text-[#6B6B6B]">正在加载内容...</span>
    </div>
  </div>
);

/**
 * 表格头部组件
 * 采用日系动漫风格设计
 * @param props - 头部配置和回调
 * @returns 表头渲染
 */
const TableHeader = ({
  columns,
  onSelectAll,
  blogs,
  selectedIds,
  sortConfigs,
  onSort
}: {
  columns: ColumnConfig<Blog>[];
  onSelectAll?: () => void;
  blogs: Blog[];
  selectedIds: string[];
  sortConfigs: SortConfig[];
  onSort?: (key: keyof Blog, multiSort: boolean) => void;
}) => (
  <thead className="text-[13px] text-[#6B6B6B] font-medium bg-gradient-to-r from-[#FFF5F8]/50 via-[#F8FCFF]/50 to-[#F5FFF8]/50">
    <tr>
      {onSelectAll && (
        <th scope="col" className="px-6 py-5 w-10">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded-lg border-2 border-[#E0E0E0] text-[#7EB6E8] focus:ring-[#7EB6E8]/20 focus:ring-offset-0 transition-all cursor-pointer"
              checked={blogs.length > 0 && selectedIds.length === blogs.length}
              onChange={onSelectAll}
            />
          </label>
        </th>
      )}
      {columns.map((col) => (
        <th 
          key={col.key}
          scope="col" 
          className={cn(
            "px-6 py-5 font-medium transition-all duration-200",
            col.sortable && "cursor-pointer hover:bg-white/50",
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
            {col.sortable && (
              <SortIndicator 
                columnKey={col.key} 
                sortConfigs={sortConfigs} 
              />
            )}
          </div>
        </th>
      ))}
    </tr>
  </thead>
);

/**
 * 表格行组件
 * 采用日系动漫风格设计
 * @param props - 行数据和配置
 * @returns 表格行渲染
 */
const TableRow = ({
  blog,
  columns,
  selectedIds,
  onSelect
}: {
  blog: Blog;
  columns: ColumnConfig<Blog>[];
  selectedIds: string[];
  onSelect?: (id: string) => void;
}) => (
  <tr 
    className={cn(
      "hover:bg-gradient-to-r hover:from-[#FFF5F8]/30 hover:via-[#F8FCFF]/30 hover:to-[#F5FFF8]/30 transition-all duration-200 group border-b border-[#F5F5F5]",
      selectedIds.includes(blog.id) && "bg-gradient-to-r from-[#7EB6E8]/5 to-[#FFB5C5]/5"
    )}
  >
    {onSelect && (
      <td className="px-6 py-4">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded-lg border-2 border-[#E0E0E0] text-[#7EB6E8] focus:ring-[#7EB6E8]/20 focus:ring-offset-0 transition-all cursor-pointer"
            checked={selectedIds.includes(blog.id)}
            onChange={() => onSelect(blog.id)}
          />
        </label>
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
);

/**
 * 博客列表表格组件
 * 采用日系动漫风格设计，柔和光影与轻盈动效
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
  
  return (
    <div className="relative">
      {loading && blogs.length > 0 && <LoadingOverlay />}

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E0E0E0] scrollbar-track-transparent">
        <table className="w-full text-sm text-left border-collapse">
          <TableHeader 
            columns={columns}
            onSelectAll={onSelectAll}
            blogs={blogs}
            selectedIds={selectedIds}
            sortConfigs={sortConfigs}
            onSort={onSort}
          />
          <tbody>
            {!loading && blogs.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectAll ? 1 : 0)}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              blogs.map((blog, index) => (
                <tr 
                  key={blog.id}
                  className={cn(
                    "hover:bg-gradient-to-r hover:from-[#FFF5F8]/30 hover:via-[#F8FCFF]/30 hover:to-[#F5FFF8]/30 transition-all duration-200 group border-b border-[#F5F5F5]",
                    selectedIds.includes(blog.id) && "bg-gradient-to-r from-[#7EB6E8]/5 to-[#FFB5C5]/5"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {onSelect && (
                    <td className="px-6 py-4">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded-lg border-2 border-[#E0E0E0] text-[#7EB6E8] focus:ring-[#7EB6E8]/20 focus:ring-offset-0 transition-all cursor-pointer"
                          checked={selectedIds.includes(blog.id)}
                          onChange={() => onSelect(blog.id)}
                        />
                      </label>
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
