'use client';

import dynamic from 'next/dynamic';

// 动态导入编辑页内容，ssr: false 确保该页面的逻辑完全不进入服务端 Worker 压缩包
const BlogEditContent = dynamic(() => import('@/components/admin/pages/BlogEditContent').then(mod => mod.BlogEditContent), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#165DFF]/20 border-t-[#165DFF] rounded-full animate-spin" />
        <span className="text-[#86909C] text-sm">正在加载页面内容...</span>
      </div>
    </div>
  )
});

/**
 * 博客编辑/新建页面
 * 通过动态导入将所有业务逻辑移至客户端渲染，极大减小 Cloudflare Worker 压缩包体积
 */
export default function BlogEditPage() {
  return <BlogEditContent />;
}
