# Phase 4 开发计划：前台展示系统 (Public Portal)

本阶段将构建面向访客的博客前台，核心目标是实现高性能的 SSR/ISR 渲染、优雅的阅读体验以及完善的导航系统。

## 1. 公共布局组件 (Layout)
- **Header**: 响应式导航栏，包含 Logo、菜单（Home, Blog, About, Search）和移动端汉堡菜单。
- **Footer**: 展示版权信息、社交链接（从 `site_config` 获取）。
- **Layout Wrapper**: 创建 `components/layout/PublicLayout.tsx`，统一前台页面结构。

## 2. 首页开发 (Home Page)
- **ISR 渲染**: 使用 `revalidate` (如 60s) 缓存策略，确保首屏加载速度。
- **Hero Section**: 展示站点标题与简介。
- **Latest Posts**: 展示最新发布的博客列表（卡片式设计），包含封面、标题、摘要、日期。
- **Pagination**: 简单的“上一页/下一页”分页组件。

## 3. 博客详情页 (Blog Detail)
- **路由**: `/blog/[id]` (或 `/blog/[slug]`，目前数据库主要用 ID，建议优先支持 ID，后续可扩展 Slug)。
- **正文渲染**: 解析存储的 HTML 内容（由 Quill 生成），使用 `dangerouslySetInnerHTML` 并配合 Tailwind Typography (`prose`) 插件美化排版。
- **TOC (目录)**: 解析 HTML 中的 `h1-h3` 标签，自动生成侧边目录。
- **元数据展示**: 发布时间、分类、标签、作者。

## 4. 辅助页面 (Auxiliary Pages)
- **归档页 (`/blog`)**: 展示所有文章，支持按分类/标签筛选（Query Params）。
- **关于页 (`/about`)**: 静态页面，可从 `site_config` 或单独的 Markdown 文件读取内容。
- **搜索页 (`/search`)**: 基于标题和摘要的简单搜索结果页。

## 执行步骤
1.  **基础组件**: 开发 `Header` 和 `Footer`。
2.  **首页**: 修改 `app/page.tsx`，获取并展示最新博客。
3.  **详情页**: 创建 `app/blog/[id]/page.tsx`，实现文章详情渲染。
4.  **列表页**: 创建 `app/blog/page.tsx`，实现完整列表与筛选。
5.  **样式优化**: 引入 `@tailwindcss/typography` 插件优化文章阅读体验。

## 依赖补充
- 需要安装 `@tailwindcss/typography` 以支持优雅的富文本渲染。