import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Clock, Tag } from 'lucide-react';

interface WidePostCardProps {
  post: any;
  index: number;
}

/**
 * 首页文章列表卡片组件 - 实现交错式横向布局
 * @param post 文章数据
 * @param index 索引，用于决定布局方向
 */
export default function WidePostCard({ post, index }: WidePostCardProps) {
  const isEven = index % 2 === 0;

  // 从文章正文中提取第一张图片的 URL
  const getFirstImageFromContent = (content: string) => {
    if (!content) return null;
    // 匹配 Markdown 图片格式 ![alt](url)
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1]) return mdMatch[1];
    // 匹配 HTML 图片格式 <img src="url" ...>
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/);
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
    return null;
  };

  const contentImage = getFirstImageFromContent(post.content);
  // 仅使用数据库中的 cover_image 字段，如果没有则回退到正文图
  const displayImage = post.cover_image || contentImage;

  return (
    <Link href={`/blog/${post.id}`} className="block group">
      <div className={`relative flex flex-col md:flex-row ${!isEven ? 'md:flex-row-reverse' : ''} h-auto md:h-[220px] bg-[#1a1c23] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-700 hover:-translate-y-2 border border-white/10`}>
        
        {/* 1. 底层氛围背景：全屏铺满，高模糊 */}
        {displayImage && (
          <div 
            className="absolute inset-0 z-0 opacity-50 blur-[50px] scale-125 transition-transform duration-1000 group-hover:scale-150"
            style={{ 
              backgroundImage: `url("${displayImage}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        {/* 2. 图片展示区 (中层) */}
        <div 
          className={`relative hidden md:block w-[48%] h-full z-10 overflow-hidden transition-all duration-700`}
          style={{
            clipPath: isEven 
              ? 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' 
              : 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)',
          }}
        >
          {displayImage && (
            <Image
              src={displayImage}
              alt=""
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized
            />
          )}
          {/* 图片边缘光泽 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
        </div>

        {/* 移动端图片展示 */}
        <div className="md:hidden relative w-full h-[200px] overflow-hidden z-10">
          {displayImage && (
            <Image
              src={displayImage}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
          )}
        </div>

        {/* 3. 文字内容区 (顶层) */}
        <div className={`flex-1 p-6 md:p-8 flex flex-col justify-center relative z-20`}>
          <div className={`flex flex-col h-full ${!isEven ? 'md:text-left md:items-start' : 'md:text-left md:items-start'}`}>
            <h3 className="text-xl md:text-2xl font-bold !text-white mb-3 line-clamp-1 leading-tight group-hover:text-blue-400 transition-colors font-mono italic antialiased tracking-tight pr-4">
              {post.title}
            </h3>
            
            {post.excerpt && (
              <p className="!text-gray-100 text-sm md:text-base line-clamp-2 mb-4 leading-relaxed font-normal">
                {post.excerpt}
              </p>
            )}

            <div className="mt-auto flex items-center gap-4 md:gap-6 text-xs md:text-sm overflow-hidden">
              {/* 发布日期 */}
              <div className="flex items-center gap-2 text-white/90 shrink-0">
                <div className="p-1.5 bg-blue-500 rounded-full shadow-lg">
                  <Clock className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium whitespace-nowrap">{formatDate(post.created_at)}</span>
              </div>

              {/* 分类 */}
              {post.category && (
                <div className="flex items-center gap-2 text-white/90 shrink-0">
                  <div className="p-1.5 bg-amber-500 rounded-full shadow-lg">
                    <Tag className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-medium whitespace-nowrap">{post.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 鼠标悬停时的光泽扫描效果 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 z-30" />
      </div>
    </Link>
  );
}
