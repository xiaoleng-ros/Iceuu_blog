'use client';

import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 退出登录确认模态框组件
 * @param {LogoutModalProps} props - 组件属性
 * @returns {JSX.Element | null}
 */
export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#1D2129]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full relative z-10 animate-in zoom-in-95 fade-in duration-300">
        <h3 className="text-lg font-semibold text-[#1D2129] mb-2">确认退出</h3>
        <p className="text-[#4E5969] mb-6">您确定要退出登录吗？</p>
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5F7FA] text-[#4E5969] font-medium hover:bg-[#E5E8EF] transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#F53F3F] text-white font-medium hover:bg-[#D33030] shadow-lg shadow-red-200 transition-all"
          >
            确认退出
          </button>
        </div>
      </div>
    </div>
  );
}
