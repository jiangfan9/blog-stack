---
title: Spring
date: 2022-07-28
categories: [后端]
tags: [Spring, Spring Boot, MVC, Security]
description: Spring 全家桶学习笔记，涵盖 IoC/AOP、事务、Spring MVC、Spring Security 与 JWT。
coverImg: /images/cover/Spring.png
permalink: /posts/spring
---

# Spring 全家桶学习指南：Spring → Spring MVC → Spring Security

> 一份带代码示例的渐进式学习文档。以 **Spring Boot 3.x / Spring Framework 6.x**（需 Java 17+）为主线，同时兼容讲解 Spring Boot 2.x 的差异。建议按顺序阅读，先理解 Spring 的 IoC/AOP 思想，再学 MVC，最后学安全框架。

## 目录

- [写在前面](#写在前面)
- [第一部分：基础篇](#第一部分基础篇)
- [第二部分：进阶篇](#第二部分进阶篇)
- [第三部分：高阶篇](#第三部分高阶篇)
- [附录：学习路线与资源](#附录学习路线与资源)

---

## 写在前面

### 三大框架的关系

```
Spring Framework（核心：IoC 容器 + AOP）
    │
    ├── Spring MVC      —— Web 层 MVC 框架（基于 Servlet）
    ├── Spring Security —— 认证与授权框架（基于 Filter 链）
    └── Spring Boot     —— 快速开发脚手架（自动配置 +  starters）
```

- **Spring**：提供 IoC 容器和 AOP，管理所有对象（Bean）的创建与依赖
- **Spring MVC**：处理 HTTP 请求、路由、参数绑定、视图/JSON 响应
- **Spring Security**：处理登录认证、权限控制、安全防护
- **Spring Boot**：简化配置，让以上框架开箱即用

### 版本说明

| 技术 | 本文主线 | 要求 | 旧版本差异 |
|------|---------|------|-----------|
| Spring Framework | 6.x | Java 17+ | 5.x 支持 Java 8 |
| Spring Boot | 3.x | Java 17+ | 2.x 支持 Java 8 |
| Spring Security | 6.x | Java 17+ | 5.x 的配置写法不同（见进阶篇标注） |

> 本文示例基于 Spring Boot 3.x。若使用 Boot 2.x，安全配置中 `WebSecurityConfigurerAdapter` 的用法见进阶篇说明。

### 快速开始（Spring Boot 3）

```xml
<!-- pom.xml 核心依赖 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
</dependencies>
```

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

---

# 第一部分：基础篇

## 1. Spring 核心：IoC 与 DI

### 什么是 IoC / DI

**IoC（Inversion of Control，控制反转）**：对象的创建和依赖关系由容器管理，而不是在代码中 `new`。
**DI（Dependency Injection，依赖注入）**：容器在创建对象时，把依赖的对象"注入"进来。

```java
// ===== 传统方式：自己 new，耦合高 =====
public class OrderService {
    private UserRepository repo = new UserRepositoryImpl(); // 硬编码依赖
}

// ===== Spring 方式：依赖由容器注入 =====
@Service
public class OrderService {
    private final UserRepository repo;

    // 构造器注入（推荐）：依赖清晰、不可变、便于测试
    public OrderService(UserRepository repo) {
        this.repo = repo;
    }
}
```

### Bean 的注册与获取

```java
// 方式一：Java 配置类（推荐）
@Configuration
public class AppConfig {
    @Bean
    public UserService userService(UserRepository repo) {
        return new UserService(repo);
    }
}

// 方式二：组件扫描（最常用）
@Component      // 通用组件
@Service        // 业务层
@Repository     // 数据访问层
@Controller     // Web 层（MVC）
@RestController // @Controller + @ResponseBody
public class UserService { ... }

// 从容器中获取 Bean
ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
UserService service = ctx.getBean(UserService.class);
```

### 依赖注入的三种方式

```java
@Service
public class UserService {
    // 1. 构造器注入（推荐）
    private final UserRepository repo;
    public UserService(UserRepository repo) { this.repo = repo; }

    // 2. Setter 注入（可选依赖时使用）
    private EmailService emailService;
    @Autowired(required = false)
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    // 3. 字段注入（简洁但不易测试，不推荐）
    @Autowired
    private LogService logService;
}
```

### 处理多个同类型 Bean

```java
public interface Payment { void pay(); }

@Component("alipay")
class Alipay implements Payment { public void pay() {} }

@Component("wechat")
class WechatPay implements Payment { public void pay() {} }

@Service
class PaymentService {
    // @Qualifier 指定名称，或 @Primary 标记默认 Bean
    @Autowired
    @Qualifier("alipay")
    private Payment payment;
}
```

## 2. Bean 的作用域与生命周期

### 作用域

```java
@Bean
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON) // 默认：单例，整个容器一个实例
public SingletonBean singletonBean() { return new SingletonBean(); }

@Bean
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE) // 原型：每次获取都是新实例
public PrototypeBean prototypeBean() { return new PrototypeBean(); }

// Web 相关作用域
@Scope(WebApplicationContext.SCOPE_REQUEST)  // 每个 HTTP 请求一个实例
@Scope(WebApplicationContext.SCOPE_SESSION)  // 每个会话一个实例
```

### 生命周期回调

```java
@Component
public class LifecycleBean implements InitializingBean, DisposableBean {

    @PostConstruct           // JSR-250，构造之后调用
    public void init() { System.out.println("初始化"); }

    @Override                // Spring 接口方式
    public void afterPropertiesSet() { System.out.println("属性设置完成"); }

    @PreDestroy              // 销毁前调用
    public void cleanup() { System.out.println("清理资源"); }

    @Override
    public void destroy() { System.out.println("销毁"); }
}
```

> 完整生命周期：实例化 → 属性赋值 → `BeanNameAware`/`BeanFactoryAware` → `BeanPostProcessor.before` → `@PostConstruct` → `InitializingBean` → 自定义 init-method → `BeanPostProcessor.after` → 使用 → `@PreDestroy` → `DisposableBean` → 自定义 destroy-method。

## 3. Spring MVC 基础

### MVC 模式与核心组件

```
请求 → DispatcherServlet（前端控制器）
          ↓ HandlerMapping 找处理器
        Controller
          ↓ 返回 ModelAndView / JSON
        ViewResolver（视图解析）
响应 ←   渲染结果
```

### 第一个 Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    // GET /api/users/1
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return new User(id, "Alice");
    }

    // GET /api/users?name=Alice
    @GetMapping
    public List<User> list(@RequestParam(required = false) String name) {
        return List.of(new User(1L, "Alice"), new User(2L, "Bob"));
    }

    // POST /api/users，请求体 JSON → 对象
    @PostMapping
    public User create(@RequestBody User user) {
        return user;
    }

    // PUT /api/users/1
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        // record 不可变，用新实例承载更新后的 id（实际项目常用普通可变类）
        return new User(id, user.name());
    }

    // DELETE /api/users/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return ResponseEntity.noContent().build(); // 204
    }
}

// record：Java 16+ 的不可变数据类，自动生成构造器、访问器、equals/hashCode/toString
record User(Long id, String name) {}
```

### 常用参数注解

| 注解 | 用途 | 示例 |
|------|------|------|
| `@PathVariable` | URL 路径参数 | `/users/{id}` |
| `@RequestParam` | 查询参数 / 表单 | `?page=1` |
| `@RequestBody` | JSON 请求体 | POST JSON |
| `@RequestHeader` | 请求头 | `Authorization` |
| `@CookieValue` | Cookie | `JSESSIONID` |
| `@ModelAttribute` | 表单绑定到对象 | 表单提交 |
| `@SessionAttribute` | Session 属性 | 会话数据 |

### 响应处理

```java
@GetMapping("/json")
public Map<String, Object> json() {
    return Map.of("code", 200, "msg", "success");
}

@GetMapping("/custom")
public ResponseEntity<User> custom() {
    return ResponseEntity.status(HttpStatus.CREATED)
            .header("X-Custom", "value")
            .body(new User(1L, "Alice"));
}

// 静态资源、重定向、转发
@GetMapping("/redirect")
public String redirect() { return "redirect:/home"; }
```

## 4. Spring Security 基础

### 核心概念

- **认证（Authentication）**：验证"你是谁"——用户名密码登录
- **授权（Authorization）**：判断"你能做什么"——角色/权限检查
- **主体（Principal）**：当前用户
- **SecurityContext**：保存当前用户认证信息的上下文

### 默认安全行为

引入 `spring-boot-starter-security` 后，Spring Boot 会自动：

1. 所有请求都需要认证
2. 生成默认用户 `user` 和随机密码（打印在控制台）
3. 提供默认登录页 `/login` 和登出 `/logout`

### 内存用户与密码编码器

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 密码编码器：BCrypt 加盐哈希，永远不要明文存储密码
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails admin = User.withUsername("admin")
                .password(encoder.encode("123456")) // 存储哈希值
                .roles("ADMIN", "USER")
                .build();
        UserDetails user = User.withUsername("user")
                .password(encoder.encode("123456"))
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(admin, user);
    }

    // Spring Security 6 配置写法（Lambda DSL，推荐）
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()   // 放行
                .requestMatchers("/admin/**").hasRole("ADMIN") // 角色校验
                .anyRequest().authenticated()                 // 其余需登录
            )
            .formLogin(form -> form.permitAll())  // 表单登录
            .logout(logout -> logout.permitAll());
        return http.build();
    }
}
```

### 获取当前登录用户

```java
@RestController
public class ProfileController {

    @GetMapping("/me")
    public String me(@AuthenticationPrincipal UserDetails user) {
        return "当前用户: " + user.getUsername();
    }

    // 或在 Service 中
    public String currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
```

> **Spring Security 5.x 差异**：旧版通过继承 `WebSecurityConfigurerAdapter` 并重写 `configure(HttpSecurity)` 配置。6.x 已移除该适配器，改用 `SecurityFilterChain` Bean + Lambda DSL。

---

# 第二部分：进阶篇

## 1. Spring AOP

### 核心概念

| 术语 | 含义 |
|------|------|
| 切面（Aspect） | 横切关注点（如日志、事务）的模块化 |
| 连接点（JoinPoint） | 程序执行中的某个点（方法调用） |
| 切点（Pointcut） | 匹配连接点的表达式 |
| 通知（Advice） | 在切点执行的动作（前/后/环绕/异常） |
| 目标对象（Target） | 被代理的对象 |

### 注解式 AOP 实战

```java
// 1. 开启 AOP
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {}

// 2. 定义注解（自定义切点标记）
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable { String value() default ""; }

// 3. 定义切面
@Aspect
@Component
@Slf4j
public class LogAspect {

    // 切点：匹配带 @Loggable 注解的方法
    @Pointcut("@annotation(loggable)")
    public void logPointcut(Loggable loggable) {}

    // 环绕通知：最强大，可控制方法是否执行、修改返回值
    @Around("@annotation(loggable)")
    public Object around(ProceedingJoinPoint pjp, Loggable loggable) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = null;
        try {
            result = pjp.proceed(); // 执行目标方法
            return result;
        } catch (Throwable e) {
            log.error("方法执行异常: {}", pjp.getSignature(), e);
            throw e;
        } finally {
            log.info("[{}] {} 耗时 {}ms", loggable.value(),
                    pjp.getSignature().getName(), System.currentTimeMillis() - start);
        }
    }

    // 前置通知
    @Before("execution(* com.example.service.*.*(..))")
    public void before(JoinPoint jp) {
        log.info("调用方法: {}", jp.getSignature().getName());
    }
}

// 4. 使用
@Service
public class OrderService {
    @Loggable("创建订单")
    public void createOrder() { /* 业务逻辑 */ }
}
```

### 切点表达式速查

```java
execution(* com.example.service.*.*(..))   // service 包下所有方法
execution(public * *(..))                   // 所有 public 方法
execution(* com.example..*Service.*(..))    // 子包下所有 Service 方法
@annotation(com.example.Loggable)            // 带指定注解的方法
within(com.example.controller.*)            // 包下所有类的所有方法
args(java.lang.String)                      // 参数为 String 的方法
```

## 2. Spring 事务管理

### 声明式事务

```java
@Service
public class OrderService {
    @Autowired private OrderRepository orderRepo;
    @Autowired private AccountRepository accountRepo;

    @Transactional
    public void placeOrder(Long userId, BigDecimal amount) {
        orderRepo.save(new Order(userId, amount));
        accountRepo.debit(userId, amount); // 若这里抛异常，上面的保存也会回滚
    }

    // 指定回滚规则
    @Transactional(rollbackFor = Exception.class) // 默认只回滚 RuntimeException
    public void create() { /* ... */ }

    // 只读事务（优化）
    @Transactional(readOnly = true)
    public List<Order> list() { return orderRepo.findAll(); }

    // 事务传播行为
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logOperation() { /* 独立事务，不受外层回滚影响 */ }
}
```

### 事务传播行为与隔离级别

| 传播行为 | 说明 |
|---------|------|
| `REQUIRED`（默认） | 有事务就加入，没有就创建 |
| `REQUIRES_NEW` | 总是新建事务，挂起外层事务 |
| `SUPPORTS` | 有事务就加入，没有就非事务执行 |
| `NOT_SUPPORTED` | 非事务执行，挂起事务 |
| `NEVER` | 非事务执行，有事务则抛异常 |
| `MANDATORY` | 必须在事务中，否则抛异常 |
| `NESTED` | 嵌套事务（保存点） |

隔离级别：`DEFAULT`、`READ_UNCOMMITTED`、`READ_COMMITTED`、`REPEATABLE_READ`、`SERIALIZABLE`。

### 事务失效的 7 个常见场景

```java
// 1. 方法不是 public —— @Transactional 只对 public 方法生效
// 2. 自调用 —— 同类内部方法调用不走代理
public void A() { this.B(); } // B 的事务不生效！
// 解决：注入自身代理，或用 AopContext.currentProxy()

// 3. 异常被 catch 吃掉 —— 事务认为没异常，不回滚
@Transactional
public void test() {
    try { doSomething(); } catch (Exception e) { /* 吞了异常 */ }
}

// 4. 抛受检异常 —— 默认只回滚运行时异常
// 解决：@Transactional(rollbackFor = Exception.class)

// 5. 未被 Spring 管理 —— 类没加 @Service 等注解

// 6. 数据库引擎不支持事务 —— 如 MySQL 的 MyISAM

// 7. 多线程调用 —— 事务与线程绑定，不同线程不算同一事务
```

## 3. Spring 事件机制

```java
// 1. 定义事件
public class OrderCreatedEvent extends ApplicationEvent {
    private final Long orderId;
    public OrderCreatedEvent(Object source, Long orderId) {
        super(source);
        this.orderId = orderId;
    }
    public Long getOrderId() { return orderId; }
}

// 2. 发布事件
@Service
public class OrderService {
    @Autowired private ApplicationEventPublisher publisher;

    public void createOrder() {
        // ... 创建订单
        publisher.publishEvent(new OrderCreatedEvent(this, 100L));
    }
}

// 3. 监听事件
@Component
public class OrderListener {
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        System.out.println("订单创建: " + event.getOrderId());
    }

    // 事务提交后再处理（发送邮件等）
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void afterCommit(OrderCreatedEvent event) {
        System.out.println("事务已提交，发送通知: " + event.getOrderId());
    }

    // 异步监听
    @Async
    @EventListener
    public void asyncHandle(OrderCreatedEvent event) { /* ... */ }
}
```

## 4. Spring 多环境配置

```yaml
# application.yml
spring:
  profiles:
    active: dev   # 当前激活的环境

# 通用配置
server:
  port: 8080
```

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:devdb
---
# application-prod.yml（用 --- 分隔多文档）
spring:
  datasource:
    url: jdbc:mysql://prod-host:3306/app
```

```java
// @Profile 按环境注册 Bean
@Configuration
public class DataSourceConfig {
    @Bean
    @Profile("dev")
    public DataSource devDataSource() { /* 开发数据源 */ }

    @Bean
    @Profile("prod")
    public DataSource prodDataSource() { /* 生产数据源 */ }
}
```

## 5. Spring MVC 进阶

### 数据校验

```java
public class UserDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "长度 2-20")
    private String name;

    @Min(value = 1, message = "年龄至少 1 岁")
    @Max(value = 150, message = "年龄不能超过 150")
    private Integer age;

    @Email(message = "邮箱格式不正确")
    private String email;
}

@PostMapping("/users")
public User create(@Valid @RequestBody UserDTO dto) { // @Valid 触发校验
    return userService.create(dto);
}

// 自定义校验注解
@Target({FIELD, PARAMETER})
@Retention(RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
public class PhoneValidator implements ConstraintValidator<Phone, String> {
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return value == null || value.matches("1[3-9]\\d{9}");
    }
}
```

### 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<?> handleBusiness(BusinessException e) {
        return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "服务器内部错误"));
    }
}
```

### 拦截器

```java
// 1. 实现 HandlerInterceptor
@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) {
        String token = req.getHeader("Authorization");
        if (token == null) {
            resp.setStatus(401);
            return false; // 拦截请求
        }
        return true; // 继续执行 Controller
    }

    @Override
    public void postHandle(...) { /* Controller 执行后，视图渲染前 */ }

    @Override
    public void afterCompletion(...) { /* 请求完成后，清理资源 */ }
}

// 2. 注册拦截器
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/login", "/api/public/**");
    }
}
```

> **过滤器（Filter） vs 拦截器（Interceptor）**：Filter 是 Servlet 规范，作用于所有请求，在 DispatcherServlet 之前；Interceptor 是 Spring MVC 组件，只拦截 Controller 请求，能拿到 Handler 信息。执行顺序：Filter → Interceptor.pre → Controller → Interceptor.post → 视图 → Interceptor.afterCompletion。

### 文件上传

```java
@PostMapping("/upload")
public String upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty()) return "文件为空";
    String name = file.getOriginalFilename();
    long size = file.getSize();
    file.transferTo(new File("/uploads/" + name)); // 保存到磁盘
    return name + " (" + size + " bytes)";
}
```

```yaml
# 配置上传大小
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 20MB
```

## 6. Spring Security 进阶

### 数据库用户认证

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())          // 数据库中存 BCrypt 哈希
                .roles(user.getRoles().split(","))     // 角色：ADMIN,USER
                .build();
    }
}
```

### 角色与权限控制

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // 开启方法级安全（Spring Security 6）
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**", "/login").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")           // 角色 ADMIN
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN") // 任一角色
                .requestMatchers(HttpMethod.GET, "/api/**").hasAuthority("read") // 权限
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/home", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );
        return http.build();
    }
}
```

```java
// 方法级权限注解
@Service
public class AdminService {
    @PreAuthorize("hasRole('ADMIN')")            // 调用前检查角色
    public void deleteUser(Long id) { /* ... */ }

    @PreAuthorize("hasAuthority('user:delete')")  // 检查细粒度权限
    public void remove(Long id) { /* ... */ }

    @PostAuthorize("returnObject.owner == authentication.name") // 调用后检查返回值
    public Order getOrder(Long id) { return null; }

    @Secured("ROLE_ADMIN")                        // 简单角色检查
    public void adminOnly() { /* ... */ }
}
```

### 会话管理

```java
http.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 默认
    .maximumSessions(1)              // 同一用户最多 1 个会话
    .maxSessionsPreventsLogin(false) // 新登录踢掉旧会话
);
```

### 登录成功/失败处理器

```java
@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {
    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse resp,
                                        Authentication auth) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write("{\"msg\":\"登录成功\", \"user\":\"" + auth.getName() + "\"}");
    }
}

// 在配置中挂接
http.formLogin(form -> form.successHandler(successHandler).failureHandler(failureHandler));
```

---

# 第三部分：高阶篇

## 1. Spring 高阶原理

### Bean 的循环依赖与三级缓存

```java
// 循环依赖场景
@Service
public class ServiceA {
    @Autowired private ServiceB b;
}
@Service
public class ServiceB {
    @Autowired private ServiceA a;
}
```

Spring 通过**三级缓存**解决单例 Bean 的 setter/字段循环依赖：

| 缓存 | 名称 | 存放内容 |
|------|------|---------|
| 一级 | `singletonObjects` | 完全初始化好的 Bean |
| 二级 | `earlySingletonObjects` | 早期暴露的 Bean（已实例化未填充属性） |
| 三级 | `singletonFactories` | Bean 工厂，用于生成早期引用（支持 AOP 代理） |

流程：创建 A → 放入三级缓存工厂 → 填充属性时发现需要 B → 创建 B → B 需要 A → 从三级缓存拿到 A 的早期引用 → B 完成 → A 完成 → 移入一级缓存。

> ⚠️ **构造器注入的循环依赖无法解决**（Bean 还未实例化无法提前暴露）； prototype 作用域也不支持循环依赖。

### Spring AOP 实现原理

- **JDK 动态代理**：目标类实现了接口时，用 `Proxy.newProxyInstance` 生成接口代理
- **CGLIB 代理**：目标类没有接口时，通过字节码生成子类代理
- Spring Boot 2.x 默认 CGLIB；3.x 可在配置中控制 `spring.aop.proxy-target-class`

```java
// 手动演示 JDK 动态代理
public class JdkProxyDemo {
    public static void main(String[] args) {
        UserService target = new UserServiceImpl();
        UserService proxy = (UserService) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            (obj, method, methodArgs) -> {
                System.out.println("前置: " + method.getName());
                Object result = method.invoke(target, methodArgs);
                System.out.println("后置");
                return result;
            }
        );
        proxy.getUser(); // 调用会经过代理逻辑
    }
}
```

### Spring Boot 自动配置原理

1. `@SpringBootApplication` = `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`
2. `@EnableAutoConfiguration` 通过 `@Import(AutoConfigurationImportSelector.class)` 加载配置类
3. 从 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`（Boot 2.x 是 `spring.factories`）读取候选配置类
4. `@ConditionalOnClass`、`@ConditionalOnMissingBean` 等条件注解决定是否生效

```java
// 自定义一个自动配置类（演示条件注解）
@AutoConfiguration
@ConditionalOnClass(name = "com.example.MyClient")
@ConditionalOnMissingBean(MyService.class)
public class MyAutoConfiguration {
    @Bean
    public MyService myService() { return new MyService(); }
}
// 注册：在 resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
// 写入全限定类名：com.example.MyAutoConfiguration
```

### 常用扩展点

```java
// 1. BeanPostProcessor：Bean 初始化前后增强
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String name) {
        if (bean instanceof UserService) System.out.println("增强 " + name);
        return bean; // 可返回代理对象
    }
}

// 2. ApplicationRunner / CommandLineRunner：应用启动后执行
@Component
public class StartupRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        System.out.println("应用启动完成，执行初始化逻辑");
    }
}

// 3. @ConfigurationProperties：类型安全地绑定配置
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private int timeout;
    // getter/setter...
}
```

## 2. Spring MVC 高阶

### DispatcherServlet 执行流程

```
1. 请求到达 DispatcherServlet
2. HandlerMapping 找到 Handler（Controller 方法）及拦截器链
3. HandlerAdapter 调用 Handler
4. HandlerMethodArgumentResolver 解析参数
5. 执行 Controller，得到返回值
6. HandlerMethodReturnValueHandler 处理返回值
7. 若是视图 → ViewResolver 解析 → 渲染；若是 JSON → HttpMessageConverter 转换
8. 拦截器 postHandle / afterCompletion
9. 返回响应
```

### 异步请求

```java
// 方式一：Callable（交给线程池执行）
@GetMapping("/async")
public Callable<String> async() {
    return () -> {
        Thread.sleep(1000); // 模拟耗时操作
        return "异步结果";
    };
}

// 方式二：DeferredResult（更灵活，可在任意线程设置结果）
@GetMapping("/deferred")
public DeferredResult<String> deferred() {
    DeferredResult<String> result = new DeferredResult<>(5000L, "超时");
    new Thread(() -> {
        try { Thread.sleep(1000); result.setResult("异步结果"); }
        catch (InterruptedException e) { result.setErrorResult(e); }
    }).start();
    return result;
}

// 方式三：WebFlux 风格的 Mono（需引入 webflux）
@GetMapping("/reactive")
public Mono<String> reactive() {
    return Mono.delay(Duration.ofSeconds(1)).map(t -> "响应式结果");
}
```

### 自定义参数解析器

```java
// 场景：自动把当前登录用户注入 Controller 参数
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {
    @Override
    public boolean supportsParameter(MethodParameter p) {
        return p.hasParameterAnnotation(CurrentUser.class)
            && p.getParameterType().equals(UserDetails.class);
    }
    @Override
    public Object resolveArgument(...) {
        return SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}

// 注册
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new CurrentUserArgumentResolver());
    }
}
```

### RESTful API 最佳实践

```java
// 1. 使用正确的 HTTP 方法与状态码
@PostMapping("/users")           // 201 Created
public ResponseEntity<User> create(@RequestBody User u) {
    return ResponseEntity.status(HttpStatus.CREATED).body(u);
}
@GetMapping("/users/{id}")       // 200 OK
@PutMapping("/users/{id}")       // 200 OK
@DeleteMapping("/users/{id}")    // 204 No Content

// 2. 统一响应格式
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    // 静态工厂方法...
}

// 3. 分页：使用 Pageable
@GetMapping("/users")
public Page<User> list(Pageable pageable) {
    return userRepo.findAll(pageable); // ?page=0&size=10&sort=name,asc
}
```

## 3. Spring Security 高阶

### Security 过滤器链

Spring Security 的本质是一系列 Filter 组成的链条：

```
请求
  ↓
SecurityContextPersistenceFilter   —— 加载/保存 SecurityContext
  ↓
LogoutFilter                        —— 处理 /logout
  ↓
UsernamePasswordAuthenticationFilter —— 处理 /login 表单提交
  ↓
BearerTokenAuthenticationFilter     —— 处理 JWT Token
  ↓
AnonymousAuthenticationFilter       —— 未登录时设置匿名身份
  ↓
ExceptionTranslationFilter          —— 捕获认证/授权异常
  ↓
AuthorizationFilter                 —— 最终权限校验
  ↓
DispatcherServlet → Controller
```

### JWT 无状态认证（完整实战）

```java
// 1. JWT 工具类（需引入 jjwt 依赖）
@Component
public class JwtUtil {
    private static final String SECRET = "your-secret-key-must-be-long-enough";
    private static final long EXPIRE = 24 * 3600 * 1000; // 24 小时

    public String generate(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRE))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .compact();
    }

    public String parse(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload().getSubject();
    }
}

// 2. JWT 认证过滤器：每次请求解析 Token 并设置认证信息
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Autowired private JwtUtil jwtUtil;
    @Autowired private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse resp,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                String username = jwtUtil.parse(header.substring(7));
                UserDetails user = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception e) {
                resp.setStatus(401);
                return;
            }
        }
        chain.doFilter(req, resp);
    }
}

// 3. 登录接口：校验密码后签发 Token
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    Authentication auth = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
    String token = jwtUtil.generate(req.getUsername());
    return ResponseEntity.ok(Map.of("token", token));
}

// 4. 安全配置：无状态 + JWT 过滤器
@Bean
public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
    http
        .csrf(csrf -> csrf.disable())  // JWT 无状态，关闭 CSRF
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/login", "/public/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### 自定义认证/授权异常处理

```java
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest req, HttpServletResponse resp,
                         AuthenticationException e) throws IOException {
        resp.setStatus(401);
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write("{\"code\":401,\"msg\":\"未登录\"}");
    }
}

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp,
                       AccessDeniedException e) throws IOException {
        resp.setStatus(403);
        resp.getWriter().write("{\"code\":403,\"msg\":\"无权限\"}");
    }
}

// 配置
http.exceptionHandling(ex -> ex
    .authenticationEntryPoint(entryPoint)      // 未认证 → 401
    .accessDeniedHandler(accessDeniedHandler)); // 已认证无权限 → 403
```

### CSRF 与 CORS

```java
// CSRF（跨站请求伪造）：Spring Security 默认开启，表单需带 _csrf token
// 前后端分离 + JWT 无状态场景通常关闭：
http.csrf(csrf -> csrf.disable());

// 但 Cookie 认证场景不能关闭！应使用 CookieCsrfTokenRepository：
http.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));

// CORS（跨域资源共享）
http.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true); // 允许携带 Cookie
    return config;
}));
```

### OAuth2 与第三方登录（概念与配置）

```yaml
# application.yml —— 以 GitHub 为例
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: read:user
```

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .oauth2Login(oauth -> oauth
            .loginPage("/login")
            .defaultSuccessUrl("/home")
        );
    return http.build();
}
```

### 权限模型设计（RBAC）

```java
// RBAC：用户 - 角色 - 权限 三层模型
// 用户表: user (id, username, password)
// 角色表: role (id, name)        如 ROLE_ADMIN, ROLE_USER
// 权限表: permission (id, name)  如 user:read, user:write
// 关联表: user_role, role_permission

// 在 UserDetails 中加载权限
UserDetails user = User.builder()
    .username(u.getUsername())
    .password(u.getPassword())
    .authorities(  // 细粒度权限 + 角色
        Stream.concat(
            permissions.stream().map(p -> new SimpleGrantedAuthority(p)),
            roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r))
        ).toList()
    )
    .build();
```

---

# 附录：学习路线与资源

## 建议学习顺序

```
1. Spring 基础：IoC/DI → Bean 管理 → 注解配置
2. Spring AOP + 事务（理解代理机制）
3. Spring MVC：请求流程 → 参数绑定 → 校验 → 异常处理
4. Spring Security：认证 → 授权 → 过滤器链 → JWT
5. 高阶原理：循环依赖 → 自动配置 → 源码阅读
```

## 推荐练习项目

| 阶段 | 项目 |
|------|------|
| 基础 | 用户 CRUD REST API（Spring Boot + MVC） |
| 进阶 | 带权限管理的博客系统（Security + Thymeleaf/JWT） |
| 高阶 | 前后端分离 SAAS 系统（JWT + RBAC + OAuth2 + Redis） |

## 推荐资源

- **官方文档**：Spring.io、Spring Boot Reference、Spring Security Reference（最权威）
- **书籍**：《Spring 实战》（Craig Walls）、《Spring Boot 实战》、《Spring 源码深度解析》
- **工具**：IntelliJ IDEA、Spring Initializr（start.spring.io）、Postman、Spring Boot Actuator

## 自测题

1. IoC 和 DI 的区别是什么？Spring 有哪些依赖注入方式？
2. Bean 的生命周期有哪些阶段？`@PostConstruct` 和 `InitializingBean` 谁先执行？
3. Spring 如何解决循环依赖？为什么构造器循环依赖无法解决？
4. JDK 动态代理和 CGLIB 代理的区别？
5. `@Transactional` 在哪些场景下会失效？
6. 事务的 7 种传播行为中，`REQUIRED` 和 `REQUIRES_NEW` 的区别？
7. Spring MVC 的执行流程是怎样的？Filter 和 Interceptor 的区别？
8. `@RestController` 和 `@Controller` 的区别？
9. Spring Security 中认证和授权的区别？过滤器链的作用？
10. `@PreAuthorize` 和 `hasRole` / `hasAuthority` 的区别？为什么角色要加 `ROLE_` 前缀？
11. JWT 为什么适合无状态认证？如何防止 Token 被盗用？
12. CSRF 和 CORS 的区别？什么场景下可以关闭 CSRF？
13. Spring Boot 自动配置的原理是什么？`@ConditionalOnMissingBean` 的作用？
14. 什么是 RBAC 权限模型？如何在 Spring Security 中实现？
15. `AuthenticationEntryPoint` 和 `AccessDeniedHandler` 分别处理什么情况？

---
