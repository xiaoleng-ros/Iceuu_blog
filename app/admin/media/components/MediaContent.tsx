import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageIcon, Eye, Copy, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { MediaItem } from '../hooks/useMediaManagement';

interface MediaContentProps {
  media: MediaItem[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onPreview: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onCopy: (url: string, id: string) => void;
  onSetDeletingId: (id: string | null) => void;
  copiedId: string | null;
  deletingId: string | null;
}

/**
 * 根据类型获取分类名称
 * @param type - 媒体类型值
 * @returns string - 分类中文标签
 */
const getCategoryLabel = (type?: string) => {
  const categories: Record<string, string> = {
    'all': '全部',
    'post': '文章配图',
    'avatar': '头像',
    'site': '站点资源',
    'other': '其他'
  };
  return categories[type || ''] || '其他';
};

/**
 * 媒体卡片组件 (网格视图)
 */
function GridItem({ 
  item, index, onPreview, onCopy, onDelete, onSetDeletingId, copiedId, deletingId 
}: { 
  item: MediaItem; 
  index: number;
  onPreview: (item: MediaItem) => void;
  onCopy: (url: string, id: string) => void;
  onDelete: (id: string) => void;
  onSetDeletingId: (id: string | null) => void;
  copiedId: string | null;
  deletingId: string | null;
}) {
  return (
    <Card 
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
                  onClick={() => onSetDeletingId(null)}
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
                onClick={() => onSetDeletingId(item.id)}
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
 * 媒体列表行组件 (列表视图)
 */
function ListItem({ 
  item, onPreview, onCopy, onDelete, onSetDeletingId, copiedId, deletingId 
}: { 
  item: MediaItem; 
  onPreview: (item: MediaItem) => void;
  onCopy: (url: string, id: string) => void;
  onDelete: (id: string) => void;
  onSetDeletingId: (id: string | null) => void;
  copiedId: string | null;
  deletingId: string | null;
}) {
  return (
    <tr className="hover:bg-[#F9FBFF] transition-colors group">
      <td className="px-6 py-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E5E6EB] bg-[#F7F8FA] relative">
          <Image src={item.url} alt="" fill className="object-cover" unoptimized />
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#1D2129] group-hover:text-[#165DFF] transition-colors truncate max-w-md">
            {item.filename}
          </span>
          <span className="text-[11px] text-[#86909C] uppercase">{item.filename.split('.').pop()} 文件</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <span className="px-2 py-1 bg-[#F2F3F5] text-[#4E5969] text-[11px] font-bold rounded-md uppercase tracking-wider">
          {getCategoryLabel(item.type)}
        </span>
      </td>
      <td className="px-6 py-3 text-sm text-[#4E5969] font-medium">
        {formatFileSize(item.size)}
      </td>
      <td className="px-6 py-3 text-[11px] text-[#86909C] font-medium">
        {formatDate(item.created_at)}
      </td>
      <td className="px-6 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {deletingId === item.id ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <span className="text-[10px] font-bold text-[#F53F3F]">确定？</span>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-7 px-2 bg-[#F53F3F] hover:bg-[#D32029] text-white rounded-md text-[10px]"
                onClick={() => onDelete(item.id)}
              >
                确认
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-7 px-2 bg-[#F2F3F5] text-[#4E5969] hover:bg-[#E5E6EB] rounded-md text-[10px]"
                onClick={() => onSetDeletingId(null)}
              >
                取消
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF] rounded-lg"
                onClick={() => onPreview(item)}
                title="预览"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF] rounded-lg"
                onClick={() => onCopy(item.url, item.id)}
                title="复制链接"
              >
                {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-[#4E5969] hover:text-[#F53F3F] hover:bg-[#FFECEC] rounded-lg"
                onClick={() => onSetDeletingId(item.id)}
                title="删除"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * 媒体库内容展示组件（包含网格和列表视图）
 * @param props - 组件属性
 * @returns 内容区域渲染结果
 */
export function MediaContent({
  media,
  loading,
  viewMode,
  onPreview,
  onDelete,
  onCopy,
  onSetDeletingId,
  copiedId,
  deletingId
}: MediaContentProps) {
  if (loading && media.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-white rounded-2xl border border-[#F2F3F5] animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <Card className="border-dashed border-2 border-[#E5E6EB] bg-[#F7F8FA]/50 rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] mb-6 animate-bounce duration-[3s]">
            <ImageIcon className="h-10 w-10 text-[#C9CDD4]" />
          </div>
          <h3 className="text-xl font-bold text-[#1D2129]">暂无媒体资源</h3>
          <p className="text-[#86909C] mt-2 mb-8 max-w-xs text-sm">
            上传的图片将存储在云端并提供全球加速访问。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out",
      loading ? "opacity-40 blur-[2px] pointer-events-none scale-[0.99]" : "opacity-100 blur-0 scale-100"
    )}>
      {/* Loading Progress Bar */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 h-1 z-20 overflow-hidden rounded-full bg-[#165DFF]/10">
          <div className="h-full bg-[#165DFF] animate-progress-loading w-full origin-left" />
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {media.map((item, index) => (
            <GridItem 
              key={item.id} 
              item={item} 
              index={index}
              onPreview={onPreview} 
              onCopy={onCopy} 
              onDelete={onDelete} 
              onSetDeletingId={onSetDeletingId}
              copiedId={copiedId} 
              deletingId={deletingId} 
            />
          ))}
        </div>
      ) : (
        <Card className="border border-[#F2F3F5] rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#F2F3F5]">
                  <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider w-16 text-center">预览</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">文件名</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">分类</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">大小</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider">上传时间</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4E5969] uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F3F5]">
                {media.map((item) => (
                  <ListItem 
                    key={item.id} 
                    item={item} 
                    onPreview={onPreview} 
                    onCopy={onCopy} 
                    onDelete={onDelete} 
                    onSetDeletingId={onSetDeletingId}
                    copiedId={copiedId} 
                    deletingId={deletingId} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
