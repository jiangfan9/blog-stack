# ---------- 阶段 1：构建静态站点 ----------
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖清单，利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci

# 复制项目源码并构建
COPY . .
RUN npm run docs:build \
    && node scripts/gen-permalink-aliases.mjs

# ---------- 阶段 2：用 nginx 托管静态产物 ----------
FROM nginx:1.19.1

# 用自定义配置替换默认配置（支持 VitePress 无扩展名 permalink）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将构建产物拷贝到 nginx 默认站点目录
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
