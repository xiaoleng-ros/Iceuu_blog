'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Edit, Trash2, Plus, Eye, Loader2, Search, Download, ChevronLeft, ChevronRight, Calendar, ChevronDown, Inbox, ChevronsLeft, ChevronsRight, XCircle, CheckCircle2, AlertCircle, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
  isAfter,
  isBefore,
  startOfDay
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 空状态组件 (匹配图片样式)
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

// Toast 提示组件
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

// 自定义日期范围选择器组件
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
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // 默认显示2026年1月

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
                <Button 
                  variant="outline" 
                  className="h-8 px-4 text-xs"
                  onClick={() => {
                    onChange({ start: '', end: '' });
                    setIsOpen(false);
                  }}
                >
                  重 置
                </Button>
                <Button 
                  className="h-8 px-4 text-xs bg-[#165DFF] hover:bg-[#0E42D2] text-white"
                  onClick={() => setIsOpen(false)}
                >
                  确 定
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 自定义选择器组件
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
                    <button
                      key={opt}
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs hover:bg-[#F2F3F5] transition-colors",
                        value === opt ? "text-[#165DFF] bg-[#E8F3FF] font-medium" : "text-[#4E5969]"
                      )}
                    >
                      {opt}
                    </button>
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
