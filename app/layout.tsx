import type { Metadata } from "next";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import StoreInitializer from "@/components/layout/StoreInitializer";

/**
 * 动态生成页面元数据
 * 从数据库中获取 site_name 作为标题前缀
 * @returns {Promise<Metadata>} - 返回 Metadata 对象
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
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
      icons: {
        icon: [
          {
            url: "/favicon.ico?v=1",
            href: "/favicon.ico?v=1",
          },
        ],
      },
    };
  } catch (error) {
    console.error('生成元数据失败:', error);
    // 构建阶段如果 Supabase 连接失败（如占位符 URL 或网络问题），返回默认元数据
    return {
      title: {
        template: `%s | 我的博客`,
        default: `我的博客 - 个人博客`,
      },
      description: "基于 Next.js + Supabase 构建的个人博客系统",
      icons: {
        icon: [
          {
            url: "/favicon.ico?v=1",
            href: "/favicon.ico?v=1",
          },
        ],
      },
    };
  }
}

/**
 * 根布局组件
 * 包含 StoreInitializer 以初始化全局状态，并设置 HTML 语言和字体样式
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子节点
 * @returns {JSX.Element} - 返回根布局 HTML 结构
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
