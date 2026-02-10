'use client';

import { useState } from 'react';
import { format, isBefore, parseISO } from 'date-fns';

interface DateRange {
  start: string;
  end: string;
}

/**
 * 日期范围选择器逻辑 Hook
 * @param {DateRange} value - 当前选中的日期范围
 * @param {Function} onChange - 日期变化时的回调函数
 * @returns {Object} 状态和处理函数
 */
export function useDateRangePicker(
  value: DateRange,
  onChange: (val: DateRange) => void
) {
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

  const reset = () => {
    onChange({ start: '', end: '' });
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    currentMonth,
    setCurrentMonth,
    handleDateClick,
    reset
  };
}
