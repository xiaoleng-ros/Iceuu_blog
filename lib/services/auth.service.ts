/**
 * 认证服务层
 * 提供用户认证相关的业务逻辑
 */

import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types/database';

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

  // 更新最后登录时间
  if (data.user) {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id);
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
 * 获取当前用户（从 public.users 表）
 * @returns 当前用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    console.error('获取用户失败:', authError);
    return null;
  }

  // 从 public.users 表获取完整用户信息
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) {
    console.error('获取用户详情失败:', error);
    return null;
  }

  return user as User;
}

/**
 * 获取当前用户角色
 * @returns 用户角色
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

/**
 * 检查当前用户是否为管理员
 * @returns 是否为管理员
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'admin';
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
 * 使用 Supabase Auth API 验证访问令牌的有效性
 * @param {string} token - 访问令牌
 * @returns {Promise<any>} - 返回用户信息
 */
export async function verifyToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('令牌无效或已过期');
  }

  return user;
}

/**
 * 获取所有用户列表
 * @returns 用户列表
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`获取用户列表失败: ${error.message}`);
  }

  return (data || []) as User[];
}

/**
 * 根据 ID 获取用户
 * @param id 用户 ID
 * @returns 用户信息
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('获取用户失败:', error);
    return null;
  }

  return data as User;
}

/**
 * 更新用户角色
 * @param userId 用户 ID
 * @param role 新角色
 * @returns 更新后的用户信息
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`更新用户角色失败: ${error.message}`);
  }

  return data as User;
}

/**
 * 启用/禁用用户
 * @param userId 用户 ID
 * @param isActive 是否启用
 * @returns 更新后的用户信息
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`更新用户状态失败: ${error.message}`);
  }

  return data as User;
}

/**
 * 删除用户
 * @param userId 用户 ID
 * @returns 删除结果
 */
export async function deleteUser(userId: string): Promise<{ success: boolean }> {
  // 先删除 public.users 表中的记录
  const { error: publicError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (publicError) {
    throw new Error(`删除用户失败: ${publicError.message}`);
  }

  // 注意：删除 auth.users 中的用户需要使用 Supabase Admin API
  // 这里只删除 public.users 中的记录

  return { success: true };
}
