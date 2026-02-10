'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, ImageIcon, Eye, Copy, Check, Trash2, List as ListIcon } from 'lucide-react';
import Image from 'next/image';
import { cn, formatDate } from '@/lib/utils';
import { MediaItem } from '../hooks/useMediaManagement';

interface MediaContentProps {
  media: MediaItem[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onPreview: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onCopy: (url: string, id: string) => void;
  copiedId: string | null;
  deletingId: string | null;
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
  copiedId,
  deletingId
}: MediaContentProps) {
  if (loading && media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-[#F2F3F5]">
        <Loader2 className="h-10 w-10 text-[#165DFF] animate-spin mb-4" />
        <p className="text-[#86909C] text-sm font-medium">加载媒体库中...</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="w-20 h-20 bg-[#F2F3F5] rounded-full flex items-center justify-center mb-6">
          <ImageIcon className="h-10 w-10 text-[#C9CDD4]" />
        </div>
        <p className="text-[#1D2129] font-bold text-lg mb-2">暂无媒体文件</p>
        <p className="text-[#86909C] text-sm">上传一些图片来丰富您的媒体库吧</p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {media.map((item) => (
            <Card 
              key={item.id} 
              className="group overflow-hidden border border-[#F2F3F5] hover:border-[#40A9FF]/30 hover:shadow-[0_8px_24px_rgba(64,169,255,0.12)] transition-all duration-300 rounded-2xl bg-white"
            >
              <CardContent className="p-0">
                <div className="relative aspect-square bg-[#F9FBFF] overflow-hidden">
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                    unoptimized
                  />
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button 
                      onClick={() => onPreview(item)}
                      className="p-2 bg-white text-[#1D2129] rounded-xl hover:bg-[#165DFF] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-[0ms]"
                      title="预览"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onCopy(item.url, item.id)}
                      className={cn(
                        "p-2 rounded-xl transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-[50ms]",
                        copiedId === item.id ? "bg-[#00B42A] text-white" : "bg-white text-[#1D2129] hover:bg-[#165DFF] hover:text-white"
                      )}
                      title="复制链接"
                    >
                      {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('确定要删除这个文件吗？')) {
                          onDelete(item.id);
                        }
                      }}
                      disabled={deletingId === item.id}
                      className="p-2 bg-white text-[#F53F3F] rounded-xl hover:bg-[#F53F3F] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-[100ms]"
                      title="删除"
                    >
                      {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-[#1D2129] truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-[#86909C] mt-1">{formatDate(item.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F2F3F5] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#4E5969] bg-[#F9FBFF] border-b border-[#F2F3F5] font-bold">
              <tr>
                <th className="px-6 py-4">预览</th>
                <th className="px-6 py-4">文件名</th>
                <th className="px-6 py-4">创建时间</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F3F5]">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FBFF]/50 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-[#F2F3F5] bg-[#F9FBFF]">
                      <Image
                        src={item.url}
                        alt={item.filename}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-[#1D2129]">{item.filename}</td>
                  <td className="px-6 py-3 text-[#86909C]">{formatDate(item.created_at)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onPreview(item)} className="p-2 text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF] rounded-lg transition-all" title="预览">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onCopy(item.url, item.id)} className={cn("p-2 rounded-lg transition-all", copiedId === item.id ? "text-[#00B42A] bg-[#EFFFF0]" : "text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF]")} title="复制">
                        {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('确定要删除吗？')) onDelete(item.id);
                        }} 
                        className="p-2 text-[#4E5969] hover:text-[#F53F3F] hover:bg-[#FFF2F2] rounded-lg transition-all" 
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
