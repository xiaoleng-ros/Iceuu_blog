'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSiteStore, UserInfo } from '@/lib/store/useSiteStore';
import { ToastData } from '../types';

export function useUserSync(_props: { storeUser: UserInfo | null }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const syncUserData = useCallback((storeUser: UserInfo | null) => {
    return {
      fullName: storeUser?.fullName || '',
      email: storeUser?.email || '',
      bio: storeUser?.bio || '',
      avatarUrl: storeUser?.avatarUrl || '',
      site_start_date: storeUser?.site_start_date || '',
    };
  }, []);

  return { user, setUser, syncUserData };
}

function validateProfileData(profileData: { fullName: string; email: string; bio: string }) {
  const errors: Record<string, string> = {};
  if (!profileData.fullName.trim()) errors.fullName = '名称不能为空';
  if (!profileData.email.trim()) errors.email = '邮箱不能为空';
  if (!profileData.bio.trim()) errors.bio = '介绍不能为空';
  return errors;
}

interface UpdateUserProfileParams {
  profileData: { fullName: string; email: string; bio: string; avatarUrl: string };
  user: User | null;
  setToast: (data: ToastData | null) => void;
  updateSiteConfigs: () => Promise<void>;
  updateUserInStore: (data: Partial<UserInfo>) => void;
  setUser: (user: User) => void;
}

async function updateUserProfile({ profileData, user, setToast, updateSiteConfigs, updateUserInStore, setUser }: UpdateUserProfileParams) {
  const { error } = await supabase.auth.updateUser({
    email: profileData.email !== user?.email ? profileData.email : undefined,
    data: {
      full_name: profileData.fullName,
      bio: profileData.bio,
      avatar_url: profileData.avatarUrl,
    },
  });

  if (error) throw error;

  await updateSiteConfigs();
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
}

function useProfileFormState() {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    avatarUrl: '',
    site_start_date: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value || '' }));
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [profileErrors]);

  return { profileData, profileErrors, setProfileData, updateField, setProfileErrors };
}

function useAvatarUploadHandler(setToast: (data: ToastData | null) => void, setProfileData: React.Dispatch<React.SetStateAction<{ fullName: string; email: string; bio: string; avatarUrl: string; site_start_date: string }>>) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = useCallback(async (url: string) => {
    setProfileData(prev => ({ ...prev, avatarUrl: url }));
  }, [setProfileData]);

  const triggerAvatarUpload = useCallback(() => {
    profileFileInputRef.current?.click();
  }, []);

  const onAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch (error) {
      setToast({ message: '上传失败: ' + (error instanceof Error ? error.message : '未知错误'), type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  }, [setToast, setProfileData]);

  return { uploadingAvatar, profileFileInputRef, handleAvatarUpload, triggerAvatarUpload, onAvatarUpload };
}

export function useProfileSettings(setToast: (data: ToastData | null) => void) {
  const storeUser = useSiteStore((state) => state.user);
  const updateUserInStore = useSiteStore((state) => state.updateUser);
  const { user, setUser, syncUserData } = useUserSync({ storeUser });
  
  const [profileSaving, setProfileSaving] = useState(false);
  const { profileData, profileErrors, setProfileData, updateField, setProfileErrors } = useProfileFormState();
  const { uploadingAvatar, profileFileInputRef, handleAvatarUpload, triggerAvatarUpload, onAvatarUpload } = useAvatarUploadHandler(setToast, setProfileData);

  useEffect(() => {
    const data = syncUserData(storeUser);
    setProfileData(prev => ({ ...prev, ...data }));
  }, [storeUser, syncUserData, setProfileData]);

  const updateSiteConfigs = useCallback(async () => {
    const configUpdates = [
      { key: 'site_name', value: profileData.fullName },
      { key: 'avatar_url', value: profileData.avatarUrl },
      { key: 'intro', value: profileData.bio },
      { key: 'site_start_date', value: profileData.site_start_date }
    ];

    for (const item of configUpdates) {
      await supabase.from('site_config').upsert({ key: item.key, value: item.value }, { onConflict: 'key' });
    }
  }, [profileData]);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfileData(profileData);
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileSaving(true);
    try {
      await updateUserProfile({ profileData, user, setToast, updateSiteConfigs, updateUserInStore, setUser });
    } catch (error) {
      setToast({ message: '保存失败: ' + (error instanceof Error ? error.message : '未知错误'), type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  }, [profileData, user, setToast, updateSiteConfigs, updateUserInStore, setProfileErrors, setUser]);

  return {
    user,
    profileSaving,
    uploadingAvatar,
    profileData,
    profileErrors,
    setProfileData,
    profileFileInputRef,
    updateField,
    handleAvatarUpload,
    triggerAvatarUpload,
    onAvatarUpload,
    handleSaveProfile
  };
}
