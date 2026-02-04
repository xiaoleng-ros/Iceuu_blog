/**
 * 认证服务层
 * 提供用户认证相关的业务逻辑
 */

import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';

/**
 * 用户登录
 * @param email 邮箱
 * @param password 密码
 * @returns 用户和会话信息
 */
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * 用户登出
 * @returns 登出结果
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`登出失败: ${error.message}`);
  }

  return { success: true };
}

/**
 * 获取当前用户
 * @returns 当前用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('获取用户失败:', error);
    return null;
  }

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
  };
}

/**
 * 更新用户信息
 * @param updates 更新数据
 * @returns 更新后的用户信息
 */
export async function updateUser(updates: {
  full_name?: string;
  avatar_url?: string;
}) {
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
    },
  });

  if (error) {
    throw new Error(`更新用户信息失败: ${error.message}`);
  }

  return user;
}

/**
 * 注册新用户
 * @param email 邮箱
 * @param password 密码
 * @returns 用户和会话信息
 */
export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * 重置密码
 * @param email 邮箱
 * @returns 重置结果
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    throw new Error(`发送重置密码邮件失败: ${error.message}`);
  }

  return { success: true };
}

/**
 * 验证令牌
 * @param token 访问令牌
 * @returns 用户信息
 */
export async function verifyToken(token: string) {
  const supabaseWithToken = supabase.auth.setSession({
    access_token: token,
  });

  const { data: { user }, error } = await supabaseWithToken.auth.getUser();

  if (error || !user) {
    throw new Error('令牌无效或已过期');
  }

  return user;
}
