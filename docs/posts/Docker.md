---
title: Docker
date: 2022-07-28
categories: [工具]
tags: [Docker, 容器, DevOps, Linux]
description: Docker 学习笔记，涵盖核心概念、镜像与容器常用命令、数据卷、网络、Dockerfile、Compose、多阶段构建与镜像优化。
coverImg: /images/cover/Docker.png
permalink: /posts/docker
---

# Docker 系统学习文档

> 从入门到进阶再到高阶，覆盖 Docker 核心概念、镜像与容器常用命令、数据卷与网络、Dockerfile、Compose 编排、镜像优化与生产实践。
> 全文示例基于 **Docker Engine 24+（CLI 语法同样适用于 27.x）** 整理，语义已对照官方文档核对。
> 注：本文档整理时本机无 Docker 环境，所有命令均为标准官方用法，但**未实际执行验证**，如遇个别参数差异请以 `docker <command> --help` 输出为准。

---

## 一、基础篇

### 1. Docker 是什么

Docker 是一个**容器化平台**，它把应用及其依赖（运行时、库、配置）打包成一个标准化的**镜像**，然后在任何支持 Docker 的机器上以**容器**的方式运行，实现「一次构建，到处运行」。

容器与虚拟机的区别：

| 维度 | 容器（Docker） | 虚拟机（VM） |
| --- | --- | --- |
| 隔离级别 | 进程级（共享宿主内核） | 硬件级（独立内核） |
| 启动速度 | 秒级 / 毫秒级 | 分钟级 |
| 资源占用 | MB 级 | GB 级 |
| 性能损耗 | 接近原生 | 有明显开销 |
| 镜像体积 | 通常几十 MB | 通常几 GB |

核心概念一览：

- **镜像（Image）**：只读模板，由一层层文件系统叠加而成（Layer），类似「类」。
- **容器（Container）**：镜像的运行实例，在镜像之上加一层可写层，类似「对象」。
- **仓库（Registry）**：存放镜像的服务，如 Docker Hub、私有 Harbor。
- **Docker Engine**：常驻后台的守护进程 `dockerd`，CLI 通过 REST API 与其通信。
- **Dockerfile**：描述「如何一步步构建镜像」的脚本。

```bash
# 三句话理解 Docker 工作流
docker build -t myapp:1.0 .        # 1. 构建：把 Dockerfile 变成镜像
docker run -d -p 8080:80 myapp:1.0 # 2. 运行：把镜像变成容器
docker push myrepo/myapp:1.0       # 3. 分发：把镜像推到仓库
```

### 2. 安装与验证

```bash
# Linux（Ubuntu）一键安装
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker

# 让当前用户免 sudo 使用 docker（重新登录生效）
sudo usermod -aG docker $USER

# 验证安装
docker version        # 查看 Client / Server 版本
docker info           # 查看系统级信息（镜像数、容器数、存储驱动等）
docker run hello-world  # 官方冒烟测试
```

### 3. 必会命令：镜像操作

```bash
# ---------- 搜索与拉取 ----------
docker search nginx                  # 搜索镜像
docker pull nginx                    # 拉取最新版（等价 nginx:latest）
docker pull nginx:1.25-alpine        # 拉取指定 tag（推荐固定版本）
docker pull registry.cn-hangzhou.aliyuncs.com/library/nginx  # 国内镜像源

# ---------- 查看与管理 ----------
docker images                        # 列出本地镜像（同 docker image ls）
docker images -a                     # 包含中间层镜像
docker image inspect nginx:latest    # 查看镜像详细元数据（JSON）
docker image history nginx:latest    # 查看镜像构建分层历史

# ---------- 打标签与删除 ----------
docker tag nginx:latest myrepo/nginx:v1   # 给镜像打新标签（同一镜像多个名字）
docker rmi nginx:1.25-alpine         # 删除镜像（同 docker image rm）
docker image prune                   # 删除悬空镜像（无 tag 引用）
docker image prune -a                # 删除所有未被容器使用的镜像（慎用）

# ---------- 导出与导入（离线迁移） ----------
docker save -o nginx.tar nginx:latest          # 导出镜像为 tar
docker load -i nginx.tar                       # 从 tar 导入镜像

# ---------- 构建镜像 ----------
docker build -t myapp:1.0 .                    # 用当前目录 Dockerfile 构建
docker build -t myapp:1.0 -f Dockerfile.prod . # 指定 Dockerfile
docker build --no-cache -t myapp:1.0 .         # 不使用缓存重新构建
docker build --build-arg VERSION=2.0 -t myapp:2.0 .  # 传入构建参数
```

### 4. 必会命令：容器操作

```bash
# ---------- 运行容器（最核心的命令） ----------
docker run nginx                       # 前台运行，Ctrl+C 停止
docker run -d nginx                    # 后台运行（detached）
docker run -it ubuntu /bin/bash        # 交互式运行并进入 shell
docker run --name web -d nginx         # 指定容器名
docker run -d -p 8080:80 nginx         # 端口映射：宿主机 8080 -> 容器 80
docker run -d -p 127.0.0.1:8080:80 nginx  # 只绑定到本机回环地址
docker run --rm alpine echo hello      # 运行完自动删除容器（适合一次性任务）
docker run -e JAVA_OPTS="-Xmx512m" myapp  # 注入环境变量
docker run -d --restart=always nginx   # 容器异常退出后自动重启

# ---------- 查看容器 ----------
docker ps                    # 列出运行中的容器
docker ps -a                 # 列出所有容器（含已停止）
docker ps -q                 # 只输出容器 ID（常配合批量操作）
docker container inspect web # 查看容器完整元数据
docker stats                 # 实时查看所有容器的 CPU / 内存 / 网络占用

# ---------- 启停与删除 ----------
docker start web             # 启动已停止的容器
docker stop web              # 优雅停止（先 SIGTERM，10s 后 SIGKILL）
docker stop $(docker ps -q)  # 停止所有运行中的容器
docker restart web           # 重启容器
docker kill web              # 强制停止（直接 SIGKILL）
docker rm web                # 删除已停止的容器
docker rm -f web             # 强制删除运行中的容器
docker rm $(docker ps -aq)   # 删除所有容器
docker container prune       # 删除所有已停止的容器

# ---------- 进入容器与日志 ----------
docker exec -it web /bin/bash        # 在运行中的容器里开一个交互 shell
docker exec web ls /usr/share/nginx/html  # 执行一次性命令
docker logs web                      # 查看容器日志
docker logs -f web                   # 实时跟踪日志（类似 tail -f）
docker logs --tail 100 web           # 只看最后 100 行
docker logs --since 30m web          # 只看最近 30 分钟的日志

# ---------- 文件拷贝 ----------
docker cp web:/etc/nginx/nginx.conf ./nginx.conf  # 容器 -> 宿主机
docker cp ./app.conf web:/etc/app/app.conf        # 宿主机 -> 容器

# ---------- 其他常用 ----------
docker rename old-name new-name     # 重命名容器
docker update --memory=1g web       # 运行时修改容器资源限制
docker port web                     # 查看容器端口映射
docker top web                      # 查看容器内进程
docker diff web                     # 查看容器可写层的文件变动
```

### 5. 三个完整的运行示例

```bash
# 示例 1：跑一个 Nginx 网站
docker run -d \
  --name my-nginx \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:1.25-alpine
# 浏览器访问 http://localhost:8080
# -v 把宿主机 ./html 目录挂进容器，改本地文件即改网站内容
# 行尾 \ 为换行续写符，:ro 表示只读挂载

# 示例 2：跑一个 Redis 并验证
docker run -d --name my-redis -p 6379:6379 redis:7-alpine
docker exec -it my-redis redis-cli
# 127.0.0.1:6379> set name docker
# OK
# 127.0.0.1:6379> get name
# "docker"

# 示例 3：跑一个 MySQL（数据持久化到 named volume）
docker run -d \
  --name my-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=demo \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0
docker exec -it my-mysql mysql -uroot -proot123 demo
```

### 6. 容器生命周期图解

```text
                docker create
                     │
                     ▼
   ┌──► CREATED ──docker start──► RUNNING ──docker stop──► EXITED
   │                                  │  ▲                    │
docker start                          │  └────docker start───┘
   │                     docker pause │  │ docker unpause
   └────────────────────────── PAUSED ◄┘
                                      │
                            docker rm │ docker rm -f
                                      ▼
                                  DELETED
```

---

## 二、进阶篇

### 1. 数据管理：数据卷与挂载

容器删除后可写层数据会丢失，持久化数据必须放到**卷（Volume）**或**绑定挂载（Bind Mount）**里。

| 方式 | 语法 | 特点 |
| --- | --- | --- |
| 命名卷 | `-v mydata:/path` | 由 Docker 管理，跨容器共享，推荐 |
| 绑定挂载 | `-v /host/path:/path` | 直接映射宿主机目录，开发调试方便 |
| 匿名卷 | `-v /path` | 只写容器内路径，生成随机名卷 |
| `--mount` 语法 | `--mount type=volume,src=mydata,dst=/path` | 更显式，推荐在 Compose/脚本中使用 |

```bash
# ---------- 卷管理 ----------
docker volume create mydata       # 创建命名卷
docker volume ls                  # 列出所有卷
docker volume inspect mydata      # 查看卷详情（实际宿主机路径）
docker volume rm mydata           # 删除卷
docker volume prune               # 删除所有未被使用的卷

# ---------- 使用示例 ----------
# 命名卷：数据由 Docker 存到 /var/lib/docker/volumes/
docker run -d --name db1 -v pgdata:/var/lib/postgresql/data postgres:16

# 绑定挂载：直接用宿主机目录（开发场景最常用）
docker run -d --name dev \
  -v $(pwd)/src:/app/src \
  node:20-alpine \
  node /app/src/server.js

# 只读挂载：容器内不能修改
docker run -d -v $(pwd)/config:/config:ro myapp

# 两个容器共享同一个卷
docker run -d --name writer -v shared:/data busybox sleep 3600
docker run --rm -v shared:/data busybox ls /data

# --mount 显式写法（等价于 -v pgdata:/var/lib/mysql）
docker run -d \
  --mount type=volume,src=pgdata,dst=/var/lib/postgresql/data \
  --name pg \
  postgres:16
```

### 2. 网络管理

Docker 提供三种内置网络：

- **bridge**（默认）：容器通过虚拟网桥与宿主机通信，容器间用 IP 访问。
- **host**：容器直接使用宿主机网络栈，无端口映射（仅 Linux 支持）。
- **none**：无网络，适合安全隔离场景。

```bash
# ---------- 网络基础命令 ----------
docker network ls                       # 列出网络
docker network create mynet             # 创建自定义 bridge 网络
docker network create --driver bridge \
  --subnet 172.20.0.0/16 mynet          # 指定网段
docker network inspect mynet            # 查看网络详情与接入的容器
docker network rm mynet                 # 删除网络
docker network prune                    # 清理未使用的网络

# ---------- 容器接入网络 ----------
docker run -d --name web --network mynet nginx
docker network connect mynet redis-container   # 把运行中的容器加入网络
docker network disconnect mynet redis-container

# ---------- 自定义网络的关键价值：容器名互访 ----------
# 同一自定义网络内的容器可以直接用【容器名】当主机名访问（内置 DNS）
docker run -d --name redis --network mynet redis:7-alpine
docker run -d --name app  --network mynet \
  -e REDIS_HOST=redis \
  myapp:1.0
# app 容器内直接连 redis:6379 即可，无需知道 IP
# 注意：默认 bridge 网络没有内置 DNS，不推荐直接使用

# host 模式：容器与宿主机共享网络（不需要 -p）
docker run -d --network host nginx
```

### 3. 端口映射详解

```bash
docker run -d -p 8080:80 nginx              # 宿主机 8080 -> 容器 80
docker run -d -p 8080:80 -p 443:443 nginx   # 多端口映射
docker run -d -p 192.168.1.10:8080:80 nginx # 绑定到指定网卡 IP
docker run -d -p 127.0.0.1:8080:80 nginx    # 只允许本机访问（更安全）
docker run -d -P nginx                      # 随机映射所有 EXPOSE 的端口
docker run -d -p 8080-8090:80-90 nginx      # 端口范围映射

# -p 宿主机端口:容器端口 与 EXPOSE 的区别：
# EXPOSE 只是声明（文档性质 + 配合 -P），真正对外访问靠 -p
```

### 4. Dockerfile 从入门到熟练

常用指令速查：

| 指令 | 作用 | 备注 |
| --- | --- | --- |
| `FROM` | 基础镜像 | 多阶段构建可写多个 FROM |
| `RUN` | 构建时执行命令 | 每条 RUN 生成一层 |
| `CMD` | 容器默认启动命令 | 可被 `docker run` 后的参数覆盖 |
| `ENTRYPOINT` | 容器入口程序 | 不易被覆盖，常与 CMD 配合 |
| `COPY` | 从构建上下文复制文件 | 推荐，语义清晰 |
| `ADD` | 类似 COPY + 自动解压/URL | 能用 COPY 就用 COPY |
| `ENV` | 设置环境变量 | 运行时仍存在 |
| `ARG` | 构建参数 | 仅构建期有效 |
| `EXPOSE` | 声明监听端口 | 文档性质 |
| `WORKDIR` | 设置工作目录 | 后续指令的相对路径基准 |
| `USER` | 指定运行用户 | 安全最佳实践 |
| `VOLUME` | 声明挂载点 | 匿名卷 |
| `HEALTHCHECK` | 健康检查 | 配合 `docker ps` 显示 healthy |
| `LABEL` | 元数据键值对 | 替代已废弃的 MAINTAINER |

基础示例：一个 Node.js 应用镜像

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# 先复制依赖文件再 npm install，充分利用构建缓存
COPY package*.json ./
RUN npm ci --omit=dev

# 再复制源码（源码经常变，放后面避免缓存失效）
COPY . .

EXPOSE 3000

USER node

CMD ["node", "server.js"]
```

```bash
docker build -t mynode:1.0 .
docker run -d -p 3000:3000 mynode:1.0
```

进阶示例：Java（Spring Boot）应用镜像

```dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/app.jar app.jar

ENV JAVA_OPTS="-Xmx512m"

# shell 格式：可用变量展开；exec 格式：["exec","param"] 不能展开变量
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
```

ENTRYPOINT 与 CMD 的配合模式——镜像像可执行程序：

```dockerfile
# 固定入口 + 可变默认参数：docker run image 后面跟的参数会替换 CMD
ENTRYPOINT ["ping", "-c", "3"]
CMD ["localhost"]
# docker run myping           -> ping -c 3 localhost
# docker run myping baidu.com -> ping -c 3 baidu.com
```

构建参数 ARG 的使用：

```dockerfile
FROM node:20-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN echo "build with NODE_ENV=$NODE_ENV"
```

```bash
docker build --build-arg NODE_ENV=dev -t myapp:dev .
```

### 5. Docker Compose：多容器编排

一个 YAML 文件定义多个服务，一条命令整体启停。

```yaml
# compose.yaml（Docker Compose v2）
services:
  web:
    build: .                      # 用当前目录 Dockerfile 构建
    ports:
      - "8080:8080"
    environment:
      - REDIS_HOST=redis          # 服务名即主机名
      - DB_HOST=db
    depends_on:
      db:
        condition: service_healthy   # 等待 db 健康检查通过再启动
    restart: unless-stopped
    volumes:
      - ./src:/app/src            # 开发热重载：挂载源码

  redis:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: demo
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-proot123"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  redis-data:
  db-data:
```

```bash
# ---------- Compose 常用命令 ----------
docker compose up -d            # 后台启动全部服务（首次会自动构建）
docker compose up -d --build    # 强制重新构建并启动
docker compose down             # 停止并删除容器与网络（卷保留）
docker compose down -v          # 连同数据卷一起删除（危险：数据丢失）
docker compose ps               # 查看服务状态
docker compose logs -f web      # 跟踪某个服务的日志
docker compose exec web sh      # 进入某个服务容器
docker compose restart web      # 重启某个服务
docker compose build web        # 单独构建某个服务
docker compose pull             # 拉取各服务最新镜像
docker compose config           # 校验并展开最终配置
docker compose up -d --scale web=3  # 水平扩容（需去掉固定端口映射）
```

Compose 中同一网络内，服务名就是 DNS 主机名——这就是它替代手写 `--network` + `--link` 的原因。

---

## 三、高阶篇

### 1. 多阶段构建：让镜像体积缩小一个数量级

构建工具（Maven、npm、gcc）往往几百 MB，但运行产物只需要 JRE / node / 二进制。多阶段构建把「构建环境」和「运行环境」分开：

```dockerfile
# ---------- 阶段 1：构建 ----------
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline        # 先下依赖，缓存友好
COPY src ./src
RUN mvn package -DskipTests

# ---------- 阶段 2：运行（只带最终产物） ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# 构建产物从 800MB+ 的 Maven 镜像降到 ~180MB 的 JRE 镜像
docker build -t myapp:1.0 .
docker images myapp
```

前端示例：构建出静态文件，只用 Nginx 托管

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 2. 镜像瘦身技巧

```dockerfile
# 技巧 1：选小的基础镜像
# node:20 (~1GB) > node:20-slim (~250MB) > node:20-alpine (~130MB)
FROM node:20-alpine

# 技巧 2：合并 RUN，减少层数，并清理包管理器缓存
# 差：三层，apt 缓存残留在层里
# RUN apt-get update
# RUN apt-get install -y curl
# RUN rm -rf /var/lib/apt/lists/*
# 好：一层完成
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# 技巧 3：固定 tag，不用 latest（构建可复现）
FROM redis:7.2-alpine

# 技巧 4：把变化少的放前面（依赖文件），变化多的放后面（源码）
```

`.dockerignore` —— 排除无关文件，避免构建上下文过大、缓存失效：

```text
node_modules
dist
.git
.env
*.md
docker-compose*.yaml
Dockerfile*
```

```bash
# 查看镜像每层的大小，找出瘦身点
docker history myapp:1.0
docker image inspect myapp:1.0 --format '{{.Size}}'
```

### 3. 资源限制与重启策略

```bash
# ---------- 资源限制 ----------
docker run -d \
  --name limited \
  --memory=512m \            # 内存上限 512MB
  --memory-swap=512m \       # 禁止使用 swap（与 memory 相等即禁用）
  --cpus=1.5 \               # 最多使用 1.5 个 CPU 核
  --pids-limit=100 \         # 限制进程数，防 fork 炸弹
  myapp:1.0

# 查看容器资源使用
docker stats --no-stream limited   # 输出一次快照而非持续刷新

# ---------- 重启策略 ----------
docker run -d --restart=no myapp          # 默认：不重启
docker run -d --restart=on-failure:3 myapp # 非零退出时重启，最多 3 次
docker run -d --restart=always myapp      # 总是重启（含宿主机重启后）
docker run -d --restart=unless-stopped myapp  # 同 always，但手动 stop 后不拉起
```

### 4. 私有镜像仓库

```bash
# ---------- 使用 Docker Hub ----------
docker login                       # 登录 Docker Hub
docker login registry.example.com -u myuser   # 登录私有仓库
docker tag myapp:1.0 myuser/myapp:1.0
docker push myuser/myapp:1.0
docker logout

# ---------- 自建私有仓库（registry 镜像） ----------
docker run -d \
  --name registry \
  -p 5000:5000 \
  -v registry-data:/var/lib/registry \
  registry:2

# 打标签并推送到私有仓库
docker tag myapp:1.0 localhost:5000/myapp:1.0
docker push localhost:5000/myapp:1.0
docker pull localhost:5000/myapp:1.0

# 查看仓库中的镜像
curl http://localhost:5000/v2/_catalog
curl http://localhost:5000/v2/myapp/tags/list
```

> 生产环境一般使用 Harbor（带 UI、权限、漏洞扫描），而不是裸 registry。

### 5. 健康检查与容器状态

```bash
# 运行时指定健康检查
docker run -d \
  --name web \
  --health-cmd "curl -fs http://localhost:80/ || exit 1" \
  --health-interval 30s \
  --health-retries 3 \
  --health-start-period 10s \
  nginx

# STATUS 列会显示 healthy / unhealthy / starting
docker ps
docker inspect --format '{{.State.Health.Status}}' web
docker inspect --format '{{json .State.Health}}' web | jq
```

### 6. 日志与系统清理

```bash
# ---------- 日志 ----------
docker logs --details web
docker logs -f --since 1h web 2>&1 | grep ERROR
docker inspect --format '{{.LogPath}}' web   # 宿主机上的日志文件位置
# 限制容器日志大小（json-file 驱动默认无限增长，务必限制）
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx

# ---------- 清理命令全家桶 ----------
docker system df               # 查看 Docker 占用磁盘总量
docker system df -v            # 详细明细
docker system prune            # 清理：停止的容器 + 悬空镜像 + 未用网络
docker system prune -a --volumes  # 大扫除：全部镜像和卷（危险！数据会丢）
docker builder prune           # 清理构建缓存
```

### 7. 排错常用组合

```bash
# 容器起不来？先看退出码和日志
docker ps -a                        # 看 STATUS，如 Exited (1)
docker logs web                     # 看启动日志
docker inspect --format '{{.State.ExitCode}} {{.State.Error}}' web

# 容器内程序崩溃但日志看不出？重跑拿交互式 shell
docker run -it --entrypoint /bin/sh myapp:1.0

# 网络不通？进容器验证
docker exec -it web sh
  # wget -qO- http://db:5432 或
  # ping db / nslookup db

# 文件权限问题？
docker run --rm -v $(pwd):/work alpine ls -la /work

# 查看容器内进程
docker top web
docker exec web ps aux

# 导出完整诊断信息
docker inspect web
```

### 8. 安全与生产实践清单

- **不要用 root 跑容器**：Dockerfile 中 `USER app`，或运行时 `--user 1000:1000`。
- **固定镜像版本**：`nginx:1.25.3` 而非 `latest`；有条件用镜像摘要 `nginx@sha256:...`。
- **镜像扫描**：`docker scout cves myapp:1.0` 或 Harbor/Trivy 集成扫描。
- **最小化攻击面**：alpine / distroless 基础镜像，一个容器只跑一个进程。
- **敏感信息不进镜像**：密钥用运行时注入（`-e`、secret 管理），`.dockerignore` 排除 `.env`。
- **限制资源**：`--memory` / `--cpus`，避免单容器拖垮宿主机。
- **限制日志**：`--log-opt max-size`，防止日志盘写满。
- **数据分离**：有状态数据一律走命名卷，容器本身可随时销毁重建。

```bash
# 以非 root 用户运行
docker run --rm --user 1000:1000 -v $(pwd):/work alpine whoami

# 用只读根文件系统运行（写操作只允许在挂载的 tmpfs/卷）
docker run --rm --read-only --tmpfs /tmp alpine touch /tmp/ok
```

### 9. 下一步：从 Docker 到编排平台

单机 Docker 之上，生产环境的容器编排通常走向：

- **Docker Swarm**：Docker 原生集群方案，`docker swarm init` / `docker service`，上手简单，但生态萎缩。
- **Kubernetes**：事实标准编排平台，解决多机调度、自愈、弹性伸缩、服务发现、滚动发布。Docker 技能是 K8s 的直接地基——镜像构建、Dockerfile 优化、容器调试经验全部可迁移。

```bash
# Swarm 极简体验（了解即可）
docker swarm init
docker service create --name web --replicas 3 -p 80:80 nginx
docker service ls
docker service scale web=5
docker swarm leave --force
```

---

## 四、常用命令速查表

```bash
# ============ 镜像 ============
docker pull nginx:1.25          # 拉取
docker images                   # 列表
docker rmi nginx:1.25           # 删除
docker build -t app:1.0 .       # 构建
docker tag app:1.0 user/app:1.0 # 打标签
docker save -o a.tar app:1.0    # 导出
docker load -i a.tar            # 导入
docker history app:1.0          # 分层历史
docker image prune -a           # 清理未用镜像

# ============ 容器 ============
docker run -d --name web -p 8080:80 nginx   # 运行
docker ps / docker ps -a        # 列表
docker stop web && docker rm web            # 停止并删除
docker exec -it web bash        # 进入容器
docker logs -f --tail 100 web   # 日志
docker cp web:/a ./a            # 拷贝
docker stats                    # 资源占用
docker inspect web              # 元数据
docker rm $(docker ps -aq)      # 删除全部容器

# ============ 数据与网络 ============
docker volume create v1         # 创建卷
docker volume ls / inspect v1   # 查看卷
docker network create net1      # 创建网络
docker network connect net1 web # 容器入网
docker network ls / inspect net1            # 查看网络

# ============ Compose ============
docker compose up -d --build    # 构建并启动
docker compose down / down -v   # 停止（含卷）
docker compose ps / logs -f     # 状态 / 日志
docker compose exec web sh      # 进入服务
docker compose restart web      # 重启服务

# ============ 系统与清理 ============
docker system df                # 磁盘占用
docker system prune             # 清理
docker builder prune            # 清理构建缓存
docker version / docker info    # 版本与系统信息
```

---
