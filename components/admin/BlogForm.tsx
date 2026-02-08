'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Editor from './Editor';
import { 
  FileText, 
  Hash, 
  Send, 
  Settings2,
  Clock,
  ChevronDown,
  Check,
  Image as ImageIcon,
  Link2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toast } from '@/components/admin/pages/CommonComponents';

interface BlogFormProps {
  initialData?: any;
  isEditing?: boolean;
}

/**
 * 博客表单组件
 * 用于创建或编辑博客文章，包含标题、内容、分类和封面图设置
 * @param {BlogFormProps} props - 组件属性
 * @returns {JSX.Element}
 */
export default function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [errors, setErrors] = useState<{ title?: boolean; content?: boolean }>({});
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    cover_image: '',
    draft: true,
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const CATEGORIES = [
    '生活边角料',
    '情绪随笔',
    '干货分享',
    '成长复盘'
  ];

  // 页面状态持久化 key
  const STORAGE_KEY = isEditing ? `blog_edit_${initialData?.id}` : 'blog_new_draft';

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. 初始化数据（从 initialData 或 localStorage）
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || CATEGORIES[0] || '',
        cover_image: initialData.cover_image || '',
        draft: initialData.draft ?? true,
      });
    } else {
      // 尝试从 localStorage 恢复
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            category: parsed.category || CATEGORIES[0] || ''
          }));
        } catch (e) {
          console.error('Failed to parse saved draft:', e);
          setFormData(prev => ({ ...prev, category: CATEGORIES[0] || '' }));
        }
      } else {
        setFormData(prev => ({ ...prev, category: CATEGORIES[0] || '' }));
      }
    }
  }, [initialData, STORAGE_KEY]);

  // 2. 自动保存到 localStorage
  useEffect(() => {
    if (formData.title || formData.content) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, STORAGE_KEY]);

  // 3. 提交或保存成功后清除 localStorage
  /**
   * 清除本地草稿存储
   */
  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * 处理通用表单字段变更
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - 变更事件对象
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * 处理编辑器内容变更
   * @param {string} content - 富文本内容
   */
  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  /**
   * 处理图片上传
   * @param {React.ChangeEvent<HTMLInputElement>} e - 文件变更事件
   * @returns {Promise<void>}
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过 5MB', 'warning');
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('请先登录', 'error');
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'post');
      if (initialData?.id) {
        formDataUpload.append('contextId', initialData.id);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formDataUpload
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '上传失败');
      }

      const data = await res.json();
      setFormData(prev => ({ ...prev, cover_image: data.data.url }));
      showToast('图片上传成功', 'success');
    } catch (error: any) {
      console.error('上传封面图失败:', error);
      showToast(error.message || '图片上传失败', 'error');
    } finally {
      setUploading(false);
      // 清空 input，允许重复上传同一张图
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * 显示提示信息
   * @param {string} message - 提示消息内容
   * @param {'success' | 'error' | 'info' | 'warning'} type - 提示类型
   * @returns {void}
   */
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  /**
   * 处理草稿保存
   * @returns {Promise<void>}
   */
  const handleSaveDraft = async () => {
    // 1. 表单验证逻辑
    const titleTrimmed = formData.title.trim();
    // 去除 HTML 标签和空白字符
    const contentPlain = formData.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

    // 如果标题和正文都为空，则不允许保存
    if (titleTrimmed.length === 0 && contentPlain.length === 0) {
      setErrors({ title: true, content: true });
      showToast('文章标题和正文不能同时为空', 'warning');
      return;
    }

    // 清除之前的错误状态
    setErrors({});
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('请先登录', 'error');
        return;
      }

      const payload = {
        ...formData,
        draft: true,
      };

      const url = isEditing ? `/api/blog/${initialData.id}` : '/api/blog';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        clearStorage();
        showToast('草稿保存成功', 'success');
      } else {
        const json = await res.json();
        console.error('保存草稿失败:', json.error);
        showToast(`保存失败: ${json.error}`, 'error');
      }
    } catch (error) {
      console.error('保存草稿异常:', error);
      showToast('网络请求异常，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理文章发布
   * @param {React.FormEvent} e - 表单提交事件
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. 表单验证逻辑
    const titleTrimmed = formData.title.trim();
    if (titleTrimmed.length === 0) {
      setErrors(prev => ({ ...prev, title: true }));
      showToast('文章标题不能为空', 'warning');
      return;
    }

    // 去除 HTML 标签和空白字符
    const contentPlain = formData.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (contentPlain.length === 0) {
      setErrors(prev => ({ ...prev, content: true }));
      showToast('文章内容不能为空', 'warning');
      return;
    }

    // 清除之前的错误状态
    setErrors({});
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('请先登录', 'error');
        return;
      }

      const payload = {
        ...formData,
        draft: false,
      };

      const url = isEditing ? `/api/blog/${initialData.id}` : '/api/blog';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        clearStorage();
        showToast(isEditing ? '文章更新成功' : '文章发布成功', 'success');
        setTimeout(() => {
          router.push('/admin/blogs');
          router.refresh();
        }, 1500);
      } else {
        const json = await res.json();
        console.error('发布文章失败:', json.error);
        showToast(`发布失败: ${json.error}`, 'error');
      }
    } catch (error) {
      console.error('发布文章异常:', error);
      showToast('网络请求异常，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-20">
      {/* Toast 提示 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* 顶部操作卡片 */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-300">
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] overflow-hidden bg-white">
          <CardContent className="p-5 flex items-center justify-end">
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                disabled={loading}
                onClick={handleSaveDraft}
                className={cn(
                  "h-9 px-6 rounded-lg border-[#E5E6EB] font-medium transition-all hover:bg-[#F7F8FA]",
                  formData.draft ? "bg-[#F2F3F5] border-[#165DFF]/10 text-[#165DFF]" : "text-[#4E5969]"
                )}
              >
                {loading && formData.draft ? (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3.5 h-3.5 border-2 border-[#165DFF]/30 border-t-[#165DFF] rounded-full animate-spin" />
                    保存中...
                  </div>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" /> 存为草稿
                  </>
                )}
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="h-9 px-10 rounded-lg bg-[#E8F3FF] hover:bg-[#D1E9FF] text-[#165DFF] font-bold shadow-none transition-all active:scale-95 disabled:opacity-50 border border-[#165DFF]/10"
              >
                {loading && !formData.draft ? (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3.5 h-3.5 border-2 border-[#165DFF]/30 border-t-[#165DFF] rounded-full animate-spin" />
                    保存中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <Send className="h-4 w-4" /> 
                    {isEditing ? '保存修改' : '保存发布'}
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* 左侧主要内容区 */}
        <div className="xl:col-span-3 space-y-5">
          <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
            <CardContent className="p-8 space-y-8">
              {/* 标题输入区 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#4E5969] font-bold text-sm mb-1">
                  <FileText className="w-4 h-4 text-[#165DFF]" />
                  <span>文章标题</span>
                </div>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.title) setErrors(prev => ({ ...prev, title: false }));
                  }}
                  placeholder="在此输入吸引人的标题..."
                  className={cn(
                    "w-full text-xl md:text-2xl font-bold text-[#1D2129] ...",
                     errors.title && "text-red-500 placeholder:text-red-300"
                  )}
                />
                <div className={cn("h-[1px] w-full bg-[#F2F3F5] transition-colors", errors.title && "bg-red-500/50")} />
              </div>
              
              {/* 编辑器区域 */}
              <div className={cn(
                "pt-2 rounded-xl transition-all",
                errors.content && "ring-2 ring-red-500/20"
              )}>
                <Editor 
                  value={formData.content} 
                  onChange={(val) => {
                    handleEditorChange(val);
                    if (errors.content) setErrors(prev => ({ ...prev, content: false }));
                  }}
                  articleId={initialData?.id}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧侧边栏 */}
        <div className="xl:col-span-1 space-y-5">
          {/* 发布设置卡片 */}
          <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white">
            <CardHeader className="bg-[#F7F8FA] border-b border-[#F2F3F5] px-6 py-4 rounded-t-[16px]">
              <CardTitle className="text-base font-bold text-[#1D2129] flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#165DFF]" />
                发布设置
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-[#4E5969] font-bold text-xs uppercase tracking-wider">当前状态</Label>
                <div className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                  formData.draft 
                    ? "bg-[#FFF7E8] border-[#FF7D00]/20 text-[#FF7D00]" 
                    : "bg-[#E8FFEA] border-[#00B42A]/20 text-[#00B42A]"
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full animate-pulse", formData.draft ? "bg-[#FF7D00]" : "bg-[#00B42A]")} />
                    <span className="text-sm font-black">{formData.draft ? '草稿模式' : '已发布'}</span>
                  </div>
                  <div className="text-[10px] font-medium opacity-70">
                    {formData.draft ? '仅自己可见' : '全网公开'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="category" className="text-[#4E5969] font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" /> 文章分类
                </Label>
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg border border-[#E5E6EB] h-10 bg-white px-3 text-sm transition-all outline-none relative z-20",
                      isCategoryOpen ? "border-[#165DFF] ring-4 ring-[#165DFF]/5 shadow-sm" : "hover:border-[#C9CDD4]"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      formData.category ? "text-[#1D2129]" : "text-[#86909C]"
                    )}>
                      {formData.category || '请选择分类'}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-[#86909C] transition-transform duration-300 ease-in-out",
                      isCategoryOpen && "rotate-180 text-[#165DFF]"
                    )} />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-white border border-[#F2F3F5] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-[280px] overflow-y-auto custom-scrollbar overscroll-contain px-1.5">
                        {CATEGORIES.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category }));
                              setIsCategoryOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 my-0.5 text-sm rounded-lg transition-all duration-200 group",
                              formData.category === category 
                                ? "bg-[#E8F3FF] text-[#165DFF] font-bold" 
                                : "text-[#4E5969] hover:bg-[#F7F8FA] hover:text-[#1D2129] active:scale-[0.98]"
                            )}
                          >
                            <span className="relative z-10">{category}</span>
                            {formData.category === category && (
                              <div className="bg-[#165DFF] rounded-full p-0.5 animate-in zoom-in duration-300">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* 封面图卡片 */}
          <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white">
            <CardHeader className="bg-[#F7F8FA] border-b border-[#F2F3F5] px-6 py-4 rounded-t-[16px]">
              <CardTitle className="text-base font-bold text-[#1D2129] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#165DFF]" />
                封面图片
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* 预览图 */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#F2F3F5] bg-[#F7F8FA] group transition-all cursor-pointer hover:border-[#165DFF]/30 hover:bg-[#F2F6FF]"
              >
                {uploading && (
                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#165DFF] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-[#165DFF]">正在上传...</span>
                  </div>
                )}
                
                {formData.cover_image ? (
                  <>
                    <img 
                      src={formData.cover_image} 
                      alt="Cover preview" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <span className="text-white text-xs font-bold">点击更换封面图</span>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, cover_image: '' }));
                        }}
                        className="mt-2 h-7 rounded-lg bg-white/10 hover:bg-red-500/80 text-white border-none backdrop-blur-md text-[10px]"
                      >
                        清除图片
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#86909C] space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#F2F3F5] group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5 opacity-40 text-[#165DFF]" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-[#4E5969]">点击或拖拽上传封面图</span>
                      <span className="text-[10px] opacity-60 mt-1">建议尺寸 1200x675 (16:9)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 链接输入框 */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Link2 className="w-4 h-4 text-[#86909C]" />
                  </div>
                  <Input
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleChange}
                    placeholder="或在此粘贴外部图片链接..."
                    className="pl-9 h-10 bg-[#F7F8FA] border-[#E5E6EB] focus:bg-white focus:border-[#165DFF] focus:ring-4 focus:ring-[#165DFF]/5 transition-all rounded-lg text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
