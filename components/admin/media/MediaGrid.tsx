'use client';

import Image from 'next/image';
import { 
  Copy, 
  Check, 
  Trash2, 
  Eye 
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MediaItem } from './useMediaList';

interface MediaGridProps {
  media: MediaItem[];
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onPreview: (item: MediaItem) => void;
  onCopy: (url: string, id: string) => void;
  copiedId: string | null;
  getCategoryLabel: (type?: string) => string;
  formatFileSize: (bytes?: number) => string;
}

interface MediaCardProps {
  item: MediaItem;
  index: number;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onPreview: (item: MediaItem) => void;
  onCopy: (url: string, id: string) => void;
  copiedId: string | null;
  getCategoryLabel: (type?: string) => string;
  formatFileSize: (bytes?: number) => string;
}

/**
 * 媒体库卡片组件
 * @param props - 组件属性
 * @returns {JSX.Element} 单个媒体卡片界面
 */
function MediaCard({
  item,
  index,
  deletingId,
  setDeletingId,
  onDelete,
  onPreview,
  onCopy,
  copiedId,
  getCategoryLabel,
  formatFileSize,
}: MediaCardProps) {
  return (
    <Card 
      key={item.id} 
      style={{ animationDelay: `${index * 50}ms` }}
      className="group relative bg-white border border-[#F2F3F5] hover:border-[#165DFF]/30 rounded-2xl overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 fill-mode-both"
    >
      <div className="aspect-square relative bg-[#F7F8FA] overflow-hidden">
        <Image 
          src={item.url} 
          alt={item.filename}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized
        />
        
        {/* Overlay Actions */}
        <div className={cn(
          "absolute inset-0 bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]",
          deletingId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {deletingId === item.id ? (
            <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
              <span className="text-white text-xs font-bold drop-shadow-md">确认删除？</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="h-8 px-3 bg-[#F53F3F] hover:bg-[#D32029] text-white rounded-lg text-xs"
                  onClick={() => onDelete(item.id)}
                >
                  确认
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 px-3 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs backdrop-blur-md"
                  onClick={() => setDeletingId(null)}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-9 w-9 p-0 bg-white/20 hover:bg-white text-white hover:text-[#165DFF] rounded-full backdrop-blur-md transition-all"
                onClick={() => onPreview(item)}
                title="预览"
              >
                <Eye className="h-4.5 w-4.5" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-9 w-9 p-0 bg-white/20 hover:bg-white text-white hover:text-[#165DFF] rounded-full backdrop-blur-md transition-all"
                onClick={() => onCopy(item.url, item.id)}
                title="复制链接"
              >
                {copiedId === item.id ? <Check className="h-4.5 w-4.5 text-green-500" /> : <Copy className="h-4.5 w-4.5" />}
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-9 w-9 p-0 bg-white/20 hover:bg-[#F53F3F] text-white rounded-full backdrop-blur-md transition-all"
                onClick={() => setDeletingId(item.id)}
                title="删除"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </Button>
            </>
          )}
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg border border-white/20 text-[10px] font-bold text-[#4E5969] uppercase tracking-wider shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {getCategoryLabel(item.type)}
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm font-bold text-[#1D2129] truncate mb-1" title={item.filename}>
          {item.filename}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#86909C] font-medium">
            {formatDate(item.created_at)}
          </span>
          <span className="text-[11px] text-[#86909C] bg-[#F7F8FA] px-1.5 py-0.5 rounded-md">
            {formatFileSize(item.size)}
          </span>
        </div>
      </div>
    </Card>
  );
}

/**
 * 媒体库网格视图组件
 * @param props - 组件属性
 * @returns {JSX.Element} 网格视图界面
 */
export function MediaGrid({
  media,
  ...props
}: MediaGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {media.map((item, index) => (
        <MediaCard 
          key={item.id} 
          item={item} 
          index={index} 
          {...props} 
        />
      ))}
    </div>
  );
}

