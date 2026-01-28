'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * 3D 旋转图标云组件
 * 用于展示侧边栏的立体循环图标
 */
interface IconCloudProps {
  icons: string[];
}

interface IconPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  fileName: string;
}

/**
 * 3D 旋转图标云组件
 * @param icons 图标文件名列表
 * 实现了基于黄金分割螺旋算法的球面分布，以及基于鼠标交互的 3D 旋转效果
 * 修复：使用 Ref 直接更新 DOM 样式，消除高频 setState 导致的 "Maximum update depth exceeded" 错误
 */
export default function IconCloud({ icons }: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<(HTMLDivElement | null)[]>([]);
  const positionsRef = useRef<IconPosition[]>([]);
  const rotationRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 初始化图标位置
  useEffect(() => {
    if (!icons.length) return;
    
    const count = icons.length;
    const initialPositions: IconPosition[] = icons.map((icon, i) => {
      // 使用黄金分割螺旋算法均匀分布点在球面上
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      return {
        x: Math.cos(theta) * Math.sin(phi) * 100,
        y: Math.sin(theta) * Math.sin(phi) * 100,
        z: Math.cos(phi) * 100,
        scale: 1,
        opacity: 1,
        fileName: icon,
      };
    });
    
    positionsRef.current = initialPositions;
    setInitialized(true);
  }, [icons]);

  // 动画循环
  useEffect(() => {
    if (!initialized || !positionsRef.current.length) return;

    let animationFrame: number;
    
    const animate = () => {
      // 获取旋转增量
      let dx = 0.005;
      let dy = 0.005;

      if (isHovered) {
        dx = rotationRef.current.x;
        dy = rotationRef.current.y;
        // 逐渐减速
        rotationRef.current.x *= 0.95;
        rotationRef.current.y *= 0.95;
      }

      const cosX = Math.cos(dx);
      const sinX = Math.sin(dx);
      const cosY = Math.cos(dy);
      const sinY = Math.sin(dy);

      // 更新位置数据并直接更新 DOM
      positionsRef.current.forEach((pos, i) => {
        const iconElement = iconsRef.current[i];
        if (!iconElement) return;

        // 绕 X 轴旋转
        const y1 = pos.y * cosX - pos.z * sinX;
        const z1 = pos.y * sinX + pos.z * cosX;

        // 绕 Y 轴旋转
        const x2 = pos.x * cosY + z1 * sinY;
        const z2 = -pos.x * sinY + z1 * cosY;

        // 更新 Ref 中的数据
        pos.x = x2;
        pos.y = y1;
        pos.z = z2;

        // 计算缩放和透明度
        const scale = (z2 + 150) / 250;
        const opacity = (z2 + 100) / 200 + 0.3;
        pos.scale = Math.max(0.6, Math.min(1.1, scale));
        pos.opacity = Math.max(0.3, Math.min(1, opacity));

        // 直接更新 DOM 样式，绕过 React State 更新循环
        iconElement.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${pos.scale})`;
        iconElement.style.opacity = `${pos.opacity}`;
        iconElement.style.zIndex = `${Math.round(pos.z + 100)}`;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [initialized, isHovered]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    rotationRef.current = { x: -y * 0.05, y: x * 0.05 }; // 减小旋转系数，防止过快
  };

  if (!initialized) return <div className="min-h-[240px]" />;

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square flex items-center justify-center overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {positionsRef.current.map((pos, i) => (
        <div
          key={`${pos.fileName}-${i}`}
          ref={el => { iconsRef.current[i] = el; }}
          className="absolute will-change-transform pointer-events-none"
          style={{
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${pos.scale})`,
            opacity: pos.opacity,
            zIndex: Math.round(pos.z + 100),
          }}
        >
          <img 
            src={`/svg/${encodeURIComponent(pos.fileName)}`} 
            alt={pos.fileName}
            className="w-8 h-8 object-contain drop-shadow-sm"
            title={pos.fileName.replace('.svg', '')}
          />
        </div>
      ))}
    </div>
  );
}
