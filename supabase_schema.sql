-- Supabase 数据库初始化脚本
-- 创建博客系统所需的所有表和约束

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- 插入默认站点配置
INSERT INTO site_config (key, value) VALUES
  ('site_name', '小冷同学'),
  ('avatar_url', ''),
  ('intro', '欢迎来到我的博客'),
  ('site_title', '小冷同学的个人博客'),
  ('site_description', '基于 Next.js + Supabase 构建的个人博客系统'),
  ('site_keywords', '博客,Next.js,React,Supabase,个人博客'),
  ('site_start_date', '2024-01-01'),
  ('footer_text', '© 2024 小冷同学. All rights reserved.'),
  ('github_url', ''),
  ('gitee_url', ''),
  ('qq_url', ''),
  ('wechat_url', ''),
  ('douyin_url', ''),
  ('home_background_url', '')
ON CONFLICT DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
