'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Settings2, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toast } from '@/components/admin/pages/CommonComponents';
import Editor from './Editor';
import { Label } from '@/components/ui/Label';
import { useBlogForm, type FormData, type FormErrors } from './blog-form/useBlogForm';
import { CategorySelector } from './blog-form/CategorySelector';
import { CoverImageUploader } from './blog-form/CoverImageUploader';

interface BlogFormProps {
  initialData?: BlogFormInitialData;
  isEditing?: boolean;
}

interface BlogFormInitialData {
  id?: string;
  title?: string;
  content?: string;
  cover_image?: string;
  category?: string;
  excerpt?: string;
  tags?: string[];
  draft?: boolean;
  [key: string]: unknown;
}

const CATEGORIES = [
  '生活边角料',
  '情绪随笔',
  '干货分享',
  '成长复盘'
];

/**
 * 表单提交处理 Hook
 * @param submitBlog - 提交博客函数
 * @param router - 路由对象
 * @returns 提交相关处理函数
 */
function useFormSubmit(submitBlog: (isDraft: boolean) => Promise<boolean>, router: ReturnType<typeof useRouter>) {
  const onSaveDraft = async () => {
    await submitBlog(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitBlog(false);
    if (success) {
      setTimeout(() => {
        router.push('/admin/blogs');
        router.refresh();
      }, 1500);
    }
  };

  return { onSaveDraft, onSubmit };
}

/**
 * 顶部操作按钮组件
 */
function FormActions({ loading, isDraft, isEditing, onSaveDraft, disabled }: {
  loading: boolean;
  isDraft: boolean;
  isEditing: boolean;
  onSaveDraft: () => void;
  disabled: boolean;
}) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] overflow-hidden bg-white">
      <CardContent className="p-5 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" disabled={disabled} onClick={onSaveDraft}
            className={cn("h-9 px-6 rounded-lg border-[#E5E6EB] font-medium transition-all hover:bg-[#F7F8FA]",
              isDraft ? "bg-[#F2F3F5] border-[#165DFF]/10 text-[#165DFF]" : "text-[#4E5969]")}>
            {loading && isDraft ? (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3.5 h-3.5 border-2 border-[#165DFF]/30 border-t-[#165DFF] rounded-full animate-spin" />
                保存中...
              </div>
            ) : (<><Clock className="mr-2 h-4 w-4" /> 存为草稿</>)}
          </Button>
          <Button type="submit" disabled={disabled}
            className="h-9 px-10 rounded-lg bg-[#E8F3FF] hover:bg-[#D1E9FF] text-[#165DFF] font-bold shadow-none transition-all active:scale-95 disabled:opacity-50 border border-[#165DFF]/10">
            {loading && !isDraft ? (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3.5 h-3.5 border-2 border-[#165DFF]/30 border-t-[#165DFF] rounded-full animate-spin" />
                保存中...
              </div>
            ) : (<div className="flex items-center gap-2 text-xs"><Send className="h-4 w-4" /> {isEditing ? '保存修改' : '保存发布'}</div>)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 标题输入组件
 */
function TitleInput({ value, onChange, hasError, onClearError }: {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  onClearError: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[#4E5969] font-bold text-sm mb-1">
        <FileText className="w-4 h-4 text-[#165DFF]" /><span>文章标题</span>
      </div>
      <input id="title" name="title" value={value}
        onChange={(e) => { onChange(e.target.value); if (hasError) onClearError(); }}
        placeholder="在此输入吸引人的标题..."
        className={cn("w-full text-xl md:text-2xl font-bold text-[#1D2129] outline-none placeholder:text-[#C9CDD4] bg-transparent",
          hasError && "text-red-500 placeholder:text-red-300")} />
      <div className={cn("h-[1px] w-full bg-[#F2F3F5] transition-colors", hasError && "bg-red-500/50")} />
    </div>
  );
}

/**
 * 编辑器组件封装
 */
function ContentEditor({ value, onChange, articleId, hasError, onClearError }: {
  value: string;
  onChange: (value: string) => void;
  articleId?: string;
  hasError?: boolean;
  onClearError: () => void;
}) {
  return (
    <div className={cn("pt-2 rounded-xl transition-all", hasError && "ring-2 ring-red-500/20")}>
      <Editor value={value} onChange={(val: string) => { onChange(val); if (hasError) onClearError(); }} articleId={articleId} />
    </div>
  );
}

/**
 * 发布状态组件
 */
function PublishStatus({ isDraft }: { isDraft: boolean }) {
  return (
    <div className="space-y-3">
      <Label className="text-[#4E5969] font-bold text-xs uppercase tracking-wider">当前状态</Label>
      <div className={cn("flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
        isDraft ? "bg-[#FFF7E8] border-[#FF7D00]/20 text-[#FF7D00]" : "bg-[#E8FFEA] border-[#00B42A]/20 text-[#00B42A]")}>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", isDraft ? "bg-[#FF7D00]" : "bg-[#00B42A]")} />
          <span className="text-sm font-black">{isDraft ? '草稿模式' : '已发布'}</span>
        </div>
        <div className="text-[10px] font-medium opacity-70">{isDraft ? '仅自己可见' : '全网公开'}</div>
      </div>
    </div>
  );
}

/**
 * 博客表单组件
 */
export default function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter();
  const { formData, setFormData, loading, uploading, toast, setToast, errors, setErrors, handleImageUpload, submitBlog } = 
    useBlogForm({ initialData, isEditing, categories: CATEGORIES });

  const { onSaveDraft, onSubmit } = useFormSubmit(submitBlog, router);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => setFormData((prev: FormData) => ({ ...prev, [field]: value }));
  const clearError = (field: keyof FormErrors) => setErrors((prev: FormErrors) => ({ ...prev, [field]: false }));

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="animate-in fade-in slide-in-from-top-4 duration-300">
        <FormActions loading={loading} isDraft={formData.draft} isEditing={isEditing} onSaveDraft={onSaveDraft} disabled={loading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 space-y-5">
          <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
            <CardContent className="p-8 space-y-8">
              <TitleInput value={formData.title} onChange={(val) => updateField('title', val)} hasError={errors.title} onClearError={() => clearError('title')} />
              <ContentEditor value={formData.content} onChange={(val) => updateField('content', val)} articleId={initialData?.id} hasError={errors.content} onClearError={() => clearError('content')} />
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1 space-y-5">
          <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white">
            <CardHeader className="bg-[#F7F8FA] border-b border-[#F2F3F5] px-6 py-4 rounded-t-[16px]">
              <CardTitle className="text-base font-bold text-[#1D2129] flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#165DFF]" />发布设置
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <PublishStatus isDraft={formData.draft} />
              <CategorySelector value={formData.category} onChange={(val) => updateField('category', val)} categories={CATEGORIES} />
            </CardContent>
          </Card>
          <CoverImageUploader value={formData.cover_image} onUpload={handleImageUpload} uploading={uploading} />
        </div>
      </div>
    </form>
  );
}
