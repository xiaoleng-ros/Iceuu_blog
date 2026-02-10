'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteFormData, ToastData, ProfileData } from '../types';

/**
 * 社交链接与页脚设置 Hook
 * 负责社交链接、页脚文本的保存及状态管理
 * 
 * @param {Function} setToast - 设置提示信息
 * @param {ProfileData} profileData - 当前个人资料数据
 * @param {Function} setProfileData - 设置个人资料数据
 * @returns {Object} - 返回社交设置相关的状态和处理函数
 */
export function useSocialSettings(
  setToast: (data: ToastData | null) => void,
  profileData: ProfileData,
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>
) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SiteFormData>({
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
      } catch (error) {
        console.error('Fetch settings error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [setProfileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('请先登录');

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
        throw new Error('保存失败');
      }
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : '保存失败', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    formData,
    setFormData,
    handleChange,
    handleSubmit
  };
}
