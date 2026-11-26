const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const posts = () =>
  fs
    .readdirSync(path.join(root, "docs", "posts"))
    .filter((f) => f.endsWith(".md"));

describe("个人博客项目结构检查", () => {
  it("package.json 存在且包含必需脚本", () => {
    const pkg = JSON.parse(read("package.json"));
    for (const script of ["docs:dev", "docs:build", "docs:preview", "test"]) {
      assert.ok(pkg.scripts && pkg.scripts[script], `缺少脚本: ${script}`);
    }
  });

  it("VitePress 配置文件存在且启用 Teek 主题", () => {
    assert.ok(exists("docs/.vitepress/config.mts"), "缺少 config.mts");
    const cfg = read("docs/.vitepress/config.mts");
    assert.match(cfg, /vitepress-theme-teek/, "未引入 Teek 主题");
  });

  it("主题入口与自定义样式存在", () => {
    assert.ok(exists("docs/.vitepress/theme/index.ts"), "缺少主题入口");
    assert.ok(exists("docs/.vitepress/theme/style.css"), "缺少自定义样式");
  });

  it("首页与关于页存在", () => {
    assert.ok(exists("docs/index.md"), "缺少首页 index.md");
    assert.ok(exists("docs/about.md"), "缺少关于页 about.md");
  });

  it("功能页（分类/标签/归档/清单）齐全", () => {
    for (const page of ["categories", "tags", "archives", "articleOverview"]) {
      assert.ok(exists(`docs/${page}.md`), `缺少功能页: ${page}.md`);
    }
  });

  it("文章目录存在且至少包含 10 篇文章", () => {
    const list = posts();
    assert.ok(list.length >= 10, `文章数量不足: ${list.length}`);
  });

  it("所有文章均包含 frontmatter 及必需字段", () => {
    for (const file of posts()) {
      const content = fs.readFileSync(
        path.join(root, "docs", "posts", file),
        "utf8",
      );
      assert.match(content, /^---\r?\n/, `${file} 缺少 frontmatter`);
      for (const field of [
        "title",
        "date",
        "categories",
        "tags",
        "description",
        "coverImg",
        "permalink",
      ]) {
        assert.match(
          content,
          new RegExp(`^${field}:`, "m"),
          `${file} 缺少字段: ${field}`,
        );
      }
    }
  });

  it("config 通过 git 可用性检测控制 lastUpdated", () => {
    const cfg = read("docs/.vitepress/config.mts");
    assert.match(cfg, /const enableLastUpdated/, "缺少 git 可用性检测逻辑");
    assert.match(cfg, /rev-parse/, "未检测 git 仓库，容器构建会报 spawn git ENOENT");
    assert.match(
      cfg,
      /lastUpdated:\s*enableLastUpdated/,
      "lastUpdated 应使用动态检测结果",
    );
    assert.doesNotMatch(
      cfg,
      /lastUpdated:\s*true/,
      "lastUpdated 不应硬编码为 true",
    );
  });

  it("Dockerfile 在构建阶段安装 git", () => {
    const dockerfile = read("Dockerfile");
    assert.match(
      dockerfile,
      /apk add[^\n]*\bgit\b/,
      "构建阶段未安装 git，VitePress lastUpdated 会失败",
    );
  });

  it("头像圆形背景 pg.png 存在且被配置引用", () => {
    assert.ok(exists("docs/public/images/avatar/pg.png"), "缺少头像背景 pg.png");
    const cfg = read("docs/.vitepress/config.mts");
    assert.match(
      cfg,
      /circleBgImg:\s*"\/images\/avatar\/pg\.png"/,
      "circleBgImg 未指向 /images/avatar/pg.png",
    );
  });

  it("关键图片资源存在（分目录结构）", () => {
    for (const img of [
      "docs/public/images/logo.svg",
      "docs/public/images/avatar/avatar.png",
      "docs/public/images/avatar/pg.png",
      "docs/public/images/banner/banner-1.png",
      "docs/public/images/banner/banner-2.png",
      "docs/public/images/banner/banner-3.png",
      "docs/public/images/link/teek.png",
      "docs/public/images/link/vue.svg",
      "docs/public/images/link/spring.svg",
    ]) {
      assert.ok(exists(img), `缺少图片: ${img}`);
    }
  });

  it("文章 coverImg 引用均指向真实存在的图片", () => {
    for (const file of posts()) {
      const content = fs.readFileSync(
        path.join(root, "docs", "posts", file),
        "utf8",
      );
      const m = content.match(/^coverImg:\s*(.+)$/m);
      if (!m) continue;
      const cover = m[1].trim().replace(/^["']|["']$/g, "");
      if (!cover.startsWith("/images/")) continue;
      assert.ok(
        exists(path.join("docs/public", cover)),
        `${file} 的 coverImg 不存在: ${cover}`,
      );
    }
  });

  it("TypeScript 文章已完善（含泛型、声明文件等核心章节）", () => {
    assert.ok(exists("docs/posts/TypeScript.md"), "缺少 TypeScript.md");
    const c = read("docs/posts/TypeScript.md");
    // 用户已将该文扩写为完整教程，文中 `==` 仅出现在 === 全等运算符中，
    // 不应再有 VitePress 不支持的 ==高亮== 语法。
    assert.doesNotMatch(
      c,
      /==[^=\n]+==(?!=)/,
      "存在 VitePress 不支持的 ==高亮== 语法",
    );
    for (const chapter of ["泛型", "keyof", "声明文件", "类型体操"]) {
      assert.ok(c.includes(chapter), `缺少核心章节关键词: ${chapter}`);
    }
    assert.ok(c.split("\n").length > 500, "TypeScript 文章内容过于简短");
  });
});
