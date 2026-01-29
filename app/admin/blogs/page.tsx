'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Edit, Trash2, Plus, Eye, Loader2, Search, Download, ChevronLeft, ChevronRight, RotateCcw, XCircle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Toast, EmptyState } from '@/components/admin/pages/CommonComponents';

// 动态导入重型组件，ssr: false 确保不进入服务端 Worker 压缩包
const CustomDateRangePicker = dynamic(() => import('@/components/admin/pages/CustomDateRangePicker').then(mod => mod.CustomDateRangePicker), { ssr: false });
const CustomSelect = dynamic(() => import('@/components/admin/pages/CustomSelect').then(mod => mod.CustomSelect), { ssr: false });

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

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // 删除确认对话框状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState<string | null>(null);
  
  // Sorting states
  type SortDirection = 'asc' | 'desc' | null;
  interface SortConfig {
    key: keyof Blog;
    direction: SortDirection;
  }
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([{ key: 'id', direction: 'desc' }]);
  
  // Filter states
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 处理排序点击
   */
  const handleSort = (key: keyof Blog, multiSort = false) => {
    setSortConfigs(prev => {
      const existingIndex = prev.findIndex(c => c.key === key);
      
      if (multiSort) {
        // 多字段排序逻辑
        if (existingIndex > -1) {
          const currentDir = prev[existingIndex].direction;
          const nextDir = currentDir === 'desc' ? 'asc' : 'desc';
          const newConfigs = [...prev];
          newConfigs[existingIndex] = { key, direction: nextDir };
          return newConfigs;
        } else {
          return [...prev, { key, direction: 'desc' }];
        }
      } else {
        // 单字段排序逻辑（清除其他字段）
        if (existingIndex > -1) {
          const currentDir = prev[existingIndex].direction;
          const nextDir = currentDir === 'desc' ? 'asc' : 'desc';
          return [{ key, direction: nextDir }];
        } else {
          return [{ key, direction: 'desc' }];
        }
      }
    });
  };

  /**
   * 应用排序逻辑
   */
  const sortedBlogs = useMemo(() => {
    if (sortConfigs.length === 0) return blogs;

    return [...blogs].sort((a, b) => {
      for (const config of sortConfigs) {
        const { key, direction } = config;
        if (!direction) continue;

        let valA: any = a[key];
        let valB: any = b[key];

        // 数字类型处理
        if (key === 'views' || key === 'comments_count') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } 
        // 日期类型处理
        else if (key === 'created_at') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        // 字符串/其他处理
        else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [blogs, sortConfigs]);

  /**
   * 分页后的数据
   */
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBlogs.slice(start, start + pageSize);
  }, [sortedBlogs, currentPage]);

  const totalPages = Math.ceil(sortedBlogs.length / pageSize) || 1;

  /**
   * 渲染排序图标 (明显的 ▲▼ 分开设计)
   */
  const SortIndicator = ({ columnKey }: { columnKey: keyof Blog }) => {
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
   * 显示提示信息
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  /**
   * 获取分类和标签
   */
  const fetchFilters = async () => {
    try {
      const { data: catData } = await supabase.from('categories').select('name');
      const { data: tagData } = await supabase.from('tags').select('name');
      setCategories(catData?.map(c => c.name) || []);
      setTags(tagData?.map(t => t.name) || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
      showToast('获取筛选条件失败', 'error');
    }
  };

  /**
   * 获取博客列表
   */
  const fetchBlogs = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/blog?limit=100&status=published`;
      if (filterCategory) url += `&category=${encodeURIComponent(filterCategory)}`;
      if (filterTag) url += `&tag=${encodeURIComponent(filterTag)}`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      const json = await res.json();
      if (res.ok) {
        let filteredData = json.data || [];
        
        // 标题筛选：支持模糊匹配
        if (filterTitle) {
          filteredData = filteredData.filter((b: Blog) => 
            b.title.toLowerCase().includes(filterTitle.toLowerCase())
          );
        }

        // 时间范围筛选
        if (filterDateRange.start) {
          filteredData = filteredData.filter((b: Blog) => 
            new Date(b.created_at) >= new Date(filterDateRange.start)
          );
        }
        if (filterDateRange.end) {
          // 结束时间设为该天末尾
          const endDate = new Date(filterDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          filteredData = filteredData.filter((b: Blog) => 
            new Date(b.created_at) <= endDate
          );
        }

        setBlogs(filteredData);
        if (!isInitial && filteredData.length === 0) {
          showToast('未找到匹配内容', 'info');
        }
      } else {
        showToast(json.error || '获取文章列表失败', 'error');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showToast('网络请求失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterTag, filterTitle, filterDateRange, showToast]);

  useEffect(() => {
    fetchFilters();
    fetchBlogs(true);
  }, []);

  /**
   * 执行筛选操作（带防抖和验证）
   */
  const handleFilter = useCallback(() => {
    // 1. 检查筛选条件是否为空
    const hasValue = filterTitle.trim() !== '' || 
                     filterCategory !== '' || 
                     filterTag !== '' || 
                     (filterDateRange.start !== '' || filterDateRange.end !== '');

    if (!hasValue) {
      showToast('筛选条件不能为空', 'warning');
      return;
    }

    // 2. 防抖处理
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setCurrentPage(1); // 筛选时重置到第一页
    debounceTimer.current = setTimeout(() => {
      fetchBlogs();
    }, 300);
  }, [filterTitle, filterCategory, filterTag, filterDateRange, fetchBlogs, showToast]);

  /**
   * 重置筛选条件
   */
  const handleReset = useCallback(() => {
    setFilterTitle('');
    setFilterCategory('');
    setFilterTag('');
    setFilterDateRange({ start: '', end: '' });
    setCurrentPage(1); // 重置时回到第一页
    
    // 重置后重新获取全部数据
    setLoading(true);
    setTimeout(() => {
      fetchBlogs(true);
    }, 100);
  }, [fetchBlogs]);

  /**
   * 导出文章列表为 CSV 文件
   */
  const handleExport = () => {
    // Basic CSV export
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
   * 将文章移入回收站
   * @param id 文章ID
   */
  const handleDelete = async (id: string) => {
    setBlogIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  /**
   * 确认执行删除操作
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
      setBlogIdToDelete(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* 删除确认对话框 */}
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
      
      <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5]">
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">已发布文章</h1>
        <p className="text-[#86909C] mt-1 text-sm">管理您的所有已发布文章内容</p>
      </div>

      <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white relative z-20">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            <div className="flex items-center gap-2 w-full sm:w-[180px]">
              <span className="text-[#4E5969] text-sm whitespace-nowrap min-w-[32px]">标题:</span>
              <div className="relative w-full">
                <Input 
                  placeholder="请输入关键词" 
                  className="h-8 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-[#165DFF]/10 transition-all text-xs rounded-lg w-full pr-7"
                  value={filterTitle}
                  onChange={(e) => setFilterTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
                {filterTitle && (
                  <button 
                    onClick={() => setFilterTitle('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C9CDD4] hover:text-[#86909C] transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full sm:w-[140px]">
              <CustomSelect 
                label="分类"
                placeholder="请选择分类"
                value={filterCategory}
                onChange={setFilterCategory}
                options={categories}
              />
            </div>
            
            <div className="w-full sm:w-[140px]">
              <CustomSelect 
                label="标签"
                placeholder="请选择标签"
                value={filterTag}
                onChange={setFilterTag}
                options={tags}
              />
            </div>
            
            <div className="w-full sm:w-[280px]">
              <CustomDateRangePicker 
                label="时间范围"
                value={filterDateRange}
                onChange={setFilterDateRange}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                className="bg-[#E8F3FF] text-[#165DFF] hover:bg-[#D1E9FF] h-8 px-4 border border-[#165DFF]/20 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-none flex items-center gap-1.5"
                onClick={handleFilter}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                筛 选
              </Button>
              <Button 
                variant="outline"
                className="h-8 px-4 border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] hover:text-[#1D2129] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-none text-xs whitespace-nowrap"
                onClick={handleReset}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置
              </Button>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Button 
                className="bg-[#EFFFF0] text-[#00B42A] hover:bg-[#D1FFD6] h-8 px-4 border border-[#00B42A]/20 rounded-lg transition-all active:scale-95 shadow-none font-bold text-xs flex items-center justify-center whitespace-nowrap"
                onClick={handleExport}
              >
                导出文章
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white relative overflow-hidden">
        {/* Table Loading Overlay */}
        {loading && blogs.length > 0 && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-30 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white/80 p-4 rounded-2xl shadow-xl border border-[#F2F3F5] flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#165DFF]" />
              <span className="text-sm font-medium text-[#4E5969]">正在筛选内容...</span>
            </div>
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E5E6EB] scrollbar-track-transparent">
            <table className="w-full text-sm text-left">
              <thead className="text-[13px] text-[#4E5969] font-bold bg-[#F9FBFF]/50 border-b border-[#F2F3F5]">
                <tr>
                  <th scope="col" className="px-4 py-4 w-10">
                    <input type="checkbox" className="rounded border-[#E5E6EB] text-[#165DFF] focus:ring-[#165DFF]/20" />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 font-bold"
                  >
                    <div className="flex items-center relative">
                      ID
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">标题</th>
                  <th scope="col" className="px-6 py-4 font-bold">摘要</th>
                  <th scope="col" className="px-6 py-4 font-bold">分类</th>
                  <th scope="col" className="px-6 py-4 font-bold">标签</th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 font-bold text-center cursor-pointer hover:bg-[#F2F3F5] transition-colors group/header"
                    onClick={(e) => handleSort('views', e.shiftKey)}
                  >
                    <div className="flex items-center justify-center relative">
                      浏览量
                      <SortIndicator columnKey="views" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 font-bold text-center cursor-pointer hover:bg-[#F2F3F5] transition-colors group/header"
                    onClick={(e) => handleSort('comments_count', e.shiftKey)}
                  >
                    <div className="flex items-center justify-center relative">
                      评论数量
                      <SortIndicator columnKey="comments_count" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold text-center">状态</th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 font-bold text-center cursor-pointer hover:bg-[#F2F3F5] transition-colors group/header"
                    onClick={(e) => handleSort('created_at', e.shiftKey)}
                  >
                    <div className="flex items-center justify-center relative">
                      发布时间
                      <SortIndicator columnKey="created_at" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F3F5]">
                {paginatedBlogs.length > 0 ? (
                  paginatedBlogs.map((blog) => (
                    <tr key={blog.id} className="bg-white hover:bg-[#F9FBFF]/50 transition-colors group">
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
                          blog.draft 
                            ? 'bg-[#FFF7E8] text-[#FF7D00]' 
                            : 'bg-[#E8FFEA] text-[#00B42A]'
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
                            onClick={() => handleDelete(blog.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
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
          
          {/* Pagination (简约风格) */}
          <div className="px-6 py-6 flex items-center justify-center gap-8 border-t border-[#F2F3F5]">
            <button 
              className="text-[#C9CDD4] hover:text-[#86909C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[#1D2129] font-medium text-sm">
              {currentPage} / {totalPages}
            </span>
            <button 
              className="text-[#C9CDD4] hover:text-[#86909C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
