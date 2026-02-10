'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSiteStore } from '@/lib/store/useSiteStore';
import { ProfileData, ToastData } from '../types';

/**
 * 个人资料设置 Hook
 * 负责头像上传、个人资料更新及状态管理
 * 
 * @param {Function} setToast - 设置提示信息
 * @returns {Object} - 返回个人资料相关的状态和处理函数
 */
export function useProfileSettings(setToast: (data: ToastData | null) => void) {
  const storeUser = useSiteStore((state) => state.user);
  const updateUserInStore = useSiteStore((state) => state.updateUser);
  
  const [user, setUser] = useState<User | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          if (!storeUser) {
            setProfileData(prev => ({
              ...prev,
              fullName: authUser.user_metadata?.full_name || '',
              email: authUser.email || '',
              bio: authUser.user_metadata?.bio || '',
              avatarUrl: authUser.user_metadata?.avatar_url || '',
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [storeUser]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value || '' }));
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        throw new Error(json.error);
      }
    } catch (error: any) {
      setToast({ message: '上传失败: ' + error.message, type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!profileData.fullName.trim()) errors.fullName = '名称不能为空';
    if (!profileData.email.trim()) errors.email = '邮箱不能为空';
    if (!profileData.bio.trim()) errors.bio = '介绍不能为空';
    
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
    } catch (error: any) {
      setToast({ message: '保存失败: ' + error.message, type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  return {
    user,
    profileSaving,
    uploadingAvatar,
    profileData,
    profileErrors,
    setProfileData,
    profileFileInputRef,
    handleProfileChange,
    handleAvatarUpload,
    handleSaveProfile
  };
}
