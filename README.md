# Next.js 现代博客系统 (Headless CMS 风格)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

一个基于 Next.js 15、React 19 和 Supabase 构建的高性能、现代化的个人博客系统。采用 Headless CMS 设计理念，支持 GitHub 图床自动上传，实现"极简写作，极速发布"。

---

## 核心特性

### 前台展示 (Public Site)
- **现代响应式 UI**: 基于 Tailwind CSS 4 构建，适配各种屏幕尺寸
- **高性能渲染**: 利用 Next.js 的 ISR (增量静态再生) 和 Server Components，提供极致的加载速度
- **动态元数据**: 自动根据文章内容和站点配置生成 SEO 友好的元数据
- **功能模块**:
  - 精选文章轮播 (`FeaturedCarousel`)
  - 交互式图标云 (`IconCloud`)
  - 响应式侧边栏与实时搜索
  - 文章分页与分类浏览

### 管理后台 (Admin Dashboard)
- **全功能编辑器**: 支持 `Markdown (md-editor-rt)` 和 `富文本` 多种编辑模式
- **GitHub 自动图床**: 拖拽上传图片至 GitHub 仓库，自动通过 CDN 加速访问
- **安全认证**: 集成 Supabase Auth，确保后台访问安全
- **站点配置**: 无需修改代码，即可在后台动态更新站点名称、SEO 描述、社交链接等
- **内容管理**: 支持文章草稿、回收站、分类管理等功能

---

## 技术栈

| 领域 | 技术 |
| :--- | :--- |
| **框架** | Next.js 15 (App Router), React 19 |
| **语言** | TypeScript |
| **样式** | Tailwind CSS 4, Lucide React (图标) |
| **数据库** | Supabase (PostgreSQL) |
| **认证** | Supabase Auth |
| **存储** | GitHub API (图床) |
| **编辑器** | md-editor-rt, Vditor, react-quill-new |
| **工具库** | Axios, date-fns, clsx, tailwind-merge, Zustand |

---

## 项目结构

```bash
.
├── app/                      # Next.js App Router 路由
│   ├── admin/              # 管理后台 (身份验证保护)
│   ├── api/                # 后端 API 接口
│   ├── blog/               # 博客详情页
│   ├── category/            # 分类页面
│   ├── search/              # 搜索结果页
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── globals.css          # 全局样式
├── components/              # 可复用 React 组件
│   ├── admin/              # 后台专用组件
│   ├── home/               # 首页模块化组件
│   ├── layout/             # 全局布局组件
│   └── ui/                 # 基础 UI 原子组件
├── lib/                     # 核心库与工具类
│   ├── config/             # 配置文件
│   ├── constants/           # 常量定义
│   ├── middleware/         # 中间件
│   ├── services/           # 服务层
│   ├── api/               # API 工具
│   ├── hooks/             # 自定义 Hooks
│   ├── store/             # 状态管理
│   ├── supabase.ts         # Supabase 客户端配置
│   ├── github.ts           # GitHub 文件上传逻辑
│   └── utils.ts           # 工具函数
├── types/                  # TypeScript 类型定义
│   ├── database.ts         # 数据库类型
│   ├── api.ts             # API 接口类型
│   ├── components.ts       # 组件 Props 类型
│   └── env.d.ts           # 环境变量类型
├── stores/                 # 状态管理
├── docs/                   # 项目文档
│   ├── DEVELOPMENT.md      # 开发指南
│   ├── API.md             # API 文档
│   └── DATABASE.md         # 数据库架构文档
├── public/                 # 静态资源
├── .env.example            # 环境变量示例
├── package.json            # 项目配置
├── tsconfig.json          # TypeScript 配置
├── next.config.ts         # Next.js 配置
├── eslint.config.mjs      # ESLint 配置
├── .prettierrc.json       # Prettier 配置
├── vitest.config.ts       # Vitest 测试配置
└── supabase_schema.sql   # 数据库初始化 SQL 脚本
```

---

## 快速开始

### 1. 克隆与安装

```bash
git clone <your-repo-url>
cd iceuu-blog
npm install
```

### 2. 环境配置

复制 `.env.example` 为 `.env.local` 并填写相关参数：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 填写配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# GitHub 图床配置
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-image-repo-name
GITHUB_BRANCH=main

# 可选配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 数据库准备

在 Supabase SQL 编辑器中运行项目根目录下的 `supabase_schema.sql`，初始化数据库表结构和默认数据。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可预览。

---

## 文档

- **[开发指南](./docs/DEVELOPMENT.md)** - 详细的开发流程和代码规范
- **[API 文档](./docs/API.md)** - 完整的 API 接口说明
- **[数据库架构](./docs/DATABASE.md)** - 数据库表结构和关系说明

---

## 开发脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行生产服务器
npm start

# 代码检查
npm run lint

# 代码格式化
npm run format

# 格式检查
npm run format:check

# 运行测试
npm test

# 构建 Cloudflare Pages
npm run pages:build
```

---

## 部署

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

### Cloudflare Pages 部署

```bash
npm run pages:build
```

---

## 测试

项目使用 Vitest 和 Testing Library 进行测试：

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm test:watch

# 生成测试覆盖率报告
npm test:coverage
```

---

## 代码规范

项目遵循以下规范：

- **命名规范**:
  - 文件名: PascalCase (如 `BlogForm.tsx`)
  - 组件名: PascalCase (如 `export default function BlogForm`)
  - 函数名: camelCase (如 `function getBlogs`)
  - 常量名: UPPER_SNAKE_CASE (如 `const API_URL`)

- **代码风格**:
  - 使用 2 空格缩进
  - 使用单引号
  - 使用分号
  - 每行最大长度 100 字符

- **Git 提交规范**:
  - 遵循 Conventional Commits 规范
  - 格式: `<type>(<scope>): <subject>`
  - 类型: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 安全性

- 使用 Supabase Auth 进行身份验证
- 行级安全性 (RLS) 保护数据库访问
- 环境变量敏感信息不提交到代码库
- HTTPS 加密传输

---

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

感谢您的贡献！

---

## 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

---

## 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [md-editor-rt](https://github.com/imzbf/md-editor-rt)

---

## 故障排查

### 常见问题

**Q: 环境变量未生效**
A: 确保 `.env.local` 文件存在且配置正确。重启开发服务器。

**Q: 数据库连接失败**
A: 检查 Supabase URL 和 Anon Key 是否正确。确认 Supabase 项目状态。

**Q: 图片上传失败**
A: 检查 GitHub Token 权限和仓库配置。确认 Token 有 `repo` 权限。

**Q: TypeScript 类型错误**
A: 运行 `npx tsc --noEmit` 查看详细错误信息。

---

## 获取帮助

如有问题，请：

1. 查看项目文档
2. 搜索已有 Issues
3. 创建新的 Issue

---

## 版本历史

- **v1.0.0** - 初始版本发布
  - 完整的博客系统功能
  - 管理后台
  - GitHub 图床集成
  - 响应式设计
