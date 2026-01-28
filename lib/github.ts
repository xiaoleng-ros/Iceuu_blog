import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

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

/**
 * 上传文件到 GitHub
 * @param content Base64 编码的文件内容
 * @param filePath 文件路径 (e.g., "images/2024/01/test.jpg")
 * @param message 提交信息
 */
export async function uploadImageToGitHub(
  content: string,
  filePath: string,
  message: string = 'Upload image via Blog Admin'
): Promise<UploadResult> {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub environment variables are missing');
  }

  // Ensure filePath doesn't start with /
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const url = `${GITHUB_API_URL}/${cleanPath}`;

  try {
    const data = {
      message,
      content,
      branch: GITHUB_BRANCH,
    };

    const response = await axios.put<UploadResult>(url, data, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('GitHub Upload Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to upload image to GitHub');
  }
}

/**
 * 获取文件的 CDN 访问链接 (jsDelivr)
 * @param filePath 文件路径
 */
export function getJsDelivrUrl(filePath: string) {
  // Ensure filePath doesn't start with /
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  // 优先使用 raw.githubusercontent.com 以确保实时性，jsDelivr 缓存可能导致延迟
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${cleanPath}`;
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
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub environment variables are missing');
  }

  // Ensure filePath doesn't start with /
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const url = `${GITHUB_API_URL}/${cleanPath}`;

  try {
    // 1. 获取文件的 SHA (GitHub 删除操作必须提供 SHA)
    const getResponse = await axios.get(url, {
      params: { ref: GITHUB_BRANCH },
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const sha = getResponse.data.sha;

    // 2. 执行删除
    await axios.delete(url, {
      data: {
        message,
        sha,
        branch: GITHUB_BRANCH,
      },
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
    });
  } catch (error: any) {
    // 如果文件已经不存在，静默失败
    if (error.response?.status === 404) {
      console.warn(`File ${filePath} not found on GitHub, skipping deletion.`);
      return;
    }
    console.error('GitHub Delete Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete file from GitHub');
  }
}

/**
 * 获取文件的 Raw 访问链接 (Fallback)
 */
export function getGitHubRawUrl(filePath: string) {
  // Ensure filePath doesn't start with /
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${cleanPath}`;
}
