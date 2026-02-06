/**
 * 环境变量配置管理
 * 提供类型安全的环境变量访问和验证
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * 验证必需的环境变量
 * @param name 环境变量名称
 * @param value 环境变量值
 * @returns 环境变量值或占位符
 * @throws 如果在非构建环境下环境变量缺失则抛出错误
 */
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    // 在构建阶段，如果环境变量缺失，返回一个占位符以防止构建进程因验证失败而中断
    const isBuildPhase = process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build';
    if (isBuildPhase) {
      console.warn(`[Build Warning] 缺失环境变量: ${name}。将使用占位符完成构建。`);
      return name.includes('URL') ? 'https://tmp-placeholder.supabase.co' : 'tmp-placeholder';
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * 验证可选的环境变量（用于延迟加载场景）
 * @param name 环境变量名称
 * @param value 环境变量值
 * @throws 如果环境变量缺失则抛出错误
 */
function validateOptionalEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. 请检查 .env.local 文件配置`);
  }
  return value;
}

/**
 * Supabase 配置（必需）
 */
export const supabaseConfig = {
  get url() {
    return validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
  },
  get anonKey() {
    return validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
  },
};

/**
 * GitHub 图床配置（延迟加载，按需验证）
 * 只在实际使用时才验证环境变量
 */
export const githubConfig = {
  get token() {
    return validateOptionalEnvVar('GITHUB_TOKEN', GITHUB_TOKEN);
  },
  get owner() {
    return validateOptionalEnvVar('GITHUB_OWNER', GITHUB_OWNER);
  },
  get repo() {
    return validateOptionalEnvVar('GITHUB_REPO', GITHUB_REPO);
  },
  get branch() {
    return GITHUB_BRANCH;
  },
  get apiUrl() {
    return `https://api.github.com/repos/${this.owner}/${this.repo}/contents`;
  },
};

/**
 * 站点配置
 */
export const siteConfig = {
  url: SITE_URL,
};

/**
 * 检查所有必需的环境变量是否已配置
 * @returns 如果所有变量都已配置返回 true，否则返回 false
 */
export function validateAllEnvVars(): boolean {
  try {
    validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
    validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
    return true;
  } catch (error) {
    console.error('Environment validation failed:', error);
    return false;
  }
}

/**
 * 检查 GitHub 配置是否完整
 * @returns 如果 GitHub 配置完整返回 true，否则返回 false
 */
export function validateGithubConfig(): boolean {
  try {
    validateOptionalEnvVar('GITHUB_TOKEN', GITHUB_TOKEN);
    validateOptionalEnvVar('GITHUB_OWNER', GITHUB_OWNER);
    validateOptionalEnvVar('GITHUB_REPO', GITHUB_REPO);
    return true;
  } catch (error) {
    console.error('GitHub config validation failed:', error);
    return false;
  }
}

/**
 * 获取环境变量配置摘要（用于调试）
 */
export function getEnvSummary() {
  // 安全地获取 GitHub 配置（避免触发验证错误）
  const hasGithubConfig = !!(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO);
  
  return {
    supabase: {
      url: supabaseConfig.url,
      hasAnonKey: !!supabaseConfig.anonKey,
    },
    github: {
      hasConfig: hasGithubConfig,
      owner: GITHUB_OWNER || '未配置',
      repo: GITHUB_REPO || '未配置',
      branch: GITHUB_BRANCH,
      hasToken: !!GITHUB_TOKEN,
    },
    site: {
      url: siteConfig.url,
    },
  };
}
