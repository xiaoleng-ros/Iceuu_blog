import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';

/**
 * 首页精选文章轮播/大图展示组件
 * 展示置顶或推荐的重点文章，增强首页视觉冲击力
 * @returns {JSX.Element} - 返回轮播组件 JSX
 */
export default function FeaturedCarousel() {
  return (
    <div className="relative w-full h-[280px] md:h-[320px] rounded-2xl overflow-hidden shadow-lg group cursor-pointer mb-8">
      {/* Background */}
      <div className="absolute inset-0 bg-white">
        <Image
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
          alt="Featured"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end h-full">
        <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
            <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">置顶推荐</span>
                <span className="text-white/80 text-sm font-medium">2026.01.25</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
            ThriveX 3.0：下一代现代化个人知识管理系统
            </h2>
            <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-4 opacity-90 max-w-2xl">
            历时半年重构，带来全新的编辑器体验、更强大的插件系统以及极致的性能优化。让我们一起探索数字花园的无限可能。
            </p>
            
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
            阅读全文 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
      </div>

      {/* Dots (Mock) */}
      <div className="absolute bottom-4 right-6 flex gap-2">
        <div className="w-6 h-1.5 bg-white rounded-full" />
        <div className="w-2 h-1.5 bg-white/50 rounded-full" />
        <div className="w-2 h-1.5 bg-white/50 rounded-full" />
      </div>
    </div>
  );
}
