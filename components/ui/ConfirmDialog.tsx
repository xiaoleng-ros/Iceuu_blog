import React, { useEffect } from 'react';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * 确认对话框组件
 * 用于替代浏览器原生的 confirm()，提供更统一和美观的交互体验
 * 
 * @param isOpen - 是否显示对话框
 * @param onClose - 关闭对话框的回调
 * @param onConfirm - 确认操作的回调
 * @param title - 对话框标题
 * @param description - 对话框描述内容
 * @param confirmText - 确认按钮文字，默认为"确定"
 * @param cancelText - 取消按钮文字，默认为"取消"
 * @param variant - 样式变体，支持 'danger' | 'warning' | 'info'
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '确定',
  cancelText = '取消',
  variant = 'danger'
}) => {
  // 处理键盘 ESC 键关闭对话框
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 根据不同变体定义样式
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-[#F53F3F]" />,
      iconBg: 'bg-[#FFF2F2]',
      button: 'bg-[#F53F3F] hover:bg-[#D32020] text-white border-transparent'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-[#FF7D00]" />,
      iconBg: 'bg-[#FFF7E8]',
      button: 'bg-[#FF7D00] hover:bg-[#E67000] text-white border-transparent'
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-[#165DFF]" />,
      iconBg: 'bg-[#E8F3FF]',
      button: 'bg-[#165DFF] hover:bg-[#0E42D2] text-white border-transparent'
    }
  };

  const style = variantStyles[variant as keyof typeof variantStyles] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* 背景遮罩 - 点击可关闭 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* 对话框主体 - 带有入场动画 */}
      <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* 状态图标 */}
            <div className={cn("flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center", style.iconBg)}>
              {style.icon}
            </div>
            {/* 内容区域 */}
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-[#1D2129] leading-tight">{title}</h3>
              <p className="mt-2 text-sm text-[#4E5969] leading-relaxed">
                {description}
              </p>
            </div>
            {/* 关闭按钮 */}
            <button 
              onClick={onClose}
              className="flex-shrink-0 text-[#C9CDD4] hover:text-[#86909C] transition-colors p-1 hover:bg-[#F2F3F5] rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 底部按钮区域 */}
        <div className="px-6 py-4 bg-[#F9FBFF]/50 border-t border-[#F2F3F5] flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="h-9 px-5 border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] hover:text-[#1D2129] rounded-lg transition-all font-medium"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn("h-9 px-5 rounded-lg transition-all shadow-sm font-bold border", style.button)}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
