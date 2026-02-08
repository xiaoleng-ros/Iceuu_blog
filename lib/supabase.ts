import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/config/env';

/**
 * 默认 Supabase 客户端实例
 * 使用匿名密钥，适用于公共访问或受 RLS 保护的客户端操作
 */
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

/**
 * 创建带认证令牌的 Supabase 客户端
 * @param {string} token - 用户认证令牌 (JWT)
 * @returns {SupabaseClient} - 返回带有 Authorization 请求头的 Supabase 客户端
 */
export const createClientWithToken = (token: string) => {
  return createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};
