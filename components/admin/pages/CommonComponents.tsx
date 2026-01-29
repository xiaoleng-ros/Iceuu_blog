'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Toast 提示组件
 * @param {string} message - 提示消息
 * @param {'success' | 'error' | 'info' | 'warning'} type - 提示类型
 * @param {() => void} onClose - 关闭回调
 */
export const Toast = ({ 
  message, 
  type = 'info', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info' | 'warning'; 
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#00B42A]" />,
    error: <XCircle className="w-4 h-4 text-[#F53F3F]" />,
    warning: <AlertCircle className="w-4 h-4 text-[#FF7D00]" />,
    info: <AlertCircle className="w-4 h-4 text-[#165DFF]" />
  };

  const bgColors = {
    success: 'bg-[#EFFFF0] border-[#00B42A]/20',
    error: 'bg-[#FFF2F2] border-[#F53F3F]/20',
    warning: 'bg-[#FFF7E8] border-[#FF7D00]/20',
    info: 'bg-[#E8F3FF] border-[#165DFF]/20'
  };

  return (
    <div className={cn(
      "fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300",
      bgColors[type]
    )}>
      {icons[type]}
      <span className="text-sm font-medium text-[#1D2129]">{message}</span>
    </div>
  );
};

/**
 * 空状态组件
 * @param {string} message - 显示的消息
 * @param {string} className - 自定义样式类
 * @param {boolean} small - 是否使用紧凑模式
 */
export const EmptyState = ({ 
  message = "暂无数据", 
  className, 
  small = false 
}: { 
  message?: string; 
  className?: string; 
  small?: boolean;
}) => (
  <div className={cn(
    "flex flex-col items-center justify-center py-12 px-4 text-center",
    small && "py-4",
    className
  )}>
    <div className={cn(
      "mb-2 opacity-60",
      small && "mb-1"
    )}>
      <div className={cn(
        "bg-[#F7F8FA] rounded-full flex items-center justify-center mb-1",
        small ? "w-10 h-10" : "w-14 h-14"
      )}>
        <Inbox className={cn(
          "text-[#C9CDD4] stroke-[1]",
          small ? "w-5 h-5" : "w-7 h-7"
        )} />
      </div>
    </div>
    <p className="text-[#86909C] text-xs font-normal">{message}</p>
  </div>
);
