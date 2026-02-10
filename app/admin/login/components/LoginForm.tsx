'use client';

import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FormEvent } from 'react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: FormEvent) => void;
}

/**
 * 登录表单组件
 * @param props - 组件属性
 * @returns 渲染的登录表单
 */
export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  error,
  onSubmit
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
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
          <span>确认登录</span>
        )}
      </button>
    </form>
  );
}
