'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Send, Inbox } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  created_at: string;
  draft: boolean;
  is_deleted: boolean;
}

interface DraftsTableProps {
  blogs: Blog[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * 草稿箱列表表格组件
 * @param props - 草稿数据、加载状态、选择状态和操作回调
 * @returns JSX.Element
 */
export function DraftsTable({
  blogs,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPublish,
  onDelete
}: DraftsTableProps) {
  return (
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
              <tr key={blog.id} className={cn("hover:bg-[#F9FBFF] transition-colors group", selectedIds.includes(blog.id) && "bg-[#F9FBFF]")}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
                    checked={selectedIds.includes(blog.id)}
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
                  {formatDate(blog.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-[#4E5969] hover:text-[#00B42A] hover:bg-[#E8FFEA] rounded-lg"
                      title="立即发布"
                      onClick={() => onPublish(blog.id)}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Link href={`/admin/blogs/${blog.id}`} title="编辑">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF] rounded-lg">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-[#4E5969] hover:text-[#F53F3F] hover:bg-[#FFECE8] rounded-lg"
                      title="移入回收站"
                      onClick={() => onDelete(blog.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Inbox className="w-10 h-10 text-[#C9CDD4]" />
                  <p className="text-[#86909C] text-sm">草稿箱空空如也</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
