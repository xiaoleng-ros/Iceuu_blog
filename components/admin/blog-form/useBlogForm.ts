'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface FormData {
  title: string;
  content: string;
  category: string;
  cover_image: string;
  draft: boolean;
}

export interface FormErrors {
  title?: boolean;
  content?: boolean;
}

export interface BlogInitialData extends Partial<FormData> {
  id?: string;
}

interface UseBlogFormProps {
  initialData?: BlogInitialData;
  isEditing: boolean;
  categories: string[];
}

/**
 * 管理表单基础状态的 Hook
 */
function useBlogFormState(categories: string[]) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: categories[0] || '',
    cover_image: '',
    draft: true,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  return {
    loading, setLoading,
    uploading, setUploading,
    toast, setToast, showToast,
    errors, setErrors,
    formData, setFormData
  };
}

/**
 * 管理草稿存储逻辑的 Hook
 */
function useBlogFormStorage(
  isEditing: boolean, 
  initialData: BlogInitialData | undefined, 
  formData: FormData, 
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  categories: string[]
) {
  const STORAGE_KEY = useMemo(() => isEditing ? `blog_edit_${initialData?.id}` : 'blog_new_draft', [isEditing, initialData?.id]);

  // 初始化数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || categories[0] || '',
        cover_image: initialData.cover_image || '',
        draft: initialData.draft ?? true,
      });
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            category: parsed.category || categories[0] || ''
          }));
        } catch (e) {
          console.error('Failed to parse saved draft:', e);
          setFormData(prev => ({ ...prev, category: categories[0] || '' }));
        }
      } else {
        setFormData(prev => ({ ...prev, category: categories[0] || '' }));
      }
    }
  }, [initialData, STORAGE_KEY, categories, setFormData]);

  // 自动保存
  useEffect(() => {
    if (formData.title || formData.content) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, STORAGE_KEY]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);

  return { clearStorage };
}

/**
 * 管理文件上传逻辑的 Hook
 */
function useBlogFormUpload({
  setFormData,
  showToast,
  setUploading,
  initialData
}: {
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  setUploading: (uploading: boolean) => void;
  initialData?: BlogInitialData;
}) {
  const handleImageUpload = async (file: File) => {
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

      const formDataUpload = new globalThis.FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'post');
      if (initialData?.id) formDataUpload.append('contextId', initialData.id);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formDataUpload
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '上传失败');
      }

      const data = await res.json();
      setFormData(prev => ({ ...prev, cover_image: data.data.url }));
      showToast('图片上传成功', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '图片上传失败';
      showToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return { handleImageUpload };
}

/**
 * 管理表单提交逻辑的 Hook
 */
function useBlogFormSubmit({
  formData,
  showToast,
  setErrors,
  setLoading,
  clearStorage,
  isEditing,
  initialData
}: {
  formData: FormData;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  setLoading: (loading: boolean) => void;
  clearStorage: () => void;
  isEditing: boolean;
  initialData?: BlogInitialData;
}) {
  const submitBlog = async (isDraft: boolean) => {
    const titleTrimmed = formData.title.trim();
    const contentPlain = formData.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

    if (isDraft) {
      if (titleTrimmed.length === 0 && contentPlain.length === 0) {
        setErrors({ title: true, content: true });
        showToast('文章标题和正文不能同时为空', 'warning');
        return false;
      }
    } else {
      if (titleTrimmed.length === 0) {
        setErrors(prev => ({ ...prev, title: true }));
        showToast('文章标题不能为空', 'warning');
        return false;
      }
      if (contentPlain.length === 0) {
        setErrors(prev => ({ ...prev, content: true }));
        showToast('文章内容不能为空', 'warning');
        return false;
      }
    }

    setErrors({});
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('请先登录', 'error');
        return false;
      }

      const url = isEditing ? `/api/blog/${initialData?.id}` : '/api/blog';
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ...formData, draft: isDraft }),
      });

      if (res.ok) {
        clearStorage();
        showToast(isDraft ? '草稿保存成功' : (isEditing ? '文章更新成功' : '文章发布成功'), 'success');
        return true;
      }
      const json = await res.json();
      showToast(`操作失败: ${json.error}`, 'error');
      return false;
    } catch (_error: unknown) {
      showToast('网络请求异常，请稍后重试', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitBlog };
}

/**
 * 博客表单逻辑 Hook
 * 处理表单数据初始化、自动保存、图片上传和提交逻辑
 * @param {UseBlogFormProps} props - Hook 参数
 * @returns {Object} 表单状态和处理函数
 */
export function useBlogForm({ initialData, isEditing, categories }: UseBlogFormProps) {
  const {
    loading, setLoading,
    uploading, setUploading,
    toast, setToast, showToast,
    errors, setErrors,
    formData, setFormData
  } = useBlogFormState(categories);

  const { clearStorage } = useBlogFormStorage(isEditing, initialData, formData, setFormData, categories);

  const { handleImageUpload } = useBlogFormUpload({
    setFormData,
    showToast,
    setUploading,
    initialData
  });

  const { submitBlog } = useBlogFormSubmit({
    formData,
    showToast,
    setErrors,
    setLoading,
    clearStorage,
    isEditing,
    initialData
  });

  return {
    formData, setFormData,
    loading, uploading,
    toast, setToast,
    errors, setErrors,
    handleImageUpload, submitBlog
  };
}
