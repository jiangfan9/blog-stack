---
title: Gradle
date: 2022-07-28
categories: [构建]
tags: [Gradle, Kotlin DSL, 依赖管理, 插件]
description: Gradle 构建工具学习笔记，涵盖任务机制、Groovy/Kotlin DSL、多模块、自定义插件与性能优化。
coverImg: /images/cover-1.svg
permalink: /posts/gradle
---

# Gradle 系统学习文档

> 从入门到实战，覆盖 Gradle 核心概念、Groovy/Kotlin DSL、依赖管理、任务机制、插件、多模块、自定义插件与性能优化。
> 全文示例基于 **Gradle 9.4.1**（Kotlin 2.3.0 / Groovy 4.0.29），核心示例已在本机实际构建验证。

---

## 写在前面

### Gradle 是什么

Gradle 是一个基于 JVM 的通用构建工具，使用 Groovy 或 Kotlin 编写构建脚本（DSL），兼具 Maven 的依赖管理能力与 Ant 的灵活性。它是 Android 官方构建工具，也是 Java 生态中越来越主流的构建选择。

核心特性：

| 特性 | 说明 |
|------|------|
| DSL 脚本 | 用 Groovy / Kotlin 编写构建逻辑，而非 XML |
| 增量构建 | 只重新执行受影响的 task，构建快 |
| 构建缓存 | 跨构建复用任务输出 |
| 依赖管理 | 兼容 Maven/Ivy 仓库，支持 BOM、版本锁定 |
| 约定优于配置 | Java 插件提供标准目录结构 |
| Toolchain | 自动管理编译所需的 JDK 版本 |

### 环境说明

| 项目 | 版本 |
|------|------|
| 本机 Gradle | 9.4.1（位于 Android SDK 目录） |
| 本机 JDK | JDK 8（默认）、JDK 17、JDK 21 |
| 文档主线 | Gradle 9.x，关键处标注 8.x 差异 |
| 最低要求 | Gradle 9.x 需要 **JDK 17+** 运行 |

> **重要**：Gradle 9.x 本身需要 JDK 17+ 才能运行。本文档示例在本机用 `JAVA_HOME=jdk-17` 验证通过；若用 JDK 8 启动会报错。项目编译目标可通过 toolchain 单独指定（见后文）。

### 安装与配置

```bash
# Windows：解压后配置环境变量
# GRADLE_HOME = D:\env\android\gradle-9.4.1
# PATH 追加 %GRADLE_HOME%\bin

# 验证
gradle -version
# Gradle 9.4.1
# Kotlin: 2.3.0, Groovy: 4.0.29
# Launcher JVM: 1.8.0_411（注意：Gradle 9 需 JDK 17+ 运行）

# 指定 JDK 17 运行（Windows Bash）
export JAVA_HOME=/d/env/java/jdk-17
gradle --no-daemon --console=plain build
```

加速配置（`~/.gradle/gradle.properties`）：

```properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.jvmargs=-Xmx2g -Dfile.encoding=UTF-8
```

---

# 第一部分：基础篇

## 1. 第一个 Gradle 项目

### 1.1 标准目录结构

Gradle Java 插件沿用 Maven 的目录约定：

```text
my-app/
├── settings.gradle              # 项目/模块声明（Gradle 9 推荐）
├── build.gradle                 # 构建脚本（Groovy DSL）
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew / gradlew.bat        # Wrapper 脚本
└── src/
    ├── main/java/               # 主代码
    ├── main/resources/          # 主资源
    ├── test/java/               # 测试代码
    └── test/resources/          # 测试资源
```

构建产物输出到 `build/` 目录。

### 1.2 最小构建脚本

```groovy
// settings.gradle
rootProject.name = 'my-app'
```

```groovy
// build.gradle
plugins {
    id 'java'
}

group = 'com.example'
version = '1.0-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}
```

```java
// src/main/java/com/example/App.java
package com.example;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello Gradle");
    }
}
```

```bash
gradle compileJava   # 编译
gradle build         # 完整构建（编译+测试+打包）
gradle clean         # 清理 build 目录
```

> **验证结果**：本机 Gradle 9.4.1 + JDK 17 执行 `gradle compileJava`、`gradle build` 均成功，`build/classes/java/main` 正常生成 class 文件。

## 2. 构建脚本基础

### 2.1 Project 与 Task

构建脚本围绕两个核心对象：**Project**（项目）和 **Task**（任务）。

```groovy
// build.gradle
println "项目名: ${project.name}"        // 打印项目信息
println "项目版本: ${project.version}"

// 定义一个任务
def hello = tasks.register('hello') {
    doLast {
        println 'Hello from custom task'
    }
}

// 运行：gradle hello
```

### 2.2 任务的 doFirst / doLast

```groovy
tasks.register('greet') {
    doFirst {
        println '执行前'
    }
    doLast {
        println '执行后'
    }
}
```

```bash
gradle greet
# 执行前
# 执行后
```

### 2.3 任务依赖

```groovy
tasks.register('first') {
    doLast { println 'first' }
}
tasks.register('second') {
    dependsOn 'first'          // second 依赖 first
    doLast { println 'second' }
}
```

```bash
gradle second
# > Task :first
# first
# > Task :second
# second
```

## 3. 依赖管理

### 3.1 依赖配置（Configuration）

```groovy
plugins {
    id 'java-library'          // java-library 提供 api / implementation
}

repositories {
    mavenCentral()
}

dependencies {
    api 'org.apache.commons:commons-lang3:3.14.0'        // 暴露给使用者（传递）
    implementation 'com.google.guava:guava:33.0.0-jre'  // 内部使用（不暴露）
    compileOnly 'org.projectlombok:lombok:1.18.32'       // 仅编译
    runtimeOnly 'com.mysql:mysql-connector-j:8.4.0'      // 仅运行
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'  // 仅测试
}
```

依赖配置对照表：

| 配置 | 编译 | 运行 | 传递 | 对应 Maven scope |
|------|------|------|------|-----------------|
| `api` | ✓ | ✓ | ✓ | compile |
| `implementation` | ✓ | ✓ | ✗（对使用者隐藏） | compile（优化后） |
| `compileOnly` | ✓ | ✗ | ✗ | provided |
| `runtimeOnly` | ✗ | ✓ | ✓ | runtime |
| `testImplementation` | 仅测试 | 仅测试 | ✗ | test |

### 3.2 BOM 与平台依赖

```groovy
dependencies {
    // 使用 platform 导入 BOM，统一版本
    implementation platform('org.springframework.boot:spring-boot-dependencies:3.2.5')

    // 无需写版本号，由 BOM 管理
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // JUnit BOM 同理
    testImplementation platform('org.junit:junit-bom:5.10.2')
    testImplementation 'org.junit.jupiter:junit-jupiter'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

### 3.3 依赖排除与强制版本

```groovy
dependencies {
    implementation('org.springframework:spring-core:6.1.6') {
        exclude group: 'commons-logging', module: 'commons-logging'
    }

    implementation('com.example:a:1.0') {
        transitive = false         // 禁用传递依赖
    }
}

// 强制使用指定版本（冲突仲裁）
configurations.all {
    resolutionStrategy {
        force 'com.fasterxml.jackson.core:jackson-databind:2.17.1'
        // 或使用 eachDependency 动态替换
        eachDependency { details ->
            if (details.requested.group == 'org.apache.commons') {
                details.useVersion '3.14.0'
            }
        }
    }
}
```

### 3.4 查看依赖树

```bash
gradle dependencies               # 全部依赖树
gradle dependencies --configuration runtimeClasspath  # 某配置
gradle dependencyInsight --dependency guava --configuration runtimeClasspath  # 定位某依赖来源
```

## 4. 测试与打包

### 4.1 启用 JUnit 5

```groovy
plugins {
    id 'java'
}

dependencies {
    testImplementation platform('org.junit:junit-bom:5.10.2')
    testImplementation 'org.junit.jupiter:junit-jupiter'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()            // Gradle 启用 JUnit 5 的关键配置
    testLogging {
        events 'passed', 'skipped', 'failed'
    }
}
```

```java
// src/test/java/com/example/AppTest.java
package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AppTest {
    @Test
    void basicAssertions() {
        assertEquals(4, 2 + 2);
        assertTrue("hello".startsWith("h"));
    }
}
```

```bash
gradle test    # 运行测试，报告在 build/reports/tests/test/index.html
```

> **验证结果**：本机执行 `gradle build`（含 test 任务）成功，JUnit 5 测试全部通过，HTML 测试报告正常生成。

### 4.2 打可执行 jar

```groovy
// 方式一：jar 任务配置 Main-Class
tasks.named('jar') {
    manifest {
        attributes 'Main-Class': 'com.example.App'
    }
}
```

```bash
gradle jar
java -jar build/libs/my-app-1.0-SNAPSHOT.jar
```

> 普通 jar 不含依赖。要打包含所有依赖的 fat jar，需用 Shadow 插件（见进阶篇）或 Spring Boot 插件。

## 5. Gradle Wrapper

Wrapper 让项目自带 Gradle 版本，团队成员无需单独安装 Gradle。

```bash
# 生成 Wrapper（需先有 gradle）
gradle wrapper --gradle-version 9.4.1

# 生成的文件
# gradlew / gradlew.bat
# gradle/wrapper/gradle-wrapper.jar
# gradle/wrapper/gradle-wrapper.properties
```

```properties
# gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-9.4.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

```bash
# 使用者直接用 wrapper 构建（自动下载指定版本 Gradle）
./gradlew build      # Linux/Mac
gradlew build        # Windows
```

> Wrapper 是团队项目的标配，能保证所有人使用同一 Gradle 版本，避免"在我机器上能跑"的问题。

---

# 第二部分：进阶篇

## 1. 增量构建与构建缓存

### 1.1 声明输入与输出

Gradle 通过任务的输入/输出判断是否需要重新执行：

```groovy
tasks.register('generateReport') {
    inputs.file 'data.csv'                    // 声明输入
    inputs.property 'format', 'json'          // 属性输入
    outputs.file layout.buildDirectory.file('report.json')  // 声明输出

    doLast {
        def out = layout.buildDirectory.file('report.json').get().asFile
        out.text = '{"generated": true}'
    }
}
```

```bash
gradle generateReport     # 第一次：执行
gradle generateReport     # 第二次：UP-TO-DATE（跳过）
```

### 1.2 构建缓存

```properties
# gradle.properties
org.gradle.caching=true
```

```bash
gradle build --build-cache      # 启用构建缓存
gradle build --no-build-cache   # 禁用
```

缓存机制：将任务输出按输入哈希存入 `~/.gradle/caches/build-cache-1`，跨构建复用。

## 2. 插件机制

### 2.1 应用插件

```groovy
plugins {
    id 'java'                              // 核心插件
    id 'application'                       // 应用插件
    id 'org.springframework.boot' version '3.2.5'  // 外部插件（需指定版本）
    id 'io.spring.dependency-management' version '1.1.4'
}
```

### 2.2 application 插件

```groovy
plugins {
    id 'application'
}

application {
    mainClass = 'com.example.App'
}
```

```bash
gradle run          # 直接运行主类
gradle distZip      # 生成包含依赖的发行包
```

### 2.3 自定义任务类型

```groovy
// 定义一个可复用的任务类型
abstract class GreetingTask extends DefaultTask {
    @Input
    abstract Property<String> getName()

    @TaskAction
    void greet() {
        println "Hello, ${name.get()}!"
    }
}

tasks.register('greetAlice', GreetingTask) {
    name = 'Alice'
}
tasks.register('greetBob', GreetingTask) {
    name = 'Bob'
}
```

```bash
gradle greetAlice greetBob
# Hello, Alice!
# Hello, Bob!
```

> 用 `@Input` / `@TaskAction` 注解的自定义任务类型能正确参与增量构建，优于在 `doLast` 里写逻辑。

## 3. 多模块项目

### 3.1 settings.gradle 声明模块

```groovy
// settings.gradle
rootProject.name = 'multi-app'

include 'common'
include 'service'
include 'web'
```

### 3.2 根项目统一配置

```groovy
// build.gradle（根项目）
plugins {
    id 'java' apply false
}

subprojects {
    apply plugin: 'java'

    group = 'com.example'
    version = '1.0-SNAPSHOT'

    repositories {
        mavenCentral()
    }

    dependencies {
        testImplementation platform('org.junit:junit-bom:5.10.2')
        testImplementation 'org.junit.jupiter:junit-jupiter'
        testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
    }

    tasks.named('test') {
        useJUnitPlatform()
    }
}
```

### 3.3 子模块依赖

```groovy
// service/build.gradle
plugins {
    id 'java-library'
}

dependencies {
    api project(':common')                        // 依赖同级模块
    implementation 'org.apache.commons:commons-lang3:3.14.0'
}
```

```bash
gradle :service:build       # 只构建 service 模块
gradle build                # 构建全部模块
gradle projects             # 列出所有项目
```

## 4. Kotlin DSL

Gradle 官方推荐 Kotlin DSL，具备类型安全与 IDE 自动补全。

```kotlin
// settings.gradle.kts
rootProject.name = "my-app-kotlin"
```

```kotlin
// build.gradle.kts
plugins {
    java
    application
}

group = "com.example"
version = "1.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.apache.commons:commons-lang3:3.14.0")
    testImplementation(platform("org.junit:junit-bom:5.10.2"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass.set("com.example.App")
}

tasks.register<JavaExec>("runApp") {
    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("com.example.App")
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
```

Groovy DSL 与 Kotlin DSL 对照：

| 场景 | Groovy DSL | Kotlin DSL |
|------|-----------|-----------|
| 插件 | `id 'java'` | `java` 或 `id("java")` |
| 字符串 | `'xxx'` 或 `"xxx"` | `"xxx"` |
| 依赖 | `implementation 'g:a:v'` | `implementation("g:a:v")` |
| 任务 | `tasks.register('x') {}` | `tasks.register("x") {}` |
| 属性赋值 | `mainClass = 'x'` | `mainClass.set("x")` |

## 5. 版本锁定（Dependency Locking）

锁定依赖的精确版本，保证构建可复现。

```groovy
// build.gradle
dependencyLocking {
    lockAllConfigurations()
}
```

```bash
gradle dependencies --write-locks   # 生成 gradle.lockfile
gradle build --lock-state           # 检查锁定状态
```

生成的 `gradle.lockfile` 示例：

```text
# This is a Gradle generated file for dependency locking.
runtimeClasspath - Runtime classpath of source set 'main'.
com.google.guava:guava:33.0.0-jre=compileClasspath,runtimeClasspath
org.apache.commons:commons-lang3:3.14.0=compileClasspath,runtimeClasspath
empty=annotationProcessor,testAnnotationProcessor
```

## 6. 自定义源码集与多环境打包

```groovy
sourceSets {
    integrationTest {
        java.srcDir 'src/integrationTest/java'
        resources.srcDir 'src/integrationTest/resources'
        compileClasspath += sourceSets.main.output + configurations.testRuntimeClasspath
        runtimeClasspath += output + compileClasspath
    }
}

tasks.register('integrationTest', Test) {
    testClassesDirs = sourceSets.integrationTest.output.classesDirs
    classpath = sourceSets.integrationTest.runtimeClasspath
    useJUnitPlatform()
}
```

## 7. 发布构件

```groovy
plugins {
    id 'maven-publish'
}

publishing {
    publications {
        mavenJava(MavenPublication) {
            from components.java
            groupId = 'com.example'
            artifactId = 'my-lib'
            version = '1.0.0'
        }
    }
    repositories {
        maven {
            name = 'myRepo'
            url = layout.buildDirectory.dir('repo')
        }
    }
}
```

```bash
gradle publishToMavenLocal    # 发布到本地 Maven 仓库
gradle publish                # 发布到配置的仓库
```

---

# 第三部分：高阶篇

## 1. Gradle 构建生命周期

Gradle 构建分三个阶段：

```text
初始化（Initialization）→ 配置（Configuration）→ 执行（Execution）
```

| 阶段 | 作用 | 对应文件 |
|------|------|---------|
| 初始化 | 确定参与构建的项目 | settings.gradle |
| 配置 | 创建并配置任务，构建任务图 | build.gradle（顶层代码） |
| 执行 | 按依赖关系执行任务 | doLast / @TaskAction |

```groovy
// 生命周期钩子示例
gradle.settingsEvaluated { println 'settings 解析完成' }
gradle.projectsLoaded { println '项目加载完成' }
gradle.beforeProject { p -> println "配置前: ${p.name}" }
gradle.afterProject { p -> println "配置后: ${p.name}" }
gradle.taskGraph.whenReady { println '任务图就绪' }
gradle.buildFinished { result -> println "构建结束: ${result.failure ? '失败' : '成功'}" }
```

> **性能提示**：应尽量避免在配置阶段做耗时操作（如网络请求），否则每次执行任何任务都会承担该开销。

## 2. 自定义插件开发

### 2.1 buildSrc 项目

`buildSrc` 是项目内自定义插件/任务的标准位置，会自动编译并加入构建脚本 classpath。

```text
buildSrc/
├── build.gradle
└── src/main/groovy/com/example/GreetingPlugin.groovy
```

```groovy
// buildSrc/build.gradle
plugins {
    id 'groovy'
}
repositories {
    mavenCentral()
}
dependencies {
    implementation gradleApi()
    implementation localGroovy()
}
```

```groovy
// buildSrc/src/main/groovy/com/example/GreetingPlugin.groovy
package com.example

import org.gradle.api.Plugin
import org.gradle.api.Project

class GreetingPlugin implements Plugin<Project> {
    void apply(Project project) {
        project.tasks.register('greet') {
            doLast {
                println 'Greeting from custom plugin'
            }
        }
    }
}
```

```groovy
// build.gradle 中应用
plugins {
    id 'com.example.greeting'    // 来自 buildSrc
}
```

### 2.2 独立插件项目（概念）

发布到 Gradle Plugin Portal 的插件需要独立工程，`build.gradle` 中使用 `java-gradle-plugin`：

```groovy
plugins {
    id 'java-gradle-plugin'
    id 'maven-publish'
}

gradlePlugin {
    plugins {
        greeting {
            id = 'com.example.greeting'
            implementationClass = 'com.example.GreetingPlugin'
        }
    }
}
```

## 3. 依赖解析策略深入

```groovy
configurations.all {
    resolutionStrategy {
        // 缓存动态版本的时间
        cacheDynamicVersionsFor 30, 'minutes'
        cacheChangingModulesFor 0, 'seconds'

        // 依赖替换
        dependencySubstitution {
            substitute module('com.example:old-lib') using module('com.example:new-lib:2.0')
        }

        // 冲突时失败而非静默选择
        failOnVersionConflict()
    }
}
```

```groovy
// 仓库内容过滤（限制仓库只包含某些依赖，提升安全性与速度）
repositories {
    mavenCentral {
        content {
            includeGroup 'org.apache.commons'
            includeGroupByRegex 'org\\.springframework.*'
        }
    }
}
```

## 4. 性能优化实战

### 4.1 关键配置

```properties
# gradle.properties
org.gradle.daemon=true             # 守护进程
org.gradle.parallel=true           # 并行构建模块
org.gradle.caching=true            # 构建缓存
org.gradle.configureondemand=true  # 按需配置（多模块）
org.gradle.jvmargs=-Xmx2g -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8
```

### 4.2 命令行诊断

```bash
gradle build --profile          # 生成性能报告（build/reports/profile）
gradle build --scan             # 生成 Build Scan（需联网）
gradle build --dry-run          # 只显示将执行的任务，不实际执行
gradle help --task compileJava  # 查看任务详情
```

### 4.3 优化清单

| 优化项 | 说明 |
|--------|------|
| 启用 daemon | 避免每次启动 JVM |
| 启用并行与缓存 | 多模块项目收益明显 |
| 避免配置阶段耗时操作 | 配置阶段每次构建都会执行 |
| 使用 toolchain | 自动管理 JDK，避免环境不一致 |
| 正确的输入/输出声明 | 让增量构建准确判断 |
| 减少动态版本 | 使用固定版本或锁定 |

## 5. 常见问题与最佳实践

### 5.1 常见问题

```text
Q: Gradle 9 启动报 "Unsupported class file major version"？
A: Gradle 9 需 JDK 17+ 运行，请设置 JAVA_HOME 为 JDK 17/21。

Q: 依赖下载慢？
A: 配置国内镜像仓库（阿里云），或用 init.gradle 全局替换仓库地址。

Q: "Could not resolve" 依赖找不到？
A: 检查仓库配置、坐标拼写、版本号是否正确。

Q: 测试不运行？
A: JUnit 5 需 tasks.named('test') { useJUnitPlatform() }。

Q: 构建缓存导致结果异常？
A: 任务未正确声明输入/输出，检查 @Input / @Output 注解。
```

### 5.2 init.gradle 全局镜像配置

```groovy
// ~/.gradle/init.gradle（全局生效）
allprojects {
    repositories {
        def aliyun = 'https://maven.aliyun.com/repository/public'
        maven { url aliyun }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        mavenCentral()
    }
}
```

### 5.3 最佳实践清单

- 新项目优先用 Kotlin DSL + Wrapper，保证类型安全与版本一致。
- 依赖版本用 BOM 或版本锁定管理，避免动态版本。
- 自定义任务用 `@Input` / `@TaskAction` 的任务类型，支持增量构建。
- 多模块项目在根 `build.gradle` 用 `subprojects` / `allprojects` 统一配置。
- 定期用 `--profile` 分析构建瓶颈。
- 生产构建启用缓存与并行，但 CI 环境注意缓存隔离。

## 6. Maven 与 Gradle 对比与迁移

### 6.1 核心差异

| 维度 | Maven | Gradle |
|------|-------|--------|
| 配置格式 | XML（pom.xml） | Groovy / Kotlin DSL |
| 构建模型 | 固定生命周期 | 灵活的任务图 |
| 性能 | 较慢 | 增量构建 + 缓存，更快 |
| 灵活性 | 约定强，扩展需写插件 | 脚本即代码，灵活 |
| 学习曲线 | 简单直观 | 需理解 DSL 与任务机制 |
| 适用场景 | 传统 Java 企业项目 | Android、大型多模块、复杂构建 |

### 6.2 依赖配置对照

```text
Maven scope          → Gradle configuration
compile              → api / implementation
provided             → compileOnly
runtime              → runtimeOnly
test                 → testImplementation
import (BOM)         → platform(...)
```

### 6.3 常用命令对照

| 目的 | Maven | Gradle |
|------|-------|--------|
| 编译 | `mvn compile` | `gradle compileJava` |
| 测试 | `mvn test` | `gradle test` |
| 打包 | `mvn package` | `gradle jar` |
| 安装到本地 | `mvn install` | `gradle publishToMavenLocal` |
| 清理 | `mvn clean` | `gradle clean` |
| 依赖树 | `mvn dependency:tree` | `gradle dependencies` |
| 跳过测试 | `-DskipTests` | `-x test` |

---

# 附录

## 学习路线建议

| 阶段 | 内容 | 目标 |
|------|------|------|
| 第 1 天 | 基础篇 1~5 | 能创建项目、管理依赖、测试打包 |
| 第 2 天 | 进阶篇 1~7 | 掌握增量构建、插件、多模块、Kotlin DSL |
| 第 3 天 | 高阶篇 1~6 | 理解生命周期、自定义插件、性能调优、迁移 |

## 练习项目

1. 创建单模块 Java 项目，引入 commons-lang3，用 JUnit 5 编写测试并运行。
2. 搭建多模块项目（common / service / web），用 `subprojects` 统一配置依赖。
3. 将上一项目的 build.gradle 改写为 Kotlin DSL（build.gradle.kts）。
4. 用 `buildSrc` 编写一个自定义插件，添加 `hello` 任务。
5. 用 `--profile` 分析构建性能，启用缓存与并行后对比耗时。
6. 将一个 Maven 项目迁移到 Gradle，对照命令与依赖配置。

## 推荐资源

- Gradle 官方文档：<https://docs.gradle.org/current/userguide/userguide.html>
- Gradle DSL 参考：<https://docs.gradle.org/current/dsl/>
- Kotlin DSL 指南：<https://docs.gradle.org/current/userguide/kotlin_dsl.html>
- Gradle 插件门户：<https://plugins.gradle.org/>

## 自测题

1. Gradle 构建脚本基于哪两种 DSL？各自的文件名是什么？
2. `api` 与 `implementation` 的区别是什么？分别对应 Maven 的什么 scope？
3. 如何在 Gradle 中启用 JUnit 5？
4. Wrapper 的作用是什么？为什么团队项目应该使用 Wrapper？
5. Gradle 构建的三个阶段是什么？各阶段对应哪些文件？
6. 增量构建依赖哪两个关键要素？如何声明？
7. `buildSrc` 的作用是什么？适合什么场景？
8. Kotlin DSL 与 Groovy DSL 在插件声明和字符串写法上有什么区别？
9. 如何锁定依赖版本保证构建可复现？
10. Gradle 9 对 JDK 版本有什么要求？project 的编译版本如何单独指定？
11. `org.gradle.parallel` 与 `org.gradle.caching` 分别解决什么问题？
12. 列出三个 Maven 与 Gradle 常用命令的对照关系。
