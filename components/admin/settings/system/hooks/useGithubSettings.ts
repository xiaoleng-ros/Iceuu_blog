'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSiteStore } from '@/lib/store/useSiteStore';
import { GithubConfigData, ToastData } from '../types';

/**
 * GitHub 配置设置 Hook
 * 负责 GitHub 图床配置的加载与保存
 * 
 * @param {Function} setToast - 设置提示信息
 * @returns {Object} - 返回 GitHub 设置相关的状态和处理函数
 */
export function useGithubSettings(setToast: (data: ToastData | null) => void) {
  const [githubSaving, setGithubSaving] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [githubData, setGithubData] = useState<GithubConfigData>({
    github_token: '',
    github_owner: '',
    github_repo: '',
    github_branch: 'main',
  });

  const config = useSiteStore((state) => state.config);

  useEffect(() => {
    if (config) {
      setGithubData({
        github_token: config.github_token || '',
        github_owner: config.github_owner || '',
        github_repo: config.github_repo || '',
        github_branch: config.github_branch || 'main',
      });
    }
  }, [config]);

  const handleGithubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGithubData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    setGithubSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('会话已过期');

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(githubData),
      });

      if (res.ok) {
        setToast({ message: '图床配置已更新', type: 'success' });
        useSiteStore.getState().fetchConfig();
      } else {
        const json = await res.json();
        throw new Error(json.error || '保存失败');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存出错';
      setToast({ message, type: 'error' });
    } finally {
      setGithubSaving(false);
    }
  };

  return {
    githubSaving,
    showGithubToken,
    setShowGithubToken,
    githubData,
    handleGithubChange,
    handleSaveGithub
  };
}
