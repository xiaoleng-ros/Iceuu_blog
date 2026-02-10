'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Toast, EmptyState } from '@/components/admin/pages/CommonComponents';
import { useBlogManagement, Blog } from './hooks/useBlogManagement';
import { BlogHeader } from './components/BlogHeader';
import { BlogFilter } from './components/BlogFilter';
import { BlogTable, ColumnConfig } from './components/BlogTable';
import { BlogPagination } from './components/BlogPagination';

/**
 * 获取表格列定义
 * @param onDelete - 删除操作回调
 * @returns 列配置数组
 */
const getColumns = (onDelete: (id: string) => void): ColumnConfig<Blog>[] => [
  {
    key: 'id',
    header: 'ID',
    width: '80px',
    render: (blog) => (
      <span className="text-xs text-[#86909C] font-mono">
        {blog.id.substring(0, 8)}...
      </span>
    )
  },
  {
    key: 'title',
    header: '标题',
    render: (blog) => (
      <span className="font-bold text-[#1D2129] whitespace-nowrap truncate block max-w-xs">
        {blog.title}
      </span>
    )
  },
  {
    key: 'excerpt',
    header: '摘要',
    render: (blog) => (
      <span className="text-[#86909C] max-w-xs truncate text-xs block">
        {blog.excerpt || '-'}
      </span>
    )
  },
  {
    key: 'category',
    header: '分类',
    render: (blog) => blog.category ? (
      <span className="bg-[#F2F3F5] text-[#4E5969] px-2.5 py-1 rounded-md text-xs font-medium">
        {blog.category}
      </span>
    ) : '-'
  },
  {
    key: 'tags',
    header: '标签',
    render: (blog) => (
      <div className="flex flex-wrap gap-1.5">
        {blog.tags && blog.tags.length > 0 ? (
          blog.tags.map(tag => (
            <span key={tag} className="text-[#165DFF] text-xs font-medium bg-[#165DFF]/5 px-2 py-0.5 rounded">#{tag}</span>
          ))
        ) : '-'}
      </div>
    )
  },
  {
    key: 'views',
    header: '浏览量',
    align: 'center',
    sortable: true,
    render: (blog) => <span className="text-[#4E5969] font-medium">{blog.views || 0}</span>
  },
  {
    key: 'comments_count',
    header: '评论数量',
    align: 'center',
    sortable: true,
    render: (blog) => <span className="text-[#4E5969] font-medium">{blog.comments_count || 0}</span>
  },
  {
    key: 'status',
    header: '状态',
    align: 'center',
    render: (blog) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 mx-auto w-fit ${
        blog.draft ? 'bg-[#FFF7E8] text-[#FF7D00]' : 'bg-[#E8FFEA] text-[#00B42A]'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${blog.draft ? 'bg-[#FF7D00]' : 'bg-[#00B42A]'}`} />
        {blog.draft ? '草稿' : '已发布'}
      </span>
    )
  },
  {
    key: 'created_at',
    header: '发布时间',
    align: 'center',
    sortable: true,
    render: (blog) => <span className="text-[#86909C] text-xs whitespace-nowrap">{formatDate(blog.created_at)}</span>
  },
  {
    key: 'actions',
    header: '操作',
    align: 'right',
    render: (blog) => (
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
    )
  }
];

/**
 * 博客列表页面组件
 * 展示已发布文章列表，提供筛选、排序、导出和删除功能
 * @returns 页面渲染结果
 */
export default function BlogListPage() {
  const {
    blogs,
    setBlogs,
    loading,
    categories,
    tags,
    filters,
    handleFilterChange,
    handleReset: originalReset,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedBlogs,
    handleSort,
    sortConfigs,
    fetchBlogs
  } = useBlogManagement('published');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  /**
   * 处理搜索/筛选
   * @returns void
   */
  const handleSearch = () => {
    const hasValue = filters.title.trim() !== '' || 
                     filters.category !== '' || 
                     filters.tag !== '' || 
                     (filters.dateRange.start !== '' || filters.dateRange.end !== '');

    if (!hasValue) {
      showToast('筛选条件不能为空', 'warning');
      return;
    }
    fetchBlogs();
  };

  /**
   * 处理导出 CSV
   * @returns void
   */
  const handleExport = () => {
    const headers = ['ID', '标题', '摘要', '分类', '标签', '创建时间', '状态'];
    const csvContent = [
      headers.join(','),
      ...blogs.map(b => [
        b.id,
        `"${b.title.replace(/"/g, '""')}"`,
        `"${(b.excerpt || '').replace(/"/g, '""')}"`,
        b.category || '',
        (b.tags || []).join(';'),
        b.created_at,
        b.draft ? '草稿' : '已发布'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `blog_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  /**
   * 处理删除确认
   * @param id - 文章 ID
   * @returns void
   */
  const handleDelete = (id: string) => {
    setBlogIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  /**
   * 确认删除操作
   * @returns Promise<void>
   */
  const confirmDelete = async () => {
    if (!blogIdToDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/blog/${blogIdToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setBlogs(prev => prev.filter(b => b.id !== blogIdToDelete));
        showToast('文章已移入回收站', 'success');
      } else {
        showToast('移动失败', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('操作出错', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setBlogIdToDelete(null);
    }
  };

  /**
   * 表格列定义
   */
  const columns = useMemo(() => getColumns(handleDelete), []);

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBlogIdToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="确认移入回收站"
        description="您确定要将这篇文章移入回收站吗？移入后您可以从回收站中恢复或彻底删除。"
        confirmText="移入回收站"
        variant="danger"
      />
      
      <BlogHeader title="已发布文章" description="管理您的所有已发布文章内容" />

      <BlogFilter 
        filters={filters}
        categories={categories}
        tags={tags}
        onFilterChange={handleFilterChange}
        onReset={originalReset}
        onSearch={handleSearch}
        loading={loading}
        showExport
        onExport={handleExport}
      />

      <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] overflow-hidden">
        <BlogTable 
          blogs={paginatedBlogs}
          loading={loading}
          columns={columns}
          sortConfigs={sortConfigs}
          onSort={handleSort}
          selectedIds={selectedIds}
          onSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          onSelectAll={() => setSelectedIds(prev => prev.length === paginatedBlogs.length ? [] : paginatedBlogs.map(b => b.id))}
          emptyState={<EmptyState message={loading ? "正在获取文章数据..." : "暂无数据"} />}
        />
        <BlogPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={blogs.length}
        />
      </div>
    </div>
  );
}
