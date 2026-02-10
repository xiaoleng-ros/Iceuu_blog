'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Edit, Trash2, Send, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/admin/pages/CommonComponents';
import Link from 'next/link';
import { Blog } from '../../hooks/useBlogManagement';

interface DraftsTableProps {
  blogs: Blog[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

/**
 * 草稿单行组件
 */
function DraftRow({ 
  blog, 
  isSelected, 
  onToggleSelect, 
  onPublish, 
  onDelete 
}: { 
  blog: Blog; 
  isSelected: boolean; 
  onToggleSelect: (id: string) => void; 
  onPublish: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  return (
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
          <span className="text-sm font-medium text-[#1D2129] group-hover:text-[#165DFF] transition-colors line-clamp-1">{blog.title}</span>
          <span className="text-xs text-[#86909C] line-clamp-1">{blog.excerpt || '暂无摘要'}</span>
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
      <td className="px-6 py-4 text-xs text-[#86909C]">{formatDate(blog.created_at)}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/blogs/${blog.id}`} title="编辑">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF] rounded-lg">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button onClick={() => onPublish(blog.id)} variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#00B42A] hover:bg-[#EFFFF0] rounded-lg" title="发布">
            <Send className="w-4 h-4" />
          </Button>
          <Button onClick={() => onDelete(blog.id)} variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#F53F3F] hover:bg-[#FFF2F2] rounded-lg" title="移入回收站">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/**
 * 表格分页组件
 */
function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 bg-[#F7F8FA] border-t border-[#F2F3F5] flex items-center justify-between">
      <p className="text-xs text-[#86909C]">共 {totalCount} 篇草稿</p>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
          disabled={currentPage === 1} 
          className="h-8 w-8 p-0 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-medium text-[#1D2129]">第 {currentPage} 页 / 共 {totalPages} 页</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
          disabled={currentPage === totalPages} 
          className="h-8 w-8 p-0 rounded-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * 草稿箱表格组件
 * @param props - 表格相关的属性
 * @returns 表格渲染结果
 */
export function DraftsTable({
  blogs,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPublish,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  totalCount
}: DraftsTableProps) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#F2F3F5]">
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
                  checked={blogs.length > 0 && selectedIds.length === blogs.length}
                  onChange={onToggleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">标题</th>
              <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">分类</th>
              <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">标签</th>
              <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">保存时间</th>
              <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
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
                <DraftRow
                  key={blog.id}
                  blog={blog}
                  isSelected={selectedIds.includes(blog.id)}
                  onToggleSelect={onToggleSelect}
                  onPublish={onPublish}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr><td colSpan={6}><EmptyState message="草稿箱暂无内容" /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalCount={totalCount}
      />
    </Card>
  );
}
