'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

/**
 * 管理后台登录页面组件
 * 采用日系动漫风格设计，星空云朵背景与梦幻氛围
 * @returns {JSX.Element} 登录页面界面
 */
export default function AdminLogin() {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error,
    handleLogin
  } = useLoginState();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      <LoginBackground />

      {/* 登录卡片容器 */}
      <div className="relative z-20 w-full max-w-[420px] mx-4">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[32px] p-10 md:p-12 shadow-[0_20px_60px_rgba(126,182,232,0.2)] animate-in fade-in zoom-in-95 duration-1000 relative overflow-hidden">
          {/* 顶部装饰渐变 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7EB6E8] via-[#FFB5C5] to-[#C9A8E0]" />
          
          {/* 装饰性背景 */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#7EB6E8]/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-[#FFB5C5]/20 to-transparent rounded-full blur-2xl" />
          
          <LoginHeader />
          
          <LoginForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            error={error}
            onSubmit={handleLogin}
          />
        </div>
        
        {/* 底部装饰文字 */}
        <p className="text-center text-[#9B9B9B]/60 text-xs mt-6 font-light tracking-wider">
          ✧ 日系动漫风格管理后台 ✧
        </p>
      </div>

      <GlobalStyles />
    </div>
  );
}

/**
 * 登录状态管理 Hook
 * @returns 登录相关的状态和处理函数
 */
function useLoginState() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  return {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error,
    handleLogin
  };
}

/**
 * 登录页背景组件 - 日系动漫星空云朵风格
 */
function LoginBackground() {
  return (
    <>
      {/* 渐变背景 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#E8F4FC] via-[#FFF5F8] to-[#F5F0FF]" />
      
      {/* 装饰性云朵 */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {/* 大云朵 */}
        <div className="absolute top-[10%] left-[5%] w-64 h-32 bg-white/60 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[20%] right-[10%] w-48 h-24 bg-white/50 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[30%] left-[15%] w-56 h-28 bg-white/40 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[15%] right-[5%] w-72 h-36 bg-white/50 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[50%] left-[40%] w-40 h-20 bg-white/30 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* 渐变光斑 */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#7EB6E8]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#FFB5C5]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#C9A8E0]/10 via-[#7EB6E8]/10 to-[#FFB5C5]/10 rounded-full blur-3xl" />
        
        {/* 星星装饰 */}
        <div className="absolute top-[15%] left-[20%] text-[#7EB6E8]/40 text-2xl animate-sparkle" style={{ animationDelay: '0s' }}>✦</div>
        <div className="absolute top-[25%] right-[25%] text-[#FFB5C5]/40 text-lg animate-sparkle" style={{ animationDelay: '0.5s' }}>✦</div>
        <div className="absolute top-[45%] left-[10%] text-[#C9A8E0]/40 text-xl animate-sparkle" style={{ animationDelay: '1s' }}>✦</div>
        <div className="absolute bottom-[35%] right-[15%] text-[#7EB6E8]/30 text-base animate-sparkle" style={{ animationDelay: '1.5s' }}>✦</div>
        <div className="absolute bottom-[20%] left-[30%] text-[#FFB5C5]/30 text-lg animate-sparkle" style={{ animationDelay: '0.3s' }}>✦</div>
        <div className="absolute top-[60%] right-[35%] text-[#C9A8E0]/30 text-sm animate-sparkle" style={{ animationDelay: '0.8s' }}>✦</div>
        <div className="absolute top-[35%] left-[45%] text-[#7EB6E8]/20 text-xs animate-sparkle" style={{ animationDelay: '1.2s' }}>✦</div>
        
        {/* 樱花装饰 */}
        <div className="absolute top-[10%] right-[30%] text-[#FFB5C5]/30 text-3xl animate-float" style={{ animationDelay: '0.2s' }}>✿</div>
        <div className="absolute bottom-[25%] left-[8%] text-[#FFB5C5]/20 text-2xl animate-float" style={{ animationDelay: '1.8s' }}>✿</div>
        <div className="absolute top-[55%] right-[8%] text-[#C9A8E0]/25 text-xl animate-float" style={{ animationDelay: '0.7s' }}>✿</div>
      </div>
    </>
  );
}

/**
 * 登录页标题组件
 */
function LoginHeader() {
  return (
    <div className="text-center mb-10 relative z-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7EB6E8] to-[#FFB5C5] mb-5 shadow-lg shadow-[#7EB6E8]/20">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-medium text-[#4A4A4A] tracking-widest mb-3">欢迎回来</h1>
      <p className="text-[#9B9B9B] text-sm font-light">登录您的管理后台</p>
    </div>
  );
}

/**
 * 登录表单组件属性接口
 */
interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * 登录表单组件
 */
function LoginForm({ 
  email, setEmail, 
  password, setPassword, 
  showPassword, setShowPassword, 
  loading, error, 
  onSubmit 
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 relative z-10">
      {error && (
        <div className="bg-[#FF9B9B]/10 backdrop-blur-md text-[#FF9B9B] p-4 rounded-2xl text-sm border border-[#FF9B9B]/20 flex items-center animate-in slide-in-from-top-2">
          <span className="mr-3 text-lg">⚠️</span> {error}
        </div>
      )}

      <div className="space-y-5">
        {/* 用户名/邮箱输入框 */}
        <div className="space-y-2 group">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B9B] group-focus-within:text-[#7EB6E8] transition-all duration-300">
              <User size={18} />
            </span>
            <input
              type="email"
              required
              placeholder="用户名"
              className="w-full h-12 bg-white/50 border border-[#E8E8E8] rounded-2xl pl-12 pr-5 text-[#4A4A4A] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#7EB6E8]/20 focus:border-[#7EB6E8] focus:bg-white transition-all duration-300 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* 密码输入框 */}
        <div className="space-y-2 group">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B9B] group-focus-within:text-[#7EB6E8] transition-all duration-300">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="密码"
              className="w-full h-12 bg-white/50 border border-[#E8E8E8] rounded-2xl pl-12 pr-12 text-[#4A4A4A] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#7EB6E8]/20 focus:border-[#7EB6E8] focus:bg-white transition-all duration-300 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#7EB6E8] transition-colors duration-300 p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* 登录按钮 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-[#7EB6E8] to-[#5A9BD5] text-white rounded-2xl font-medium text-sm hover:shadow-lg hover:shadow-[#7EB6E8]/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
      >
        {/* 悬浮光效 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {loading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <span className="relative z-10">确认登录</span>
        )}
      </button>
    </form>
  );
}

/**
 * 全局样式组件
 */
function GlobalStyles() {
  return (
    <style jsx global>{`
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
  );
}
