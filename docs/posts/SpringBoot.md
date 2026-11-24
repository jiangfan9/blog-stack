---
title: SpringBoot
date: 2021-08-02
categories: [Spring]
tags: [SpringBoot, 自动配置]
description: Spring Boot 自动配置、启动流程与常用组件学习笔记。
coverImg: /images/cover-4.svg
permalink: /posts/springboot
---



# SpringBoot介绍

## 为什么用SpringBoot

> Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".
> 
> 能快速创建出生产级别的Spring应用

## SpringBoot优点

- Create stand-alone Spring applications

- - 创建独立Spring应用

- Embed Tomcat, Jetty or Undertow directly (no need to deploy WAR files)

- - 内嵌web服务器

- Provide opinionated 'starter' dependencies to simplify your build configuration

- - 自动starter依赖，简化构建配置

- Automatically configure Spring and 3rd party libraries whenever possible

- - 自动配置Spring以及第三方功能

- Provide production-ready features such as metrics, health checks, and externalized configuration

- - 提供生产级别的监控、健康检查及外部化配置

- Absolutely no code generation and no requirement for XML configuration

- - 无代码生成、无需编写XML

> pringBoot是整合Spring技术栈的一站式框架
> 
> SpringBoot是简化Spring技术栈的快速开发脚手架

## SpringBoot缺点

> - 人称版本帝，迭代快，需要时刻关注变化
> - 封装太深，内部原理复杂，不容易精通

# 自动装配原理

## 1.SpringBoot特点

### 1.1依赖管理

- 父项目做依赖管理

```xml
依赖管理    
&lt;parent>
        &lt;groupId>org.springframework.boot&lt;/groupId>
        &lt;artifactId>spring-boot-starter-parent&lt;/artifactId>
        &lt;version>2.3.4.RELEASE&lt;/version>
&lt;/parent>

他的父项目
 &lt;parent>
    &lt;groupId>org.springframework.boot&lt;/groupId>
    &lt;artifactId>spring-boot-dependencies&lt;/artifactId>
    &lt;version>2.3.4.RELEASE&lt;/version>
  &lt;/parent>

几乎声明了所有开发中常用的依赖的版本号,自动版本仲裁机制
```

- 开发导入starter场景启动器

```xml
1、见到很多 spring-boot-starter-* ： *就某种场景
2、只要引入starter，这个场景的所有常规需要的依赖我们都自动引入
3、SpringBoot所有支持的场景
https://docs.spring.io/spring-boot/docs/current/reference/html/using-spring-boot.html#using-boot-starter
4、见到的  *-spring-boot-starter： 第三方为我们提供的简化开发的场景启动器。
5、所有场景启动器最底层的依赖
&lt;dependency>
  &lt;groupId>org.springframework.boot&lt;/groupId>
  &lt;artifactId>spring-boot-starter&lt;/artifactId>
  &lt;version>2.3.4.RELEASE&lt;/version>
  &lt;scope>compile&lt;/scope>
&lt;/dependency>
```

- 需关注版本号，自动版本仲裁

> 1、引入依赖默认都可以不写版本 
> 
> 2、引入非版本仲裁的jar，要写版本号。

- 可以修改默认版本号

```xml
1、查看spring-boot-dependencies里面规定当前依赖的版本 用的 key。
2、在当前项目里面重写配置
    &lt;properties>
        &lt;mysql.version>5.1.43&lt;/mysql.version>
    &lt;/properties>
```

### 1.2自动装配

> 1.自动配好Tomcat
> 
> 2.自动配好SpringMVC
> 
> ​    引入SpringMVC全套组件
> 
> ​    自动配好SpringMVC常用组件
> 
> 3.自动配好Web常见功能,如:字符编码问题
> 
> ​    SpringBoot帮我们配好了所有web开发的常见场景
> 
> 4.默认的包结构
> 
> ​    主程序所在包及其下面的所有子包里面的组件都会被默认扫描进来
> 
> ​    无需以前的包扫描配置
> 
> ​    想要改变包扫描路径,@SpringBootApplication(scanBasePackages="com.xxx")
> 
> ​    或者@ComponentScan指定扫描路径
> 
> 5.各种配置拥有默认值
> 
> - 默认配置最终都是映射到某个类上，如：MultipartProperties
> 
> - 配置文件的值最终会绑定每个类上，这个类会在容器中创建对象
> 
> 6.按需加载所有自动配置项
> 
> - 非常多的starter
> 
> - 引入了哪些场景这个场景的自动配置才会开启
> 
> - SpringBoot所有的自动配置功能都在 spring-boot-autoconfigure 包里面

## 2.容器功能

### 2.1组件添加

#### 1.@Configuration

> Full模式与Lite模式
>     配置类组件之间无依赖关系用Lite模式加速容器启动过程，减少判断
>    配置类组件之间有依赖关系，方法会被调用得到之前单实例组件，用Full模式

```java
/**
 * 1、配置类里面使用@Bean标注在方法上给容器注册组件，默认也是单实例的
 * 2、配置类本身也是组件
 * 3、proxyBeanMethods：代理bean的方法
 *      Full(proxyBeanMethods = true)、【保证每个@Bean方法被调用多少次返回的组件都是单实例的】
 *      Lite(proxyBeanMethods = false)【每个@Bean方法被调用多少次返回的组件都是新创建的】
 *      组件依赖必须使用Full模式默认。其他默认是否Lite模式
 *
 *
 *
 */
@Configuration(proxyBeanMethods = false) //告诉SpringBoot这是一个配置类 == 配置文件
public class MyConfig {

    /**
     * Full:外部无论对配置类中的这个组件注册方法调用多少次获取的都是之前注册容器中的单实例对象
     * @return
     */
    @Bean //给容器中添加组件。以方法名作为组件的id。返回类型就是组件类型。返回的值，就是组件在容器中的实例
    public User user01(){
        User zhangsan = new User("zhangsan", 18);
        //user组件依赖了Pet组件
        zhangsan.setPet(tomcatPet());
        return zhangsan;
    }

    @Bean("tom")
    public Pet tomcatPet(){
        return new Pet("tomcat");
    }
}
```

#### 2.@Import

> @Import({User.class, DBHelper.class})
> 
> 给容器中自动创建出这两个类型的组件、默认组件的名字就是全类名

#### 3.@Conditional

> 条件装配：满足Conditional指定的条件，则进行组件注入
> 
> 例:@ConditionalOnMissingBean(name = "tom")

### 2.2原生文件引入

#### @ImportResource

> @ImportResource("classpath:beans.xml")
> 
> public class MyConfig {} 

### 2.3配置绑定

如何使用Java读取到properties文件中的内容，并且把它封装到JavaBean中，以供随时使用；

#### @ConfigurationProperties

```java
/**
 * 只有在容器中的组件，才会拥有SpringBoot提供的强大功能
 */
@Component
@ConfigurationProperties(prefix = "mycar")
public class Car {

    private String brand;
    private Integer price;

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    @Override
    public String toString() {
        return "Car{" +
                "brand='" + brand + '\'' +
                ", price=" + price +
                '}';
    }
}
```

## 3.自动配置原理

总结

- SpringBoot先加载所有的自动配置类  xxxxxAutoConfiguration

- 每个自动配置类按照条件进行生效，默认都会绑定配置文件指定的值。xxxxProperties里面拿。xxxProperties和配置文件进行了绑定

- 生效的配置类就会给容器中装配很多组件

- 只要容器中有这些组件，相当于这些功能就有了

- 定制化配置

- - 用户直接自己@Bean替换底层的组件
  - 用户去看这个组件是获取的配置文件什么值就去修改。

- **xxxxxAutoConfiguration ---> 组件  --->** **xxxxProperties里面拿值  ----> application.properties**

## 4.开发技巧

### 4.1Lombok

简化JavaBean开发

```xml
&lt;dependency>
    &lt;groupId>org.projectlombok&lt;/groupId>
    &lt;artifactId>lombok&lt;/artifactId>
&lt;/dependency>
```

### 4.2dev-tools

```xml
&lt;dependency>
    &lt;groupId>org.springframework.boot&lt;/groupId>
    &lt;artifactId>spring-boot-devtools&lt;/artifactId>
    &lt;optional>true&lt;/optional>
&lt;/dependency>
```

项目或者页面修改以后：Ctrl+F9

### 4.3Spring Initailizr（项目初始化向导）

> 可以做什么?
> 
> 1.选择我们需要的开发场景
> 
> 2.自动依赖引入
> 
> 3.自动依赖引入
> 
> 4.自动编写好主配置类

# 配置文件

## 1.文件类型

### 1.1 properties

> 同以前的properties用法

### 1.2 yaml

#### 1.2.1、简介

> YAML 是 "YAML Ain't Markup Language"（YAML 不是一种标记语言）的递归缩写。在开发的这种语言时，YAML 的意思其实是："Yet Another Markup Language"（仍是一种标记语言）。 
> 
> 非常适合用来做以数据为中心的配置文件

#### 1.2.2、基本语法

- key: value；kv之间有空格

- 大小写敏感

- 使用缩进表示层级关系

- 缩进不允许使用tab，只允许空格

- 缩进的空格数不重要，只要相同层级的元素左对齐即可

- '#'表示注释

- 字符串无需加引号，如果要加，''与""表示字符串内容 会被 转义/不转义

#### 1.2.3、数据类型

- 字面量：单个的、不可再分的值。date、boolean、string、number、null

```yaml
k: v
```

- 对象：键值对的集合。map、hash、set、object 

```yaml
行内写法：  k: {k1:v1,k2:v2,k3:v3}
#或
k: 
  k1: v1
  k2: v2
  k3: v3
```

- 数组：一组按次序排列的值。array、list、queue

```yaml
行内写法：  k: [v1,v2,v3]
#或者
k:
 - v1
 - v2
 - v3
```

#### 1.2.4示例

```java
@Data
public class Person {

  private String userName;
  private Boolean boss;
  private Date birth;
  private Integer age;
  private Pet pet;
  private String[] interests;
  private List&lt;String> animal;
  private Map&lt;String, Object> score;
  private Set&lt;Double> salarys;
  private Map&lt;String, List&lt;Pet>> allPets;
}

@Data
public class Pet {
  private String name;
  private Double weight;
}
```

```yaml
# yaml表示以上对象
person:
  userName: zhangsan
  boss: false
  birth: 2019/12/12 20:12:33
  age: 18
  pet: 
    name: tomcat
    weight: 23.4
  interests: [篮球,游泳]
  animal: 
    - jerry
    - mario
  score:
    english: 
      first: 30
      second: 40
      third: 50
    math: [131,140,148]
    chinese: {first: 128,second: 136}
  salarys: [3999,4999.98,5999.99]
  allPets:
    sick:
      - {name: tom}
      - {name: jerry,weight: 47}
    health: [{name: mario,weight: 47}]
```

## 2.配置提示

> 自定义的类和配置文件绑定一般没有提示。

```xml
&lt;dependency>
    &lt;groupId>org.springframework.boot&lt;/groupId>
    &lt;artifactId>spring-boot-configuration-processor&lt;/artifactId>
    &lt;optional>true&lt;/optional>
&lt;/dependency>


 &lt;build>
     &lt;plugins>
         &lt;plugin>
             &lt;groupId>org.springframework.boot&lt;/groupId>
             &lt;artifactId>spring-boot-maven-plugin&lt;/artifactId>
             &lt;configuration>
                 &lt;excludes>
                     &lt;exclude>
                         &lt;groupId>org.springframework.boot&lt;/groupId>
                         &lt;artifactId>spring-boot-configuration-processor&lt;/artifactId>
                     &lt;/exclude>
                 &lt;/excludes>
             &lt;/configuration>
         &lt;/plugin>
     &lt;/plugins>
&lt;/build>
```

# Web开发

## 1.SpringMVC自动配置概览

Spring Boot provides auto-configuration for Spring MVC that **works well with most applications.(大多场景我们都无需自定义配置)**

The auto-configuration adds the following features on top of Spring’s defaults:

- Inclusion of `ContentNegotiatingViewResolver` and `BeanNameViewResolver` beans.
  
  - 内容协商视图解析器和BeanName视图解析器

- Support for serving static resources, including support for WebJars (covered [later in this document](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-spring-mvc-static-content))).
  
  - 静态资源（包括webjars）

- Automatic registration of `Converter`, `GenericConverter`, and `Formatter` beans.
  
  - 自动注册 `Converter，GenericConverter，Formatter `

- Support for `HttpMessageConverters` (covered [later in this document](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-spring-mvc-message-converters)).
  
  - 支持 `HttpMessageConverters` （后来我们配合内容协商理解原理）

- Automatic registration of `MessageCodesResolver` (covered [later in this document](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-spring-message-codes)).
  
  - 自动注册 `MessageCodesResolver` （国际化用）

- Static `index.html` support.
  
  - 静态index.html 页支持

- Custom `Favicon` support (covered [later in this document](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-spring-mvc-favicon)).
  
  - 自定义 `Favicon`  

- Automatic use of a `ConfigurableWebBindingInitializer` bean (covered [later in this document](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-spring-mvc-web-binding-initializer)).
  
  - 自动使用 `ConfigurableWebBindingInitializer` ，（DataBinder负责将请求数据绑定到JavaBean上）

> If you want to keep those Spring Boot MVC customizations and make more [MVC customizations](https://docs.spring.io/spring/docs/5.2.9.RELEASE/spring-framework-reference/web.html#mvc) (interceptors, formatters, view controllers, and other features), you can add your own `@Configuration` class of type `WebMvcConfigurer` but **without** `@EnableWebMvc`.
> 
> **不用@EnableWebMvc注解。使用** **@Configuration** **+** **WebMvcConfigurer** **自定义规则**

> If you want to provide custom instances of `RequestMappingHandlerMapping`, `RequestMappingHandlerAdapter`, or `ExceptionHandlerExceptionResolver`, and still keep the Spring Boot MVC customizations, you can declare a bean of type `WebMvcRegistrations` and use it to provide custom instances of those components.
> 
> **声明** **WebMvcRegistrations** **改变默认底层组件**

> If you want to take complete control of Spring MVC, you can add your own `@Configuration` annotated with `@EnableWebMvc`, or alternatively add your own `@Configuration`-annotated `DelegatingWebMvcConfiguration` as described in the Javadoc of `@EnableWebMvc`.
> 
> **使用** **@EnableWebMvc+@Configuration+DelegatingWebMvcConfiguration 全面接管SpringMVC**

## 2.简单功能分析

### 2.1静态资源访问

#### 1.静态资源访问

> 只要静态资源放在类路径下： called `/static` (or `/public` or `/resources` or `/META-INF/resources`
> 
> 访问 ： 当前项目根路径/ + 静态资源名 
> 
> 原理： 静态映射/**。
> 
> 请求进来，先去找Controller看能不能处理。不能处理的所有请求又都交给静态资源处理器。静态资源也找不到则响应404页面

改变默认的静态资源路径

```yaml
spring:
  mvc:
    static-path-pattern: /res/**

  resources:
    static-locations: [classpath:/haha/]
```

#### 2.静态资源访问前缀

默认无前缀

```yaml
spring:
  mvc:
    static-path-pattern: /res/**
```

当前项目 + static-path-pattern + 静态资源名 = 静态资源文件夹下找

#### 3、webjar

自动映射 /[webjars](http://localhost:8080/webjars/jquery/3.5.1/jquery.js)/**

https://www.webjars.org/

```yaml
&lt;dependency>
    &lt;groupId>org.webjars&lt;/groupId>
    &lt;artifactId>jquery&lt;/artifactId>
    &lt;version>3.5.1&lt;/version>
&lt;/dependency>
```

访问地址：[http://localhost:8080/webjars/**jquery/3.5.1/jquery.js**](http://localhost:8080/webjars/jquery/3.5.1/jquery.js)   后面地址要按照依赖里面的包路径

### 2.2欢迎页支持

- 静态资源路径下  index.html

- - 可以配置静态资源路径
  - 但是不可以配置静态资源的访问前缀。否则导致 index.html不能被默认访问

```yaml
spring:
#  mvc:
#    static-path-pattern: /res/**   这个会导致welcome page功能失效

  resources:
    static-locations: [classpath:/haha/]
```

- controller能处理/index

### 2.3自定义 `Favicon`

> favicon.ico 放在静态资源目录下即可。

### 2.4静态资源配置原理

- SpringBoot启动默认加载  xxxAutoConfiguration 类（自动配置类）
- SpringMVC功能的自动配置类 WebMvcAutoConfiguration，生效

## 3.请求参数处理

### 请求映射

#### 1.rest使用与原理

- @xxxMapping
  
  - @GetMapping
  - PostMapping
  - PutMapping
  - DeleteMapping

- Rest风格支持（*使用**HTTP**请求方式动词来表示对资源的操作*）
  
  - 以前：
    - */getUser*  获取用户
    - /deleteUser 删除用户
    - /editUser  修改用户
    - /saveUser  保存用户
  - *现在： /user*    
    - GET-获取用户
    - DELETE-删除用户     
    - PUT-修改用户     
    - POST-保存用户
  - 核心Filter；HiddenHttpMethodFilter
  - 
  - SpringBoot中手动开启

- 用法
  
  - 开启页面表单的Rest功能
  - 页面form的属性method=post,隐藏域_method=put、delete等（如果直接get或post,无需隐藏域）
  - 编写请求映射

```yaml
spring:
  mvc:
    hiddenmethod:
      filter:
        enabled: true   #开启页面表单的Rest功能
```

```html
&lt;form action="/user" method="get">
    <input value="REST-GET提交" type="submit" />
&lt;/form>

&lt;form action="/user" method="post">
    <input value="REST-POST提交" type="submit" />
&lt;/form>

&lt;form action="/user" method="post">
    <input name="_method" type="hidden" value="DELETE"/>
    <input value="REST-DELETE 提交" type="submit"/>
&lt;/form>

&lt;form action="/user" method="post">
    <input name="_method" type="hidden" value="PUT" />
    <input value="REST-PUT提交"type="submit" />
&lt;form>
```

```java
@GetMapping("/user")
//@RequestMapping(value = "/user",method = RequestMethod.GET)
public String getUser(){
    return "GET-张三";
}

@PostMapping("/user")
//@RequestMapping(value = "/user",method = RequestMethod.POST)
public String saveUser(){
    return "POST-张三";
}

@PutMapping("/user")
//@RequestMapping(value = "/user",method = RequestMethod.PUT)
public String putUser(){
    return "PUT-张三";
}

@DeleteMapping("/user")
//@RequestMapping(value = "/user",method = RequestMethod.DELETE)
public String deleteUser(){
    return "DELETE-张三";
}
```

#### rest原理（表单提交要使用REST的时候）

- 表单提交会带上**_method=PUT**

- **请求过来被**HiddenHttpMethodFilter拦截
  
  - 请求是否正常，并且是POST
    
    - 获取到**_method**的值。
    - 兼容以下请求；**PUT**.**DELETE**.**PATCH**
    - **原生request（post），包装模式requesWrapper重写了getMethod方法，返回的是传入的值。**
    - **过滤器链放行的时候用wrapper。以后的方法调用getMethod是调用**requesWrapper的。

**Rest使用客户端工具**

- 如PostMan直接发送Put、delete等方式请求，无需Filter。

## 4.视图解析-Thymeleaf初体验

### thymeleaf使用

**引入stater**

```xml
&lt;dependency>
    &lt;groupId>org.springframework.boot&lt;/groupId>
    &lt;artifactId>spring-boot-starter-thymeleaf&lt;/artifactId>
&lt;/dependency>
```

**注意**

> 所有thymeleaf的配置值都在 ThymeleafProperties
> 
> 配置好了 **SpringTemplateEngine**
> 
> 配好了 **ThymeleafViewResolver**
> 
> 我们只需要直接开发页面

### 基本语法

#### 表达式

| 表达式名字 | 语法   | 用途                      |
| ----- | ---- | ----------------------- |
| 变量取值  | ${...} | 获取请求域、session域、对象等值     |
| 选择变量  | *{...} | 获取上下文对象值                |
| 消息    | #{...} | 获取国际化等值                 |
| 链接    | @{...} | 生成链接                    |
| 片段表达式 | ~{...} | jsp:include 作用，引入公共页面片段 |

#### 字面量

- 文本值: **‘one text’** **,** **‘Another one!’** **,...**
- 数字: **0** **,** **34** **,** **3.0** **,** **12.3** **,...**
- 布尔值: **true** **,** **false**
- 空值: **null**
- 变量： one，two，... 变量不能有空格

#### 文本操作

- 字符串拼接: +
- 变量替换: |The name is ${name}|

#### 数学运算

- 运算符: + , - , * , / , %

#### 布尔运算

- 运算符: **and** **,** **or**
- 一元运算: **!** **,** **not**

#### 比较运算

- 比较: **>** **,** **&lt;** **,** **>=** **,** **&lt;=** **(** **gt** **,** **lt** **,** **ge** **,** **le** **)**
- 等式: **==** **,** **!=** **(** **eq** **,** **ne** **)**

#### 条件运算

- If-then: **(if) ? (then)**
- If-then-else: **(if) ? (then) : (else)**
- Default: (value) **?: (defaultvalue)**

#### 特殊操作

- 无操作： _

### 设置属性值-th:attr

- 设置单个值

```html
&lt;form action="subscribe.html" th:attr="action=@{/subscribe}">
  &lt;fieldset>
    <input type="text" name="email" />
    <input type="submit" value="Subscribe!" th:attr="value=#{subscribe.submit}"/>
  &lt;/fieldset>
&lt;/form>
```

- 设置多个值

```html
&lt;img src="../../images/gtvglogo.png" 
     th:attr="src=@{/images/gtvglogo.png},title=#{logo},alt=#{logo}" />
```

### 迭代

```html
<tr th:each="prod : ${prods}">
    <td th:text="${prod.name}">Onions</td>
    <td th:text="${prod.price}">2.41</td>
    <td th:text="${prod.inStock}? #{true} : #{false}">yes</td>
</tr>
```

#### 条件运算

```html
&lt;a href="comments.html"
   th:href="@{/product/comments(prodId=${prod.id})}" 
   th:if="${not #lists.isEmpty(prod.comments)}">view</a>
```

#### 属性优先级

| Order | Feature                         | Attributes                                 |
|:----- |:------------------------------- |:------------------------------------------ |
| 1     | Fragment inclusion              | `th:insert` `th:replace`                   |
| 2     | Fragment iteration              | `th:each`                                  |
| 3     | Conditional evaluation          | `th:if` `th:unless` `th:switch` `th:case`  |
| 4     | Local variable definition       | `th:object` `th:with`                      |
| 5     | General attribute modification  | `th:attr` `th:attrprepend` `th:attrappend` |
| 6     | Specific attribute modification | `th:value` `th:href` `th:src` `...`        |
| 7     | Text (tag body modification)    | `th:text` `th:utext`                       |
| 8     | Fragment specification          | `th:fragment`                              |
| 9     | Fragment removal                | `th:remove`                                |

## 5.拦截器

> 编写的拦截器需要实现`HandlerInterceptor`接口
> 
> 拦截器注册到容器中（实现`WebMvcConfigurer`的`addInterceptors()`）
> 
> 指定拦截规则（注意，如果是拦截所有，静态资源也会被拦截)

拦截器

```java
@Slf4j
public class LoginInterceptor implements HandlerInterceptor {

    /**
     * 目标方法执行之前
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String requestURI = request.getRequestURI();
        log.info("preHandle拦截的请求路径是{}",requestURI);

        //登录检查逻辑
        HttpSession session = request.getSession();

        Object loginUser = session.getAttribute("loginUser");

        if(loginUser != null){
            //放行
            return true;
        }

        //拦截住。未登录。跳转到登录页
        request.setAttribute("msg","请先登录");
//        re.sendRedirect("/");
        request.getRequestDispatcher("/").forward(request,response);
        return false;
    }

    /**
     * 目标方法执行完成以后
     */
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        log.info("postHandle执行{}",modelAndView);
    }

    /**
     * 页面渲染以后
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        log.info("afterCompletion执行异常{}",ex);
    }
}
```

拦截器注册到容器中 && 指定拦截规则：

```java
@Configuration
public class AdminWebConfig implements WebMvcConfigurer{
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoginInterceptor())//拦截器注册到容器中
                .addPathPatterns("/**")  //所有请求都被拦截包括静态资源
                .excludePathPatterns("/","/login","/css/**","/fonts/**","/images/**",
                        "/js/**","/aa/**"); //放行的请求
}
```

## 6.文件上传-单文件与多文件上传的使用

视图层

```html
&lt;form role="form" th:action="@{/upload}" method="post" enctype="multipart/form-data">
    <div class="form-group">
        &lt;label for="exampleInputEmail1">邮箱&lt;/label>
        <input type="email" name="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email">
    </div>

    <div class="form-group">
        &lt;label for="exampleInputPassword1">名字&lt;/label>
        <input type="text" name="username" class="form-control" id="exampleInputPassword1" placeholder="Password">
    </div>

    <div class="form-group">
        &lt;label for="exampleInputFile">头像&lt;/label>
        <input type="file" name="headerImg" id="exampleInputFile">
    </div>

    <div class="form-group">
        &lt;label for="exampleInputFile">生活照&lt;/label>
        <input type="file" name="photos" multiple>
    </div>

    <div class="checkbox">
        &lt;label>
            <input type="checkbox"> Check me out
        &lt;/label>
    </div>
    &lt;button type="submit" class="btn btn-primary">提交&lt;/button>
&lt;/form>
```

控制层

```java
@Slf4j
@Controller
public class FormTestController {

    @GetMapping("/form_layouts")
    public String form_layouts(){
        return "form/form_layouts";
    }

    @PostMapping("/upload")
    public String upload(@RequestParam("email") String email,
                         @RequestParam("username") String username,
                         @RequestPart("headerImg") MultipartFile headerImg,
                         @RequestPart("photos") MultipartFile[] photos) throws IOException {

        log.info("上传的信息：email={}，username={}，headerImg={}，photos={}",
                 email,username,headerImg.getSize(),photos.length);

        if(!headerImg.isEmpty()){
            //保存到文件服务器，OSS服务器
            String originalFilename = headerImg.getOriginalFilename();
            headerImg.transferTo(new File("H:\\cache\\"+originalFilename));
        }

        if(photos.length > 0){
            for (MultipartFile photo : photos) {
                if(!photo.isEmpty()){
                    String originalFilename = photo.getOriginalFilename();
                    photo.transferTo(new File("H:\\cache\\"+originalFilename));
                }
            }
        }


        return "main";
    }
}
```

文件大小相关配置项：

```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=100MB
```

## 7.错误处理

### 默认规则：

- 默认情况下，Spring Boot提供`/error`处理所有错误的映射

- 机器客户端，它将生成JSON响应，其中包含错误，HTTP状态和异常消息的详细信息。对于浏览器客户端，响应一个“ whitelabel”错误视图，以HTML格式呈现相同的数据

- 要对其进行自定义，添加View解析为error

- 要完全替换默认行为，可以实现 ErrorController并注册该类型的Bean定义，或添加ErrorAttributes类型的组件以使用现有机制但替换其内容。

- /templates/error/下的4xx，5xx页面会被自动解析

## 8.数据访问

导入jdbc依赖

```xml
&lt;dependency>
    &lt;groupId>org.springframework.boot&lt;/groupId>
    &lt;artifactId>spring-boot-starter-data-jdbc&lt;/artifactId>
&lt;/dependency>
```

导入数据库依赖(根据需求选择)

```xml
&lt;dependency>
    &lt;groupId>mysql&lt;/groupId>
    &lt;artifactId>mysql-connector-java&lt;/artifactId>
&lt;/dependency>
```

配置项

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mybatis?serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: password
```

测试

```java
@Slf4j
@SpringBootTest
class ApplicationTests {

    @Resource
    private JdbcTemplate jdbcTemplate;

    @Resource
    private DataSource dataSource;

    @Test
    void contextLoads() {
        Long aLong = jdbcTemplate.queryForObject("select count(*) from student", Long.class);
        log.info("总记录数:{}",aLong);
        log.info("数据源类型:{}",dataSource.getClass());
    }

}
```

### 自定义方式整合druid数据源

#### druid简介

> 它是数据库连接池，它能够提供强大的监控和扩展功能。

#### 自定义方式

引入依赖

```xml
&lt;dependency>
    &lt;groupId>com.alibaba&lt;/groupId>
    &lt;artifactId>druid&lt;/artifactId>
    &lt;version>1.1.17&lt;/version>
&lt;/dependency>
```

配置Druid数据源：

```java
    //默认的自动配置是判断容器中没有才会配@ConditionalOnMissingBean(DataSource.class)
    @Bean
    @ConfigurationProperties("spring.datasource")
    public DruidDataSource dataSource() throws SQLException {
        DruidDataSource druidDataSource = new DruidDataSource();
        //加入监控功能
        //druidDataSource.setFilters("stat,wall");
        return druidDataSource;
    }
```

配置Druid的监控页功能：

```java
 /**
     * 配置druid的监控页功能
     * @return
     */
@Bean
public ServletRegistrationBean statViewServlet(){
    StatViewServlet statViewServlet = new StatViewServlet();
    ServletRegistrationBean&lt;StatViewServlet> registrationBean = new ServletRegistrationBean&lt;>(statViewServlet,"/druid/*");
    registrationBean.addInitParameter("loginUsername","admin");
    registrationBean.addInitParameter("loginPassword","password");
    return registrationBean;
}

/**
     * WebStatFilter 用于采集web-jdbc关联监控的数据
     * @return
     */
@Bean
public FilterRegistrationBean webStatFilter(){
    WebStatFilter webStatFilter = new WebStatFilter();
    FilterRegistrationBean&lt;WebStatFilter> filterRegistrationBean = new FilterRegistrationBean&lt;>(webStatFilter);
    filterRegistrationBean.setUrlPatterns(Arrays.asList("/*"));
    filterRegistrationBean.addInitParameter("exclusions","*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*");
    return filterRegistrationBean;
}
```

#### druid数据源starter整合方式

引入依赖

```xml
&lt;dependency>
    &lt;groupId>com.alibaba&lt;/groupId>
    &lt;artifactId>druid-spring-boot-starter&lt;/artifactId>
    &lt;version>1.1.17&lt;/version>
&lt;/dependency>
```

分析自动配置：

- 扩展配置项 spring.datasource.druid
- 自动配置类DruidDataSourceAutoConfigure
- DruidSpringAopConfiguration.class, 监控SpringBean的；配置项：spring.datasource.druid.aop-patterns
- DruidStatViewServletConfiguration.class, 监控页的配置。spring.datasource.druid.stat-view-servlet默认开启。
- DruidWebStatFilterConfiguration.class，web监控配置。spring.datasource.druid.web-stat-filter默认开启。
- DruidFilterConfiguration.class所有Druid的filter的配置：

配置示例

```yaml
spring:
  datasource:
    druid:
      aop-patterns: com.jjf.boot.*  #监控springBean
      filters: stat,wall,slf4j      # 底层开启功能,stat(sql监控),wall(防火墙)
      filter: #对上面filters的详细配置
        stat:
          slow-sql-millis: 1000
          log-slow-sql: true
        wall:
          enabled: true
      stat-view-servlet: #配置监控页功能
        enabled: true
        login-username: admin
        login-password: password
        reset-enable: false
      web-stat-filter: #监控web
        enabled: true
        url-pattern: /*
        exclusions: '*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*'
```

### 整合MyBatis

引入依赖

```xml
<!-- https://mvnrepository.com/artifact/org.mybatis.spring.boot/mybatis-spring-boot-starter -->
&lt;dependency>
    &lt;groupId>org.mybatis.spring.boot&lt;/groupId>
    &lt;artifactId>mybatis-spring-boot-starter&lt;/artifactId>
    &lt;version>2.1.3&lt;/version>
&lt;/dependency>
```

配置模式:

- 全局配置文件

- SqlSessionFactory：自动配置好了

- SqlSession：自动配置了SqlSessionTemplate 组合了SqlSession

- @Import(AutoConfiguredMapperScannerRegistrar.class)

- Mapper： 只要我们写的操作MyBatis的接口标准了@Mapper就会被自动扫描进来

配置文件

```yaml
#配置MyBatis的规则
mybatis:
  config-location: classpath:mybatis/mybatis-config.xml   #全局配置文件位置
  mapper-locations: classpath:mybatis/mapper/*.xml        #sql映射文件位置
```

mybatis-config.xml

```xml
&lt;?xml version="1.0" encoding="UTF-8" ?>
&lt;!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
&lt;configuration>

    <!-- 由于Spring Boot自动配置缘故，此处不必配置，只用来做做样。-->
&lt;/configuration>
```

Mapper接口：

```xml
&lt;?xml version="1.0" encoding="UTF-8" ?>
&lt;!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
&lt;mapper namespace="com.jjf.boot.mapper.StudentMapper">  

    &lt;select id="getStudentById" resultType="com.jjf.boot.bean.Student">
        select * from student where id = #{id}
    &lt;/select>

&lt;/mapper>
```

```java
@Mapper
public interface StudentMapper {
    Student getStudentById(Integer id);

    //注解版
    @Insert("insert into student(name,email,age) values(#{name},#{email},#{age})")
    @Options(useGeneratedKeys = true,keyProperty = "id")
    void saveStudent(Student student);
}
```

bean

```java
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Student {
    private Integer id;
    private String name;
    private String email;
    private Integer age;

}
```

controller

```java
@Controller
public class TestController {
    @Resource
    private JdbcTemplate jdbcTemplate;

    @Resource
    private StudentService studentService;


    @ResponseBody
    @PostMapping("/student")
    public Student saveStudent(Student student){
        studentService.saveStudent(student);
        return student;
    }

    @ResponseBody
    @GetMapping("/sql")
    public String queryFromDb(){
        Long aLong = jdbcTemplate.queryForObject("select count(*) from student", Long.class);
        return aLong.toString();
    }

    @ResponseBody
    @GetMapping("/student/{id}")
    public Student getStudent(@PathVariable("id") Integer id){
        return studentService.getStudentById(id);
    }
}
```

service

```java
@Service
public class StudentService {
    @Resource
    private StudentMapper studentMapper;

    public Student getStudentById(Integer id){
        return studentMapper.getStudentById(id);
    }

    public void saveStudent(Student student) {
        studentMapper.saveStudent(student);
    }
}
```

配置文件

```yaml
#配置MyBatis的规则
mybatis:
#  config-location: classpath:mybatis/mybatis-config.xml   #全局配置文件位置
  mapper-locations: classpath:mybatis/mapper/*.xml        #sql映射文件位置
  #指定MyBatis全局配置文件中的相关配置项
  configuration:
    map-underscore-to-camel-case: true                    #开启驼峰命名规则
```

database

```sql
CREATE TABLE `student` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) DEFAULT NULL,
  `email` varchar(80) DEFAULT NULL,
  `age` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1009 DEFAULT CHARSET=utf8;
```

### 注解版

```java
@Insert("insert into student(name,email,age) values(#{name},#{email},#{age})")
@Options(useGeneratedKeys = true,keyProperty = "id")
void saveStudent(Student student);
```

注意

> 简单DAO方法就写在注解上。复杂的就写在配置文件里。
> 
> 使用`@MapperScan("com.lun.boot.mapper")` 简化，Mapper接口就可以不用标注`@Mapper`注解。

## 9.整合MyBatisPlus操作数据库

### MyBatisPlus简介

> MyBatis-Plus（简称 MP）是一个 MyBatis的增强工具，在 MyBatis 的基础上只做增强不做改变，为简化开发、提高效率而生。

引入依赖

```xml
&lt;dependency>
    &lt;groupId>com.baomidou&lt;/groupId>
    &lt;artifactId>mybatis-plus-boot-starter&lt;/artifactId>
    &lt;version>3.4.1&lt;/version>
&lt;/dependency>
```

- MybatisPlusAutoConfiguration配置类，MybatisPlusProperties配置项绑定。

- SqlSessionFactory自动配置好，底层是容器中默认的数据源。

- mapperLocations自动配置好的，有默认值classpath*:/mapper/**/*.xml，这表示任意包的类路径下的所有mapper文件夹下任意路径下的所有xml都是sql映射文件。 建议以后sql映射文件放在 mapper下。

- 容器中也自动配置好了SqlSessionTemplate。

- @Mapper 标注的接口也会被自动扫描，建议直接 @MapperScan("com.lun.boot.mapper")批量扫描。

- MyBatisPlus优点之一：只需要我们的Mapper继承MyBatisPlus的BaseMapper 就可以拥有CRUD能力，减轻开发工作。

视图

```html
<table class="display table table-bordered table-striped" id="dynamic-table">
    <thead>
        <tr>
            <th>#</th>
            <th>id</th>
            <th>name</th>
            <th>age</th>
            <th>email</th>
            <th>操作</th>
        </tr>
    </thead>
    <tbody>
        <tr class="gradeX" th:each="user,status:${page.records}">
            <td th:text="${status.count}"></td>
            <td th:text="${user.id}"></td>
            <td th:text="${user.name}"></td>
            <td th:text="${user.age}"></td>
            <td th:text="${user.email}"></td>
            <td class="center hidden-phone">
                <a th:href="@{/user/delete/{id}(id=${user.id},pageNum=${page.current})}" class="btn btn-danger" type="button">删除</a>
            </td>
        </tr>
    </tbody>
    &lt;tfoot>
    &lt;/tfoot>
</table>
```

mapper

```java
public interface UserMapper extends BaseMapper&lt;User> {

}
```

controller

```java
@Controller
public class TableController {

    @Resource
    private UserService userService;
    @GetMapping("/")
    public String index(
            @RequestParam(value = "pageNum",defaultValue = "1") Integer pageNum,
            Model model
    ){
        List&lt;User> list = userService.list();
        //分页查询数据
        Page&lt;User> userPage = new Page&lt;>(pageNum,2);
        //分页查询的结果
        Page&lt;User> page = userService.page(userPage, null);
        model.addAttribute("page",page);
        return "dynamic_table";
    }

    @GetMapping("/user/delete/{id}")
    public String deleteUser(
            @PathVariable("id")Long id,
            @RequestParam(value = "pageNum",defaultValue = "1") Integer pageNum,
            RedirectAttributes ra
    ){
        userService.removeById(id);
        ra.addAttribute("pageNum",pageNum);
        return "redirect:/";
    }
}
```

service

```java
public interface UserService extends IService&lt;User> {
}
```

```java
@Service
public class UserServiceImpl extends ServiceImpl&lt;UserMapper, User> implements UserService {

}
```

config

```java
@Configuration
public class MybatisPlusConfig {
    // 最新版
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

bean

```java
@Data
@TableName("user")
public class User {
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```

## 整合Redis

引入依赖

```xml
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
```

配置

```yaml
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
```

config

```java
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
```

controller

```java
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
```

# 单元测试

> 注意:
> 
> SpringBoot 2.4 以上版本移除了默认对Vintage 的依赖。如果需要兼容junit4需要自行引入（不能使用junit4的功能 @Test）
> 
> JUnit 5’s Vintage Engine Removed from spring-boot-starter-test,如果需要继续兼容junit4需要自行引入vintage

```xml
&lt;dependency>
    &lt;groupId>org.junit.vintage&lt;/groupId>
    &lt;artifactId>junit-vintage-engine&lt;/artifactId>
    &lt;scope>test&lt;/scope>
    &lt;exclusions>
        &lt;exclusion>
            &lt;groupId>org.hamcrest&lt;/groupId>
            &lt;artifactId>hamcrest-core&lt;/artifactId>
        &lt;/exclusion>
    &lt;/exclusions>
&lt;/dependency>
```

## 常用测试注解

- @Test：表示方法是测试方法。但是与JUnit4的@Test不同，他的职责非常单一不能声明任何属性，拓展的测试将会由Jupiter提供额外测试
- @ParameterizedTest：表示方法是参数化测试。
- @RepeatedTest：表示方法可重复执行。
- @DisplayName：为测试类或者测试方法设置展示名称。
- @BeforeEach：表示在每个单元测试之前执行。
- @AfterEach：表示在每个单元测试之后执行。
- @BeforeAll：表示在所有单元测试之前执行。
- @AfterAll：表示在所有单元测试之后执行。
- @Tag：表示单元测试类别，类似于JUnit4中的@Categories。
- @Disabled：表示测试类或测试方法不执行，类似于JUnit4中的@Ignore。
- @Timeout：表示测试方法运行如果超过了指定时间将会返回错误。
- @ExtendWith：为测试类或测试方法提供扩展类引用。

## 断言机制

> 断言Assertion是测试方法中的核心部分，用来对测试需要满足的条件进行验证。这些断言方法都是org.junit.jupiter.api.Assertions的静态方法。检查业务逻辑返回的数据是否合理。所有的测试运行结束以后，会有一个详细的测试报告。

### 简单断言

| 方法              | 说明                 |
| --------------- | ------------------ |
| assertEquals    | 判断两个对象或两个原始类型是否相等  |
| assertNotEquals | 判断两个对象或两个原始类型是否不相等 |
| assertSame      | 判断两个对象引用是否指向同一个对象  |
| assertNotSame   | 判断两个对象引用是否指向不同的对象  |
| assertTrue      | 判断给定的布尔值是否为 true   |
| assertFalse     | 判断给定的布尔值是否为 false  |
| assertNull      | 判断给定的对象引用是否为 null  |
| assertNotNull   | 判断给定的对象引用是否不为 null |

### 数组断言

> 通过 assertArrayEquals 方法来判断两个对象或原始类型的数组是否相等

```java
@Test
@DisplayName("array assertion")
public void array() {
 assertArrayEquals(new int[]{1, 2}, new int[] {1, 2});
}
```

### 组合断言

> assertAll 方法接受多个 org.junit.jupiter.api.Executable 函数式接口的实例作为要验证的断言，可以通过 lambda 表达式很容易的提供这些断言

```java
@Test
@DisplayName("assert all")
public void all() {
 assertAll("Math",
    () -> assertEquals(2, 1 + 1),
    () -> assertTrue(1 > 0)
 );
}
```

### 异常断言

> 在JUnit4时期，想要测试方法的异常情况时，需要用**@Rule**注解的ExpectedException变量还是比较麻烦的。而JUnit5提供了一种新的断言方式**Assertions.assertThrows()** ,配合函数式编程就可以进行使用。

```java
@Test
@DisplayName("异常测试")
public void exceptionTest() {
    ArithmeticException exception = Assertions.assertThrows(
           //扔出断言异常
            ArithmeticException.class, () -> System.out.println(1 % 0));

}
```

### 超时断言

> Junit5还提供了**Assertions.assertTimeout()** 为测试方法设置了超时时间

```java
@Test
@DisplayName("超时测试")
public void timeoutTest() {
    //如果测试方法时间超过1s将会异常
    Assertions.assertTimeout(Duration.ofMillis(1000), () -> Thread.sleep(500));
}
```

### 快速失败

> 通过 fail 方法直接使得测试失败

```java
@Test
@DisplayName("fail")
public void shouldFail() {
 fail("This should fail");
}
```

## 前置条件（assumptions）

> JUnit 5 中的前置条件（**assumptions【假设】**）类似于断言，不同之处在于**不满足的断言会使得测试方法失败**，而不满足的**前置条件只会使得测试方法的执行终止**。前置条件可以看成是测试方法执行的前提，当该前提不满足时，就没有继续执行的必要。

```java
@DisplayName("前置条件")
public class AssumptionsTest {
 private final String environment = "DEV";

 @Test
 @DisplayName("simple")
 public void simpleAssume() {
    assumeTrue(Objects.equals(this.environment, "DEV"));
    assumeFalse(() -> Objects.equals(this.environment, "PROD"));
 }

 @Test
 @DisplayName("assume then do")
 public void assumeThenDo() {
    assumingThat(
       Objects.equals(this.environment, "DEV"),
       () -> System.out.println("In DEV")
    );
 }
}
```

> assumeTrue 和 assumFalse 确保给定的条件为 true 或 false，不满足条件会使得测试执行终止。assumingThat 的参数是表示条件的布尔值和对应的 Executable 接口的实现对象。只有条件满足时，Executable 对象才会被执行；当条件不满足时，测试执行并不会终止。

## 嵌套测试

> JUnit 5 可以通过 Java 中的内部类和@Nested 注解实现嵌套测试，从而可以更好的把相关的测试方法组织在一起。在内部类中可以使用@BeforeEach 和@AfterEach 注解，而且嵌套的层次没有限制。

```java
@DisplayName("A stack")
class TestingAStackDemo {

    Stack&lt;Object> stack;

    @Test
    @DisplayName("is instantiated with new Stack()")
    void isInstantiatedWithNew() {
        new Stack&lt;>();
    }

    @Nested
    @DisplayName("when new")
    class WhenNew {

        @BeforeEach
        void createNewStack() {
            stack = new Stack&lt;>();
        }

        @Test
        @DisplayName("is empty")
        void isEmpty() {
            assertTrue(stack.isEmpty());
        }

        @Test
        @DisplayName("throws EmptyStackException when popped")
        void throwsExceptionWhenPopped() {
            assertThrows(EmptyStackException.class, stack::pop);
        }

        @Test
        @DisplayName("throws EmptyStackException when peeked")
        void throwsExceptionWhenPeeked() {
            assertThrows(EmptyStackException.class, stack::peek);
        }

        @Nested
        @DisplayName("after pushing an element")
        class AfterPushing {

            String anElement = "an element";

            @BeforeEach
            void pushAnElement() {
                stack.push(anElement);
            }

            @Test
            @DisplayName("it is no longer empty")
            void isNotEmpty() {
                assertFalse(stack.isEmpty());
            }

            @Test
            @DisplayName("returns the element when popped and is empty")
            void returnElementWhenPopped() {
                assertEquals(anElement, stack.pop());
                assertTrue(stack.isEmpty());
            }

            @Test
            @DisplayName("returns the element when peeked but remains not empty")
            void returnElementWhenPeeked() {
                assertEquals(anElement, stack.peek());
                assertFalse(stack.isEmpty());
            }
        }
    }
}
```

## 参数化测试

> 参数化测试是JUnit5很重要的一个新特性，它使得用不同的参数多次运行测试成为了可能，也为我们的单元测试带来许多便利。
> 
> 利用**@ValueSource**等注解，指定入参，我们将可以使用不同的参数进行多次单元测试，而不需要每新增一个参数就新增一个单元测试，省去了很多冗余代码。

- **@ValueSource**: 为参数化测试指定入参来源，支持八大基础类以及String类型,Class类型

- **@NullSource**: 表示为参数化测试提供一个null的入参

- **@EnumSource**: 表示为参数化测试提供一个枚举入参

- **@CsvFileSource**：表示读取指定CSV文件内容作为参数化测试入参

- **@MethodSource**：表示读取指定方法的返回值作为参数化测试入参(注意方法返回需要是一个流)

> 当然如果参数化测试仅仅只能做到指定普通的入参还达不到让我觉得惊艳的地步。让我真正感到他的强大之处的地方在于他可以支持外部的各类入参。如:CSV,YML,JSON 文件甚至方法的返回值也可以作为入参。只需要去实现**ArgumentsProvider**接口，任何外部文件都可以作为它的入参。

```java
@ParameterizedTest
@ValueSource(strings = {"one", "two", "three"})
@DisplayName("参数化测试1")
public void parameterizedTest1(String string) {
    System.out.println(string);
    Assertions.assertTrue(StringUtils.isNotBlank(string));
}


@ParameterizedTest
@MethodSource("method")    //指定方法名
@DisplayName("方法来源参数")
public void testWithExplicitLocalMethodSource(String name) {
    System.out.println(name);
    Assertions.assertNotNull(name);
}

static Stream&lt;String> method() {
    return Stream.of("apple", "banana");
}
```

## 迁移指南

在进行迁移的时候需要注意如下的变化：

- 注解在 org.junit.jupiter.api 包中，断言在 org.junit.jupiter.api.Assertions 类中，前置条件在 org.junit.jupiter.api.Assumptions 类中。

- 把@Before 和@After 替换成@BeforeEach 和@AfterEach。

- 把@BeforeClass 和@AfterClass 替换成@BeforeAll 和@AfterAll。

- 把@Ignore 替换成@Disabled。

- 把@Category 替换成@Tag。

- 把@RunWith、@Rule 和@ClassRule 替换成@ExtendWith。

# 指标监控

> 未来每一个微服务在云上部署以后，我们都需要对其进行监控、追踪、审计、控制等。SpringBoot就抽取了Actuator场景，使得我们每个微服务快速引用即可获得生产级别的应用监控、审计等功能。

## 使用步骤

1. 添加依赖

```xml
&lt;dependency>
    &lt;groupId>org.springframework.boot&lt;/groupId>
    &lt;artifactId>spring-boot-starter-actuator&lt;/artifactId>
&lt;/dependency>
```

2. 访问`http://localhost:8080/actuator/**`。

3. 暴露所有监控信息为HTTP。

```yaml
management:
  endpoints:
    enabled-by-default: true #暴露所有端点信息
    web:
      exposure:
        include: '*'  #以web方式暴露
```

## 可视化

> https://github.com/codecentric/spring-boot-admin

## 常使用的端点及开启与禁用

| ID                 | 描述                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `auditevents`      | 暴露当前应用程序的审核事件信息。需要一个`AuditEventRepository组件`。                                              |
| `beans`            | 显示应用程序中所有Spring Bean的完整列表。                                                                 |
| `caches`           | 暴露可用的缓存。                                                                                   |
| `conditions`       | 显示自动配置的所有条件信息，包括匹配或不匹配的原因。                                                                 |
| `configprops`      | 显示所有`@ConfigurationProperties`。                                                            |
| `env`              | 暴露Spring的属性`ConfigurableEnvironment`                                                       |
| `flyway`           | 显示已应用的所有Flyway数据库迁移。 需要一个或多个`Flyway`组件。                                                    |
| `health`           | 显示应用程序运行状况信息。                                                                              |
| `httptrace`        | 显示HTTP跟踪信息（默认情况下，最近100个HTTP请求-响应）。需要一个`HttpTraceRepository`组件。                             |
| `info`             | 显示应用程序信息。                                                                                  |
| `integrationgraph` | 显示Spring `integrationgraph` 。需要依赖`spring-integration-core`。                                |
| `loggers`          | 显示和修改应用程序中日志的配置。                                                                           |
| `liquibase`        | 显示已应用的所有Liquibase数据库迁移。需要一个或多个`Liquibase`组件。                                               |
| `metrics`          | 显示当前应用程序的“指标”信息。                                                                           |
| `mappings`         | 显示所有`@RequestMapping`路径列表。                                                                 |
| `scheduledtasks`   | 显示应用程序中的计划任务。                                                                              |
| `sessions`         | 允许从Spring Session支持的会话存储中检索和删除用户会话。需要使用Spring Session的基于Servlet的Web应用程序。                   |
| `shutdown`         | 使应用程序正常关闭。默认禁用。                                                                            |
| `startup`          | 显示由`ApplicationStartup`收集的启动步骤数据。需要使用`SpringApplication`进行配置`BufferingApplicationStartup`。 |
| `threaddump`       | 执行线程转储。                                                                                    |

如果您的应用程序是Web应用程序（Spring MVC，Spring WebFlux或Jersey），则可以使用以下附加端点：

| ID           | 描述                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------- |
| `heapdump`   | 返回`hprof`堆转储文件。                                                                          |
| `jolokia`    | 通过HTTP暴露JMX bean（需要引入Jolokia，不适用于WebFlux）。需要引入依赖`jolokia-core`。                          |
| `logfile`    | 返回日志文件的内容（如果已设置`logging.file.name`或`logging.file.path`属性）。支持使用HTTP`Range`标头来检索部分日志文件的内容。 |
| `prometheus` | 以Prometheus服务器可以抓取的格式公开指标。需要依赖`micrometer-registry-prometheus`。                          |

最常用的Endpoint

- **Health：监控状况**

- **Metrics：运行时指标**

- **Loggers：日志记录**

## 管理Endpoints

### 开启与禁用Endpoints

- 默认所有的Endpoint除过shutdown都是开启的。
- 需要开启或者禁用某个Endpoint。配置模式为  **management.endpoint.****&lt;endpointName>****.enabled = true**

```yml
management:
  endpoint:
    beans:
      enabled: true
```

- 或者禁用所有的Endpoint然后手动开启指定的Endpoint

```yml
management:
  endpoints:
    enabled-by-default: false
  endpoint:
    beans:
      enabled: true
    health:
      enabled: true
```
