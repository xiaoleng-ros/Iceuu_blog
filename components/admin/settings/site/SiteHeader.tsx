'use client';

import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * 页面头部操作栏
 */
export function SiteHeader({
  saving,
  handleSubmit
}: {
  saving: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">站点设置</h1>
        <p className="text-[#86909C] mt-1 text-sm">管理您的博客站点信息、SEO 及社交链接</p>
      </div>
      <Button 
        type="button" 
        onClick={handleSubmit}
        disabled={saving} 
        className="w-full sm:w-auto h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white font-medium rounded-xl shadow-[0_4px_12px_rgba(64,169,255,0.2)] transition-all flex items-center justify-center gap-2 px-6"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="text-sm">{saving ? '正在保存...' : '保存全局配置'}</span>
      </Button>
    </div>
  );
}
