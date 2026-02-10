'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/admin/pages/CommonComponents';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  created_at: string;
  draft: boolean;
  views?: number;
  comments_count?: number;
}

interface SortConfig {
  key: keyof Blog;
  direction: 'asc' | 'desc';
}

interface BlogTableProps {
  blogs: Blog[];
  loading: boolean;
  sortConfigs: SortConfig[];
  onSort: (key: keyof Blog, multiSort: boolean) => void;
  onDelete: (id: string) => void;
}

/**
 * 排序指示器组件
 */
const SortIndicator = ({ 
  columnKey, 
  sortConfigs 
}: { 
  columnKey: keyof Blog; 
  sortConfigs: SortConfig[] 
}) => {
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

/**
 * 表格头部组件
 */
const BlogTableHeader = ({ 
  sortConfigs, 
  onSort 
}: { 
  sortConfigs: SortConfig[]; 
  onSort: (key: keyof Blog, multiSort: boolean) => void 
}) => {
  const headers = [
    { key: 'views', label: '浏览量', sortable: true },
    { key: 'comments_count', label: '评论数量', sortable: true },
    { key: 'created_at', label: '发布时间', sortable: true },
  ] as const;

  return (
    <thead className="text-[13px] text-[#4E5969] font-bold bg-[#F9FBFF]/50 border-b border-[#F2F3F5]">
      <tr>
        <th scope="col" className="px-4 py-4 w-10">
          <input type="checkbox" className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20" />
        </th>
        <th scope="col" className="px-6 py-4 font-bold">ID</th>
        <th scope="col" className="px-6 py-4 font-bold">标题</th>
        <th scope="col" className="px-6 py-4 font-bold">摘要</th>
        <th scope="col" className="px-6 py-4 font-bold">分类</th>
        <th scope="col" className="px-6 py-4 font-bold">标签</th>
        {headers.map(header => (
          <th 
            key={header.key}
            scope="col" 
            className="px-6 py-4 font-bold text-center cursor-pointer hover:bg-[#F2F3F5] transition-colors group/header"
            onClick={(e) => onSort(header.key as keyof Blog, e.shiftKey)}
          >
            <div className="flex items-center justify-center relative">
              {header.label}
              <SortIndicator columnKey={header.key as keyof Blog} sortConfigs={sortConfigs} />
            </div>
          </th>
        ))}
        <th scope="col" className="px-6 py-4 font-bold text-center">状态</th>
        <th scope="col" className="px-6 py-4 font-bold text-right">操作</th>
      </tr>
    </thead>
  );
};

/**
 * 表格行组件
 */
const BlogTableRow = ({ 
  blog, 
  onDelete 
}: { 
  blog: Blog; 
  onDelete: (id: string) => void 
}) => {
  return (
    <tr className="bg-white hover:bg-[#F9FBFF]/50 transition-colors group">
      <td className="px-4 py-4">
        <input type="checkbox" className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20" />
      </td>
      <td className="px-6 py-4 text-xs text-[#86909C] font-mono truncate max-w-[80px]">
        {blog.id.substring(0, 8)}...
      </td>
      <td className="px-6 py-4 font-bold text-[#1D2129] whitespace-nowrap max-w-xs truncate">
        {blog.title}
      </td>
      <td className="px-6 py-4 text-[#86909C] max-w-xs truncate text-xs">
        {blog.excerpt || '-'}
      </td>
      <td className="px-6 py-4">
        {blog.category ? (
          <span className="bg-[#F2F3F5] text-[#4E5969] px-2.5 py-1 rounded-md text-xs font-medium">
            {blog.category}
          </span>
        ) : '-'}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1.5">
          {blog.tags && blog.tags.length > 0 ? (
            blog.tags.map(tag => (
              <span key={tag} className="text-[#165DFF] text-xs font-medium bg-[#165DFF]/5 px-2 py-0.5 rounded">#{tag}</span>
            ))
          ) : '-'}
        </div>
      </td>
      <td className="px-6 py-4 text-center text-[#4E5969] font-medium">
        {blog.views || 0}
      </td>
      <td className="px-6 py-4 text-center text-[#4E5969] font-medium">
        {blog.comments_count || 0}
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 mx-auto w-fit ${
          blog.draft ? 'bg-[#FFF7E8] text-[#FF7D00]' : 'bg-[#E8FFEA] text-[#00B42A]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${blog.draft ? 'bg-[#FF7D00]' : 'bg-[#00B42A]'}`} />
          {blog.draft ? '草稿' : '已发布'}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-[#86909C] text-xs whitespace-nowrap">
        {formatDate(blog.created_at)}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/blog/${blog.id}`} target="_blank">
             <Button variant="ghost" size="icon" title="预览" className="text-[#86909C] hover:text-[#165DFF] hover:bg-[#165DFF]/10 h-8 w-8 rounded-lg">
               <Eye className="h-4 w-4" />
             </Button>
          </Link>
          <Link href={`/admin/blogs/${blog.id}`}>
            <Button variant="ghost" size="icon" title="编辑" className="text-[#86909C] hover:text-[#165DFF] hover:bg-[#165DFF]/10 h-8 w-8 rounded-lg">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            title="删除"
            className="text-[#86909C] hover:text-[#F53F3F] hover:bg-[#F53F3F]/10 h-8 w-8 rounded-lg"
            onClick={() => onDelete(blog.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

/**
 * 博客列表表格组件
 * @param props - 博客数据、加载状态、排序配置和操作回调
 * @returns JSX.Element
 */
export function BlogTable({
  blogs,
  loading,
  sortConfigs,
  onSort,
  onDelete
}: BlogTableProps) {
  return (
    <div className="relative overflow-hidden">
      {loading && blogs.length > 0 && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-30 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white/80 p-4 rounded-2xl shadow-xl border border-[#F2F3F5] flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#165DFF]" />
            <span className="text-sm font-medium text-[#4E5969]">正在筛选内容...</span>
          </div>
        </div>
      )}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E5E6EB] scrollbar-track-transparent">
        <table className="w-full text-sm text-left">
          <BlogTableHeader sortConfigs={sortConfigs} onSort={onSort} />
          <tbody className="divide-y divide-[#F2F3F5]">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <BlogTableRow key={blog.id} blog={blog} onDelete={onDelete} />
              ))
            ) : (
              <tr>
                <td colSpan={11} className="p-0">
                  <EmptyState message={loading ? "正在获取文章数据..." : "暂无数据"} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
