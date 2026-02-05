-- =====================================================
-- Supabase 数据库重建脚本
-- 项目: Iceuu_blog - 萌系博客系统
-- 功能: 创建博客系统所需的全部表、索引、触发器、策略和默认数据
-- =====================================================

-- =====================================================
-- 第一部分: 清理现有数据（可选，用于完全重建）
-- 警告: 执行此部分将删除所有数据！
-- =====================================================

-- 删除现有表（按依赖顺序逆序删除）
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.blogs CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.site_config CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_admin_user() CASCADE;

-- =====================================================
-- 第二部分: 启用扩展
-- =====================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用 pgcrypto 扩展（用于密码加密）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 第三部分: 创建通用函数
-- =====================================================

/**
 * 功能: 自动更新 updated_at 字段的触发器函数
 * 参数: 无（通过 NEW 访问触发器上下文）
 * 返回值: 更新后的记录
 */
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 第四部分: 创建数据表
-- =====================================================

-- -----------------------------------------------------
-- 表1: users - 用户表（扩展 Supabase Auth 用户信息）
-- -----------------------------------------------------
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

COMMENT ON TABLE public.users IS '用户表，扩展 Supabase Auth 的用户信息';
COMMENT ON COLUMN public.users.id IS '用户ID，关联 auth.users';
COMMENT ON COLUMN public.users.username IS '用户名，唯一';
COMMENT ON COLUMN public.users.email IS '邮箱，唯一';
COMMENT ON COLUMN public.users.avatar_url IS '头像URL';
COMMENT ON COLUMN public.users.role IS '用户角色：admin-管理员, user-普通用户, editor-编辑';
COMMENT ON COLUMN public.users.is_active IS '账号是否激活';
COMMENT ON COLUMN public.users.last_login_at IS '最后登录时间';

-- -----------------------------------------------------
-- 表2: blogs - 博客文章表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blogs (
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

COMMENT ON TABLE public.blogs IS '博客文章表，存储所有博客内容';
COMMENT ON COLUMN public.blogs.title IS '文章标题';
COMMENT ON COLUMN public.blogs.content IS '文章内容（Markdown格式）';
COMMENT ON COLUMN public.blogs.excerpt IS '文章摘要';
COMMENT ON COLUMN public.blogs.cover_image IS '封面图片URL';
COMMENT ON COLUMN public.blogs.category IS '文章分类：生活边角料/情绪随笔/干货分享/成长复盘';
COMMENT ON COLUMN public.blogs.tags IS '标签数组';
COMMENT ON COLUMN public.blogs.draft IS '是否为草稿';
COMMENT ON COLUMN public.blogs.is_deleted IS '是否软删除';
COMMENT ON COLUMN public.blogs.deleted_at IS '删除时间（用于软删除）';

-- -----------------------------------------------------
-- 表3: media - 媒体文件表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('avatar', 'post', 'site', 'other', 'blog')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.media IS '媒体文件表，存储上传的文件信息';
COMMENT ON COLUMN public.media.filename IS '原始文件名';
COMMENT ON COLUMN public.media.url IS '访问URL';
COMMENT ON COLUMN public.media.path IS '存储路径';
COMMENT ON COLUMN public.media.size IS '文件大小（字节）';
COMMENT ON COLUMN public.media.type IS '文件类型：avatar-头像, post-文章图片, site-站点资源, other-其他, blog-博客相关';

-- -----------------------------------------------------
-- 表4: site_config - 站点配置表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.site_config IS '站点配置表，存储网站配置项';
COMMENT ON COLUMN public.site_config.key IS '配置键，唯一';
COMMENT ON COLUMN public.site_config.value IS '配置值';

-- -----------------------------------------------------
-- 表5: categories - 分类表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS '文章分类表';
COMMENT ON COLUMN public.categories.name IS '分类名称，唯一';
COMMENT ON COLUMN public.categories.slug IS 'URL友好的标识，唯一';
COMMENT ON COLUMN public.categories.description IS '分类描述';

-- -----------------------------------------------------
-- 表6: tags - 标签表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.tags IS '文章标签表';
COMMENT ON COLUMN public.tags.name IS '标签名称，唯一';
COMMENT ON COLUMN public.tags.slug IS 'URL友好的标识，唯一';

-- =====================================================
-- 第五部分: 创建索引
-- =====================================================

-- blogs 表索引
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_draft ON public.blogs(draft);
CREATE INDEX IF NOT EXISTS idx_blogs_is_deleted ON public.blogs(is_deleted);
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON public.blogs USING GIN(tags);

-- media 表索引
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);

-- site_config 表索引
CREATE INDEX IF NOT EXISTS idx_site_config_key ON public.site_config(key);

-- users 表索引
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =====================================================
-- 第六部分: 创建触发器
-- =====================================================

-- users 表更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- blogs 表更新时间触发器
DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
CREATE TRIGGER update_blogs_updated_at 
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- site_config 表更新时间触发器
DROP TRIGGER IF EXISTS update_site_config_updated_at ON public.site_config;
CREATE TRIGGER update_site_config_updated_at 
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 第七部分: 启用行级安全性（RLS）
-- =====================================================

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 第八部分: 创建访问策略（RLS Policies）
-- =====================================================

-- -----------------------------------------------------
-- users 表策略
-- -----------------------------------------------------

-- 允许公开查看用户基本信息
CREATE POLICY "允许公开查看用户基本信息" ON public.users
  FOR SELECT
  USING (true);

-- 允许用户更新自己的信息
CREATE POLICY "允许用户更新自己的信息" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 允许管理员管理所有用户
CREATE POLICY "允许管理员管理所有用户" ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------
-- blogs 表策略
-- -----------------------------------------------------

-- 允许公开访问已发布的博客（非草稿、未删除）
CREATE POLICY "允许公开访问博客" ON public.blogs
  FOR SELECT
  USING (NOT draft AND NOT is_deleted);

-- 允许认证用户查看所有博客（包括草稿）
CREATE POLICY "允许认证用户查看所有博客" ON public.blogs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 允许认证用户创建博客
CREATE POLICY "允许认证用户创建博客" ON public.blogs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 允许认证用户更新博客
CREATE POLICY "允许认证用户更新博客" ON public.blogs
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- 允许认证用户删除博客
CREATE POLICY "允许认证用户删除博客" ON public.blogs
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------
-- media 表策略
-- -----------------------------------------------------

-- 允许公开访问媒体
CREATE POLICY "允许公开访问媒体" ON public.media
  FOR SELECT
  USING (true);

-- 允许认证用户上传媒体
CREATE POLICY "允许认证用户上传媒体" ON public.media
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 允许认证用户删除媒体
CREATE POLICY "允许认证用户删除媒体" ON public.media
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------
-- site_config 表策略
-- -----------------------------------------------------

-- 允许公开访问站点配置
CREATE POLICY "允许公开访问站点配置" ON public.site_config
  FOR SELECT
  USING (true);

-- 允许认证用户更新站点配置
CREATE POLICY "允许认证用户更新站点配置" ON public.site_config
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------
-- categories 表策略
-- -----------------------------------------------------

-- 允许公开访问分类
CREATE POLICY "允许公开访问分类" ON public.categories
  FOR SELECT
  USING (true);

-- 允许认证用户管理分类
CREATE POLICY "允许认证用户管理分类" ON public.categories
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------
-- tags 表策略
-- -----------------------------------------------------

-- 允许公开访问标签
CREATE POLICY "允许公开访问标签" ON public.tags
  FOR SELECT
  USING (true);

-- 允许认证用户管理标签
CREATE POLICY "允许认证用户管理标签" ON public.tags
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 第九部分: 插入默认数据
-- =====================================================

-- -----------------------------------------------------
-- 插入默认分类
-- -----------------------------------------------------
INSERT INTO public.categories (name, slug, description) VALUES
  ('生活边角料', 'life', '记录生活中的点滴，分享日常的小确幸'),
  ('情绪随笔', 'mood', '分享心情和感悟，记录内心的声音'),
  ('干货分享', 'knowledge', '技术知识和经验分享，学习成长之路'),
  ('成长复盘', 'growth', '个人成长和反思，见证自己的蜕变')
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description;

-- -----------------------------------------------------
-- 插入默认站点配置
-- -----------------------------------------------------
INSERT INTO public.site_config (key, value) VALUES
  ('site_name', 'Iceuu Blog'),
  ('site_description', '一个萌系风格的个人博客'),
  ('site_author', '小冷'),
  ('site_logo', '/logo.png'),
  ('posts_per_page', '10'),
  ('enable_comments', 'true'),
  ('theme', 'default')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value;

-- =====================================================
-- 第十部分: 创建管理员账号
-- =====================================================

/**
 * 功能: 自动创建管理员用户
 * 默认账号: xiaoleng / 123456789
 * 邮箱: 1873048956@qq.com
 * 注意: 生产环境请修改默认密码！
 */
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 检查用户是否已存在
  SELECT id INTO new_user_id FROM auth.users WHERE email = '1873048956@qq.com';
  
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
      '1873048956@qq.com',
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
    VALUES (new_user_id, 'xiaoleng', '1873048956@qq.com', 'admin', true, NOW());
    
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
SELECT create_admin_user();

-- 删除创建管理员函数（安全考虑，可选）
-- DROP FUNCTION IF EXISTS create_admin_user();

-- =====================================================
-- 脚本执行完成
-- =====================================================

-- 验证表是否创建成功
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'blogs', COUNT(*) FROM public.blogs
UNION ALL
SELECT 'media', COUNT(*) FROM public.media
UNION ALL
SELECT 'site_config', COUNT(*) FROM public.site_config
UNION ALL
SELECT 'categories', COUNT(*) FROM public.categories
UNION ALL
SELECT 'tags', COUNT(*) FROM public.tags;
