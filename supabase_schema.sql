-- Supabase 数据库初始化脚本
-- 创建博客系统所需的所有表和约束

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 先创建更新时间触发器函数（供所有表使用）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 用户表（扩展 Supabase Auth 用户信息）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'editor')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建用户更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用用户表 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 用户表访问策略
CREATE POLICY "允许公开查看用户基本信息" ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "允许用户更新自己的信息" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "允许管理员管理所有用户" ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 博客文章表
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  category TEXT NOT NULL CHECK (category IN ('生活边角料', '情绪随笔', '干货分享', '成长复盘')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  draft BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 媒体文件表
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('avatar', 'post', 'site', 'other', 'blog')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 站点配置表
CREATE TABLE IF NOT EXISTS site_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_draft ON blogs(draft);
CREATE INDEX IF NOT EXISTS idx_blogs_is_deleted ON blogs(is_deleted);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);

-- 插入默认分类
INSERT INTO categories (name, slug, description) VALUES
  ('生活边角料', 'life', '记录生活中的点滴'),
  ('情绪随笔', 'mood', '分享心情和感悟'),
  ('干货分享', 'knowledge', '技术知识和经验分享'),
  ('成长复盘', 'growth', '个人成长和反思')
ON CONFLICT DO NOTHING;

-- 为其他表创建更新时间触发器（函数已在开头定义）
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全性（RLS）
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- 公开访问策略
CREATE POLICY "允许公开访问博客" ON blogs
  FOR SELECT
  USING (NOT draft AND NOT is_deleted);

CREATE POLICY "允许公开访问媒体" ON media
  FOR SELECT
  USING (true);

CREATE POLICY "允许公开访问站点配置" ON site_config
  FOR SELECT
  USING (true);

-- 认证用户访问策略
CREATE POLICY "允许认证用户创建博客" ON blogs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户更新博客" ON blogs
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户删除博客" ON blogs
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户上传媒体" ON media
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户删除媒体" ON media
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户更新站点配置" ON site_config
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 创建默认管理员账号
-- 用户名: xiaoleng
-- 密码: 123456789
-- 注意：请在生产环境中修改默认密码！
-- ============================================

-- 创建管理员用户（使用 Supabase Auth）
-- 注意：需要在 Supabase Dashboard 的 SQL 编辑器中执行以下步骤

-- 步骤 1: 创建 auth 用户（通过 Supabase Auth API 或 Dashboard 手动创建）
-- 由于密码需要加密，建议在 Supabase Dashboard 中手动创建用户：
-- 1. 进入 Authentication -> Users
-- 2. 点击 "Add user"
-- 3. 输入邮箱: xiaoleng@example.com
-- 4. 输入密码: 123456789
-- 5. 创建后复制用户的 UUID

-- 步骤 2: 在 public.users 表中插入管理员记录
-- 请将 'YOUR_USER_UUID' 替换为实际创建的用户 UUID
/*
INSERT INTO public.users (id, username, email, role, is_active, created_at)
VALUES (
  'YOUR_USER_UUID',  -- 从 Supabase Auth 获取的实际 UUID
  'xiaoleng',
  'xiaoleng@example.com',
  'admin',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;
*/

-- 或者使用函数自动创建（推荐在 Supabase Dashboard 中执行）
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 检查用户是否已存在
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'xiaoleng@example.com';
  
  IF new_user_id IS NULL THEN
    -- 创建 auth 用户
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      uuid_generate_v4(),
      'xiaoleng@example.com',
      crypt('123456789', gen_salt('bf')),  -- 使用 bcrypt 加密密码
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"xiaoleng"}',
      NOW(),
      NOW()
    )
    RETURNING id INTO new_user_id;
    
    -- 创建 public.users 记录
    INSERT INTO public.users (id, username, email, role, is_active, created_at)
    VALUES (new_user_id, 'xiaoleng', 'xiaoleng@example.com', 'admin', true, NOW());
    
    RAISE NOTICE '管理员账号创建成功: xiaoleng / 123456789';
  ELSE
    -- 更新为管理员权限
    UPDATE public.users 
    SET role = 'admin', is_active = true, username = 'xiaoleng'
    WHERE id = new_user_id;
    
    -- 更新密码
    UPDATE auth.users 
    SET encrypted_password = crypt('123456789', gen_salt('bf'))
    WHERE id = new_user_id;
    
    RAISE NOTICE '管理员账号已更新: xiaoleng / 123456789';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 执行创建管理员函数
-- SELECT create_admin_user();

-- 创建后请删除此函数（安全考虑）
-- DROP FUNCTION IF EXISTS create_admin_user();
