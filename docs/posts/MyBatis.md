---
title: MyBatis
date: 2022-07-28
categories: [后端]
tags: [MyBatis, ORM, 动态SQL, 缓存]
description: MyBatis 持久层学习笔记，涵盖 XML 映射、动态 SQL、关联映射、缓存与插件开发。
coverImg: /images/cover/MyBatis.png
permalink: /posts/mybatis
---

# MyBatis 系统学习指南：从基础到高阶

> 一份带代码示例的渐进式学习文档。以 **MyBatis 3.5.x + Spring Boot 3.x**（Java 17+）为主线，同时讲解原生 MyBatis 用法。建议按顺序阅读，先掌握 XML 映射与动态 SQL，再学关联映射与缓存，最后深入执行原理与插件开发。

## 目录

- [写在前面](#写在前面)
- [第一部分：基础篇](#第一部分基础篇)
- [第二部分：进阶篇](#第二部分进阶篇)
- [第三部分：高阶篇](#第三部分高阶篇)
- [附录：学习路线与资源](#附录学习路线与资源)

---

## 写在前面

### MyBatis 是什么

MyBatis 是一款优秀的**半自动化 ORM（Object-Relational Mapping，对象关系映射）框架**：

- **半自动**：SQL 由开发者手写，框架负责参数映射与结果映射（区别于 JPA/Hibernate 的全自动）
- **核心特点**：SQL 与代码分离、灵活可控、学习成本低、性能可调优

```
Java 对象 ←→ MyBatis（参数映射 + 结果映射）←→ SQL 语句 ←→ 数据库
```

### 与其他框架对比

| 框架 | 特点 | 适用场景 |
|------|------|---------|
| JDBC | 手写连接、SQL、结果处理，代码冗余 | 简单场景、学习原理 |
| **MyBatis** | SQL 手写可控，映射半自动 | 复杂 SQL、需要 SQL 优化的系统 |
| Hibernate/JPA | 全自动映射，面向对象操作 | CRUD 为主、SQL 简单 |

### 版本说明

| 技术 | 本文主线 | 说明 |
|------|---------|------|
| MyBatis | 3.5.x | 主流稳定版 |
| mybatis-spring-boot-starter | 3.x | 适配 Spring Boot 3 / Java 17 |
| 旧版适配 | starter 2.x | 适配 Spring Boot 2 / Java 8 |

### 快速开始（Spring Boot 整合）

```xml
<!-- pom.xml 核心依赖 -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.3</version>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
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

mybatis:
  mapper-locations: classpath:mapper/*.xml   # Mapper XML 位置
  type-aliases-package: com.example.pojo      # 类型别名包
  configuration:
    map-underscore-to-camel-case: true        # 下划线转驼峰（user_name → userName）
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl # 打印 SQL（开发用）
```

```java
@SpringBootApplication
@MapperScan("com.example.mapper") // 扫描 Mapper 接口，无需每个接口加 @Mapper
public class App {
    public static void main(String[] args) { SpringApplication.run(App.class, args); }
}
```

---

# 第一部分：基础篇

## 1. 原生 MyBatis 快速入门

在不使用 Spring 的情况下，MyBatis 的核心使用流程：

```java
// 1. 实体类
public class User {
    private Long id;
    private String name;
    private Integer age;
    // getter / setter / toString
}

// 2. Mapper 接口
public interface UserMapper {
    User selectById(Long id);
}

// 3. 核心配置文件 mybatis-config.xml
// 4. 映射文件 UserMapper.xml
// 5. 使用
public class MyBatisDemo {
    public static void main(String[] args) throws IOException {
        // 加载核心配置
        InputStream in = Resources.getResourceAsStream("mybatis-config.xml");
        SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(in);
        // 获取会话
        try (SqlSession session = factory.openSession()) {
            UserMapper mapper = session.getMapper(UserMapper.class);
            User user = mapper.selectById(1L);
            System.out.println(user);
        }
    }
}
```

### 核心配置文件（mybatis-config.xml）

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <properties resource="db.properties"/> <!-- 引入外部配置 -->

    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <setting name="cacheEnabled" value="true"/>
        <setting name="lazyLoadingEnabled" value="true"/>
    </settings>

    <typeAliases>
        <package name="com.example.pojo"/> <!-- 批量起别名，默认类名小写 -->
    </typeAliases>

    <environments default="dev">
        <environment id="dev">
            <transactionManager type="JDBC"/> <!-- JDBC / MANAGED -->
            <dataSource type="POOLED"> <!-- POOLED / UNPOOLED / JNDI -->
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>

    <mappers>
        <mapper resource="mapper/UserMapper.xml"/>
        <!-- 或 <package name="com.example.mapper"/> -->
    </mappers>
</configuration>
```

> **配置标签顺序**（必须遵守，否则报错）：`properties` → `settings` → `typeAliases` → `typeHandlers` → `objectFactory` → `plugins` → `environments` → `databaseIdProvider` → `mappers`。

## 2. Mapper XML 与 CRUD

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">

    <!-- 查询单个 -->
    <select id="selectById" resultType="User">
        SELECT id, name, age FROM user WHERE id = #{id}
    </select>

    <!-- 查询列表 -->
    <select id="selectAll" resultType="User">
        SELECT id, name, age FROM user
    </select>

    <!-- 新增，useGeneratedKeys 回填自增主键 -->
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO user(name, age) VALUES(#{name}, #{age})
    </insert>

    <!-- 更新 -->
    <update id="update">
        UPDATE user SET name = #{name}, age = #{age} WHERE id = #{id}
    </update>

    <!-- 删除 -->
    <delete id="deleteById">
        DELETE FROM user WHERE id = #{id}
    </delete>
</mapper>
```

对应的接口：

```java
public interface UserMapper {
    User selectById(Long id);
    List<User> selectAll();
    int insert(User user);          // 返回受影响行数
    int update(User user);
    int deleteById(Long id);
}
```

> **namespace 与 id**：`namespace` 必须是接口全限定名，`id` 必须是接口方法名，MyBatis 通过这两者绑定 SQL 与方法。

## 3. 参数传递

### 单个参数

```java
User selectById(Long id);  // XML 中 #{id} 可任意命名（单参数）
```

### 多个参数（@Param）

```java
// 多参数必须用 @Param 命名，否则只能用 arg0/param1
User selectByNameAndAge(@Param("name") String name, @Param("age") Integer age);
```

```xml
<select id="selectByNameAndAge" resultType="User">
    SELECT * FROM user WHERE name = #{name} AND age = #{age}
</select>
```

### POJO / Map 参数

```java
// POJO：直接用属性名
int insert(User user);  // #{name} #{age} 对应 user 的属性

// Map：用 key
List<User> selectByMap(Map<String, Object> params);  // #{key}
```

### `#{}` 与 `${}` 的区别（重要）

```xml
<!-- #{}：预编译占位符 ?，自动加引号，防 SQL 注入（推荐） -->
<select id="selectByName" resultType="User">
    SELECT * FROM user WHERE name = #{name}
</select>

<!-- ${}：字符串直接拼接，用于表名/列名/排序字段等不能加引号的场景 -->
<select id="selectByOrder" resultType="User">
    SELECT * FROM user ORDER BY ${columnName} ${order}
</select>
```

> ⚠️ **SQL 注入风险**：`${}` 直接拼接，用户输入必须白名单校验。`order by ${column}` 时，column 只能传入固定的合法值（如 `id`、`age`）。

## 4. 结果映射

### resultType（自动映射）

```xml
<!-- 列名与属性名一致，或开启下划线转驼峰 -->
<select id="selectAll" resultType="User">
    SELECT id, name, age FROM user
</select>
```

### resultMap（手动映射，处理列名不一致）

```xml
<resultMap id="UserResultMap" type="User">
    <id property="id" column="user_id"/>        <!-- 主键，用 id 标签有缓存优化 -->
    <result property="name" column="user_name"/>
    <result property="age" column="user_age"/>
</resultMap>

<select id="selectAll" resultMap="UserResultMap">
    SELECT user_id, user_name, user_age FROM user
</select>
```

### 自定义映射规则

```xml
<resultMap id="UserResultMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <!-- 枚举、特殊类型转换 -->
    <result property="status" column="status" typeHandler="com.example.StatusHandler"/>
</resultMap>
```

## 5. 动态 SQL

MyBatis 提供强大的动态 SQL 标签，解决 SQL 条件拼接问题。

### if + where

```xml
<select id="selectByCondition" resultType="User">
    SELECT * FROM user
    <where>  <!-- 自动去掉开头多余的 AND/OR -->
        <if test="name != null and name != ''">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
        <if test="age != null">
            AND age = #{age}
        </if>
    </where>
</select>
```

### choose / when / otherwise（类似 switch）

```xml
<select id="selectByChoice" resultType="User">
    SELECT * FROM user
    <where>
        <choose>
            <when test="id != null">AND id = #{id}</when>
            <when test="name != null">AND name = #{name}</when>
            <otherwise>AND age = 18</otherwise>
        </choose>
    </where>
</select>
```

### set（更新时去掉多余逗号）

```xml
<update id="updateSelective">
    UPDATE user
    <set>
        <if test="name != null">name = #{name},</if>
        <if test="age != null">age = #{age},</if>
    </set>
    WHERE id = #{id}
</update>
```

### foreach（批量操作 / IN 查询）

```xml
<!-- IN 查询 -->
<select id="selectByIds" resultType="User">
    SELECT * FROM user WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>

<!-- 批量插入 -->
<insert id="batchInsert">
    INSERT INTO user(name, age) VALUES
    <foreach collection="users" item="u" separator=",">
        (#{u.name}, #{u.age})
    </foreach>
</insert>
```

```java
List<User> selectByIds(@Param("ids") List<Long> ids);
int batchInsert(@Param("users") List<User> users);
```

### trim（自定义拼接，可替代 where/set）

```xml
<trim prefix="WHERE" prefixOverrides="AND | OR ">
    <if test="name != null">AND name = #{name}</if>
</trim>
```

### sql 片段复用

```xml
<sql id="Base_Column_List">id, name, age</sql>

<select id="selectById" resultType="User">
    SELECT <include refid="Base_Column_List"/> FROM user WHERE id = #{id}
</select>
```

## 6. 注解方式开发

对于简单 SQL，可用注解代替 XML（复杂 SQL 仍推荐 XML）：

```java
public interface UserMapper {

    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(Long id);

    @Insert("INSERT INTO user(name, age) VALUES(#{name}, #{age})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    @Update("UPDATE user SET name = #{name} WHERE id = #{id}")
    int update(User user);

    @Delete("DELETE FROM user WHERE id = #{id}")
    int deleteById(Long id);

    // 动态 SQL 注解（用 Script 标签）
    @Select("<script>" +
            "SELECT * FROM user" +
            "<where>" +
            "  <if test='name != null'>AND name = #{name}</if>" +
            "</where>" +
            "</script>")
    List<User> selectByCondition(@Param("name") String name);
}
```

> **选择建议**：简单 CRUD 用注解，复杂动态 SQL、关联映射用 XML。两种方式可混用。

---

# 第二部分：进阶篇

## 1. 关联映射

### 一对一（association）

```java
public class Order {
    private Long id;
    private String orderNo;
    private User user;  // 一对一关联的用户
    // getter/setter
}
```

```xml
<resultMap id="OrderResultMap" type="Order">
    <id property="id" column="id"/>
    <result property="orderNo" column="order_no"/>
    <!-- 方式一：嵌套结果（一条 SQL join 查出） -->
    <association property="user" javaType="User">
        <id property="id" column="user_id"/>
        <result property="name" column="user_name"/>
    </association>
</resultMap>

<select id="selectOrderWithUser" resultMap="OrderResultMap">
    SELECT o.id, o.order_no, u.id AS user_id, u.name AS user_name
    FROM orders o LEFT JOIN user u ON o.user_id = u.id
    WHERE o.id = #{id}
</select>
```

```xml
<!-- 方式二：嵌套查询（分步查询，可配合延迟加载） -->
<resultMap id="OrderResultMap2" type="Order">
    <association property="user" javaType="User"
                 column="user_id" select="com.example.mapper.UserMapper.selectById"/>
</resultMap>

<select id="selectOrderWithUser2" resultMap="OrderResultMap2">
    SELECT id, order_no, user_id FROM orders WHERE id = #{id}
</select>
```

### 一对多（collection）

```java
public class User {
    private Long id;
    private String name;
    private List<Order> orders;  // 一对多
}
```

```xml
<resultMap id="UserWithOrders" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <collection property="orders" ofType="Order">
        <id property="id" column="order_id"/>
        <result property="orderNo" column="order_no"/>
    </collection>
</resultMap>

<select id="selectUserWithOrders" resultMap="UserWithOrders">
    SELECT u.id AS user_id, u.name AS user_name,
           o.id AS order_id, o.order_no
    FROM user u LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = #{id}
</select>
```

### 多对多

多对多通常拆成两个一对多，通过中间表关联：

```xml
<!-- 用户 - 角色多对多，中间表 user_role -->
<resultMap id="UserWithRoles" type="User">
    <id property="id" column="user_id"/>
    <collection property="roles" ofType="Role">
        <id property="id" column="role_id"/>
        <result property="name" column="role_name"/>
    </collection>
</resultMap>

<select id="selectUserWithRoles" resultMap="UserWithRoles">
    SELECT u.id AS user_id, r.id AS role_id, r.name AS role_name
    FROM user u
    JOIN user_role ur ON u.id = ur.user_id
    JOIN role r ON ur.role_id = r.id
    WHERE u.id = #{id}
</select>
```

## 2. 延迟加载（懒加载）

只查询主对象，关联对象在真正使用时才查询，减少不必要的 SQL。

```xml
<!-- 核心配置开启延迟加载 -->
<settings>
    <setting name="lazyLoadingEnabled" value="true"/>
    <setting name="aggressiveLazyLoading" value="false"/> <!-- 按需加载，非全部加载 -->
</settings>
```

```xml
<!-- 关联查询使用 select 方式（分步查询），才能延迟加载 -->
<resultMap id="OrderResultMap" type="Order">
    <association property="user" javaType="User"
                 column="user_id" select="com.example.mapper.UserMapper.selectById"/>
</resultMap>
```

```java
Order order = mapper.selectOrderWithUser2(1L); // 只查订单，不查用户
System.out.println(order.getOrderNo());       // 不触发用户查询
System.out.println(order.getUser().getName());// 此时才执行用户查询
```

## 3. 缓存机制

### 一级缓存（SqlSession 级别，默认开启）

```java
try (SqlSession session = factory.openSession()) {
    UserMapper mapper = session.getMapper(UserMapper.class);
    User u1 = mapper.selectById(1L); // 查数据库
    User u2 = mapper.selectById(1L); // 命中一级缓存，不查数据库
    System.out.println(u1 == u2);    // true —— 同一个对象

    mapper.update(new User(1L, "newName", 20)); // 执行 update 会清空一级缓存
    User u3 = mapper.selectById(1L); // 重新查数据库
}
```

> 一级缓存失效场景：不同 SqlSession、同一 SqlSession 执行了增删改、查询条件不同、手动清空 `session.clearCache()`。

### 二级缓存（namespace / Mapper 级别，需手动开启）

```xml
<!-- 1. 核心配置（默认 true，可显式声明） -->
<setting name="cacheEnabled" value="true"/>

<!-- 2. Mapper.xml 中开启 -->
<mapper namespace="com.example.mapper.UserMapper">
    <cache eviction="LRU" flushInterval="60000" size="1024" readOnly="false"/>
    <!-- eviction: LRU/FIFO/SOFT/WEAK；flushInterval 毫秒；size 缓存对象数 -->
</mapper>
```

```java
// 实体类必须实现 Serializable
public class User implements Serializable { ... }

// 用法：不同 SqlSession 共享二级缓存
try (SqlSession s1 = factory.openSession()) {
    s1.getMapper(UserMapper.class).selectById(1L); // 查库，放入二级缓存
}
try (SqlSession s2 = factory.openSession()) {
    s2.getMapper(UserMapper.class).selectById(1L); // 命中二级缓存
}
```

### 二级缓存使用注意

```xml
<!-- 单个语句禁用二级缓存 -->
<select id="selectById" resultType="User" useCache="false">...</select>

<!-- 增删改后是否刷新缓存（默认 true） -->
<insert id="insert" flushCache="true">...</insert>
```

> ⚠️ 二级缓存以 namespace 为单位，跨表关联查询容易产生**脏数据**；分布式环境下本地缓存会导致数据不一致，生产通常改用 Redis。

## 4. 插件与分页

### PageHelper 分页插件

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

```java
// 使用：在查询前调用 startPage，紧跟的第一个查询被分页
PageHelper.startPage(1, 10); // 第 1 页，每页 10 条
List<User> users = userMapper.selectAll();
PageInfo<User> page = new PageInfo<>(users);
System.out.println(page.getTotal());  // 总记录数
System.out.println(page.getList());   // 当前页数据
System.out.println(page.getPages());  // 总页数
```

> 原理：PageHelper 通过 MyBatis 插件拦截 `Executor.query`，自动改写 SQL 追加 `LIMIT`，并额外发起 count 查询。

### 插件机制（Interceptor）

```java
// 自定义插件：拦截 Executor 的 query 方法
@Intercepts({
    @Signature(type = Executor.class, method = "query",
               args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})
})
public class MyPlugin implements Interceptor {
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = invocation.proceed(); // 执行原逻辑
        System.out.println("SQL 耗时: " + (System.currentTimeMillis() - start) + "ms");
        return result;
    }
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this); // 生成代理对象
    }
    @Override
    public void setProperties(Properties properties) { /* 接收配置参数 */ }
}
```

```xml
<!-- 注册插件 -->
<plugins>
    <plugin interceptor="com.example.MyPlugin">
        <property name="threshold" value="100"/>
    </plugin>
</plugins>
```

## 5. 类型处理器（TypeHandler）

处理 Java 类型与数据库类型的自定义转换：

```java
// 场景：数据库存逗号分隔的字符串，Java 中是 List
@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(List.class)
public class ListTypeHandler extends BaseTypeHandler<List<String>> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i,
                                    List<String> list, JdbcType jdbcType) throws SQLException {
        ps.setString(i, String.join(",", list)); // 写入：List → 字符串
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : Arrays.asList(value.split(",")); // 读取
    }

    // 另需重写 getNullableResult(ResultSet, int) 和 getNullableResult(CallableStatement, int)
    public List<String> getNullableResult(ResultSet rs, int i) throws SQLException {
        String v = rs.getString(i); return v == null ? null : Arrays.asList(v.split(","));
    }
    public List<String> getNullableResult(CallableStatement cs, int i) throws SQLException {
        String v = cs.getString(i); return v == null ? null : Arrays.asList(v.split(","));
    }
}
```

```xml
<!-- 局部使用 -->
<resultMap id="UserMap" type="User">
    <result property="tags" column="tags" typeHandler="com.example.ListTypeHandler"/>
</resultMap>

<!-- 全局注册（mybatis-config.xml） -->
<typeHandlers>
    <typeHandler handler="com.example.ListTypeHandler"/>
</typeHandlers>
```

## 6. Spring Boot 整合要点

```java
// 1. Mapper 接口扫描（二选一）
@MapperScan("com.example.mapper")      // 启动类上统一扫描
// 或每个接口加 @Mapper

// 2. Service 中使用
@Service
public class UserService {
    @Autowired private UserMapper userMapper;

    @Transactional  // Spring 声明式事务
    public void createUser(User user) {
        userMapper.insert(user);
        // 其他数据库操作，同一事务
    }
}

// 3. XML 与接口同包同名（约定优于配置），或配置 mapper-locations
```

```yaml
# 常用配置一览
mybatis:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.example.pojo
  configuration:
    map-underscore-to-camel-case: true
    cache-enabled: true
    lazy-loading-enabled: true
    call-setters-on-nulls: true        # 查询列含 null 时也调用 setter
    default-executor-type: reuse       # SIMPLE / REUSE / BATCH
  configuration-properties:
    prefix: ""
```

## 7. 分页实现

### 方式一：PageHelper（物理分页，推荐）

见上文插件章节。

### 方式二：RowBounds（内存分页，不推荐大数据量）

```java
// MyBatis 查出全部数据后在内存中截取，数据量大时性能差
List<User> users = mapper.selectByRowBounds(new RowBounds(0, 10));
```

### 方式三：SQL 手动 LIMIT

```xml
<select id="selectByPage" resultType="User">
    SELECT * FROM user LIMIT #{offset}, #{size}
</select>
```

## 8. 批量操作

```java
// 方式一：foreach 拼 SQL（见基础篇），适合几百条
// 方式二：开启 BATCH 执行器（适合大批量）
try (SqlSession session = factory.openSession(ExecutorType.BATCH)) {
    UserMapper mapper = session.getMapper(UserMapper.class);
    for (int i = 0; i < 10000; i++) {
        mapper.insert(new User("name" + i, 20));
    }
    session.commit(); // 一次性提交，性能高
}
```

```java
// Spring Boot 中配置批量 SqlSessionTemplate
@Bean
public SqlSessionTemplate batchSqlSessionTemplate(SqlSessionFactory factory) {
    return new SqlSessionTemplate(factory, ExecutorType.BATCH);
}
```

---

# 第三部分：高阶篇

## 1. MyBatis 执行流程总览

```
1. 读取配置 → Configuration 对象
2. 构建 SqlSessionFactory
3. openSession() → 创建 SqlSession
4. getMapper() → 通过动态代理创建 Mapper 接口实现类
5. 调用 Mapper 方法 → MapperProxy → MapperMethod
6. SqlSession.selectOne/selectList → Executor 执行
7. StatementHandler 准备 Statement、ParameterHandler 设置参数
8. 执行 SQL
9. ResultSetHandler 映射结果 → 返回 Java 对象
```

### 四大核心对象

| 对象 | 职责 |
|------|------|
| **Executor** | 执行器，调度 SQL 执行，管理缓存（Simple/Reuse/Batch） |
| **ParameterHandler** | 把 Java 参数绑定到 PreparedStatement |
| **ResultSetHandler** | 把 ResultSet 映射成 Java 对象 |
| **StatementHandler** | 封装 JDBC Statement 操作，调用前两者 |

### 执行器类型

```java
// SIMPLE（默认）：每次执行都创建 Statement
// REUSE：复用 Statement
// BATCH：批量执行，适合批量插入更新
SqlSession session = factory.openSession(ExecutorType.BATCH);
```

## 2. Mapper 动态代理原理

```java
// Mapper 接口没有实现类，MyBatis 用 JDK 动态代理生成
public class MapperProxy<T> implements InvocationHandler {
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 1. 若是 Object 方法，直接执行
        // 2. 否则封装成 MapperMethod，执行 SQL
        MapperMethod mapperMethod = cachedMapperMethod(method);
        return mapperMethod.execute(sqlSession, args);
    }
}

// MapperMethod.execute 根据 SQL 类型（SELECT/INSERT/...）调用 SqlSession 对应方法
```

## 3. 缓存原理深入

### 一级缓存实现

一级缓存是 `Executor` 中的 `LocalCache`（PerpetualCache，本质是 HashMap）：

```java
// BaseExecutor.query 关键逻辑（简化）
public <E> List<E> query(MappedStatement ms, Object parameter, ...) {
    CacheKey key = createCacheKey(ms, parameter, rowBounds, boundSql); // 用 SQL+参数+分页生成 key
    if (localCache.getObject(key) != null) {
        return (List<E>) localCache.getObject(key); // 命中缓存
    }
    List<E> result = queryFromDatabase(ms, parameter, ...); // 查库并放入缓存
    return result;
}
```

> 一级缓存的 key 由 `MappedStatement id + offset + limit + SQL + 参数值` 组成。

### 二级缓存实现

```java
// CachingExecutor 装饰 BaseExecutor
public <E> List<E> query(...) {
    Cache cache = ms.getCache();
    if (cache != null) {
        // 先查二级缓存（TransactionalCacheManager 管理）
        List<E> list = (List<E>) tcm.getObject(cache, key);
        if (list == null) {
            list = delegate.query(...); // 委托给一级缓存
            tcm.putObject(cache, key, list); // 放入二级缓存（提交时生效）
        }
        return list;
    }
    return delegate.query(...);
}
```

> 二级缓存在事务提交时才真正写入，避免脏读；但跨表查询仍可能导致脏数据。

### 缓存最佳实践

```java
// 生产环境推荐用 Redis 替代二级缓存，保证分布式一致性
// 引入 mybatis-redis 或 Spring Cache + Redis：
@Cacheable(value = "user", key = "#id")
public User getById(Long id) { return userMapper.selectById(id); }
```

## 4. 自定义插件开发深入

### 可拦截的四大对象与方法

```java
// Executor: update, query, flushStatements, commit, rollback, getTransaction, close, isClosed
// ParameterHandler: getParameterObject, setParameters
// ResultSetHandler: handleResultSets, handleOutputParameters
// StatementHandler: prepare, parameterize, batch, update, query
```

### 实战：SQL 打印与耗时统计插件

```java
@Intercepts(@Signature(type = StatementHandler.class, method = "query",
        args = {Statement.class, ResultHandler.class}))
public class SqlLogPlugin implements Interceptor {
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        StatementHandler handler = (StatementHandler) invocation.getTarget();
        BoundSql boundSql = handler.getBoundSql();
        String sql = boundSql.getSql();
        // 获取参数
        MetaObject meta = SystemMetaObject.forObject(handler);
        Object paramObj = meta.getValue("parameterHandler.parameterObject");

        long start = System.currentTimeMillis();
        Object result = invocation.proceed();
        long cost = System.currentTimeMillis() - start;

        System.out.println("SQL: " + sql.replaceAll("\\s+", " "));
        System.out.println("参数: " + paramObj + " | 耗时: " + cost + "ms");
        return result;
    }
    public Object plugin(Object target) { return Plugin.wrap(target, this); }
    public void setProperties(Properties p) {}
}
```

> **插件执行顺序**：多个插件按注册顺序形成责任链，`plugin()` 包装时逆序，`intercept()` 执行时顺序。

## 5. 性能优化

```java
// 1. 只查需要的字段，避免 SELECT *
// 2. 合理使用索引，SQL 走索引（用 EXPLAIN 分析）
// 3. 分页用物理分页（PageHelper / LIMIT），不用 RowBounds
// 4. 批量操作用 BATCH 执行器或 foreach，避免逐条 insert
// 5. 一对多嵌套查询注意 N+1 问题，优先用 join 嵌套结果
// 6. 大结果集用流式查询，避免内存溢出
```

### 流式查询（处理百万级数据）

```java
@Select("SELECT * FROM user")
@Options(fetchSize = Integer.MIN_VALUE) // 触发流式读取
List<User> streamAll();

// 或使用 ResultHandler 逐条处理
void streamByHandler(ResultHandler<User> handler);
```

```java
// 调用
mapper.streamByHandler(ctx -> {
    User user = (User) ctx.getResultObject();
    process(user); // 逐条处理，不全部加载进内存
});
```

### N+1 问题

```java
// 问题：查 100 个订单，每个订单再查一次用户 → 101 条 SQL
// 解决一：用 join 嵌套结果（一条 SQL）
// 解决二：批量查询 + 内存中关联
List<Long> userIds = orders.stream().map(Order::getUserId).toList();
Map<Long, User> userMap = userMapper.selectByIds(userIds).stream()
        .collect(Collectors.toMap(User::getId, Function.identity()));
orders.forEach(o -> o.setUser(userMap.get(o.getUserId())));
```

## 6. 多数据源

### 方式一：AbstractRoutingDataSource（动态路由）

```java
public class DynamicDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return DataSourceContextHolder.getDb(); // 从 ThreadLocal 取数据源标识
    }
}

public class DataSourceContextHolder {
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();
    public static void setDb(String db) { CONTEXT.set(db); }
    public static String getDb() { return CONTEXT.get(); }
    public static void clear() { CONTEXT.remove(); }
}
```

```java
@Configuration
public class DataSourceConfig {
    @Bean
    @Primary
    public DataSource dataSource() {
        DynamicDataSource ds = new DynamicDataSource();
        Map<Object, Object> sources = new HashMap<>();
        sources.put("master", masterDataSource());
        sources.put("slave", slaveDataSource());
        ds.setTargetDataSources(sources);
        ds.setDefaultTargetDataSource(masterDataSource());
        return ds;
    }
}

// AOP 切换数据源
@Aspect
@Component
public class DataSourceAspect {
    @Before("@annotation(master)")
    public void setMaster(JoinPoint jp, Master master) {
        DataSourceContextHolder.setDb("master");
    }
    @After("@annotation(master)")
    public void clear(JoinPoint jp, Master master) {
        DataSourceContextHolder.clear();
    }
}
```

### 方式二：分包多 SqlSessionFactory

```java
@Configuration
@MapperScan(basePackages = "com.example.mapper.master",
            sqlSessionFactoryRef = "masterSqlSessionFactory")
public class MasterConfig {
    @Bean
    public SqlSessionFactory masterSqlSessionFactory(@Qualifier("masterDs") DataSource ds)
            throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(ds);
        bean.setMapperLocations(new PathMatchingResourcePatternResolver()
                .getResources("classpath:mapper/master/*.xml"));
        return bean.getObject();
    }
}
// 从库同理，配置 slaveSqlSessionFactory
```

## 7. 源码解析要点

### SQL 解析流程

```
1. XMLStatementBuilder 解析 <select> 等标签 → MappedStatement
2. SqlSource 封装 SQL（动态 SQL 用 DynamicSqlSource，静态用 RawSqlSource）
3. 执行时 BoundSql 通过 SqlSource.getBoundSql(parameter) 生成最终 SQL + 参数映射
4. ParameterMapping 记录 #{属性} 与 JDBC 类型的对应
```

### 参数映射（ParameterHandler）

```java
// DefaultParameterHandler.setParameters 关键逻辑
for (ParameterMapping mapping : boundSql.getParameterMappings()) {
    String prop = mapping.getProperty();
    Object value = parameterObject 中对应属性值;
    TypeHandler handler = mapping.getTypeHandler();
    handler.setParameter(ps, i + 1, value, mapping.getJdbcType()); // 设置到 PreparedStatement
}
```

### 结果映射（ResultSetHandler）

```java
// DefaultResultSetHandler.handleResultSets 关键逻辑
for (ResultMap resultMap : mappedStatement.getResultMaps()) {
    // 创建结果对象（反射实例化）
    Object rowValue = createResultObject(rsw, resultMap, ...);
    // 按列名匹配属性，自动映射或 resultMap 显式映射
    applyAutomaticMappings(rsw, resultMap, metaObject, ...);
    applyPropertyMappings(rsw, resultMap, metaObject, ...);
    // 处理 association / collection 嵌套映射
    resultList.add(rowValue);
}
```

## 8. 常见问题与最佳实践

### 常见坑

```java
// 1. 多参数未加 @Param → BindingException
// 2. ${} 用于用户输入 → SQL 注入
// 3. 一级缓存导致脏读（同一 SqlSession 内其他会话改了数据）
// 4. 二级缓存跨表脏数据
// 5. resultMap 中 <id> 用错导致嵌套结果去重错误
// 6. foreach 空集合 → SQL 语法错误（SELECT * FROM user WHERE id IN ()）
//    解决：<if test="list != null and list.size() > 0"> 包裹
// 7. 实体类字段与列名不一致且未开驼峰映射 → 字段为 null
// 8. 大事务长会话导致连接占用
```

### 最佳实践清单

```java
// ✅ 用 #{} 防注入，${} 仅用于白名单列名
// ✅ 开启 mapUnderscoreToCamelCase
// ✅ 复杂查询用 resultMap，明确 <id>
// ✅ 动态 SQL 用 <where>/<set> 避免语法错误
// ✅ 分页用 PageHelper，不用 RowBounds
// ✅ 批量操作用 BATCH 或 foreach
// ✅ 一对多优先 join 嵌套结果，避免 N+1
// ✅ 生产关闭 SQL 打印（StdOutImpl），用日志框架
// ✅ 分布式环境用 Redis 替代二级缓存
// ✅ 事务边界放在 Service 层，不在 Mapper
```

---

# 附录：学习路线与资源

## 建议学习顺序

```
1. 基础：核心配置 → Mapper CRUD → 参数传递 → 结果映射 → 动态 SQL
2. 进阶：关联映射 → 缓存 → 分页 → 插件 → Spring Boot 整合
3. 高阶：执行流程 → 四大对象 → 缓存原理 → 自定义插件 → 性能调优 → 多数据源
```

## 推荐练习项目

| 阶段 | 项目 |
|------|------|
| 基础 | 用户 CRUD + 动态条件查询 + 批量插入 |
| 进阶 | 博客系统（一对多/多对多映射 + PageHelper 分页 + 二级缓存） |
| 高阶 | 多租户 SaaS 系统（动态数据源 + 自定义插件 + Redis 缓存 + SQL 优化） |

## 推荐资源

- **官方文档**：MyBatis 中文文档（mybatis.org）、mybatis-spring-boot-starter 文档
- **书籍**：《MyBatis 从入门到精通》、《深入理解 MyBatis 技术原理》
- **工具**：MyBatis Log Plugin（IDEA 插件）、PageHelper、MBG（MyBatis Generator 代码生成）

## 自测题

1. MyBatis 是全自动还是半自动 ORM？与 Hibernate 的区别？
2. `#{}` 和 `${}` 的区别？为什么推荐用 `#{}`？
3. 核心配置文件中标签的顺序是什么？
4. `resultType` 和 `resultMap` 的区别？什么时候必须用 `resultMap`？
5. 动态 SQL 中 `<where>` 和 `<set>` 分别解决什么问题？
6. 多参数传递为什么要加 `@Param`？
7. 一级缓存和二级缓存的作用范围？各自何时失效？
8. 二级缓存为什么可能导致脏数据？
9. `association` 和 `collection` 分别用于什么关联关系？
10. 延迟加载的原理？如何开启？
11. MyBatis 的四大核心对象是什么？各自职责？
12. Mapper 接口为什么没有实现类也能调用？
13. 简述 MyBatis 的一次完整执行流程。
14. PageHelper 分页的原理是什么？
15. 什么是 N+1 问题？如何解决？
16. 如何实现动态数据源切换？
17. MyBatis 插件可以拦截哪些对象？如何注册？

---
