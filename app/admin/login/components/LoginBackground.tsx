'use client';

/**
 * 登录页面背景组件
 * @returns 渲染的动态背景
 */
export function LoginBackground() {
  return (
    <>
      {/* 动态背景层 */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-[20s] ease-linear animate-slow-zoom"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      {/* 遮罩层，增加深邃感 */}
      <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px]" />
      
      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s infinite alternate linear;
        }
        /* 隐藏浏览器默认的密码查看按钮 */
        input::-ms-reveal,
        input::-ms-clear,
        input::-o-clear {
          display: none;
          width: 0;
          height: 0;
        }
        input::-webkit-contacts-auto-fill-button,
        input::-webkit-credentials-auto-fill-button,
        input::-webkit-password-reveal-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
