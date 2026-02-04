import { githubConfig, validateGithubConfig } from '@/lib/config/env';

/**
 * 获取 GitHub API URL
 * 延迟计算，只在实际使用时才验证配置
 */
function getGitHubApiUrl(): string {
  return githubConfig.apiUrl;
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
 * @returns {Promise<UploadResult>} 上传结果
 */
export async function uploadImageToGitHub(
  content: string,
  filePath: string,
  message: string = 'Upload image via Blog Admin'
): Promise<UploadResult> {
  // 验证 GitHub 配置是否完整
  if (!validateGithubConfig()) {
    throw new Error('GitHub 配置不完整，请检查环境变量 GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  }

  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const url = `${getGitHubApiUrl()}/${cleanPath}`;

  try {
    const body = JSON.stringify({
      message,
      content,
      branch: githubConfig.branch,
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubConfig.token}`,
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
  } catch (error: any) {
    console.error('GitHub Upload Error:', error.message);
    throw new Error(error.message || 'Failed to upload image to GitHub');
  }
}

/**
 * 获取文件的 CDN 访问链接 (jsDelivr)
 * @param filePath 文件路径
 */
export function getJsDelivrUrl(filePath: string) {
  // 验证 GitHub 配置是否完整
  if (!validateGithubConfig()) {
    throw new Error('GitHub 配置不完整，无法生成 CDN 链接');
  }
  
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `https://raw.githubusercontent.com/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${cleanPath}`;
}

/**
 * 从 GitHub 删除文件
 * @param filePath 文件路径
 * @param message 提交信息
 */
export async function deleteFileFromGitHub(
  filePath: string,
  message: string = 'Delete image via Blog Admin'
): Promise<void> {
  // 验证 GitHub 配置是否完整
  if (!validateGithubConfig()) {
    throw new Error('GitHub 配置不完整，请检查环境变量 GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  }

  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const url = `${getGitHubApiUrl()}/${cleanPath}`;

  try {
    const getUrl = new URL(url);
    getUrl.searchParams.append('ref', githubConfig.branch);

    const getResponse = await fetch(getUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `token ${githubConfig.token}`,
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
        'Authorization': `token ${githubConfig.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message,
        sha,
        branch: githubConfig.branch,
      }),
    });

    if (!deleteResponse.ok) {
      const errorData = (await deleteResponse.json()) as GitHubError;
      throw new Error(errorData.message || `GitHub API error (DELETE): ${deleteResponse.status}`);
    }
  } catch (error: any) {
    console.error('GitHub Delete Error:', error.message);
    throw new Error(error.message || 'Failed to delete file from GitHub');
  }
}

/**
 * 获取文件的 Raw 访问链接 (Fallback)
 */
export function getGitHubRawUrl(filePath: string) {
  // 验证 GitHub 配置是否完整
  if (!validateGithubConfig()) {
    throw new Error('GitHub 配置不完整，无法生成 Raw 链接');
  }
  
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `https://raw.githubusercontent.com/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${cleanPath}`;
}
