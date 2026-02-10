# Iceuu Blog - Next.js 现代博客系统

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

一个基于 **Next.js 15**、**React 19** 和 **Supabase** 构建的高性能、现代化的个人博客系统。采用 Headless CMS 设计理念，支持 GitHub 图床自动上传。

---

## 🚀 核心特性

### 🎨 前台展示 (Public Site)
- **现代响应式 UI**: 基于 **Tailwind CSS 4** 构建，极简设计，完美适配移动端。
- **高性能渲染**: 结合 Next.js App Router 的 Server Components，提供极致的加载体验。
- **SEO 优化**: 动态元数据生成，支持 Open Graph 和 Twitter Card。
- **交互功能**:
  - 精选文章轮播 (`FeaturedCarousel`)
  - 动态图标云展示 (`IconCloud`)
  - 实时搜索与侧边栏导航
  - 文章分类与标签筛选

### 🛠️ 管理后台 (Admin Dashboard)
- **内容管理**: 
  - 支持 **Markdown** (`md-editor-rt`) 深度编辑。
  - 完善的文章生命周期：草稿箱、发布、回收站。
  - 批量操作支持（批量发布、批量删除、批量恢复）。
- **媒体管理**: 
  - **GitHub 图床**: 自动上传图片至 GitHub 仓库，集成 CDN 加速。
  - 媒体库预览、搜索与管理。
- **系统设置**:
  - 站点配置：动态修改站点标题、副标题、社交链接等。
  - 安全设置：账号密码管理，Supabase Auth 认证。
  - 外部集成：GitHub API 配置，实现自动化图床。

---

## 🛠️ 技术栈

| 领域 | 技术 |
| :--- | :--- |
| **核心框架** | Next.js 15 (App Router), React 19 |
| **编程语言** | TypeScript |
| **样式方案** | Tailwind CSS 4, Lucide React (图标库) |
| **数据存储** | Supabase (PostgreSQL) |
| **身份认证** | Supabase Auth |
| **状态管理** | Zustand |
| **图床方案** | GitHub API |
| **测试框架** | Vitest |

---

## 📁 项目结构

```bash
.
├── app/                      # Next.js App Router 路由
│   ├── admin/              # 管理后台 (Auth Guard 保护)
│   ├── api/                # 后端 API 接口 (Route Handlers)
│   ├── blog/               # 前台文章详情
│   ├── category/            # 分类浏览
│   └── search/              # 全站搜索
├── components/              # UI 组件库
│   ├── admin/              # 后台业务组件
│   ├── home/               # 前台模块化组件
│   ├── layout/             # 布局容器 (Header, Footer)
│   └── ui/                 # 基础原子组件 (Button, Input, Card)
├── lib/                     # 核心逻辑与工具
│   ├── services/           # Supabase/API 服务层
│   ├── store/              # Zustand 状态存储
│   ├── supabase.ts         # Supabase 客户端
│   └── github.ts           # GitHub 上传逻辑
├── types/                  # 全局类型定义
└── public/                 # 静态资源与 SVG 图标
```

---

## 🏃 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/xiaoleng-ros/Iceuu_blog.git
cd Iceuu_blog
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 并重命名为 `.env.local`，填写相关配置：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目地址
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名访问 Key
- `GITHUB_TOKEN`: GitHub 图床所需的 Personal Access Token

### 4. 运行开发服务器
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000) 查看结果。

---

## ❤️ 特别鸣谢

本项目的前台界面设计灵感与风格参考了以下优秀开源项目：

- **宇阳 (Liu Yuyang)**: [liuyuyang.net](https://liuyuyang.net/)
- **ThriveX-Blog**: [LiuYuYang01/ThriveX-Blog](https://github.com/LiuYuYang01/ThriveX-Blog)

感谢作者的开源精神，为本项目提供了极佳的设计参考。

---

## 📄 许可证

基于 [MIT License](./LICENSE) 开源。
