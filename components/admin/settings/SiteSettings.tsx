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
 * 背景图上传与预览组件
 */
function BackgroundUploader({
  url,
  uploading,
  fileInputRef,
  onUpload,
  onRemove,
  onViewOriginal
}: {
  url: string;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onViewOriginal: () => void;
}) {
  return (
    <div 
      className={cn(
        "relative aspect-video rounded-xl overflow-hidden bg-[#F9FBFF] border-2 border-dashed transition-all duration-300 group",
        uploading ? 'border-[#165DFF] bg-[#165DFF]/5' : 'border-[#F2F3F5] hover:border-[#165DFF]/30 hover:bg-[#F9FBFF]/80'
      )}
    >
      {url ? (
        <>
          <Image 
            src={url} 
            alt="Background Preview" 
            fill
            className={cn(
              "object-cover transition-all duration-500",
              uploading ? 'opacity-30 blur-sm' : 'group-hover:scale-105'
            )}
            unoptimized
          />
          <div className={cn(
            "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-3",
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
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
                  onClick={onViewOriginal}
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
                  onClick={onRemove}
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}

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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-[#4E5969]">背景图预览</Label>
            <span className="text-[11px] text-[#86909C]">支持 JPG, PNG, GIF, 不超过 5MB</span>
          </div>
          <BackgroundUploader 
            url={formData.home_background_url}
            uploading={uploading}
            fileInputRef={fileInputRef}
            onUpload={handleFileUpload}
            onRemove={handleRemoveBackground}
            onViewOriginal={() => window.open(formData.home_background_url, '_blank')}
          />
        </div>

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
 * 头像上传组件
 */
function AvatarUploadField({
  avatarUrl,
  uploadingAvatar,
  onAvatarUpload,
  fileInputRef,
  onProfileChange
}: {
  avatarUrl: string;
  uploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="md:col-span-2 space-y-2">
      <Label className="text-sm font-bold text-[#4E5969]">头像</Label>
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          {/* 头像图标容器 - 添加 z-10 确保显示在最上层 */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full overflow-hidden border border-[#E5E6EB] bg-[#F2F3F5] z-10">
            {avatarUrl ? (
              <div className="w-full h-full relative">
                <Image 
                  src={avatarUrl} 
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
            value={avatarUrl}
            onChange={onProfileChange}
            placeholder="https://example.com/avatar.png"
            className="h-11 pl-12 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onAvatarUpload}
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
  );
}

/**
 * 个人介绍组件
 */
function BioField({
  bio,
  error,
  onChange
}: {
  bio: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="md:col-span-2 space-y-2">
      <Label className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
        <span className="text-[#F53F3F]">*</span> 个人介绍
      </Label>
      <div className="relative group">
        <FileText className="absolute left-3 top-3 text-[#C9CDD4] group-focus-within:text-[#165DFF] transition-colors" size={16} />
        <textarea
          name="bio"
          value={bio}
          onChange={onChange}
          rows={4}
          className={cn(
            "w-full pl-10 pr-4 py-3 border border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all outline-none text-[#1D2129] text-sm resize-none bg-[#F9FBFF]/30",
            error && "border-[#F53F3F] focus:ring-[#F53F3F]/20"
          )}
          placeholder="写点什么介绍一下自己吧..."
        />
      </div>
      {error && (
        <p className="text-[12px] text-[#F53F3F] mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-[#F53F3F] rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * 个人资料表单字段组件
 */
function ProfileInfoFields({
  profileData,
  profileErrors,
  handleProfileChange
}: {
  profileData: { fullName: string; email: string; site_start_date: string };
  profileErrors: Record<string, string>;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <>
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
    </>
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
            <ProfileInfoFields 
              profileData={profileData}
              profileErrors={profileErrors}
              handleProfileChange={handleProfileChange}
            />

            <AvatarUploadField 
              avatarUrl={profileData.avatarUrl}
              uploadingAvatar={uploadingAvatar}
              onAvatarUpload={handleAvatarUpload}
              fileInputRef={profileFileInputRef}
              onProfileChange={handleProfileChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />

            <BioField 
              bio={profileData.bio}
              error={profileErrors.bio}
              onChange={handleProfileChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
            />
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
 * 社交链接输入项组件
 */
/**
 * 社交链接输入项组件
 */
function SocialLinkField({
  id,
  name,
  label,
  value,
  placeholder,
  icon,
  onChange
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  icon: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-bold text-[#4E5969]">{label}</Label>
      <div className="relative group">
        {/* 图标容器 - 添加 z-10 确保图标显示在最上层 */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 transition-colors z-10">
          <Image src={icon} alt={label} width={18} height={18} className="opacity-70 group-focus-within:opacity-100 transition-opacity" />
        </div>
        <Input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-14 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
        />
      </div>
    </div>
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
  const socialLinks = [
    { id: 'github_url', name: 'github_url', label: 'GitHub', placeholder: 'https://github.com/username', icon: '/svg/github.svg' },
    { id: 'gitee_url', name: 'gitee_url', label: 'Gitee', placeholder: 'https://gitee.com/username', icon: '/svg/gitee.svg' },
    { id: 'wechat_url', name: 'wechat_url', label: '微信', placeholder: '微信联系方式或主页链接', icon: '/svg/weixin.svg' },
    { id: 'qq_url', name: 'qq_url', label: 'QQ', placeholder: 'QQ 联系方式链接', icon: '/svg/QQ.svg' },
    { id: 'douyin_url', name: 'douyin_url', label: '抖音', placeholder: '抖音个人主页链接', icon: '/svg/抖音.svg' },
  ];

  return (
    <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
      <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
        <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
            社交媒体
          </div>
          <div className="flex -space-x-1.5 overflow-hidden">
            {socialLinks.map(link => (
              <Image key={link.id} src={link.icon} width={14} height={14} className="opacity-50" alt="" />
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {socialLinks.map(link => (
          <SocialLinkField
            key={link.id}
            {...link}
            value={(formData as any)[link.name]}
            onChange={handleChange}
          />
        ))}
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
 * 个人资料逻辑 Hook
 */
function useProfileLogic(setToast: (toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null) => void) {
  const storeUser = useSiteStore((state) => state.user);
  const updateUserInStore = useSiteStore((state) => state.updateUser);
  
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
  const profileFileInputRef = useRef<HTMLInputElement>(null);

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
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value || '' }));
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
        headers: { Authorization: `Bearer ${session.access_token}` },
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const configUpdates = [
        { key: 'site_name', value: profileData.fullName },
        { key: 'avatar_url', value: profileData.avatarUrl },
        { key: 'intro', value: profileData.bio },
        { key: 'site_start_date', value: profileData.site_start_date }
      ];

      for (const item of configUpdates) {
        await supabase.from('site_config').upsert({ key: item.key, value: item.value }, { onConflict: 'key' });
      }

      await supabase.auth.refreshSession();
      updateUserInStore({
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
        email: profileData.email,
        bio: profileData.bio,
      });
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) setUser(updatedUser);

      setToast({ 
        message: profileData.email !== user?.email ? '个人信息已保存，请查收新邮箱确认邮件。' : '个人信息已成功保存', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Profile save error:', error);
      setToast({ message: '保存失败: ' + (error instanceof Error ? error.message : '未知错误'), type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  return {
    user,
    profileSaving,
    uploadingAvatar,
    profileData,
    profileErrors,
    profileFileInputRef,
    setProfileData,
    handleProfileChange,
    handleAvatarUpload,
    handleSaveProfile,
  };
}

/**
 * 站点配置逻辑 Hook
 */
function useSiteConfigLogic(
  setToast: (toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null) => void,
  setProfileData: React.Dispatch<React.SetStateAction<{ fullName: string; email: string; bio: string; avatarUrl: string; site_start_date: string }>>
) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    footer_text: '',
    github_url: '',
    gitee_url: '',
    qq_url: '',
    wechat_url: '',
    douyin_url: '',
    home_background_url: '',
  });

  const allowedDomains = ['supabase.co', 'unsplash.com', 'github.com', 'githubusercontent.com', 'jsdelivr.net'];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.data) {
          const { site_start_date, ...rest } = json.data;
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
  }, [setProfileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const validateImageUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setToast({ message: '只支持 JPG, PNG, GIF, WEBP 格式图片', type: 'error' });
      return;
    }
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
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: uploadFormData,
      });

      const json = await res.json();
      if (res.ok && json.data?.url) {
        const newUrl = json.data.url;
        setFormData(prev => ({ ...prev, home_background_url: newUrl }));
        
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
          setToast({ message: '同步失败', type: 'warning' });
        }
      } else {
        throw new Error(json.error || '上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToast({ message: error instanceof Error ? error.message : '上传失败', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.home_background_url && !validateImageUrl(formData.home_background_url)) {
      setToast({ message: '外部链接域名不在白名单内', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
        setToast({ message: '保存失败', type: 'error' });
      }
    } catch (_error) {
      console.error('Save error:', _error);
      setToast({ message: '保存出错', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBackground = async () => {
    setFormData(prev => ({ ...prev, home_background_url: '' }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
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
    fileInputRef,
    formData,
    handleChange,
    handleFileUpload,
    handleSubmit,
    handleRemoveBackground,
  };
}

/**
 * 站点设置逻辑 Hook
 * 提取状态管理和业务逻辑，降低组件复杂度
 */
function useSiteSettingsLogic() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  const {
    profileSaving,
    uploadingAvatar,
    profileData,
    profileErrors,
    profileFileInputRef,
    setProfileData,
    handleProfileChange,
    handleAvatarUpload,
    handleSaveProfile,
  } = useProfileLogic(setToast);

  const {
    loading,
    saving,
    uploading,
    fileInputRef,
    formData,
    handleChange,
    handleFileUpload,
    handleSubmit,
    handleRemoveBackground,
  } = useSiteConfigLogic(setToast, setProfileData);

  return {
    loading, saving, uploading, toast, setToast, fileInputRef, profileFileInputRef,
    formData, profileSaving, uploadingAvatar, profileData, profileErrors,
    handleChange, handleFileUpload, handleSubmit, handleProfileChange,
    handleAvatarUpload, handleSaveProfile, handleRemoveBackground,
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