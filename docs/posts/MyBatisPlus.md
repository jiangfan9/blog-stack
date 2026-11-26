---
title: MyBatisPlus
date: 2022-07-28
categories: [后端]
tags: [MyBatis-Plus, ORM, 分页, 代码生成]
description: MyBatis-Plus 学习笔记，涵盖 BaseMapper、Wrapper、IService、分页插件与多租户。
coverImg: /images/cover-1.svg
permalink: /posts/mybatis-plus
---

# MyBatis-Plus 系统学习指南：从基础到高阶

> 一份带代码示例的渐进式学习文档。以 **MyBatis-Plus 3.5.x + Spring Boot 3.x**（Java 17+）为主线。MyBatis-Plus（简称 MP）是 MyBatis 的增强工具，在 MyBatis 的基础上只做增强不做改变，为简化开发、提高效率而生。

## 目录

- [写在前面](#写在前面)
- [第一部分：基础篇](#第一部分基础篇)
- [第二部分：进阶篇](#第二部分进阶篇)
- [第三部分：高阶篇](#第三部分高阶篇)
- [附录：学习路线与资源](#附录学习路线与资源)

---

## 写在前面

### MyBatis-Plus 是什么

MyBatis-Plus 是一个 MyBatis 的增强工具，特点是：

- **只做增强不做改变**：引入它不会对现有 MyBatis 工程产生影响
- **开箱即用**：单表 CRUD 无需写 SQL，直接调用方法
- **强大条件构造器**：链式 API 构建复杂查询条件
- **内置功能**：代码生成、分页、逻辑删除、乐观锁、自动填充、多租户等

```
MyBatis  ──增强──>  MyBatis-Plus
 手写 SQL            BaseMapper（通用 CRUD）
                    Wrapper（条件构造器）
                    IService（通用 Service）
                    插件体系（分页/乐观锁/多租户...）
```

### 与 MyBatis 的分工

| 场景 | 推荐方式 |
|------|---------|
| 单表 CRUD | MP 的 BaseMapper / IService |
| 简单条件查询 | MP 的 Wrapper 条件构造器 |
| 复杂多表 join、复杂 SQL | MyBatis 自定义 XML |
| 两者混用 | MP 与原生 MyBatis 完全兼容 |

### 版本说明

| 技术 | 本文主线 | 说明 |
|------|---------|------|
| MyBatis-Plus | 3.5.x | 主流稳定版 |
| mybatis-plus-boot-starter | 3.5.x | Spring Boot 2/3 均支持，按 Boot 版本选择 |
| Spring Boot | 3.x | Java 17+；Boot 2.x 用 Java 8 |

### 快速开始

```xml
<!-- pom.xml 核心依赖（Spring Boot 3） -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.5</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<!-- 代码生成器（进阶篇用） -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.5.5</version>
    <scope>test</scope>
</dependency>
```

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.example.entity
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl # 开发时打印 SQL
  global-config:
    db-config:
      id-type: auto              # 主键策略：自增
      logic-delete-field: deleted # 逻辑删除字段名
      logic-delete-value: 1       # 删除后的值
      logic-not-delete-value: 0   # 未删除的值
```

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class App {
    public static void main(String[] args) { SpringApplication.run(App.class, args); }
}
```

---

# 第一部分：基础篇

## 1. 实体类与注解

```java
package com.example.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("t_user")   // 表名映射，类名与表名不一致时必须指定
public class User {

    @TableId(value = "id", type = IdType.AUTO) // 主键，AUTO 表示数据库自增
    private Long id;

    @TableField("user_name")  // 字段名映射（开启驼峰转换后可省略）
    private String name;

    private Integer age;
    private String email;

    @TableField(fill = FieldFill.INSERT)       // 插入时自动填充
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)// 插入和更新时自动填充
    private LocalDateTime updateTime;

    @TableLogic                                // 逻辑删除字段
    private Integer deleted;

    @TableField(exist = false)                 // 非数据库字段，不参与 SQL
    private String tempValue;

    @Version                                   // 乐观锁版本号字段
    private Integer version;
}
```

### 常用注解速查

| 注解 | 作用 |
|------|------|
| `@TableName` | 表名映射 |
| `@TableId` | 主键标记，指定主键策略 |
| `@TableField` | 字段映射、填充策略、是否存在 |
| `@TableLogic` | 逻辑删除 |
| `@Version` | 乐观锁 |
| `@EnumValue` | 枚举字段映射 |
| `@TableNameAutoResultMap` | 自动映射结果 |

## 2. BaseMapper 通用 CRUD

只需让 Mapper 接口继承 `BaseMapper<T>`，即可获得单表 CRUD 能力：

```java
public interface UserMapper extends BaseMapper<User> {
    // 无需写任何方法，已有 17+ 通用方法
}
```

### 增删改查

```java
@SpringBootTest
class UserMapperTest {
    @Autowired private UserMapper userMapper;

    @Test
    void testCrud() {
        // ===== 新增 =====
        User user = new User();
        user.setName("Alice");
        user.setAge(20);
        user.setEmail("alice@example.com");
        int rows = userMapper.insert(user); // 返回受影响行数
        System.out.println("新增行数: " + rows);
        System.out.println("自增主键回填: " + user.getId()); // insert 后 id 自动回填

        // ===== 查询 =====
        User one = userMapper.selectById(1L);              // 按主键查
        User byEntity = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getName, "Alice")); // 按条件查一个
        List<User> list = userMapper.selectList(null);     // 查全部（null 表示无条件）
        List<User> batch = userMapper.selectBatchIds(Arrays.asList(1L, 2L, 3L)); // 批量查
        List<User> byMap = userMapper.selectByMap(Map.of("name", "Alice", "age", 20)); // Map 条件
        Long count = userMapper.selectCount(null);         // 计数

        // ===== 更新 =====
        User update = new User();
        update.setId(1L);
        update.setName("Bob");
        int uRows = userMapper.updateById(update);         // 按主键更新（只更新非 null 字段）

        // ===== 删除 =====
        int d1 = userMapper.deleteById(1L);                // 按主键删
        int d2 = userMapper.deleteBatchIds(Arrays.asList(2L, 3L)); // 批量删
        int d3 = userMapper.delete(new LambdaQueryWrapper<User>()
                .eq(User::getName, "Bob"));                // 按条件删
        int d4 = userMapper.deleteByMap(Map.of("name", "Bob")); // Map 条件删
    }
}
```

> `updateById` 只更新实体中**非 null** 的字段，这是 MP 的默认行为，避免把已有数据清空。

## 3. 条件构造器 Wrapper

Wrapper 是 MP 的核心特色，用链式 API 构建 SQL 条件，类型安全、可读性强。

### Wrapper 体系

```
Wrapper（抽象根）
├── QueryWrapper        —— 普通查询条件（字符串列名）
├── LambdaQueryWrapper  —— Lambda 查询条件（方法引用，类型安全，推荐）
├── UpdateWrapper       —— 更新条件 + set 值
└── LambdaUpdateWrapper —— Lambda 更新条件
```

### 条件查询

```java
// ===== LambdaQueryWrapper（推荐，编译期检查字段名） =====
LambdaQueryWrapper<User> qw = new LambdaQueryWrapper<>();
qw.eq(User::getName, "Alice")     // name = 'Alice'
  .gt(User::getAge, 18)           // age > 18
  .like(User::getEmail, "example")// email LIKE '%example%'
  .orderByDesc(User::getAge)      // ORDER BY age DESC
  .select(User::getId, User::getName); // 只查指定列
List<User> users = userMapper.selectList(qw);

// ===== 链式写法（更简洁） =====
List<User> list = userMapper.selectList(
    new LambdaQueryWrapper<User>()
        .like(StringUtils.isNotBlank(name), User::getName, name) // 条件成立才拼接
        .between(User::getAge, 18, 30)
        .orderByAsc(User::getAge)
);
```

### 常用条件方法

```java
eq / ne            // = / <>
gt / ge / lt / le  // > / >= / < / <=
like / notLike     // LIKE / NOT LIKE
likeLeft/likeRight // LIKE '%x' / LIKE 'x%'
between / notBetween
in / notIn
isNull / isNotNull
orderByAsc / orderByDesc
groupBy / having
last               // 拼接 SQL 末尾（如 "LIMIT 10"，慎防注入）
```

### 条件更新（UpdateWrapper）

```java
// 方式一：实体 + 条件
User user = new User();
user.setName("NewName");
userMapper.update(user, new LambdaQueryWrapper<User>()
        .eq(User::getAge, 20));
// UPDATE t_user SET name='NewName' WHERE age=20

// 方式二：纯 UpdateWrapper（可 set null 值）
userMapper.update(null, new LambdaUpdateWrapper<User>()
        .eq(User::getId, 1L)
        .set(User::getName, "Bob")
        .set(User::getEmail, null)); // 把 email 置空（updateById 做不到）
```

### 条件优先级与嵌套

```java
new LambdaQueryWrapper<User>()
    .eq(User::getStatus, 1)
    .and(w -> w.gt(User::getAge, 18).lt(User::getAge, 30)) // (age>18 AND age<30)
    .or(w -> w.eq(User::getName, "Alice"));                // OR (name='Alice')
// WHERE status=1 AND (age>18 AND age<30) OR (name='Alice')
```

> ⚠️ 复杂嵌套条件要注意 `and`/`or` 的括号逻辑，建议用 lambda 包裹明确分组。

## 4. IService 通用 Service

MP 提供 `IService` 接口和 `ServiceImpl` 实现，封装Service层通用方法：

```java
// 1. Service 接口
public interface UserService extends IService<User> {
}

// 2. Service 实现
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
        implements UserService {
    // 已继承大量通用方法
}
```

### 常用 Service 方法

```java
@Autowired private UserService userService;

// 新增
userService.save(user);                    // 插入一条
userService.saveBatch(userList);           // 批量插入
userService.saveOrUpdate(user);            // 有主键则更新，否则插入

// 删除
userService.removeById(1L);
userService.removeByIds(Arrays.asList(1L, 2L));
userService.remove(new LambdaQueryWrapper<User>().eq(User::getAge, 20));

// 更新
userService.updateById(user);
userService.update(user, new LambdaQueryWrapper<User>().eq(User::getName, "A"));

// 查询
User u = userService.getById(1L);
List<User> all = userService.list();
List<User> byIds = userService.listByIds(Arrays.asList(1L, 2L));
User one = userService.getOne(new LambdaQueryWrapper<User>().eq(User::getName, "A"));
long cnt = userService.count();
Page<User> page = userService.page(new Page<>(1, 10)); // 分页

// 链式查询（LambdaQueryChainWrapper）
List<User> list = userService.lambdaQuery()
        .eq(User::getAge, 20)
        .like(User::getName, "A")
        .list();

// 链式更新
boolean ok = userService.lambdaUpdate()
        .eq(User::getId, 1L)
        .set(User::getName, "Bob")
        .update();
```

## 5. 分页基础

### 配置分页插件（必须在进阶篇前完成）

```java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 分页插件，指定数据库类型（MySQL）
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

### 使用分页

```java
// 基础分页
Page<User> page = new Page<>(1, 10);  // 当前页，每页条数
Page<User> result = userMapper.selectPage(page, null);
System.out.println("总记录数: " + result.getTotal());
System.out.println("总页数: " + result.getPages());
System.out.println("当前页数据: " + result.getRecords());
System.out.println("当前页: " + result.getCurrent());
System.out.println("每页条数: " + result.getSize());

// 带条件的分页
Page<User> page2 = userMapper.selectPage(new Page<>(2, 5),
        new LambdaQueryWrapper<User>().gt(User::getAge, 18).orderByDesc(User::getAge));

// Service 层分页
IPage<User> p = userService.page(new Page<>(1, 10),
        new LambdaQueryWrapper<User>().eq(User::getStatus, 1));
```

> MP 的分页是**物理分页**（生成 `LIMIT`），需要先配置分页插件，否则分页不生效。

---

# 第二部分：进阶篇

## 1. 主键策略

```java
public enum IdType {
    AUTO,       // 数据库自增（需数据库设置 auto_increment）
    NONE,       // 不设置主键
    INPUT,      // 用户手动输入
    ASSIGN_ID,  // 雪花算法生成 Long 类型 ID（默认）
    ASSIGN_UUID // 生成 UUID 字符串
}
```

```java
@TableId(type = IdType.ASSIGN_ID)
private Long id;        // MP 用雪花算法生成 19 位 Long，分布式唯一

@TableId(type = IdType.ASSIGN_UUID)
private String uid;     // UUID（去掉横线的 32 位）

@TableId(type = IdType.INPUT)
private String code;    // 业务主键，手动赋值
```

```yaml
# 全局主键策略配置
mybatis-plus:
  global-config:
    db-config:
      id-type: assign_id   # 默认雪花算法
```

### 雪花算法说明

```
雪花 ID（64 bit）= 符号位(1) + 时间戳(41) + 机器ID(10) + 序列号(12)
```
- 趋势递增、分布式唯一、不依赖数据库
- 注意时钟回拨问题（服务器时间倒退可能导致 ID 重复）

## 2. 自动填充

```java
// 1. 实现 MetaObjectHandler
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        // 插入时填充 createTime 和 updateTime
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        // 更新时只填充 updateTime
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

```java
// 2. 实体类字段标注填充策略
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;

@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updateTime;
```

> 填充策略：`DEFAULT`（不处理）、`INSERT`（插入填充）、`UPDATE`（更新填充）、`INSERT_UPDATE`（两者都填充）。

## 3. 乐观锁

乐观锁通过版本号字段防止并发更新冲突：

```java
// 1. 实体类加 @Version
@Version
private Integer version;
```

```java
// 2. 配置乐观锁插件
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor()); // 乐观锁
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
```

```java
// 3. 使用：必须先查出再更新（带上版本号）
User user = userMapper.selectById(1L);   // version = 1
user.setName("NewName");
userMapper.updateById(user);
// SQL: UPDATE t_user SET name='NewName', version=2 WHERE id=1 AND version=1
// 若另一个线程已更新（version 变了），则更新失败（受影响行数 0）
```

> 乐观锁适合读多写少场景；冲突时需要业务层重试。

## 4. 逻辑删除

逻辑删除用标记字段代替物理删除，数据可恢复：

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

```java
@TableLogic
private Integer deleted;
```

```java
userMapper.deleteById(1L);
// 实际执行：UPDATE t_user SET deleted=1 WHERE id=1 AND deleted=0

userMapper.selectList(null);
// 实际执行：SELECT ... FROM t_user WHERE deleted=0  —— 自动过滤已删除数据
```

> 逻辑删除后，MP 自动在查询条件加上 `deleted=0`；若需查询已删除数据，需手写 SQL。

## 5. 代码生成器

MP 提供代码生成器，可根据数据库表自动生成 Entity、Mapper、Service、Controller：

```java
// 3.5.x 新版生成器（FastAutoGenerator）
public class CodeGenerator {
    public static void main(String[] args) {
        FastAutoGenerator.create("jdbc:mysql://localhost:3306/test", "root", "root")
            .globalConfig(builder -> builder
                .author("yourname")
                .outputDir("D://generated")      // 输出目录
                .enableSwagger())                // 生成 Swagger 注解
            .packageConfig(builder -> builder
                .parent("com.example")
                .moduleName("system")
                .entity("entity")
                .mapper("mapper")
                .service("service")
                .controller("controller"))
            .strategyConfig(builder -> builder
                .addInclude("t_user", "t_order") // 指定表
                .addTablePrefix("t_")            // 去掉表前缀
                .entityBuilder().enableLombok()
                .controllerBuilder().enableRestStyle())
            .execute();
    }
}
```

> 生成的代码需要模板引擎，默认使用 Velocity，可引入 `velocity-engine-core` 依赖。

## 6. 条件查询进阶

### 查询指定字段与去重

```java
new LambdaQueryWrapper<User>()
    .select(User::getId, User::getName)  // 只查 id、name
    .distinct();                         // DISTINCT（注意与分页配合）
```

### 嵌套与条件拼接

```java
// 根据前端参数动态拼接（condition 参数）
String name = req.getName();
Integer minAge = req.getMinAge();

new LambdaQueryWrapper<User>()
    .like(StringUtils.isNotBlank(name), User::getName, name) // name 非空才拼接
    .ge(minAge != null, User::getAge, minAge)
    .eq(User::getDeleted, 0);
```

### 分组与聚合

```java
// 按年龄分组统计
List<Map<String, Object>> maps = userMapper.selectMaps(
    new QueryWrapper<User>()
        .select("age, count(*) as cnt")
        .groupBy("age")
        .having("count(*) > {0}", 1)
);
```

### last 方法（拼接 SQL 尾部）

```java
new LambdaQueryWrapper<User>()
    .eq(User::getStatus, 1)
    .last("LIMIT 10"); // 追加到 SQL 最后，注意防止 SQL 注入
```

## 7. 自定义 SQL（XML 与 Wrapper 结合）

MP 支持在自定义 XML 中使用 Wrapper 作为参数 `ew`：

```java
// Mapper 接口
public interface UserMapper extends BaseMapper<User> {
    List<User> selectByCustom(@Param(Constants.WRAPPER) Wrapper<User> wrapper);
}
```

```xml
<select id="selectByCustom" resultType="User">
    SELECT u.* FROM t_user u
    ${ew.customSqlSegment}   <!-- 拼接 Wrapper 生成的 WHERE 条件 -->
</select>
```

```java
// 调用
List<User> list = userMapper.selectByCustom(
    new LambdaQueryWrapper<User>().eq(User::getStatus, 1).gt(User::getAge, 18));
// 生成：SELECT u.* FROM t_user u WHERE (status = 1 AND age > 18)
```

## 8. 枚举处理

```java
// 1. 定义枚举
public enum SexEnum {
    MALE(1, "男"),
    FEMALE(2, "女");

    @EnumValue          // 数据库存储的值
    private final Integer code;
    private final String desc;

    SexEnum(Integer code, String desc) { this.code = code; this.desc = desc; }
}

// 2. 实体类使用枚举
private SexEnum sex;
```

```yaml
# 配置枚举扫描包
mybatis-plus:
  type-enums-package: com.example.enums
```

> 枚举字段用 `@EnumValue` 指定存库的真实值，查询时自动转换为枚举对象。

---

# 第三部分：高阶篇

## 1. 插件机制与执行流程

### MybatisPlusInterceptor 核心

MP 的所有增强功能都通过 `MybatisPlusInterceptor` 插件实现：

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    // 插件执行有顺序，按添加顺序形成责任链
    interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(tenantHandler)); // 多租户
    interceptor.addInnerInterceptor(new DataPermissionInterceptor(dataPermissionHandler)); // 数据权限
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor()); // 乐观锁
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL)); // 分页
    interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor()); // 防全表更新删除
    return interceptor;
}
```

> **插件顺序很重要**：分页插件通常放最后，多租户/数据权限插件在前，保证 SQL 改写顺序正确。

### 执行流程

```
Mapper 方法调用
  → MybatisPlusInterceptor.intercept
    → 依次执行各 InnerInterceptor.beforeQuery / beforeUpdate
      → SQL 改写（拼租户条件、权限条件等）
    → 执行 SQL（分页插件改写 LIMIT 并 count）
  → 返回结果
```

## 2. 多租户

多租户场景下，所有 SQL 自动追加租户 ID 条件，实现数据隔离：

```java
// 1. 实现 TenantLineHandler
@Component
public class MyTenantHandler implements TenantLineHandler {
    @Override
    public Expression getTenantId() {
        // 从当前登录用户上下文获取租户 ID
        Long tenantId = TenantContext.getTenantId();
        return new LongValue(tenantId);
    }

    @Override
    public String getTenantIdColumn() {
        return "tenant_id"; // 租户字段名
    }

    @Override
    public boolean ignoreTable(String tableName) {
        // 这些表不拼接租户条件（如系统表、字典表）
        return "t_sys_dict".equals(tableName) || "t_tenant".equals(tableName);
    }
}

// 2. 注册多租户插件
@Bean
public MybatisPlusInterceptor tenantInterceptor(MyTenantHandler handler) {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(handler));
    return interceptor;
}
```

```java
// 3. 租户上下文（ThreadLocal）
public class TenantContext {
    private static final ThreadLocal<Long> CTX = new ThreadLocal<>();
    public static void setTenantId(Long id) { CTX.set(id); }
    public static Long getTenantId() { return CTX.get(); }
    public static void clear() { CTX.remove(); }
}
```

> 效果：`SELECT * FROM t_user` 自动变成 `SELECT * FROM t_user WHERE tenant_id = 当前租户`。

## 3. 数据权限

基于角色的数据权限控制（如只能看本部门数据）：

```java
// 1. 实现 DataPermissionHandler
@Component
public class MyDataPermissionHandler implements DataPermissionHandler {
    @Override
    public Expression getSqlSegment(Table table, Expression where, String mappedStatementId) {
        // 根据当前用户角色返回权限表达式
        User user = SecurityContextHolder.getCurrentUser();
        if (user.isAdmin()) {
            return null; // 管理员不做限制
        }
        // 普通用户只能看本部门数据：dept_id = 当前部门
        return new EqualsTo(
            new Column(table.getAlias() != null ? table.getAlias().getValue() : "t_user", "dept_id"),
            new LongValue(user.getDeptId())
        );
    }
}

// 2. 注册数据权限插件
interceptor.addInnerInterceptor(new DataPermissionInterceptor(dataPermissionHandler));
```

> 数据权限常与注解结合，通过 AOP 读取方法上的 `@DataPermission` 注解决定是否生效。

## 4. 动态数据源

多数据源场景（读写分离、多库）常配合 `dynamic-datasource-spring-boot-starter`：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
    <version>4.3.1</version>
</dependency>
```

```yaml
spring:
  datasource:
    dynamic:
      primary: master       # 默认数据源
      strict: false
      datasource:
        master:
          url: jdbc:mysql://master:3306/db
          username: root
          password: root
        slave_1:
          url: jdbc:mysql://slave:3306/db
          username: root
          password: root
```

```java
// 用 @DS 注解切换数据源
@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    @DS("slave_1")   // 该方法走从库
    public List<User> listFromSlave() {
        return this.list();
    }

    @DS("master")    // 写操作走主库
    @Transactional
    public void saveUser(User user) {
        this.save(user);
    }
}
```

> 注意：同一个事务内切换数据源无效（事务绑定了连接），读写分离要在不同事务方法间切换。

## 5. SQL 注入器

自定义通用方法，注入到 BaseMapper 中供所有 Mapper 使用：

```java
// 1. 定义 SQL 注入方法
public class InsertBatchSomeColumn extends AbstractMethod {
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass,
            Class<?> modelClass, TableInfo tableInfo) {
        String sql = "<script>INSERT INTO %s %s VALUES <foreach collection='list' item='item' separator=','>(%s)</foreach></script>";
        String fieldSql = ... // 根据 tableInfo 拼接字段
        String sqlResult = String.format(sql, tableInfo.getTableName(), fieldSql, fieldSql);
        SqlSource sqlSource = languageDriver.createSqlSource(configuration, sqlResult, modelClass);
        return addInsertMappedStatement(mapperClass, modelClass,
                "insertBatchSomeColumn", sqlSource, ...);
    }
}

// 2. 定义 Mapper 方法
public interface MyBaseMapper<T> extends BaseMapper<T> {
    int insertBatchSomeColumn(@Param("list") List<T> batchList);
}

// 3. 配置注入器
@Bean
public SqlInjector sqlInjector() {
    return new DefaultSqlInjector() {
        @Override
        public List<AbstractMethod> getMethodList(Class<?> mapperClass) {
            List<AbstractMethod> methods = super.getMethodList(mapperClass);
            methods.add(new InsertBatchSomeColumn()); // 注入自定义方法
            return methods;
        }
    };
}

// 4. 业务 Mapper 继承 MyBaseMapper
public interface UserMapper extends MyBaseMapper<User> {}
```

## 6. 自定义 ID 生成器

```java
// 1. 实现 IdentifierGenerator
@Component
public class CustomIdGenerator implements IdentifierGenerator {
    @Override
    public Number nextId(Object entity) {
        // 自定义 ID 生成逻辑（如接入分布式 ID 服务 Leaf / Snowflake）
        return Snowflake.nextId();
    }
}

// 2. 配置
@Bean
public IdentifierGenerator idGenerator() { return new CustomIdGenerator(); }
```

```java
// 或在实体类字段上指定
@TableId(type = IdType.ASSIGN_ID)
private Long id; // 使用全局 IdentifierGenerator
```

## 7. 防全表更新与删除

```java
// 注册防攻击插件，阻止不带 WHERE 的 UPDATE/DELETE
interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());
```

```java
// 以下操作会被拦截并抛异常
userMapper.update(null, null);   // 全表更新 → 抛异常
userMapper.delete(new QueryWrapper<>()); // 全表删除 → 抛异常
```

> 生产环境强烈建议开启此插件，防止误操作导致数据灾难。

## 8. 性能优化

```java
// 1. 只查需要的字段，避免 SELECT *
new LambdaQueryWrapper<User>().select(User::getId, User::getName);

// 2. 分页查询加合理索引，避免深分页（LIMIT 100000, 10 慢）
//    优化：用游标/延迟关联

// 3. 批量插入用 insertBatchSomeColumn（真批量），避免逐条 insert

// 4. 关闭不必要的 SQL 日志（生产环境）
// mybatis-plus.configuration.log-impl 不配置

// 5. Wrapper 复用注意线程安全（Wrapper 非线程安全，不要共享）

// 6. 逻辑删除查询会加 deleted=0 条件，确保该字段有索引

// 7. 租户/权限插件的 ignoreTable 精确配置，避免对系统表无谓改写
```

### 批量插入性能对比

```java
// 逐条插入（慢，N 次网络往返）
for (User u : list) userMapper.insert(u);

// saveBatch（MP 内部走 BATCH 执行器，较快）
userService.saveBatch(list, 1000); // 每批 1000 条

// insertBatchSomeColumn（单条 SQL 多 VALUES，最快，需 SQL 注入器）
userMapper.insertBatchSomeColumn(list);
```

## 9. 源码解析要点

### BaseMapper 方法注入原理

```
启动 → MybatisPlusAutoConfiguration
  → SqlSessionFactory 创建
  → DefaultSqlInjector 扫描 BaseMapper 的方法
  → 每个方法对应一个 AbstractMethod 实现（如 SelectById）
  → injectMappedStatement 生成 MappedStatement 注入 Configuration
  → Mapper 接口获得 CRUD 能力
```

### Wrapper 转 SQL 原理

```
Wrapper 条件 → AbstractWrapper 维护 sqlSegment 字符串 + 参数列表
  → 生成 SQL 片段（如 "id = ? AND name LIKE ?"）
  → 参数存入 paramNameValuePairs（Map）
  → MyBatis 参数映射设置到 PreparedStatement
```

## 10. 常见问题与最佳实践

```java
// 坑 1：updateById 更新不了 null 值 → 用 UpdateWrapper.set(..., null)
// 坑 2：逻辑删除后 selectById 查不到 → 自动加了 deleted=0 条件
// 坑 3：分页不生效 → 忘记配置 PaginationInnerInterceptor
// 坑 4：乐观锁失效 → 实体未加 @Version 或未配置插件、未先查后更
// 坑 5：多租户改写了不该改的表 → 配置 ignoreTable
// 坑 6：雪花 ID 前端精度丢失 → 转 String 传给前端（JS 安全整数 53 位）
// 坑 7：Wrapper 条件里字段名写错（QueryWrapper 用字符串，编译不检查）
//      → 优先用 LambdaQueryWrapper
// 坑 8：自定义 SQL 中 ${ew.customSqlSegment} 位置错误（要放在 WHERE 后）
```

### 最佳实践清单

```java
// ✅ 优先用 LambdaQueryWrapper / LambdaUpdateWrapper（类型安全）
// ✅ 复杂 join 用原生 MyBatis XML，简单 CRUD 用 MP
// ✅ 分页、乐观锁、逻辑删除插件按需配置
// ✅ 生产开启 BlockAttackInnerInterceptor
// ✅ 雪花 ID 传前端转字符串
// ✅ 批量操作用 saveBatch 或 SQL 注入器
// ✅ 多租户/权限插件精确配置 ignoreTable
// ✅ 事务边界在 Service 层，配合 @Transactional
```

---

# 附录：学习路线与资源

## 建议学习顺序

```
1. 基础：实体注解 → BaseMapper CRUD → Wrapper 条件构造器 → IService → 分页
2. 进阶：主键策略 → 自动填充 → 乐观锁 → 逻辑删除 → 代码生成 → 自定义 SQL
3. 高阶：插件机制 → 多租户 → 数据权限 → 动态数据源 → SQL 注入器 → 性能优化
```

## 推荐练习项目

| 阶段 | 项目 |
|------|------|
| 基础 | 用户 CRUD + 条件查询 + 分页列表 |
| 进阶 | 博客系统（乐观锁、逻辑删除、自动填充、代码生成器） |
| 高阶 | 多租户 SaaS 系统（租户隔离 + 数据权限 + 读写分离 + Redis 缓存） |

## 推荐资源

- **官方文档**：MyBatis-Plus 官网（baomidou.com）——文档非常详尽
- **源码**：GitHub baomidou/mybatis-plus
- **工具**：MyBatisX 插件（IDEA，MP 官方插件）、代码生成器

## 自测题

1. MyBatis-Plus 与 MyBatis 的关系？MP 做了哪些增强？
2. `BaseMapper` 和 `IService` 分别提供什么能力？
3. `LambdaQueryWrapper` 相比 `QueryWrapper` 的优势？
4. `updateById` 为什么更新不了 null 字段？如何解决？
5. `${ew.customSqlSegment}` 中的 `${}` 有注入风险吗？如何规避？
6. 主键策略 `ASSIGN_ID` 和 `AUTO` 的区别？雪花算法有何风险？
7. 自动填充的实现步骤？
8. 乐观锁的原理？为什么必须先查后更？
9. 逻辑删除的原理？对查询有什么影响？
10. 分页插件为什么通常放在插件链最后？
11. 多租户插件如何防止污染系统表？
12. 数据权限与多租户的区别？
13. 动态数据源切换为什么在事务内无效？
14. SQL 注入器的作用？如何添加自定义通用方法？
15. 批量插入的几种方式及性能差异？
16. 雪花 ID 传到前端为什么会精度丢失？如何解决？
17. `BlockAttackInnerInterceptor` 的作用？

---
