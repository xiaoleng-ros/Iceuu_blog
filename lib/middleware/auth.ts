/**
 * 认证中间件
 * 提供统一的认证和授权功能
 */

import { createClientWithToken } from '@/lib/supabase';
import { UnauthorizedError } from '@/lib/api/error';

/**
 * 从请求头中提取认证令牌
 * @param authHeader Authorization 请求头
 * @returns 访问令牌
 * @throws 如果令牌无效则抛出错误
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
 * @param token 访问令牌
 * @returns 用户信息
 * @throws 如果认证失败则抛出错误
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
 * @param request Request 对象
 * @returns 用户信息
 * @throws 如果认证失败则抛出错误
 */
export async function authenticateRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader);
  return await verifyUser(token);
}

/**
 * 创建带认证的 Supabase 客户端
 * @param request Request 对象
 * @returns Supabase 客户端
 * @throws 如果认证失败则抛出错误
 */
export async function createAuthenticatedClient(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader);
  return createClientWithToken(token);
}
