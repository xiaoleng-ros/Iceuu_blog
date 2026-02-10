'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSiteStore } from '@/lib/store/useSiteStore';
import { PasswordData, ToastData } from '../types';

/**
 * 账号安全设置 Hook
 * 负责管理员密码的实时同步与修改逻辑
 * 
 * @param {Function} setToast - 设置提示信息
 * @returns {Object} - 返回账号安全相关的状态和处理函数
 */
export function useAccountSecurity(setToast: (data: ToastData | null) => void) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const config = useSiteStore((state) => state.config);
  const configPassword = config.admin_password;

  useEffect(() => {
    if (configPassword) {
      setPasswordData(prev => {
        if (!prev.currentPassword) {
          return { ...prev, currentPassword: configPassword };
        }
        return prev;
      });
    }
  }, [configPassword]);

  useEffect(() => {
    const fetchUserAndConfig = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!authUser) return;
        setUser(authUser);

        if (!session) return;

        const res = await fetch('/api/auth/password', {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result.password) {
            setPasswordData(prev => ({ ...prev, currentPassword: result.password }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch user or password:', error);
        const message = error instanceof Error ? error.message : '获取账户安全信息失败';
        setToast({ message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndConfig();
  }, [setToast]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!passwordData.currentPassword) errors.currentPassword = '当前密码不能为空';
    if (!passwordData.newPassword) errors.newPassword = '新密码不能为空';
    if (passwordData.newPassword.length < 6) errors.newPassword = '新密码至少需要6位';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = '两次输入的密码不一致';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('登录已过期，请重新登录');

      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.error === '当前密码错误') {
          setPasswordErrors({ currentPassword: '当前密码错误' });
          return;
        }
        throw new Error(result.error || '密码修改失败');
      }

      setToast({ message: '密码修改成功', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '修改失败';
      setToast({ message, type: 'error' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return {
    loading,
    user,
    passwordSaving,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    passwordData,
    passwordErrors,
    handlePasswordChange,
    handleSavePassword
  };
}
