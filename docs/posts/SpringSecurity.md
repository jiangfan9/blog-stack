---
title: SpringSecurity 框架概要
date: 2023-11-14
categories: [Spring]
tags: ["Spring Security", 认证授权]
description: Spring Security 认证与授权机制学习笔记。
coverImg: /images/cover-6.svg
permalink: /posts/spring-security
---

# SpringSecurity框架概要

## 1.1概要

> 官网：https://spring.io/projects/spring-security

Spring是非常流行和成功的Java应用开发框架，SpringSecurity正是Spring家族中的成员。SpringSecurity基于Spring框架，提供了一套Web应用安全性的完整解决方案。

关于安全方法的两个主要区域是**认证**和**授权**（或访问控制），一般来说，Web应用的安全性包括**用户认证（Authentication）**和**用户授权（Authorization）**两个部分，这两点也是SpringSecurity重要核心功能

1. 用户认证指的是：验证某个用户是否为系统中的合法主体，也就是说用户能否访问该系统。用户认证一般要求用户提供用户名和密码。系统通过校验用户名和密码来完成认证过程。**通俗点说就是系统认为用户是否能登录**。
2. 用户授权指的是验证某个用户是否有权限执行某个操作。在一个系统中，不同用户所具有的权限是不同的。比如对一个文件来说，有的用户只能进行读取，而有的用户可以进行修改。一般来说，系统会为不同的用户分配不同的角色，而每个角色则应对应一些列的权限。**通俗点说就是系统判断用户是否有权限去做某些事情**。

## 1.2特点

- 和Spring无缝整合
- 全面的权限控制
- 专门为Web开发而设计
  - 旧版本不能脱离Web环境使用。
  - 新版本对整个框架进行了分层抽取，分成了核心模块和Web模块。单独引入核心模块就可以脱离Web环境。
- 重量级

## 1.3与Shiro比较

### Shiro特点

- 轻量级。Shiro主张的理念是把复杂的事情变简单。针对对性能有更高要求的互联网应用有更好的表现。
- 通用性。
  - 好处：不局限于Web环境，可以脱离Web环境使用。
  - 缺陷：在Web环境下一些特定的需求需要手动编写代码定制

一般来说，常见的安全管理技术栈的组合是这样的：

- SSM + Shiro
- SpringBoot/SpringCloud + SpringSecurity

以上只是一个推荐组合，从技术上说，无论怎么组合，都可以运行

## 1.4模块划分

##  

- Core — `spring-security-core.jar`
  - 此模块包含核心身份验证和访问控制类和接口、远程处理支持以及基本配置API。任何使用Spring Security的应用程序都需要它。它支持独立应用程序、远程客户端、方法（服务层）安全性和JDBC用户配置。
- Remoting — `spring-security-remoting.jar`
  - 该模块提供了与Spring Remoting的集成。除非您正在编写一个使用Spring Remoting的远程客户端，否则您不需要这样做。主程序包是org.springframework.security.remoting。
- Web — `spring-security-web.jar`
  - 此模块包含筛选器和相关的web安全基础结构代码。它包含任何具有servlet API依赖关系的内容。如果您需要SpringSecurityWeb身份验证服务和基于URL的访问控制，则需要它。主程序包是org.springframework.security.web。

- Config — `spring-security-config.jar`
  - 该模块包含安全命名空间解析代码和Java配置代码。如果您使用SpringSecurityXML命名空间进行配置或使用SpringSecurity的Java配置支持，则需要它。主包是org.springframework.security.config。这些类都不打算在应用程序中直接使用。
- LDAP — `spring-security-ldap.jar`
  - 此模块提供LDAP身份验证和配置代码。如果您需要使用LDAP身份验证或管理LDAP用户条目，则需要它。顶级包是org.springframework.security.ldap。
- OAuth 2.0 Core — `spring-security-oauth2-core.jar`
  - spring-security-oauth2-core.jar包含核心类和接口，它们为OAuth 2.0授权框架和OpenID Connect core 1.0提供支持。它是使用OAuth 2.0或OpenID Connect Core 1.0的应用程序所必需的，例如客户端、资源服务器和授权服务器。顶级包是org.springframework.security.oauth2.core。
- OAuth 2.0客户端 — `spring-security-oauth2-client.jar`
  - spring-security-oauth2-client.jar包含spring security对OAuth 2.0授权框架和OpenID Connect Core 1.0的客户端支持。它是使用OAuth 2.0或OpenID Connect Core 1.0的应用程序所必需的，例如客户端、资源服务器和授权服务器。顶级包是org.springframework.security.oauth2.core。
- OAuth 2.0 JOSE — `spring-security-oauth2-jose.jar`
  - spring-security-oauth2-jose.jar包含spring security对jose（Javascript对象签名和加密）框架的支持。JOSE框架旨在提供一种在各方之间安全转移索赔的方法。它是根据一系列规范构建的：
    - JSON Web Token (JWT)
    - JSON Web Signature (JWS)
    - JSON Web Encryption (JWE)
    - JSON Web Key (JWK)
- OAuth 2.0 Resource Server — `spring-security-oauth2-resource-server.jar`
  - spring-security-oauth2-resource-server.jar包含spring security对OAuth 2.0资源服务器的支持。它用于通过使用OAuth 2.0承载令牌来保护API。顶级包是org.springframework.security.oauth2.server.resource。
- ACL — `spring-security-acl.jar`
  - 此模块包含一个专门的域对象ACL实现。它用于将安全性应用于应用程序中的特定域对象实例。顶级包是org.springframework.security.acls。
- CAS — `spring-security-cas.jar`
  - 此模块包含Spring Security的CAS客户端集成。如果您想在CAS单点登录服务器上使用SpringSecurity web身份验证，则应该使用它。顶级包是org.springframework.security.cas。
- Test — `spring-security-test.jar`
  - 此模块包含对Spring Security测试的支持。
- Taglibs — `spring-security-taglibs.jar`
  - 提供Spring Security的JSP标记实现。

# SpringSecurity基本原理

## 1.SpringSecurity本质

> SpringSecurity本质是一个过滤链，有很多过滤器。

### 常用过滤器：

1.org.springframework.security.web.context.SecurityContextPersistenceFilter
  首当其冲的一个过滤器，非常重要
主要是使用SecurityContextRepository在session中保存或更新一个SecurityContext，并将SecurityContext给以后的过滤器使用，来为后续filter建立所需的上下文，SecurityContext中存储了当前用户的认证和权限信息。

2.org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter
  此过滤器用于继承SecurityContext到Spring异步执行机制中的WebAsyncManager,和spring整合必须的。

3.org.springframework.security.web.header.HeaderWriterFilter
  向请求的header中添加响应的信息，可以在http标签内部使用security:headers来控制

4.org.springframework.security.web.csrf.CsrfFilter
  Csrf又称跨域请求伪造，SpringSecurity会对所有post请求验证是否包含系统生成的csrf的token信息，如果不包含则报错，起到防止csrf攻击的效果

5.org.springframework.security.web.authentication.logout.LogoutFilter
  匹配URL为/logout的请求，实现用户退出，清楚认证信息

6.org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
  认证操作全靠这个过滤器，默认匹配URL为/login且必须为POST请求

7.org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter
  如果没有在配置文件中指定认证页面，则由该过滤器生成一个默认的认证界面

8.org.springframework.security.web.authentication.ui.DefaultLogoutPageGeneratingFilter
  由此过滤器生成一个默认的退出登录页面

9.org.springframework.security.web.authentication.www.BasicAuthenticationFilter
  此过滤器会自动解析HTTP请求中头部名字为Authentication，且以Basic开头的头部信息

10.org.springframework.security.web.savedrequest.RequestCacheAwareFilter
  通过HttpSessionRequestCache内部维护一个RequestCache，用于缓存HttpServletRequest

11.org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter
  针对ServletRequest进行一次包装，使得request具有更加丰富的API

12.org.springframework.security.web.authentication.AnonymousAuthenticationFilter
  当SecurityContextHolder中认证信息为空，则会创建一个匿名用户存储到SecurityContextHolder中，SpringSecurity为了兼容未登录的访问，也走了一套认证流程，只不过是一个匿名的身份

13.org.springframework.security.web.session.SessionManagementFilter
  SecurityContextRepository限制同一个用户开启多个会话的数量

14.org.springframework.security.web.access.ExceptionTranslationFilter
  异常转换过滤器位于整个SpringSecurityFilterChain的后方，用来转换整个链路中出现的异常

15.org.springframework.security.web.access.intercept.FilterSecurityInterceptor
  获取所有配置资源的访问授权信息，根据SecurityContextHolder中存储的用户信息来决定其是否有权限。

## 2.过滤器如何加载

使用SpringSecurity配置过滤器 DelegatingFilterProxy

~~~java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) {
    //...
    delegateToUse = this.initDelegate(wac);
    //...
}
protected Filter initDelegate(WebApplicationContext wac) throws ServletException {
    //targetBeanName: springSecurityFilterChain
    String targetBeanName = this.getTargetBeanName();
    Assert.state(targetBeanName != null, "No target bean name set");
    Filter delegate = (Filter)wac.getBean(targetBeanName, Filter.class);
    if (this.isTargetFilterLifecycle()) {
        delegate.init(this.getFilterConfig());
    }

    return delegate;
}
~~~

FilterChainProxy

~~~java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
    this.doFilterInternal(request, response, chain);
}
private void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain) {
    //...
    //获取所有过滤器
    List&lt;Filter> filters = this.getFilters((HttpServletRequest)fwRequest);
    //....
}
private List&lt;Filter> getFilters(HttpServletRequest request) {
    Iterator var2 = this.filterChains.iterator();

    SecurityFilterChain chain;
    do {
        if (!var2.hasNext()) {
            return null;
        }

        chain = (SecurityFilterChain)var2.next();
    } while(!chain.matches(request));

    return chain.getFilters();
}
~~~

## 3.两个重要接口

### 1.UserDetailsService

当什么也没有配置时，账号和密码是由SpringSecurity定义生成的。而在实际项目中账号和密码都是从数据库查询出来的。使用需要自定义逻辑控制认证逻辑。

如果需要自定义逻辑时，只需要实现UserDetailsService接口即可。接口定义如下：

~~~java
public interface UserDetailsService {
    UserDetails loadUserByUsername(String var1) throws UsernameNotFoundException;
}
~~~

### 2.PasswordEncoder

数据加密接口，用于返回User对象里密码的加密

~~~java
public interface PasswordEncoder {
    String encode(CharSequence var1);

    boolean matches(CharSequence var1, String var2);

    default boolean upgradeEncoding(String encodedPassword) {
        return false;
    }
}
~~~

## 4.Web权限方案

### 1.设置登录系统的账号、密码

**方式一：**在application.yml

~~~yaml
spring:
  security:
    user:
      name: admin
      password: 123123
~~~

**方式二：**在配置文件中

~~~java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String password = passwordEncoder.encode("123");
        auth.inMemoryAuthentication().withUser("lucy").password(password).roles("admin");
    }
    @Bean
    public PasswordEncoder bCryptPasswordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
~~~

**方式三：**自定义实现类

1.创建配置类，设置使用哪个userDetailsService实现类

~~~java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Resource
    private UserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
~~~

2.编写实体类

~~~java
@Data
public class SysUser {

    private Integer id;

    private String username;

    private String password;
}
~~~

3.使用MybatisPlus，编写Mapper接口

~~~java
public interface SysUserMapper extends BaseMapper&lt;SysUser> {
}
~~~

4.编写实现类，返回User对象，User对象有用户名密码和操作权限

~~~java
@Service("userDetailsService")
public class UserDetailsServiceImpl implements UserDetailsService {

    @Resource
    private SysUserMapper sysUserMapper;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser user = sysUserMapper.selectOne(new QueryWrapper&lt;SysUser>().eq("username", username));
        if (user == null){
            throw new UsernameNotFoundException("用户名不存在！");
        }
        List&lt;GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList("role");
        return new User(user.getUsername(), new BCryptPasswordEncoder().encode(user.getPassword()), auths);
    }
}
~~~

### 2.自定义登录页面

~~~java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin()                                 //自定义自己编写的登录页面
        .loginPage("/login.html")                //登录页面设置
        .loginProcessingUrl("/user/login")       //登录访问路径
        .defaultSuccessUrl("/test/index")        //登录成功之后，跳转路径
        .permitAll()
        .and().authorizeRequests().antMatchers("/","/test/hello","/user/login").permitAll() //设置哪些路径可以直接访问，不需要认证
        .anyRequest().authenticated()
        .and().csrf().disable();

}
~~~

### 3.自定义登录成功处理器

自定义登录成功处理器类

~~~java
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private String url;

    public LoginSuccessHandler(String url){
        this.url = url;
    }
    @Override
    public void onAuthenticationSuccess(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) throws IOException, ServletException {
        httpServletResponse.sendRedirect(url);
    }
}
~~~

配置类

~~~java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin()                               
        //登录成功后的处理器，不能和successForwardUrl共存，否则会报错
        .successHandler(new LoginSuccessHandler("https://www.baidu.com"))

}
~~~

### 4.自定义登录失败处理器

自定义登录失败处理器类

~~~java
public class LoginFailureHandler implements AuthenticationFailureHandler {
    private String url;

    public LoginFailureHandler(String url){
        this.url = url;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AuthenticationException e) throws IOException, ServletException {
        httpServletResponse.sendRedirect(url);
    }
}
~~~

配置类

~~~java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin()                                
        //登录失败后的处理器
        .failureHandler(new LoginFailureHandler("https://www.baidu.com"))
}
~~~

### 5.HttpSecurity常用方法详解

~~~java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
    //授权认证
    .authorizeRequests()
    //匹配哪些请求
    .antMatchers("/","/test/hello","/user/login")
    //允许访问
    .permitAll()
    //所有请求都必须被认证，必须登录之后被访问
    .anyRequest().authenticated()
}
~~~

#### antMatchers()

~~~java
public C antMatchers(String... antPatterns) 
~~~

参数是不定向参数，每个参数是一个ant表达式，用于匹配URL规则

规则如下：

- ？：匹配一个字符
- *：匹配0个或多个字符
- **：匹配0个或多个目录

在实际项目中，经常需要放行所有静态资源，例：

~~~java
.antMatchers("/js/**").permitAll()
~~~

还有一种配置方式是只要是JS文件都放行

~~~java
.antMatchers("/**/*.js").permitAll()
~~~

#### regexMatchers()

~~~java
public C regexMatchers(String... regexPatterns)
~~~

例：放行所有后缀为png的图片

~~~java
.regexMatchers("+[.]png").permitAll()
~~~

#### mvcMatchers()

application.yml

~~~yaml
spring:
  mvc:
    servlet:
      path: /xxx
~~~

例：

~~~java
.mvcMatchers("/demo").servletPath("/xxx").permitAll()
~~~

#### 内置访问控制方法

~~~java
//任何请求都可以访问
static final String permitAll = "permitAll";
//任何请求都不可以访问
private static final String denyAll = "denyAll";
//匿名访问
private static final String anonymous = "anonymous";
//需要认证才可以访问
private static final String authenticated = "authenticated";
//完全认证
private static final String fullyAuthenticated = "fullyAuthenticated";
//记住我
private static final String rememberMe = "rememberMe";
~~~

#### 权限判断

~~~java
.antMatchers("/main").hasAuthority("admin")
.antMatchers("/main").hasAnyAuthority("admin","data")
~~~

#### 角色判断

~~~java
.antMatchers("/main").hasRole("admin")
.antMatchers("/main").hasAnyRole("admin","abc")
~~~

#### IP地址判断

~~~java
.antMatchers("/main").hasIpAddress("127.0.0.1")
~~~

