'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Trash2, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle, Inbox } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Toast, EmptyState } from '@/components/admin/pages/CommonComponents';

// 动态导入重型组件以减小服务端 Worker 体积
const CustomDateRangePicker = dynamic(() => import('@/components/admin/pages/CustomDateRangePicker').then(mod => mod.CustomDateRangePicker), { ssr: false });
const CustomSelect = dynamic(() => import('@/components/admin/pages/CustomSelect').then(mod => mod.CustomSelect), { ssr: false });

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

/**
 * 回收站页面组件
 */
export default function TrashPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
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
    variant: 'danger',
    onConfirm: () => {},
  });
  
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 显示 Toast 提示信息
   * @param message - 提示文本内容
   * @param type - 提示类型：'success' | 'error' | 'info' | 'warning'，默认为 'info'
   * @returns void
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  /**
   * 异步获取回收站中的博客文章列表
   * @param isInitial - 是否为初始加载，如果是则不提示“未找到内容”
   * @returns Promise<void>
   */
  const fetchBlogs = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/blog?limit=100&status=deleted`;
      if (filterCategory) url += `&category=${encodeURIComponent(filterCategory)}`;
      if (filterTag) url += `&tag=${encodeURIComponent(filterTag)}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      const json = await res.json();
      if (res.ok) {
        let filteredData = json.data || [];
        if (filterTitle) filteredData = filteredData.filter((b: Blog) => b.title.toLowerCase().includes(filterTitle.toLowerCase()));
        if (filterDateRange.start) filteredData = filteredData.filter((b: Blog) => new Date(b.deleted_at) >= new Date(filterDateRange.start));
        if (filterDateRange.end) {
          const endDate = new Date(filterDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          filteredData = filteredData.filter((b: Blog) => new Date(b.deleted_at) <= endDate);
        }
        setBlogs(filteredData);

        // 如果不是初始加载且没有找到匹配内容，显示提示
        if (!isInitial && filteredData.length === 0) {
          showToast('未找到匹配内容', 'info');
        }
      } else {
        showToast(json.error || '获取回收站失败', 'error');
      }
    } catch (_error) {
      showToast('网络请求失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterTag, filterTitle, filterDateRange, showToast]);

  /**
   * 异步获取筛选所需的分类和标签
   */
  const fetchFilters = useCallback(async () => {
    const [catRes, tagRes] = await Promise.all([
      supabase.from('categories').select('name'),
      supabase.from('tags').select('name')
    ]);
    setCategories(catRes.data?.map(c => c.name) || []);
    setTags(tagRes.data?.map(t => t.name) || []);
  }, []);

  useEffect(() => {
    fetchFilters();
    fetchBlogs(true);
  }, [fetchFilters, fetchBlogs]);

  /**
   * 执行筛选操作（带防抖逻辑）
   * @returns void
   */
  const handleFilter = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setCurrentPage(1);
    debounceTimer.current = setTimeout(() => fetchBlogs(), 300);
  }, [fetchBlogs]);

  /**
   * 重置所有筛选条件并重新加载数据
   * @returns void
   */
  const handleReset = useCallback(() => {
    setFilterTitle('');
    setFilterCategory('');
    setFilterTag('');
    setFilterDateRange({ start: '', end: '' });
    setCurrentPage(1);
    setTimeout(() => fetchBlogs(true), 100);
  }, [fetchBlogs]);

  /**
   * 触发恢复文章确认对话框
   * @param id - 文章 ID
   * @returns void
   */
  const handleRestore = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认恢复文章',
      description: '确定要恢复这篇文章吗？恢复后文章将重新出现在已发布列表中。',
      confirmText: '确认恢复',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/blog/${id}?restore=true`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showToast('文章已恢复', 'success');
          } else {
            showToast('恢复失败', 'error');
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
   * 触发彻底删除文章确认对话框
   * @param id - 文章 ID
   * @returns void
   */
  const handlePermanentDelete = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '确认彻底删除',
      description: '确定要彻底删除这篇文章吗？此操作不可撤销，文章数据将永久丢失！',
      confirmText: '彻底删除',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/blog/${id}?permanent=true`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (res.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            showToast('文章已彻底删除', 'success');
          } else {
            showToast('删除失败', 'error');
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
   * 触发批量恢复文章确认对话框
   * @returns void
   */
  const handleBatchRestore = () => {
    if (selectedIds.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: '确认批量恢复',
      description: `确定要恢复选中的 ${selectedIds.length} 篇文章吗？`,
      confirmText: '批量恢复',
      variant: 'info',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/blog`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}` 
            },
            body: JSON.stringify({
              ids: selectedIds,
              updates: { is_deleted: false, deleted_at: null }
            })
          });

          if (res.ok) {
            setBlogs(prev => prev.filter(b => !selectedIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`已成功恢复 ${selectedIds.length} 篇文章`, 'success');
          } else {
            showToast('批量恢复失败', 'error');
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
   * 触发批量彻底删除文章确认对话框
   * @returns void
   */
  const handleBatchPermanentDelete = () => {
    if (selectedIds.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: '确认批量彻底删除',
      description: `确定要彻底删除选中的 ${selectedIds.length} 篇文章吗？此操作不可撤销！`,
      confirmText: '批量彻底删除',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/blog?permanent=true`, {
            method: 'DELETE',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}` 
            },
            body: JSON.stringify({ ids: selectedIds })
          });

          if (res.ok) {
            setBlogs(prev => prev.filter(b => !selectedIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`已成功彻底删除 ${selectedIds.length} 篇文章`, 'success');
          } else {
            showToast('批量删除失败', 'error');
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
   * 切换文章的选择状态
   * @param id - 文章 ID
   * @returns void
   */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  /**
   * 在全选和取消全选之间切换当前页的所有文章
   * @returns void
   */
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedBlogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBlogs.map(b => b.id));
    }
  };

  /**
   * 根据当前页码对博客列表进行分页处理
   * @returns Blog[] - 当前页的博客文章数组
   */
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return blogs.slice(start, start + pageSize);
  }, [blogs, currentPage]);

  const totalPages = Math.ceil(blogs.length / pageSize) || 1;

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 确认对话框 */}
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
          <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">回收站</h1>
          <p className="text-[#86909C] mt-1 text-sm">管理已删除的文章，可进行恢复或彻底删除</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
              <span className="text-xs text-[#86909C] mr-2">已选 {selectedIds.length} 项</span>
              <Button onClick={handleBatchRestore} className="h-8 px-3 text-xs bg-[#00B42A] hover:bg-[#009A22] text-white rounded-lg flex items-center gap-1.5 shadow-sm">
                <RotateCcw className="w-3.5 h-3.5" />
                批量恢复
              </Button>
              <Button onClick={handleBatchPermanentDelete} className="h-8 px-3 text-xs bg-[#F53F3F] hover:bg-[#D32020] text-white rounded-lg flex items-center gap-1.5 shadow-sm">
                <Trash2 className="w-3.5 h-3.5" />
                批量彻底删除
              </Button>
              <div className="w-px h-4 bg-[#E5E6EB] mx-1" />
            </div>
          )}
          <div className="bg-[#FFF7E8] border border-[#FF7D00]/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[#FF7D00] text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>彻底删除后将无法找回</span>
          </div>
        </div>
      </div>

      <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white relative z-20">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            <div className="flex items-center gap-2 w-full sm:w-[180px]">
              <span className="text-[#4E5969] text-sm whitespace-nowrap min-w-[32px]">标题:</span>
              <div className="relative w-full">
                <Input placeholder="请输入关键词" className="h-8 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-[#165DFF]/10 transition-all text-xs rounded-lg w-full pr-7" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilter()} />
              </div>
            </div>
            <div className="w-full sm:w-[140px]">
              <CustomSelect label="分类" placeholder="请选择分类" value={filterCategory} onChange={setFilterCategory} options={categories} />
            </div>
            <div className="w-full sm:w-[140px]">
              <CustomSelect label="标签" placeholder="请选择标签" value={filterTag} onChange={setFilterTag} options={tags} />
            </div>
            <div className="flex-1 min-w-[300px]">
              <CustomDateRangePicker label="删除时间" value={filterDateRange} onChange={setFilterDateRange} />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button 
                onClick={handleFilter} 
                className="h-8 px-4 text-xs bg-[#E8F3FF] text-[#165DFF] hover:bg-[#D1E9FF] border border-[#165DFF]/10 rounded-lg transition-all flex items-center gap-1.5 shadow-none font-bold"
              >
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset} className="h-8 px-4 text-xs border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] rounded-lg shadow-none">重置</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-[#F2F3F5]">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
                    checked={paginatedBlogs.length > 0 && selectedIds.length === paginatedBlogs.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">标题</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">分类</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">标签</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">删除时间</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F3F5]">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-3"><Inbox className="w-10 h-10 text-[#C9CDD4] animate-pulse" /><p className="text-[#86909C] text-sm">加载中...</p></div></td></tr>
              ) : paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <tr key={blog.id} className={cn("hover:bg-[#F9FBFF] transition-colors group", selectedIds.includes(blog.id) && "bg-[#F9FBFF]")}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20"
                        checked={selectedIds.includes(blog.id)}
                        onChange={() => toggleSelect(blog.id)}
                      />
                    </td>
                    <td className="px-6 py-4"><div className="flex flex-col gap-1"><span className="text-sm font-medium text-[#1D2129] group-hover:text-[#165DFF] transition-colors line-clamp-1">{blog.title}</span><span className="text-xs text-[#86909C] line-clamp-1">{blog.excerpt || '暂无摘要'}</span></div></td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F3FF] text-[#165DFF]">{blog.category || '未分类'}</span></td>
                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{blog.tags?.map(tag => <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F2F3F5] text-[#4E5969]">{tag}</span>) || <span className="text-xs text-[#C9CDD4]">-</span>}</div></td>
                    <td className="px-6 py-4 text-xs text-[#86909C]">{blog.deleted_at ? formatDate(blog.deleted_at) : formatDate(blog.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => handleRestore(blog.id)} variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#00B42A] hover:bg-[#EFFFF0] rounded-lg" title="恢复"><RotateCcw className="w-4 h-4" /></Button>
                        <Button onClick={() => handlePermanentDelete(blog.id)} variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#F53F3F] hover:bg-[#FFF2F2] rounded-lg" title="彻底删除"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6}><EmptyState message="回收站暂无内容" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F7F8FA] border-t border-[#F2F3F5] flex items-center justify-between">
            <p className="text-xs text-[#86909C]">共 {blogs.length} 篇文章</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-xs font-medium text-[#1D2129]">第 {currentPage} 页 / 共 {totalPages} 页</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
