'use client';

import React from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Lock, Eye, EyeOff, UserCircle, Globe, Shield } from 'lucide-react';
import { GithubConfigData } from './types';

/**
 * GitHub 配置字段组件
 * 包含 Token、Owner、Repo 和 Branch 的输入项
 * 
 * @param {Object} props - 组件属性
 * @param {GithubConfigData} props.githubData - GitHub 配置数据
 * @param {boolean} props.showGithubToken - 是否显示 Token
 * @param {Function} props.setShowGithubToken - 设置是否显示 Token
 * @param {Function} props.handleGithubChange - 处理输入变化
 */
export function GithubConfigFields({
  githubData,
  showGithubToken,
  setShowGithubToken,
  handleGithubChange
}: {
  githubData: GithubConfigData;
  showGithubToken: boolean;
  setShowGithubToken: (show: boolean) => void;
  handleGithubChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-[#4E5969]">GitHub Token</Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
          <Input
            name="github_token"
            type={showGithubToken ? "text" : "password"}
            value={githubData.github_token}
            onChange={handleGithubChange}
            placeholder="ghp_xxxxxxxxxxxx"
            className="h-11 pl-10 pr-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
          />
          <button
            type="button"
            onClick={() => setShowGithubToken(!showGithubToken)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86909C] hover:text-[#165DFF] transition-colors p-1"
          >
            {showGithubToken ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-[11px] text-[#86909C]">用于上传图片的 GitHub Personal Access Token</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-[#4E5969]">仓库所有者 (Owner)</Label>
        <div className="relative group">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
          <Input
            name="github_owner"
            value={githubData.github_owner}
            onChange={handleGithubChange}
            placeholder="GitHub 用户名或组织名"
            className="h-11 pl-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-[#4E5969]">仓库名称 (Repo)</Label>
        <div className="relative group">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
          <Input
            name="github_repo"
            value={githubData.github_repo}
            onChange={handleGithubChange}
            placeholder="存储图片的仓库名"
            className="h-11 pl-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-[#4E5969]">分支 (Branch)</Label>
        <div className="relative group">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
          <Input
            name="github_branch"
            value={githubData.github_branch}
            onChange={handleGithubChange}
            placeholder="main"
            className="h-11 pl-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
          />
        </div>
      </div>
    </div>
  );
}
