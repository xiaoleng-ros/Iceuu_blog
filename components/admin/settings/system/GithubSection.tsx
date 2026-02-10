'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageIcon, Save, Loader2 } from 'lucide-react';
import { GithubSectionProps } from './types';
import { GithubConfigFields } from './GithubConfigFields';

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
          <GithubConfigFields
            githubData={githubData}
            showGithubToken={showGithubToken}
            setShowGithubToken={setShowGithubToken}
            handleGithubChange={handleGithubChange}
          />

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
