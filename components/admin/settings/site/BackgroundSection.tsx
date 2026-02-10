'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageIcon, Loader2, Upload, Trash2, Link as LinkIcon } from 'lucide-react';

/**
 * 背景图预览组件
 */
function BackgroundPreview({
  url,
  uploading,
  fileInputRef,
  onRemove,
}: {
  url: string;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRemove: () => void;
}) {
  if (!url) {
    return (
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-[#165DFF]" />
            <span className="text-sm font-medium text-[#165DFF]">正在上传并应用...</span>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#F2F3F5] flex items-center justify-center mb-3 group-hover:bg-[#165DFF]/10 transition-colors">
              <Upload className="h-8 w-8 text-[#86909C] group-hover:text-[#165DFF] transition-colors" />
            </div>
            <span className="text-sm font-bold text-[#4E5969]">点击上传本地图片</span>
            <span className="text-xs text-[#86909C] mt-1 text-center px-6">未设置背景图，将使用系统默认图</span>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <Image 
        src={url} 
        alt="Background Preview" 
        fill
        className={`object-cover transition-all duration-500 ${uploading ? 'opacity-30 blur-sm' : 'group-hover:scale-105'}`}
        unoptimized
      />
      <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-3 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#165DFF]" />
            <span className="text-sm font-medium">正在上传...</span>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg h-9 px-4"
              onClick={() => window.open(url, '_blank')}
            >
              查看原图
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white text-[#1D2129] border-none hover:bg-gray-100 rounded-lg h-9 px-4 flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              更换图片
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-red-500/90 border-none text-white hover:bg-red-600 rounded-lg h-9 px-4 flex items-center gap-2"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
              移除
            </Button>
          </>
        )}
      </div>
    </>
  );
}

import { BackgroundSectionProps } from './types';

/**
 * 首页背景设置部分
 * 管理站点首页的背景图片上传和移除
 * 
 * @param {BackgroundSectionProps} props - 组件属性
 * @returns {JSX.Element} - 返回背景设置组件 JSX
 */
export function BackgroundSection({
  formData,
  uploading,
  handleRemoveBackground,
  handleFileUpload,
  handleChange,
  fileInputRef
}: BackgroundSectionProps) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
      <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
            首页背景设置
          </div>
          <ImageIcon className="h-4 w-4 text-[#165DFF] opacity-50" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-[#4E5969]">背景图预览</Label>
            <span className="text-[11px] text-[#86909C]">支持 JPG, PNG, GIF, 不超过 5MB</span>
          </div>
          <div 
            className={`relative aspect-video rounded-xl overflow-hidden bg-[#F9FBFF] border-2 border-dashed transition-all duration-300 group ${
              uploading ? 'border-[#165DFF] bg-[#165DFF]/5' : 'border-[#F2F3F5] hover:border-[#165DFF]/30 hover:bg-[#F9FBFF]/80'
            }`}
          >
            <BackgroundPreview 
              url={formData.home_background_url}
              uploading={uploading}
              fileInputRef={fileInputRef}
              onRemove={handleRemoveBackground}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="home_background_url" className="text-sm font-bold text-[#4E5969]">或者使用外部链接</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 flex items-center justify-center transition-colors">
                <LinkIcon className="h-4 w-4 text-[#4E5969] group-focus-within:text-[#165DFF] transition-colors" />
              </div>
              <Input
                id="home_background_url"
                name="home_background_url"
                value={formData.home_background_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
              />
            </div>
            <p className="text-[11px] text-[#86909C]">仅支持白名单域名 (Unsplash, GitHub, CDN 等)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
