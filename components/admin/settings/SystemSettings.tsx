'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Shield, Lock, Save, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, Image as ImageIcon, Globe, UserCircle, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteStore } from '@/lib/store/useSiteStore';

/**
 * Toast 提示组件
 * 显示临时的操作结果提示
 * @param props - 包含 message, type, onClose 的属性对象
 * @returns JSX.Element
 */
const Toast = ({ 
  message, 
  type = 'info', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info' | 'warning'; 
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#00B42A]" />,
    error: <XCircle className="w-4 h-4 text-[#F53F3F]" />,
    warning: <AlertCircle className="w-4 h-4 text-[#FF7D00]" />,
    info: <AlertCircle className="w-4 h-4 text-[#165DFF]" />
  };

  const bgColors = {
    success: 'bg-[#EFFFF0] border-[#00B42A]/20',
    error: 'bg-[#FFF2F2] border-[#F53F3F]/20',
    warning: 'bg-[#FFF7E8] border-[#FF7D00]/20',
    info: 'bg-[#E8F3FF] border-[#165DFF]/20'
  };

  return (
    <div className={cn(
      "fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300",
      bgColors[type]
    )}>
      {icons[type]}
      <span className="text-sm font-medium text-[#1D2129]">{message}</span>
    </div>
  );
};

/**
 * 系统设置组件
 * 管理个人资料、账号安全、密码修改及系统偏好
 * @returns JSX.Element
 */
export default function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Password State
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [githubSaving, setGithubSaving] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [githubData, setGithubData] = useState({
    github_token: '',
    github_owner: '',
    github_repo: '',
    github_branch: 'main',
  });

  // 获取全局配置
  const config = useSiteStore((state) => state.config);
  const configPassword = config.admin_password;

  /**
   * 初始化 GitHub 配置
   */
  useEffect(() => {
    if (config) {
      setGithubData({
        github_token: config.github_token || '',
        github_owner: config.github_owner || '',
        github_repo: config.github_repo || '',
        github_branch: config.github_branch || 'main',
      });
    }
  }, [config]);

  /**
   * 实时同步数据库中的密码到旧密码字段
   * 确保任何密码变更都能立即反映在前端展示
   */
  useEffect(() => {
    if (configPassword && !passwordData.currentPassword) {
      setPasswordData(prev => ({
        ...prev,
        currentPassword: configPassword
      }));
    }
  }, [configPassword]);

  useEffect(() => {
    /**
     * 获取用户信息及实时密码配置
     */
    const fetchUserAndConfig = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (user) {
          setUser(user);

          // 1) 在页面加载时立即调用后端API获取当前用户的真实密码
          if (session) {
            try {
              const res = await fetch('/api/auth/password', {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
              });
              const result = await res.json();
              
              // 3) 添加数据校验逻辑，确保获取的密码数据完整性
              if (res.ok && result.password) {
                setPasswordData(prev => ({
                  ...prev,
                  currentPassword: result.password
                }));
              }
            } catch (apiError) {
              console.error('Failed to fetch password from API:', apiError);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user or password:', error);
        setToast({ message: '获取账户安全信息失败，请检查网络或数据库连接', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndConfig();
  }, []);

  /**
   * 处理 GitHub 配置变更
   * @param e - 输入框变更事件
   */
  const handleGithubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGithubData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * 保存 GitHub 配置到 site_config
   */
  const handleSaveGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setGithubSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(githubData),
      });

      if (res.ok) {
        setToast({ message: '图床配置已更新', type: 'success' });
        // 刷新全局 store 中的配置
        useSiteStore.getState().fetchConfig();
      } else {
        const json = await res.json();
        setToast({ message: '保存失败: ' + json.error, type: 'error' });
      }
    } catch (error) {
      console.error('Save github config error:', error);
      setToast({ message: '保存出错', type: 'error' });
    } finally {
      setGithubSaving(false);
    }
  };

  /**
   * 处理密码输入变更
   * @param e - 输入框变更事件
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * 保存新密码并同步到后端
   * @param e - 表单提交事件
   */
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!passwordData.currentPassword) errors.currentPassword = '当前密码不能为空';
    if (!passwordData.newPassword) errors.newPassword = '新密码不能为空';
    if (passwordData.newPassword.length < 6) errors.newPassword = '新密码至少需要6位';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = '两次输入的密码不一致';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setToast({ message: '登录已过期，请重新登录', type: 'error' });
        return;
      }

      // 使用后端 API 进行密码更新和实时同步
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === '当前密码错误') {
          setPasswordErrors({ currentPassword: '当前密码错误' });
        } else {
          throw new Error(result.error || '密码修改失败');
        }
        return;
      }

      setToast({ message: '密码修改成功', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // 注意：由于建立了实时同步机制，configPassword 会通过 useSiteStore 自动更新，
      // 触发 useEffect 从而更新旧密码显示。
    } catch (error: any) {
      console.error('Password save error:', error);
      setToast({ message: '修改失败: ' + error.message, type: 'error' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[#165DFF]/20 border-t-[#165DFF] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#165DFF] rounded-full animate-pulse" />
        </div>
      </div>
      <span className="text-sm font-medium text-[#86909C] animate-pulse">正在加载账户信息...</span>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* Toast 提示 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* 顶部标题 */}
      <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">系统设置</h1>
          <p className="text-[#86909C] mt-1 text-sm">管理您的个人资料、账号安全及系统偏好</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        {/* 图床设置卡片 */}
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
          <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
            <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
                图床设置 (GitHub)
              </div>
              <ImageIcon className="h-4 w-4 text-[#165DFF] opacity-50" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveGithub} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969]">GitHub Token</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="github_token"
                      type={showGithubToken ? "text" : "password"}
                      value={githubData.github_token}
                      onChange={handleGithubChange}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="h-11 pl-10 pr-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGithubToken(!showGithubToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86909C] hover:text-[#165DFF] transition-colors p-1"
                    >
                      {showGithubToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#86909C]">用于上传图片的 GitHub Personal Access Token</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969]">仓库所有者 (Owner)</Label>
                  <div className="relative group">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="github_owner"
                      value={githubData.github_owner}
                      onChange={handleGithubChange}
                      placeholder="GitHub 用户名或组织名"
                      className="h-11 pl-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969]">仓库名称 (Repo)</Label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="github_repo"
                      value={githubData.github_repo}
                      onChange={handleGithubChange}
                      placeholder="存储图片的仓库名"
                      className="h-11 pl-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969]">分支 (Branch)</Label>
                  <div className="relative group">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="github_branch"
                      value={githubData.github_branch}
                      onChange={handleGithubChange}
                      placeholder="main"
                      className="h-11 pl-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={githubSaving}
                  className="h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(64,169,255,0.2)] flex items-center gap-2 px-6"
                >
                  {githubSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {githubSaving ? '正在保存...' : '保存图床配置'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 账号安全卡片 */}
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
          <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
            <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
                账号安全
              </div>
              <Shield className="h-4 w-4 text-[#165DFF] opacity-50" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969]">管理员账号</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86909C]" size={16} />
                    <Input
                      value={user?.email || ''}
                      readOnly
                      className="bg-[#F7F8FA] border-[#E5E6EB] h-11 pl-10 rounded-xl text-[#86909C] cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-[#86909C]">账号邮箱不可直接修改，请在个人资料中更新</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    <span className="text-[#F53F3F]">*</span> 旧密码
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      className={cn(
                        "h-11 pl-10 pr-12 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30",
                        passwordErrors.currentPassword && "border-[#F53F3F] focus:ring-[#F53F3F]/20"
                      )}
                      placeholder="请输入当前密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86909C] hover:text-[#165DFF] transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-[12px] text-[#F53F3F] mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#F53F3F] rounded-full" />
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    <span className="text-[#F53F3F]">*</span> 新密码
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      className={cn(
                        "h-11 pl-10 pr-12 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30",
                        passwordErrors.newPassword && "border-[#F53F3F] focus:ring-[#F53F3F]/20"
                      )}
                      placeholder="6 位以上新密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86909C] hover:text-[#165DFF] transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-[12px] text-[#F53F3F] mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#F53F3F] rounded-full" />
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    <span className="text-[#F53F3F]">*</span> 确认新密码
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="confirmPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      className={cn(
                        "h-11 pl-10 pr-12 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30",
                        passwordErrors.confirmPassword && "border-[#F53F3F] focus:ring-[#F53F3F]/20"
                      )}
                      placeholder="请再次输入新密码"
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-[12px] text-[#F53F3F] mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#F53F3F] rounded-full" />
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={passwordSaving}
                  className="h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(64,169,255,0.2)] flex items-center gap-2 px-6"
                >
                  {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield size={18} />}
                  {passwordSaving ? '正在修改...' : '确认修改密码'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
