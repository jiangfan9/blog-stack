# ---------- 阶段 1：构建静态站点 ----------
# 镜像地址用 ARG，默认沿用当前阿里云仓库；如需换源可在 build 时覆盖，例如：
#   docker build --build-arg NODE_IMAGE=node:20-alpine --build-arg NGINX_IMAGE=nginx:1.27-alpine -t blog-stack .
ARG NODE_IMAGE=crpi-u5p8ujqzdgobv4v6.cn-beijing.personal.cr.aliyuncs.com/jfji/node:20-alpine
FROM ${NODE_IMAGE} AS builder

WORKDIR /app

# VitePress 的 lastUpdated 会调用 git 读取文件更新时间，alpine 默认不带 git
RUN apk add --no-cache git

# 先复制依赖清单，利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci

# 复制项目源码并构建
COPY . .
RUN npm run docs:build \
    && node scripts/gen-permalink-aliases.mjs

# ---------- 阶段 2：用 nginx 托管静态产物 ----------
ARG NGINX_IMAGE=crpi-u5p8ujqzdgobv4v6.cn-beijing.personal.cr.aliyuncs.com/jfji/nginx:1.27-alpine
FROM ${NGINX_IMAGE}

# 用自定义配置替换默认配置（支持 VitePress 无扩展名 permalink）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将构建产物拷贝到 nginx 默认站点目录
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
