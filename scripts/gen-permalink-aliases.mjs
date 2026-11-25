// 构建后处理：根据文章的 permalink 生成对应的 HTML 别名文件。
// 原因：源文件名多为大写开头（如 Java.md -> Java.html），而 permalink 为小写
// （如 /posts/java）。Linux 下文件系统大小写敏感，nginx 直接访问 /posts/java.html
// 会 404。这里为每个 permalink 复制出同名 .html，确保静态部署可直接访问。
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const postsDir = path.join(root, "docs", "posts");
const distDir = path.join(root, "docs", ".vitepress", "dist");

if (!fs.existsSync(distDir)) {
  console.error("dist 目录不存在，请先执行构建");
  process.exit(1);
}

let count = 0;
for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"))) {
  const content = fs.readFileSync(path.join(postsDir, file), "utf8");
  const match = content.match(/^permalink:\s*(.+)$/m);
  if (!match) continue;

  const permalink = match[1].trim().replace(/^["']|["']$/g, "");
  if (!permalink.startsWith("/")) continue;

  const sourceHtml = path.join(distDir, "posts", file.replace(/\.md$/, ".html"));
  if (!fs.existsSync(sourceHtml)) continue;

  const targetHtml = path.join(distDir, permalink.replace(/^\//, "") + ".html");
  if (path.resolve(sourceHtml) === path.resolve(targetHtml)) continue;

  fs.mkdirSync(path.dirname(targetHtml), { recursive: true });
  fs.copyFileSync(sourceHtml, targetHtml);
  console.log(`别名: ${permalink} -> ${path.relative(distDir, targetHtml)}`);
  count++;
}

console.log(`已生成 ${count} 个 permalink 别名文件`);
