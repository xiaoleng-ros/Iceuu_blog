'use client';

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ToastData } from '../types';

interface UseAvatarUploadProps {
  setToast: (data: ToastData | null) => void;
  onUploadSuccess: (url: string) => void;
}

export function useAvatarUpload({ setToast, onUploadSuccess }: UseAvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: '图片大小不能超过 2MB', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'avatar');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: uploadFormData,
      });

      const json = await res.json();
      if (res.ok) {
        onUploadSuccess(json.data.url);
        setToast({ message: '头像上传成功', type: 'success' });
      } else {
        throw new Error(json.error);
      }
    } catch (error) {
      setToast({ message: '上传失败: ' + (error instanceof Error ? error.message : '未知错误'), type: 'error' });
    } finally {
      setUploading(false);
    }
  }, [setToast, onUploadSuccess]);

  return {
    uploading,
    fileInputRef,
    uploadAvatar
  };
}
