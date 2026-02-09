'use client';

import { useRef } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CoverImageUploaderProps {
  value: string;
  onUpload: (file: File) => void;
  uploading: boolean;
}

/**
 * 封面图上传组件
 * @param {CoverImageUploaderProps} props - 组件属性
 * @returns {JSX.Element}
 */
export function CoverImageUploader({ value, onUpload, uploading }: CoverImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden">
      <CardHeader className="bg-[#F7F8FA] border-b border-[#F2F3F5] px-6 py-4 rounded-t-[16px]">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#165DFF]" />
          封面图片
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div 
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            "relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all group cursor-pointer",
            value ? "border-transparent" : "border-[#E5E6EB] hover:border-[#165DFF] hover:bg-[#F2F3F5]"
          )}
        >
          {value ? (
            <>
              <Image 
                src={value} 
                alt="Cover Preview" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-sm font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> 更换封面
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#86909C]">
              <div className="w-12 h-12 bg-[#F2F3F5] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-[#4E5969]" />
              </div>
              <p className="text-sm font-bold">点击上传封面</p>
              <p className="text-[11px] opacity-60 mt-1">建议尺寸 1200x600px</p>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#165DFF] animate-spin mb-2" />
              <span className="text-xs font-bold text-[#165DFF]">正在上传...</span>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
