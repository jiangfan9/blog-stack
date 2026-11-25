const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));

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
    const postsDir = path.join(root, "docs", "posts");
    assert.ok(fs.existsSync(postsDir), "缺少 docs/posts 目录");
    const posts = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
    assert.ok(posts.length >= 10, `文章数量不足: ${posts.length}`);
  });

  it("所有文章均包含 frontmatter 及必需字段", () => {
    const postsDir = path.join(root, "docs", "posts");
    const posts = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
    for (const file of posts) {
      const content = fs.readFileSync(path.join(postsDir, file), "utf8");
      assert.match(content, /^---\r?\n/, `${file} 缺少 frontmatter`);
      for (const field of ["title", "date", "categories", "tags", "description", "coverImg", "permalink"]) {
        assert.match(content, new RegExp(`^${field}:`, "m"), `${file} 缺少字段: ${field}`);
      }
    }
  });

  it("关键图片资源存在", () => {
    for (const img of ["avatar.png", "banner-1.png", "banner-2.png", "banner-3.png"]) {
      assert.ok(exists(`docs/public/images/${img}`), `缺少图片: ${img}`);
    }
  });
});
