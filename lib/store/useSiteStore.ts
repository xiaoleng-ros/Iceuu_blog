'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

/**
 * 站点配置信息接口
 */
interface SiteConfig {
  /** 站点名称 */
  site_name?: string;
  /** 头像 URL */
  avatar_url?: string;
  /** 个人简介 */
  intro?: string;
  /** 站点标题 */
  site_title?: string;
  /** 站点描述 */
  site_description?: string;
  /** 站点关键词 */
  site_keywords?: string;
  /** 站点开始运行日期 */
  site_start_date?: string;
  /** 页脚文本 */
  footer_text?: string;
  /** GitHub 链接 */
  github_url?: string;
  /** Gitee 链接 */
  gitee_url?: string;
  /** QQ 链接 */
  qq_url?: string;
  /** 微信链接 */
  wechat_url?: string;
  /** 抖音链接 */
  douyin_url?: string;
  /** 首页背景图 URL */
  home_background_url?: string;
  /** 其他动态配置项 */
  [key: string]: string | undefined;
}

/**
 * 用户信息接口
 */
interface UserInfo {
  /** 用户全名 */
  fullName: string;
  /** 头像 URL */
  avatarUrl: string;
  /** 电子邮箱 */
  email: string;
  /** 个人介绍 */
  bio: string;
}

/**
 * 全局状态管理接口
 */
interface SiteState {
  /** 站点配置数据 */
  config: SiteConfig;
  /** 当前登录用户信息，未登录为 null */
  user: UserInfo | null;
  /** 加载状态 */
  loading: boolean;
  /** 是否已完成初始化 */
  isInitialized: boolean;
  /**
   * 从数据库获取最新配置
   * @returns {Promise<void>}
   */
  fetchConfig: () => Promise<void>;
  /**
   * 获取当前登录用户信息
   * @returns {Promise<void>}
   */
  fetchUser: () => Promise<void>;
  /**
   * 更新本地配置状态
   * @param {string} key - 配置键
   * @param {string} value - 配置值
   * @returns {void}
   */
  updateConfig: (key: string, value: string) => void;
  /**
   * 更新本地用户信息
   * @param {Partial<UserInfo>} info - 用户信息片段
   * @returns {void}
   */
  updateUser: (info: Partial<UserInfo>) => void;
  /**
   * 初始化配置、用户信息和实时监听
   * @returns {() => void} - 返回清理订阅的函数
   */
  initConfig: () => () => void;
}

/**
 * 设置站点配置的实时订阅
 * @param {() => SiteState} get - Zustand get 方法
 * @param {(state: Partial<SiteState> | ((state: SiteState) => Partial<SiteState>)) => void} set - Zustand set 方法
 * @returns {RealtimeChannel} - Supabase 频道对象
 */
const setupConfigSubscription = (get: () => SiteState, set: (state: Partial<SiteState> | ((state: SiteState) => Partial<SiteState>)) => void) => {
  return supabase
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
};

/**
 * 设置用户认证状态的订阅
 * @param {() => SiteState} get - Zustand get 方法
 * @param {(state: Partial<SiteState> | ((state: SiteState) => Partial<SiteState>)) => void} set - Zustand set 方法
 * @returns {Object} - 订阅对象包装
 */
const setupAuthSubscription = (get: () => SiteState, set: (state: Partial<SiteState> | ((state: SiteState) => Partial<SiteState>)) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
      const user = session?.user;
      if (user) {
        get().updateUser({
          fullName: user.user_metadata?.full_name || '管理员',
          avatarUrl: user.user_metadata?.avatar_url || '',
          email: user.email || '',
          bio: user.user_metadata?.bio || '',
        });
      }
    } else if (event === 'SIGNED_OUT') {
      set({ user: null });
    }
  });
};

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
            const configMap = data.reduce<Record<string, string>>((acc, curr) => {
              acc[curr.key] = curr.value;
              return acc;
            }, {});
            set({ config: configMap, loading: false });
          }
        } catch (_error) {
          console.error('获取站点配置失败:', _error);
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
                bio: user.user_metadata?.bio || '',
              }
            });
          }
        } catch (_error) {
          console.error('获取用户信息失败:', _error);
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
        
        if (!isInitialized) {
          set({ isInitialized: true });
          fetchConfig();
          fetchUser();
        }

        const configChannel = setupConfigSubscription(get, set);
        const { data: { subscription } } = setupAuthSubscription(get, set);

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
