# 数据库架构文档

本文档描述 Iceuu Blog 使用的 Supabase PostgreSQL 数据库架构。

## 目录

- [概述](#概述)
- [表结构](#表结构)
- [索引](#索引)
- [安全策略](#安全策略)
- [数据关系](#数据关系)
- [迁移指南](#迁移指南)

## 概述

数据库使用 PostgreSQL 作为后端，通过 Supabase 提供托管服务。采用行级安全性（RLS）确保数据安全。

### 主要特性

- **UUID 主键**: 所有表使用 UUID 作为主键
- **时间戳**: 自动记录创建和更新时间
- **软删除**: 支持回收站功能
- **行级安全**: 细粒度的访问控制
- **数组类型**: 使用 PostgreSQL 数组存储标签

## 表结构

### blogs（博客文章表）

存储博客文章的主要信息。

| 字段名 | 类型 | 约束 | 说明 |
|---------|------|--------|------|
| id | UUID | PRIMARY KEY | 博客唯一标识 |
| title | TEXT | NOT NULL | 文章标题 |
| content | TEXT | NOT NULL | 文章内容（Markdown/HTML） |
| excerpt | TEXT | | 文章摘要 |
| cover_image | TEXT | | 封面图片 URL |
| category | TEXT | NOT NULL, CHECK | 文章分类 |
| tags | TEXT[] | DEFAULT ARRAY[]::TEXT[] | 标签数组 |
| draft | BOOLEAN | DEFAULT true | 是否为草稿 |
| is_deleted | BOOLEAN | DEFAULT false | 是否已删除（软删除） |
| deleted_at | TIMESTAMP WITH TIME ZONE | | 删除时间 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | | 更新时间 |

**分类约束**:
```sql
CHECK (category IN ('生活边角料', '情绪随笔', '干货分享', '成长复盘'))
```

### media（媒体文件表）

存储上传的媒体文件信息。

| 字段名 | 类型 | 约束 | 说明 |
|---------|------|--------|------|
| id | UUID | PRIMARY KEY | 媒体唯一标识 |
| filename | TEXT | NOT NULL | 原始文件名 |
| url | TEXT | NOT NULL | 文件访问 URL |
| path | TEXT | NOT NULL | 文件存储路径 |
| size | BIGINT | NOT NULL | 文件大小（字节） |
| type | TEXT | NOT NULL, CHECK | 文件类型 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 上传时间 |

**类型约束**:
```sql
CHECK (type IN ('avatar', 'post', 'site', 'other', 'blog'))
```

### site_config（站点配置表）

存储站点的全局配置信息。

| 字段名 | 类型 | 约束 | 说明 |
|---------|------|--------|------|
| id | UUID | PRIMARY KEY | 配置唯一标识 |
| key | TEXT | NOT NULL, UNIQUE | 配置键 |
| value | TEXT | NOT NULL | 配置值 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | | 更新时间 |

**常用配置键**:
- `site_name`: 站点名称
- `site_title`: 站点标题
- `site_description`: 站点描述
- `site_keywords`: 站点关键词
- `avatar_url`: 管理员头像 URL
- `github_url`: GitHub 链接
- `gitee_url`: Gitee 链接
- `qq_url`: QQ 链接
- `wechat_url`: 微信链接
- `douyin_url`: 抖音链接
- `home_background_url`: 首页背景图 URL
- `footer_text`: 页脚文本

### categories（分类表）

存储文章分类信息。

| 字段名 | 类型 | 约束 | 说明 |
|---------|------|--------|------|
| id | UUID | PRIMARY KEY | 分类唯一标识 |
| name | TEXT | NOT NULL, UNIQUE | 分类名称 |
| slug | TEXT | NOT NULL, UNIQUE | 分类 URL 友好标识 |
| description | TEXT | | 分类描述 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |

**默认分类**:
- 生活边角料 (`life`)
- 情绪随笔 (`mood`)
- 干货分享 (`knowledge`)
- 成长复盘 (`growth`)

### tags（标签表）

存储文章标签信息。

| 字段名 | 类型 | 约束 | 说明 |
|---------|------|--------|------|
| id | UUID | PRIMARY KEY | 标签唯一标识 |
| name | TEXT | NOT NULL, UNIQUE | 标签名称 |
| slug | TEXT | NOT NULL, UNIQUE | 标签 URL 友好标识 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |

## 索引

为提高查询性能，在以下字段上创建索引：

### blogs 表索引

```sql
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_draft ON blogs(draft);
CREATE INDEX idx_blogs_is_deleted ON blogs(is_deleted);
```

### media 表索引

```sql
CREATE INDEX idx_media_type ON media(type);
```

### site_config 表索引

```sql
CREATE INDEX idx_site_config_key ON site_config(key);
```

## 安全策略

使用 PostgreSQL 行级安全性（RLS）实现细粒度的访问控制。

### blogs 表策略

**公开访问策略**:
```sql
CREATE POLICY "允许公开访问博客" ON blogs
  FOR SELECT
  USING (NOT draft AND NOT is_deleted);
```

**认证用户策略**:
```sql
CREATE POLICY "允许认证用户创建博客" ON blogs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户更新博客" ON blogs
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户删除博客" ON blogs
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
```

### media 表策略

**公开访问策略**:
```sql
CREATE POLICY "允许公开访问媒体" ON media
  FOR SELECT
  USING (true);
```

**认证用户策略**:
```sql
CREATE POLICY "允许认证用户上传媒体" ON media
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户删除媒体" ON media
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
```

### site_config 表策略

```sql
CREATE POLICY "允许公开访问站点配置" ON site_config
  FOR SELECT
  USING (true);

CREATE POLICY "允许认证用户更新站点配置" ON site_config
  FOR ALL
  USING (auth.uid() IS NOT NULL);
```

## 数据关系

### ER 图

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   blogs    │         │   media     │         │ site_config  │
├─────────────┤         ├─────────────┤         ├──────────────┤
│ id (PK)    │         │ id (PK)     │         │ key (UNIQUE) │
│ title       │         │ filename     │         │ value        │
│ content     │         │ url          │         └──────────────┘
│ category   │         │ path         │
│ tags[]     │         │ size         │
│ draft       │         │ type         │
│ is_deleted  │         └─────────────┘
│ created_at │
└─────────────┘

┌─────────────┐         ┌─────────────┐
│ categories │         │    tags     │
├─────────────┤         ├─────────────┤
│ id (PK)    │         │ id (PK)     │
│ name        │         │ name        │
│ slug        │         │ slug        │
│ description │         └─────────────┘
└─────────────┘
```

### 关系说明

- **blogs.tags** → **tags.name**: 多对多关系（通过数组实现）
- **blogs.category** → **categories.name**: 多对一关系
- **blogs.cover_image** → **media.url**: 多对一关系
- **media.type**: 枚举值，不直接关联其他表

## 迁移指南

### 添加新字段

```sql
ALTER TABLE blogs ADD COLUMN new_field TEXT;
```

### 添加新约束

```sql
ALTER TABLE blogs
  ADD CONSTRAINT check_new_field
  CHECK (new_field IN ('value1', 'value2'));
```

### 创建新表

```sql
CREATE TABLE new_table (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 更新触发器

```sql
CREATE OR REPLACE FUNCTION update_new_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_new_table_updated_at
  BEFORE UPDATE ON new_table
  FOR EACH ROW EXECUTE FUNCTION update_new_table_updated_at();
```

## 备份与恢复

### 备份数据库

使用 Supabase 控制台：
1. 进入 Database → Backups
2. 点击 "Create backup"
3. 等待备份完成

### 恢复数据库

使用 Supabase 控制台：
1. 进入 Database → Backups
2. 选择备份点
3. 点击 "Restore"

## 性能优化建议

1. **定期清理**: 定期清理回收站中的文章
2. **索引优化**: 根据查询模式调整索引
3. **连接池**: 使用连接池管理数据库连接
4. **查询优化**: 避免全表扫描，使用适当的索引

## 监控与维护

### 监控指标

- 查询性能
- 表大小增长
- 连接数
- 慢查询日志

### 维护任务

- 定期 VACUUM 和 ANALYZE
- 索引重建
- 统计信息更新

## 安全建议

1. **定期更新**: 保持 Supabase 和 PostgreSQL 版本最新
2. **访问控制**: 定期审查 RLS 策略
3. **敏感数据**: 避免在数据库中存储敏感信息
4. **备份验证**: 定期验证备份的完整性

## 故障排查

### 常见问题

**Q: 查询速度慢**
A: 检查索引是否正确创建，使用 EXPLAIN 分析查询计划。

**Q: 插入失败**
A: 检查约束是否冲突，验证数据类型是否正确。

**Q: RLS 策略不生效**
A: 确认 RLS 已启用，检查策略条件是否正确。

## 版本历史

- **v1.0.0**: 初始数据库架构
