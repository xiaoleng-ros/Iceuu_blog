'use client';

import { Button } from '@/components/ui/Button';
import { UploadCloud, Loader2 } from 'lucide-react';

interface MediaHeaderProps {
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 媒体库页面头部组件
 * @param props - 组件属性
 * @returns 头部渲染结果
 */
export function MediaHeader({ uploading, onUpload }: MediaHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">媒体库</h1>
        <p className="text-[#86909C] mt-1 text-sm">管理和组织您上传的所有图片及文件资源</p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-initial">
          <input
            type="file"
            id="upload-media"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
          />
          <Button 
            onClick={() => document.getElementById('upload-media')?.click()}
            disabled={uploading}
            className="w-full h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white rounded-xl shadow-[0_4px_12px_rgba(64,169,255,0.2)] transition-all flex items-center gap-2 px-5"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            <span className="font-medium text-sm">{uploading ? '正在上传...' : '上传图片'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
