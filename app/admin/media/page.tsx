'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Copy, 
  Check, 
  UploadCloud, 
  RefreshCw, 
  Image as ImageIcon, 
  Loader2, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Trash2, 
  Eye, 
  ExternalLink,
  Search,
  FileIcon,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

/**
 * Toast 提示组件
 */
const Toast = ({ 
  message, 
  type = 'info', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info' | 'warning'; 
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#00B42A]" />,
    error: <XCircle className="w-4 h-4 text-[#F53F3F]" />,
    warning: <AlertCircle className="w-4 h-4 text-[#FF7D00]" />,
    info: <AlertCircle className="w-4 h-4 text-[#165DFF]" />
  };

  const bgColors = {
    success: 'bg-[#EFFFF0] border-[#00B42A]/20',
    error: 'bg-[#FFF2F2] border-[#F53F3F]/20',
    warning: 'bg-[#FFF7E8] border-[#FF7D00]/20',
    info: 'bg-[#E8F3FF] border-[#165DFF]/20'
  };

  return (
    <div className={cn(
      "fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300",
      bgColors[type]
    )}>
      {icons[type]}
      <span className="text-sm font-medium text-[#1D2129]">{message}</span>
    </div>
  );
};

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  path: string;
  created_at: string;
  size?: number;
  type?: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  /**
   * 显示提示信息
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  const categories = [
    { label: '全部', value: 'all' },
    { label: '文章配图', value: 'post' },
    { label: '头像', value: 'avatar' },
    { label: '站点资源', value: 'site' },
    { label: '其他', value: 'other' },
  ];

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const url = new URL('/api/media', window.location.origin);
      url.searchParams.append('limit', '100');
      if (selectedType !== 'all') {
        url.searchParams.append('type', selectedType);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const json = await res.json();
      if (res.ok) {
        setMedia(json.data || []);
      }
    } catch (error) {
      console.error('Fetch media error:', error);
      showToast('获取媒体库失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, selectedType]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, selectedType]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'site');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (res.ok) {
        showToast('图片上传成功', 'success');
        fetchMedia();
      } else {
        showToast('上传失败: ' + json.error, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('上传出错', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/media`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ids: [id] })
      });

      if (res.ok) {
        setMedia(prev => prev.filter(item => item.id !== id));
        showToast('文件已从数据库和 GitHub 同步删除', 'success');
        setDeletingId(null);
      } else {
        const json = await res.json();
        showToast('删除失败: ' + (json.error || '未知错误'), 'error');
        setDeletingId(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('删除出错', 'error');
      setDeletingId(null);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('链接已复制到剪贴板', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '未知大小';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (type?: string) => {
    return categories.find(c => c.value === type)?.label || '其他';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Header */}
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
              onChange={handleUpload}
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

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white/50 p-2 rounded-2xl border border-[#F2F3F5]/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86909C]" />
            <input
              type="text"
              placeholder="搜索媒体文件名..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#E5E6EB] focus:border-[#165DFF] focus:ring-4 focus:ring-[#165DFF]/5 rounded-xl text-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-1 bg-[#F2F3F5]/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedType(cat.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  selectedType === cat.value
                    ? "bg-white text-[#165DFF] shadow-sm"
                    : "text-[#4E5969] hover:text-[#1D2129] hover:bg-white/50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#E5E6EB] shadow-sm ml-auto lg:ml-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center gap-2 px-3 text-sm font-medium",
              viewMode === 'grid' 
                ? "bg-[#F2F3F5] text-[#165DFF]" 
                : "text-[#4E5969] hover:bg-[#F7F8FA]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">网格</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all flex items-center gap-2 px-3 text-sm font-medium",
              viewMode === 'list' 
                ? "bg-[#F2F3F5] text-[#165DFF]" 
                : "text-[#4E5969] hover:bg-[#F7F8FA]"
            )}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">列表</span>
          </button>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative min-h-[500px] transition-all duration-500">
        {/* Loading Progress Bar */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 z-20 overflow-hidden rounded-full bg-[#165DFF]/10">
            <div className="h-full bg-[#165DFF] animate-progress-loading w-full origin-left" />
          </div>
        )}

        {loading && media.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-2xl border border-[#F2F3F5] animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className={cn(
            "transition-all duration-500 ease-in-out",
            loading ? "opacity-40 blur-[2px] pointer-events-none scale-[0.99]" : "opacity-100 blur-0 scale-100"
          )}>
            {filteredMedia.length === 0 ? (
        <Card className="border-dashed border-2 border-[#E5E6EB] bg-[#F7F8FA]/50 rounded-2xl overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] mb-6 animate-bounce duration-[3s]">
              <ImageIcon className="h-10 w-10 text-[#C9CDD4]" />
            </div>
            <h3 className="text-xl font-bold text-[#1D2129]">暂无媒体资源</h3>
            <p className="text-[#86909C] mt-2 mb-8 max-w-xs text-sm">
              {searchQuery ? `未找到与 "${searchQuery}" 相关的媒体文件。` : '上传的图片将存储在云端并提供全球加速访问。'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => document.getElementById('upload-media')?.click()}
                variant="outline"
                className="rounded-xl border-[#E5E6EB] hover:bg-white hover:border-[#165DFF] hover:text-[#165DFF] transition-all"
              >
                开始上传媒体
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.map((item, index) => (
            <Card 
              key={item.id} 
              style={{ animationDelay: `${index * 50}ms` }}
              className="group relative bg-white border border-[#F2F3F5] hover:border-[#165DFF]/30 rounded-2xl overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 fill-mode-both"
            >
              <div className="aspect-square relative bg-[#F7F8FA] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.url} 
                  alt={item.filename}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
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
                          onClick={() => handleDelete(item.id)}
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
                        onClick={() => setPreviewItem(item)}
                        title="预览"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-9 w-9 p-0 bg-white/20 hover:bg-white text-white hover:text-[#165DFF] rounded-full backdrop-blur-md transition-all"
                        onClick={() => copyToClipboard(item.url, item.id)}
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
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FBFF] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E5E6EB] bg-[#F7F8FA]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
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
                              onClick={() => handleDelete(item.id)}
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
                              onClick={() => setPreviewItem(item)}
                              title="预览"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[#4E5969] hover:text-[#165DFF] hover:bg-[#E8F3FF] rounded-lg"
                              onClick={() => copyToClipboard(item.url, item.id)}
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
      )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-[#F2F3F5]">
              <div className="flex flex-col">
                <h3 className="font-bold text-[#1D2129] truncate max-w-md">{previewItem.filename}</h3>
                <p className="text-xs text-[#86909C]">{formatFileSize(previewItem.size)} • {formatDate(previewItem.created_at)}</p>
              </div>
              <button 
                onClick={() => setPreviewItem(null)}
                className="p-2 hover:bg-[#F2F3F5] rounded-full text-[#4E5969] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#F7F8FA] p-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={previewItem.url} 
                alt={previewItem.filename} 
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg" 
              />
            </div>
            <div className="p-4 border-t border-[#F2F3F5] flex justify-between items-center bg-white">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-[#E5E6EB] flex items-center gap-2 h-10 px-4 text-sm"
                  onClick={() => copyToClipboard(previewItem.url, previewItem.id)}
                >
                  {copiedId === previewItem.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copiedId === previewItem.id ? '已复制' : '复制链接'}
                </Button>
                <a 
                  href={previewItem.url} 
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
                  handleDelete(previewItem.id);
                  setPreviewItem(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                彻底删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
