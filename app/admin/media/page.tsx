'use client';

import { useMediaManagement } from './hooks/useMediaManagement';
import { MediaHeader } from './components/MediaHeader';
import { MediaFilter } from './components/MediaFilter';
import { MediaContent } from './components/MediaContent';
import { MediaPreview } from './components/MediaPreview';
import { Toast } from '@/components/admin/pages/CommonComponents';

/**
 * 媒体库管理页面
 * 包含上传、预览、删除、筛选、搜索和视图切换功能
 * @returns 媒体库页面渲染结果
 */
export default function MediaPage() {
  const {
    media,
    loading,
    uploading,
    copiedId,
    viewMode,
    setViewMode,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    deletingId,
    setDeletingId,
    previewItem,
    setPreviewItem,
    toast,
    setToast,
    handleUpload,
    handleDelete,
    copyToClipboard
  } = useMediaManagement();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 提示通知 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* 页面头部：标题和上传按钮 */}
      <MediaHeader 
        uploading={uploading} 
        onUpload={handleUpload} 
      />

      {/* 筛选栏：搜索、分类筛选和视图切换 */}
      <MediaFilter 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 媒体内容展示：网格或列表视图 */}
      <div className="relative min-h-[500px]">
        <MediaContent 
          media={media}
          loading={loading}
          viewMode={viewMode}
          onPreview={setPreviewItem}
          onDelete={handleDelete}
          onCopy={copyToClipboard}
          onSetDeletingId={setDeletingId}
          copiedId={copiedId}
          deletingId={deletingId}
        />
      </div>

      {/* 媒体文件预览弹窗 */}
      <MediaPreview 
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDelete={handleDelete}
        onCopy={copyToClipboard}
        copiedId={copiedId}
      />
    </div>
  );
}
