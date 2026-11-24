---
title: Maven
date: 2021-03-30
categories: [构建工具]
tags: [Maven, 依赖管理]
description: Maven 依赖管理与项目构建配置指南。
coverImg: /images/cover-6.svg
permalink: /posts/maven
---



# Maven的核心概念

1. 约定的目录结构
2. POM
3. 坐标
4. 依赖
5. 仓库
6. 生命周期
7. 继承
8. 聚合

# 1.约定的目录结构

## 目录结构

![image-20210930104040854](https://fanaidi.gitee.io/blogimgs/Maven/目录结构.png)

> 根目录:工程名
>
> src目录:源码
>
> pom.xml:Maven工程的核心配置文件
>
> main目录:存放主程序
>
> test目录:存放测试程序
>
> java目录:存放java源文件
>
> resources:存放框架或其他工具的配置文件

## 为什么要遵守约定的目录结构?

> 1.Maven要负责我们这个项目的自动化构建,以编译为例,Maven要想自动进行编译,那么它必须知道Java源文件保存在哪里
>
> 2.自定义文件想要让框架或工具知道,有两种方法.
>
> ​	(1)以配置的方式明确告诉框架
>
> ```xml
> &lt;param-value>classpath:spring-context.xml&lt;/param-value>
> ```
>
> ​	(2)遵守框架内部已经存在的约定
>
> ​		例:log4j.properties或log4j.xml
>
> 3.约定>配置>编码

# 常用Maven命令

> 注意:执行与构建过程相关的Maven命令,必须进入pom.xml所在的目录.
>
> 与构建过程相关:编译 测试 打包...

## 常用命令

> mvn clean:清理
>
> mvn compile:编译主程序
>
> mvn test-compile:编译测试程序
>
> mvn test:执行测试
>
> mvn package:打包

# 2.POM

> 含义:Project Object Model项目对象模型
>
> pom.xml对应Maven工程是核心配置文件,与构建过程相关的一切设置都在这个文件中进行配置.

# 3.坐标gav

> 1.Maven中的坐标使用下面三个向量在仓库中唯一定位一个Maven工程
>
> ​	1.**g**roupid: 公司或组织域名倒序+项目名
>
> ​	2.**a**rtifactid:模块名
>
> ​	3.**v**ersion:版本
>
> 2.Maven工程的坐标与仓库中路径的对应关系
>
> ​	坐标:
>
>   	&lt;groupId>org.springframework&lt;/groupId>
>				
>   	&lt;artifactId>spring-core&lt;/artifactId>  
>				
>   	&lt;version>5.3.1&lt;/version>
>
> ​	路径: org\springframework\spring-core\5.3.1

# 4.依赖

> 1.Maven解析依赖信息时会到本地仓库中查找被依赖的jar包
>
> ​	对于我们自己开发的Maven工程,使用**mvn install**命令安装后就可以进入仓库.

## 1.compile范围依赖

![image-20210930145949011](https://fanaidi.gitee.io/blogimgs/Maven/compile和test依赖.png)

> 对主程序是否有效:	有效
>
> 对测试程序是否有效:有效
>
> 是否参与打包:参与

## 2.test范围依赖

> 对主程序是否有效:无效
>
> 对测试程序是否有效:有效
>
> 是否参与打包:不参与
>
> 典型的例子:junit

## 3.provide范围依赖

![](https://fanaidi.gitee.io/blogimgs/Maven/provided范围的依赖.png)

> 对主程序是否有效:有效
>
> 对测试程序是否有效:有效
>
> 是否参与打包:不参与
>
> 是否参与部署:不参与
>
> 典型的例子:servlet-api 

## 4.依赖的传递性

> 好处:可以传递的依赖不必在每个模块工程中都重复声明,在”最下面”的工程中依赖-次即可。
>
> 注意:非compile范围的依赖不能传递。所以在各个工程模块中,如果有需要就得重复声明依赖。

## 5.依赖的排除

~~~xml
&lt;exclusions>
    &lt;exclusion>
        &lt;groupId>commons-logging&lt;/groupId>
        &lt;artifactId>commons-logging&lt;/artifactId>
    &lt;/exclusion>
&lt;/exclusions>
~~~

## 6.依赖的原则

> 作用：解决模块工程之间的jar包冲突问题
>
> 遵循路径最短者原则
>
> 路径相同时,先声明者优先

## 7.统一管理依赖的版本

配置方式:使用properties标签内使用自定义标签统一声明版本号

```XML
&lt;properties>
	 	&lt;aa.bb.cc>4.0.0.RELEASE&lt;/aa.bb.cc>
&lt;/properties>
```

在需要统一版本的位置,使用${自定义标签名}引用声明的版本号

```xml
&lt;version>${aa.bb.cc}&lt;/version>
```

其实properties标签配合自定义标签声明数据的配置并不是只能用于声明依赖的版本号。凡是需要统一声明后再弓|用的场合都可以使用

# 5.仓库

> 仓库的分类
>
> - 本地仓库：当前电脑上部署的仓库目录，为当前电脑上多有Maven工程服务
>
> - 远程仓库
>
>   - 私服：搭建在局域网环境中,为局域网范围内的所有Maven工程服务
>   - 中央仓库：架设在Internet上,为全世界所有Maven工程服务
>   - 中央仓库镜像：为了分担中央仓库的流量,提升用户访问速度
>
>   仓库中保存的内容：Maven工程
>
>   - Maven自身所需的插件
>   - 第三方框架或工具的jar包
>   - 自己开发的Maven工程

# 6.生命周期

> 1.各个构建环节执行的顺序:不能打乱顺序,必须按照既定的正确顺序来执行
>
> 2.Maven的核心程序中定义了抽象的生命周期,生命周期中各个阶段的具体任务是由插件来完成的.
>
> 3.Maven的核心程序为了更好的实现自动化构建,按照这一特点执行生命周期中的各个阶段:不论现在要执行生命周期中的哪一个阶段,都是从这个生命周期最初的位置开始执行
>
> 4.插件和目标
>
> ​	生命周期的各个阶段仅仅定义了要执行的任务是什么.
>
> ​	各个阶段和插件的目标是对应的.
>
> ​	相似的目标由特定的插件完成

### 构建过程的各个环节

1. 清理:将以前编译得到的旧的class字节码文件删除,为下一-次编译做准备
2. 编译:将Java源程序编程成class字节码文件
3. 测试:自动测试，自动调用junit程序
4. 报告:测试程序执行的结果
5. 打包:动态Web_ I程打war包, Java工程打jar包
6. 安装: Maven特定的概念一将打包得到的文件复制到 "仓库”中的指定位置
7. 部署:将动态Web.工程生成的war包复制到Servlet容器的指定目录下,使其可以运行

# 7.继承

> 目的:统一管理各个模块工程中对junit依赖的版本

# 8.聚合

> 作用：一键安装各个模块工程
>
> 配置方式：在一个”总的聚合工程“中配置各个参与聚合的模块

```xml
<!-- 配置聚合 -->
	&lt;modules>
		<!-- 指定各个子工程的相对路径 -->
		&lt;module>../HelloFriend&lt;/module>
		&lt;module>../MakeFriends&lt;/module>
		&lt;module>../Hello&lt;/module>
	&lt;/modules>
```

