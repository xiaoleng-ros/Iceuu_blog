'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSiteStore } from '@/lib/store/useSiteStore';

type ToastData = { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;

export function useUserSync() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUser(user);
      } catch (_error) {
        console.error('Failed to fetch user:', _error);
      }
    };
    fetchUser();
  }, []);

  return { user, setUser };
}

export function useProfileFormState() {
  const storeUser = useSiteStore((state) => state.user);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    avatarUrl: '',
    site_start_date: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (storeUser) {
      setProfileData(prev => ({
        ...prev,
        fullName: storeUser.fullName || '',
        email: storeUser.email || '',
        bio: storeUser.bio || '',
        avatarUrl: storeUser.avatarUrl || '',
      }));
    }
  }, [storeUser]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value || '' }));
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [profileErrors]);

  return { profileData, profileErrors, setProfileData, handleChange, setProfileErrors };
}

export function useAvatarUpload(setToast: (data: ToastData) => void) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useCallback(async (file: File, setProfileData: React.Dispatch<React.SetStateAction<{ fullName: string; email: string; bio: string; avatarUrl: string; site_start_date: string }>>) => {
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: '图片大小不能超过 2MB', type: 'error' });
      return;
    }

    setUploadingAvatar(true);
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
        setProfileData(prev => ({ ...prev, avatarUrl: json.data.url }));
        setToast({ message: '头像上传成功', type: 'success' });
      } else {
        setToast({ message: '上传失败: ' + json.error, type: 'error' });
      }
    } catch (_error) {
      console.error('Upload error:', _error);
      setToast({ message: '上传出错', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  }, [setToast]);

  return { uploadingAvatar, fileInputRef, uploadAvatar };
}

function validateProfileData(profileData: { fullName: string; email: string; bio: string }) {
  const errors: Record<string, string> = {};
  if (!profileData.fullName.trim()) errors.fullName = '名称不能为空';
  if (!profileData.email.trim()) errors.email = '邮箱不能为空';
  if (!profileData.bio.trim()) errors.bio = '介绍不能为空';
  return errors;
}

export function useProfileLogic(setToast: (data: ToastData) => void) {
  const updateUserInStore = useSiteStore((state) => state.updateUser);
  const { user, setUser } = useUserSync();
  const { profileData, profileErrors, setProfileData, handleChange, setProfileErrors } = useProfileFormState();
  const { uploadingAvatar, fileInputRef, uploadAvatar } = useAvatarUpload(setToast);
  const [profileSaving, setProfileSaving] = useState(false);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file, setProfileData);
  }, [uploadAvatar, setProfileData]);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfileData(profileData);
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: profileData.email !== user?.email ? profileData.email : undefined,
        data: {
          full_name: profileData.fullName,
          bio: profileData.bio,
          avatar_url: profileData.avatarUrl,
        },
      });

      if (error) throw error;

      const configUpdates = [
        { key: 'site_name', value: profileData.fullName },
        { key: 'avatar_url', value: profileData.avatarUrl },
        { key: 'intro', value: profileData.bio },
        { key: 'site_start_date', value: profileData.site_start_date }
      ];

      for (const item of configUpdates) {
        await supabase.from('site_config').upsert({ key: item.key, value: item.value }, { onConflict: 'key' });
      }

      await supabase.auth.refreshSession();
      updateUserInStore({
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
        email: profileData.email,
        bio: profileData.bio,
      });
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) setUser(updatedUser);

      setToast({ 
        message: profileData.email !== user?.email ? '个人信息已保存，请查收新邮箱确认邮件。' : '个人信息已成功保存', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Profile save error:', error);
      setToast({ message: '保存失败: ' + (error instanceof Error ? error.message : '未知错误'), type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  }, [profileData, user, updateUserInStore, setToast, setProfileErrors, setUser]);

  return {
    user,
    profileSaving,
    uploadingAvatar,
    profileData,
    profileErrors,
    profileFileInputRef: fileInputRef,
    setProfileData,
    handleProfileChange: handleChange,
    handleAvatarUpload,
    handleSaveProfile,
  };
}

export function useSiteConfigFormState(
  setProfileData: React.Dispatch<React.SetStateAction<{ fullName: string; email: string; bio: string; avatarUrl: string; site_start_date: string }>>
) {
  const [formData, setFormData] = useState({
    footer_text: '',
    github_url: '',
    gitee_url: '',
    qq_url: '',
    wechat_url: '',
    douyin_url: '',
    home_background_url: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.data) {
          const { site_start_date, ...rest } = json.data;
          const { site_title: _, site_description: __, site_keywords: ___, ...formDataOnly } = rest;
          setFormData(prev => ({ ...prev, ...formDataOnly }));
          if (site_start_date) {
            setProfileData(prev => ({ ...prev, site_start_date: site_start_date || '' }));
          }
        }
      } catch (_error) {
        console.error('Fetch settings error:', _error);
      }
    };
    fetchSettings();
  }, [setProfileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  return { formData, setFormData, handleChange };
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOMAINS = ['supabase.co', 'unsplash.com', 'github.com', 'githubusercontent.com', 'jsdelivr.net'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateImageUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
}

function validateFile(file: File, setToast: (data: ToastData) => void): boolean {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    setToast({ message: '只支持 JPG, PNG, GIF, WEBP 格式图片', type: 'error' });
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    setToast({ message: '图片大小不能超过 5MB', type: 'error' });
    return false;
  }
  return true;
}

async function uploadFileToServer(file: File, type: string, setToast: (data: ToastData) => void) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    setToast({ message: '请先登录', type: 'error' });
    return null;
  }

  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  uploadFormData.append('type', type);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: uploadFormData,
  });

  const json = await res.json();
  if (!res.ok || !json.data?.url) {
    throw new Error(json.error || '上传失败');
  }
  return json.data.url;
}

async function saveSettingToServer(key: string, value: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await fetch('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ [key]: value }),
  });
}

export function useSiteConfigUpload(
  setToast: (data: ToastData) => void,
  _formData: { home_background_url: string },
  setFormData: React.Dispatch<React.SetStateAction<{ footer_text: string; github_url: string; gitee_url: string; qq_url: string; wechat_url: string; douyin_url: string; home_background_url: string }>>
) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!validateFile(file, setToast)) return;

    setUploading(true);
    try {
      const newUrl = await uploadFileToServer(file, 'site', setToast);
      if (!newUrl) return;

      setFormData(prev => ({ ...prev, home_background_url: newUrl }));
      await saveSettingToServer('home_background_url', newUrl);
      setToast({ message: '首页背景已即时更新', type: 'success' });
    } catch (error) {
      console.error('Upload error:', error);
      setToast({ message: error instanceof Error ? error.message : '上传失败', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const handleRemoveBackground = async () => {
    setFormData(prev => ({ ...prev, home_background_url: '' }));
    await saveSettingToServer('home_background_url', '');
    setToast({ message: '首页背景已移除', type: 'success' });
  };

  return {
    uploading,
    fileInputRef,
    validateImageUrl,
    handleFileUpload,
    handleRemoveBackground,
  };
}

export function useSiteConfigLogic(
  setToast: (data: ToastData) => void,
  setProfileData: React.Dispatch<React.SetStateAction<{ fullName: string; email: string; bio: string; avatarUrl: string; site_start_date: string }>>
) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { formData, setFormData, handleChange } = useSiteConfigFormState(setProfileData);
  const { uploading, fileInputRef, validateImageUrl, handleFileUpload, handleRemoveBackground } = useSiteConfigUpload(setToast, formData, setFormData);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.home_background_url && !validateImageUrl(formData.home_background_url)) {
      setToast({ message: '外部链接域名不在白名单内', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/settings', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setToast({ message: '全局配置已成功保存', type: 'success' });
      } else {
        setToast({ message: '保存失败', type: 'error' });
      }
    } catch (_error) {
      console.error('Save error:', _error);
      setToast({ message: '保存出错', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    uploading,
    fileInputRef,
    formData,
    handleChange,
    handleFileUpload,
    handleSubmit,
    handleRemoveBackground,
  };
}
