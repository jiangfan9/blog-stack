# 林间小栈

基于 [VitePress](https://vitepress.dev/zh/) 与 [vitepress-theme-teek](https://vp.teek.top/) 构建的个人博客。博客风格首页，支持分类、标签、归档、文章清单、本地搜索、深浅色切换等能力。

## 技术栈

| 依赖 | 版本 | 用途 |
| --- | --- | --- |
| VitePress | ^1.6.4 | 静态站点生成 |
| vitepress-theme-teek | ^1.6.3 | 博客主题与首页组件 |
| Node.js | 建议 18+ | 运行环境 |

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（热更新）
npm run docs:dev

# 构建到 docs/.vitepress/dist
npm run docs:build

# 本地预览构建产物
npm run docs:preview

# 运行测试（Mocha + Mochawesome，生成 mochawesome-report/mochawesome.json）
npm test
```

预览地址默认为 `http://localhost:4173/`。

测试为项目结构冒烟测试（检查配置、页面、文章 frontmatter、图片资源是否齐全），结果同时输出到控制台与 `mochawesome-report/` 目录下的 HTML / JSON 报告。

## 目录结构

```
blog-stack/
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts          # 站点与主题的全部配置
│   │   └── theme/
│   │       ├── index.ts        # 主题入口
│   │       └── style.css       # 自定义样式
│   ├── posts/                  # 文章（Markdown）
│   ├── public/images/          # 本地 SVG 素材（Banner、封面、头像、Logo）
│   ├── index.md                # 博客首页
│   ├── categories.md           # 分类页
│   ├── tags.md                 # 标签页
│   ├── archives.md             # 归档页
│   ├── articleOverview.md      # 文章清单页
│   ├── about.md                # 关于页
│   └── 404.md                  # 404 页面
├── package.json
└── README.md
```

## 写新文章

在 `docs/posts/` 下新建 `.md` 文件，并填写 frontmatter：

```yaml
---
title: 文章标题
date: 2026-11-24
categories:
  - 前端
tags:
  - JavaScript
  - VitePress
description: 文章摘要，用于首页卡片与 SEO
coverImg: /images/cover-1.svg
permalink: /posts/my-new-post
---
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `title` | 文章标题，用于列表与页面标题 |
| `date` | 发布日期，归档页按此排序 |
| `categories` | 分类数组，决定分类页分组 |
| `tags` | 标签数组，决定标签页分组 |
| `description` | 摘要，首页文章卡片展示 |
| `coverImg` | 封面图，可用 `/images/cover-1.svg` 至 `cover-6.svg` |
| `permalink` | 固定链接，格式 `/posts/xxx` |

分类与标签必须使用数组形式；功能页（分类、标签、归档等）会根据这些字段自动生成内容，无需手动维护列表。

## 常用配置

全部配置集中在 `docs/.vitepress/config.mts`：

| 配置项 | 说明 |
| --- | --- |
| `author` | 文章页默认作者 |
| `blogger` | 首页博主卡片（姓名、标语、头像、状态） |
| `banner` | 首页 Banner（背景图、打字机描述、轮播间隔） |
| `post` | 首页文章卡片样式与封面 |
| `page.pageSize` | 首页每页文章条数，当前为 12 |
| `topArticle` / `category` / `tag` / `friendLink` / `docAnalysis` | 首页右侧卡片 |
| `nav` / `footerGroup` / `footerInfo` | 导航栏与页脚 |
| `social` | 首页博主卡片下的社交图标，当前为空 |
| `themeConfig.socialLinks` | 顶部导航栏社交图标，当前为空 |

自定义样式位于 `docs/.vitepress/theme/style.css`。

## 注意事项

1. **Windows 盘符大小写**：Windows 下 Vite 产物的模块 id 与 VitePress 的 `srcDir` 盘符大小写可能不一致，导致构建时页面 chunk 匹配失败。`config.mts` 中已通过 `generateBundle` 插件将 `facadeModuleId` 盘符统一为 `process.cwd()` 的形式，请勿随意删除该插件。
2. **frontmatter 自动生成**：已设置 `autoFrontmatterOption.categories: false`。分类由文章 frontmatter 显式声明，避免插件把目录名（如 `@pages`）写入 YAML 导致解析失败。
3. **特殊字符转义**：早期迁移的文章中包含 `<T>`、`<key>`、`<? super T>` 等泛型/XML 写法，已统一转义为 HTML 实体，避免被 Vue 当作模板标签解析。编辑这些文章时请保留转义形式。
4. **图片素材**：本地 SVG 素材位于 `docs/public/images/`。早期迁移文章中失效的本地图片引用已替换为占位封面 `/images/cover-4.svg`。
5. **原始文章备份**：迁移前的 17 篇原始文章备份在 `D:\doc\markdown_backup_20261124`（含 `imgs/` 目录）。

## 历史变更

- 从零搭建 VitePress + Teek 博客，配置博客风格首页与分类、标签、归档、清单等功能页。
- 迁移 17 篇旧博客文章至 `docs/posts/`，规范化 frontmatter，删除初始示例文章。
- 首页分页由每页 6 条调整为 12 条。
- 作者名统一改为 JiangFan，移除首页博主卡片与顶部导航栏的 GitHub 图标，并隐藏残留的分隔竖线。
- 项目目录由 `blog` 重命名为 `blog-stack`。
