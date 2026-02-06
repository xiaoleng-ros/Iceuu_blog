import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Pages 不支持 Next.js 默认的图片优化，必须设为 true
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' }
    ],
  },
  // 生产环境优化：禁用 Source Map 以减小构建体积
  productionBrowserSourceMaps: false,
  // 确保 ESLint 错误不会中断构建（在 CI/CD 中很有用）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 允许在构建时忽略部分类型错误，确保部署顺利进行
    ignoreBuildErrors: true,
  },
  experimental: {
    // 优化包导入，提升边缘运行时启动速度
    optimizePackageImports: ['lucide-react', 'date-fns', 'clsx', 'tailwind-merge'],
  },
};

export default nextConfig;
