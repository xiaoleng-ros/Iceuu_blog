'use client';

import { useSystemSettingsLogic } from './system/useSystemSettingsLogic';
import { GithubSection } from './system/GithubSection';
import { AccountSecuritySection } from './system/AccountSecuritySection';
import { Toast } from './system/Toast';

/**
 * 系统设置组件
 * 管理个人资料、账号安全、密码修改及系统偏好
 * 已重构：逻辑拆分至 system/ 目录下，解决行数过多和复杂度问题
 * 
 * @returns {JSX.Element} - 返回系统设置页面 JSX
 */
export default function SystemSettings() {
  const {
    loading,
    toast,
    setToast,
    ...logic
  } = useSystemSettingsLogic();
  
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
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">系统设置</h1>
          <p className="text-[#86909C] mt-1 text-sm">管理您的个人资料、账号安全及系统偏好</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <GithubSection 
          githubData={logic.githubData}
          githubSaving={logic.githubSaving}
          showGithubToken={logic.showGithubToken}
          setShowGithubToken={logic.setShowGithubToken}
          handleGithubChange={logic.handleGithubChange}
          handleSaveGithub={logic.handleSaveGithub}
        />
        <AccountSecuritySection 
          user={logic.user}
          passwordData={logic.passwordData}
          passwordSaving={logic.passwordSaving}
          showCurrentPassword={logic.showCurrentPassword}
          showNewPassword={logic.showNewPassword}
          passwordErrors={logic.passwordErrors}
          setShowCurrentPassword={logic.setShowCurrentPassword}
          setShowNewPassword={logic.setShowNewPassword}
          handlePasswordChange={logic.handlePasswordChange}
          handleSavePassword={logic.handleSavePassword}
        />
      </div>
    </div>
  );
}
