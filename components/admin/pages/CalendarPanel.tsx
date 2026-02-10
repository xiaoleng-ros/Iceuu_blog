'use client';

import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval,
  parseISO
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarPanelProps {
  monthDate: Date;
  value: { start: string; end: string };
  onDateClick: (date: Date) => void;
}

/**
 * 日期选择面板组件
 * @param {CalendarPanelProps} props - 组件属性
 * @returns {JSX.Element}
 */
export function CalendarPanel({ monthDate, value, onDateClick }: CalendarPanelProps) {
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
              onClick={() => onDateClick(day)}
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
}
