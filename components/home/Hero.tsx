'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSiteConfig } from '@/lib/hooks/useSiteConfig';

import { Tag, Calendar } from 'lucide-react';

interface PostMetadata {
  title: string;
  category?: string;
  createdAt: string;
}

interface HeroProps {
  /**
   * 首页背景图 URL
   */
  backgroundImage?: string;
  /**
   * 居中展示的文字内容
   */
  centerText?: string;
  /**
   * 文章元数据（详情页使用）
   */
  postMetadata?: PostMetadata;
}

/**
 * 首页 Hero 组件
 * 展示背景图、打字机动画文字或文章元数据
 * @param {HeroProps} props - 组件属性
 * @param {string} [props.backgroundImage] - 背景图 URL
 * @param {string} [props.centerText] - 居中展示的文字内容
 * @param {PostMetadata} [props.postMetadata] - 文章元数据（详情页使用）
 * @returns {JSX.Element}
 */
export default function Hero({ backgroundImage: initialBg, centerText, postMetadata }: HeroProps) {
  // 使用 useMemo 稳定 initialConfig 对象，防止 useSiteConfig 内部的 useEffect 频繁触发
  const initialConfig = useMemo(() => ({ home_background_url: initialBg }), [initialBg]);
  const config = useSiteConfig(initialConfig);
  const backgroundImage = config.home_background_url;
  
  const [imgLoaded, setImgLoaded] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const fullText = "console.log('欲买桂花同载酒，终不似，少年游')";
  
  const defaultBg = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

  // 打字机效果
  useEffect(() => {
    let index = 0;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    /**
     * 执行打字机动画逻辑
     * 实现文字逐个显示，完成后停留并循环
     * @returns {void}
     */
    const startTyping = () => {
      if (!isMounted) return;

      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
        timeoutId = setTimeout(startTyping, 100);
      } else {
        // 打字完成后停留 1 秒，然后重置重新开始
        timeoutId = setTimeout(() => {
          if (!isMounted) return;
          index = 0;
          startTyping();
        }, 1000);
      }
    };

    startTyping();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fullText]); // 保持依赖项数组大小恒定

  const bgUrl = backgroundImage || defaultBg;

  useEffect(() => {
    if (bgUrl) {
      setImgLoaded(false); // 重置加载状态，当 URL 改变时
      const img = new Image();
      img.src = bgUrl;
      img.onload = () => setImgLoaded(true);
      img.onerror = () => {
        console.error("Failed to load background image:", bgUrl);
        setImgLoaded(true); 
      };
    }
  }, [bgUrl]);

  return (
    <section className="relative h-[480px] w-full overflow-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transition-opacity duration-1000 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url("${bgUrl}")`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90" />
      </div>

      {/* Loading Placeholder */}
      {!imgLoaded && (
        <div className="absolute inset-0 bg-slate-900 z-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pb-10">
        <div className="mb-8 relative group cursor-default w-full max-w-5xl">
          {postMetadata ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {/* 文章标题 */}
              <h1 className="text-3xl md:text-5xl font-bold !text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight font-mono antialiased italic">
                {postMetadata.title}
              </h1>
              
              {/* 文章元数据展示行 */}
              <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-6 md:gap-x-10 !text-white font-mono antialiased italic drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]">
                {/* 分类 */}
                {postMetadata.category && (
                  <div className="flex items-center gap-2 group/meta">
                    <div className="p-1.5 bg-purple-500 rounded-full shadow-lg shadow-purple-500/30">
                      <Tag className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm md:text-base font-medium">所属分类：{postMetadata.category}</span>
                  </div>
                )}

                {/* 发布时间 */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm md:text-base font-medium">发布时间：{postMetadata.createdAt}</span>
                </div>
              </div>
            </div>
          ) : centerText ? (
            <h1 
              className="text-xl md:text-3xl font-bold tracking-[0.2em] px-4 py-2 flex items-center justify-center min-h-[80px] font-mono antialiased italic !text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              {centerText}
            </h1>
          ) : (
            <h1 
              className="relative text-xl md:text-3xl font-bold tracking-[0.1em] font-mono min-h-[80px] flex items-center justify-center antialiased italic"
            >
              <span className="text-blue-400">{displayText.startsWith('console') ? 'console' : displayText.slice(0, 7)}</span>
              {displayText.length > 7 && <span className="text-white">.</span>}
              <span className="text-yellow-400">
                {displayText.length > 8 ? (displayText.startsWith('console.log') ? 'log' : displayText.slice(8, 11)) : ''}
              </span>
              {displayText.length > 11 && <span className="text-purple-400">(</span>}
              <span className="text-green-400">
                {displayText.length > 12 ? (displayText.endsWith(')') ? displayText.slice(12, -1) : displayText.slice(12)) : ''}
              </span>
              {displayText.endsWith(')') && <span className="text-purple-400">)</span>}
              <span className="inline-block w-1 h-6 md:h-8 bg-blue-500 ml-1 animate-pulse" />
            </h1>
          )}
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg 
          className="relative block w-[calc(130%+1.3px)] h-[40px] md:h-[60px]" 
          backface-visibility="hidden"
          viewBox="0 24 150 28" 
          preserveAspectRatio="none" 
          shapeRendering="auto"
        >
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" className="animate-wave-slow" />
            <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" className="animate-wave-medium" />
            <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" className="animate-wave-fast" />
            <use href="#gentle-wave" x="48" y="7" fill="#f9fafb" />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .parallax > use {
          animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .animate-wave-slow {
          animation-delay: -2s !important;
          animation-duration: 7s !important;
        }
        .animate-wave-medium {
          animation-delay: -3s !important;
          animation-duration: 10s !important;
        }
        .animate-wave-fast {
          animation-delay: -4s !important;
          animation-duration: 13s !important;
        }
        @keyframes move-forever {
          0% {
            transform: translate3d(-90px,0,0);
          }
          100% {
            transform: translate3d(85px,0,0);
          }
        }
        /* 移动端适配：减小波浪高度 */
        @media (max-width: 768px) {
          .parallax > use {
            animation-duration: 10s;
          }
        }
      `}</style>
    </section>
  );
}
