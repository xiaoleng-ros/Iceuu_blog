'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteFormData, ToastData } from '../types';

/**
 * 首页背景设置 Hook
 * 负责背景图片的上传、移除及表单数据管理
 * 
 * @param {SiteFormData} formData - 当前站点表单数据
 * @param {Function} setFormData - 设置站点表单数据
 * @param {Function} setToast - 设置提示信息
 * @returns {Object} - 返回背景设置相关的状态和处理函数
 */
export function useBackgroundSettings(
  formData: SiteFormData,
  setFormData: React.Dispatch<React.SetStateAction<SiteFormData>>,
  setToast: (data: ToastData | null) => void
) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setToast({ message: '只支持 JPG, PNG, GIF, WEBP 格式图片', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: '图片大小不能超过 5MB', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('请先登录');

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'site');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: uploadFormData,
      });

      const json = await res.json();
      if (res.ok && json.data?.url) {
        const newUrl = json.data.url;
        setFormData(prev => ({ ...prev, home_background_url: newUrl }));
        
        await fetch('/api/settings', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ home_background_url: newUrl }),
        });
        setToast({ message: '首页背景已即时更新', type: 'success' });
      } else {
        throw new Error(json.error || '上传失败');
      }
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveBackground = async () => {
    setFormData(prev => ({ ...prev, home_background_url: '' }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch('/api/settings', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ home_background_url: '' }),
      });
      setToast({ message: '首页背景已移除', type: 'success' });
    } catch (error) {
      console.error('Remove background error:', error);
    }
  };

  return {
    uploading,
    fileInputRef,
    handleFileUpload,
    handleRemoveBackground
  };
}
