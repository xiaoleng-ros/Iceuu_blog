'use client';

import { Shield, Lock, Eye, EyeOff, Mail, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { AccountSecuritySectionProps } from './types';

/**
 * 账号安全设置组件
 * 处理管理员密码修改和账号信息展示
 * 
 * @param {AccountSecuritySectionProps} props - 组件属性
 * @param {User | null} props.user - 当前登录用户信息
 * @param {PasswordData} props.passwordData - 密码表单数据
 * @param {boolean} props.passwordSaving - 是否正在保存密码
 * @param {boolean} props.showCurrentPassword - 是否显示当前密码
 * @param {boolean} props.showNewPassword - 是否显示新密码
 * @param {Record<string, string>} props.passwordErrors - 密码验证错误信息
 * @param {Function} props.setShowCurrentPassword - 设置是否显示当前密码
 * @param {Function} props.setShowNewPassword - 设置是否显示新密码
 * @param {Function} props.handlePasswordChange - 处理密码输入变更
 * @param {Function} props.handleSavePassword - 处理保存密码表单提交
 * @returns {JSX.Element} - 返回账号安全设置组件 JSX
 */
export function AccountSecuritySection({
  user,
  passwordData,
  passwordSaving,
  showCurrentPassword,
  showNewPassword,
  passwordErrors,
  setShowCurrentPassword,
  setShowNewPassword,
  handlePasswordChange,
  handleSavePassword
}: AccountSecuritySectionProps) {
  return (
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
                  placeholder="请输入新密码"
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
              className="h-10 bg-[#165DFF] hover:bg-[#0E42D2] text-white font-medium rounded-xl transition-all shadow-[0_4px_12px_rgba(22,93,255,0.2)] flex items-center gap-2 px-6"
            >
              {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {passwordSaving ? '正在修改...' : '修改登录密码'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
