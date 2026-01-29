'use client';

import { useAuthorStore } from '@/stores';

/**
 * 文章版权信息组件
 * 展示作者名称及版权声明，作者名称通过 useAuthorStore 获取
 * @param {Object} props - 组件参数
 * @param {string} props.title - 文章标题
 * @param {string} props.id - 文章 ID
 */
const Copyright = ({ title, id }: { title: string; id: string }) => {
  const author = useAuthorStore((state) => state.author);
  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${id}` : '';

  return (
    <div className="p-4 mt-12 border-l-[4px] border-[#00B42A] 
                    bg-[#f6ffed] rounded-md text-sm text-[#4E5969]
                     transition-all hover:shadow-md space-y-2">
      <p className="leading-tight font-medium text-gray-900">
        文章标题：{title}
      </p>
      <p className="leading-tight">
        文章作者：{author?.name}
      </p>
      <p className="leading-tight">
        文章链接：<span className="text-blue-600 break-all">{currentUrl || `/blog/${id}`}</span>
      </p>
      <p className="leading-tight">
        版权声明：此文章版权归 {author?.name} 所有，如有转载，请注明出处!
      </p>
    </div>
  );
};

export default Copyright;
