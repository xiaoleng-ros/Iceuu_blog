import type { Metadata } from "next";
import "./globals.css";
import { supabase } from "@/lib/supabase";

/**
 * 动态生成页面元数据
 * 从数据库中获取 site_name 作为标题前缀
 * @returns Metadata 对象
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'site_name')
    .single();
    
  const siteName = data?.value || "我的博客";
  
  return {
    title: {
      template: `%s | ${siteName}`,
      default: `${siteName} - 个人博客`,
    },
    description: "基于 Next.js + Supabase 构建的个人博客系统",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
