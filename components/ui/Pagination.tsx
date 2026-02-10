'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useRef } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

/**
 * 平滑滚动到页面顶部
 * @param {() => void} [onComplete] - 滚动完成后的回调
 * @returns {void}
 */
const scrollToTop = (onComplete?: () => void) => {
  const duration = 300;
  const start = window.pageYOffset;
  const startTime = performance.now();

  /**
   * 动画循环函数
   * @param {number} currentTime - 当前时间戳
   * @returns {void}
   */
  const animate = (currentTime: number) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // 使用 easeOutQuad 缓动函数
    const easeProgress = progress * (2 - progress);
    
    window.scrollTo(0, start * (1 - easeProgress));

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  };

  requestAnimationFrame(animate);
};

/**
 * 计算要显示的页码列表
 * @param {number} currentPage - 当前页码
 * @param {number} totalPages - 总页数
 * @returns {(number | string)[]} - 包含数字和省略号的数组
 */
const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
  }
  return pages;
};

/**
 * 分页组件 - 支持平滑滚动回顶交互
 * @param {PaginationProps} props - 组件属性
 * @param {number} props.currentPage - 当前页码
 * @param {number} props.totalPages - 总页数
 * @param {string} props.baseUrl - 基础 URL
 * @returns {JSX.Element | null} - 返回分页组件 JSX 或 null
 */
export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const router = useRouter();
  const isScrollingRef = useRef(false);

  /**
   * 处理页码点击跳转
   * @param {number} page - 目标页码
   * @returns {void}
   */
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage || isScrollingRef.current) return;

    isScrollingRef.current = true;
    
    // 智能处理 URL 拼接，避免出现 ?? 或 &?
    const separator = baseUrl.includes('?') ? '&' : '?';
    router.push(`${baseUrl}${separator}page=${page}`);

    // 跳转后执行平滑滚动
    setTimeout(() => {
      scrollToTop(() => {
        isScrollingRef.current = false;
      });
    }, 50);
  }, [baseUrl, currentPage, router]);

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {/* 上一页 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "p-2 rounded-xl transition-all duration-200 flex items-center justify-center",
          currentPage > 1 ? "hover:bg-gray-100 text-gray-600" : "text-gray-300 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* 页码 */}
      <div className="flex items-center gap-1.5">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 text-gray-400">
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(Number(page))}
              className={cn(
                "min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
                isCurrent
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* 下一页 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "p-2 rounded-xl transition-all duration-200 flex items-center justify-center",
          currentPage < totalPages ? "hover:bg-gray-100 text-gray-600" : "text-gray-300 cursor-not-allowed"
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
