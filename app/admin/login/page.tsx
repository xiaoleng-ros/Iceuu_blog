'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';

/**
 * 管理后台登录页面组件
 * 采用毛玻璃设计风格，包含背景图和动画效果
 * @returns {JSX.Element} 登录页面界面
 */
export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * 处理登录表单提交逻辑
   * @param {React.FormEvent} e - 表单提交事件对象
   * @returns {Promise<void>} 无返回值
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('登录失败: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* 动态背景层 */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-[20s] ease-linear animate-slow-zoom"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      {/* 遮罩层，增加深邃感 */}
      <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px]" />

      {/* 登录卡片容器 */}
      <div className="relative z-20 w-full max-w-[420px] mx-4">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-1000">
          
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white tracking-[8px] mb-4">登录</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto rounded-full" />
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-red-500/20 backdrop-blur-md text-red-100 p-4 rounded-xl text-sm border border-red-500/30 flex items-center animate-in slide-in-from-top-2">
                <span className="mr-3 text-lg">⚠️</span> {error}
              </div>
            )}

            <div className="space-y-6">
              {/* 用户名/邮箱输入框 */}
              <div className="space-y-2 group">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-all duration-300">
                    <User size={20} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="用户名"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-full pl-14 pr-6 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/15 transition-all duration-300 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* 密码输入框 */}
              <div className="space-y-2 group">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-all duration-300">
                    <Lock size={20} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="密码"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-full pl-14 pr-14 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/15 transition-all duration-300 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors duration-300 p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  <span>确认登录</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

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
    </div>
  );
}
