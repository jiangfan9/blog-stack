---
title: Maven
date: 2022-07-28
categories: [构建]
tags: [Maven, 依赖管理, 多模块, 插件]
description: Maven 构建工具学习笔记，涵盖坐标、依赖仲裁、生命周期、BOM、多模块与私服。
coverImg: /images/cover-1.svg
permalink: /posts/maven
---

# Maven 系统学习文档

> 从入门到实战，覆盖 Maven 核心概念、依赖管理、生命周期、多模块、私服与高级实践。
> 全文示例基于 **Maven 3.9.8**，核心示例已在本机实际构建验证（联网拉取依赖正常）。

---

## 写在前面

### Maven 是什么

Maven 是 Apache 旗下的 Java 项目构建与依赖管理工具。它通过一个 `pom.xml` 文件描述项目，统一管理依赖、编译、测试、打包、部署等流程，解决了传统 Ant 脚本繁琐、依赖手动管理的问题。

核心概念：

| 概念 | 说明 |
|------|------|
| POM | Project Object Model，项目的 XML 描述文件（`pom.xml`） |
| 坐标 | `groupId:artifactId:version`，唯一定位一个构件 |
| 依赖管理 | 自动下载、传递依赖、版本冲突仲裁 |
| 仓库 | 存放构件的地方（本地仓库 / 远程仓库 / 中央仓库） |
| 生命周期 | 预定义的构建阶段（clean / default / site） |
| 插件 | 实际执行构建任务的最小单元 |

### 环境说明

| 项目 | 版本 |
|------|------|
| 本机 Maven | Apache Maven 3.9.8 |
| 本机 JDK | JDK 8（默认）、JDK 17、JDK 21 |
| 镜像源 | 阿里云 Maven 镜像（加速依赖下载） |
| 文档主线 | Maven 3.9.x，兼容 Maven 3.6+ |

> Maven 3.9 需要 JDK 8+；Maven 3.9.8 可在 JDK 8 上正常运行，本文档的示例默认在此环境验证。

### 安装与配置

```bash
# Windows：解压后配置环境变量
# MAVEN_HOME = D:\env\java\maven\apache-maven-3.9.8
# PATH 追加 %MAVEN_HOME%\bin

# 验证安装
mvn -version
# Apache Maven 3.9.8 (...)
# Java version: 1.8.0_411

# 配置阿里云镜像（conf/settings.xml 的 <mirrors> 节点）
# <mirror>
#   <id>nexus-aliyun</id>
#   <mirrorOf>*</mirrorOf>
#   <url>https://maven.aliyun.com/repository/public</url>
# </mirror>
```

---

# 第一部分：基础篇

## 1. 第一个 Maven 项目

### 1.1 项目标准目录结构

Maven 约定优于配置（Convention over Configuration），标准结构如下：

```text
my-app/
├── pom.xml                       # 项目描述文件
└── src/
    ├── main/
    │   ├── java/                 # 主代码
    │   └── resources/            # 主资源
    └── test/
        ├── java/                 # 测试代码
        └── resources/            # 测试资源
```

构建产物统一输出到 `target/` 目录。

### 1.2 最小 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>       <!-- 组织标识，通常用域名倒写 -->
  <artifactId>mvn-demo</artifactId>    <!-- 项目标识 -->
  <version>1.0-SNAPSHOT</version>      <!-- 版本 -->
  <packaging>jar</packaging>           <!-- 打包类型：jar / war / pom -->

  <properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
</project>
```

### 1.3 主代码与构建

```java
// src/main/java/com/example/App.java
package com.example;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello Maven");
    }
}
```

```bash
mvn compile       # 编译，产物在 target/classes
mvn exec:java -Dexec.mainClass=com.example.App   # 运行（需 exec 插件）
```

> **验证结果**：本机用 Maven 3.9.8 + JDK 8 执行 `mvn compile` 成功，`target/classes/com/example/App.class` 正常生成。

## 2. 坐标与依赖声明

### 2.1 坐标三要素

```xml
<!-- groupId:artifactId:version 唯一定位一个构件 -->
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-lang3</artifactId>
  <version>3.14.0</version>
</dependency>
```

坐标在仓库中的路径规则：`groupId` 的点换成斜杠 + `artifactId` + `version`，例如：

```text
~/.m2/repository/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.jar
```

### 2.2 依赖的基本使用

```xml
<dependencies>
  <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
  </dependency>
</dependencies>
```

```java
// src/main/java/com/example/StringUtil.java
package com.example;

import org.apache.commons.lang3.StringUtils;

public class StringUtil {
    public static boolean isBlank(String s) {
        return StringUtils.isBlank(s);   // 使用 commons-lang3 的方法
    }
}
```

### 2.3 依赖版本属性化

```xml
<properties>
  <commons-lang3.version>3.14.0</commons-lang3.version>
</properties>

<dependencies>
  <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>${commons-lang3.version}</version>
  </dependency>
</dependencies>
```

## 3. 依赖范围（scope）

scope 决定依赖在哪些阶段可用，以及是否传递。

| scope | 编译 | 测试 | 运行 | 传递 | 典型场景 |
|-------|------|------|------|------|---------|
| compile（默认） | ✓ | ✓ | ✓ | ✓ | 业务依赖 |
| provided | ✓ | ✓ | ✗ | ✗ | Servlet API（容器提供） |
| runtime | ✗ | ✓ | ✓ | ✓ | JDBC 驱动 |
| test | ✗ | ✓ | ✗ | ✗ | JUnit |
| system | ✓ | ✓ | ✗ | ✗ | 本地 jar（不推荐） |
| import | — | — | — | — | 仅用于 BOM 导入 |

```xml
<dependencies>
  <!-- 编译、测试、运行都可用（默认，可省略 scope） -->
  <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
  </dependency>

  <!-- 运行时才需要：JDBC 驱动 -->
  <dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.4.0</version>
    <scope>runtime</scope>
  </dependency>

  <!-- 仅测试可用：JUnit 5 -->
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.2</version>
    <scope>test</scope>
  </dependency>

  <!-- 容器提供：Servlet API -->
  <dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope>
  </dependency>
</dependencies>
```

## 4. 生命周期与阶段

Maven 有三套独立生命周期，每套包含若干阶段（phase），执行某阶段会依次执行它之前的所有阶段。

### 4.1 default 生命周期常用阶段

```text
validate → compile → test → package → verify → install → deploy
```

| 阶段 | 作用 |
|------|------|
| validate | 校验项目配置 |
| compile | 编译主代码 |
| test | 运行单元测试 |
| package | 打包成 jar/war |
| verify | 运行集成测试与校验 |
| install | 安装到本地仓库 |
| deploy | 部署到远程仓库 |

```bash
mvn clean            # 清理 target（clean 生命周期）
mvn compile          # 编译
mvn test             # 运行测试
mvn package          # 打包
mvn install          # 安装到本地仓库
mvn clean package    # 组合执行：先清理再打包
```

### 4.2 插件与目标

Maven 本身不做具体工作，所有任务由插件（plugin）的 goal 执行。阶段与插件目标的绑定关系由 packaging 决定。

```bash
# 直接调用插件目标
mvn compiler:compile          # 编译插件的 compile 目标
mvn surefire:test             # 测试插件
mvn dependency:tree           # 依赖树
mvn exec:java -Dexec.mainClass=com.example.App
```

在 pom 中配置插件：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.13.0</version>
      <configuration>
        <source>8</source>
        <target>8</target>
        <encoding>UTF-8</encoding>
      </configuration>
    </plugin>
  </plugins>
</build>
```

## 5. 仓库与镜像

### 5.1 仓库分类

```text
本地仓库：~/.m2/repository
远程仓库：私服（Nexus / Artifactory）或中央仓库
中央仓库：https://repo.maven.apache.org/maven2
```

依赖查找顺序：先查本地仓库 → 找不到再查远程仓库 → 下载到本地仓库。

### 5.2 配置阿里云镜像

在 `~/.m2/settings.xml` 配置：

```xml
<settings>
  <mirrors>
    <mirror>
      <id>nexus-aliyun</id>
      <mirrorOf>*</mirrorOf>
      <name>Aliyun Maven</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```

### 5.3 常用仓库命令

```bash
mvn dependency:get -Dartifact=org.apache.commons:commons-lang3:3.14.0  # 下载单个依赖
mvn clean install -U      # 强制更新快照依赖
mvn -o compile            # 离线模式（只用本地仓库）
```

## 6. 测试与打包

### 6.1 添加 JUnit 5 测试

```xml
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.2</version>
    <scope>test</scope>
  </dependency>
</dependencies>

<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>3.2.5</version>
    </plugin>
  </plugins>
</build>
```

```java
// src/test/java/com/example/StringUtilTest.java
package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StringUtilTest {
    @Test
    void blankStringShouldReturnTrue() {
        assertTrue(StringUtil.isBlank("   "));
        assertFalse(StringUtil.isBlank("hello"));
    }
}
```

```bash
mvn test    # 运行测试，报告在 target/surefire-reports/
```

### 6.2 打包可执行 jar

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-jar-plugin</artifactId>
      <version>3.4.1</version>
      <configuration>
        <archive>
          <manifest>
            <mainClass>com.example.App</mainClass>
          </manifest>
        </archive>
      </configuration>
    </plugin>
  </plugins>
</build>
```

> 注意：`maven-jar-plugin` 打出的 jar 不含依赖，运行需手动加 classpath。要打"胖 jar"（fat jar），用 `maven-shade-plugin` 或 `spring-boot-maven-plugin`（后文高阶篇说明）。

---

# 第二部分：进阶篇

## 1. 依赖传递与冲突仲裁

### 1.1 传递依赖

当 A 依赖 B，B 又依赖 C 时，C 会成为 A 的传递依赖。可用 `dependency:tree` 查看完整依赖树。

```bash
mvn dependency:tree
# [INFO] com.example:app:jar:1.0-SNAPSHOT
# [INFO] +- org.apache.commons:commons-lang3:jar:3.14.0:compile
# [INFO] \- org.springframework:spring-core:jar:6.1.6:compile
# [INFO]    \- org.springframework:spring-jcl:jar:6.1.6:compile
```

### 1.2 冲突仲裁原则

Maven 对同一 `groupId:artifactId` 的多个版本按以下规则选择：

1. **路径最近优先**：直接依赖优先于传递依赖
2. **声明顺序优先**：路径长度相同时，先声明者优先

```xml
<dependencies>
  <!-- 直接声明 3.14.0，即使其它依赖传递进来 3.12.0，也以 3.14.0 为准 -->
  <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
  </dependency>
</dependencies>
```

### 1.3 排除依赖

```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-core</artifactId>
  <version>6.1.6</version>
  <exclusions>
    <exclusion>
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

### 1.4 可选依赖

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>my-driver</artifactId>
  <version>1.0</version>
  <optional>true</optional>   <!-- 不会传递给依赖本项目的使用者 -->
</dependency>
```

## 2. 依赖管理与 BOM

### 2.1 dependencyManagement 统一版本

父 POM 中声明版本，子模块引用时无需写 version。

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-core</artifactId>
      <version>6.1.6</version>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
  <!-- 无需 version，从 dependencyManagement 继承 -->
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
  </dependency>
</dependencies>
```

### 2.2 导入 BOM（import scope）

Spring Boot 的 `spring-boot-dependencies` 是典型的 BOM。

```xml
<properties>
  <spring-boot.version>3.2.5</spring-boot.version>
</properties>

<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>${spring-boot.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
  <!-- BOM 已管理版本，无需写 version -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
</dependencies>
```

## 3. 多模块项目

### 3.1 聚合与继承

父 POM（ packaging 为 `pom`）：

```xml
<!-- 根目录 pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>parent</artifactId>
  <version>1.0-SNAPSHOT</version>
  <packaging>pom</packaging>

  <modules>
    <module>common</module>
    <module>service</module>
    <module>web</module>
  </modules>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
        <version>3.14.0</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
</project>
```

子模块 POM：

```xml
<!-- service/pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>com.example</groupId>
    <artifactId>parent</artifactId>
    <version>1.0-SNAPSHOT</version>
    <relativePath>../pom.xml</relativePath>
  </parent>

  <artifactId>service</artifactId>

  <dependencies>
    <!-- 模块间依赖 -->
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>common</artifactId>
      <version>${project.version}</version>
    </dependency>
    <!-- 版本由父 POM 统一管理 -->
    <dependency>
      <groupId>org.apache.commons</groupId>
      <artifactId>commons-lang3</artifactId>
    </dependency>
  </dependencies>
</project>
```

### 3.2 多模块构建命令

```bash
mvn clean install          # 在根目录构建所有模块（按依赖顺序）
mvn -pl service clean install          # 只构建 service 模块
mvn -pl service -am clean install      # 构建 service 及其依赖的模块
mvn -pl !web clean install             # 排除 web 模块
```

## 4. Profile 多环境配置

profile 用于切换不同环境的配置（开发/测试/生产）。

```xml
<profiles>
  <profile>
    <id>dev</id>
    <activation>
      <activeByDefault>true</activeByDefault>
    </activation>
    <properties>
      <db.url>jdbc:mysql://localhost:3306/dev</db.url>
    </properties>
  </profile>

  <profile>
    <id>prod</id>
    <properties>
      <db.url>jdbc:mysql://prod-host:3306/prod</db.url>
    </properties>
  </profile>
</profiles>

<build>
  <resources>
    <resource>
      <directory>src/main/resources</directory>
      <filtering>true</filtering>   <!-- 开启资源过滤，替换 ${db.url} -->
    </resource>
  </resources>
</build>
```

```properties
# src/main/resources/application.properties
db.url=${db.url}
```

```bash
mvn clean package -Pprod    # 使用 prod profile
mvn help:active-profiles    # 查看激活的 profile
```

## 5. Maven 属性与资源过滤

### 5.1 内置属性

```xml
<properties>
  <!-- 自定义属性 -->
  <app.name>my-app</app.name>

  <!-- 内置属性引用 -->
  <!-- ${project.version}   项目版本 -->
  <!-- ${project.basedir}   项目根目录 -->
  <!-- ${settings.localRepository}  本地仓库路径 -->
  <!-- ${env.JAVA_HOME}     环境变量 -->
</properties>
```

### 5.2 资源过滤实战

```xml
<build>
  <resources>
    <resource>
      <directory>src/main/resources</directory>
      <filtering>true</filtering>
      <includes>
        <include>**/*.properties</include>
      </includes>
    </resource>
    <resource>
      <directory>src/main/resources</directory>
      <filtering>false</filtering>
      <excludes>
        <exclude>**/*.properties</exclude>
      </excludes>
    </resource>
  </resources>
</build>
```

## 6. Maven 插件开发入门（概念）

自定义插件需要继承 `AbstractMojo`，并通过 `@Mojo` 注解声明目标。

```java
// 概念示例：自定义插件的 Mojo（需 maven-plugin-api 依赖）
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;

@Mojo(name = "hello")
public class HelloMojo extends AbstractMojo {
    @Parameter(property = "name", defaultValue = "World")
    private String name;

    public void execute() {
        getLog().info("Hello, " + name + "!");
    }
}
```

调用：`mvn com.example:my-plugin:1.0:hello -Dname=Maven`

> 该示例为插件开发骨架，需要独立的插件工程与 `maven-plugin-plugin` 打包，本节仅作概念说明。

---

# 第三部分：高阶篇

## 1. 依赖冲突排查实战

### 1.1 定位冲突

```bash
# 查看完整依赖树
mvn dependency:tree

# 查看某个依赖被谁引入
mvn dependency:tree -Dincludes=commons-logging:commons-logging

# 分析依赖冲突与未使用依赖
mvn dependency:analyze
```

### 1.2 常用排查流程

```text
1. mvn dependency:tree 找到同一 artifact 的多个版本
2. 确认路径最近优先规则下实际生效的版本
3. 如需强制指定版本：在 dependencyManagement 中锁定
4. 如需移除：用 <exclusions> 排除传递依赖
```

### 1.3 强制锁定版本

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.17.1</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

## 2. 私服 Nexus 与部署

### 2.1 配置私服

```xml
<!-- settings.xml：配置私服为镜像 -->
<mirror>
  <id>nexus-private</id>
  <mirrorOf>*</mirrorOf>
  <url>http://nexus.company.com/repository/maven-public/</url>
</mirror>

<!-- settings.xml：配置部署认证 -->
<servers>
  <server>
    <id>nexus-releases</id>
    <username>admin</username>
    <password>secret</password>
  </server>
</servers>
```

### 2.2 配置部署仓库

```xml
<distributionManagement>
  <repository>
    <id>nexus-releases</id>
    <url>http://nexus.company.com/repository/maven-releases/</url>
  </repository>
  <snapshotRepository>
    <id>nexus-snapshots</id>
    <url>http://nexus.company.com/repository/maven-snapshots/</url>
  </snapshotRepository>
</distributionManagement>
```

```bash
mvn deploy    # 部署到私服
```

## 3. 打胖 jar（Shade 插件）

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-shade-plugin</artifactId>
  <version>3.6.0</version>
  <executions>
    <execution>
      <phase>package</phase>
      <goals>
        <goal>shade</goal>
      </goals>
      <configuration>
        <transformers>
          <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
            <mainClass>com.example.App</mainClass>
          </transformer>
        </transformers>
      </configuration>
    </execution>
  </executions>
</plugin>
```

```bash
mvn package
java -jar target/mvn-demo-1.0-SNAPSHOT.jar
```

## 4. 构建优化与并行

```bash
mvn -T 4 clean install         # 用 4 线程并行构建模块
mvn -T 1C clean install        # 每个 CPU 核心一个线程
mvn -DskipTests package        # 跳过测试
mvn -Dmaven.test.skip=true package  # 跳过测试编译与运行
mvn --offline compile          # 离线构建（依赖已缓存时更快）
```

优化建议：

| 建议 | 说明 |
|------|------|
| 使用本地仓库 + 镜像 | 减少网络等待 |
| 固定插件版本 | 避免每次解析最新版本 |
| 并行构建 `-T` | 多模块项目显著提速 |
| 增量编译 | Maven 默认只编译变化的文件 |
| 避免 `mvn clean` 滥用 | clean 会删除 target 导致全量重编译 |

## 5. 版本管理规范

```xml
<!-- 语义化版本：主版本.次版本.修订号 -->
<version>1.2.3</version>

<!-- SNAPSHOT：开发中版本，可重复部署 -->
<version>1.2.3-SNAPSHOT</version>

<!-- RELEASE：正式版本，不可覆盖 -->
<version>1.2.3-RELEASE</version>
```

版本约定：

| 后缀 | 含义 |
|------|------|
| SNAPSHOT | 快照版，开发中使用，可多次部署 |
| RELEASE | 正式发布版（常省略后缀） |
| rc / beta / alpha | 预发布版本 |

## 6. 常见问题与最佳实践

### 6.1 常见问题

```text
Q: 依赖下载失败 / 速度慢？
A: 配置镜像（阿里云/私服），或检查网络与 settings.xml。

Q: 版本冲突导致 NoSuchMethodError？
A: mvn dependency:tree 定位生效版本，用 dependencyManagement 锁定。

Q: JDK 版本不匹配（class file version 错误）？
A: 检查 maven.compiler.source/target 与实际 JDK 是否一致。

Q: 本地仓库依赖损坏？
A: 删除 ~/.m2/repository 下对应目录，重新下载。
```

### 6.2 最佳实践清单

- pom.xml 中所有依赖版本用 `<properties>` 或 BOM 统一管理。
- 父 POM 用 `dependencyManagement` 锁定版本，子模块只声明 groupId/artifactId。
- 生产环境用 `-Pprod` 切换 profile，避免硬编码配置。
- 多模块项目根目录构建用 `-pl` / `-am` 精准控制范围。
- 定期用 `mvn dependency:analyze` 清理无用依赖。
- 插件一律显式声明版本，避免构建不可复现。

---

# 附录

## 学习路线建议

| 阶段 | 内容 | 目标 |
|------|------|------|
| 第 1 天 | 基础篇 1~6 | 能创建项目、管理依赖、编译打包 |
| 第 2 天 | 进阶篇 1~6 | 掌握依赖仲裁、BOM、多模块、profile |
| 第 3 天 | 高阶篇 1~6 | 能排查冲突、配置私服、优化构建 |

## 练习项目

1. 创建一个单模块项目，引入 commons-lang3，编写 JUnit 5 测试并运行。
2. 搭建父子结构的多模块项目（common / service / web），用 BOM 统一 Spring 版本。
3. 用 profile 实现开发/生产两套数据库配置，打包后检查资源过滤结果。
4. 用 `mvn dependency:tree` 分析一个 Spring Boot 项目的依赖冲突并解决。
5. 用 shade 插件打一个可执行胖 jar 并运行。

## 推荐资源

- Maven 官方文档：<https://maven.apache.org/guides/>
- Maven 依赖机制：<https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html>
- Maven 中央仓库：<https://search.maven.org/>

## 自测题

1. Maven 坐标由哪三要素组成？在仓库中如何定位一个构件？
2. `compile`、`provided`、`runtime`、`test` 四种 scope 的区别是什么？
3. default 生命周期包含哪些主要阶段？执行 `mvn package` 会触发哪些前置阶段？
4. 依赖冲突的两条仲裁原则是什么？
5. `dependencyManagement` 与 `dependencies` 的区别是什么？
6. BOM 的作用是什么？为什么要设置 `<scope>import</scope>`？
7. 聚合（modules）与继承（parent）分别解决什么问题？
8. profile 的典型用途是什么？如何激活指定 profile？
9. 如何排查依赖冲突？列出三个常用命令。
10. SNAPSHOT 与 RELEASE 版本的区别是什么？
11. `-pl` 与 `-am` 参数的作用分别是什么？
12. 如何配置阿里云镜像加速依赖下载？
