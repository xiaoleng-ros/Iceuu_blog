'use client';

import { X, ExternalLink, Trash2, Copy, Check, Info } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { MediaItem } from '../hooks/useMediaManagement';
import { formatDate, cn } from '@/lib/utils';

interface MediaPreviewProps {
  item: MediaItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onCopy: (url: string, id: string) => void;
  copiedId: string | null;
}

/**
 * 媒体文件预览弹窗组件
 * @param props - 组件属性
 * @returns 预览弹窗渲染结果
 */
export function MediaPreview({
  item,
  onClose,
  onDelete,
  onCopy,
  copiedId
}: MediaPreviewProps) {
  if (!item) return null;

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '未知大小';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-[#4E5969] hover:text-[#1D2129] transition-all shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 左侧：预览图 */}
        <div className="flex-1 bg-[#F9FBFF] flex items-center justify-center p-8 relative min-h-[300px] md:min-h-0">
          <div className="relative w-full h-full min-h-[400px]">
            <Image
              src={item.url}
              alt={item.filename}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* 右侧：详细信息 */}
        <div className="w-full md:w-[360px] bg-white border-l border-[#F2F3F5] flex flex-col">
          <div className="p-6 border-b border-[#F2F3F5]">
            <h3 className="text-lg font-bold text-[#1D2129] mb-1 truncate" title={item.filename}>
              {item.filename}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#86909C]">
              <span className="px-2 py-0.5 bg-[#F2F3F5] rounded-md font-medium uppercase">{item.filename.split('.').pop()}</span>
              <span>•</span>
              <span>{formatFileSize(item.size)}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#1D2129] flex items-center gap-2">
                <Info className="h-4 w-4 text-[#165DFF]" />
                文件信息
              </h4>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-[#86909C]">上传时间</div>
                <div className="text-[#1D2129] font-medium">{formatDate(item.created_at)}</div>
                <div className="text-[#86909C]">存储路径</div>
                <div className="text-[#1D2129] font-medium break-all">{item.path}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#1D2129]">文件链接</h4>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={item.url}
                  className="flex-1 text-xs bg-[#F2F3F5] border-none rounded-xl px-3 py-2 text-[#4E5969] focus:ring-0"
                />
                <Button
                  onClick={() => onCopy(item.url, item.id)}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-xl shrink-0 transition-all",
                    copiedId === item.id ? "bg-[#00B42A] text-white" : "bg-[#165DFF] text-white"
                  )}
                >
                  {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#F9FBFF] border-t border-[#F2F3F5] grid grid-cols-2 gap-3">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-[#E5E6EB] text-[#4E5969] hover:bg-white hover:border-[#165DFF] hover:text-[#165DFF] transition-all text-sm font-medium h-10 px-4"
              )}
            >
              <ExternalLink className="h-4 w-4" />
              查看原图
            </a>
            <Button
              onClick={() => {
                if (confirm('确定要删除这个文件吗？此操作不可撤销。')) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="bg-[#FFF2F2] text-[#F53F3F] hover:bg-[#F53F3F] hover:text-white rounded-xl border border-[#F53F3F]/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              删除文件
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
