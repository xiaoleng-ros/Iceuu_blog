import type { Metadata } from "next";
import "./globals.css";
import StoreInitializer from "@/components/layout/StoreInitializer";
import { ScrollingTitle } from "@/components/layout/ScrollingTitle";

/**
 * 生成页面元数据
 * @returns {Promise<Metadata>} - 返回 Metadata 对象
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteName = "年年岁岁花相似，岁岁年年人不同";
  
  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
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
        <ScrollingTitle />
        {children}
      </body>
    </html>
  );
}
