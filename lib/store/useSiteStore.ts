'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

/**
 * 站点配置信息接口
 */
interface SiteConfig {
  site_name?: string;
  avatar_url?: string;
  intro?: string;
  site_title?: string;
  site_description?: string;
  site_keywords?: string;
  site_start_date?: string;
  footer_text?: string;
  github_url?: string;
  gitee_url?: string;
  qq_url?: string;
  wechat_url?: string;
  douyin_url?: string;
  home_background_url?: string;
  [key: string]: any;
}

/**
 * 用户信息接口
 */
interface UserInfo {
  fullName: string;
  avatarUrl: string;
  email: string;
}

/**
 * 全局状态管理接口
 */
interface SiteState {
  config: SiteConfig;
  user: UserInfo | null;
  loading: boolean;
  isInitialized: boolean;
  /**
   * 从数据库获取最新配置
   */
  fetchConfig: () => Promise<void>;
  /**
   * 获取当前登录用户信息
   */
  fetchUser: () => Promise<void>;
  /**
   * 更新本地配置状态
   * @param key 配置键
   * @param value 配置值
   */
  updateConfig: (key: string, value: any) => void;
  /**
   * 更新本地用户信息
   * @param info 用户信息
   */
  updateUser: (info: Partial<UserInfo>) => void;
  /**
   * 初始化配置、用户信息和实时监听
   */
  initConfig: () => () => void;
}

/**
 * 全局站点配置 Store
 * 使用 zustand 实现，并结合 persist 中间件进行本地缓存
 * 确保在页面跳转时能够立即获取到最新的用户信息，避免闪烁
 */
export const useSiteStore = create<SiteState>()(
  persist(
    (set, get) => ({
      config: {
        site_name: '赵阿卷', // 默认回退值
      },
      user: null,
      loading: true,
      isInitialized: false,

      fetchConfig: async () => {
        try {
          const { data, error } = await supabase.from('site_config').select('*');
          if (error) throw error;
          
          if (data) {
            const configMap = data.reduce((acc: any, curr) => {
              acc[curr.key] = curr.value;
              return acc;
            }, {});
            set({ config: configMap, loading: false });
          }
        } catch (error) {
          console.error('Failed to fetch site config:', error);
          set({ loading: false });
        }
      },

      fetchUser: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            set({
              user: {
                fullName: user.user_metadata?.full_name || '管理员',
                avatarUrl: user.user_metadata?.avatar_url || '',
                email: user.email || '',
              }
            });
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      },

      updateConfig: (key, value) => {
        set((state) => ({
          config: { ...state.config, [key]: value }
        }));
      },

      updateUser: (info) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...info } : (info as UserInfo)
        }));
      },

      initConfig: () => {
        const { isInitialized, fetchConfig, fetchUser } = get();
        
        // 标记为已初始化，避免重复执行逻辑
        if (!isInitialized) {
          set({ isInitialized: true });
          fetchConfig();
          fetchUser();
        }

        // 订阅 Supabase 实时变更 (site_config)
        const configChannel = supabase
          .channel('site_config_global')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'site_config'
            },
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;

              if (eventType === 'INSERT' || eventType === 'UPDATE') {
                get().updateConfig(newRecord.key, newRecord.value);
              } else if (eventType === 'DELETE') {
                set((state) => {
                  const next = { ...state.config };
                  delete next[oldRecord.key];
                  return { config: next };
                });
              }
            }
          )
          .subscribe();

        // 订阅 Supabase Auth 变更
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
            const user = session?.user;
            if (user) {
              get().updateUser({
                fullName: user.user_metadata?.full_name || '管理员',
                avatarUrl: user.user_metadata?.avatar_url || '',
                email: user.email || '',
              });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null });
          }
        });

        // 返回清理函数
        return () => {
          supabase.removeChannel(configChannel);
          subscription.unsubscribe();
        };
      }
    }),
    {
      name: 'site-config-storage', // 存储在 localStorage 中的键名
      storage: createJSONStorage(() => localStorage),
      // 持久化 config 和 user 字段
      partialize: (state) => ({ 
        config: state.config,
        user: state.user
      }),
    }
  )
);
