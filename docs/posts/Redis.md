---
title: Redis
date: 2021-10-06
categories: [NoSQL]
tags: [Redis, 缓存]
description: Redis 数据结构、持久化与缓存应用学习笔记。
coverImg: /images/cover-2.svg
permalink: /posts/redis
---



# 1.NoSQL数据库简介

## 1.1NoSQL数据库概述

> NoSQL最常见的解释是“non-relational”， “Not Only SQL”也被很多人接受。NoSQL仅仅是一个概念，泛指非关系型的数据库，区别于关系数据库，它们不保证关系数据的ACID特性。
>
> NoSQL不依赖业务逻辑方式存储,而已简单的key-value模式存储.因此大大的增加了数据库的扩展能力

## 1.2特点

- 不遵循SQL标准
- 不支持ACID
- 远超SQL的性能

## 1.3NoSQL适用场景

- 对数据高并发的读写
- 海量数据的读写
- 对数据高扩展性的读写

## 1.4NoSQL不适用场景

- 需要事务支持
- 基于sql的结构化查询存储,处理复杂的关系,需要即席查询
- **用不着sql的和用了sql也不行的的情况,考虑NoSQL**

## 1.5常见的NoSQL数据库

### Memcached

> 很**早**出现的NoSQL数据库
>
> 数据都在内存中,一般**不持久化**
>
> 支持简单的key-value模式,**支持类型单一**
>
> 一般是作为缓**存数据库**辅助持久化的数据库

### Redis

> 几乎覆盖了Memcache的绝大部分功能
>
> 数据都在内存中,支持持久化,主要用作备份恢复
>
> 除了支持简单的key-value模式,还支持多种数据结构的存储,比如list,set,hash,zset等.
>
> 一般作为缓存数据库辅助持久化的数据库

### MongoDB

> 高性能,开源,模式自由的文档型数据库
>
> 数据都在内存中,如果内存不足,把不常用的数据保存到硬盘
>
> 虽然是key-value模式,但是对value(尤其是json)提供了丰富的查询功能
>
> 支持二进制数据及大型对象
>
> 可以根据数据的特点替代RDBMS,称为独立的数据库.或者配合RDBMS,存储特点的数据

# 2.Redis6

## 2.1 Redis概述

- Redis是一个开源的key-value系统
- 和Memcached类似,它支持存储的value类型相对更多,包括string(字符串),list(列表),set(集合),zset(sorted set 有序集合)和hash(哈希类型)
- 这些数据类型都支持 push/pop add/remove 及取交集并集和差集及更丰富的操作,而且这些操作都是原子性的
- 在此基础上,Redis支持各种不同方式的排序
- 与Memcached一样,为了保证效率,数据都是缓存在内存中
- 区别的是Redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件
- 并且在此基础上实现了master-slave(主从)同步

## 2.2Redis安装

安装版本

==6.2.1 for Linux（redis-6.2.1.tar.gz）==

安装步骤

1. 安装C语言的编译环境gcc

~~~shell
yum install gcc-c++
~~~

查看gcc版本

~~~shell
gcc --version
~~~

2. 安装tcl

~~~shell
yum install -y tcl
~~~

3. 下载redis-6.2.1.tar.gz

~~~shell
wget http://download.redis.io/releases/redis-3.2.8.tar.gz
~~~

4. 解压

~~~shell
tar -zxvf redis-6.2.1.tar.gz
~~~

5. 解压完成后进入目录

~~~shell
cd redis-6.2.1
~~~

6. 在redis-6.2.1目录下再次执行make命令（只是编译好),如果没有准备好C语言编译环境，make 会报错—Jemalloc/jemalloc.h：没有那个文件.

**解决方案：执行make distclean**

~~~shell
make
~~~

7. 跳过make test 继续执行: make install

~~~shell
make install
~~~

安装完成	

## 2.3安装目录

>  /usr/local/bin

查看默认安装目录：

> redis-benchmark:性能测试工具，可以在自己本子运行，看看自己本子性能如何
>
> redis-check-aof：修复有问题的AOF文件，rdb和aof后面讲
>
> redis-check-dump：修复有问题的dump.rdb文件
>
> redis-sentinel：Redis集群使用
>
> redis-server：Redis服务器启动命令
>
> redis-cli：客户端，操作入口

## 2.4启动Redis

### 1.前台启动

> 前台启动，命令行窗口不能关闭，否则服务器停止

~~~shell
cd /usr/local/bin
redis -server
~~~

### 2.后台启动

1. 备份**redis.conf**(此文件在解压文件里)

拷贝此文件到其他目录,这里拷贝在etc下

2. 后台启动设置**daemonize no**改成**yes**

修改redis.conf(128行)文件将里面的daemonize no 改成 yes，让服务在后台启动

3. **Redis**启动

~~~shell
redis-server /etc/redis.conf
~~~

查看Redis是否启动

~~~shell
ps -ef|grep redis
~~~

4. **用客户端访问：redis-cli**

~~~shell
redis-cli
~~~

多个端口可以：

~~~shell
redis-cli -p6379
~~~

5. 测试验证

~~~shell
ping
~~~

会出现PONG

6. 关闭

~~~shell
redis-cli shutdown
~~~

## 2.5Redis相关知识

> 默认16个数据库，类似数组下标从0开始，初始默认使用0号库
>
> 使用命令 select  &lt;dbid>来切换数据库。如: select 8 
>
> 统一密码管理，所有库同样密码。
>
> dbsize查看当前数据库的key的数量
>
> flushdb清空当前库
>
> flushall通杀全部库
>
> Redis是单线程+多路IO复用技术
>
> 多路复用是指使用一个线程来检查多个文件描述符（Socket）的就绪状态，比如调用select和poll函数，传入多个文件描述符，如果有一个文件描述符就绪，则返回，否则阻塞直到超时。得到就绪状态后进行真正的操作可以在同一个线程里执行，也可以启动线程执行（比如使用线程池）

# 3.常用5大数据类型

> redis常见数据类型操作命令
>
> http://www.redis.cn/commands.html

## 3.1Redis键(key)

> keys * 查看当前库所有key  (匹配：keys *1)
>
> exists key 判断某个key是否存在
>
> type key 查看你的key是什么类型
>
> del key    删除指定的key数据
>
> unlink key  根据value选择非阻塞删除
>
> 仅将keys从keyspace元数据中删除，真正的删除会在后续异步操作。
>
> expire key 10  10秒钟：为给定的key设置过期时间
>
> ttl key 查看还有多少秒过期，-1表示永不过期，-2表示已过期
>
>  
>
> select命令切换数据库
>
> dbsize查看当前数据库的key的数量
>
> flushdb清空当前库
>
> flushall通杀全部库

## 3.2 Redis字符串(String)

### 1.简介

> String是Redis最基本的类型，你可以理解成与Memcached一模一样的类型，一个key对应一个value。
>
> String类型是二进制安全的。意味着Redis的string可以包含任何数据。比如jpg图片或者序列化的对象。
>
> String类型是Redis最基本的数据类型，一个Redis中字符串value最多可以是512M

### 2.常用命令

> *NX：当数据库中key不存在时，可以将key-value添加数据库
>
> *XX：当数据库中key存在时，可以将key-value添加数据库，与NX参数互斥
>
> *EX：key的超时秒数
>
> *PX：key的超时毫秒数，与EX互斥

- set &lt;key> &lt;value> 添加键值对
- get &lt;key> 查询对应键值
- append &lt;key> &lt;value> 将给定的&lt;value> 追加到原值的末尾
- strlen &lt;key> 获得值的长度
- setnx &lt;key> &lt;value> 只有在 key 不存在时设置 key 的值
- incr &lt;key> 将 key 中储存的数字值增1,只能对数字值操作,如果为空,新增值为1
- decr &lt;key> 将 key 中储存的数字值减1,只能对数字值操作,如果为空,新增值为-1
- incrby / decrby &lt;key> &lt;步长> 将 key 中储存的数字值增减。自定义步长。

**原子性**

- mset &lt;key1> &lt;value1> &lt;key2> &lt;value2> ..... 同时设置一个或多个 key-value对 
- mget &lt;key1> &lt;key2> &lt;key3> ..... 同时获取一个或多个 value 
- msetnx &lt;key1> &lt;value1> &lt;key2> &lt;value2> ..... 同时设置一个或多个 key-value 对，当且仅当所有给定 key 都不存在。

**以上三个具有原子性，有一个失败则都失败**

- getrange &lt;key> &lt;起始位置> &lt;结束位置> 获得值的范围，类似java中的substring，**前包，后包**
- setrange &lt;key> &lt;起始位置> &lt;value> 用 &lt;value> 覆写&lt;key>所储存的字符串值，从&lt;起始位置>开始(**索引从0开始**)。
- setex &lt;key> &lt;过期时间> &lt;value> 设置键值的同时，设置过期时间，单位秒。
- getset &lt;key>&lt;value> 以新换旧，设置了新值同时获得旧值。

### 3.数据结构

> String的数据结构为简单动态字符串(Simple Dynamic String,缩写SDS)。是可以修改的字符串，内部结构实现上类似于Java的ArrayList，采用预分配冗余空间的方式来减少内存的频繁分配.

## 3.3Redis列表(List)

### 1.简介

> 单键多值
>
> Redis 列表是简单的字符串列表，按照插入顺序排序。你可以添加一个元素到列表的头部（左边）或者尾部（右边）。
>
> 它的底层实际是个双向链表，对两端的操作性能很高，通过索引下标的操作中间的节点性能会较差。

### 2.常用命令

- lpush/rpush &lt;key>&lt;value1>&lt;value2>&lt;value3> .... 从左边/右边插入一个或多个值。
- lpop/rpop &lt;key>从左边/右边吐出一个值。**值在键在，值光键亡。**
- rpoplpush &lt;key1>&lt;key2>从&lt;key1>列表右边吐出一个值，插到&lt;key2>列表左边。
- lrange &lt;key>&lt;start>&lt;stop> 按照索引下标获得元素(从左到右)
- lrange mylist 0 -1  0左边第一个，-1右边第一个，（0-1表示获取所有）
- lindex &lt;key>&lt;index>按照索引下标获得元素(从左到右)
- llen &lt;key>获得列表长度 
- linsert &lt;key> before &lt;value>&lt;newvalue>在&lt;value>的后面插入&lt;newvalue>插入值
- lrem &lt;key>&lt;n>&lt;value>从左边删除n个value(从左到右)
- lset&lt;key>&lt;index>&lt;value>将列表key下标为index的值替换成value

### 3.数据结构

> List的数据结构为快速链表quickList。
>
> 首先在列表元素较少的情况下会使用一块连续的内存存储，这个结构是ziplist，也即是压缩列表。
>
> 它将所有的元素紧挨着一起存储，分配的是一块连续的内存。
>
> 当数据量比较多的时候才会改成quicklist。
>
> 因为普通的链表需要的附加指针空间太大，会比较浪费空间。比如这个列表里存的只是int类型的数据，结构上还需要两个额外的指针prev和next。
>
> Redis将链表和ziplist结合起来组成了quicklist。也就是将多个ziplist使用双向指针串起来使用。这样既满足了快速的插入删除性能，又不会出现太大的空间冗余。

## 3.4Redis集合(Set)

### 1.简介

> Redis set对外提供的功能与list类似是一个列表的功能，特殊之处在于set是可以**自动排重**的，当你需要存储一个列表数据，又不希望出现重复数据时，set是一个很好的选择，并且set提供了判断某个成员是否在一个set集合内的重要接口，这个也是list所不能提供的。
>
> Redis的Set是string类型的无序集合。它底层其实是一个value为null的hash表，所以添加，删除，查找的**复杂度都是O(1)**。
>
> 一个算法，随着数据的增加，执行时间的长短，如果是O(1)，数据增加，查找数据的时间不变

### 2.常用命令

- sadd &lt;key>&lt;value1>&lt;value2> ..... 将一个或多个 member 元素加入到集合 key 中，已经存在的 member 元素将被忽略
- smembers &lt;key>取出该集合的所有值。
- sismember &lt;key>&lt;value>判断集合&lt;key>是否为含有该&lt;value>值，有1，没有0
- scard&lt;key>返回该集合的元素个数。
- srem &lt;key>&lt;value1>&lt;value2> .... 删除集合中的某个元素。
- spop &lt;key>**随机从该集合中吐出一个值。**
- srandmember &lt;key>&lt;n>随机从该集合中取出n个值。不会从集合中删除 。
- smove &lt;source>&lt;destination>value把集合中一个值从一个集合移动到另一个集合
- sinter &lt;key1>&lt;key2>返回两个集合的交集元素。
- sunion &lt;key1>&lt;key2>返回两个集合的并集元素。
- sdiff &lt;key1>&lt;key2>返回两个集合的**差集**元素(key1中的，不包含key2中的)

### 3.数据结构

> Set数据结构是dict字典，字典是用哈希表实现的。
>
> Java中HashSet的内部实现使用的是HashMap，只不过所有的value都指向同一个对象。Redis的set结构也是一样，它的内部也使用hash结构，所有的value都指向同一个内部值。

## 3.5Redis哈希(Hash)

### 1.简介

> Redis hash 是一个键值对集合。
>
> Redis hash是一个string类型的field和value的映射表，hash特别适合用于存储对象。
>
> 类似Java里面的Map&lt;String,Object>

### 2.常用命令

- hset &lt;key>&lt;field>&lt;value>给&lt;key>集合中的 &lt;field>键赋值&lt;value>
- hget &lt;key1>&lt;field>从&lt;key1>集合&lt;field>取出 value 
- hmset &lt;key1>&lt;field1>&lt;value1>&lt;field2>&lt;value2>... 批量设置hash的值
- hexists&lt;key1>&lt;field>查看哈希表 key 中，给定域 field 是否存在。 
- hkeys &lt;key>列出该hash集合的所有field
- hvals &lt;key>列出该hash集合的所有value
- hincrby &lt;key>&lt;field>&lt;increment>为哈希表 key 中的域 field 的值加上增量 1  -1
- hsetnx &lt;key>&lt;field>&lt;value>将哈希表 key 中的域 field 的值设置为 value ，当且仅当域 field 不存在 .

### 3.数据结构

> Hash类型对应的数据结构是两种：ziplist（压缩列表），hashtable（哈希表）。当field-value长度较短且个数较少时，使用ziplist，否则使用hashtable。

## 3.6Redis有序集合Zset(sorted set)

### 1.简介

> Redis有序集合zset与普通集合set非常相似，是一个没有重复元素的字符串集合。
>
> 不同之处是有序集合的每个成员都关联了一个**评分（score）**,这个评分（score）被用来按照从最低分到最高分的方式排序集合中的成员。集合的成员是唯一的，但是评分可以是重复了 。
>
> 因为元素是有序的, 所以你也可以很快的根据评分（score）或者次序（position）来获取一个范围的元素。
>
> 访问有序集合的中间元素也是非常快的,因此你能够使用有序集合作为一个没有重复成员的智能列表。

### 2.常用命令

- zadd &lt;key>&lt;score1>&lt;value1>&lt;score2>&lt;value2>...将一个或多个 member 元素及其 score 值加入到有序集 key 当中。
- **zrange &lt;key>&lt;start>&lt;stop> [WITHSCORES]**  返回有序集 key 中，下标在&lt;start>&lt;stop>之间的元素,带WITHSCORES，可以让分数一起和值返回到结果集。
- zrangebyscore key minmax [withscores] [limit offset count] 返回有序集 key 中，所有 score 值介于 min 和 max 之间(包括等于 min 或 max )的成员。有序集成员按 score 值递增(从小到大)次序排列。 
- zrevrangebyscore key maxmin [withscores] [limit offset count] 同上，改为从大到小排列。 
- zincrby &lt;key>&lt;increment>&lt;value>   为元素的score加上增量
- zrem &lt;key>&lt;value>删除该集合下，指定值的元素
- zcount &lt;key>&lt;min>&lt;max>统计该集合，分数区间内的元素个数 
- zrank &lt;key>&lt;value>返回该值在集合中的排名，从0开始。

### 3.数据结构

> SortedSet(zset)是Redis提供的一个非常特别的数据结构，一方面它等价于Java的数据结构Map&lt;String, Double>，可以给每一个元素value赋予一个权重score，另一方面它又类似于TreeSet，内部的元素会按照权重score进行排序，可以得到每个元素的名次，还可以通过score的范围来获取元素的列表。
>
> zset底层使用了两个数据结构
>
> （1）hash，hash的作用就是关联元素value和权重score，保障元素value的唯一性，可以通过元素value找到相应的score值。
>
> （2）跳跃表，跳跃表的目的在于给元素value排序，根据score的范围获取元素列表。

# 4.Redis6配置文件详解

## 4.1Units单位

> 配置大小单位,开头定义了一些基本的度量单位，只支持bytes，不支持bit
>
> 大小写不敏感

## 4.2INCLUDES

> 类似jsp中的include，多实例的情况可以把公用的配置文件提取出来

## 4.3网络相关配置

### 1.bind

> 默认情况bind=127.0.0.1只能接受本机的访问请求
>
> 不写的情况下，无限制接受任何ip地址的访问
>
> 生产环境肯定要写你应用服务器的地址；服务器是需要远程访问的，所以需要将其注释掉

==如果开启了protected-mode，那么在没有设定bind ip且没有设密码的情况下，Redis只允许接受本机的响应==

### 2.protected-mode

> 将本机访问保护模式设置no

### 3.port

> 端口号，默认 6379

### 4.tcp-backlog

> 设置tcp的backlog，backlog其实是一个连接队列，backlog队列总和=未完成三次握手队列 + 已经完成三次握手队列。
>
> 在高并发环境下你需要一个高backlog值来避免慢客户端连接问题。
>
> 注意Linux内核会将这个值减小到/proc/sys/net/core/somaxconn的值（128），所以需要确认增大/proc/sys/net/core/somaxconn和/proc/sys/net/ipv4/tcp_max_syn_backlog（128）两个值来达到想要的效果

### 5.timeout

> 一个空闲的客户端维持多少秒会关闭，0表示关闭该功能。即永不关闭。

### 6.tcp-keepalive

> 对访问客户端的一种心跳检测，每个n秒检测一次。
>
> 单位为秒，如果设置为0，则不会进行Keepalive检测，建议设置成60 

## 4.4GENERAL通用

### 1.daemonize

> 是否为后台进程，设置为yes
>
> 守护进程，后台启动

### 2.pidfile

> 存放pid文件的位置，每个实例会产生一个不同的pid文件

### 3.loglevel

> 指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning，默认为**notice**

==四个级别根据使用阶段来选择，生产环境选择notice 或者warning==

### 4.logfile

> 日志文件名称

### 5.databases 16

> 设定库的数量 默认16，默认数据库为0，可以使用SELECT &lt;dbid>命令在连接上指定数据库id

## 4.5SECURITY安全

### 1.设置密码

> 访问密码的查看、设置和取消
>
> 在命令中设置密码，只是临时的。重启redis服务器，密码就还原了。
>
> 永久设置，需要再配置文件中进行设置。

~~~shell
config get requirepass

config set requirepass "123456"

auth 123456
~~~

## 4.6LIMITS(限制)

### 1.maxclients

> 设置redis同时可以与多少个客户端进行连接。
>
> 默认情况下为10000个客户端。
>
> 如果达到了此限制，redis则会拒绝新的连接请求，并且向这些连接请求方发出“max number of clients reached”以作回应。

### 2.maxmemory

> 建议**必须设置**，否则，将内存占满，造成服务器宕机
>
> 设置redis可以使用的内存量。一旦到达内存使用上限，redis将会试图移除内部数据，移除规则可以通过maxmemory-policy来指定。
>
> 如果redis无法根据移除规则来移除内存中的数据，或者设置了“不允许移除”，那么redis则会针对那些需要申请内存的指令返回错误信息，比如SET、LPSH等。
>
> 但是对于无内存申请的指令，仍然会正常响应，比如GET等。如果你的redis是主redis（说明你的redis有从redis），那么在设置内存使用上限时，需要在系统中留出一些内存空间给同步队列缓存，只有在你设置的是“不移除”的情况下，才不用考虑这个因素。

### 3.maxmemory-policy

- volatile-lru：使用LRU算法移除key，只对设置了过期时间的键；（最近最少使用）
- allkeys-lru：在所有集合key中，使用LRU算法移除key
- volatile-random：在过期集合中移除随机的key，只对设置了过期时间的键
- allkeys-random：在所有集合key中，移除随机的key
- volatile-ttl：移除那些TTL值最小的key，即那些最近要过期的key
- noeviction：不进行移除。针对写操作，只是返回错误信息

### 4.maxmemory-samples

> 设置样本数量，LRU算法和最小TTL算法都并非是精确的算法，而是估算值，所以你可以设置样本的大小，redis默认会检查这么多个key并选择其中LRU的那个。
>
> 一般设置3到7的数字，数值越小样本越不准确，但性能消耗越小。



# 5.Redis6的发布和订阅

## 5.1什么是发布和订阅

> Redis 发布订阅 (pub/sub) 是一种消息通信模式：发送者 (pub) 发送消息，订阅者 (sub) 接收消息。

## 5.2Redis的发布和订阅

1.客户端可以订阅频道如下图

![](https://fanaidi.gitee.io/blogimgs/Redis/订阅.png)

2.当给这个频道发布消息后，消息就会发送给订阅的客户端

![](https://fanaidi.gitee.io/blogimgs/Redis/发布.png)

## 5.3发布订阅命令行实现

1. 打开一个客户端订阅channel1

~~~shell
SUBSCRIBE channel1
~~~

2. 打开另一个客户端，给channel1发布消息hello

~~~shell
publish channel1 hello
~~~

返回的1是订阅者数量

3. 打开第一个客户端可以看到发送的消息

==注:发布的消息没有持久化，如果在订阅的客户端收不到hello，只能收到订阅后发布的消息==

# 6.Redis6新数据类型

## 6.1Bitmaps

### 1.简介

> 现代计算机用二进制（位） 作为信息的基础单位， 1个字节等于8位， 例如“abc”字符串是由3个字节组成， 但实际在计算机存储时将其用二进制表示， “abc”分别对应的ASCII码分别是97、 98、 99， 对应的二进制分别是01100001、 01100010和01100011
>
> 合理地使用操作位能够有效地提高内存使用率和开发效率。
>
>    Redis提供了Bitmaps这个“数据类型”可以实现对位的操作：
>
> ​	（1）Bitmaps本身不是一种数据类型， 实际上它就是字符串（key-value） ， 但是它可以对字符串的位进行操作。
>
> ​	（2）Bitmaps单独提供了一套命令， 所以在Redis中使用Bitmaps和使用字符串的方法不太相同。 可以把Bitmaps想象成一个以位为单位的数组， 数		组的每个单元只能存储0和1， 数组的下标在Bitmaps中叫做偏移量。

### 2.命令

- setbit&lt;key>&lt;offset>&lt;value>设置Bitmaps中某个偏移量的值（0或1）,offset:偏移量从0开始
- getbit&lt;key>&lt;offset> 获取Bitmaps中某个偏移量的值
- bitcount&lt;key>[start end] 统计字符串从start字节到end字节比特值为1的数量
- bitop and(or/not/xor) &lt;destkey> [key...] bitop是一个复合操作， 它可以做多个Bitmaps的and（交集） 、 or（并集） 、 not（非） 、 xor（异或） 操作并将结果保存在destkey中。

## 6.2HyperLogLog

### 1.简介

> 在工作当中，我们经常会遇到与统计相关的功能需求，比如统计网站PV（PageView页面访问量）,可以使用Redis的incr、incrby轻松实现。
>
> 但像UV（UniqueVisitor，独立访客）、独立IP数、搜索记录数等需要去重和计数的问题如何解决？这种求集合中不重复元素个数的问题称为基数问题。
>
> 解决基数问题有很多种方案：
>
> （1）数据存储在MySQL表中，使用distinct count计算不重复个数
>
> （2）使用Redis提供的hash、set、bitmaps等数据结构来处理
>
> 以上的方案结果精确，但随着数据不断增加，导致占用空间越来越大，对于非常大的数据集是不切实际的。
>
> 能否能够降低一定的精度来平衡存储空间？Redis推出了HyperLogLog
>
> Redis HyperLogLog 是用来做基数统计的算法，HyperLogLog 的优点是，在输入元素的数量或者体积非常非常大时，计算基数所需的空间总是固定的、并且是很小的。
>
> 在 Redis 里面，每个 HyperLogLog 键只需要花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基数。这和计算基数时，元素越多耗费内存就越多的集合形成鲜明对比。
>
> 但是，因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。
>
> 什么是基数?
>
> 比如数据集 {1, 3, 5, 7, 5, 7, 8}， 那么这个数据集的基数集为 {1, 3, 5 ,7, 8}, 基数(不重复元素)为5。 基数估计就是在误差可接受的范围内，快速计算基数。

### 2.命令

- pfadd &lt;key>&lt; element> [element ...]  添加指定元素到 HyperLogLog 中
- pfcount&lt;key> [key ...] 计算HLL的近似基数，可以计算多个HLL
- pfmerge&lt;destkey>&lt;sourcekey> [sourcekey ...] 将一个或多个HLL合并后的结果存储在另一个HLL中

## 6.3Geospatial

### 1.简介

> Redis 3.2 中增加了对GEO类型的支持。GEO，Geographic，地理信息的缩写。该类型，就是元素的2维坐标，在地图上就是经纬度。redis基于该类型，提供了经纬度设置，查询，范围查询，距离查询，经纬度Hash等常见操作。

### 2.命令

- geoadd&lt;key>&lt; longitude>&lt;latitude>&lt;member> [longitude latitude member...]  添加地理位置（经度，纬度，名称）

  两极无法直接添加，一般会下载城市数据，直接通过 Java 程序一次性导入。

  有效的经度从 -180 度到 180 度。有效的纬度从 -85.05112878 度到 85.05112878 度。

  当坐标位置超出指定范围时，该命令将会返回一个错误。

  已经添加的数据，是无法再次往里面添加的。

- geopos &lt;key>&lt;member> [member...] 获得指定地区的坐标值

- geodist&lt;key>&lt;member1>&lt;member2> [m|km|ft|mi ] 获取两个位置之间的直线距离

- georadius&lt;key>&lt; longitude>&lt;latitude>radius m|km|ft|mi  以给定的经纬度为中心，找出某一半径内的元素

# 7.Jedis操作Redis6

## 7.1 Redis_Jedis_测试

### 1.创建Maven工程,导入依赖

~~~xml
&lt;dependency>
    &lt;groupId>redis.clients&lt;/groupId>
    &lt;artifactId>jedis&lt;/artifactId>
    &lt;version>3.2.0&lt;/version>
&lt;/dependency>
~~~

### 2.测试

~~~java
public class JedisDemo1 {
    public static void main(String[] args) {
        //创建Jedis对象
        Jedis jedis = new Jedis("192.168.244.131",6379);
        //测试
        String ping = jedis.ping();
        System.out.println(ping);//输出PONG,说明连接Redis成功
    }
}
~~~

### 3.注意事项

(1)redis.conf中注释掉bind 127.0.0.1,然后修改protected-mode的值为no,**重启Redis**

(2)禁用Linux的防火墙:Linux(CentOS7)里执行命令

关闭防火墙

~~~shell
systemctl stop firewalld.service
~~~

禁止firewall开机启动

~~~shell
systemctl disable firewalld.service
~~~

## 7.2 测试相关数据类型

### Jedis-API: Key

~~~java
//设置键值对
jedis.set("name","张三");
jedis.set("age","14");
jedis.set("gender","男");
//通过键获取值
String name = jedis.get("name");
System.out.println(name);
//获取所有的键
Set&lt;String> keys = jedis.keys("*");
for (String key : keys){
    System.out.println(key);
}
//判断是否存在某个键
System.out.println("是否存在name:"+jedis.exists("name"));
//查看键失效的时间
System.out.println("name的失效时间:"+jedis.ttl("name"));
~~~

**输出结果**

~~~
张三
gender
name
age
是否存在name:true
name的失效时间:-1
~~~

### Jedis-API:  String

~~~java
//设置多个键值对
jedis.mset("str1","v1","str2","v2","str3","v3");
System.out.println(jedis.mget("str1","str2","str3"));
~~~

**输出结果**

[v1, v2, v3]

### Jedis-API:  List

~~~java
//向列表添加元素
jedis.lpush("list", "l1", "l2", "l3");
//获取列表
List&lt;String> list = jedis.lrange("list", 0, -1);
System.out.println(list);
~~~

**输出结果**

[l3, l2, l1]

### Jedis-API:  set

~~~java
//向集合添加元素
jedis.sadd("name","lucy");
jedis.sadd("name","kitty");
//获取集合中的元素
Set&lt;String> name = jedis.smembers("name");
System.out.println(name);
~~~

**输出结果**

[lucy, kitty]

### Jedis-API:  hash

```java
jedis.hset("users","age","20");
String age = jedis.hget("users", "age");
System.out.println(age);
```

**输出结果**

20

### Jedis-API:  zset

~~~java
jedis.zadd("china",100d,"上海");
Set&lt;String> china = jedis.zrange("china", 0, -1);
System.out.println(china);
~~~

**输出结果**

[上海]

# 8.Redis6与SpringBoot整合

## 整合步骤

1. 在pom.xml文件中引入Redis相关依赖

~~~xml
<!--Redis-->
&lt;dependency>
    &lt;groupId>org.springframework.boot&lt;/groupId>
    &lt;artifactId>spring-boot-starter-data-redis&lt;/artifactId>
&lt;/dependency>
<!-- spring2.X集成redis所需common-pool2-->
&lt;dependency>
    &lt;groupId>org.apache.commons&lt;/groupId>
    &lt;artifactId>commons-pool2&lt;/artifactId>
    &lt;version>2.6.0&lt;/version>
&lt;/dependency>
~~~

2. application.yml中配置Redis

~~~yaml
spring:
  redis:
    host: 192.168.244.131     #Redis服务器地址
    port: 6379                #Redis服务器连接端口
    database: 0               #Redis数据库索引（默认为0）
    connect-timeout: 1800000  #连接超时时间（毫秒）
    lettuce:
      pool:
        max-active: 20        #连接池最大连接数（使用负值表示没有限制）
        max-idle: 5           #连接池中的最大空闲连接
        max-wait: -1          #最大阻塞等待时间(负数表示没限制)
        min-idle: 0           #连接池中的最小空闲连接
~~~

3. 添加redis配置类

~~~java
@EnableCaching
@Configuration
public class RedisConfig extends CachingConfigurerSupport {

    @Bean
    public RedisTemplate&lt;String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate&lt;String, Object> template = new RedisTemplate&lt;>();
        RedisSerializer&lt;String> redisSerializer = new StringRedisSerializer();
        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);
        template.setConnectionFactory(factory);
        //key序列化方式
        template.setKeySerializer(redisSerializer);
        //value序列化
        template.setValueSerializer(jackson2JsonRedisSerializer);
        //value hashmap序列化
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisSerializer&lt;String> redisSerializer = new StringRedisSerializer();
        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
        //解决查询缓存转换异常的问题
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);
        // 配置序列化（解决乱码的问题）,过期时间600秒
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(600))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(redisSerializer))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer))
                .disableCachingNullValues();
        RedisCacheManager cacheManager = RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .build();
        return cacheManager;
    }
}
~~~

4. 测试

~~~java
@Controller
public class RedisController {


    @Resource
    private RedisTemplate redisTemplate;

    @ResponseBody
    @GetMapping("/redis")
    public String testRedis(){
        //设置值到redis
        redisTemplate.opsForValue().set("name","lucy");
        //从redis获取值
        String name = (String) redisTemplate.opsForValue().get("name");
        return name;
    }
}
~~~

# 9.Redis6的事务操作

## Redis的事务定义

> Redis事务是一个单独的隔离操作：事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。
>
> Redis事务的主要作用就是串联多个命令防止别的命令插队。

## Multi、Exec、discard

> 从输入Multi命令开始，输入的命令都会依次进入命令队列中，但不会执行，直到输入Exec后，Redis会将之前的命令队列中的命令依次执行。
>
> 组队的过程中可以通过discard来放弃组队。 

![](https://fanaidi.gitee.io/blogimgs/Redis/事务.png)

## 事务的错误处理

> 组队中某个命令出现了报告错误，执行时整个的所有队列都会被取消。
>
> 如果执行阶段某个命令报出了错误，则只有报错的命令不会被执行，而其他的命令都会执行，不会回滚。

## 悲观锁

> **悲观锁(Pessimistic Lock)**, 顾名思义，就是很悲观，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会block直到它拿到锁。**传统的关系型数据库里边就用到了很多这种锁机制**，比如**行锁**，**表锁**等，**读锁**，**写锁**等，都是在做操作之前先上锁。

## 乐观锁

> **乐观锁(Optimistic Lock),** 顾名思义，就是很乐观，每次去拿数据的时候都认为别人不会修改，所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据，可以使用版本号等机制。**乐观锁适用于多读的应用类型，这样可以提高吞吐量**。Redis就是利用这种check-and-set机制实现事务的。

## WATCH key [key ...]

> 在执行multi之前，先执行watch key1 [key2],可以监视一个(或多个) key ，如果在事务**执行之前这个(****或这些) key** **被其他命令所改动，那么事务将被打断。**

## unwatch

> 取消 WATCH 命令对所有 key 的监视。
>
> 如果在执行 WATCH 命令之后，EXEC 命令或DISCARD 命令先被执行了的话，那么就不需要再执行UNWATCH 了。

## Redis事务三特性

- 单独的隔离操作 
  - 事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。
- 没有隔离级别的概念 
  - 队列中的命令没有提交之前都不会实际被执行，因为事务提交前任何指令都不会被实际执行
- 不保证原子性 
  - 事务中如果有一条命令执行失败，其后的命令仍然会被执行，没有回滚 

# 10.Redis6持久化之RDB

## RDB简介

> 在指定的时间间隔内将内存中的数据集快照写入磁盘， 也就是行话讲的Snapshot快照，它恢复时是将快照文件直接读到内存里

## 备份是如何执行的

> Redis会单独创建（fork）一个子进程来进行持久化，会先将数据写入到 一个临时文件中，待持久化过程都结束了，再用这个临时文件替换上次持久化好的文件。 整个过程中，主进程是不进行任何IO操作的，这就确保了极高的性能 如果需要进行大规模数据的恢复，且对于数据恢复的完整性不是非常敏感，那RDB方式要比AOF方式更加的高效。**RDB**的缺点是最后一次持久化后的数据可能丢失。

## Fork

- Fork的作用是复制一个与当前进程一样的进程。新进程的所有数据（变量、环境变量、程序计数器等） 数值都和原进程一致，但是是一个全新的进程，并作为原进程的子进程
- 在Linux程序中，fork()会产生一个和父进程完全相同的子进程，但子进程在此后多会exec系统调用，出于效率考虑，Linux中引入了“**写时复制技术**”
- **一般情况父进程和子进程会共用同一段物理内存**，只有进程空间的各段的内容要发生变化时，才会将父进程的内容复制一份给子进程。

## RDB持久化流程

![](https://fanaidi.gitee.io/blogimgs/Redis/RDB持久化流程.png)

## dump.rdb文件

> 在redis.conf中配置文件名称，默认为dump.rdb

### 1.配置位置

> rdb文件的保存路径，也可以修改。默认为Redis启动时命令行所在的目录下
>
> dir "/myredis/"

### 2.如何触发RDB快照；保持策略

#### 2.1配置文件中默认的快照配置

![](https://fanaidi.gitee.io/blogimgs/Redis/RDB快照配置.png)

#### 2.2命令save VS bgsave

> save ：save时只管保存，其它不管，全部阻塞。手动保存。不建议。
>
> bgsave：Redis会在后台异步进行快照操作，快照同时还可以响应客户端请求。
>
> 可以通过lastsave 命令获取最后一次成功执行快照的时间

#### 2.3flushall命令

> 执行flushall命令，也会产生dump.rdb文件，但里面是空的，无意义

#### 2.4 save

> 格式：save 秒钟 写操作次数
>
> RDB是整个内存的压缩过的Snapshot，RDB的数据结构，可以配置复合的快照触发条件，
>
> 默认是1分钟内改了1万次，或5分钟内改了10次，或15分钟内改了1次。
>
> 禁用
>
> 不设置save指令，或者给save传入空字符串

#### 2.5stop-writes-on-bgsave-error

> 当Redis无法写入磁盘的话，直接关掉Redis的写操作。推荐yes.

#### 2.6rdbcompression压缩文件

> 对于存储到磁盘中的快照，可以设置是否进行压缩存储。如果是的话，redis会采用LZF算法进行压缩。
>
> 如果你不想消耗CPU来进行压缩的话，可以设置为关闭此功能。推荐yes.

#### 2.7rdbchecksum 检查完整性

> 在存储快照后，还可以让redis使用CRC64算法来进行数据校验，
>
> 但是这样做会增加大约10%的性能消耗，如果希望获取到最大的性能提升，可以关闭此功能
>
> 推荐yes.

## RDB的备份

> 先通过config get dir 查询rdb文件的目录 
>
> 将*.rdb的文件拷贝到别的地方
>
> rdb的恢复
>
> 1. 关闭Redis
>
> 2. 先把备份的文件拷贝到工作目录下 cp dump2.rdb dump.rdb
>
> 3. 启动Redis, 备份数据会直接加载

## 优势

- 适合大规模的数据恢复

- 对数据完整性和一致性要求不高更适合使用

- 节省磁盘空间

- 恢复速度快

## 劣势

- Fork的时候，内存中的数据被克隆了一份，大致2倍的膨胀性需要考虑

- 虽然Redis在fork时使用了**写时拷贝技术**,但是如果数据庞大时还是比较消耗性能。

- 在备份周期在一定间隔时间做一次备份，所以如果Redis意外down掉的话，就会丢失最后一次快照后的所有修改。

## 如何停止

> 动态停止RDB：redis-cli config set save ""#save后给空值，表示禁用保存策略



# 11.Redis6持久化之AOF

## AOF简介

> AOF(Append Only File)
>
> 以**日志**的形式来记录每个写操作（增量保存），将Redis执行过的所有写指令记录下来(**读操作不记录**)， **只许追加文件但不可以改写文件**，redis启动之初会读取该文件重新构建数据，换言之，redis 重启的话就根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复工作

## AOF持久化流程

1. 客户端的请求写命令会被append追加到AOF缓冲区内；
2. AOF缓冲区根据AOF持久化策略[always,everysec,no]将操作sync同步到磁盘的AOF文件中；
3. AOF文件大小超过重写策略或手动重写时，会对AOF文件rewrite重写，压缩AOF文件容量；
4. Redis服务重启时，会重新load加载AOF文件中的写操作达到数据恢复的目的；

![](https://fanaidi.gitee.io/blogimgs/Redis/AOF持久化流程.png)

## AOF默认不开启

> 可以在redis.conf中配置文件名称，默认为 appendonly.aof
>
> AOF文件的保存路径，同RDB的路径一致。

## AOF和RDB同时开启，redis听谁的?

> AOF和RDB同时开启，系统默认取AOF的数据（数据不会存在丢失）

## AOF启动/修复/恢复

- AOF的备份机制和性能虽然和RDB不同, 但是备份和恢复的操作同RDB一样，都是拷贝备份文件，需要恢复时再拷贝到Redis工作目录下，启动系统即加载。

- 正常恢复
  - 修改默认的appendonly no，改为yes
  - 将有数据的aof文件复制一份保存到对应目录(查看目录：config get dir)
  - 恢复：重启redis然后重新加载

- 异常恢复
  - 修改默认的appendonly no，改为yes
  - 如遇到**AOF**文件损坏**，通过/usr/local/bin/**redis-check-aof--fix appendonly.aof进行恢复
  - 备份被写坏的AOF文件
  - 恢复：重启redis，然后重新加载

## AOF同步频率设置

> appendfsync always
>
> 始终同步，每次Redis的写入都会立刻记入日志；性能较差但数据完整性比较好
>
> appendfsync everysec
>
> 每秒同步，每秒记入日志一次，如果宕机，本秒的数据可能丢失。
>
> appendfsync no
>
> redis不主动进行同步，把同步时机交给操作系统。

## Rewrite压缩

> AOF采用文件追加方式，文件会越来越大为避免出现此种情况，新增了重写机制, 当AOF文件的大小超过所设定的阈值时，Redis就会启动AOF文件的内容压缩， 只保留可以恢复数据的最小指令集.可以使用命令bgrewriteaof

## 优势

- 备份机制更稳健，丢失数据概率更低。

- 可读的日志文本，通过操作AOF稳健，可以处理误操作。

## 劣势

- 比起RDB占用更多的磁盘空间。
- 恢复备份速度要慢。
- 每次读写都同步的话，有一定的性能压力。
- 存在个别Bug，造成恢复不能。

## 总结

> 官方推荐两个都启用。
>
> 如果对数据不敏感，可以选单独用RDB。
>
> 不建议单独用 AOF，因为可能会出现Bug。
>
> 如果只是做纯内存缓存，可以都不用。

### 官方建议

- RDB持久化方式能够在指定的时间间隔能对你的数据进行快照存储
- AOF持久化方式记录每次对服务器写的操作,当服务器重启的时候会重新执行这些命令来恢复原始的数据,AOF命令以redis协议追加保存每次写的操作到文件末尾. 
- Redis还能对AOF文件进行后台重写,使得AOF文件的体积不至于过大
- 只做缓存：如果你只希望你的数据在服务器运行的时候存在,你也可以不使用任何持久化方式.
- 同时开启两种持久化方式
- 在这种情况下,当redis重启的时候会优先载入AOF文件来恢复原始的数据, 因为在通常情况下AOF文件保存的数据集要比RDB文件保存的数据集要完整.
- RDB的数据不实时，同时使用两者时服务器重启也只会找AOF文件。那要不要只使用AOF呢？ 
- 建议不要，因为RDB更适合用于备份数据库(AOF在不断变化不好备份)， 快速重启，而且不会有AOF可能潜在的bug，留着作为一个万一的手段。
- 性能建议

> 因为RDB文件只用作后备用途，建议只在Slave上持久化RDB文件，而且只要15分钟备份一次就够了，只保留save 900 1这条规则。
>
> 如果使用AOF，好处是在最恶劣情况下也只会丢失不超过两秒数据，启动脚本较简单只load自己的AOF文件就可以了。
>
> 代价,一是带来了持续的IO，二是AOF rewrite的最后将rewrite过程中产生的新数据写到新文件造成的阻塞几乎是不可避免的。
>
> 只要硬盘许可，应该尽量减少AOF rewrite的频率，AOF重写的基础大小默认值64M太小了，可以设到5G以上。
>
> 默认超过原大小100%大小时重写可以改到适当的数值。

# 12.Redis6主从复制

## 简介

> 主机数据更新后根据配置和策略， 自动同步到备机的master/slaver机制，**Master以写为主**，**Slave以读为主**

## 作用

- 读写分离，性能扩展
- 容灾快速恢复

## 实现步骤

0. 开启daemonize yes,Appendonly 关掉

1. 根目录下新建**myredis**目录,并将**redis.conf**文件拷贝到**myredis**里面
2. 新建**redis6379.conf**,填写一下内容

~~~
include /myredis/redis.conf
pidfile /var/run/redis_6379.pid
port 6379
dbfilename dump6379.rdb
~~~

3. 新建**redis6380.conf**,填写的内容和步骤2类似,将所有的6379替换为6380

4. 新建**redis6381.conf**,填写的内容和步骤2类似,将所有的6379替换为6381
5. 启动三台redis服务器

~~~shell
redis-server redis6379.conf
redis-server redis6380.conf
redis-server redis6381.conf
~~~

6. 查看三台服务器是否启动

~~~shell
ps -ef|grep redis
~~~

![](https://fanaidi.gitee.io/blogimgs/Redis/查看三台服务器是否启动.jpg)

7. 查看三台主机运行情况

~~~shell
info replication
打印主从复制的相关信息
~~~

8.配从(库)不配主(库)

~~~shell
slaveof  &lt;ip>&lt;port>
成为某个实例的从服务器
在6380和6381上执行: slaveof 127.0.0.1 6379
~~~

9.在主机上写，在从机上可以读取数据,在从机上写数据报错

**注意:**

> 主机挂掉，重启就行，一切如初
>
> 从机重启需重设：slaveof 127.0.0.1 6379
>
> slave-priority 10 设置从机的优先级，值越小，优先级越高，用于选举主机时使用。默认100

## 常用3招

### 一主二仆

> **1.主机不配置，从机使用slaveof声明所属主机。**
>
> **2.主机如果宕机，重启后自动恢复到之前的转态，不需要再做其他任何修改，再新增加数据，从机可以读到数据。**
>
> **3.从机如果宕机，再次重启后，再次读数据，读不到。需要使用slaveof再次声明所属主机，声明之后可以再次读取数据。**
>
> **4.主机可写可读，从机只可以读，不可以写。**
>
> **5.从机使用slaveof声明所属主机是，会发送sync到主机，获取主机的rdb文件，执行，实现数据同步，以后再增数据，使用增量复制完成同步。如果是宕机后再次声明所属主机，则使用全量复制完成同步。**

### 薪火相传

> 上一个Slave可以是下一个slave的Master，Slave同样可以接收其他 slaves的连接和同步请求，那么该slave作为了链条中下一个的master, 可以有效减轻master的写压力,去中心化降低风险。
>
> 用 slaveof &lt;ip>&lt;port>
>
> 中途变更转向:会清除之前的数据，重新建立拷贝最新的
>
> 风险是一旦某个slave宕机，后面的slave都没法备份
>
> 主机挂了，从机还是从机，无法写数据了

### 反客为主

> 当一个master宕机后，后面的slave可以立刻升为master，其后面的slave不用做任何修改。
>
> 用 slaveof no one  将从机变为主机。

**复制原理**

- Slave启动成功连接到master后会发送一个sync命令
- Master接到命令启动后台的存盘进程，同时收集所有接收到的用于修改数据集命令， 在后台进程执行完毕之后，master将传送整个数据文件到slave,以完成一次完全同步
- 全量复制：而slave服务在接收到数据库文件数据后，将其存盘并加载到内存中。
- 增量复制：Master继续将新的所有收集到的修改命令依次传给slave,完成同步
- 但是只要是重新连接master,一次完全同步（全量复制)将被自动执行

## 哨兵模式

### 简介

> **反客为主的自动版**，能够后台监控主机是否故障，如果故障了根据投票数自动将从库转换为主库

### 使用步骤

1. 调整为一主二仆模式，6379带着6380、6381
2. 自定义的/myredis目录下新建sentinel.conf文件，名字绝不能错
3. 配置哨兵,填写内容

~~~shell
sentinel monitor mymaster 127.0.0.1 6379 1
其中mymaster为监控对象起的服务器名称， 1 为至少有多少个哨兵同意迁移的数量。
~~~

4. 启动哨兵

~~~shell
cd /usr/local/bin
redis-sentinel  /myredis/sentinel.conf
~~~

5. 当主机挂掉，从机选举中产生新的主机

> (大概10秒左右可以看到哨兵窗口日志，切换了新的主机)
>
> 哪个从机会被选举为主机呢？根据优先级别：slave-priority 
>
> 原主机重启后会变为从机。

### 复制延时

> 由于所有的写操作都是先在Master上操作，然后同步更新到Slave上，所以从Master同步到Slave机器有一定的延迟，当系统很繁忙的时候，延迟问题会更加严重，Slave机器数量的增加也会使这个问题更加严重。

### 故障恢复

![](https://fanaidi.gitee.io/blogimgs/Redis/故障恢复.jpg)

> 优先级在redis.conf中默认：slave-priority 100，值越小优先级越高
>
> 偏移量是指获得原主机数据最全的
>
> 每个redis实例启动后都会随机生成一个40位的runid

# 13.Redis6集群

## 简介

> Redis 集群实现了对Redis的水平扩容，即启动N个redis节点，将整个数据库分布存储在这N个节点中，每个节点存储总数据的1/N。
>
> Redis 集群通过分区（partition）来提供一定程度的可用性（availability）： 即使集群中有一部分节点失效或者无法进行通讯， 集群也可以继续处理命令请求。

详情请看https://www.cnblogs.com/yufeng218/p/13688582.html

# 14.Redis6应用问题解决

## 缓存穿透

### 问题描述

> key对应的数据在数据源并不存在，每次针对此key的请求从缓存获取不到，请求都会压到数据源，从而可能压垮数据源。比如用一个不存在的用户id获取用户信息，不论缓存还是数据库都没有，若黑客利用此漏洞进行攻击可能压垮数据库。

![](https://fanaidi.gitee.io/blogimgs/Redis/缓存穿透.png)

### 解决方案

一个一定不存在缓存及查询不到的数据，由于缓存是不命中时被动写的，并且出于容错考虑，如果从存储层查不到数据则不写入缓存，这将导致这个不存在的数据每次请求都要到存储层去查询，失去了缓存的意义。

解决方案：

（1）  **对空值缓存：**如果一个查询返回的数据为空（不管是数据是否不存在），我们仍然把这个空结果（null）进行缓存，设置空结果的过期时间会很短，最长不超过五分钟

（2）  **设置可访问的名单（白名单）：**

使用bitmaps类型定义一个可以访问的名单，名单id作为bitmaps的偏移量，每次访问和bitmap里面的id进行比较，如果访问id不在bitmaps里面，进行拦截，不允许访问。

（3）  **采用布隆过滤器**：(布隆过滤器（Bloom Filter）是1970年由布隆提出的。它实际上是一个很长的二进制向量(位图)和一系列随机映射函数（哈希函数）。

布隆过滤器可以用于检索一个元素是否在一个集合中。它的优点是空间效率和查询时间都远远超过一般的算法，缺点是有一定的误识别率和删除困难。)

将所有可能存在的数据哈希到一个足够大的bitmaps中，一个一定不存在的数据会被 这个bitmaps拦截掉，从而避免了对底层存储系统的查询压力。

（4）  **进行实时监控：**当发现Redis的命中率开始急速降低，需要排查访问对象和访问的数据，和运维人员配合，可以设置黑名单限制服务

## 缓存击穿

### 问题描述

> key对应的数据存在，但在redis中过期，此时若有大量并发请求过来，这些请求发现缓存过期一般都会从后端DB加载数据并回设到缓存，这个时候大并发的请求可能会瞬间把后端DB压垮。

![](https://fanaidi.gitee.io/blogimgs/Redis/缓存击穿.png)

### 解决方案

key可能会在某些时间点被超高并发地访问，是一种非常“热点”的数据。这个时候，需要考虑一个问题：缓存被“击穿”的问题。

解决问题：

（1）预先设置热门数据：在redis高峰访问之前，把一些热门数据提前存入到redis里面，加大这些热门数据key的时长

 (2）实时调整：现场监控哪些数据热门，实时调整key的过期时长

（3）使用锁：

​	（1）  就是在缓存失效的时候（判断拿出来的值为空），不是立即去load db。

​	（2）  先使用缓存工具的某些带成功操作返回值的操作（比如Redis的SETNX）去set一个mutex key

​	（3）  当操作返回成功时，再进行load db的操作，并回设缓存,最后删除mutex key；

​	（4）  当操作返回失败，证明有线程在load db，当前线程睡眠一段时间再重试整个get缓存的方法。

![](https://fanaidi.gitee.io/blogimgs/Redis/缓存击穿解决.png)

## 缓存雪崩

### 问题描述

> key对应的数据存在，但在redis中过期，此时若有大量并发请求过来，这些请求发现缓存过期一般都会从后端DB加载数据并回设到缓存，这个时候大并发的请求可能会瞬间把后端DB压垮。
>
> 缓存雪崩与缓存击穿的区别在于这里针对很多key缓存，前者则是某一个key

正常访问

![](https://fanaidi.gitee.io/blogimgs/Redis/缓存雪崩-正常访问.png)

缓存失效瞬间

![](https://fanaidi.gitee.io/blogimgs/Redis/缓存雪崩-缓存失效瞬间.png)

### 解决方案

缓存失效时的雪崩效应对底层系统的冲击非常可怕！

解决方案：

**（1）**  **构建多级缓存架构：**nginx缓存 + redis缓存 +其他缓存（ehcache等）

**（2）**  **使用锁或队列：**

用加锁或者队列的方式保证来保证不会有大量的线程对数据库一次性进行读写，从而避免失效时大量的并发请求落到底层存储系统上。不适用高并发情况

**（3）**  **设置过期标志更新缓存：**

记录缓存数据是否过期（设置提前量），如果过期会触发通知另外的线程在后台去更新实际key的缓存。

**（4）**  **将缓存失效时间分散开：**

比如我们可以在原有的失效时间基础上增加一个随机值，比如1-5分钟随机，这样每一个缓存的过期时间的重复率就会降低，就很难引发集体失效的事件。

# 15.Redis6新功能

## ACL

### 简介

> Redis ACL是Access Control List（访问控制列表）的缩写，该功能允许根据可以执行的命令和可以访问的键来限制某些连接。
>
> 在Redis 5版本之前，Redis 安全规则只有密码控制 还有通过rename 来调整高危命令比如 flushdb ， KEYS* ， shutdown 等。Redis 6 则提供ACL的功能对用户进行更细粒度的权限控制 ：
>
> （1）接入权限:用户名和密码 
>
> （2）可以执行的命令 
>
> （3）可以操作的 KEY

### 命令

- 使用acl list命令展现用户权限列表

  数据说明

  ![](https://fanaidi.gitee.io/blogimgs/Redis/ACL.png)

- 使用acl cat命令

  - 查看添加权限指令类别

    ​	![](https://fanaidi.gitee.io/blogimgs/Redis/ACL-CAT.png)

  - 加参数类型名可以查看类型下具体命令

    ​	![](https://fanaidi.gitee.io/blogimgs/Redis/ACL-CAT-STRING.png)

- 使用acl whoami命令查看当前用户

  - ~~~shell
    acl whoami
    ~~~

- 使用aclsetuser命令创建和编辑用户ACL

  - ACL规则

    - 下面是有效ACL规则的列表。某些规则只是用于激活或删除标志，或对用户ACL执行给定更改的单个单词。其他规则是字符前缀，它们与命令或类别名称、键模式等连接在一起。

    | ACL规则              |                                                              |                                                    |
    | -------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
    | 类型                 | 参数                                                         | 说明                                               |
    | 启动和禁用用户       | **on**                                                       | 激活某用户账号                                     |
    | **off**              | 禁用某用户账号。注意，已验证的连接仍然可以工作。如果默认用户被标记为off，则新连接将在未进行身份验证的情况下启动，并要求用户使用AUTH选项发送AUTH或HELLO，以便以某种方式进行身份验证。 |                                                    |
    | 权限的添加删除       | **+&lt;command>**                                               | 将指令添加到用户可以调用的指令列表中               |
    | **-&lt;command>**       | 从用户可执行指令列表移除指令                                 |                                                    |
    | **+@&lt;category>**     | 添加该类别中用户要调用的所有指令，有效类别为@admin、@set、@sortedset...等，通过调用ACL CAT命令查看完整列表。特殊类别@all表示所有命令，包括当前存在于服务器中的命令，以及将来将通过模块加载的命令。 |                                                    |
    | -@&lt;actegory>         | 从用户可调用指令中移除类别                                   |                                                    |
    | **allcommands**      | +@all的别名                                                  |                                                    |
    | **nocommand**        | -@all的别名                                                  |                                                    |
    | 可操作键的添加或删除 | **~&lt;pattern>**                                               | 添加可作为用户可操作的键的模式。例如~*允许所有的键 |

  - 通过命令创建新用户默认权限

    - ~~~shell
      acl setuser user1
      ~~~

    - 在上面的示例中，我根本没有指定任何规则。如果用户不存在，这将使用just created的默认属性来创建用户。如果用户已经存在，则上面的命令将不执行任何操作。

- 设置有用户名、密码、ACL权限、并启用的用户

  - ~~~shell
    acl setuser user2 on >password ~cached:* +get
    ~~~

- 切换用户，验证权限

  - ~~~shell
    auth user2 password
    ~~~

## IO多线程

### 简介

> IO多线程其实指**客户端交互部分**的**网络IO**交互处理模块**多线程**，而非**执行命令多线程**。Redis6执行命令依然是单线程。
>
> 另外，多线程IO默认也是不开启的，需要再配置文件中配置
>
> io-threads-do-reads yes 
>
> io-threads 4

### 原理架构

> Redis 6 加入多线程,但跟 Memcached 这种从 IO处理到数据访问多线程的实现模式有些差异。Redis 的多线程部分只是用来处理网络数据的读写和协议解析，执行命令仍然是单线程。之所以这么设计是不想因为多线程而变得复杂，需要去控制 key、lua、事务，LPUSH/LPOP 等等的并发问题。整体的设计大体如下:

![](https://fanaidi.gitee.io/blogimgs/Redis/IO原理架构.png)

## 工具支持Cluster

> 之前老版Redis想要搭集群需要单独安装ruby环境，Redis 5 将 redis-trib.rb 的功能集成到 redis-cli 。另外官方 redis-benchmark 工具开始支持 cluster 模式了，通过多线程的方式对多个分片进行压测。