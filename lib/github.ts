import { githubConfig, validateGithubConfig } from '@/lib/config/env';

/**
 * GitHub 配置接口
 */
export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

/**
 * 获取 GitHub API URL
 */
function getGitHubApiUrl(config?: GitHubConfig): string {
  if (config) {
    return `https://api.github.com/repos/${config.owner}/${config.repo}/contents`;
  }
  return githubConfig.apiUrl;
}

/**
 * 验证配置是否完整
 */
function isConfigValid(config?: GitHubConfig): boolean {
  if (config) {
    return !!(config.token && config.owner && config.repo);
  }
  return validateGithubConfig();
}

/**
 * 获取默认配置或传入配置
 */
function resolveConfig(config?: GitHubConfig): GitHubConfig {
  if (config && isConfigValid(config)) {
    return config;
  }
  try {
    return {
      token: githubConfig.token,
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      branch: githubConfig.branch,
    };
  } catch (_e) {
    throw new Error('GitHub 配置不完整，请在管理后台 [系统设置] 中配置 GitHub 图床，或检查环境变量 GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  }
}

interface UploadResult {
  content: {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    _links: {
      self: string;
      git: string;
      html: string;
    };
  };
  commit: {
    sha: string;
    node_id: string;
    url: string;
    html_url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    parents: Array<{
      sha: string;
      url: string;
      html_url: string;
    }>;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
}

interface GitHubError {
  message: string;
  documentation_url?: string;
}

/**
 * 上传文件到 GitHub
 * @param content Base64 编码的文件内容
 * @param filePath 文件路径 (e.g., "images/2024/01/test.jpg")
 * @param message 提交信息
 * @param config 可选的 GitHub 配置（如果提供则优先使用）
 * @returns {Promise<UploadResult>} 上传结果
 */
export async function uploadImageToGitHub(
  content: string,
  filePath: string,
  message: string = 'Upload image via Blog Admin',
  config?: GitHubConfig
): Promise<UploadResult> {
  // 获取有效配置
  const activeConfig = resolveConfig(config);

  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const url = `${getGitHubApiUrl(activeConfig)}/${cleanPath}`;

  try {
    const body = JSON.stringify({
      message,
      content,
      branch: activeConfig.branch,
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${activeConfig.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as GitHubError;
      throw new Error(errorData.message || `GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('GitHub Upload Error:', errorMessage);
    throw new Error(errorMessage || 'Failed to upload image to GitHub');
  }
}

/**
 * 获取文件的 CDN 访问链接
 * @param filePath 文件路径
 * @param config 可选的 GitHub 配置
 */
export function getJsDelivrUrl(filePath: string, config?: GitHubConfig) {
  const activeConfig = resolveConfig(config);
  
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `https://raw.githubusercontent.com/${activeConfig.owner}/${activeConfig.repo}/${activeConfig.branch}/${cleanPath}`;
}

/**
 * 从 GitHub 删除文件
 * @param filePath 文件路径
 * @param message 提交信息
 * @param config 可选的 GitHub 配置
 */
export async function deleteFileFromGitHub(
  filePath: string,
  message: string = 'Delete image via Blog Admin',
  config?: GitHubConfig
): Promise<void> {
  const activeConfig = resolveConfig(config);

  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const url = `${getGitHubApiUrl(activeConfig)}/${cleanPath}`;

  try {
    const getUrl = new URL(url);
    getUrl.searchParams.append('ref', activeConfig.branch);

    const getResponse = await fetch(getUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `token ${activeConfig.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        console.warn(`File ${filePath} not found on GitHub, skipping deletion.`);
        return;
      }
      const errorData = (await getResponse.json()) as GitHubError;
      throw new Error(errorData.message || `GitHub API error (GET): ${getResponse.status}`);
    }

    const { sha } = await getResponse.json();

    const deleteResponse = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${activeConfig.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message,
        sha,
        branch: activeConfig.branch,
      }),
    });

    if (!deleteResponse.ok) {
      const errorData = (await deleteResponse.json()) as GitHubError;
      throw new Error(errorData.message || `GitHub API error (DELETE): ${deleteResponse.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('GitHub Delete Error:', errorMessage);
    throw new Error(errorMessage || 'Failed to delete file from GitHub');
  }
}

/**
 * 获取文件的 Raw 访问链接 (Fallback)
 * @param filePath 文件路径
 * @param config 可选的 GitHub 配置
 */
export function getGitHubRawUrl(filePath: string, config?: GitHubConfig) {
  const activeConfig = resolveConfig(config);
  
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `https://raw.githubusercontent.com/${activeConfig.owner}/${activeConfig.repo}/${activeConfig.branch}/${cleanPath}`;
}
