'use client';

import { useMemo } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast, EmptyState } from '@/components/admin/pages/CommonComponents';
import { useBlogManagement } from './hooks/useBlogManagement';
import { useBlogListActions } from './hooks/useBlogListActions';
import { getBlogColumns } from './config/blogColumns';
import { exportBlogsToCSV } from './utils/blogExport';
import { BlogHeader } from './components/BlogHeader';
import { BlogFilter } from './components/BlogFilter';
import { BlogTable } from './components/BlogTable';
import { BlogPagination } from './components/BlogPagination';

/**
 * 博客列表页面组件
 * 展示已发布文章列表，提供筛选、排序、导出和删除功能
 * 采用日系动漫风格设计
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
    handleReset,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedBlogs,
    handleSort,
    sortConfigs,
    fetchBlogs
  } = useBlogManagement('published');

  const {
    toast,
    setToast,
    deleteConfirmOpen,
    selectedIds,
    handleSearch,
    handleDelete,
    confirmDelete,
    closeDeleteConfirm,
    toggleSelect,
    toggleSelectAll
  } = useBlogListActions(setBlogs);

  const columns = useMemo(() => getBlogColumns(handleDelete), [handleDelete]);
  const onSearch = () => handleSearch(filters, fetchBlogs);
  const handleExport = () => exportBlogsToCSV(blogs);

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
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
        onReset={handleReset}
        onSearch={onSearch}
        loading={loading}
        showExport
        onExport={handleExport}
      />

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_4px_30px_rgba(126,182,232,0.06)] border border-white/50 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#7EB6E8] via-[#FFB5C5] to-[#C9A8E0]" />
        
        <BlogTable 
          blogs={paginatedBlogs}
          loading={loading}
          columns={columns}
          sortConfigs={sortConfigs}
          onSort={handleSort}
          selectedIds={selectedIds}
          onSelect={toggleSelect}
          onSelectAll={() => toggleSelectAll(paginatedBlogs.map(b => b.id))}
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
