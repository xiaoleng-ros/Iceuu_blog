'use client';

import { useState } from 'react';
import { ToastData } from './types';
import { useBackgroundSettings } from './hooks/useBackgroundSettings';
import { useProfileSettings } from './hooks/useProfileSettings';
import { useSocialSettings } from './hooks/useSocialSettings';

/**
 * 站点设置逻辑 Hook
 * 聚合背景设置、个人资料设置和社交设置逻辑
 * 已重构：通过委托子 Hook 降低复杂度，单函数行数显著减少
 * 
 * @returns {Object} - 返回所有站点设置相关的状态和处理函数
 */
export function useSiteSettingsLogic() {
  const [toast, setToast] = useState<ToastData | null>(null);

  // 1. 个人资料设置
  const profile = useProfileSettings(setToast);

  // 2. 社交链接与页脚设置
  const social = useSocialSettings(setToast, profile.profileData, profile.setProfileData);

  // 3. 首页背景设置
  const background = useBackgroundSettings(social.formData, social.setFormData, setToast);

  return {
    // 基础状态
    loading: social.loading,
    toast,
    setToast,

    // 背景设置
    uploading: background.uploading,
    fileInputRef: background.fileInputRef,
    handleFileUpload: background.handleFileUpload,
    handleRemoveBackground: background.handleRemoveBackground,

    // 个人资料设置
    user: profile.user,
    profileSaving: profile.profileSaving,
    uploadingAvatar: profile.uploadingAvatar,
    profileData: profile.profileData,
    profileErrors: profile.profileErrors,
    profileFileInputRef: profile.profileFileInputRef,
    handleProfileChange: profile.handleProfileChange,
    handleAvatarUpload: profile.handleAvatarUpload,
    handleSaveProfile: profile.handleSaveProfile,

    // 全局设置
    saving: social.saving,
    formData: social.formData,
    handleChange: social.handleChange,
    handleSubmit: social.handleSubmit,
  };
}
