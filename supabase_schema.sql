-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 博客表 (blogs)
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL, -- 标题
    content TEXT NOT NULL, -- 内容
    excerpt TEXT, -- 摘要
    cover_image TEXT, -- 封面图 URL
    category TEXT, -- 分类
    tags TEXT[], -- 标签数组
    images TEXT[], -- 内容中使用的图片 URL 数组
    draft BOOLEAN DEFAULT false, -- 是否为草稿
    is_deleted BOOLEAN DEFAULT false, -- 是否已删除（回收站）
    deleted_at TIMESTAMP WITH TIME ZONE, -- 删除时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 创建时间
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 更新时间
);

-- 2. 媒体表 (media) - 存储上传到 GitHub 的图片元数据
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL, -- 文件名
    url TEXT NOT NULL, -- GitHub 原始 URL 或 CDN URL
    path TEXT NOT NULL, -- GitHub 仓库中的路径
    size INTEGER, -- 文件大小（字节）
    type TEXT CHECK (type IN ('blog', 'post', 'avatar', 'site', 'other')), -- 使用类型
    blog_id UUID REFERENCES blogs(id) ON DELETE SET NULL, -- 关联的博客 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 上传时间
);

-- 3. 网站配置表 (site_config) - 键值对存储结构
CREATE TABLE IF NOT EXISTS site_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE, -- 配置键名 (如 site_title)
    value TEXT, -- 配置内容
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 更新时间
);

-- 4. 分类表 (categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- 分类名称
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 创建时间
);

-- 5. 标签表 (tags)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- 标签名称
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 创建时间
);

-- 6. 保活表 (keepalive) - 用于防止 Supabase 实例因不活跃而自动暂停
CREATE TABLE IF NOT EXISTS keepalive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    heartbeat TEXT, -- 心跳内容
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 记录时间
);

-- -------------------------------------------------------
-- 索引设置
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_draft ON blogs(draft);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- -------------------------------------------------------
-- 行级安全性 (RLS) 设置
-- -------------------------------------------------------

-- 启用各表的 RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE keepalive ENABLE ROW LEVEL SECURITY;

-- 博客表策略
CREATE POLICY "公众可以查看已发布的博客" ON blogs FOR SELECT USING (draft = false);
CREATE POLICY "管理员可以查看所有博客" ON blogs FOR SELECT TO authenticated USING (true);
CREATE POLICY "管理员可以管理博客" ON blogs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 媒体表策略
CREATE POLICY "公众可以查看媒体记录" ON media FOR SELECT USING (true);
CREATE POLICY "管理员可以管理媒体" ON media FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 网站配置策略
CREATE POLICY "公众可以查看网站配置" ON site_config FOR SELECT USING (true);
CREATE POLICY "管理员可以管理网站配置" ON site_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 分类/标签策略
CREATE POLICY "公众可以查看分类" ON categories FOR SELECT USING (true);
CREATE POLICY "管理员可以管理分类" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "公众可以查看标签" ON tags FOR SELECT USING (true);
CREATE POLICY "管理员可以管理标签" ON tags FOR ALL TO authenticated USING (true);

-- 保活表策略
CREATE POLICY "认证用户可管理保活数据" ON keepalive FOR ALL TO authenticated USING (true);

-- -------------------------------------------------------
-- 初始数据填充
-- -------------------------------------------------------

-- 初始网站配置
INSERT INTO site_config (key, value) VALUES
('site_title', '我的个人博客'),
('site_description', '基于 Next.js 和 Supabase 构建的技术与生活分享平台'),
('site_keywords', '技术, 编程, Next.js, Supabase, 生活'),
('footer_text', '© 2024 赵阿卷. 保留所有权利.'),
('home_background_url', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')
ON CONFLICT (key) DO NOTHING;
