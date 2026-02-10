'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { FileText } from 'lucide-react';
import { FooterSettingsSectionProps } from './types';

/**
 * 页脚设置部分
 * 
 * @param {FooterSettingsSectionProps} props - 组件属性
 * @returns {JSX.Element} - 返回页脚设置组件 JSX
 */
export function FooterSettingsSection({
  formData,
  handleChange
}: FooterSettingsSectionProps) {
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
