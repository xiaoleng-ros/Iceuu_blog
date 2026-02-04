# API 文档

本文档描述 Iceuu Blog 的所有 API 接口。

## 目录

- [认证接口](#认证接口)
- [博客接口](#博客接口)
- [媒体接口](#媒体接口)
- [站点配置接口](#站点配置接口)
- [分类接口](#分类接口)
- [标签接口](#标签接口)

## 基础信息

### Base URL

```
http://localhost:3000/api
```

### 认证方式

大多数接口需要在请求头中携带认证令牌：

```http
Authorization: Bearer <access_token>
```

### 响应格式

所有接口返回统一的 JSON 格式：

**成功响应**:
```json
{
  "success": true,
  "data": <response_data>,
  "message": "操作成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "message": "错误描述",
    "code": "ERROR_CODE"
  }
}
```

**分页响应**:
```json
{
  "success": true,
  "data": [<item1>, <item2>],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 认证接口

### 用户登录

**接口地址**: `POST /auth/login`

**请求参数**:
```typescript
{
  email: string;
  password: string;
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "用户名",
      "avatar_url": "https://..."
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "...",
      "expires_in": 3600
    }
  }
}
```

**错误码**:
- `401`: 邮箱或密码错误
- `500`: 服务器错误

## 博客接口

### 获取博客列表

**接口地址**: `GET /blog`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |
| category | string | 否 | 分类筛选 |
| tag | string | 否 | 标签筛选 |
| status | string | 否 | 状态筛选：`published`、`draft`、`deleted` |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "文章标题",
      "excerpt": "文章摘要",
      "cover_image": "https://...",
      "category": "生活边角料",
      "tags": ["标签1", "标签2"],
      "draft": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 获取博客详情

**接口地址**: `GET /blog/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| id | string | 是 | 博客 ID |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "文章标题",
    "content": "<p>文章内容</p>",
    "excerpt": "文章摘要",
    "cover_image": "https://...",
    "category": "生活边角料",
    "tags": ["标签1", "标签2"],
    "draft": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 创建博客

**接口地址**: `POST /blog`

**认证**: 需要

**请求参数**:
```typescript
{
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: string;
  tags?: string[];
  draft?: boolean;
  images?: string[];
}
```

**分类限制**:
- `生活边角料`
- `情绪随笔`
- `干货分享`
- `成长复盘`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "文章标题",
    ...
  }
}
```

**错误码**:
- `400`: 参数验证失败
- `401`: 未授权
- `500`: 服务器错误

### 更新博客

**接口地址**: `PATCH /blog`

**认证**: 需要

**请求参数**:
```typescript
{
  ids: string[];
  updates: {
    title?: string;
    content?: string;
    category?: string;
    draft?: boolean;
    ...
  };
}
```

**响应示例**:
```json
{
  "success": true
}
```

### 删除博客

**接口地址**: `DELETE /blog`

**认证**: 需要

**请求参数**:
```typescript
{
  ids: string[];
  permanent?: boolean;
}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| permanent | boolean | 否 | 是否永久删除，默认 false（移入回收站） |

**响应示例**:
```json
{
  "success": true
}
```

## 媒体接口

### 上传文件

**接口地址**: `POST /upload`

**认证**: 需要

**请求格式**: `multipart/form-data`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| file | File | 是 | 上传的文件 |
| type | string | 是 | 文件类型：`avatar`、`post`、`site`、`other` |
| contextId | string | 否 | 上下文 ID（如文章 ID） |

**文件限制**:
- 最大大小: 5MB
- 支持类型: `image/jpeg`、`image/png`、`image/gif`、`image/webp`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "url": "https://raw.githubusercontent.com/...",
    "id": "uuid"
  }
}
```

**错误码**:
- `400`: 文件类型不支持或大小超限
- `401`: 未授权
- `500`: 上传失败

### 获取媒体列表

**接口地址**: `GET /media`

**认证**: 需要

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| type | string | 否 | 媒体类型筛选 |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "image.jpg",
      "url": "https://...",
      "path": "posts/20240101/uuid.jpg",
      "size": 102400,
      "type": "post",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 删除媒体

**接口地址**: `DELETE /media/{id}`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| id | string | 是 | 媒体 ID |

**响应示例**:
```json
{
  "success": true
}
```

## 站点配置接口

### 获取站点配置

**接口地址**: `GET /settings`

**认证**: 不需要

**响应示例**:
```json
{
  "success": true,
  "data": {
    "site_name": "赵阿卷",
    "site_title": "赵阿卷的个人博客",
    "site_description": "基于 Next.js + Supabase 构建的个人博客系统",
    "avatar_url": "https://...",
    "github_url": "https://github.com/...",
    ...
  }
}
```

### 更新站点配置

**接口地址**: `PATCH /settings`

**认证**: 需要

**请求参数**:
```typescript
{
  key: string;
  value: string;
}
```

**响应示例**:
```json
{
  "success": true
}
```

## 分类接口

### 获取分类列表

**接口地址**: `GET /categories`

**认证**: 不需要

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "生活边角料",
      "slug": "life",
      "description": "记录生活中的点滴"
    },
    ...
  ]
}
```

## 标签接口

### 获取标签列表

**接口地址**: `GET /tags`

**认证**: 不需要

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Next.js",
      "slug": "nextjs"
    },
    ...
  ]
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或令牌过期 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 速率限制

目前未实现速率限制，建议在生产环境中添加。

## 版本历史

- **v1.0.0**: 初始版本
