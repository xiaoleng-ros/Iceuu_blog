'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Trash2, Send } from 'lucide-react';
import { Toast } from '@/components/admin/pages/CommonComponents';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useBlogManagement } from '../hooks/useBlogManagement';
import { DraftsFilter } from './components/DraftsFilter';
import { DraftsTable } from './components/DraftsTable';

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
  
  // 确认对话框状态
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'info',
    onConfirm: () => {},
  });

  /**
   * 显示 Toast 提示信息
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  /**
   * 重置筛选
   */
  const handleReset = useCallback(() => {
    originalReset();
    setSelectedIds([]);
  }, [originalReset]);

  /**
   * 触发发布草稿确认对话框
   */
  const handlePublish = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认发布',
      description: '确定要发布这篇草稿吗？发布后文章将对读者可见。',
      confirmText: '立即发布',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/blog/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ draft: false }),
          });

          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showToast('文章发布成功', 'success');
          } else {
            showToast('发布失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /**
   * 触发移入回收站确认对话框
   */
  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '移入回收站',
      description: '确定要将这篇草稿移入回收站吗？您稍后可以在回收站中找回它。',
      confirmText: '移入回收站',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/blog/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            showToast('已移入回收站', 'success');
          } else {
            showToast('移动失败', 'error');
          }
        } catch (_error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /**
   * 触发批量发布草稿确认对话框
   */
  const handleBatchPublish = async () => {
    if (selectedIds.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: '批量发布',
      description: `确定要发布选中的 ${selectedIds.length} 篇草稿吗？`,
      confirmText: '全部发布',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const results = await Promise.all(
            selectedIds.map(id => 
              fetch(`/api/blog/${id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ draft: false }),
              })
            )
          );

          const successCount = results.filter(r => r.ok).length;
          if (successCount > 0) {
            const successIds = selectedIds.filter((_, i) => results[i]?.ok);
            setBlogs(prev => prev.filter(b => !successIds.includes(b.id)));
            setSelectedIds(prev => prev.filter(id => !successIds.includes(id)));
            showToast(`成功发布 ${successCount} 篇文章`, 'success');
          } else {
            showToast('发布失败', 'error');
          }
        } catch (_error) {
          showToast('批量操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /**
   * 触发批量移入回收站确认对话框
   */
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    setConfirmConfig({
      isOpen: true,
      title: '批量删除',
      description: `确定要将选中的 ${selectedIds.length} 篇草稿移入回收站吗？`,
      confirmText: '全部删除',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const results = await Promise.all(
            selectedIds.map(id => 
              fetch(`/api/blog/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              })
            )
          );

          const successCount = results.filter(r => r.ok).length;
          if (successCount > 0) {
            const successIds = selectedIds.filter((_, i) => results[i]?.ok);
            setBlogs(prev => prev.filter(b => !successIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`成功将 ${successCount} 篇文章移入回收站`, 'success');
          } else {
            showToast('删除失败', 'error');
          }
        } catch (_error) {
          showToast('批量删除出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /**
   * 切换选择
   */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedBlogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBlogs.map(b => b.id));
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
      />
      
      <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">草稿箱</h1>
          <p className="text-[#86909C] mt-1 text-sm">管理您的未发布草稿</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
              <span className="text-xs text-[#86909C] mr-2">已选 {selectedIds.length} 项</span>
              <Button onClick={handleBatchPublish} className="h-8 px-3 text-xs bg-[#00B42A] hover:bg-[#009A22] text-white rounded-lg flex items-center gap-1.5 shadow-sm">
                <Send className="w-3.5 h-3.5" />
                批量发布
              </Button>
              <Button onClick={handleBatchDelete} className="h-8 px-3 text-xs bg-[#F53F3F] hover:bg-[#D32020] text-white rounded-lg flex items-center gap-1.5 shadow-sm">
                <Trash2 className="w-3.5 h-3.5" />
                批量移入回收站
              </Button>
            </div>
          )}
        </div>
      </div>

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
  );
}

