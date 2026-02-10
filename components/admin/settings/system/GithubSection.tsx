'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageIcon, Lock, Eye, EyeOff, UserCircle, Globe, Shield, Save, Loader2 } from 'lucide-react';
import { GithubSectionProps } from './types';

/**
 * GitHub 图床配置组件
 * 管理用于存储图片的 GitHub 仓库信息
 * 
 * @param {GithubSectionProps} props - 组件属性
 * @returns {JSX.Element} - 返回 GitHub 设置组件 JSX
 */
export function GithubSection({
  githubData,
  githubSaving,
  showGithubToken,
  setShowGithubToken,
  handleGithubChange,
  handleSaveGithub
}: GithubSectionProps) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
      <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
            图床设置 (GitHub)
          </div>
          <ImageIcon className="h-4 w-4 text-[#165DFF] opacity-50" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSaveGithub} className="space-y-6">
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

          <div className="pt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={githubSaving}
              className="h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(64,169,255,0.2)] flex items-center gap-2 px-6"
            >
              {githubSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {githubSaving ? '正在保存...' : '保存图床配置'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
