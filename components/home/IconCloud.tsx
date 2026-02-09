'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

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
 * 实现了基于黄金分割螺旋算法的球面分布，以及基于鼠标交互的 3D 旋转效果
 * @param {IconCloudProps} props - 组件属性
 * @returns {JSX.Element} - 返回图标云组件 JSX
 */
export default function IconCloud({ icons }: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    iconsRef, 
    positionsRef, 
    setIsHovered, 
    initialized, 
    handleMouseMove 
  } = useIconCloud(icons, containerRef);

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
        <CloudIcon 
          key={`${pos.fileName}-${i}`}
          pos={pos}
          iconRef={(el) => { iconsRef.current[i] = el; }}
        />
      ))}
    </div>
  );
}

/**
 * 图标云项组件
 * @param {Object} props - 组件属性
 * @param {IconPosition} props.pos - 位置数据
 * @param {React.RefCallback<HTMLDivElement>} props.iconRef - DOM 引用回调
 * @returns {JSX.Element}
 */
function CloudIcon({ pos, iconRef }: { pos: IconPosition; iconRef: React.RefCallback<HTMLDivElement> }) {
  return (
    <div
      ref={iconRef}
      className="absolute will-change-transform pointer-events-none"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${pos.scale})`,
        opacity: pos.opacity,
        zIndex: Math.round(pos.z + 100),
      }}
    >
      <Image 
        src={`/svg/${encodeURIComponent(pos.fileName)}`} 
        alt={pos.fileName}
        width={32}
        height={32}
        className="object-contain drop-shadow-sm"
        title={pos.fileName.replace('.svg', '')}
      />
    </div>
  );
}

/**
 * 图标云动画逻辑 Hook
 * @param {string[]} icons - 图标列表
 * @param {React.RefObject<HTMLDivElement>} containerRef - 容器引用
 * @returns {Object} 动画相关的状态和方法
 */
function useIconCloud(icons: string[], containerRef: React.RefObject<HTMLDivElement | null>) {
  const iconsRef = useRef<(HTMLDivElement | null)[]>([]);
  const positionsRef = useRef<IconPosition[]>([]);
  const rotationRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!icons.length) return;
    const count = icons.length;
    const initialPositions: IconPosition[] = icons.map((icon, i) => {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      return {
        x: Math.cos(theta) * Math.sin(phi) * 100,
        y: Math.sin(theta) * Math.sin(phi) * 100,
        z: Math.cos(phi) * 100,
        scale: 1, opacity: 1, fileName: icon,
      };
    });
    positionsRef.current = initialPositions;
    setInitialized(true);
  }, [icons]);

  useEffect(() => {
    if (!initialized || !positionsRef.current.length) return;
    let animationFrame: number;
    const animate = () => {
      let dx = 0.005;
      let dy = 0.005;
      if (isHovered) {
        dx = rotationRef.current.x;
        dy = rotationRef.current.y;
        rotationRef.current.x *= 0.95;
        rotationRef.current.y *= 0.95;
      }
      const cosX = Math.cos(dx), sinX = Math.sin(dx);
      const cosY = Math.cos(dy), sinY = Math.sin(dy);

      positionsRef.current.forEach((pos, i) => {
        const iconElement = iconsRef.current[i];
        if (!iconElement) return;
        const y1 = pos.y * cosX - pos.z * sinX;
        const z1 = pos.y * sinX + pos.z * cosX;
        const x2 = pos.x * cosY + z1 * sinY;
        const z2 = -pos.x * sinY + z1 * cosY;
        pos.x = x2; pos.y = y1; pos.z = z2;
        const scale = (z2 + 150) / 250;
        const opacity = (z2 + 100) / 200 + 0.3;
        pos.scale = Math.max(0.6, Math.min(1.1, scale));
        pos.opacity = Math.max(0.3, Math.min(1, opacity));
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
    rotationRef.current = { x: -y * 0.05, y: x * 0.05 };
  };

  return { iconsRef, positionsRef, isHovered, setIsHovered, initialized, handleMouseMove };
}
