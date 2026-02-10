'use client';

import Image from 'next/image';
import { 
  Copy, 
  Check, 
  Trash2, 
  X,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MediaItem } from './useMediaList';

interface MediaPreviewModalProps {
  item: MediaItem;
  onClose: () => void;
  onCopy: (url: string, id: string) => void;
  onDelete: (id: string) => void;
  copiedId: string | null;
  formatFileSize: (bytes?: number) => string;
}

/**
 * 媒体文件预览弹窗组件
 * @param props - 组件属性
 * @returns {JSX.Element} 预览弹窗界面
 */
export function MediaPreviewModal({
  item,
  onClose,
  onCopy,
  onDelete,
  copiedId,
  formatFileSize,
}: MediaPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-[#F2F3F5]">
          <div className="flex flex-col">
            <h3 className="font-bold text-[#1D2129] truncate max-w-md">{item.filename}</h3>
            <p className="text-xs text-[#86909C]">{formatFileSize(item.size)} • {formatDate(item.created_at)}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F2F3F5] rounded-full text-[#4E5969] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-[#F7F8FA] p-4 flex items-center justify-center">
          <Image 
            src={item.url} 
            alt={item.filename} 
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain shadow-lg rounded-lg" 
            unoptimized
          />
        </div>
        <div className="p-4 border-t border-[#F2F3F5] flex justify-between items-center bg-white">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="rounded-xl border-[#E5E6EB] flex items-center gap-2 h-10 px-4 text-sm"
              onClick={() => onCopy(item.url, item.id)}
            >
              {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copiedId === item.id ? '已复制' : '复制链接'}
            </Button>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[#E5E6EB] hover:bg-[#F2F3F5] h-10 px-4 text-sm font-medium text-[#4E5969] gap-2 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              新标签页打开
            </a>
          </div>
          <Button 
            variant="ghost" 
            className="rounded-xl text-[#F53F3F] hover:bg-[#FFF2F2] h-10 px-4"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            彻底删除
          </Button>
        </div>
      </div>
    </div>
  );
}
