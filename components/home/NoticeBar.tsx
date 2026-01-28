import { Bell, ChevronRight } from 'lucide-react';

export default function NoticeBar() {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-8 text-sm text-amber-900 shadow-sm">
      <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs shrink-0">
        <Bell className="w-3.5 h-3.5" />
        <span>最新动态</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="truncate cursor-pointer hover:text-amber-700 transition-colors">
          🎉 博客系统 2.0 正式上线！欢迎体验全新的界面与功能...
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
    </div>
  );
}
