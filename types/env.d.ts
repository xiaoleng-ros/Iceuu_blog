/**
 * 环境变量类型定义
 * 为 Next.js 环境变量提供 TypeScript 类型支持
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase 配置
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

      // GitHub 图床配置
      GITHUB_TOKEN: string;
      GITHUB_OWNER: string;
      GITHUB_REPO: string;
      GITHUB_BRANCH?: string;

      // 站点配置
      NEXT_PUBLIC_SITE_URL?: string;
    }
  }
}

export {};
