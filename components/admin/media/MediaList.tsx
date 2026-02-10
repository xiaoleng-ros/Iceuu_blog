'use client';

import Image from 'next/image';
import { 
  Copy, 
  Check, 
  Trash2, 
  Eye 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MediaItem } from './useMediaList';

interface MediaListProps {
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

/**
 * 媒体库列表视图组件
 * @param props - 组件属性
 * @returns {JSX.Element} 列表视图界面
 */
export function MediaList({
  media,
  deletingId,
  setDeletingId,
  onDelete,
  onPreview,
  onCopy,
  copiedId,
  getCategoryLabel,
  formatFileSize,
}: MediaListProps) {
  return (
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
              <tr key={item.id} className="hover:bg-[#F9FBFF] transition-colors group">
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
                <td className="px-6 py-3 text-sm text-[#86909C]">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {deletingId === item.id ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                        <span className="text-[10px] font-bold text-[#F53F3F] mr-1">确认删除？</span>
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
                          onClick={() => setDeletingId(null)}
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
                          onClick={() => setDeletingId(item.id)}
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
