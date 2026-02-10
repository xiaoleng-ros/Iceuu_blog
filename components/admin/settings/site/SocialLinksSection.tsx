'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { SiteFormData, SocialLinksSectionProps } from './types';

/**
 * 社交链接输入项
 */
function SocialInput({
  id,
  name,
  value,
  label,
  placeholder,
  iconPath,
  onChange
}: {
  id: string;
  name: string;
  value: string;
  label: string;
  placeholder: string;
  iconPath: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-bold text-[#4E5969]">{label}</Label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
          <Image src={iconPath} alt={label} width={16} height={16} className="opacity-70 group-focus-within:opacity-100 transition-opacity" />
        </div>
        <Input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-13 h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
        />
      </div>
    </div>
  );
}

/**
 * 社交链接设置部分
 * 
 * @param {SocialLinksSectionProps} props - 组件属性
 * @returns {JSX.Element} - 返回社交链接设置组件 JSX
 */
export function SocialLinksSection({
  formData,
  handleChange
}: SocialLinksSectionProps) {
  const socialPlatforms = [
    { id: 'github_url', name: 'github_url', label: 'GitHub', placeholder: 'https://github.com/username', icon: '/svg/github.svg' },
    { id: 'gitee_url', name: 'gitee_url', label: 'Gitee', placeholder: 'https://gitee.com/username', icon: '/svg/gitee.svg' },
    { id: 'wechat_url', name: 'wechat_url', label: '微信', placeholder: '微信号或二维码链接', icon: '/svg/weixin.svg' },
    { id: 'qq_url', name: 'qq_url', label: 'QQ', placeholder: 'QQ 号或加群链接', icon: '/svg/QQ.svg' },
    { id: 'douyin_url', name: 'douyin_url', label: '抖音', placeholder: '抖音主页链接', icon: '/svg/抖音.svg' },
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
            {socialPlatforms.map(platform => (
              <Image key={platform.id} src={platform.icon} width={14} height={14} className="opacity-50" alt="" />
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {socialPlatforms.map(platform => (
          <SocialInput
            key={platform.id}
            id={platform.id}
            name={platform.name}
            value={formData[platform.name as keyof SiteFormData] as string}
            label={platform.label}
            placeholder={platform.placeholder}
            iconPath={platform.icon}
            onChange={handleChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}
