---
title: Redis
date: 2022-07-28
categories: [中间件]
tags: [Redis, 缓存, 数据结构, 分布式锁]
description: Redis 学习笔记，涵盖常用命令、持久化、Pipeline/Lua、Cluster 与 Java 客户端实战。
coverImg: /images/cover/Redis.png
permalink: /posts/redis
---

# Redis 系统学习文档

> 从零到实战：常用命令 + Java 执行 Redis 命令 + 缓存架构设计
>
> 适用版本：Redis 5/6/7（文中标注版本差异） · JDK 8 · Jedis 4.4.6 · Spring Boot 2.7.18 · Redisson 3.23.5

---

## 写在前面

### 本文环境说明

| 项目 | 版本 | 说明 |
|------|------|------|
| Redis | 5 / 6 / 7 | 命令主体兼容；ZSet 的 `ZPOPMAX` 等需 5.0+，`OBJECT ENCODING` 输出随版本变化 |
| JDK | 8 | Java 示例全部使用 Java 8 语法，可直接在 JDK 8 编译 |
| Jedis | 4.4.6 | 直连式客户端，本文用它演示"Java 执行 Redis 命令" |
| Spring Data Redis | 2.7.18（Spring Boot 2.7.18） | `StringRedisTemplate` / `RedisTemplate` / 注解缓存 |
| Redisson | 3.23.5 | 分布式锁、限流器等高级特性 |

> 若你使用 Spring Boot 3.x / JDK 17+，包名与 API 大体一致，但需注意：`GenericJackson2JsonRedisSerializer` 在 Spring Data Redis 3.x 中已标记弃用，且 Boot 3 默认使用 Lettuce 6.x。

### 学习路线

```
基础篇：数据类型与命令 → 进阶篇：持久化/事务/集群/Java 客户端 → 高阶篇：缓存架构/分布式锁/调优
```

### 快速安装

```bash
# Linux（apt）
sudo apt update && sudo apt install redis-server -y
redis-server --daemonize yes
redis-cli ping          # PONG

# Linux（yum）
sudo yum install redis -y

# Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# macOS
brew install redis && brew services start redis
```

连接服务端：

```bash
redis-cli                       # 默认 127.0.0.1:6379
redis-cli -h 192.168.1.10 -p 6379 -a yourpassword
redis-cli --raw                 # 中文/二进制不转义输出
```

---

# 第一部分：基础篇

## 1. Redis 概述

Redis（Remote Dictionary Server）是一个**基于内存的键值对数据库**，核心特点：

- **快**：数据都在内存，单线程执行命令避免锁竞争，QPS 可达 10 万级
- **数据结构丰富**：String、Hash、List、Set、ZSet，以及 Stream、Bitmap、HyperLogLog、GEO
- **持久化**：RDB 快照 + AOF 日志，断电可恢复
- **可扩展**：主从复制、哨兵高可用、Cluster 分片

典型应用场景：

| 场景 | 使用的类型/特性 |
|------|----------------|
| 对象缓存 | String（JSON）、Hash |
| 计数器 / 点赞数 | String 的 `INCR` |
| 排行榜 | ZSet |
| 消息队列（简单） | List / Stream |
| 去重、共同关注 | Set |
| 分布式锁 | `SET NX EX` / Redisson |
| 签到、UV 统计 | Bitmap / HyperLogLog |
| 附近的人 | GEO |

### Redis 的数据库概念

Redis 默认有 **16 个数据库**（编号 0~15），各库数据隔离，但**共用一个进程、一套 CPU**，生产环境一般用 0 号库，靠 key 前缀区分业务。

```bash
SELECT 0            # 切换到 0 号库（默认）
SELECT 1            # 切换到 1 号库
DBSIZE              # 当前库的 key 数量
FLUSHDB             # 清空当前库（生产禁用）
FLUSHALL            # 清空所有库（生产禁用）
```

---

## 2. 全局命令（Key 通用操作）

```bash
# 查看 key
KEYS user:*                     # 通配匹配（生产环境禁用，会阻塞主线程）
SCAN 0 MATCH user:* COUNT 100   # 游标迭代，生产推荐
SCAN 42 MATCH user:* COUNT 100  # 用上次返回的游标继续

EXISTS name                     # 存在返回 1，否则 0
EXISTS name age                 # 返回存在的个数 2
TYPE name                       # string / hash / list / set / zset / stream
RANDOMKEY                       # 随机返回一个 key

# 删除
DEL name age                    # 返回删除成功的个数
UNLINK bigkey                   # 异步删除，避免大 key 阻塞（Redis 4.0+）

# 过期
EXPIRE name 60                  # 60 秒后过期，设置成功返回 1
PEXPIRE name 60000              # 毫秒级过期
EXPIREAT name 1735689600        # 指定 Unix 秒级时间戳过期
TTL name                        # 剩余秒数：-1 永不过期，-2 不存在
PTTL name                       # 剩余毫秒数
PERSIST name                    # 移除过期时间，使其永不过期

# 其他
RENAME name username            # 改名
RENAMENX name username          # 仅当新 key 不存在时改名
MOVE name 1                     # 移动到 1 号库
```

> **生产红线**：永远不要在线上执行 `KEYS *` 和 `FLUSHALL`。`KEYS` 会全量遍历阻塞主线程，用 `SCAN` 代替；`FLUSHALL` 会清空全部数据。

### SCAN 的正确使用方式

`SCAN` 返回两部分：**下一个游标**和**本批 key**。游标返回 `"0"` 表示遍历结束。注意 `SCAN` 可能返回重复元素，业务侧需要去重。

```bash
127.0.0.1:6379> SCAN 0 MATCH user:* COUNT 2
1) "12"                         # 下次游标
2) 1) "user:1"
   2) "user:2"
127.0.0.1:6379> SCAN 12 MATCH user:* COUNT 2
1) "0"                          # 遍历结束
2) (empty array)
```

---

## 3. String：字符串（最基础也最常用）

String 是二进制安全的，最大 512MB，可以存文本、JSON、序列化对象甚至图片。

### 常用命令

```bash
SET name "Alice"                       # OK
GET name                               # "Alice"

# 带过期时间 / 条件写入
SET token "abc" EX 3600                # 3600 秒后过期
SET token "abc" PX 3600000             # 毫秒级过期
SET token "abc" NX                     # 仅当 key 不存在时设置（分布式锁基础）
SET token "abc" XX                     # 仅当 key 存在时设置
SETEX code 60 "123456"                 # 等价于 SET code "123456" EX 60
PSETEX code 60000 "123456"
SETNX lock:order 1                     # 不存在才设置，返回 1；已存在返回 0
GETSET name "Bob"                      # 返回旧值 "Alice"，同时设置新值

# 批量
MSET name "Alice" age "20" city "Beijing"
MGET name age city                     # 1) "Alice" 2) "20" 3) "Beijing"
MSETNX a 1 b 2                         # 全部不存在时才设置，原子性

# 数值操作（value 必须是数字字符串）
SET counter 10
INCR counter                           # 11
DECR counter                           # 10
INCRBY counter 5                       # 15
DECRBY counter 3                       # 12
INCRBYFLOAT price 3.14                 # 浮点数

# 字符串操作（用独立的 key，避免上面的 GETSET 改动影响结果）
SET str "Hello"
APPEND str "!"                         # 追加，返回新长度 6
STRLEN str                             # 6
GETRANGE str 0 2                       # 截取 [0,2]，"Hel"
SETRANGE str 1 "X"                     # 从下标 1 开始覆盖，结果 "HXllo!"
```

### 典型应用

```bash
# 1) 缓存对象（JSON）
SET user:1 '{"id":1,"name":"Alice","age":20}' EX 600

# 2) 计数器（文章阅读量）
INCR article:1001:pv

# 3) 分布式锁（最简版，生产需用 Redisson 或完善续期，见高阶篇）
SET lock:order:1 uuid NX EX 30

# 4) 手机号验证码（60 秒过期）
SETEX sms:13800138000 60 "9527"
```

---

## 4. Hash：哈希（适合存对象）

Hash 是 `field -> value` 的映射，适合存储对象，**可以只读写某个字段**，比整个 JSON 序列化更灵活。

### 常用命令

```bash
HSET user:1 name "Alice" age "20"      # Redis 4.0+ 支持多字段
HGET user:1 name                       # "Alice"
HMGET user:1 name age                  # 批量取字段
HGETALL user:1                         # 1) "name" 2) "Alice" 3) "age" 4) "20"
HDEL user:1 age                        # 删除字段
HEXISTS user:1 name                    # 字段是否存在
HLEN user:1                            # 字段数量
HKEYS user:1                           # 所有字段名
HVALS user:1                           # 所有字段值
HINCRBY user:1 age 1                   # 字段自增整数
HINCRBYFLOAT user:1 score 0.5          # 字段自增浮点数
HSETNX user:1 city "Beijing"           # 字段不存在才设置
```

### String vs Hash 存对象

| 方案 | 优点 | 缺点 | 适用 |
|------|------|------|------|
| `SET user:1 '{json}'` | 简单、一次 IO、节省内存（小对象） | 修改某字段要反序列化整个对象 | 读多写少、整体读写 |
| `HSET user:1 name ...` | 可按字段读写、省网络流量 | 字段多时内存开销略高 | 频繁修改部分字段 |

---

## 5. List：列表（有序、可重复）

List 是双向链表结构（底层 quicklist），头尾插入删除都是 O(1)，适合消息队列和最新列表。

### 常用命令

```bash
LPUSH queue:mail "job1"                # 左端（头部）插入
RPUSH queue:mail "job2"                # 右端（尾部）插入
LPOP queue:mail                        # 左端弹出
RPOP queue:mail                        # 右端弹出
LRANGE queue:mail 0 -1                 # 查看全部，-1 表示最后一个
LRANGE queue:mail 0 9                  # 前 10 个
LLEN queue:mail                        # 长度
LREM queue:mail 1 "job1"               # 删除 1 个值为 job1 的元素
LTRIM queue:mail 0 99                  # 只保留前 100 个（常用于固定长度最新列表）
LINSERT queue:mail BEFORE "job2" "job1.5"

# 阻塞弹出（队列为空时等待，适合消费者）
BLPOP queue:mail 5                     # 最多等 5 秒，超时返回 nil
BRPOP queue:mail 0                     # 0 表示无限等待
```

### 典型应用

```bash
# 最新 10 条评论（左进 + 裁剪）
LPUSH article:1:comments "c1" "c2" "c3"
LTRIM article:1:comments 0 9

# 简单生产者/消费者队列
LPUSH queue:order "order:1001"
BRPOP queue:order 5
```

> List 队列没有消费组、没有 ACK，消息消费失败会丢失。生产环境建议用 Stream 或专业 MQ，见高阶篇。

---

## 6. Set：集合（无序、去重）

### 常用命令

```bash
SADD tags "java" "redis" "mysql"       # 添加，返回新增个数
SMEMBERS tags                          # 返回所有成员（无序）
SISMEMBER tags "java"                  # 判断是否成员，返回 1/0
SREM tags "mysql"                      # 删除
SCARD tags                             # 元素个数
SPOP tags 1                            # 随机弹出 1 个（抽奖）
SRANDMEMBER tags 2                     # 随机返回 2 个但不删除

# 集合运算
SADD s1 "a" "b" "c"
SADD s2 "b" "c" "d"
SINTER s1 s2                           # 交集 b, c
SUNION s1 s2                           # 并集 a, b, c, d
SDIFF s1 s2                            # 差集 a（在 s1 不在 s2）
SINTERSTORE s3 s1 s2                   # 交集结果存到 s3
SUNIONSTORE s4 s1 s2
SDIFFSTORE s5 s1 s2
```

### 典型应用

```bash
# 共同关注
SADD user:1:follows "2" "3" "4"
SADD user:2:follows "3" "4" "5"
SINTER user:1:follows user:2:follows   # 3, 4

# 抽奖（公平随机且不重复）
SADD lottery:1 "u1" "u2" "u3" "u4"
SPOP lottery:1 2                       # 抽出 2 个中奖者

# 标签去重
SADD article:1001:tags "java" "redis" "java"   # 只新增 2 个
```

---

## 7. ZSet：有序集合（带分数排序）

ZSet 每个元素关联一个 `score`（double），按 score 升序排列，member 唯一。底层为跳表 + 哈希表。

### 常用命令

```bash
ZADD rank 100 "Alice" 90 "Bob" 80 "Cindy"   # 一次添加多组 score/member（Redis 2.4+）
ZSCORE rank "Alice"                         # "100"
ZCARD rank                                  # 3
ZINCRBY rank 5 "Bob"                        # Bob 分数变为 95

ZRANGE rank 0 -1 WITHSCORES                 # 升序（分数从低到高）
ZREVRANGE rank 0 -1 WITHSCORES              # 降序（排行榜）
ZRANGE rank 0 2                             # 前 3 名（升序）

ZRANGEBYSCORE rank 80 95 WITHSCORES         # 分数在 [80,95] 的成员
ZREVRANGEBYSCORE rank 95 80                 # 降序区间（注意高低分顺序）
ZCOUNT rank 80 95                           # 区间内成员数量
ZRANK rank "Bob"                            # Bob 的升序排名（从 0 开始）
ZREVRANK rank "Bob"                         # 降序排名

ZREM rank "Cindy"                           # 删除成员
ZPOPMAX rank 1                              # 弹出最高分成员（Redis 5.0+）
ZPOPMIN rank 1                              # 弹出最低分成员（Redis 5.0+）
```

> `ZADD` 从 Redis 2.4 起就支持一次添加多组 `score member`；Redis 6.2 新增的是 `GT` / `LT` / `CH` / `INCR` 选项。使用新选项时需确认服务端版本，基础写法各版本通用。

### 典型应用

```bash
# 排行榜：以积分为 score
ZADD game:rank 1000 "player1" 950 "player2" 1200 "player3"
ZREVRANGE game:rank 0 9 WITHSCORES       # Top 10

# 延迟队列：以执行时间戳为 score
ZADD delay:queue 1735689600000 "order:1001"
ZRANGEBYSCORE delay:queue 0 <当前时间戳> LIMIT 0 10

# 时间线：以时间戳为 score
ZADD timeline:user1 1735689600 "post:1"
ZREVRANGE timeline:user1 0 19             # 最新 20 条
```

---

## 8. 其他数据类型速览

| 类型 | 关键命令 | 用途 | 版本 |
|------|----------|------|------|
| Stream | `XADD` / `XREADGROUP` / `XACK` | 可靠的消息队列、消费组 | 5.0+ |
| Bitmap | `SETBIT` / `GETBIT` / `BITCOUNT` | 签到、用户在线状态 | 2.2+ |
| HyperLogLog | `PFADD` / `PFCOUNT` / `PFMERGE` | 海量 UV 去重计数（约 0.8% 误差） | 2.8+ |
| GEO | `GEOADD` / `GEODIST` / `GEOSEARCH` | 附近的人、地理位置 | 3.2+ |
| Bitfield | `BITFIELD` | 打包存储多个小整数 | 3.2+ |

```bash
# Bitmap 签到：第 100 天签到
SETBIT sign:user1:20250101 100 1
BITCOUNT sign:user1:20250101              # 签到天数

# HyperLogLog 统计 UV（占用固定约 12KB）
PFADD uv:20250101 "u1" "u2" "u3"
PFCOUNT uv:20250101                        # 3

# GEO 附近的人
GEOADD geo:city 116.397128 39.916527 "Beijing" 121.473701 31.230416 "Shanghai"
GEODIST geo:city Beijing Shanghai km       # 约 1067 公里
GEOSEARCH geo:city FROMLONLAT 116.40 39.91 BYRADIUS 200 km WITHDIST
```

---

# 第二部分：进阶篇

## 1. 持久化：RDB 与 AOF

Redis 是内存数据库，持久化用于**故障恢复**。

### RDB（快照）

在指定时间点将全量数据写成二进制快照 `dump.rdb`。

```conf
# redis.conf
save 900 1              # 900 秒内至少 1 次修改就触发 BGSAVE
save 300 10
save 60 10000
dbfilename dump.rdb
dir ./
rdbcompression yes
```

```bash
SAVE                    # 同步生成快照，阻塞主线程（生产禁用）
BGSAVE                  # 后台 fork 子进程生成快照（推荐）
LASTSAVE                # 上次成功快照的 Unix 时间戳
```

### AOF（追加日志）

记录每条写命令，重启时重放恢复数据。

```conf
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec    # 每秒刷盘（推荐，折中性能与安全）
# appendfsync always    # 每条命令刷盘，最安全但最慢
# appendfsync no        # 由操作系统决定，最快但可能丢数据
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-use-rdb-preamble yes  # Redis 4.0+ 混合持久化：AOF 头部是 RDB 格式
```

```bash
BGREWRITEAOF            # 后台重写 AOF，压缩冗余命令
```

### 对比与选择

| 维度 | RDB | AOF |
|------|-----|-----|
| 恢复速度 | 快（直接载入二进制） | 慢（重放命令） |
| 数据安全性 | 可能丢失最后一次快照后的数据 | `everysec` 最多丢 1 秒 |
| 文件大小 | 小 | 大（需定期重写） |
| 对性能影响 | fork 时可能有停顿 | 持续写入有轻微开销 |

> 生产推荐：**两者都开启 + 混合持久化**，兼顾恢复速度与数据安全。

---

## 2. 事务与 Lua 脚本

### 事务

Redis 事务将多条命令打包按顺序执行，但**不支持回滚**。

```bash
MULTI                    # 开启事务
SET a 10
INCR a
GET a
EXEC                     # 执行，返回每条命令的结果数组
DISCARD                  # 取消事务

# 乐观锁：WATCH 监控 key，若被其他客户端改动则事务失败
WATCH balance
MULTI
DECRBY balance 100
INCRBY balance2 100
EXEC                     # 若 balance 被改过，返回 nil
UNWATCH                  # 取消监控
```

事务的两种失败：

- **语法错误**：`EXEC` 前就能发现，整个事务不执行
- **运行时错误**：如对 String 执行 `HSET`，前面已执行的命令**不会回滚**

### Lua 脚本

Lua 脚本在 Redis 中**原子执行**，是比事务更强的方案（可写条件逻辑）。

```bash
# 只有值等于 expected 时才删除（CAS，安全释放锁的基础）
EVAL "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end" 1 lock:order uuid

# 秒杀扣库存：库存足够才扣减
EVAL "local s=tonumber(redis.call('get',KEYS[1]) or '0'); if s<=0 then return -1 end; redis.call('decrby',KEYS[1],1); return s-1" 1 stock:1001

SCRIPT LOAD "return redis.call('get',KEYS[1])"   # 缓存脚本，返回 SHA
EVALSHA <sha> 1 name                             # 用 SHA 执行，减少网络传输
SCRIPT EXISTS <sha>
SCRIPT FLUSH
```

> Lua 中只能用 `redis.call()` / `redis.pcall()`，不要用 `os.time()` 等不确定函数，否则主从复制会出现数据不一致（Redis 5+ 对复制型脚本有限制）。

---

## 3. 发布订阅（Pub/Sub）

```bash
# 终端 1：订阅
SUBSCRIBE news                 # 精确订阅频道 news
PSUBSCRIBE news.*              # 模式订阅：匹配 news.sport、news.tech 等

# 终端 2：发布
PUBLISH news "hello"           # 精确订阅者收到
PUBLISH news.sport "win"       # 模式订阅者收到（news.* 匹配 news.sport）

# 取消
UNSUBSCRIBE news
PUNSUBSCRIBE news.*
```

特点：

- ** fire-and-forget**：消息不持久化，订阅者不在线就收不到
- 发布者不关心订阅者，完全解耦
- 适合简单通知；可靠性要求高时用 Stream 或 MQ

---

## 4. Pipeline：批量命令减少网络往返

每条命令都有一次网络 RTT，Pipeline 将多条命令一次性发出，服务端按序执行后一次性返回。

```bash
# redis-cli 没有直接的 pipeline 命令，用 JAVA 客户端演示（见下文 Jedis 示例）
```

适用场景：批量写入、批量读取、初始化数据。注意 Pipeline 不保证原子性（事务才保证顺序执行不被插入）。

---

## 5. 过期删除与内存淘汰

### 过期 key 的删除策略

- **惰性删除**：访问 key 时才检查是否过期
- **定期删除**：Redis 每隔一段时间抽样检查并删除过期 key

两者结合，仍可能有过期 key 暂未删除，因此访问时最好判断返回值。

### 内存淘汰策略（`maxmemory-policy`）

```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

| 策略 | 含义 |
|------|------|
| `noeviction` | 默认，内存满时写入报错 |
| `volatile-lru` | 在设置了过期时间的 key 中淘汰最近最少使用的 |
| `allkeys-lru` | 在所有 key 中淘汰最近最少使用的（纯缓存场景推荐） |
| `volatile-lfu` / `allkeys-lfu` | 按使用频率淘汰（Redis 4.0+） |
| `volatile-ttl` | 淘汰剩余存活时间最短的 |
| `volatile-random` / `allkeys-random` | 随机淘汰 |

> 纯缓存实例推荐 `allkeys-lru` 或 `allkeys-lfu`；混用持久化数据的实例只能用 `volatile-*`，避免把业务数据淘汰掉。

---

## 6. 主从复制、哨兵与 Cluster

### 主从复制

```conf
# 从节点 redis.conf
replicaof 192.168.1.10 6379
replica-read-only yes
```

主节点负责写，从节点负责读，写命令异步复制到从节点（可能短暂不一致）。

```bash
INFO replication             # 查看主从状态
REPLICAOF NO ONE             # 从节点提升为主节点
```

### 哨兵（Sentinel）：高可用

监控主节点，主节点宕机时自动选举新主节点，客户端通过哨兵获取主节点地址。

```conf
# sentinel.conf
sentinel monitor mymaster 192.168.1.10 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 180000
```

```bash
redis-sentinel sentinel.conf
```

### Cluster：分片集群

- 将 key 空间划分为 **16384 个哈希槽**，每个节点负责部分槽
- 客户端计算 `CRC16(key) % 16384` 定位节点
- 支持水平扩展与故障转移

```bash
redis-cli --cluster create 192.168.1.10:7000 192.168.1.11:7001 192.168.1.12:7002 --cluster-replicas 1
redis-cli -c -p 7000          # -c 开启集群模式，自动重定向
CLUSTER INFO
CLUSTER NODES
```

> Cluster 下**跨槽的多 key 操作受限**：`MSET k1 v1 k2 v2` 只有当 k1、k2 在同一槽时才允许。可用哈希标签让相关 key 落入同一槽，如 `user:{1001}:name` 与 `user:{1001}:age`。

---

## 7. Java 客户端选型

| 客户端 | 特点 | 适用场景 |
|--------|------|----------|
| **Jedis** | 直连、轻量、线程不安全（需连接池） | 简单项目、需要直接调用原生命令 |
| **Lettuce** | 基于 Netty、线程安全、支持异步/响应式 | Spring Boot 2.x 默认客户端 |
| **Redisson** | 封装分布式对象（锁、队列、限流器） | 分布式锁、分布式数据结构 |

Maven 依赖（本文示例所用版本，均兼容 JDK 8）：

```xml
<dependencies>
    <!-- Jedis：Java 执行 Redis 命令 -->
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>4.4.6</version>
    </dependency>
    <!-- Spring Data Redis（内含 Lettuce） -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
        <version>2.7.18</version>
    </dependency>
    <!-- Redisson：分布式锁等 -->
    <dependency>
        <groupId>org.redisson</groupId>
        <artifactId>redisson</artifactId>
        <version>3.23.5</version>
    </dependency>
</dependencies>
```

---

## 8. Java 执行 Redis 命令：Jedis 完整实战

下面的类演示如何用 Jedis 执行前面学过的所有常用命令，**代码可编译**，运行时把地址改成你的 Redis 服务即可。

```java
package com.example;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.params.ScanParams;
import redis.clients.jedis.resps.ScanResult;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class JedisCommandsDemo {

    private final JedisPool pool;

    public JedisCommandsDemo(String host, int port, String password) {
        JedisPoolConfig config = new JedisPoolConfig();
        config.setMaxTotal(32);             // 最大连接数
        config.setMaxIdle(16);              // 最大空闲连接
        config.setMinIdle(4);               // 最小空闲连接
        config.setTestOnBorrow(true);       // 借出时校验连接
        this.pool = new JedisPool(config, host, port, 2000, password);
    }

    /** 1. String 命令 */
    public void stringDemo(Jedis jedis) {
        jedis.set("name", "Alice");
        System.out.println(jedis.get("name"));               // Alice

        jedis.setex("code", 60, "123456");                   // 60 秒过期
        System.out.println(jedis.ttl("code"));               // 60（约）

        jedis.setnx("lock:order", "uuid-1");                 // 分布式锁基础
        System.out.println(jedis.get("lock:order"));         // uuid-1

        jedis.mset("a", "1", "b", "2");
        System.out.println(jedis.mget("a", "b"));            // [1, 2]

        jedis.set("counter", "10");
        System.out.println(jedis.incr("counter"));           // 11
        System.out.println(jedis.incrBy("counter", 5));      // 16
    }

    /** 2. Hash 命令 */
    public void hashDemo(Jedis jedis) {
        jedis.hset("user:1", "name", "Alice");
        jedis.hset("user:1", "age", "20");
        System.out.println(jedis.hget("user:1", "name"));    // Alice
        System.out.println(jedis.hgetAll("user:1"));         // {name=Alice, age=20}
        jedis.hincrBy("user:1", "age", 1);
        Set<String> fields = jedis.hkeys("user:1");
        System.out.println(fields);                          // [name, age]
    }

    /** 3. List 命令 */
    public void listDemo(Jedis jedis) {
        jedis.del("queue:mail");
        jedis.lpush("queue:mail", "job1", "job2");
        jedis.rpush("queue:mail", "job3");
        List<String> jobs = jedis.lrange("queue:mail", 0, -1);
        System.out.println(jobs);                            // [job2, job1, job3]
        System.out.println(jedis.llen("queue:mail"));        // 3
        System.out.println(jedis.lpop("queue:mail"));        // job2
    }

    /** 4. Set 命令 */
    public void setDemo(Jedis jedis) {
        jedis.del("s1", "s2");
        jedis.sadd("s1", "a", "b", "c");
        jedis.sadd("s2", "b", "c", "d");
        System.out.println(jedis.sismember("s1", "a"));      // true
        System.out.println(jedis.sinter("s1", "s2"));        // [b, c]
        System.out.println(jedis.sunion("s1", "s2"));        // [a, b, c, d]
        System.out.println(jedis.sdiff("s1", "s2"));         // [a]
        System.out.println(jedis.scard("s1"));               // 3
    }

    /** 5. ZSet 命令 */
    public void zsetDemo(Jedis jedis) {
        jedis.del("rank");
        jedis.zadd("rank", 100, "Alice");
        jedis.zadd("rank", 90, "Bob");
        jedis.zadd("rank", 120, "Cindy");
        System.out.println(jedis.zrevrange("rank", 0, -1));  // [Cindy, Alice, Bob]
        System.out.println(jedis.zscore("rank", "Bob"));     // 90.0
        jedis.zincrby("rank", 5, "Bob");
        System.out.println(jedis.zrank("rank", "Bob"));      // 2（升序排名）
    }

    /** 6. 全局命令与 SCAN */
    public void keyDemo(Jedis jedis) {
        System.out.println(jedis.exists("name"));            // true
        System.out.println(jedis.type("name"));              // string
        String cursor = ScanParams.SCAN_POINTER_START;
        ScanParams params = new ScanParams().match("user:*").count(100);
        ScanResult<String> result;
        do {
            result = jedis.scan(cursor, params);
            for (String key : result.getResult()) {
                System.out.println("found key: " + key);
            }
            cursor = result.getCursor();
        } while (!"0".equals(cursor));
    }

    /** 7. Pipeline：批量写，减少 RTT */
    public void pipelineDemo(Jedis jedis) {
        redis.clients.jedis.Pipeline pipeline = jedis.pipelined();
        for (int i = 0; i < 1000; i++) {
            pipeline.set("batch:" + i, "value-" + i);
        }
        pipeline.sync();                                     // 一次性发送并等待结果
        System.out.println(jedis.get("batch:999"));          // value-999
    }

    /** 8. Lua 脚本：原子扣库存 */
    public Object deductStock(Jedis jedis, String key, int num) {
        String script =
            "local stock = tonumber(redis.call('get', KEYS[1]) or '0'); " +
            "if stock < tonumber(ARGV[1]) then return -1 end; " +
            "redis.call('decrby', KEYS[1], ARGV[1]); " +
            "return stock - tonumber(ARGV[1]);";
        return jedis.eval(script, 1, key, String.valueOf(num));
    }

    public static void main(String[] args) {
        JedisCommandsDemo demo = new JedisCommandsDemo("127.0.0.1", 6379, null);
        // 实际运行时传入密码：new JedisCommandsDemo("127.0.0.1", 6379, "your-password");
        try (Jedis jedis = demo.pool.getResource()) {
            demo.stringDemo(jedis);
            demo.hashDemo(jedis);
            demo.listDemo(jedis);
            demo.setDemo(jedis);
            demo.zsetDemo(jedis);
            demo.keyDemo(jedis);
            demo.pipelineDemo(jedis);
            jedis.set("stock:1001", "100");
            System.out.println("剩余库存=" + demo.deductStock(jedis, "stock:1001", 3));
        }
        demo.pool.close();
    }
}
```

> **务必关闭连接**：`try-with-resources` 会自动 `close()` 把连接归还池。忘记归还会导致连接池耗尽。

---

## 9. Spring Data Redis 实战

### 9.1 配置

```yaml
# application.yml
spring:
  redis:
    host: 127.0.0.1
    port: 6379
    password: your-password    # 无密码可删掉此行
    database: 0
    timeout: 3000ms
    lettuce:
      pool:
        max-active: 32
        max-idle: 16
        min-idle: 4
        max-wait: 1000ms
```

```java
package com.example;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    // StringRedisTemplate：key/value 都是 String，最常用，避免序列化乱码
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory factory) {
        return new StringRedisTemplate(factory);
    }

    // RedisTemplate：存对象时用 JSON 序列化
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        template.afterPropertiesSet();
        return template;
    }
}
```

### 9.2 用 StringRedisTemplate 执行各类命令

```java
package com.example;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RedisService {

    private final StringRedisTemplate redis;

    public RedisService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** String：缓存 + 过期时间 */
    public void cacheUser(Long id, String json) {
        redis.opsForValue().set("user:" + id, json, Duration.ofMinutes(10));
    }

    public String getUser(Long id) {
        return redis.opsForValue().get("user:" + id);
    }

    /** 计数器 */
    public Long incrArticlePv(Long articleId) {
        return redis.opsForValue().increment("article:" + articleId + ":pv");
    }

    /** Hash：对象字段 */
    public void updateUserName(Long id, String name) {
        redis.opsForHash().put("user:hash:" + id, "name", name);
    }

    public Object getUserName(Long id) {
        return redis.opsForHash().get("user:hash:" + id, "name");
    }

    /** List：消息队列 */
    public void enqueue(String job) {
        redis.opsForList().leftPush("queue:job", job);
    }

    public String dequeue() {
        return redis.opsForList().rightPop("queue:job");
    }

    /** Set：标签 */
    public Long addTags(Long articleId, String... tags) {
        return redis.opsForSet().add("article:" + articleId + ":tags", tags);
    }

    public Set<String> getTags(Long articleId) {
        return redis.opsForSet().members("article:" + articleId + ":tags");
    }

    /** ZSet：排行榜 */
    public void addRank(String user, double score) {
        redis.opsForZSet().add("rank", user, score);
    }

    public Set<String> top10() {
        return redis.opsForZSet().reverseRange("rank", 0, 9);
    }

    /** Key 管理 */
    public Boolean exists(String key) {
        return redis.hasKey(key);
    }

    public Boolean expire(String key, long seconds) {
        return redis.expire(key, Duration.ofSeconds(seconds));
    }

    public Boolean delete(String key) {
        return redis.delete(key);
    }

    public Long ttl(String key) {
        return redis.getExpire(key);
    }
}
```

### 9.3 存 Java 对象（RedisTemplate + JSON）

```java
package com.example;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

public class User {
    private Long id;
    private String name;
    private Integer age;

    public User() { }

    public User(Long id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}

@Service
public class UserCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public UserCacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void save(User user) {
        redisTemplate.opsForValue().set("user:obj:" + user.getId(), user, Duration.ofMinutes(10));
    }

    public User load(Long id) {
        Object value = redisTemplate.opsForValue().get("user:obj:" + id);
        return value instanceof User ? (User) value : null;
    }
}
```

### 9.4 注解缓存

```java
package com.example;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

@Configuration
@EnableCaching
class CacheConfig { }

@Service
class ProductService {

    // 结果缓存到 product:1001，key 由参数拼接
    @Cacheable(value = "product", key = "#id")
    public String getProduct(Long id) {
        System.out.println("查询数据库: " + id);   // 只有第一次执行
        return "Product-" + id;
    }

    // 更新后清除缓存
    @CacheEvict(value = "product", key = "#id")
    public void updateProduct(Long id, String name) {
        System.out.println("更新数据库: " + id + " -> " + name);
    }
}
```

> 注解缓存默认使用 JDK 序列化，可读性差。生产中通常配合上面的 `RedisConfig` 自定义 `RedisCacheManager` 使用 JSON 序列化。

---

## 10. Redisson：分布式锁与限流器

```java
package com.example;

import org.redisson.Redisson;
import org.redisson.api.RLock;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;

import java.util.concurrent.TimeUnit;

public class RedissonDemo {

    public static void main(String[] args) throws InterruptedException {
        Config config = new Config();
        config.useSingleServer().setAddress("redis://127.0.0.1:6379");
        // 有密码时：config.useSingleServer().setAddress(...).setPassword("your-password");

        RedissonClient redisson = Redisson.create(config);

        // 1. 分布式锁（Redisson 自带看门狗自动续期）
        RLock lock = redisson.getLock("lock:order:1");
        lock.lock(10, TimeUnit.SECONDS);              // 10 秒后自动释放
        try {
            System.out.println("获得锁，执行业务...");
            Thread.sleep(100);
        } finally {
            lock.unlock();                            // 一定在 finally 中释放
        }

        // tryLock：最多等 3 秒，拿锁后 10 秒自动释放
        boolean locked = lock.tryLock(3, 10, TimeUnit.SECONDS);
        if (locked) {
            try {
                System.out.println("tryLock 成功");
            } finally {
                lock.unlock();
            }
        }

        // 2. 限流器：每 1 秒最多 5 次请求
        RRateLimiter limiter = redisson.getRateLimiter("rate:api");
        limiter.trySetRate(RateType.OVERALL, 5, 1, RateIntervalUnit.SECONDS);
        for (int i = 0; i < 8; i++) {
            System.out.println("第 " + (i + 1) + " 次请求: " + limiter.tryAcquire());
        }

        redisson.shutdown();
    }
}
```

---

# 第三部分：高阶篇

## 1. 底层数据结构与编码

Redis 的"数据类型"是对外抽象，每种类型内部有不同编码，随数据量自动转换。

| 类型 | 底层编码 | 说明 |
|------|----------|------|
| String | `int` / `embstr` / `raw` | 整数存 int；短字符串 embstr 一次分配；长字符串 raw |
| List | `quicklist`（Redis 3.2+） | 双向链表 + listpack/ziplist 的组合 |
| Hash | `listpack` / `hashtable` | 小对象用紧凑列表，大对象转哈希表 |
| Set | `intset` / `hashtable` | 全是整数且数量少时用 intset |
| ZSet | `listpack` / `skiplist+hashtable` | 小对象用紧凑列表，大对象用跳表 |

```bash
SET k1 "hello"
OBJECT ENCODING k1                # embstr
LPUSH list 1 2 3
OBJECT ENCODING list              # listpack（Redis 7）或 ziplist（Redis 6）
DEBUG OBJECT key                  # 查看详细编码（生产慎用）
```

> Redis 7 用 **listpack** 全面替代 ziplist，解决 ziplist 级联更新问题。编码转换是单向的：数据变大转为 hashtable/skiplist 后，即使删到很小也不会转回。

---

## 2. 缓存三大经典问题

### 2.1 缓存穿透（查不存在的数据）

**问题**：请求一个数据库和缓存都不存在的 id，每次都打到 DB。

**方案一：缓存空值**

```java
package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;

public class CachePenetrationDemo {

    // 示例用 POJO 与数据访问接口（实际项目中替换为你自己的类）
    public static class User {
        public Long id;
        public String name;
    }

    public interface UserRepository {
        User selectById(Long id);
    }

    private final StringRedisTemplate redis;
    private final UserRepository userMapper;
    private final ObjectMapper mapper = new ObjectMapper();

    public CachePenetrationDemo(StringRedisTemplate redis, UserRepository userMapper) {
        this.redis = redis;
        this.userMapper = userMapper;
    }

    /** 方案一：缓存空值 */
    public User getUser(Long id) throws Exception {
        String key = "user:" + id;
        String cached = redis.opsForValue().get(key);
        if (cached != null) {
            return "".equals(cached) ? null : mapper.readValue(cached, User.class);
        }
        User user = userMapper.selectById(id);
        // 查不到也缓存空串，短 TTL 防止误伤
        redis.opsForValue().set(key, user == null ? "" : mapper.writeValueAsString(user),
                                Duration.ofMinutes(user == null ? 2 : 30));
        return user;
    }
}
```

**方案二：布隆过滤器**（数据量巨大时更省内存）

```java
package com.example;

import org.springframework.data.redis.core.StringRedisTemplate;

public class BloomFilterDemo {

    private final StringRedisTemplate redis;

    public BloomFilterDemo(StringRedisTemplate redis) {
        this.redis = redis;
    }

    // 用 Redis Bitmap 简易模拟布隆过滤（生产建议用 Redisson / Guava BloomFilter）
    // 启动时把全部有效 id 通过 SETBIT 写入
    public boolean mightExist(Long id) {
        return Boolean.TRUE.equals(
                redis.opsForValue().getBit("bloom:user", Math.toIntExact(id % 1_000_000)));
    }
}
```

### 2.2 缓存击穿（热点 key 过期）

**问题**：一个超高并发访问的 key 突然过期，大量请求同时打到 DB。

**方案：互斥锁重建缓存**

```java
package com.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.connection.ReturnType;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.UUID;

public class CacheBreakdownDemo {

    public static class User { public Long id; public String name; }
    public interface UserRepository { User selectById(Long id); }

    private final StringRedisTemplate redis;
    private final UserRepository userMapper;
    private final ObjectMapper mapper = new ObjectMapper();

    public CacheBreakdownDemo(StringRedisTemplate redis, UserRepository userMapper) {
        this.redis = redis;
        this.userMapper = userMapper;
    }

    public User getUserWithLock(Long id) throws Exception {
        return getUserWithLock(id, 0);
    }

    /** 互斥锁重建缓存（带重试次数上限，避免无限递归） */
    private User getUserWithLock(Long id, int retry) throws Exception {
        if (retry > 5) {
            throw new IllegalStateException("重试次数超限，缓存重建失败");
        }
        String key = "user:" + id;
        String cached = redis.opsForValue().get(key);
        if (cached != null) {
            return mapper.readValue(cached, User.class);
        }

        String lockKey = "lock:user:" + id;
        String lockValue = UUID.randomUUID().toString();
        // SET NX EX：只有拿到锁的线程去查库
        Boolean locked = redis.opsForValue().setIfAbsent(lockKey, lockValue, Duration.ofSeconds(10));
        if (Boolean.TRUE.equals(locked)) {
            try {
                User user = userMapper.selectById(id);
                redis.opsForValue().set(key, mapper.writeValueAsString(user), Duration.ofMinutes(30));
                return user;
            } finally {
                // 安全释放：只删自己加的锁（Lua 保证比较+删除原子性）
                String script =
                    "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('del', KEYS[1]) else return 0 end";
                redis.execute((RedisCallback<Long>) connection ->
                    connection.eval(script.getBytes(), ReturnType.INTEGER, 1,
                                    lockKey.getBytes(), lockValue.getBytes()));
            }
        }
        // 没拿到锁的线程短暂等待后重试读缓存
        Thread.sleep(50);
        return getUserWithLock(id, retry + 1);
    }
}
```

> 递归重试要设置最大次数，避免锁异常时无限递归；生产更推荐 Redisson 锁 + 逻辑过期方案。

### 2.3 缓存雪崩（大量 key 同时过期）

**问题**：同一时刻大量 key 集体失效，DB 瞬时压力暴涨。

**方案：过期时间加随机值 + 多级缓存**

```java
package com.example;

import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;

public class CacheAvalancheDemo {

    private final StringRedisTemplate redis;

    public CacheAvalancheDemo(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void cacheWithRandomTtl(String key, String value) {
        // 基础 30 分钟 + 0~300 秒随机偏移，打散过期时间
        long ttlSeconds = 30 * 60 + ThreadLocalRandom.current().nextInt(300);
        redis.opsForValue().set(key, value, Duration.ofSeconds(ttlSeconds));
    }
}
```

---

## 3. 缓存更新策略与一致性

| 策略 | 做法 | 评价 |
|------|------|------|
| Cache Aside（最常用） | 读：先缓存后 DB；写：先更新 DB 再删缓存 | 简单、最终一致 |
| Read/Write Through | 应用只操作缓存，缓存组件负责回写 DB | 代码干净，组件复杂 |
| Write Behind | 先写缓存，异步批量落库 | 性能最好，可能丢数据 |

**先删缓存还是先更新 DB？**

- 推荐：**更新 DB → 删除缓存**
- 若先删缓存再更新 DB，并发读可能把旧值重新写回缓存
- 强一致要求可用：延迟双删（删缓存 → 更新 DB → sleep → 再删缓存）或监听 binlog（Canal）

---

## 4. 分布式锁深入

### 4.1 手写锁的正确姿势

```bash
# 加锁：value 必须是唯一标识，NX 保证互斥，EX 保证死锁可自动释放
SET lock:order:1 "uuid-1234" NX EX 30

# 释放：必须用 Lua "判断 value 相同再删"，否则会误删别人的锁
EVAL "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end" 1 lock:order:1 uuid-1234
```

**常见错误**：

1. `SETNX` 后单独 `EXPIRE`——两步非原子，setnx 成功后进程崩溃会导致锁永不过期
2. 释放时不校验 value——可能删掉别人已续期的锁
3. 业务耗时超过锁过期时间——需要看门狗续期（Redisson 已内置）

### 4.2 Redisson 看门狗原理

`lock.lock()` 不指定 leaseTime 时，Redisson 启动看门狗定时任务，默认每 10 秒（锁超时 30 秒的 1/3）检查并续期到 30 秒；进程崩溃则定时任务停止，锁 30 秒后自动释放。

---

## 5. 限流实现

### 5.1 固定窗口（INCR + EXPIRE）

```bash
INCR rate:user:1001:202501011200       # 返回当前计数
EXPIRE rate:user:1001:202501011200 60  # 仅第一次设置过期
```

问题：窗口边界处可能瞬间通过 2 倍流量。

### 5.2 滑动窗口（ZSet）

```java
package com.example;

import redis.clients.jedis.Jedis;

import java.util.UUID;

public class RateLimitDemo {

    private final Jedis jedis;

    public RateLimitDemo(Jedis jedis) {
        this.jedis = jedis;
    }

    /** 滑动窗口：1 分钟内最多 100 次请求 */
    public boolean allow(String userId) {
        String key = "rate:zset:" + userId;
        long now = System.currentTimeMillis();
        String member = now + "-" + UUID.randomUUID();
        String script =
            "redis.call('zremrangebyscore', KEYS[1], 0, ARGV[1]); " +  // 清理 1 分钟前
            "local c = redis.call('zcard', KEYS[1]); " +
            "if c >= tonumber(ARGV[2]) then return 0 end; " +
            "redis.call('zadd', KEYS[1], ARGV[3], ARGV[4]); " +
            "redis.call('expire', KEYS[1], 60); " +
            "return 1;";
        Object r = jedis.eval(script, 1, key,
                String.valueOf(now - 60_000), "100", String.valueOf(now), member);
        return Long.valueOf(1L).equals(r);
    }
}
```

### 5.3 令牌桶（Redisson）

见第二部分 `RRateLimiter` 示例，最简洁可靠。

---

## 6. 延迟队列

### 6.1 ZSet + 定时轮询

```bash
# 生产者：30 秒后执行的订单超时任务
ZADD delay:order 1735689630000 "order:1001"

# 消费者：取到期任务（score <= 当前时间戳）
ZRANGEBYSCORE delay:order 0 1735689630000 LIMIT 0 10
ZREM delay:order "order:1001"     # 取出后必须删除，注意并发重复消费
```

> 取出 + 删除必须用 Lua 保证原子，且要处理消费失败重试（把任务写回并增加重试次数）。

### 6.2 Stream 消费组（更可靠）

```bash
XADD order:stream * orderId 1001 status CREATED
XGROUP CREATE order:stream g1 0 MKSTREAM
XREADGROUP GROUP g1 c1 COUNT 10 BLOCK 5000 STREAMS order:stream >
XACK order:stream g1 <messageId>
XPENDING order:stream g1          # 查看未确认消息，实现失败重投
```

Stream 支持 ACK、消费组、消息持久化，比 List/ZSet 更适合可靠队列。

---

## 7. 特殊类型实战

### 7.1 Bitmap：用户签到

```java
package com.example;

import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;

public class SignDemo {

    private final StringRedisTemplate redis;

    public SignDemo(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** 用户签到：dayOfYear 从 1 开始 */
    public void sign(Long userId, int dayOfYear) {
        String key = "sign:" + userId + ":2025";
        redis.opsForValue().setBit(key, dayOfYear - 1, true);
    }

    public Long signCount(Long userId) {
        // bitCount 在连接层，用 RedisCallback 执行
        return redis.execute((RedisCallback<Long>) connection ->
                connection.bitCount(("sign:" + userId + ":2025").getBytes()));
    }
}
```

### 7.2 HyperLogLog：UV 统计

```java
package com.example;

import org.springframework.data.redis.core.StringRedisTemplate;

public class UvDemo {

    private final StringRedisTemplate redis;

    public UvDemo(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void uv(String date, String userId) {
        redis.opsForHyperLogLog().add("uv:" + date, userId);
    }

    public Long uvCount(String date) {
        return redis.opsForHyperLogLog().size("uv:" + date);
    }
}
```

> HyperLogLog 固定约 12KB/键，标准误差约 0.81%，**不能取出具体成员**，只用于去重计数。

### 7.3 GEO：附近的人（Jedis）

```java
package com.example;

import redis.clients.jedis.GeoCoordinate;
import redis.clients.jedis.Jedis;

import java.util.HashMap;
import java.util.Map;

public class GeoDemo {

    public static void geoDemo(Jedis jedis) {
        Map<String, GeoCoordinate> cities = new HashMap<>();
        cities.put("Beijing", new GeoCoordinate(116.397128, 39.916527));
        cities.put("Shanghai", new GeoCoordinate(121.473701, 31.230416));
        jedis.geoadd("geo:city", cities);
        System.out.println(jedis.geodist("geo:city", "Beijing", "Shanghai"));
        System.out.println(jedis.geohash("geo:city", "Beijing"));
    }
}
```

---

## 8. 性能调优与生产规范

### 8.1 慢查询

```bash
CONFIG SET slowlog-log-slower-than 10000   # 超过 10ms 记入慢日志
CONFIG SET slowlog-max-len 128
SLOWLOG GET 10                             # 查看最近 10 条慢命令
```

### 8.2 Big Key

```bash
redis-cli --bigkeys                  # 扫描各类大 key
MEMORY USAGE user:1                  # 查看某个 key 占用内存
UNLINK hugekey                       # 异步删除，避免阻塞
```

Big Key 危害：删除阻塞、迁移困难、网络传输慢。建议单 key 控制在 10KB 以内，集合元素控制在 5000 以内。

### 8.3 热 Key

- 现象：某个 key QPS 极高，单节点 CPU 打满
- 解决：本地缓存（Caffeine）+ 多副本 key（`hot:key:1..N` 随机读）+ 读写分离

### 8.4 Key 命名规范

```
业务名:对象名:id:属性     如：order:user:1001:name   user:token:1001
```

做到：可读、可扫描（配合 SCAN）、无空格、控制长度。

### 8.5 连接池要点

- `maxTotal` 不宜过大（默认 8，常设 32~64），连接过多反而增加上下文切换
- 每次用完必须 `close()` 归还连接
- 设置合理的 `timeout` 与重试策略，避免雪崩式重试

### 8.6 生产禁用的命令

| 命令 | 原因 |
|------|------|
| `KEYS *` | 阻塞主线程 |
| `FLUSHALL` / `FLUSHDB` | 清空数据 |
| `SAVE` | 同步阻塞生成 RDB |
| `DEBUG` | 危险调试命令 |
| `CONFIG SET` | 生产配置应写配置文件，避免运行时误改 |

---

## 9. 常见故障排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 连接超时 | 连接池耗尽 / 网络不通 / Redis 阻塞 | 检查 `INFO clients`、慢日志、连接池配置 |
| 内存涨满 | 大 key / 过期 key 未清理 / 客户端缓冲区 | `MEMORY USAGE`、`--bigkeys`、检查淘汰策略 |
| 缓存与 DB 不一致 | 删除缓存失败 / 并发写 | 延迟双删 / binlog 订阅 / 设置合理 TTL |
| CPU 100% | 慢命令 / 大量过期 key / 频繁序列化 | `SLOWLOG GET`、打散过期时间 |
| 主从延迟 | 网络慢 / 主库写入过大 / 从库性能差 | 传输优化、减少大 key、提升从库配置 |

---

# 附录

## A. 常用命令速查表

| 类型 | 命令 |
|------|------|
| 全局 | `SCAN` `EXISTS` `TYPE` `DEL` `UNLINK` `EXPIRE` `TTL` `PERSIST` `DBSIZE` |
| String | `SET` `GET` `MSET` `MGET` `SETEX` `SETNX` `INCR` `DECR` `INCRBY` `APPEND` `STRLEN` |
| Hash | `HSET` `HGET` `HMGET` `HGETALL` `HDEL` `HEXISTS` `HLEN` `HINCRBY` |
| List | `LPUSH` `RPUSH` `LPOP` `RPOP` `LRANGE` `LLEN` `LREM` `LTRIM` `BLPOP` |
| Set | `SADD` `SMEMBERS` `SISMEMBER` `SREM` `SCARD` `SPOP` `SINTER` `SUNION` `SDIFF` |
| ZSet | `ZADD` `ZRANGE` `ZREVRANGE` `ZSCORE` `ZINCRBY` `ZRANGEBYSCORE` `ZRANK` `ZREM` |
| 事务/脚本 | `MULTI` `EXEC` `DISCARD` `WATCH` `EVAL` `EVALSHA` |
| 发布订阅 | `PUBLISH` `SUBSCRIBE` `PSUBSCRIBE` |
| 持久化 | `SAVE` `BGSAVE` `BGREWRITEAOF` `LASTSAVE` |
| 集群 | `CLUSTER INFO` `CLUSTER NODES` `INFO replication` |
| 监控 | `INFO` `SLOWLOG GET` `MEMORY USAGE` `OBJECT ENCODING` |

## B. 分阶段练习项目

1. **入门**：用 redis-cli 完成五种数据类型的增删改查，各写 5 条命令
2. **Java 实战**：用 Jedis 实现"文章缓存 + 阅读量计数 + 排行榜"
3. **进阶**：用 Spring Data Redis 实现用户信息缓存，配 `@Cacheable`
4. **高阶**：实现防击穿的缓存工具（互斥锁 + Lua 安全释放）
5. **综合**：基于 ZSet 实现延迟队列，支持失败重试与幂等消费
6. **调优**：构造一个 bigkey，用 `--bigkeys` 找出并用 `UNLINK` 删除

## C. 推荐资源

- Redis 官方文档：https://redis.io/docs/
- Redis 命令参考（中文）：https://redis.com.cn/commands.html
- Spring Data Redis 文档：https://docs.spring.io/spring-data/redis/reference/
- Redisson 文档：https://github.com/redisson/redisson/wiki

## D. 自测题

1. Redis 为什么快？单线程模型如何保证并发安全？
2. `SET key value NX EX 30` 中 NX 和 EX 分别起什么作用？
3. `KEYS` 与 `SCAN` 的区别是什么？为什么生产禁用 `KEYS`？
4. String 和 Hash 存对象各有什么优劣？
5. List、Set、ZSet 分别适合什么场景？各举一例。
6. ZSet 的 score 可以重复吗？member 可以重复吗？
7. RDB 与 AOF 各有什么优缺点？混合持久化解决了什么问题？
8. Redis 事务支持回滚吗？Lua 脚本为什么能保证原子性？
9. 什么是缓存穿透、击穿、雪崩？各自的典型解决方案是什么？
10. 为什么释放分布式锁要用 Lua 脚本"先判断 value 再删除"？
11. Redisson 看门狗的作用是什么？
12. `maxmemory-policy` 设置为 `allkeys-lru` 有什么风险？
13. Cluster 为什么是 16384 个槽？哈希标签 `user:{1001}:name` 有什么作用？
14. Bitmap 统计签到和 HyperLogLog 统计 UV 的原理有什么本质区别？
15. 如何发现并处理 Big Key？
16. Pipeline 和事务的区别是什么？
17. Stream 相比 List 做消息队列的优势有哪些？
18. 更新 DB 和删除缓存的顺序应该怎么选？为什么？
19. `OBJECT ENCODING` 显示 `hashtable`，即使数据删到很少也不会变回 `listpack`，为什么？
20. 什么情况下应该用 Redisson 而不是 Jedis？

---

