'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Loader2, Shield, Upload, Lock, Save, Mail, FileText, UserCircle, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteStore } from '@/lib/store/useSiteStore';

/**
 * Toast 提示组件
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

export default function SystemSettings() {
  const storeUser = useSiteStore((state) => state.user);
  const updateUserInStore = useSiteStore((state) => state.updateUser);
  const fetchUserInStore = useSiteStore((state) => state.fetchUser);
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Profile State
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    avatarUrl: '',
  });

  // 使用 Store 中的用户信息初始化表单
  useEffect(() => {
    if (storeUser) {
      setProfileData({
        fullName: storeUser.fullName || '',
        email: storeUser.email || '',
        bio: '', // Bio 还是需要从 auth 获取，或者我们可以把 bio 也加到 store
        avatarUrl: storeUser.avatarUrl || '',
      });
    }
  }, [storeUser]);

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setProfileData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          bio: user.user_metadata?.bio || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  /**
   * 处理个人资料字段变更
   * @param e 事件对象
   */
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * 处理头像上传
   * @param e 事件对象
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证大小 (例如 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: '图片大小不能超过 2MB', type: 'error' });
      return;
    }

    try {
      setUploadingAvatar(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (res.ok) {
        setProfileData(prev => ({ ...prev, avatarUrl: json.data.url }));
        setToast({ message: '头像上传成功', type: 'success' });
      } else {
        setToast({ message: '上传失败: ' + json.error, type: 'error' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToast({ message: '上传出错', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  /**
   * 保存个人资料
   * @param e 事件对象
   */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
    const errors: Record<string, string> = {};
    if (!profileData.fullName.trim()) errors.fullName = '名称不能为空';
    if (!profileData.email.trim()) errors.email = '邮箱不能为空';
    if (!profileData.bio.trim()) errors.bio = '介绍不能为空';
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: profileData.email !== user.email ? profileData.email : undefined,
        data: {
          full_name: profileData.fullName,
          bio: profileData.bio,
          avatar_url: profileData.avatarUrl,
        },
      });

      if (error) throw error;

      // 同步更新 site_config 表，以便前端实时同步
      const configUpdates = [
        { key: 'site_name', value: profileData.fullName },
        { key: 'avatar_url', value: profileData.avatarUrl },
        { key: 'intro', value: profileData.bio }
      ];

      for (const item of configUpdates) {
        await supabase
          .from('site_config')
          .upsert({ key: item.key, value: item.value }, { onConflict: 'key' });
      }

      // 强制刷新本地缓存
      await supabase.auth.refreshSession();
      
      // 更新全局 Store
      updateUserInStore({
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
        email: profileData.email,
      });
      
      // 更新本地用户状态
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }

      setToast({ 
        message: profileData.email !== user.email ? '个人信息已保存，请查收新邮箱确认邮件。' : '个人信息已成功保存', 
        type: 'success' 
      });
    } catch (error: any) {
      console.error('Profile save error:', error);
      setToast({ message: '保存失败: ' + error.message, type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  /**
   * 处理密码字段变更
   * @param e 事件对象
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
   * 保存新密码
   * @param e 事件对象
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ currentPassword: '当前密码错误' });
        setPasswordSaving(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      setToast({ message: '密码修改成功', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
        {/* 个人资料卡片 */}
        <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
          <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
            <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
                个人资料
              </div>
              <UserCircle className="h-4 w-4 text-[#165DFF] opacity-50" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    <span className="text-[#F53F3F]">*</span> 名称
                  </Label>
                  <Input
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    placeholder="请输入显示名称"
                    className={cn(
                      "h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30",
                      profileErrors.fullName && "border-[#F53F3F] focus:ring-[#F53F3F]/20"
                    )}
                  />
                  {profileErrors.fullName && (
                    <p className="text-[12px] text-[#F53F3F] mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#F53F3F] rounded-full" />
                      {profileErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    <span className="text-[#F53F3F]">*</span> 邮箱
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <Input
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="example@email.com"
                      className={cn(
                        "h-11 pl-10 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30",
                        profileErrors.email && "border-[#F53F3F] focus:ring-[#F53F3F]/20"
                      )}
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-[12px] text-[#F53F3F] mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#F53F3F] rounded-full" />
                      {profileErrors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    <span className="text-[#F53F3F]">*</span> 头像
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden border border-[#E5E6EB]">
                        {profileData.avatarUrl ? (
                          <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-full h-full text-[#C9CDD4]" />
                        )}
                      </div>
                      <Input
                        name="avatarUrl"
                        value={profileData.avatarUrl}
                        onChange={handleProfileChange}
                        placeholder="https://example.com/avatar.png"
                        className="h-11 pl-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                      />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="h-11 px-4 border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] rounded-xl flex-shrink-0 transition-all active:scale-95"
                    >
                      {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={18} />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#86909C]">支持 JPG、PNG、GIF 格式，大小不超过 2MB</p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    <span className="text-[#F53F3F]">*</span> 个人介绍
                  </Label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-3 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      rows={4}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 border border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all outline-none text-[#1D2129] text-sm resize-none bg-[#F9FBFF]/30",
                        profileErrors.bio && "border-[#F53F3F] focus:ring-[#F53F3F]/20"
                      )}
                      placeholder="写点什么介绍一下自己吧..."
                    />
                  </div>
                  {profileErrors.bio && (
                    <p className="text-[12px] text-[#F53F3F] mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#F53F3F] rounded-full" />
                      {profileErrors.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={profileSaving}
                  className="h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(64,169,255,0.2)] flex items-center gap-2 px-6"
                >
                  {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {profileSaving ? '正在保存...' : '保存个人资料'}
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
