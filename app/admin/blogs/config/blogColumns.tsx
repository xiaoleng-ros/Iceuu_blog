import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Blog } from '../hooks/useBlogManagement';
import { ColumnConfig } from '../components/BlogTable';

/**
 * ID 列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderIdColumn(blog: Blog) {
  return (
    <span className="text-xs text-[#9B9B9B] font-mono">
      {blog.id.substring(0, 8)}...
    </span>
  );
}

/**
 * 标题列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderTitleColumn(blog: Blog) {
  return (
    <span className="font-medium text-[#4A4A4A] whitespace-nowrap truncate block max-w-xs">
      {blog.title}
    </span>
  );
}

/**
 * 摘要列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderExcerptColumn(blog: Blog) {
  return (
    <span className="text-[#9B9B9B] max-w-xs truncate text-xs block">
      {blog.excerpt || '-'}
    </span>
  );
}

/**
 * 分类列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderCategoryColumn(blog: Blog) {
  return blog.category ? (
    <span className="bg-gradient-to-r from-[#FFF5F8] to-[#F8FCFF] text-[#7EB6E8] px-3 py-1 rounded-lg text-xs font-medium border border-[#7EB6E8]/10">
      {blog.category}
    </span>
  ) : '-';
}

/**
 * 标签列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderTagsColumn(blog: Blog) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {blog.tags && blog.tags.length > 0 ? (
        blog.tags.map(tag => (
          <span key={tag} className="text-[#C9A8E0] text-xs font-medium bg-[#C9A8E0]/10 px-2 py-0.5 rounded-lg">#{tag}</span>
        ))
      ) : '-'}
    </div>
  );
}

/**
 * 浏览量列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderViewsColumn(blog: Blog) {
  return <span className="text-[#6B6B6B] font-medium">{blog.views || 0}</span>;
}

/**
 * 评论数量列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderCommentsColumn(blog: Blog) {
  return <span className="text-[#6B6B6B] font-medium">{blog.comments_count || 0}</span>;
}

/**
 * 状态列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderStatusColumn(blog: Blog) {
  return (
    <span className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 mx-auto w-fit ${
      blog.draft 
        ? 'bg-gradient-to-r from-[#FFF8E8] to-[#FFF5F0] text-[#FFD699] border border-[#FFD699]/20' 
        : 'bg-gradient-to-r from-[#E8FFF0] to-[#F0FFF4] text-[#98D8AA] border border-[#98D8AA]/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${blog.draft ? 'bg-[#FFD699]' : 'bg-[#98D8AA]'}`} />
      {blog.draft ? '草稿' : '已发布'}
    </span>
  );
}

/**
 * 创建时间列渲染
 * @param blog - 博客数据
 * @returns 渲染结果
 */
function renderCreatedAtColumn(blog: Blog) {
  return <span className="text-[#9B9B9B] text-xs whitespace-nowrap">{formatDate(blog.created_at)}</span>;
}

/**
 * 操作列渲染
 * @param blog - 博客数据
 * @param onDelete - 删除回调
 * @returns 渲染结果
 */
function renderActionsColumn(blog: Blog, onDelete: (id: string) => void) {
  return (
    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href={`/blog/${blog.id}`} target="_blank">
        <Button variant="ghost" size="icon" title="预览" className="text-[#9B9B9B] hover:text-[#7EB6E8] hover:bg-[#7EB6E8]/10 h-8 w-8 rounded-xl">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={`/admin/blogs/${blog.id}`}>
        <Button variant="ghost" size="icon" title="编辑" className="text-[#9B9B9B] hover:text-[#7EB6E8] hover:bg-[#7EB6E8]/10 h-8 w-8 rounded-xl">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button 
        variant="ghost" 
        size="icon" 
        title="删除"
        className="text-[#9B9B9B] hover:text-[#FF9B9B] hover:bg-[#FF9B9B]/10 h-8 w-8 rounded-xl"
        onClick={() => onDelete(blog.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * 获取表格列定义
 * @param onDelete - 删除操作回调
 * @returns 列配置数组
 */
export function getBlogColumns(onDelete: (id: string) => void): ColumnConfig<Blog>[] {
  return [
    { key: 'id', header: 'ID', width: '80px', render: renderIdColumn },
    { key: 'title', header: '标题', render: renderTitleColumn },
    { key: 'excerpt', header: '摘要', render: renderExcerptColumn },
    { key: 'category', header: '分类', render: renderCategoryColumn },
    { key: 'tags', header: '标签', render: renderTagsColumn },
    { key: 'views', header: '浏览量', align: 'center', sortable: true, render: renderViewsColumn },
    { key: 'comments_count', header: '评论数量', align: 'center', sortable: true, render: renderCommentsColumn },
    { key: 'status', header: '状态', align: 'center', render: renderStatusColumn },
    { key: 'created_at', header: '发布时间', align: 'center', sortable: true, render: renderCreatedAtColumn },
    { key: 'actions', header: '操作', align: 'right', render: (blog) => renderActionsColumn(blog, onDelete) }
  ];
}
