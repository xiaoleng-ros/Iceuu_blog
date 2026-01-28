'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Save, Loader2, Globe, Github, CheckCircle2, XCircle, AlertCircle, FileText, Upload, Link as LinkIcon, Image as ImageIcon, Trash2, MessageSquare, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    site_title: '',
    site_description: '',
    site_keywords: '',
    footer_text: '',
    github_url: '',
    gitee_url: '',
    qq_url: '',
    wechat_url: '',
    douyin_url: '',
    home_background_url: '',
  });

  // 允许的外部图片域名白名单
  const allowedDomains = [
    'supabase.co',
    'unsplash.com',
    'github.com',
    'githubusercontent.com',
    'jsdelivr.net'
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.data) {
          setFormData(prev => ({ ...prev, ...json.data }));
        }
      } catch (error) {
        console.error('Fetch settings error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * 校验外部链接域名
   */
  const validateImageUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsedUrl = new URL(url);
      return allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
    } catch (e) {
      return false;
    }
  };

  /**
   * 处理本地图片上传
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
    } catch (error: any) {
      console.error('Upload error:', error);
      setToast({ message: error.message || '图片上传过程中发生错误', type: 'error' });
    } finally {
      setUploading(false);
      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
    } catch (error) {
      console.error('Save error:', error);
      setToast({ message: '保存过程中发生错误', type: 'error' });
    } finally {
      setSaving(false);
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
    } catch (error) {
      console.error('Remove background error:', error);
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
      <span className="text-sm font-medium text-[#86909C] animate-pulse">正在加载系统配置...</span>
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
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 顶部标题与保存按钮 */}
        <div className="bg-white p-5 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F2F3F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129] tracking-tight">站点设置</h1>
            <p className="text-[#86909C] mt-1 text-sm">管理您的博客站点信息、SEO 及社交链接</p>
          </div>
          <Button 
            type="submit" 
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <div className="space-y-6">
            {/* 站点基本信息 */}
            <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
              <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
                <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
                    站点基本信息
                  </div>
                  <Globe className="h-4 w-4 text-[#165DFF] opacity-50" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="site_title" className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    网站标题
                  </Label>
                  <Input
                    id="site_title"
                    name="site_title"
                    value={formData.site_title}
                    onChange={handleChange}
                    placeholder="例如: 我的技术博客"
                    className="h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site_keywords" className="text-sm font-bold text-[#4E5969]">关键词 (SEO)</Label>
                  <Input
                    id="site_keywords"
                    name="site_keywords"
                    value={formData.site_keywords}
                    onChange={handleChange}
                    placeholder="技术, 编程, 生活 (用逗号分隔)"
                    className="h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_start_date" className="text-sm font-bold text-[#4E5969] flex items-center gap-1">
                    建站日期
                    <span className="text-[10px] font-normal text-[#86909C]">(用于计算站点运行时间)</span>
                  </Label>
                  <Input
                    id="site_start_date"
                    name="site_start_date"
                    type="date"
                    value={formData.site_start_date}
                    onChange={handleChange}
                    className="h-11 border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description" className="text-sm font-bold text-[#4E5969]">网站描述</Label>
                  <textarea
                    id="site_description"
                    name="site_description"
                    value={formData.site_description}
                    onChange={(e: any) => handleChange(e)}
                    placeholder="简短描述您的博客内容..."
                    className="w-full min-h-[100px] p-3 text-sm border border-[#E5E6EB] focus:border-[#165DFF] focus:ring-1 focus:ring-[#165DFF]/20 rounded-xl transition-all bg-[#F9FBFF]/30 resize-none outline-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 社交链接 */}
            <Card className="border border-[#F2F3F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[16px] bg-white overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
              <CardHeader className="border-b border-[#F2F3F5] bg-[#F9FBFF]/50 py-4 px-6">
                <CardTitle className="text-base font-bold text-[#1D2129] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#165DFF] rounded-full" />
                    社交媒体
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <img src="/svg/github.svg" className="h-3.5 w-3.5 opacity-50" alt="" />
                    <img src="/svg/gitee.svg" className="h-3.5 w-3.5 opacity-50" alt="" />
                    <img src="/svg/weixin.svg" className="h-3.5 w-3.5 opacity-50" alt="" />
                    <img src="/svg/QQ.svg" className="h-3.5 w-3.5 opacity-50" alt="" />
                    <img src="/svg/抖音.svg" className="h-3.5 w-3.5 opacity-50" alt="" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="github_url" className="text-sm font-bold text-[#4E5969]">GitHub</Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 flex items-center justify-center transition-colors">
                      <img src="/svg/github.svg" alt="GitHub" className="h-4 w-4 opacity-70 group-focus-within:opacity-100 transition-opacity" />
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 flex items-center justify-center transition-colors">
                      <img src="/svg/gitee.svg" alt="Gitee" className="h-4 w-4 opacity-70 group-focus-within:opacity-100 transition-opacity" />
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 flex items-center justify-center transition-colors">
                      <img src="/svg/weixin.svg" alt="微信" className="h-4 w-4 opacity-70 group-focus-within:opacity-100 transition-opacity" />
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 flex items-center justify-center transition-colors">
                      <img src="/svg/QQ.svg" alt="QQ" className="h-4 w-4 opacity-70 group-focus-within:opacity-100 transition-opacity" />
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#F2F3F5] group-focus-within:bg-[#165DFF]/10 flex items-center justify-center transition-colors">
                      <img src="/svg/抖音.svg" alt="抖音" className="h-4 w-4 opacity-70 group-focus-within:opacity-100 transition-opacity" />
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
          </div>

          <div className="space-y-6">
            {/* 首页背景设置 */}
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
                        <img 
                          src={formData.home_background_url} 
                          alt="Background Preview" 
                          className={`w-full h-full object-cover transition-all duration-500 ${uploading ? 'opacity-30 blur-sm' : 'group-hover:scale-105'}`}
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

            {/* 页脚设置 */}
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
          </div>
        </div>
      </form>
    </div>
  );
}