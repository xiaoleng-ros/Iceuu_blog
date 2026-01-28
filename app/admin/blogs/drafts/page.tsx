'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Edit, Trash2, Inbox, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, Calendar, ChevronDown, ChevronsLeft, ChevronsRight, Send } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval,
  parseISO,
  isBefore
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 空状态组件
 * @param {string} message - 显示的消息
 * @param {string} className - 自定义样式类
 * @param {boolean} small - 是否使用紧凑模式
 */
const EmptyState = ({ message = "暂无数据", className, small = false }: { message?: string, className?: string, small?: boolean }) => (
  <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", small && "py-4", className)}>
    <div className={cn("mb-2 opacity-60", small && "mb-1")}>
      <div className={cn(
        "bg-[#F7F8FA] rounded-full flex items-center justify-center mb-1",
        small ? "w-10 h-10" : "w-14 h-14"
      )}>
        <Inbox className={cn("text-[#C9CDD4] stroke-[1]", small ? "w-5 h-5" : "w-7 h-7")} />
      </div>
    </div>
    <p className="text-[#86909C] text-xs font-normal">{message}</p>
  </div>
);

/**
 * Toast 提示组件
 */
const Toast = ({ 
  message, 
  type = 'info', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info' | 'warning'; 
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#00B42A]" />,
    error: <XCircle className="w-4 h-4 text-[#F53F3F]" />,
    warning: <AlertCircle className="w-4 h-4 text-[#FF7D00]" />,
    info: <AlertCircle className="w-4 h-4 text-[#165DFF]" />
  };

  const bgColors = {
    success: 'bg-[#EFFFF0] border-[#00B42A]/20',
    error: 'bg-[#FFF2F2] border-[#F53F3F]/20',
    warning: 'bg-[#FFF7E8] border-[#FF7D00]/20',
    info: 'bg-[#E8F3FF] border-[#165DFF]/20'
  };

  return (
    <div className={cn(
      "fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300",
      bgColors[type]
    )}>
      {icons[type]}
      <span className="text-sm font-medium text-[#1D2129]">{message}</span>
    </div>
  );
};

/**
 * 自定义日期范围选择器组件
 */
const CustomDateRangePicker = ({
  value,
  onChange,
  label
}: {
  value: { start: string; end: string };
  onChange: (val: { start: string; end: string }) => void;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!value.start || (value.start && value.end)) {
      onChange({ start: dateStr, end: '' });
    } else {
      if (isBefore(date, parseISO(value.start))) {
        onChange({ start: dateStr, end: '' });
      } else {
        onChange({ ...value, end: dateStr });
        setIsOpen(false);
      }
    }
  };

  const renderCalendar = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

    return (
      <div className="w-[280px] p-4">
        <div className="text-center font-bold text-[#1D2129] mb-4 text-sm">
          {format(monthDate, 'yyyy年 M月', { locale: zhCN })}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[#86909C] text-xs py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day, idx) => {
            const isSelected = (value.start && isSameDay(day, parseISO(value.start))) || 
                              (value.end && isSameDay(day, parseISO(value.end)));
            const isInRange = value.start && value.end && 
                             isWithinInterval(day, { start: parseISO(value.start), end: parseISO(value.end) });
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-8 w-full flex items-center justify-center text-xs transition-all relative",
                  !isCurrentMonth ? "text-[#C9CDD4]" : "text-[#1D2129] hover:bg-[#F2F3F5] rounded-md",
                  isSelected && "bg-[#165DFF] text-white rounded-md z-10 hover:bg-[#165DFF]",
                  isInRange && !isSelected && "bg-[#E8F3FF] text-[#165DFF] rounded-none"
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 relative w-full">
      <span className="text-[#4E5969] text-sm whitespace-nowrap min-w-[56px]">{label}:</span>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-8 rounded-lg border px-3 text-xs flex items-center justify-between transition-all bg-white",
            isOpen ? "border-[#165DFF] ring-1 ring-[#165DFF]" : "border-[#E5E6EB] hover:border-[#C9CDD4]"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            <span className={cn("truncate", !value.start && "text-[#C9CDD4]")}>
              {value.start ? format(parseISO(value.start), 'yyyy/MM/dd') : "选择起始时间"}
            </span>
            <span className="text-[#C9CDD4]">→</span>
            <span className={cn("truncate", !value.end && "text-[#C9CDD4]")}>
              {value.end ? format(parseISO(value.end), 'yyyy/MM/dd') : "选择结束时间"}
            </span>
          </div>
          <Calendar className="w-3.5 h-3.5 text-[#C9CDD4] ml-2" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 bg-white border border-[#F2F3F5] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-50 overflow-hidden flex flex-col min-w-[600px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F2F3F5]">
                <div className="flex gap-1">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 12))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 12))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex divide-x divide-[#F2F3F5]">
                {renderCalendar(currentMonth)}
                {renderCalendar(addMonths(currentMonth, 1))}
              </div>
              <div className="p-3 border-t border-[#F2F3F5] flex justify-end gap-2 bg-[#F9FBFF]/50">
                <Button variant="outline" className="h-8 px-4 text-xs" onClick={() => { onChange({ start: '', end: '' }); setIsOpen(false); }}>重 置</Button>
                <Button className="h-8 px-4 text-xs bg-[#165DFF] hover:bg-[#0E42D2] text-white" onClick={() => setIsOpen(false)}>确 定</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * 自定义选择器组件
 */
const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  label 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  placeholder: string;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 relative group w-full">
      <span className="text-[#4E5969] text-sm whitespace-nowrap min-w-[32px]">{label}:</span>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-8 rounded-lg border px-2 text-xs flex items-center justify-between transition-all bg-white",
            isOpen ? "border-[#165DFF] ring-1 ring-[#165DFF]" : "border-[#E5E6EB] hover:border-[#C9CDD4]",
            value ? "text-[#1D2129]" : "text-[#86909C]"
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-[#86909C] transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#F2F3F5] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
              {options.length > 0 ? (
                <div className="max-h-60 overflow-y-auto py-1">
                  {options.map((opt) => (
                    <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={cn("w-full text-left px-3 py-2 text-xs hover:bg-[#F2F3F5] transition-colors", value === opt ? "text-[#165DFF] bg-[#E8F3FF] font-medium" : "text-[#4E5969]")}>{opt}</button>
                  ))}
                </div>
              ) : (
                <EmptyState small />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

/**
 * 草稿箱页面组件
 */
export default function DraftsPage() {
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
    variant: 'info',
    onConfirm: () => {},
  });
  
  // 筛选和分页状态
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 显示提示信息
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  /**
   * 获取博客列表
   */
  const fetchBlogs = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/blog?limit=100&status=draft`;
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
        if (filterTitle) {
          filteredData = filteredData.filter((b: Blog) => b.title.toLowerCase().includes(filterTitle.toLowerCase()));
        }
        if (filterDateRange.start) {
          filteredData = filteredData.filter((b: Blog) => new Date(b.created_at) >= new Date(filterDateRange.start));
        }
        if (filterDateRange.end) {
          const endDate = new Date(filterDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          filteredData = filteredData.filter((b: Blog) => new Date(b.created_at) <= endDate);
        }
        setBlogs(filteredData);
      } else {
        showToast(json.error || '获取草稿失败', 'error');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      showToast('网络请求失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterTag, filterTitle, filterDateRange, showToast]);

  useEffect(() => {
    // 获取分类和标签
    const fetchFilters = async () => {
      const { data: catData } = await supabase.from('categories').select('name');
      const { data: tagData } = await supabase.from('tags').select('name');
      setCategories(catData?.map(c => c.name) || []);
      setTags(tagData?.map(t => t.name) || []);
    };
    fetchFilters();
    fetchBlogs(true);
  }, [fetchBlogs]);

  /**
   * 执行筛选
   */
  const handleFilter = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setCurrentPage(1);
    debounceTimer.current = setTimeout(() => fetchBlogs(), 300);
  }, [fetchBlogs]);

  /**
   * 重置筛选
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
   * 发布草稿
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
        } catch (error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /**
   * 移入回收站
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
        } catch (error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /**
   * 批量发布草稿
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

          const res = await fetch(`/api/blog`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}` 
            },
            body: JSON.stringify({
              ids: selectedIds,
              updates: { draft: false }
            })
          });

          if (res.ok) {
            setBlogs(prev => prev.filter(b => !selectedIds.includes(b.id)));
            setSelectedIds([]);
            showToast(`已成功发布 ${selectedIds.length} 篇文章`, 'success');
          } else {
            showToast('批量发布失败', 'error');
          }
        } catch (error) {
          showToast('操作出错', 'error');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  /**
   * 批量移入回收站
   */
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    setConfirmConfig({
      isOpen: true,
      title: '批量移入回收站',
      description: `确定要将选中的 ${selectedIds.length} 篇草稿移入回收站吗？`,
      confirmText: '全部移入',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/blog`, {
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
            showToast(`已成功将 ${selectedIds.length} 篇文章移入回收站`, 'success');
          } else {
            showToast('批量操作失败', 'error');
          }
        } catch (error) {
          showToast('操作出错', 'error');
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

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return blogs.slice(start, start + pageSize);
  }, [blogs, currentPage]);

  const totalPages = Math.ceil(blogs.length / pageSize) || 1;

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
              </div>
            </div>
            <div className="w-full sm:w-[140px]">
              <CustomSelect label="分类" placeholder="请选择分类" value={filterCategory} onChange={setFilterCategory} options={categories} />
            </div>
            <div className="w-full sm:w-[140px]">
              <CustomSelect label="标签" placeholder="请选择标签" value={filterTag} onChange={setFilterTag} options={tags} />
            </div>
            <div className="flex-1 min-w-[300px]">
              <CustomDateRangePicker label="保存时间" value={filterDateRange} onChange={setFilterDateRange} />
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
                <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">保存时间</th>
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
                    <td className="px-6 py-4 text-xs text-[#86909C]">{formatDate(blog.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/blogs/${blog.id}`} title="编辑"><Button variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF] rounded-lg"><Edit className="w-4 h-4" /></Button></Link>
                        <Button onClick={() => handlePublish(blog.id)} variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#00B42A] hover:bg-[#EFFFF0] rounded-lg" title="发布"><Send className="w-4 h-4" /></Button>
                        <Button onClick={() => handleDelete(blog.id)} variant="ghost" size="icon" className="h-8 w-8 text-[#4E5969] hover:text-[#F53F3F] hover:bg-[#FFF2F2] rounded-lg" title="移入回收站"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6}><EmptyState message="草稿箱暂无内容" /></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#F7F8FA] border-t border-[#F2F3F5] flex items-center justify-between">
            <p className="text-xs text-[#86909C]">共 {blogs.length} 篇草稿</p>
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
