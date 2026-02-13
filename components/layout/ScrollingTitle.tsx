'use client';

import { useEffect, useRef } from 'react';

/**
 * 滚动标题组件
 * 实现浏览器页面标题从右往左流畅滚动效果
 * @returns null - 该组件不渲染任何 UI
 */
export function ScrollingTitle() {
  const titleRef = useRef<string>('年年岁岁花相似，岁岁年年人不同');
  const positionRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const originalTitle = titleRef.current;
    const title = originalTitle;
    const chars = title.length;
    // 每帧滚动的字符数，控制滚动速度
    const scrollSpeed = 0.08;
    // 停顿时间（毫秒）
    const pauseDuration = 1500;
    
    /**
     * 使用 requestAnimationFrame 实现流畅滚动
     */
    const animate = (currentTime: number) => {
      // 计算时间差，确保不同刷新率下速度一致
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      const deltaTime = currentTime - lastTimeRef.current;
      
      // 更新位置（基于时间计算，确保流畅）
      positionRef.current += scrollSpeed * (deltaTime / 16);
      
      // 如果整句话已经完全滚出
      if (positionRef.current >= chars) {
        // 停顿后重新开始
        lastTimeRef.current = 0;
        setTimeout(() => {
          positionRef.current = 0;
          lastTimeRef.current = 0;
          rafRef.current = requestAnimationFrame(animate);
        }, pauseDuration);
        return;
      }
      
      // 计算当前显示的字符位置
      const startIndex = Math.floor(positionRef.current);
      const currentDisplay = title.slice(startIndex);
      document.title = currentDisplay;
      
      lastTimeRef.current = currentTime;
      rafRef.current = requestAnimationFrame(animate);
    };

    // 开始动画
    rafRef.current = requestAnimationFrame(animate);

    // 清理函数
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.title = originalTitle;
    };
  }, []);

  return null;
}
