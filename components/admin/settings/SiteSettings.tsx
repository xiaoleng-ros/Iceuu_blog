'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Save, Loader2, CheckCircle2, XCircle, AlertCircle, FileText, Upload, Link as LinkIcon, Image as ImageIcon, Trash2, UserCircle, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteStore } from '@/lib/store/useSiteStore';

/**
 * Toast 提示组件
 * 显示临时的操作结果提示
 * @param {Object} props - 组件属性
 * @param {string} props.message - 提示消息内容
 * @param {'success' | 'error' | 'info' | 'warning'} [props.type] - 提示类型
 * @param {() => void} props.onClose - 关闭回调函数
 * @returns {JSX.Element} - 返回提示组件 JSX
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
 * 首页背景设置部分
 */
function BackgroundSection({
  formData,
  uploading,
  handleRemoveBackground,
  handleFileUpload,
  handleChange,
  fileInputRef
}: {
  formData: { home_background_url: string };
  uploading: boolean;
  handleRemoveBackground: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
      <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
            首页背景设置
          </div>
          <ImageIcon className="h-4 w-4 text-[#165DFF] opacity-50" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* 预览图与上传 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-[#4E5969]">背景图预览</Label>
            <span className="text-[11px] text-[#86909C]">支持 JPG, PNG, GIF, 不超过 5MB</span>
          </div>
          
          <div 
            className={`relative aspect-video rounded-xl overflow-hidden bg-[#F9FBFF] border-2 border-dashed transition-all duration-300 group ${
              uploading ? 'border-[#165DFF] bg-[#165DFF]/5' : 'border-[#F2F3F5] hover:border-[#165DFF]/30 hover:bg-[#F9FBFF]/80'
            }`}
          >
            {formData.home_background_url ? (
              <>
                <Image 
                  src={formData.home_background_url} 
                  alt="Background Preview" 
                  fill
                  className={`object-cover transition-all duration-500 ${uploading ? 'opacity-30 blur-sm' : 'group-hover:scale-105'}`}
                  unoptimized
                />
                
                {/* 悬浮操作层 */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-3 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="h-8 w-8 animate-spin text-[#165DFF]" />
                      <span className="text-sm font-medium">正在上传...</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg h-9 px-4"
                        onClick={() => window.open(formData.home_background_url, '_blank')}
                      >
                        查看原图
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white text-[#1D2129] border-none hover:bg-gray-100 rounded-lg h-9 px-4 flex items-center gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        更换图片
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-red-500/90 border-none text-white hover:bg-red-600 rounded-lg h-9 px-4 flex items-center gap-2"
                        onClick={handleRemoveBackground}
                      >
                        <Trash2 className="h-4 w-4" />
                        移除
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-[#165DFF]" />
                    <span className="text-sm font-medium text-[#165DFF]">正在上传并应用...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#F2F3F5] flex items-center justify-center mb-3 group-hover:bg-[#165DFF]/10 transition-colors">
                      <Upload className="h-8 w-8 text-[#86909C] group-hover:text-[#165DFF] transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-[#4E5969]">点击上传本地图片</span>
                    <span className="text-xs text-[#86909C] mt-1 text-center px-6">未设置背景图，将使用系统默认图</span>
                  </>
                )}
              </div>
            )}
            
            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>

        {/* 外部链接 */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="home_background_url" className="text-sm font-bold text-[#4E5969]">或者使用外部链接</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 flex items-center justify-center transition-colors">
                <LinkIcon className="h-4 w-4 text-[#4E5969] group-focus-within:text-[#165DFF] transition-colors" />
              </div>
              <Input
                id="home_background_url"
                name="home_background_url"
                value={formData.home_background_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
              />
            </div>
            <p className="text-[11px] text-[#86909C]">仅支持白名单域名 (Unsplash, GitHub, CDN 等)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 个人资料设置部分
 */
function ProfileSection({ 
  profileData, 
  profileErrors, 
  profileSaving, 
  uploadingAvatar, 
  handleProfileChange, 
  handleAvatarUpload, 
  handleSaveProfile, 
  profileFileInputRef 
}: {
  profileData: {
    fullName: string;
    email: string;
    bio: string;
    avatarUrl: string;
    site_start_date: string;
  };
  profileErrors: Record<string, string>;
  profileSaving: boolean;
  uploadingAvatar: boolean;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  profileFileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
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

            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-bold text-[#4E5969]">头像</Label>
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden border border-[#E5E6EB]">
                    {profileData.avatarUrl ? (
                    <div className="w-full h-full relative">
                      <Image 
                        src={profileData.avatarUrl} 
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
                    value={profileData.avatarUrl}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/avatar.png"
                    className="h-11 pl-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                  />
                </div>
                <input
                  type="file"
                  ref={profileFileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profileFileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="h-11 px-4 border-[#E5E6EB] text-[#4E5969] hover:bg-[#F2F3F5] rounded-xl flex-shrink-0 transition-all active:scale-95"
                >
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={18} />}
                </Button>
              </div>
              <p className="text-[11px] text-[#86909C]">支持 JPG、PNG、GIF 格式，大小不超过 2MB</p>
            </div>

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

/**
 * 社交链接设置部分
 */
function SocialLinksSection({
  formData,
  handleChange
}: {
  formData: {
    github_url: string;
    gitee_url: string;
    wechat_url: string;
    qq_url: string;
    douyin_url: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
      <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
            社交媒体
          </div>
          <div className="flex -space-x-1.5 overflow-hidden">
            <Image src="/svg/github.svg" width={14} height={14} className="opacity-50" alt="" />
            <Image src="/svg/gitee.svg" width={14} height={14} className="opacity-50" alt="" />
            <Image src="/svg/weixin.svg" width={14} height={14} className="opacity-50" alt="" />
            <Image src="/svg/QQ.svg" width={14} height={14} className="opacity-50" alt="" />
            <Image src="/svg/抖音.svg" width={14} height={14} className="opacity-50" alt="" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="github_url" className="text-sm font-bold text-[#4E5969]">GitHub</Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
              <Image src="/svg/github.svg" alt="GitHub" width={16} height={16} className="opacity-70 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <Input
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
             />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gitee_url" className="text-sm font-bold text-[#4E5969]">Gitee</Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
              <Image src="/svg/gitee.svg" alt="Gitee" width={16} height={16} className="opacity-70 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <Input
              id="gitee_url"
              name="gitee_url"
              value={formData.gitee_url}
              onChange={handleChange}
              placeholder="https://gitee.com/username"
              className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wechat_url" className="text-sm font-bold text-[#4E5969]">微信</Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
              <Image src="/svg/weixin.svg" alt="微信" width={16} height={16} className="opacity-70 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <Input
              id="wechat_url"
              name="wechat_url"
              value={formData.wechat_url}
              onChange={handleChange}
              placeholder="微信联系方式或主页链接"
              className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qq_url" className="text-sm font-bold text-[#4E5969]">QQ</Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
              <Image src="/svg/QQ.svg" alt="QQ" width={16} height={16} className="opacity-70 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <Input
              id="qq_url"
              name="qq_url"
              value={formData.qq_url}
              onChange={handleChange}
              placeholder="QQ 联系方式链接"
              className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="douyin_url" className="text-sm font-bold text-[#4E5969]">抖音</Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
              <Image src="/svg/抖音.svg" alt="抖音" width={16} height={16} className="opacity-70 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <Input
              id="douyin_url"
              name="douyin_url"
              value={formData.douyin_url}
              onChange={handleChange}
              placeholder="抖音个人主页链接"
              className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 页脚设置部分
 */
function FooterSettingsSection({
  formData,
  handleChange
}: {
  formData: { footer_text: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
      <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
            页脚与版权
          </div>
          <FileText className="h-4 w-4 text-[#165DFF] opacity-50" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-2">
          <Label htmlFor="footer_text" className="text-sm font-bold text-[#4E5969]">页脚文字</Label>
          <Input
            id="footer_text"
            name="footer_text"
            value={formData.footer_text}
            onChange={handleChange}
            placeholder="© 2024 My Blog. All rights reserved."
            className="h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
          />
          <p className="text-[11px] text-[#86909C] mt-1">显示在网站底部的版权信息或备案号</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 页面头部操作栏
 */
function SiteHeader({
  saving,
  handleSubmit
}: {
  saving: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">站点设置</h1>
        <p className="text-[#86909C] mt-1 text-sm">管理您的博客站点信息、SEO 及社交链接</p>
      </div>
      <Button 
        type="button" 
        onClick={handleSubmit}
        disabled={saving} 
        className="w-full sm:w-auto h-10 bg-[#40A9FF] hover:bg-[#1890FF] text-white font-medium rounded-xl shadow-[0_4px_12px_rgba(64,169,255,0.2)] transition-all flex items-center justify-center gap-2 px-6"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="text-sm">{saving ? '正在保存...' : '保存全局配置'}</span>
      </Button>
    </div>
  );
}

/**
 * 站点设置逻辑 Hook
 * 提取状态管理和业务逻辑，降低组件复杂度
 */
function useSiteSettingsLogic() {
  const storeUser = useSiteStore((state) => state.user);
  const updateUserInStore = useSiteStore((state) => state.updateUser);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    footer_text: '',
    github_url: '',
    gitee_url: '',
    qq_url: '',
    wechat_url: '',
    douyin_url: '',
    home_background_url: '',
  });

  // Profile State
  const [user, setUser] = useState<User | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    avatarUrl: '',
    site_start_date: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // 使用 Store 中的用户信息初始化表单
  useEffect(() => {
    if (storeUser) {
      setProfileData(prev => ({
        ...prev,
        fullName: storeUser.fullName || '',
        email: storeUser.email || '',
        bio: storeUser.bio || '',
        avatarUrl: storeUser.avatarUrl || '',
      }));
    }
  }, [storeUser]);

  useEffect(() => {
    /**
     * 获取用户信息
     */
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // 如果 store 中没有数据，则使用 auth user 数据初始化
          if (!storeUser) {
            setProfileData(prev => ({
              ...prev,
              fullName: user.user_metadata?.full_name || '',
              email: user.email || '',
              bio: user.user_metadata?.bio || '',
              avatarUrl: user.user_metadata?.avatar_url || '',
            }));
          }
        }
      } catch (_error) {
        console.error('Failed to fetch user:', _error);
      }
    };
    fetchUser();
  }, [storeUser]);

  // 允许的外部图片域名白名单
  const allowedDomains = [
    'supabase.co',
    'unsplash.com',
    'github.com',
    'githubusercontent.com',
    'jsdelivr.net'
  ];

  useEffect(() => {
    /**
     * 从 API 获取当前站点设置
     */
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.data) {
          const { site_start_date, ...rest } = json.data;
          // 排除不需要存入 formData 的字段
          const { site_title: _, site_description: __, site_keywords: ___, ...formDataOnly } = rest;
          setFormData(prev => ({ ...prev, ...formDataOnly }));
          if (site_start_date) {
            setProfileData(prev => ({ ...prev, site_start_date: site_start_date || '' }));
          }
        }
      } catch (_error) {
        console.error('Fetch settings error:', _error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  /**
   * 处理表单输入变更
   * @param e - HTML 输入框变更事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  /**
   * 校验外部链接域名是否在白名单内
   * @param url - 待校验的图片 URL
   * @returns boolean - 是否允许
   */
  const validateImageUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  /**
   * 处理本地图片上传并同步到数据库
   * @param e - 文件选择事件
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 格式校验
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setToast({ message: '只支持 JPG, PNG, GIF, WEBP 格式图片', type: 'error' });
      return;
    }

    // 大小校验 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: '图片大小不能超过 5MB', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setToast({ message: '请先登录', type: 'error' });
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'site');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: uploadFormData,
      });

      const json = await res.json();
      if (res.ok && json.data?.url) {
        const newUrl = json.data.url;
        // 更新本地状态
        setFormData(prev => ({ ...prev, home_background_url: newUrl }));
        
        // 仅自动保存背景图 URL 到数据库，不影响其他未保存的字段
        const saveRes = await fetch('/api/settings', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ home_background_url: newUrl }),
        });

        if (saveRes.ok) {
          setToast({ message: '首页背景已即时更新', type: 'success' });
        } else {
          const errorData = await saveRes.json().catch(() => ({}));
          console.error('Auto-save failed:', errorData);
          setToast({ 
            message: `同步失败: ${errorData.error || '服务器内部错误'}`, 
            type: 'warning' 
          });
        }
      } else {
        throw new Error(json.error || '上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : '图片上传过程中发生错误';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setUploading(false);
      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * 处理设置表单提交
   * @param e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 校验外部链接
    if (formData.home_background_url && !validateImageUrl(formData.home_background_url)) {
      setToast({ message: '外部链接域名不在白名单内', type: 'error' });
      return;
    }

    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setToast({ message: '请先登录', type: 'error' });
        return;
      }

      const res = await fetch('/api/settings', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setToast({ message: '全局配置已成功保存', type: 'success' });
      } else {
        setToast({ message: '保存失败，请稍后重试', type: 'error' });
      }
    } catch (_error) {
      console.error('Save error:', _error);
      setToast({ message: '保存过程中发生错误', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /**
   * 处理个人资料字段变更
   * @param e - 输入框或文本域变更事件
   */
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value || '' }));
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
   * 处理头像上传并获取 URL
   * @param e - 文件选择事件
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

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'avatar');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: uploadFormData,
      });

      const json = await res.json();
      if (res.ok) {
        setProfileData(prev => ({ ...prev, avatarUrl: json.data.url }));
        setToast({ message: '头像上传成功', type: 'success' });
      } else {
        setToast({ message: '上传失败: ' + json.error, type: 'error' });
      }
    } catch (_error) {
      console.error('Upload error:', _error);
      setToast({ message: '上传出错', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  /**
   * 保存个人资料到 Auth 及 site_config
   * @param e - 表单提交事件
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
        email: profileData.email !== user?.email ? profileData.email : undefined,
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
        { key: 'intro', value: profileData.bio },
        { key: 'site_start_date', value: profileData.site_start_date }
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
        bio: profileData.bio,
      });
      
      // 更新本地用户状态
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }

      setToast({ 
        message: profileData.email !== user?.email ? '个人信息已保存，请查收新邮箱确认邮件。' : '个人信息已成功保存', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Profile save error:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setToast({ message: '保存失败: ' + errorMessage, type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  /**
   * 移除背景图并同步到数据库
   */
  const handleRemoveBackground = async () => {
    setFormData(prev => ({ ...prev, home_background_url: '' }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 即时同步移除操作到数据库
      await fetch('/api/settings', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ home_background_url: '' }),
      });
      setToast({ message: '首页背景已移除', type: 'success' });
    } catch (_error) {
      console.error('Remove background error:', _error);
    }
  };

  return {
    loading,
    saving,
    uploading,
    toast,
    setToast,
    fileInputRef,
    profileFileInputRef,
    formData,
    profileSaving,
    uploadingAvatar,
    profileData,
    profileErrors,
    handleChange,
    handleFileUpload,
    handleSubmit,
    handleProfileChange,
    handleAvatarUpload,
    handleSaveProfile,
    handleRemoveBackground,
  };
}

/**
 * 站点设置组件
 * 管理博客的全局配置、SEO 信息、社交链接和首页背景
 * @returns {JSX.Element} - 返回站点设置页面 JSX
 */
export default function SiteSettings() {
  const {
    loading,
    saving,
    uploading,
    toast,
    setToast,
    fileInputRef,
    profileFileInputRef,
    formData,
    profileSaving,
    uploadingAvatar,
    profileData,
    profileErrors,
    handleChange,
    handleFileUpload,
    handleSubmit,
    handleProfileChange,
    handleAvatarUpload,
    handleSaveProfile,
    handleRemoveBackground,
  } = useSiteSettingsLogic();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#165DFF]/20 border-t-[#165DFF] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#165DFF] rounded-full animate-pulse" />
          </div>
        </div>
        <span className="text-sm font-medium text-[#86909C] animate-pulse">正在加载系统配置...</span>
      </div>
    );
  }

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
      
      <div className="space-y-5">
        {/* 顶部标题与保存按钮 */}
        <SiteHeader saving={saving} handleSubmit={handleSubmit} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* 个人资料卡片 */}
            <ProfileSection 
              profileData={profileData}
              profileErrors={profileErrors}
              profileSaving={profileSaving}
              uploadingAvatar={uploadingAvatar}
              handleProfileChange={handleProfileChange}
              handleAvatarUpload={handleAvatarUpload}
              handleSaveProfile={handleSaveProfile}
              profileFileInputRef={profileFileInputRef}
            />

            {/* 首页背景设置 */}
            <BackgroundSection 
              formData={formData}
              uploading={uploading}
              handleRemoveBackground={handleRemoveBackground}
              handleFileUpload={handleFileUpload}
              handleChange={handleChange}
              fileInputRef={fileInputRef}
            />
          </div>

          <div className="space-y-6">
            {/* 社交链接 */}
            <SocialLinksSection 
              formData={formData}
              handleChange={handleChange}
            />

            {/* 页脚设置 */}
            <FooterSettingsSection 
              formData={formData}
              handleChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}