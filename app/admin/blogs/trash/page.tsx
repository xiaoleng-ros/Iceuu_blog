'use client';

import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Toast, EmptyState } from '@/components/admin/pages/CommonComponents';
import { useBlogManagement, Blog } from '../hooks/useBlogManagement';
import { BlogHeader } from '../components/BlogHeader';
import { BlogFilter } from '../components/BlogFilter';
import { BlogTable, ColumnConfig } from '../components/BlogTable';
import { BlogPagination } from '../components/BlogPagination';

interface ConfirmOptions {
  title: string;
  desc: string;
  text: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

/**
 * 获取回收站表格列定义
 * @param onRestore - 恢复操作回调
 * @param onPermanentDelete - 彻底删除操作回调
 * @returns 列配置数组
 */
const getTrashColumns = (
  onRestore: (id: string) => void,
  onPermanentDelete: (id: string) => void
): ColumnConfig<Blog>[] => [
  {
    key: 'title',
    header: '标题',
    render: (blog) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[#1D2129] group-hover:text-[#165DFF] transition-colors line-clamp-1">
          {blog.title}
        </span>
        <span className="text-xs text-[#86909C] line-clamp-1">
          {blog.excerpt || '暂无摘要'}
        </span>
      </div>
    )
  },
  {
    key: 'category',
    header: '分类',
    render: (blog) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F3FF] text-[#165DFF]">
        {blog.category || '未分类'}
      </span>
    )
  },
  {
    key: 'tags',
    header: '标签',
    render: (blog) => (
      <div className="flex flex-wrap gap-1">
        {blog.tags?.map(tag => (
          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F2F3F5] text-[#4E5969]">
            {tag}
          </span>
        )) || <span className="text-xs text-[#C9CDD4]">-</span>}
      </div>
    )
  },
  {
    key: 'deleted_at',
    header: '删除时间',
    sortable: true,
    render: (blog) => (
      <span className="text-xs text-[#86909C]">
        {blog.deleted_at ? formatDate(blog.deleted_at) : formatDate(blog.created_at)}
      </span>
    )
  },
  {
    key: 'actions',
    header: '操作',
    align: 'right',
    render: (blog) => (
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
    )
  }
];

/**
 * 回收站页面组件
 * 展示已删除文章列表，提供搜索、恢复、彻底删除功能
 * @returns 页面渲染结果
 */
export default function TrashPage() {
  const {
    blogs, setBlogs, loading, categories, tags, filters, handleFilterChange,
    handleReset: originalReset, currentPage, setCurrentPage, totalPages,
    paginatedBlogs, handleSort, sortConfigs, fetchBlogs
  } = useBlogManagement('deleted');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean; title: string; description: string; confirmText: string;
    variant: 'danger' | 'warning' | 'info'; onConfirm: () => void;
  }>({
    isOpen: false, title: '', description: '', confirmText: '', variant: 'danger', onConfirm: () => {},
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const handleAction = useCallback(async (url: string, method: string, successMsg: string, body?: { ids?: string[]; updates?: Record<string, unknown> }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        const affectedIds = body?.ids || [url.split('/').pop()?.split('?')[0]];
        setBlogs(prev => prev.filter(b => !affectedIds.includes(b.id)));
        setSelectedIds(prev => prev.filter(id => !affectedIds.includes(id)));
        showToast(successMsg, 'success');
      } else {
        showToast('操作失败', 'error');
      }
    } catch (error) {
      console.error('Action error:', error);
      showToast('操作出错', 'error');
    } finally {
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }
  }, [setBlogs, showToast]);

  const openConfirm = useCallback(({ title, desc, text, variant, onConfirm }: ConfirmOptions) => {
    setConfirmConfig({ isOpen: true, title, description: desc, confirmText: text, variant, onConfirm });
  }, []);

  const handleRestore = useCallback((id: string) => openConfirm({ title: '确认恢复文章', desc: '确定要恢复这篇文章吗？恢复后文章将重新出现在已发布列表中。', text: '确认恢复', variant: 'info', onConfirm: () => handleAction(`/api/blog/${id}?restore=true`, 'DELETE', '文章已恢复') }), [openConfirm, handleAction]);
  const handlePermanentDelete = useCallback((id: string) => openConfirm({ title: '确认彻底删除', desc: '确定要彻底删除这篇文章吗？此操作不可撤销，文章数据将永久丢失！', text: '彻底删除', variant: 'danger', onConfirm: () => handleAction(`/api/blog/${id}?permanent=true`, 'DELETE', '文章已彻底删除') }), [openConfirm, handleAction]);
  const handleBatchRestore = () => openConfirm({ title: '确认批量恢复', desc: `确定要恢复选中的 ${selectedIds.length} 篇文章吗？`, text: '批量恢复', variant: 'info', onConfirm: () => handleAction('/api/api/blog', 'PATCH', `已成功恢复 ${selectedIds.length} 篇文章`, { ids: selectedIds, updates: { is_deleted: false, deleted_at: null } }) });
  const handleBatchPermanentDelete = () => openConfirm({ title: '确认批量彻底删除', desc: `确定要彻底删除选中的 ${selectedIds.length} 篇文章吗？此操作不可撤销！`, text: '批量彻底删除', variant: 'danger', onConfirm: () => handleAction('/api/blog?permanent=true', 'DELETE', `已成功彻底删除 ${selectedIds.length} 篇文章`, { ids: selectedIds }) });

  const columns = useMemo(() => getTrashColumns(handleRestore, handlePermanentDelete), [handleRestore, handlePermanentDelete]);

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog {...confirmConfig} onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} />
      
      <BlogHeader 
        title="回收站" 
        description="管理已删除的文章，可进行恢复或彻底删除" 
        extra={
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#86909C] mr-2">已选 {selectedIds.length} 项</span>
                <Button onClick={handleBatchRestore} className="h-8 px-3 text-xs bg-[#00B42A] hover:bg-[#009A22] text-white rounded-lg flex items-center gap-1.5 shadow-sm"><RotateCcw className="w-3.5 h-3.5" />批量恢复</Button>
                <Button onClick={handleBatchPermanentDelete} className="h-8 px-3 text-xs bg-[#F53F3F] hover:bg-[#D32020] text-white rounded-lg flex items-center gap-1.5 shadow-sm"><Trash2 className="w-3.5 h-3.5" />批量彻底删除</Button>
              </div>
            )}
            <div className="bg-[#FFF7E8] border border-[#FF7D00]/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[#FF7D00] text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /><span>彻底删除后将无法找回</span>
            </div>
          </div>
        }
      />

      <BlogFilter 
        filters={filters} categories={categories} tags={tags} 
        onFilterChange={handleFilterChange} onReset={originalReset} 
        onSearch={fetchBlogs} loading={loading} dateLabel="删除时间"
      />

      <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] overflow-hidden">
        <BlogTable 
          blogs={paginatedBlogs} loading={loading} columns={columns} sortConfigs={sortConfigs} onSort={handleSort}
          selectedIds={selectedIds} 
          onSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          onSelectAll={() => setSelectedIds(prev => prev.length === paginatedBlogs.length ? [] : paginatedBlogs.map(b => b.id))}
          emptyState={<EmptyState message={loading ? "正在获取文章数据..." : "回收站暂无内容"} />}
        />
        <BlogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={blogs.length} />
      </div>
    </div>
  );
}
