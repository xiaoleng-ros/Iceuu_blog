# 🚀 Next.js 现代博客系统 (Headless CMS 风格)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

一个基于 **Next.js 15**、**React 19** 和 **Supabase** 构建的高性能、现代化的个人博客系统。采用 Headless CMS 设计理念，支持 GitHub 图床自动上传，实现“极简写作，极速发布”。

---

## ✨ 核心特性

### 🎨 前台展示 (Public Site)
-   **现代响应式 UI**: 基于 Tailwind CSS 4 构建，适配各种屏幕尺寸。
-   **高性能渲染**: 利用 Next.js 的 ISR (增量静态再生) 和 Server Components，提供极致的加载速度。
-   **动态元数据**: 自动根据文章内容和站点配置生成 SEO 友好的元数据。
-   **功能模块**: 
    -   精选文章轮播 (`FeaturedCarousel`)
    -   交互式图标云 (`IconCloud`)
    -   响应式侧边栏与实时搜索
    -   文章分页与分类浏览

### 🛠️ 管理后台 (Admin Dashboard)
-   **全功能编辑器**: 支持 `Markdown (Vditor/MdEditor)` 和 `富文本 (Quill)` 多种编辑模式。
-   **GitHub 自动图床**: 拖拽上传图片至 GitHub 仓库，自动通过 CDN 加速访问。
-   **安全认证**: 集成 Supabase Auth，确保后台访问安全。
-   **站点配置**: 无需修改代码，即可在后台动态更新站点名称、SEO 描述、社交链接等。
-   **内容管理**: 支持文章草稿、回收站、分类管理等功能。

---

## �️ 技术栈

| 领域 | 技术 |
| :--- | :--- |
| **框架** | Next.js 15 (App Router), React 19 |
| **语言** | TypeScript |
| **样式** | Tailwind CSS 4, Lucide React (图标) |
| **数据库** | Supabase (PostgreSQL) |
| **认证** | Supabase Auth |
| **存储** | GitHub API (图床) |
| **编辑器** | md-editor-rt, Vditor, react-quill-new |
| **工具库** | Axios, date-fns, clsx, tailwind-merge |

---

## 📁 项目结构

```bash
.
├── app/                # Next.js App Router 路由
│   ├── admin/          # 管理后台 (身份验证保护)
│   ├── api/            # 后端 API 接口
│   ├── blog/           # 博客详情页
│   └── search/         # 搜索结果页
├── components/         # 可复用 React 组件
│   ├── admin/          # 后台专用组件
│   ├── home/           # 首页模块化组件
│   ├── layout/         # 全局布局组件
│   └── ui/             # 基础 UI 原子组件
├── lib/                # 核心库与工具类
│   ├── supabase.ts     # Supabase 客户端配置
│   ├── github.ts       # GitHub 文件上传逻辑
│   └── hooks/          # 自定义 React Hooks
├── stores/             # 状态管理 (模拟 Store)
├── types/              # TypeScript 类型定义
└── supabase_schema.sql # 数据库初始化 SQL 脚本
```

---

## 🚀 快速开始

### 1. 克隆与安装
```bash
git clone <your-repo-url>
cd blog
npm install
```

### 2. 环境配置
复制 `.env.example` 为 `.env.local` 并填写相关参数：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目地址
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名 Key
- `GITHUB_TOKEN`: GitHub Personal Access Token
- `GITHUB_OWNER`: GitHub 用户名
- `GITHUB_REPO`: 用于存储图片的仓库名

### 3. 数据库准备
在 Supabase SQL 编辑器中运行项目根目录下的 `supabase_schema.sql`。

### 4. 启动开发服务器
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000) 即可预览。

---

## 🚢 部署

推荐部署至 **Vercel** 以获得最佳的 Next.js 支持。确保在 Vercel 控制台中配置好所有的环境变量。

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。
