import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 * 处理条件类名、动态类名并解决冲突
 * @param {...ClassValue[]} inputs - 多个类名、数组或条件对象
 * @returns {string} - 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期时间
 * @param {string | Date} date - 待格式化的日期或日期字符串
 * @returns {string} - 格式化后的日期字符串 (e.g., "2024年1月1日 12:00")
 */
export function formatDate(date: string | Date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
