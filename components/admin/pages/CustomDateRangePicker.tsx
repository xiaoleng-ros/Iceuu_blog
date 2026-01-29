'use client';

import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval,
  parseISO,
  isBefore
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/**
 * 自定义日期范围选择器组件
 * @param {Object} props - 组件参数
 * @param {Object} props.value - 当前选中的日期范围 { start: string, end: string }
 * @param {Function} props.onChange - 日期变化时的回调函数
 * @param {string} props.label - 显示的标签文本
 * @returns {JSX.Element}
 */
export const CustomDateRangePicker = ({
  value,
  onChange,
  label
}: {
  value: { start: string; end: string };
  onChange: (val: { start: string; end: string }) => void;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // 默认显示2026年1月

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!value.start || (value.start && value.end)) {
      onChange({ start: dateStr, end: '' });
    } else {
      if (isBefore(date, parseISO(value.start))) {
        onChange({ start: dateStr, end: '' });
      } else {
        onChange({ ...value, end: dateStr });
        setIsOpen(false);
      }
    }
  };

  const renderCalendar = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

    return (
      <div className="w-[280px] p-4">
        <div className="text-center font-bold text-[#1D2129] mb-4 text-sm">
          {format(monthDate, 'yyyy年 M月', { locale: zhCN })}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[#86909C] text-xs py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day, idx) => {
            const isSelected = (value.start && isSameDay(day, parseISO(value.start))) || 
                              (value.end && isSameDay(day, parseISO(value.end)));
            const isInRange = value.start && value.end && 
                             isWithinInterval(day, { start: parseISO(value.start), end: parseISO(value.end) });
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-8 w-full flex items-center justify-center text-xs transition-all relative",
                  !isCurrentMonth ? "text-[#C9CDD4]" : "text-[#1D2129] hover:bg-[#F2F3F5] rounded-md",
                  isSelected && "bg-[#165DFF] text-white rounded-md z-10 hover:bg-[#165DFF]",
                  isInRange && !isSelected && "bg-[#E8F3FF] text-[#165DFF] rounded-none"
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 relative w-full">
      <span className="text-[#4E5969] text-sm whitespace-nowrap min-w-[56px]">{label}:</span>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-8 rounded-lg border px-3 text-xs flex items-center justify-between transition-all bg-white",
            isOpen ? "border-[#165DFF] ring-1 ring-[#165DFF]" : "border-[#E5E6EB] hover:border-[#C9CDD4]"
          )}
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <span className={cn("truncate", !value.start && "text-[#C9CDD4]")}>
              {value.start ? format(parseISO(value.start), 'yyyy/MM/dd') : "选择起始时间"}
            </span>
            <span className="text-[#C9CDD4]">→</span>
            <span className={cn("truncate", !value.end && "text-[#C9CDD4]")}>
              {value.end ? format(parseISO(value.end), 'yyyy/MM/dd') : "选择结束时间"}
            </span>
          </div>
          <Calendar className="w-3.5 h-3.5 text-[#C9CDD4] ml-2 shrink-0" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 bg-white border border-[#F2F3F5] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-50 overflow-hidden flex flex-col min-w-[600px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F2F3F5]">
                <div className="flex gap-1">
                  <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 12))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 12))} className="p-1 hover:bg-[#F2F3F5] rounded text-[#86909C]">
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex divide-x divide-[#F2F3F5]">
                {renderCalendar(currentMonth)}
                {renderCalendar(addMonths(currentMonth, 1))}
              </div>
              <div className="p-3 border-t border-[#F2F3F5] flex justify-end gap-2 bg-[#F9FBFF]/50">
                <Button 
                  variant="outline" 
                  className="h-8 px-4 text-xs"
                  onClick={() => {
                    onChange({ start: '', end: '' });
                    setIsOpen(false);
                  }}
                >
                  重 置
                </Button>
                <Button 
                  className="h-8 px-4 text-xs bg-[#165DFF] hover:bg-[#0E42D2] text-white"
                  onClick={() => setIsOpen(false)}
                >
                  确 定
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
