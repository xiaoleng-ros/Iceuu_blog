'use client';

import { useAuthorStore } from '@/stores';

/**
 * 文章版权信息组件
 * 展示作者名称及版权声明，作者名称通过 useAuthorStore 获取
 */
const Copyright = () => {
  const author = useAuthorStore((state) => state.author);

  return (
    <div className="p-3 mt-12 border-l-[3px] border-[#00B42A] 
                    bg-[#f6ffed] rounded-md text-sm text-[#4E5969]
                     transition-all hover:shadow-md space-y-1">
      <p className="leading-tight">
        作者：{author?.name}
      </p>
      <p className="leading-tight">
        版权：此文章版权归 {author?.name} 所有，如有转载，请注明出处!
      </p>
    </div>
  );
};

export default Copyright;
