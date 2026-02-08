/**
 * 认证中间件
 * 提供统一的认证和授权功能
 */

import { createClientWithToken } from '@/lib/supabase';
import { UnauthorizedError } from '@/lib/api/error';

/**
 * 从请求头中提取认证令牌
 * @param {string | null} authHeader - Authorization 请求头内容
 * @returns {string} - 提取出的访问令牌 (JWT)
 * @throws {UnauthorizedError} - 如果请求头为空或格式不正确则抛出错误
 */
export function extractToken(authHeader: string | null): string {
  if (!authHeader) {
    throw new UnauthorizedError('缺少认证令牌');
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new UnauthorizedError('无效的认证令牌格式');
  }

  return token;
}

/**
 * 验证用户身份
 * @param {string} token - 访问令牌 (JWT)
 * @returns {Promise<User>} - 返回 Supabase 用户对象
 * @throws {UnauthorizedError} - 如果令牌无效、过期或用户不存在则抛出错误
 */
export async function verifyUser(token: string) {
  const supabase = createClientWithToken(token);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError('认证失败，请重新登录');
  }

  return user;
}

/**
 * 从请求中验证并获取用户
 * @param {Request} request - Next.js Request 对象
 * @returns {Promise<User>} - 返回验证通过的用户信息
 * @throws {UnauthorizedError} - 如果认证流程中的任何环节失败则抛出错误
 */
export async function authenticateRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader);
  return await verifyUser(token);
}

/**
 * 创建带认证的 Supabase 客户端
 * @param {Request} request - Next.js Request 对象
 * @returns {Promise<SupabaseClient>} - 返回已注入用户令牌的 Supabase 客户端实例
 * @throws {UnauthorizedError} - 如果认证令牌缺失或格式错误则抛出错误
 */
export async function createAuthenticatedClient(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader);
  return createClientWithToken(token);
}
