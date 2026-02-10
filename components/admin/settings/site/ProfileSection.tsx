'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserCircle, Mail, Upload, Loader2, FileText, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileSectionProps } from './types';

/**
 * 头像上传组件
 */
function AvatarUpload({
  url,
  uploading,
  onUpload,
  fileInputRef
}: {
  url: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="md:col-span-2 space-y-2">
      <Label className="text-sm font-bold text-[#4E5969]">头像</Label>
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden border border-[#E5E6EB]">
            {url ? (
              <div className="w-full h-full relative">
                <Image 
                  src={url} 
                  alt="Avatar" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <UserCircle className="w-full h-full text-[#C9CDD4]" />
            )}
          </div>
          <Input
            name="avatarUrl"
            value={url}
            readOnly
            placeholder="https://example.com/avatar.png"
            className="h-11 pl-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onUpload}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-11 px-4 border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] rounded-xl flex-shrink-0 transition-all active:scale-95"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={18} />}
        </Button>
      </div>
      <p className="text-[11px] text-[#86909C]">支持 JPG、PNG、GIF 格式，大小不超过 2MB</p>
    </div>
  );
}

/**
 * 个人资料设置部分
 * 
 * @param {ProfileSectionProps} props - 组件属性
 * @returns {JSX.Element} - 返回个人资料设置组件 JSX
 */
export function ProfileSection({ 
  profileData, 
  profileErrors, 
  profileSaving, 
  uploadingAvatar, 
  handleProfileChange, 
  handleAvatarUpload, 
  handleSaveProfile, 
  profileFileInputRef 
}: ProfileSectionProps) {
  return (
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

            <AvatarUpload 
              url={profileData.avatarUrl}
              uploading={uploadingAvatar}
              onUpload={handleAvatarUpload}
              fileInputRef={profileFileInputRef}
            />

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="site_start_date_input" className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                建站日期
                <span className="text-[10px] font-normal text-[#86909C]">(用于计算站点运行时间)</span>
              </Label>
              <Input
                id="site_start_date_input"
                name="site_start_date"
                type="date"
                value={profileData.site_start_date}
                onChange={handleProfileChange}
                className="h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
              />
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
  );
}
