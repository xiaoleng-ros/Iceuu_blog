'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

// 动态导入 BlogForm 以减小服务端 Worker 体积
const BlogForm = dynamic(() => import('@/components/admin/BlogForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#165DFF]/20 border-t-[#165DFF] rounded-full animate-spin" />
        <span className="text-[#86909C] text-sm">正在加载编辑器...</span>
      </div>
    </div>
  )
});

/**
 * 博客编辑页主内容组件
 * 已从 page.tsx 抽离，以便通过 dynamic(ssr: false) 导入，减小服务端 Worker 体积
 */
export function BlogEditContent() {
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      const fetchData = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return; 

          const res = await fetch(`/api/blog/${id}`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            }
          });
          
          if (res.ok) {
            const json = await res.json();
            setData(json.data);
          } else {
            console.error(`加载文章数据失败 [ID: ${id}]:`, res.statusText);
          }
        } catch (_error) {
          console.error(`获取文章数据异常 [ID: ${id}]:`, _error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isNew]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#165DFF]/20 border-t-[#165DFF] rounded-full animate-spin" />
        <span className="text-[#86909C] text-sm">正在加载文章数据...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5]">
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">
          {isNew ? '撰写新文章' : '编辑文章'}
        </h1>
        <p className="text-[#86909C] mt-1 text-sm">
          {isNew ? '记录您的灵感，开启新的创作之旅' : '完善您的创作内容，分享更多精彩'}
        </p>
      </div>
      <BlogForm initialData={data} isEditing={!isNew} />
    </div>
  );
}
