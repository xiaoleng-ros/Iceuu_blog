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
 * 删除确认操作组件
 * 显示确认和取消按钮
 */
function DeleteConfirmActions({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
      <span className="text-white text-sm font-medium drop-shadow-md">确认删除？</span>
      <div className="flex gap-3">
        <Button 
          size="sm" 
          className="h-9 px-5 bg-gradient-to-r from-[#FF9B9B] to-[#FF7B7B] hover:from-[#FF7B7B] hover:to-[#FF5B5B] text-white rounded-xl text-xs font-medium shadow-lg shadow-[#FF9B9B]/20"
          onClick={onConfirm}
        >
          确认
        </Button>
        <Button 
          size="sm" 
          className="h-9 px-5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-medium backdrop-blur-md border border-white/20"
          onClick={onCancel}
        >
          取消
        </Button>
      </div>
    </div>
  );
}

/**
 * 媒体卡片悬浮操作按钮组
 * 包含预览、复制、删除功能
 */
function MediaOverlayButtons({
  item,
  copiedId,
  onPreview,
  onCopy,
  onDeleteClick
}: {
  item: MediaItem;
  copiedId: string | null;
  onPreview: () => void;
  onCopy: () => void;
  onDeleteClick: () => void;
}) {
  return (
    <>
      <Button 
        size="sm" 
        variant="ghost"
        className="h-11 w-11 p-0 bg-white/25 hover:bg-white text-[#7EB6E8] rounded-2xl backdrop-blur-md transition-all border border-white/20 shadow-lg"
        onClick={onPreview}
        title="预览"
      >
        <Eye className="h-5 w-5" />
      </Button>
      <Button 
        size="sm" 
        variant="ghost"
        className="h-11 w-11 p-0 bg-white/25 hover:bg-white text-[#7EB6E8] rounded-2xl backdrop-blur-md transition-all border border-white/20 shadow-lg"
        onClick={onCopy}
        title="复制链接"
      >
        {copiedId === item.id ? <Check className="h-5 w-5 text-[#98D8AA]" /> : <Copy className="h-5 w-5" />}
      </Button>
      <Button 
        size="sm" 
        variant="ghost"
        className="h-11 w-11 p-0 bg-white/25 hover:bg-[#FF9B9B] text-white rounded-2xl backdrop-blur-md transition-all border border-white/20 shadow-lg"
        onClick={onDeleteClick}
        title="删除"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </>
  );
}

/**
 * 媒体卡片悬浮操作层
 * 根据状态显示删除确认或操作按钮
 */
function MediaOverlay({
  item,
  deletingId,
  copiedId,
  setDeletingId,
  onDelete,
  onPreview,
  onCopy
}: {
  item: MediaItem;
  deletingId: string | null;
  copiedId: string | null;
  setDeletingId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onPreview: (item: MediaItem) => void;
  onCopy: (url: string, id: string) => void;
}) {
  const isDeleting = deletingId === item.id;
  
  return (
    <div className={cn(
      "absolute inset-0 transition-all duration-300 flex items-center justify-center gap-2",
      isDeleting 
        ? "bg-black/50 backdrop-blur-sm" 
        : "bg-gradient-to-br from-[#7EB6E8]/30 via-[#FFB5C5]/20 to-[#C9A8E0]/30 opacity-0 group-hover:opacity-100 backdrop-blur-[2px]"
    )}>
      {isDeleting ? (
        <DeleteConfirmActions 
          onConfirm={() => onDelete(item.id)}
          onCancel={() => setDeletingId(null)}
        />
      ) : (
        <MediaOverlayButtons 
          item={item}
          copiedId={copiedId}
          onPreview={() => onPreview(item)}
          onCopy={() => onCopy(item.url, item.id)}
          onDeleteClick={() => setDeletingId(item.id)}
        />
      )}
    </div>
  );
}

/**
 * 媒体卡片信息区域
 * 显示文件名、日期和大小
 */
function MediaCardInfo({
  item,
  formatFileSize
}: {
  item: MediaItem;
  formatFileSize: (bytes?: number) => string;
}) {
  return (
    <div className="p-4 bg-gradient-to-br from-white to-[#FFF5F8]/30">
      <p className="text-sm font-medium text-[#4A4A4A] truncate mb-2" title={item.filename}>
        {item.filename}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#9B9B9B] font-light">
          {formatDate(item.created_at)}
        </span>
        <span className="text-[11px] text-[#9B9B9B] bg-gradient-to-r from-[#F8FCFF] to-[#FFF5F8] px-2.5 py-1 rounded-lg border border-[#E8E8E8]/50">
          {formatFileSize(item.size)}
        </span>
      </div>
    </div>
  );
}

/**
 * 媒体库卡片组件
 * 采用日系动漫风格设计，柔和光影与梦幻氛围
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
      style={{ animationDelay: `${index * 60}ms` }}
      className="group relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(126,182,232,0.06)] hover:shadow-[0_16px_48px_rgba(126,182,232,0.12)] hover:-translate-y-2 transition-all duration-400 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 fill-mode-both"
    >
      {/* 图片区域 */}
      <div className="aspect-square relative bg-gradient-to-br from-[#F8FCFF] to-[#FFF5F8] overflow-hidden">
        <Image 
          src={item.url} 
          alt={item.filename}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized
        />
        
        {/* 顶部装饰渐变 */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
        
        {/* 悬浮操作层 */}
        <MediaOverlay 
          item={item}
          deletingId={deletingId}
          copiedId={copiedId}
          setDeletingId={setDeletingId}
          onDelete={onDelete}
          onPreview={onPreview}
          onCopy={onCopy}
        />
        
        {/* 类型标签 */}
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-xl border border-white/30 text-[10px] font-medium text-[#7EB6E8] uppercase tracking-wider shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {getCategoryLabel(item.type)}
        </div>
      </div>
      
      {/* 信息区域 */}
      <MediaCardInfo item={item} formatFileSize={formatFileSize} />
    </Card>
  );
}

/**
 * 媒体库网格视图组件
 * 采用日系动漫风格设计
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
