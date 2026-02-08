'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'md-editor-rt/lib/style.css';
import { supabase } from '@/lib/supabase';

// 动态导入 MdEditor 以避免 SSR 问题
const MdEditor = dynamic(
  () => import('md-editor-rt').then((mod) => mod.MdEditor),
  { 
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-gray-50 animate-pulse rounded-md flex items-center justify-center text-gray-400">Loading Editor...</div>
  }
);

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  articleId?: string;
}

/**
 * Markdown 编辑器组件
 * 封装了 md-editor-rt，支持图片上传、预览和行号显示
 * @param {EditorProps} props - 编辑器属性
 * @param {string} props.value - Markdown 内容
 * @param {(value: string) => void} props.onChange - 内容变更回调
 * @param {string} [props.placeholder] - 占位提示文本
 * @param {string} [props.articleId] - 文章 ID，用于图片上传上下文
 * @returns {JSX.Element} - 返回编辑器 JSX 结构
 */
export default function Editor({ value, onChange, placeholder, articleId }: EditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * 处理图片上传逻辑
   * @param {File[]} files - 待上传的文件列表
   * @param {(urls: string[]) => void} callback - 上传成功后的 URL 回调
   * @returns {Promise<void>}
   */
  const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('请先登录');
        return;
      }

      // 并行上传所有选中的图片
      await Promise.all(
        files.map(async (file) => {
          // 检查文件大小 (5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert(`文件 ${file.name} 超过 5MB，已跳过`);
            return;
          }

          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'post');
          if (articleId) {
            formData.append('contextId', articleId);
          }

          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              },
              body: formData
            });

            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error || '上传失败');
            }

            const data = await res.json();
            uploadedUrls.push(data.data.url);
          } catch (_error) {
            console.error(`上传图片失败 [文件: ${file.name}]:`, _error);
            alert(`图片 ${file.name} 上传失败`);
          }
        })
      );

      // 回调插入图片链接
      if (uploadedUrls.length > 0) {
        callback(uploadedUrls);
      }

    } catch (_error) {
      console.error('图片上传流程异常:', _error);
      alert('上传过程中发生错误');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {isUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-md">
          <div className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full border border-blue-100 text-blue-600 font-medium text-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            正在上传图片...
          </div>
        </div>
      )}
      <MdEditor
        modelValue={value}
        onChange={onChange}
        placeholder={placeholder}
        onUploadImg={onUploadImg}
        style={{ height: '600px' }}
        preview={true} // 默认开启预览
        showCodeRowNumber={true} // 显示行号
        toolbarsExclude={['github']} // 排除不需要的工具栏按钮
        className="rounded-xl overflow-hidden border border-[#F2F3F5] shadow-sm"
      />
    </div>
  );
}
