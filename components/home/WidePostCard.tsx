import Link from 'next/link';
import Image from 'next/image';
import { formatDate, getFirstImageFromContent } from '@/lib/utils';
import { Clock, Tag } from 'lucide-react';
import { WidePostCardProps } from '@/types/components';
import { Blog } from '@/types/database';

/**
 * 卡片底层氛围背景组件
 * @param {Object} props - 组件属性
 * @param {string} props.image - 背景图片 URL
 * @returns {JSX.Element | null}
 */
function CardAtmosphere({ image }: { image?: string }) {
  if (!image) return null;
  return (
    <div
      className="absolute inset-0 z-0 opacity-50 blur-[50px] scale-125 transition-transform duration-1000 group-hover:scale-150"
      style={{
        backgroundImage: `url("${image}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}

/**
 * 卡片图片展示区域组件
 * @param {Object} props - 组件属性
 * @param {string} props.image - 展示图片 URL
 * @param {boolean} props.isEven - 是否为偶数索引，决定布局方向
 * @returns {JSX.Element}
 */
function CardImage({ image, isEven }: { image?: string; isEven: boolean }) {
  return (
    <>
      {/* 桌面端图片展示 */}
      <div
        className="relative hidden md:block w-[48%] h-full z-10 overflow-hidden transition-all duration-700"
        style={{
          clipPath: isEven
            ? 'polygon(0 0, 100% 0, 88% 100%, 0 100%)'
            : 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
      </div>

      {/* 移动端图片展示 */}
      <div className="md:hidden relative w-full h-[200px] overflow-hidden z-10">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        )}
      </div>
    </>
  );
}

/**
 * 卡片文字内容区域组件
 * @param {Object} props - 组件属性
 * @param {Blog} props.post - 文章数据
 * @param {boolean} props.isEven - 是否为偶数索引
 * @returns {JSX.Element}
 */
function CardContent({ post, isEven }: { post: Blog; isEven: boolean }) {
  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-20">
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
  );
}

/**
 * 首页文章列表卡片组件 - 实现交错式横向布局
 * @param {WidePostCardProps} props - 组件属性
 * @returns {JSX.Element} - 返回文章卡片 JSX
 */
export default function WidePostCard({ post, index }: WidePostCardProps) {
  const isEven = index % 2 === 0;
  const contentImage = getFirstImageFromContent(post.content);
  const displayImage = post.cover_image || contentImage;

  return (
    <Link href={`/blog/${post.id}`} className="block group">
      <div className={`relative flex flex-col md:flex-row ${!isEven ? 'md:flex-row-reverse' : ''} h-auto md:h-[220px] bg-[#1a1c23] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-700 hover:-translate-y-2 border border-white/10`}>
        <CardAtmosphere image={displayImage} />
        <CardImage image={displayImage} isEven={isEven} />
        <CardContent post={post} isEven={isEven} />

        {/* 鼠标悬停时的光泽扫描效果 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 z-30" />
      </div>
    </Link>
  );
}

