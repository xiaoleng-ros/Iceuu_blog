# 开发指南

本文档提供 Iceuu Blog 项目的开发指南，帮助开发者快速上手和参与项目开发。

## 目录

- [环境准备](#环境准备)
- [项目结构](#项目结构)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 环境准备

### 必需软件

- **Node.js**: >= 20.x
- **npm**: >= 9.x 或 **pnpm**: >= 8.x
- **Git**: >= 2.x

### 环境配置

1. 克隆项目
```bash
git clone <your-repo-url>
cd iceuu-blog
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量

复制 `.env.example` 为 `.env.local`：
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

4. 初始化数据库

在 Supabase SQL 编辑器中运行 `supabase_schema.sql`。

## 项目结构

```
iceuu-blog/
├── app/                      # Next.js App Router
│   ├── admin/              # 管理后台
│   ├── api/                # API 路由
│   ├── blog/               # 博客页面
│   ├── category/            # 分类页面
│   ├── search/              # 搜索页面
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── admin/              # 后台组件
│   ├── blog/               # 博客组件
│   ├── home/               # 首页组件
│   ├── layout/             # 布局组件
│   └── ui/                 # UI 基础组件
├── lib/                    # 核心库
│   ├── config/             # 配置文件
│   ├── constants/           # 常量定义
│   ├── middleware/         # 中间件
│   ├── services/           # 服务层
│   ├── api/               # API 工具
│   ├── hooks/             # 自定义 Hooks
│   ├── store/             # 状态管理
│   ├── supabase.ts         # Supabase 客户端
│   ├── github.ts           # GitHub API
│   └── utils.ts           # 工具函数
├── types/                  # TypeScript 类型定义
│   ├── database.ts         # 数据库类型
│   ├── api.ts             # API 类型
│   ├── components.ts       # 组件类型
│   └── env.d.ts           # 环境变量类型
├── public/                 # 静态资源
├── docs/                   # 项目文档
├── .env.example            # 环境变量示例
├── package.json            # 项目配置
├── tsconfig.json          # TypeScript 配置
├── next.config.ts         # Next.js 配置
└── supabase_schema.sql   # 数据库初始化脚本
```

## 开发流程

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
```

### 运行生产服务器

```bash
npm start
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

## 代码规范

### 命名规范

- **文件名**: 使用 PascalCase (如 `BlogForm.tsx`)
- **组件名**: 使用 PascalCase (如 `export default function BlogForm`)
- **函数名**: 使用 camelCase (如 `function getBlogs`)
- **常量名**: 使用 UPPER_SNAKE_CASE (如 `const API_URL`)
- **类型名**: 使用 PascalCase (如 `interface BlogProps`)

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 使用分号
- 每行最大长度 100 字符
- 函数必须有 JSDoc 注释

### 注释规范

```typescript
/**
 * 函数功能描述
 * @param param1 参数1描述
 * @param param2 参数2描述
 * @returns 返回值描述
 */
function exampleFunction(param1: string, param2: number): boolean {
  // 实现
}
```

### Git 提交规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**:
```
feat (blog): 添加博客草稿自动保存功能

- 使用 localStorage 持久化草稿
- 每 30 秒自动保存一次
- 页面加载时恢复上次草稿

Closes #123
```

## 测试指南

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm test:watch

# 生成测试覆盖率报告
npm test:coverage
```

### 编写测试

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn 函数', () => {
  it('应该正确合并类名', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('应该处理条件类名', () => {
    expect(cn('foo', false && 'bar')).toBe('foo');
  });
});
```

## 部署指南

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

### Cloudflare Pages 部署

```bash
# 构建并部署到 Cloudflare Pages
npm run pages:build
```

## 常见问题

### 环境变量未生效

确保 `.env.local` 文件存在且配置正确。重启开发服务器。

### 数据库连接失败

检查 Supabase URL 和 Anon Key 是否正确。确认 Supabase 项目状态。

### 图片上传失败

检查 GitHub Token 权限和仓库配置。确认 Token 有 `repo` 权限。

### TypeScript 类型错误

运行 `npx tsc --noEmit` 查看详细错误信息。

## 开发技巧

### 使用 VS Code

推荐安装以下扩展：
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense

### 调试

1. 在浏览器中打开开发者工具
2. 使用 `console.log` 或 `debugger`
3. 使用 VS Code 调试器

### 性能优化

- 使用 Next.js Image 组件优化图片
- 使用动态导入减少初始包大小
- 使用 React.memo 优化组件渲染

## 获取帮助

如有问题，请：
1. 查看项目文档
2. 搜索已有 Issues
3. 创建新的 Issue

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

感谢您的贡献！
