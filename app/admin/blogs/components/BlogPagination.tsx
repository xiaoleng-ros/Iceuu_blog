'use client';

import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemLabel?: string;
}

/**
 * 博客列表分页组件
 * @param props - 分页相关的属性
 * @returns 分页渲染结果
 */
export function BlogPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  itemLabel = "篇文章"
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 bg-[#F7F8FA] border-t border-[#F2F3F5] flex items-center justify-between">
      <div className="text-xs text-[#86909C]">
        共 <span className="font-medium text-[#1D2129]">{totalItems}</span> {itemLabel}，
        当前第 <span className="font-medium text-[#1D2129]">{currentPage}</span> / {totalPages} 页
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 border-[#E5E6EB] text-[#4E5969] disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = currentPage;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 p-0 text-xs font-medium transition-all ${
                  currentPage === pageNum 
                    ? 'bg-[#165DFF] text-white border-[#165DFF] shadow-sm' 
                    : 'border-[#E5E6EB] text-[#4E5969] hover:bg-white hover:border-[#165DFF] hover:text-[#165DFF]'
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 border-[#E5E6EB] text-[#4E5969] disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
