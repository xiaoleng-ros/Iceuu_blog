'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Send } from 'lucide-react';
import { Toast } from '@/components/admin/pages/CommonComponents';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useBlogManagement } from '../hooks/useBlogManagement';
import { DraftsFilter } from './components/DraftsFilter';
import { DraftsTable } from './components/DraftsTable';
import { useDraftsActions } from './hooks/useDraftsActions';

/**
 * 草稿箱页面头部组件
 */
function DraftsHeader({ 
  selectedCount, 
  onBatchPublish, 
  onBatchDelete 
}: { 
  selectedCount: number; 
  onBatchPublish: () => void; 
  onBatchDelete: () => void; 
}) {
  return (
    <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">草稿箱</h1>
        <p className="text-[#86909C] mt-1 text-sm">管理您的未发布草稿</p>
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
            <span className="text-xs text-[#86909C] mr-2">已选 {selectedCount} 项</span>
            <Button onClick={onBatchPublish} className="h-8 px-3 text-xs bg-[#00B42A] hover:bg-[#009A22] text-white rounded-lg flex items-center gap-1.5 shadow-sm">
              <Send className="w-3.5 h-3.5" />
              批量发布
            </Button>
            <Button onClick={onBatchDelete} className="h-8 px-3 text-xs bg-[#F53F3F] hover:bg-[#D32020] text-white rounded-lg flex items-center gap-1.5 shadow-sm">
              <Trash2 className="w-3.5 h-3.5" />
              批量移入回收站
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 草稿箱页面组件
 */
export default function DraftsPage() {
  const {
    blogs, setBlogs, loading, categories, tags, filters, handleFilterChange, handleReset: originalReset,
    currentPage, setCurrentPage, totalPages, paginatedBlogs, fetchBlogs
  } = useBlogManagement('draft');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const {
    confirmConfig,
    handlePublish,
    handleDelete,
    handleBatchPublish,
    handleBatchDelete,
    closeConfirm
  } = useDraftsActions(setBlogs, setSelectedIds, showToast);

  const handleReset = useCallback(() => {
    originalReset();
    setSelectedIds([]);
  }, [originalReset]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === paginatedBlogs.length ? [] : paginatedBlogs.map(b => b.id));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
      />
      
      <DraftsHeader 
        selectedCount={selectedIds.length}
        onBatchPublish={() => handleBatchPublish(selectedIds)}
        onBatchDelete={() => handleBatchDelete(selectedIds)}
      />

      <DraftsFilter 
        filterTitle={filters.title}
        setFilterTitle={(title) => handleFilterChange({ title })}
        filterCategory={filters.category}
        setFilterCategory={(category) => handleFilterChange({ category })}
        filterTag={filters.tag}
        setFilterTag={(tag) => handleFilterChange({ tag })}
        filterDateRange={filters.dateRange}
        setFilterDateRange={(dateRange) => handleFilterChange({ dateRange })}
        categories={categories}
        tags={tags}
        onFilter={() => fetchBlogs()}
        onReset={handleReset}
      />

      <DraftsTable 
        blogs={paginatedBlogs}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onPublish={handlePublish}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalCount={blogs.length}
      />
    </div>
  );}

