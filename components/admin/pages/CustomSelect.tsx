'use client';

import { useState } from 'react';
import { ChevronDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 空状态组件
 * @param {string} message - 显示的消息
 * @param {string} className - 自定义样式类
 * @param {boolean} small - 是否使用紧凑模式
 */
const EmptyState = ({ message = "暂无数据", className, small = false }: { message?: string, className?: string, small?: boolean }) => (
  <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", small && "py-4", className)}>
    <div className={cn("mb-2 opacity-60", small && "mb-1")}>
      <div className={cn(
        "bg-[#F7F8FA] rounded-full flex items-center justify-center mb-1",
        small ? "w-10 h-10" : "w-14 h-14"
      )}>
        <Inbox className={cn("text-[#C9CDD4] stroke-[1]", small ? "w-5 h-5" : "w-7 h-7")} />
      </div>
    </div>
    <p className="text-[#86909C] text-xs font-normal">{message}</p>
  </div>
);

/**
 * 自定义选择器组件
 * @param {Object} props - 组件参数
 * @param {string} props.value - 当前选中的值
 * @param {Function} props.onChange - 值变化时的回调函数
 * @param {string[]} props.options - 可选项列表
 * @param {string} props.placeholder - 未选中时的占位文本
 * @param {string} props.label - 显示的标签文本
 * @returns {JSX.Element}
 */
export const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  label 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  placeholder: string;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 relative group w-full">
      <span className="text-[#4E5969] text-sm whitespace-nowrap min-w-[32px]">{label}:</span>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-8 rounded-lg border px-2 text-xs flex items-center justify-between transition-all bg-white",
            isOpen ? "border-[#165DFF] ring-1 ring-[#165DFF]" : "border-[#E5E6EB] hover:border-[#C9CDD4]",
            value ? "text-[#1D2129]" : "text-[#86909C]"
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-[#86909C] transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#F2F3F5] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
              {options.length > 0 ? (
                <div className="max-h-60 overflow-y-auto py-1">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs hover:bg-[#F2F3F5] transition-colors",
                        value === opt ? "text-[#165DFF] bg-[#E8F3FF] font-medium" : "text-[#4E5969]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState small />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
