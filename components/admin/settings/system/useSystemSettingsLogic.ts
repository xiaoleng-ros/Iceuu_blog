'use client';

import { useState } from 'react';
import { ToastData } from './types';
import { useGithubSettings } from './hooks/useGithubSettings';
import { useAccountSecurity } from './hooks/useAccountSecurity';

/**
 * 系统设置业务逻辑 Hook
 * 聚合 GitHub 设置和账号安全设置逻辑
 * 已重构：通过委托子 Hook 降低复杂度，单函数行数显著减少
 * 
 * @returns {Object} - 返回所有系统设置相关的状态和处理函数
 */
export function useSystemSettingsLogic() {
  const [toast, setToast] = useState<ToastData | null>(null);

  // 1. GitHub 图床配置
  const github = useGithubSettings(setToast);

  // 2. 账号安全设置
  const security = useAccountSecurity(setToast);

  return {
    // 基础状态
    loading: security.loading,
    toast,
    setToast,

    // GitHub 设置
    githubSaving: github.githubSaving,
    showGithubToken: github.showGithubToken,
    setShowGithubToken: github.setShowGithubToken,
    githubData: github.githubData,
    handleGithubChange: github.handleGithubChange,
    handleSaveGithub: github.handleSaveGithub,

    // 账号安全
    user: security.user,
    passwordSaving: security.passwordSaving,
    showCurrentPassword: security.showCurrentPassword,
    setShowCurrentPassword: security.setShowCurrentPassword,
    showNewPassword: security.showNewPassword,
    setShowNewPassword: security.setShowNewPassword,
    passwordData: security.passwordData,
    passwordErrors: security.passwordErrors,
    handlePasswordChange: security.handlePasswordChange,
    handleSavePassword: security.handleSavePassword
  };
}
