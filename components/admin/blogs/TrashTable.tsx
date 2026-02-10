'use client';

import { Button } from '@/components/ui/Button';
import { Trash2, RotateCcw, Inbox } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/admin/pages/CommonComponents';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  created_at: string;
  deleted_at: string;
  draft: boolean;
  is_deleted: boolean;
}

interface TrashTableProps {
  blogs: Blog[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

/**
 * 回收站表格头部组件
 */
const TrashTableHeader = ({ 
  isAllSelected, 
  onToggleSelectAll 
}: { 
  isAllSelected: boolean; 
  onToggleSelectAll: () => void 
}) => (
  <thead>
    <tr className="bg-[#F7F8FA] border-b border-[#F2F3F5]">
      <th className="px-6 py-4 w-10">
        <input 
          type="checkbox" 
          className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
          checked={isAllSelected}
          onChange={onToggleSelectAll}
        />
      </th>
      <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">标题</th>
      <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">分类</th>
      <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">标签</th>
      <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">删除时间</th>
      <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider text-right">操作</th>
    </tr>
  </thead>
);

/**
 * 回收站表格行组件
 */
const TrashTableRow = ({ 
  blog, 
  isSelected, 
  onToggleSelect, 
  onRestore, 
  onPermanentDelete 
}: { 
  blog: Blog; 
  isSelected: boolean; 
  onToggleSelect: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}) => (
  <tr className={cn("hover:bg-[#F9FBFF] transition-colors group", isSelected && "bg-[#F9FBFF]")}>
    <td className="px-6 py-4">
      <input 
        type="checkbox" 
        className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
        checked={isSelected}
        onChange={() => onToggleSelect(blog.id)}
      />
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[#1D2129] group-hover:text-[#165DFF] transition-colors line-clamp-1">
          {blog.title}
        </span>
        <span className="text-xs text-[#86909C] line-clamp-1">
          {blog.excerpt || '暂无摘要'}
        </span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F3FF] text-[#165DFF]">
        {blog.category || '未分类'}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-1">
        {blog.tags?.map(tag => (
          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F2F3F5] text-[#4E5969]">
            {tag}
          </span>
        )) || <span className="text-xs text-[#C9CDD4]">-</span>}
      </div>
    </td>
    <td className="px-6 py-4 text-xs text-[#86909C]">
      {blog.deleted_at ? formatDate(blog.deleted_at) : formatDate(blog.created_at)}
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          onClick={() => onRestore(blog.id)} 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-[#4E5969] hover:text-[#00B42A] hover:bg-[#EFFFF0] rounded-lg" 
          title="恢复"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => onPermanentDelete(blog.id)} 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-[#4E5969] hover:text-[#F53F3F] hover:bg-[#FFF2F2] rounded-lg" 
          title="彻底删除"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </td>
  </tr>
);

/**
 * 回收站列表表格组件
 * @param props - 博客数据、加载状态、选择状态和操作回调
 * @returns JSX.Element
 */
export function TrashTable({
  blogs,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRestore,
  onPermanentDelete
}: TrashTableProps) {
  const isAllSelected = blogs.length > 0 && selectedIds.length === blogs.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <TrashTableHeader isAllSelected={isAllSelected} onToggleSelectAll={onToggleSelectAll} />
        <tbody className="divide-y divide-[#F2F3F5]">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Inbox className="w-10 h-10 text-[#C9CDD4] animate-pulse" />
                  <p className="text-[#86909C] text-sm">加载中...</p>
                </div>
              </td>
            </tr>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <TrashTableRow 
                key={blog.id} 
                blog={blog} 
                isSelected={selectedIds.includes(blog.id)}
                onToggleSelect={onToggleSelect}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <EmptyState message="回收站暂无内容" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
