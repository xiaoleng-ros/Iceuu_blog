'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 博客列表分页组件接口
 */
interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

/**
 * 博客列表分页组件
 * @param props - 当前页码、总页数和分页回调
 * @returns JSX.Element
 */
export function BlogPagination({
  currentPage,
  totalPages,
  onPageChange
}: BlogPaginationProps) {
  return (
    <div className="px-6 py-6 flex items-center justify-center gap-8 border-t border-[#F2F3F5]">
      <button 
        className="text-[#C9CDD4] hover:text-[#86909C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
        onClick={() => onPageChange((prev: number) => Math.max(1, prev - 1))}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-[#1D2129] font-medium text-sm">
        {currentPage} / {totalPages}
      </span>
      <button 
        className="text-[#C9CDD4] hover:text-[#86909C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange((prev: number) => Math.min(totalPages, prev + 1))}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
