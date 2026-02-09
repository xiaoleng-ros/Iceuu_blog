'use client';

import { useRef, useState, useEffect } from 'react';
import { Label } from '@/components/ui/Label';
import { Hash, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

/**
 * 文章分类选择组件
 * @param {CategorySelectorProps} props - 组件属性
 * @returns {JSX.Element}
 */
export function CategorySelector({ value, onChange, categories }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3">
      <Label htmlFor="category" className="text-[#4E5969] font-bold text-xs uppercase tracking-wider flex items-center gap-2">
        <Hash className="w-3.5 h-3.5" /> 文章分类
      </Label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border border-[#E5E6EB] h-10 bg-white px-3 text-sm transition-all outline-none relative z-20",
            isOpen ? "border-[#165DFF] ring-4 ring-[#165DFF]/5 shadow-sm" : "hover:border-[#C9CDD4]"
          )}
        >
          <span className={cn(
            "font-medium",
            value ? "text-[#1D2129]" : "text-[#86909C]"
          )}>
            {value || '请选择分类'}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-[#86909C] transition-transform duration-300 ease-in-out",
            isOpen && "rotate-180 text-[#165DFF]"
          )} />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-white border border-[#F2F3F5] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar overscroll-contain px-1.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    onChange(category);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 my-0.5 text-sm rounded-lg transition-all duration-200 group",
                    value === category 
                      ? "bg-[#E8F3FF] text-[#165DFF] font-bold" 
                      : "text-[#4E5969] hover:bg-[#F7F8FA] hover:text-[#1D2129] active:scale-[0.98]"
                  )}
                >
                  <span className="relative z-10">{category}</span>
                  {value === category && (
                    <div className="bg-[#165DFF] rounded-full p-0.5 animate-in zoom-in duration-300">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
