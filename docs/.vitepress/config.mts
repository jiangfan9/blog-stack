import { defineConfig } from "vitepress";
import { defineTeekConfig } from "vitepress-theme-teek/config";

/**
 * Teek 主题配置
 * 文档：https://vp.teek.top/reference/config.html
 */
const teekConfig = defineTeekConfig({
  // 启用 Teek 主题与博客风格首页
  teekTheme: true,
  teekHome: true,
  vpHome: false,
  loading: "正在加载…",
  homeCardListPosition: "right",
  homeCardSort: ["topArticle", "category", "tag", "friendLink", "docAnalysis"],

  // 站点作者（文章页默认作者）
  author: {
    name: "JiangFan",
    link: "https://github.com/",
  },

  // 首页博主卡片
  blogger: {
    name: "JiangFan",
    slogan: "写代码，也写生活。记录一路上的思考与风景。",
    avatar: "/images/avatar.png",
    shape: "circle-rotate",
    circleBgImg: "/images/banner-2.svg",
    circleBgMask: true,
    circleSize: 108,
    status: {
      icon: "😎",
      size: 22,
      title: "正在摸鱼写代码",
    },
  },

  // 首页 Banner
  banner: {
    enabled: true,
    name: "林间小栈",
    bgStyle: "fullImg",
    imgSrc: ["/images/banner-1.png", "/images/banner-2.png", "/images/banner-3.png"],
    imgInterval: 12000,
    imgWaves: true,
    mask: true,
    maskBg: "rgba(8, 10, 24, 0.45)",
    descStyle: "types",
    description: [
      "保持好奇，保持耐心，保持记录。",
      "把踩过的坑写成路标，把微小的收获留成笔记。",
      "代码之外，还有生活。",
    ],
    typesInTime: 120,
    typesOutTime: 60,
    typesNextTime: 1600,
  },

  // 首页文章列表
  post: {
    postStyle: "card",
    coverImgMode: "full",
    excerptPosition: "top",
    showMore: true,
    moreLabel: "阅读全文 →",
    showCapture: true,
    splitSeparator: true,
    defaultCoverImg: [
      "/images/cover-1.svg",
      "/images/cover-2.svg",
      "/images/cover-3.svg",
      "/images/cover-4.svg",
      "/images/cover-5.svg",
      "/images/cover-6.svg",
    ],
  },
  page: {
    pageSize: 12,
    pagerCount: 5,
    background: true,
    hideOnSinglePage: false,
  },

  // 文章信息展示
  articleAnalyze: {
    showIcon: true,
    showInfo: true,
    showAuthor: true,
    showCreateDate: true,
    showUpdateDate: true,
    showCategory: true,
    showTag: true,
    dateFormat: "yyyy-MM-dd",
    dateUTC: false,
  },
  articleBanner: {
    enabled: true,
    showCategory: true,
    showTag: true,
  },
  articleShare: { enabled: true },
  articleUpdate: { enabled: true, limit: 3 },
  breadcrumb: {
    enabled: true,
    showCurrentName: true,
    homeLabel: "首页",
  },
  pageStyle: "card",
  comment: { provider: "" },

  // 首页卡片栏
  topArticle: {
    enabled: true,
    limit: 5,
    title: "精选文章",
    emptyLabel: "暂无精选文章",
  },
  category: {
    enabled: true,
    path: "/categories",
    limit: 6,
  },
  tag: {
    enabled: true,
    path: "/tags",
    limit: 18,
  },
  friendLink: {
    enabled: true,
    list: [
      {
        name: "Teek 文档",
        desc: "轻量、简洁、高效、易扩展的 VitePress 主题",
        avatar: "/images/logo.svg",
        link: "https://vp.teek.top/",
      },
      {
        name: "VitePress",
        desc: "基于 Vite 的静态站点生成器，文档写作利器",
        avatar: "/images/cover-2.svg",
        link: "https://vitepress.dev/zh/",
      },
      {
        name: "MDN Web Docs",
        desc: "Web 技术的最佳参考资料",
        avatar: "/images/cover-5.svg",
        link: "https://developer.mozilla.org/zh-CN/",
      },
    ],
    title: "友情链接",
  },
  docAnalysis: {
    enabled: true,
    createTime: "2026-01-01",
    wordCount: true,
    readingTime: true,
    appendInfo: [{ key: "poweredBy", label: "站点技术", value: "VitePress + Teek" }],
  },

  // 社交与页脚
  social: [],
  footerGroup: [
    {
      title: "站点导航",
      links: [
        { name: "首页", link: "/" },
        { name: "文章清单", link: "/articleOverview" },
        { name: "关于我", link: "/about" },
      ],
    },
    {
      title: "分类标签",
      links: [
        { name: "全部分类", link: "/categories" },
        { name: "全部标签", link: "/tags" },
        { name: "文章归档", link: "/archives" },
      ],
    },
  ],
  footerInfo: {
    topMessage: ["本站使用 VitePress + Teek 构建，内容仅作示例。"],
    theme: { show: true },
    copyright: {
      show: true,
      createYear: 2026,
      suffix: "林间小栈",
    },
  },

  // 编辑器与插件
  codeBlock: { enabled: true, collapseHeight: 600, langTextTransform: "uppercase" },
  backTop: { enabled: true, content: "progress" },
  viewTransition: { enabled: true, mode: "out-in", duration: 400 },
  vitePlugins: {
    sidebar: false,
    autoFrontmatter: true,
    // 分类由文章 frontmatter 显式声明，避免插件把 @pages 目录名写进 YAML
    // （YAML 中 @ 开头的裸标量不合法）
    autoFrontmatterOption: {
      categories: false,
    },
  },
});

/**
 * VitePress 站点配置
 * 文档：https://vitepress.dev/zh/reference/site-config
 */
export default defineConfig({
  extends: teekConfig,
  title: "林间小栈",
  description: "记录技术、思考与生活 —— 个人博客",
  lang: "zh-CN",
  cleanUrls: false,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/images/logo.svg" }],
    ["meta", { name: "author", content: "JiangFan" }],
    ["meta", { name: "keywords", content: "博客,前端,VitePress,Teek,技术笔记" }],
  ],
  markdown: {
    lineNumbers: true,
    image: { lazyLoading: true },
  },
  // Windows 下 Vite 生成的模块 id 使用大写盘符，而 VitePress 的 srcDir 使用小写盘符，
  // 构建页面时会因路径不匹配报错。这里在产物层统一为小写盘符。
  vite: {
    plugins: [
      {
        name: "normalize-facade-module-id",
        enforce: "post",
        generateBundle(_options, bundle) {
          // Windows 下盘符大小写不稳定，统一为 process.cwd() 的盘符形式（与 VitePress srcDir 一致）
          const cwdDrive = process.cwd().match(/^[A-Za-z]:/)?.[0] ?? "";
          if (!cwdDrive) return;
          for (const item of Object.values(bundle)) {
            if (item.type === "chunk" && typeof item.facadeModuleId === "string") {
              const normalized = item.facadeModuleId.replace(/\\/g, "/").replace(/^[A-Za-z]:/, cwdDrive);
              item.facadeModuleId = normalized;
            }
          }
        },
      },
    ],
  },
  themeConfig: {
    logo: "/images/logo.svg",
    darkModeSwitchLabel: "深浅色",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "返回顶部",
    lastUpdatedText: "上次更新",
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "文章清单", link: "/articleOverview" },
      { text: "分类", link: "/categories" },
      { text: "标签", link: "/tags" },
      { text: "归档", link: "/archives" },
      { text: "关于", link: "/about" },
    ],
    socialLinks: [],
    search: {
      provider: "local",
      options: {
        placeholder: "搜索文章…",
        displayDetail: true,
      },
    },
  },
});
