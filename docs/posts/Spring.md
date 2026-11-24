---
title: Spring
date: 2021-05-23
categories: [Spring]
tags: [Spring, IoC, AOP]
description: Spring 框架核心概念：IoC 容器、AOP 与 Bean 管理。
coverImg: /images/cover-3.svg
permalink: /posts/spring
---



# Spring框架概述

> Spring是一个开源框架，它由Rod Johnson创建。它是为了解决企业应用开发的复杂性而创建的。Spring使用基本的JavaBean来完成以前只可能由EJB完成的事情。然而，Spring的用途不仅限于服务器端的开发。从简单性、可测试性和松耦合的角度而言，任何Java应用都可以从Spring中受益。
>
> Spring是一个轻量级的控制反转(IoC)和面向切面(AOP)的容器框架。

![](https://fanaidi.gitee.io/blogimgs/Spring/spring结构图.png)

# IOC容器

## IOC底层原理

### 什么是IOC

> 1.控制反转，把对象创建和对象之间的调用过程，交给Spring进行管理
>
> 2.使用IOC的目的：为了降低耦合度

### 底层原理

> 1.用到的技术:xml解析、工厂模式、反射
>
> 



## IOC接口(BeanFactory)

> 1.IOC思想基于IOC容器完成,IOC容器底层就是对象工厂
>
> 2.Spring提供IOC容器实现两种方式:(两个接口)
>
>   (1)BeanFactory: IOC容器基本实现方式,是Spring内部使用的接口,不提供开发人员进行使用.
>
> ​    **特点:** 加载配置文件时候不会创建对象,在获取对象(使用对象)才去创建对象.
>
>   (2)ApplicationContext: 是BeanFactory接口的子接口.提供更多更强大的功能,一般是由开发人员进行使用
>
> ​    **特点:** 加载配置文件时候就会把在配置中的对象进行创建

### ApplicationContext的实现类

1.FileSystemXmlApplicationContext:参数是带盘符的路径

2.ClassPathXmlApplicationContext:参数是类路径

## IOC操作管理bean

### 1.什么是bean管理

> Bean管理指的是两个操作
>
> 1.Spring创建对象
>
> 2.Spring注入属性

### 2.Bean管理操作有两种方式

> 1.基于xml配置文件方式实现
>
> 2.基于注解方式实现

### 3.基于xml方式创建对象

> 1.在spring配置文件中,使用bean标签,标签里面添加对应的属性,就可以实现对象创建
>
> 2.在bean标签有很多属性,常用属性:
>
>   id:唯一标识
>
>   class:全限定类名
>
> 3.创建对象的时候,默认也是执行无参数构造方法完成对象的创建

#### 3.1 基于xml方式注入属性

> DI:依赖注入,就是注入属性
>
>   第一种注入方式:
>
>   第二种注入方式:

#### 3.2使用set方法进行注入

```java
public class User {
    private String userName;

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
```

在spring配置文件配置对象创建,配置属性注入

```xml
&lt;bean id="user" class="com.jjf.entity.User">
    &lt;!--使用property属性完成属性注入
            name:类里面的属性名称
            value:向属性注入的值
    -->
    &lt;property name="userName" value="张三">&lt;/property>
&lt;/bean>
```



#### 3.3使用有参构造进行注入 

```java
public class User {
    private String userName;

    public User(String userName) {
        this.userName = userName;
    }
}
```

```xml
<!--有参构造注入-->
&lt;bean id="user" class="com.jjf.entity.User">
    &lt;constructor-arg name="userName" value="李四">&lt;/constructor-arg>
&lt;/bean>
```

#### 3.4xml注入其他类型

##### 3.4.1字面量

**1.null值**

```xml
&lt;property name="userName">
    &lt;null/>
&lt;/property>
```

**2.特殊符号**

> 1.把特殊符号进行转义
>
> 2.把带特殊符号内容写到CDATA 

```xml
&lt;property name="userName">
    &lt;value>&lt;![CDATA[&lt;&lt;张三>>]]>&lt;/value>
&lt;/property>
```

##### 3.4.2注入外部bean

dao层

```java
public interface UserDao {
    void update();
}
```

```java
public class UserDaoImpl implements UserDao{
    @Override
    public void update() {
        System.out.println("UserDaoImpl update...");
    }
}
```

service层

```java
public class UserService {
    private UserDao userDao;

    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
    public void add(){
        System.out.println("UserService add...");
        userDao.update();
    }
}
```

Spring配置

```xml
&lt;bean id="userDaoImpl" class="com.jjf.dao.UserDaoImpl">&lt;/bean>
&lt;bean id="userService" class="com.jjf.service.UserService">
    &lt;property name="userDao" ref="userDaoImpl">&lt;/property>
&lt;/bean>
```

##### 3.4.3注入内部bean和级联赋值

> 一对多关系:部门和员工
>
> ​	一个部门有多个员工,一个员工属于一个部门.
>
> ​	部门是一,员工是多.

```java
//部门类
public class Dept {
    private String deptName;

    public void setDeptName(String deptName) {
        this.deptName = deptName;
    }

    public String getDeptName() {
        return deptName;
    }
}
```

```java
//员工类
public class Emp {
    private String EmpName;
    private String gender;
    //员工属于某个部门,使用对象形式表示
    private Dept dept;
    public void setEmpName(String empName) {
        EmpName = empName;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setDept(Dept dept) {
        this.dept = dept;
    }

    public void test(){
        System.out.println("name="+EmpName+",gender="+gender+",dept="+dept.getDeptName());
    }
}
```

```xml
<!--内部bean-->
&lt;bean id="emp" class="com.jjf.bean.Emp">
    <!--先设置两个普通的属性-->
    &lt;property name="empName" value="zhangsan">&lt;/property>
    &lt;property name="gender" value="男">&lt;/property>
    &lt;property name="dept">
        &lt;bean id="dept" class="com.jjf.bean.Dept">
            &lt;property name="deptName" value="保安">&lt;/property>
         &lt;/bean>
    &lt;/property>
&lt;/bean>
```

```xml
<!--级联赋值-->
&lt;bean id="emp" class="com.jjf.bean.Emp">
    <!--先设置两个普通的属性-->
    &lt;property name="empName" value="zhangsan">&lt;/property>
    &lt;property name="gender" value="男">&lt;/property>
    <!--级联赋值-->
    &lt;property name="dept" ref="dept">&lt;/property>
    <!--第二种写法   dept属性必须要有getter方法-->
    &lt;property name="dept.deptName" value="技术部">&lt;/property>
&lt;/bean>
&lt;bean id="dept" class="com.jjf.bean.Dept">
    &lt;property name="deptName" value="财务部">&lt;/property>
&lt;/bean>
```

##### 3.4.4xml注入集合属性

1.注入数组类型属性

2.注入List集合类型属性

3.注入Map集合类型属性

4.注入Set集合类型属性

```java
public class Student {
    private String[] courses;

    private List&lt;String> list;

    private Map&lt;String,String> maps;

    private Set&lt;String> sets;

    public void setCourses(String[] courses) {
        this.courses = courses;
    }

    public void setList(List&lt;String> list) {
        this.list = list;
    }

    public void setMaps(Map&lt;String, String> maps) {
        this.maps = maps;
    }

    public void setSets(Set&lt;String> sets) {
        this.sets = sets;
    }

    public void test(){
        System.out.println(Arrays.toString(courses));
        System.out.println(list);
        System.out.println(maps);
        System.out.println(sets);
    }
}
```

```xml
<!--集合类型属性的注入-->
&lt;bean id="student" class="com.jjf.collectiontype.Student">
    <!--数组类型属性注入-->
    &lt;property name="courses">
        &lt;array>
            &lt;value>c&lt;/value>
            &lt;value>c++&lt;/value>
            &lt;value>java&lt;/value>
        &lt;/array>
    &lt;/property>
    <!--集合类型属性注入-->
    &lt;property name="list">
        &lt;list>
            &lt;value>张三&lt;/value>
            &lt;value>小三&lt;/value>
        &lt;/list>
    &lt;/property>
    <!--map类型属性注入-->
    &lt;property name="maps">
        &lt;map>
            &lt;entry key="JAVA" value="java">&lt;/entry>
            &lt;entry key="PHP" value="php">&lt;/entry>
        &lt;/map>
    &lt;/property>
    <!--set类型属性注入-->
    &lt;property name="sets">
        &lt;set>
            &lt;value>MySQL&lt;/value>
            &lt;value>Redis&lt;/value>
        &lt;/set>
    &lt;/property>
    <!--注入List集合类型,值是对象-->
    &lt;property name="courseList">
        &lt;list>
            &lt;ref bean="course1">&lt;/ref>
            &lt;ref bean="course2">&lt;/ref>
            &lt;ref bean="course3">&lt;/ref>
        &lt;/list>
    &lt;/property>
&lt;/bean>
&lt;bean id="course1" class="com.jjf.collectiontype.Course">
    &lt;property name="courseName" value="Spring">&lt;/property>
&lt;/bean>
&lt;bean id="course2" class="com.jjf.collectiontype.Course">
    &lt;property name="courseName" value="MyBatis">&lt;/property>
&lt;/bean>
&lt;bean id="course3" class="com.jjf.collectiontype.Course">
    &lt;property name="courseName" value="SpringMVC">&lt;/property>
&lt;/bean>
```

提取List集合类型注入

```xml
&lt;?xml version="1.0" encoding="UTF-8"?>
&lt;beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util.xsd">
    <!--提取List集合类型注入-->
    &lt;util:list id="bookList">
        &lt;value>C语言&lt;/value>
        &lt;value>C++&lt;/value>
        &lt;value>JAVA&lt;/value>
    &lt;/util:list>
    &lt;bean id="book" class="com.jjf.collectiontype.Book">
        &lt;property name="books" ref="bookList">&lt;/property>
    &lt;/bean>
&lt;/beans>
```

### 4.FactoryBean

> 1.Spring有两种类型的bean,一种是普通bean,另外一种是工厂bean(FactoryBean)
>
> 2.普通bean: 在配置文件中定义bean类型就是返回类型
>
> 3.工厂bean: 在配置文件中定义bean类型可以和返回类型不一样

```java
public class MyBean implements FactoryBean&lt;Course> {
    @Override
    public Course getObject() throws Exception {
        Course course = new Course();
        course.setCourseName("java");
        return course;
    }

    @Override
    public Class&lt;?> getObjectType() {
        return null;
    }

    @Override
    public boolean isSingleton() {
        return false;
    }
}
```

```xml
&lt;bean id="myBean" class="com.jjf.factory.MyBean">&lt;/bean>
```

```java
public void test2(){
    ApplicationContext context = new ClassPathXmlApplicationContext("bean2.xml");
    Course course = context.getBean("myBean", Course.class);
    System.out.println(course);
}
```

### 5.bean作用域

> 1.在Spring里面,设置创建bean实例是单实例还是多实例
>
> 2.在Spring里面,默认情况下,bean是单实例对象
>
> 3.如何设置单实例还是多实例
>
>   在spring配置文件bean标签里面有属性(scope)用于设置单实例还是多实例
>
>   scope属性值:
>
> ​    singleton: 表示是单实例对象,默认值
>
> ​    prototype:表示多实例对象
>
> ​	request:会把对象放到request中
>
> ​	session:会把对象放到session域中
>
> ​    singleton和prototype的区别
>
> ​	  1.singleton表示单实例,prototype表示多实例
>
> ​	  2.设置scope的值是singleton的时候,加载spring配置文件的时候就会创建单实例对象
>
> ​	  3.设置scope的值是prototype的时候,不是在加载spring配置文件的时候创建对象,在调用getBean方法的时候创建多实例对象

### 6.bean生命周期

> 生命周期:从对象创建到对象销毁的过程
>
> bean的后置处理器,bean生命周期有七步:
>
>   1.通过构造器创建bean实例(无参数构造)
>
>   2.为bean的属性设置值或对其他bean的引用(调用set方法)
>
>   **3.把bean实例传递给bean后置处理器的方法,会执行postProcessBeforeInitialization方法**
>
>   4.调用bean的初始化的方法(需要进行配置初始化的方法)
>
>   **5.把bean实例传递给bean后置处理器的方法,会执行postProcessAfterInitialization**
>
>   6.bean可以使用了(对象获取到了)
>
>   7.当容器关闭的时候,调用bean的销毁的方法(需要进行配置销毁的方法)

### 7.XML自动装配

> 自动装配:根据指定装配规则(属性名称或者属性类型),Spring自动将匹配的属性值进行注入

```xml
&lt;!--实现自动装配
    bean标签属性autowire,配置自动装配
    属性值:
        byName:根据属性名称注入,注入值bean的id值和类属性名称一样
        byType:根据属性类型注入(注意:不能定义多个同类型)
-->
&lt;bean id="emp" class="com.jjf.entity.Emp" autowire="byName">&lt;/bean>
&lt;bean id="dept" class="com.jjf.entity.Dept">&lt;/bean>
```

#### 7.1引入外部属性文件

> 1.直接配置数据库信息
>
>   (1)配置德鲁伊连接池
>
> 2.引入外部属性文件配置数据库连接池

```xml
&lt;?xml version="1.0" encoding="UTF-8"?>
&lt;beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    &lt;context:property-placeholder location="classpath:jdbc.properties"/>
    <!--直接配置连接池-->
    &lt;bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        &lt;property name="driverClassName" value="${jdbc.driver}">&lt;/property>
        &lt;property name="url" value="${jdbc.url}">&lt;/property>
        &lt;property name="username" value="${jdbc.userName}">&lt;/property>
        &lt;property name="password" value="${jdbc.password}">&lt;/property>
    &lt;/bean>

&lt;/beans>
```

### 8.基于注解方式

#### 8.1 注解

> 1.注解: 是代码特殊标记,格式:@注解名称(属性名称=属性值,属性名称=属性值,...)
>
> 2.注解可以作用在类上面,方法上面,属性上面
>
> 3.使用注解的目的:简化xml配置.

#### 8.2 Spring针对Bean管理中创建对象提供注解

> 1.Component
>
> 2.Service
>
> 3.Controller
>
> 4.Repository
>
> 上面四个注解功能是一样的,都可以用来创建bean实例

#### 8.3 基于注解方式实现对象创建

> 1.引入依赖 spring-aop
>
> 2.开启组件扫描

```xml
&lt;?xml version="1.0" encoding="UTF-8"?>
&lt;beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <!--开启组件扫描-->
    &lt;context:component-scan base-package="com.jjf"/>
&lt;/beans>
```

```xml
<!--context:include-filter:设置扫描哪些内容-->
&lt;context:component-scan base-package="com.jjf" use-default-filters="false">
    &lt;context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
&lt;/context:component-scan>
```

```xml
<!--context:exclude-filter:设置那些不扫描-->
&lt;context:component-scan base-package="com.jjf">
    &lt;context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
&lt;/context:component-scan>
```

#### 8.4基于注解方式实现属性注入

> 1.@Autowired: 根据属性类型进行自动注入
>
> ​	第一步:在service和dao类上添加创建对象注解
>
> ​	第二步:在service里面注入dao对象,在service类里面添加dao类型的属性,在属性上使用注解(不需要添加set方法)
>
> 2.Qualifier: 根据属性的名称进行注入
>
> ​	1.要和@Autowired一起使用
>
> ​	2.Qualifier里面的参数是类的名字
>
> 3.@Resource: 可以根据类型注入,也可以根据名称注入
>
> ​	@Resource: 根据类型进行注入
>
> ​	@Resource(name="userDaoImpl"): 根据名称进行注入
>
> 4.@Value:注入普通类型属性
>
> ```java
> @Value(value = "张三")
> private String name;
> ```

#### 8.5完全注解开发

1.创建配置类,替代xml配置文件 

```java
@Configuration //作为配置类,替代xml文件
@ComponentScan(basePackages = {"com.jjf"})  //开启扫描
public class SpringConfig {
}
```

2.编写测试类

```java
@Test
public void test1(){
    ApplicationContext context = new AnnotationConfigApplicationContext(SpringConfig.class);
    UserService userService = context.getBean("userService", UserService.class);
    userService.add();
}
```

# AOP

## 概念

> AOP为Aspect Oriented Programming的缩写，意为：面向切面编程，通过预编译方式和运行期间动态代理实现程序功能的统一维护的一种技术。
>
> 利用AOP可以对业务逻辑的各个部分进行隔离，从而使得业务逻辑各部分之间的耦合度降低，提高程序的可重用性，同时提高了开发的效率。
>
> 通俗描述: 不通过修改源代码方式,在主干功能里面添加新功能

## 底层原理

> 1.AOP底层使用动态代理
>
>   有两种情况动态代理
>
> ​    (1)有接口情况,使用JDK动态代理
>
> ​		创建接口实现类的代理对象,增强类的方法
>
> ​    (2)没有接口情况,使用CGLIB动态代理
>
> ​		创建子类的代理对象,增强类的方法

## 操作术语

> 1.连接点: 类里面哪些方法可以被增强,这些方法称为连接点
>
> 2.切入点: 实际被真正增强的方法,称为切入点
>
> 3.通知(增强): 
>
> ​	(1):实际增强的逻辑部分称为通知(增强)
>
> ​	(2):通知有多种类型:
>
> ​		前置通知: 方法执行前之前
>
> ​		后置通知: 方法执行前之后
>
> ​		环绕通知: 方法执行前之前后
>
> ​		异常通知: 方法发生异常的时候执行
>
> ​		最终通知: 不管发生什么,最终都要执行
>
> 4.切面: 是动作,把通知应用到切入点的过程

## AOP操作

### 1.准备

> 1.Spring框架一般都是基于AspectJ实现AOP操作	
>
> ​	AspectJ: AspectJ不是Spring组成部分,独立AOP框架,一般把AspectJ和Spring框架一起使用,进行AOP操作
>
> 2.基于AspectJ实现AOP操作
>
> ​	(1)基于xml配置文件
>
> ​	(2)基于注解方式实现(常用)
>
> 3.在项目里面引入AOP的依赖
>
> ```
> <!-- https://mvnrepository.com/artifact/org.springframework/spring-aspects -->
> &lt;dependency>
>     &lt;groupId>org.springframework&lt;/groupId>
>     &lt;artifactId>spring-aspects&lt;/artifactId>
>     &lt;version>5.2.6.RELEASE&lt;/version>
> &lt;/dependency>
> 
> 
> <!-- https://mvnrepository.com/artifact/cglib/cglib -->
> &lt;dependency>
>     &lt;groupId>cglib&lt;/groupId>
>     &lt;artifactId>cglib&lt;/artifactId>
>     &lt;version>2.2.2&lt;/version>
> &lt;/dependency>
> 
> <!-- https://mvnrepository.com/artifact/aopalliance/aopalliance -->
> &lt;dependency>
>     &lt;groupId>aopalliance&lt;/groupId>
>     &lt;artifactId>aopalliance&lt;/artifactId>
>     &lt;version>1.0&lt;/version>
> &lt;/dependency>
> 
> <!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
> &lt;dependency>
>     &lt;groupId>org.aspectj&lt;/groupId>
>     &lt;artifactId>aspectjweaver&lt;/artifactId>
>     &lt;version>1.6.8&lt;/version>
>     &lt;scope>runtime&lt;/scope>
> &lt;/dependency>
> ```
>
> 4.切入点表达式
>
> ​	(1)切入点表达式作用:知道对哪个类里面的那个方法进行增强
>
> ​	(2)语法结构:
>
> ​		execution([权限修饰符] [返回类型] [全类名] [方法名称] ([参数列表]))
>
> ​		例1:对com.jjf.dao.BookDao类里面的add进行增强
>
> ​			execution(*com.jjf.dao.BookDao.add(..))
>
> ​		例2:对com.jjf.dao.BookDao类里面所有的方法进行增强
>
> ​			execution(*com.jjf.dao.BookDao.\*(..))
>
> ​		例2:对com.jjf.dao包里面所有的类,类里面的所有方法进行增强
>
> ​			execution(*com.jjf.dao.\*.\*(..))

### 基于注解实现对AspectJ的操作

> 1.创建类,在类里面定义方法
>
> 2.创建增强类
>
> ​	(1)在增强类里面,创建方法,让不同的方法代表不同的通知类型
>
> 3.进行通知的配置
>
> ​	(1)在spring配置文件中,开始注解扫描
>
> ​	(2)使用注解创建User和UserProxy对象
>
> ​	(3)在增强类上面添加注解@Aspect
>
> ​	(4)在spring配置文件中开始生成代理对象	
>
> 4.配置不同类型的通知
>
> ​	(1)在增强类的里面,在作为通知的方法上面添加通知类型的注解,使用切入点表达式配置
>
> 5.相同的切入点抽取
>
> 6.有多个增强类对同一个方法进行增强,可以设置增强类的优先级
>
> ​	(1)在增强类上面添加注解@Order(数字类型值),数字类型的值越小,优先级越高
>
> 7.完全使用注解开发

普通类

```java
@Component
public class User {
    public void add(){
        //int i = 1/0;
        System.out.println("add...");
    }
}
```

增强类

```java
@Component
@Aspect     //生成代理对象
@Order(3)
public class UserProxy {

    @Pointcut("execution(* com.jjf.aopanotation.User.add(..))")
    public void pointDemo(){}


    //前置通知
    @Before(value = "pointDemo()")
    public void before(){
        System.out.println("before...");
    }

    //后置通知
    @AfterReturning(value = "pointDemo()")
    public void afterReturning(){
        System.out.println("afterReturning...");
    }

    //最终通知
    @After(value = "pointDemo()")
    public void after(){
        System.out.println("after...");
    }

    //异常通知
    @AfterThrowing(value = "pointDemo()")
    public void afterThrowing(){
        System.out.println("afterThrowing...");
    }

    //环绕通知
    @Around(value = "pointDemo()")
    public void around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        System.out.println("环绕之前...");
        //被增强的方法
        proceedingJoinPoint.proceed();
        System.out.println("环绕之后...");
    }
}
```

Spring配置文件

```xml
&lt;?xml version="1.0" encoding="UTF-8"?>
&lt;beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                            http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd
                            http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd">

    &lt;context:component-scan base-package="com.jjf.aopanotation">&lt;/context:component-scan>

    <!--开启Aspect生成代理对象-->
    &lt;aop:aspectj-autoproxy>&lt;/aop:aspectj-autoproxy>
&lt;/beans>
```

注解方式

```java
@Configuration
@ComponentScan(basePackages = {"com.jjf"})
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class ConfigAOP {

}
```

增强类

```java
@Component
@Aspect
@Order(1)
public class PersonProxy {
    //前置通知
    @Before(value = "execution(* com.jjf.aopanotation.User.add(..))")
    public void before(){
        System.out.println("Person before...");
    }
}
```

### 基于配置文件

```java
public class Book {
    public void buy(){
        System.out.println("buy...");
    }
}
```

```java
public class BookProxy {
    public void before(){
        System.out.println("before...");
    }
}
```

```xml
&lt;?xml version="1.0" encoding="UTF-8"?>
&lt;beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                        http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd">

    &lt;bean id="book" class="com.jjf.aopxml.Book">&lt;/bean>
    &lt;bean id="bookProxy" class="com.jjf.aopxml.BookProxy">&lt;/bean>

    <!--配置AOP增强-->
    &lt;aop:config>
        <!--切入点-->
        &lt;aop:pointcut id="p" expression="execution(* com.jjf.aopxml.Book.buy(..))"/>
        <!--配置切面-->
        &lt;aop:aspect ref="bookProxy">
            <!--配置增强作用在具体的方法上-->
            &lt;aop:before method="before" pointcut-ref="p">&lt;/aop:before>
        &lt;/aop:aspect>
    &lt;/aop:config>

&lt;/beans>
```

# JdbcTemplate

## 概念

> Spring对jdbc封装的模板

## 准备工作

> 1.引入依赖
>
> 2.在spring配置文件中配置数据库连接池
>
> 3.配置JdbcTemplate对象,注入DataSource
>
> 4.创建service类,创建dao类,在dao注入jdbcTemplate对象

引入依赖

```xml
&lt;dependencies>
    &lt;dependency>
        &lt;groupId>junit&lt;/groupId>
        &lt;artifactId>junit&lt;/artifactId>
        &lt;version>4.12&lt;/version>
        &lt;scope>test&lt;/scope>
    &lt;/dependency>
    <!-- https://mvnrepository.com/artifact/org.springframework/spring-context -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-context&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>
    <!-- https://mvnrepository.com/artifact/org.springframework/spring-core -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-core&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>
    <!-- https://mvnrepository.com/artifact/org.springframework/spring-beans -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-beans&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>
    <!-- https://mvnrepository.com/artifact/org.springframework/spring-aop -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-aop&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>

    <!-- https://mvnrepository.com/artifact/org.springframework/spring-aspects -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-aspects&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>

    <!-- https://mvnrepository.com/artifact/org.springframework/spring-jdbc -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-jdbc&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>

    <!-- https://mvnrepository.com/artifact/org.springframework/spring-tx -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-tx&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>

    <!-- https://mvnrepository.com/artifact/org.springframework/spring-orm -->
    &lt;dependency>
        &lt;groupId>org.springframework&lt;/groupId>
        &lt;artifactId>spring-orm&lt;/artifactId>
        &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;/dependency>

    <!-- https://mvnrepository.com/artifact/cglib/cglib -->
    &lt;dependency>
        &lt;groupId>cglib&lt;/groupId>
        &lt;artifactId>cglib&lt;/artifactId>
        &lt;version>2.2.2&lt;/version>
    &lt;/dependency>

    <!-- https://mvnrepository.com/artifact/aopalliance/aopalliance -->
    &lt;dependency>
        &lt;groupId>aopalliance&lt;/groupId>
        &lt;artifactId>aopalliance&lt;/artifactId>
        &lt;version>1.0&lt;/version>
    &lt;/dependency>

    <!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
    &lt;dependency>
        &lt;groupId>org.aspectj&lt;/groupId>
        &lt;artifactId>aspectjweaver&lt;/artifactId>
        &lt;version>1.6.8&lt;/version>
    &lt;/dependency>

    <!--德鲁伊数据源-->
    <!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
    &lt;dependency>
        &lt;groupId>com.alibaba&lt;/groupId>
        &lt;artifactId>druid&lt;/artifactId>
        &lt;version>1.1.10&lt;/version>
    &lt;/dependency>

    &lt;dependency>
        &lt;groupId>mysql&lt;/groupId>
        &lt;artifactId>mysql-connector-java&lt;/artifactId>
        &lt;version>8.0.21&lt;/version>
    &lt;/dependency>
&lt;/dependencies>
```

在spring配置文件中配置数据库连接池

```xml
<!--数据库连接池-->
&lt;bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
    &lt;property name="driver" value="com.mysql.cj.jdbc.Driver">&lt;/property>
    &lt;property name="url" value="jdbc:mysql://localhost:3306/mybatis?serverTimeZone=UTC">&lt;/property>
    &lt;property name="username" value="root">&lt;/property>
    &lt;property name="password" value="password">&lt;/property>
&lt;/bean>
```

配置JdbcTemplate对象,注入DataSource

```xml
<!--JdbcTemplate对象-->
&lt;bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
    <!--注入dataSource-->
    &lt;property name="dataSource" ref="dataSource">&lt;/property>
&lt;/bean>
```

创建service类,创建dao类,在dao注入jdbcTemplate对象

```java
public interface UserDao {

}
```

```java
@Repository
public class UserDaoImpl implements UserDao {

    //注入JdbcTemplate
    @Autowired
    private JdbcTemplate jdbcTemplate;

}
```

```java
@Service
public class UserService {
    @Autowired
    private UserDao userDao;

}
```

## JdbcTemplate操作数据库

> 1.创建实体类
>
> 2.编写service和dao
>
> ​	1.在dao进行数据库添加操作
>
> ​	2.调用JdbcTemplate对象里面update方法实现添加操作

```java
public class User {
    private String userId;
    private String userName;
    private String userState;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserState() {
        return userState;
    }

    public void setUserState(String userState) {
        this.userState = userState;
    }
}
```

```java
@Repository
public class UserDaoImpl implements UserDao {

    //注入JdbcTemplate
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void add(User user) {
        //1.创建sql语句
        String sql = "insert into t_user values(?,?,?)";
        Object[] args = {user.getUserId(), user.getUserName(), user.getUserState()};
        /**
         * update参数
         * 1.sql语句
         * 2.可变参数,设置sql语句值
         */
        int update = jdbcTemplate.update(sql,args);
        System.out.println(update);
    }

    @Override
    public void update(User user) {
        String sql = "update t_user set user_name = ?,user_state = ? where user_id = ?";
        Object[] args = {user.getUserName(), user.getUserState(),user.getUserId()};
        int update = jdbcTemplate.update(sql, args);
        System.out.println(update);
    }

    @Override
    public void delete(String userId) {
        String sql = "delete from t_user where user_id = ?";
        int update = jdbcTemplate.update(sql, userId);
        System.out.println(update);
    }
}

```

```java
@Service
public class UserService {
    @Autowired
    private UserDao userDao;

    public void addUser(User user){
        userDao.add(user);
    }

    public void updateUser(User user){
        userDao.update(user);
    }

    public void deleteUser(String userId){
        userDao.delete(userId);
    }
}
```

# 事务

## 概念

> 1.事务是数据库操作最基本的单元,逻辑上的一组操作,要么都成功,如果有一个失败所有操作都失败
>
>   典型场景:银行转账
>
> 2.事务的四个特性(ACID)
>
> ​	1.原子性: 
>
> ​	2.一致性
>
> ​	3.隔离性
>
> ​	4.持久性

## 搭建事务操作环境

> 1.创建数据库,添加记录
>
> ```sql
> /*
>  Navicat Premium Data Transfer
> 
>  Source Server         : mysql
>  Source Server Type    : MySQL
>  Source Server Version : 80021
>  Source Host           : localhost:3306
>  Source Schema         : mybatis
> 
>  Target Server Type    : MySQL
>  Target Server Version : 80021
>  File Encoding         : 65001
> 
>  Date: 24/09/2021 16:43:22
> */
> 
> SET NAMES utf8mb4;
> SET FOREIGN_KEY_CHECKS = 0;
> 
> -- ----------------------------
> 
> -- Table structure for t_account
> 
> -- ----------------------------
> 
> DROP TABLE IF EXISTS `t_account`;
> CREATE TABLE `t_account`  (
>   `id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
>   `user_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
>   `money` int NULL DEFAULT NULL
> ) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;
> 
> -- ----------------------------
> 
> -- Records of t_account
> 
> -- ----------------------------
> 
> INSERT INTO `t_account` VALUES ('1', 'lucy', 1000);
> INSERT INTO `t_account` VALUES ('2', 'mary', 1000);
> 
> SET FOREIGN_KEY_CHECKS = 1;
> ```
>
> 2.创建service,搭建dao,完成对象创建和注入关系
>
> ​	1.service注入dao,在dao注入JdbcTemplate,在JdbcTemplate注入DataSource
>
> ```java
> public interface UserDao {
> }
> ```
>
> ```java
> @Service
> public class UserService {
> 
>     @Autowired
>     private UserDao userDao;
> }
> ```
>
> ```java
> @Repository
> public class UserDaoImpl implements UserDao{
> 
>     @Autowired
>     private JdbcTemplate jdbcTemplate;
> }
> ```
>
> ```xml
> &lt;?xml version="1.0" encoding="UTF-8"?>
> &lt;beans xmlns="http://www.springframework.org/schema/beans"
>        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
>        xmlns:context="http://www.springframework.org/schema/context"
>        xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
>                             http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
> 
>     &lt;context:component-scan base-package="com.jjf">&lt;/context:component-scan>
> 
>     <!--数据库连接池-->
>     &lt;bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
>         &lt;property name="driverClassName" value="com.mysql.cj.jdbc.Driver">&lt;/property>
>         &lt;property name="url" value="jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC">&lt;/property>
>         &lt;property name="username" value="root">&lt;/property>
>         &lt;property name="password" value="password">&lt;/property>
>     &lt;/bean>
> 
>     <!--JdbcTemplate对象-->
>     &lt;bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
>         <!--注入dataSource-->
>         &lt;property name="dataSource" ref="dataSource">&lt;/property>
>     &lt;/bean>
> &lt;/beans>
> ```
>
> 3.在dao创建两个方法,多钱和少钱的方法,在service创建方法(转账的方法)
>
> dao
>
> ```java
> //lucy转账100给mary
> @Override
> public void increaseMoney() {
>     String sql = "update t_account set money = money - ? where user_name = ?";
>     jdbcTemplate.update(sql,100,"lucy");
> }
> 
> @Override
> public void decreaseMoney() {
>     String sql = "update t_account set money = money + ? where user_name = ?";
>     jdbcTemplate.update(sql,100,"mary");
> }
> ```
>
> service
>
> ```java
> //转账的方法
> public void accountMoney(){
>     //lucy少100
>     userDao.decreaseMoney();
>     //mary多100
>     userDao.increaseMoney();
> }
> ```
>
> 4.上面代码,如果正常执行没有问题,但是如果代码执行过程中出现异常,就有问题
>
> ```java
> @Service
> public class UserService {
> 
>     @Autowired
>     private UserDao userDao;
> 
>     //转账的方法
>     public void accountMoney(){
>         //lucy少100
>         userDao.decreaseMoney();
> 
>         //模拟异常
>         int i = 1/0;
> 
>         //mary多100
>         userDao.increaseMoney();
>     }
> }
> ```
>
> 会发现lucy的钱少了100,但是mary的钱没有增加100
>
> 上面的问题如何解决?使用事务

## Spring事务管理介绍

> 1.事务添加到JavaEE三层架构里面的Service层上(业务逻辑层)
>
> 2.在Spring进行事务管理操作
>
> ​	1.有两种方式: 编程式事务管理和**声明式事务管理(常用)**
>
> 3.声明式事务管理
>
> ​	**1.基于注解方式(常用)**
>
> ​	2.基于xml配置文件方式
>
> 4.在Spring进行声明式事务管理,底层使用AOP
>
> 5.Spring事务管理API
>
> ​	1.提供一个接口,代表事务管理器,这个接口针对不同的框架提供不同的实现类

## 注解声明式事务管理

1.在spring配置文件中配置事务管理器

```java
<!--创建事务管理器-->
&lt;bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <!--注入数据源-->
    &lt;property name="dataSource" ref="dataSource">&lt;/property>
&lt;/bean>
```

2.在spring配置文件,开启事务注解

​	2.1.在spring配置文件引入名称空间tx

​	2.2开启事务注解

```xml
<!--开启事务注解-->
&lt;tx:annotation-driven transaction-manager="transactionManager">&lt;/tx:annotation-driven>
```

3.在service类上面(获取service类里面方法上面)添加事务注解@Transactional

​	3.1@Transactional,这个注解添加到类上面,也可以添加到方法上面

​	3.2如果把这个注解添加到类上面,这个类里面所有的方法都添加事务

​	3.3如果把这个注解添加到方法上面,为这个方法添加了事务

```java
@Service
@Transactional
public class UserService 
```

## 声明式事务管理参数配置

> 1.在service类上面添加了注解@Transactional,在这个注解里面可以配置事务相关参数
>
> 2.propagation: 事务传播行为
>
> ​	2.1 多事务方法之间进行调用,这个过程中事务是如何进行管理的
>
> ![](https://fanaidi.gitee.io/blogimgs/Spring/事务传播行为.png)
>
> 3.isolation: 事务的隔离级别
>
> ​	事务里面有个特性称为隔离性,多事务操作之间不会产生影响.不考虑隔离性产生很多问题.
>
> ​	有三个读问题:脏读,不可重复读,虚(幻)读
>
> ​		脏读:一个未提交事务读取到另一个未提交事务的数据
>
> ​		不可重复读: 一个未提交事务读取到另一个已提交事务修改数据
>
> ​		虚读: 一个未提交事务读取到另一个已提交事务添加数据
>
> ![事务隔离级别](https://fanaidi.gitee.io/blogimgs/Spring/事务隔离级别.png)
>
> 4.timeout: 超时时间
>
> ​	1.事务需要在一定时间内进行提交,如果不提交进行回滚
>
> ​	2.默认值是-1,设置时间以秒单位进行计算
>
> 5.readOnly: 是否只读
>
> ​	1.读:查询操作,写:增删改操作
>
> ​	2.readOnly默认值是false,表示可以查询,也可以增删改操作
>
> ​	3.设置readOnly设置为true,只能查询
>
> 6.rollbackFor: 回滚
>
> ​	1.设置查询出现了哪些异常,进行事务的回滚.
>
> 7.noRollbackFor: 不回滚
>
> ​	1.设置出现哪些异常,不进行事务回滚.

## XML声明式事务管理

> 1.配置事务管理器
>
> 2.配置通知
>
> 3.配置切入点和切面

```xml
<!--1创建事务管理器-->
&lt;bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <!--注入数据源-->
    &lt;property name="dataSource" ref="dataSource">&lt;/property>
&lt;/bean>

<!--2配置通知-->
&lt;tx:advice id="txAdvice">
    <!--配置事务参数-->
    &lt;tx:attributes>
        <!--指定哪种规则的方法上面添加事务-->
        &lt;tx:method name="accountMoney" propagation="REQUIRED"/>
        &lt;!--&lt;tx:method name="account*"/>-->
    &lt;/tx:attributes>
&lt;/tx:advice>
<!--3配置切入点和切面-->
&lt;aop:config>
    <!--配置切入点-->
    &lt;aop:pointcut id="pt" expression="execution(* com.jjf.service.UserService.*(..))"/>
    <!--配置切面-->
    &lt;aop:advisor advice-ref="txAdvice" pointcut-ref="pt">&lt;/aop:advisor>
&lt;/aop:config>
```

## 完全注解声明式事务管理

> 1.创建配置类,使用配置类替代xml配置文件

```java
@Configuration
@ComponentScan(basePackages = {"com.jjf"})
@EnableTransactionManagement    //开启事务
public class TxConfig {
    //创建数据库连接池
    @Bean
    public DruidDataSource getDruidDataSource(){
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost:3306/mybatis?serverTimezone=Asia/Shanghai");
        dataSource.setUsername("root");
        dataSource.setPassword("password");
        return dataSource;
    }
    //创建jdbcTemplate对象
    @Bean
    public JdbcTemplate getJdbcTemplate(DataSource dataSource){
        //到ioc容器中根据类型找到dataSource
        JdbcTemplate jdbcTemplate = new JdbcTemplate();
        //注入dataSource
        jdbcTemplate.setDataSource(dataSource);
        return jdbcTemplate;
    }
    //创建事务注解
    @Bean
    public DataSourceTransactionManager getDataSourceTransactionManager(DataSource dataSource){
        DataSourceTransactionManager transactionManager = new DataSourceTransactionManager();
        transactionManager.setDataSource(dataSource);
        return transactionManager;
    }
}
```

# Spring5框架新功能

> 1.整个Spring5框架的代码基于Java8,运行时,兼容JDK9,许多不建议使用的类和方法在代码库中删除
>
> 2.Spring5框架自带了通用的日志封装
>
> ​	Spring5已经移除了Log4jConfigListener,官方建议使用Log4j2
>
> ​	Spring5框架整合Log4j2

## Spring5框架整合Log4j2

> 1.引入依赖
>
> 2.创建log4j2.xml配置文件

```xml
<!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-core -->
&lt;dependency>
    &lt;groupId>org.apache.logging.log4j&lt;/groupId>
    &lt;artifactId>log4j-core&lt;/artifactId>
    &lt;version>2.11.2&lt;/version>
&lt;/dependency>

<!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-api -->
&lt;dependency>
    &lt;groupId>org.apache.logging.log4j&lt;/groupId>
    &lt;artifactId>log4j-api&lt;/artifactId>
    &lt;version>2.11.2&lt;/version>
&lt;/dependency>

<!-- https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-slf4j-impl -->
&lt;dependency>
    &lt;groupId>org.apache.logging.log4j&lt;/groupId>
    &lt;artifactId>log4j-slf4j-impl&lt;/artifactId>
    &lt;version>2.11.2&lt;/version>
    &lt;scope>test&lt;/scope>
&lt;/dependency>

<!-- https://mvnrepository.com/artifact/org.slf4j/slf4j-api -->
&lt;dependency>
    &lt;groupId>org.slf4j&lt;/groupId>
    &lt;artifactId>slf4j-api&lt;/artifactId>
    &lt;version>1.7.30&lt;/version>
&lt;/dependency>
```

##  Spring5框架核心容器支持@Nullable注解

> 1.@Nullable注解可以使用在方法上面,属性上面,参数上面,表示返回值可以为空

## Spring5支持整合JUnit5

> 1.引入依赖

```xml
&lt;dependency>
    &lt;groupId>junit&lt;/groupId>
    &lt;artifactId>junit&lt;/artifactId>
    &lt;version>4.12&lt;/version>
    &lt;scope>test&lt;/scope>
&lt;/dependency>

<!-- https://mvnrepository.com/artifact/org.springframework/spring-test -->
&lt;dependency>
    &lt;groupId>org.springframework&lt;/groupId>
    &lt;artifactId>spring-test&lt;/artifactId>
    &lt;version>5.2.6.RELEASE&lt;/version>
    &lt;scope>test&lt;/scope>
&lt;/dependency>
```

```java
//JUnit4
@RunWith(SpringJUnit4ClassRunner.class) //指定单元测试框架
@ContextConfiguration(classes = TxConfig.class)  //加载配置文件
public class TestJUnit {

    @Autowired
    private UserService userService;

    @Test
    public void test1(){
        userService.accountMoney();
    }
}
```

```java
//JUnit5
//@ExtendWith(SpringExtension.class)
//@ContextConfiguration(classes = TxConfig.class)
//使用复合注解替代上面两个注解
@SpringJUnitConfig(classes = TxConfig.class)
public class TestJUnit5 {
    @Autowired
    private UserService userService;

    @Test
    public void test2(){
        userService.accountMoney();
    }
}
```

# SpringWebFlux

## 概念

> 1.是Spring5添加的新的模块,是用于web开发的,功能和SpringMVC类似,WebFlux是因为当前一种比较流行的响应式编程出现的框架.
>
> 2.使用传统web框架,比如SpringMVC,这些是基于Servlet容器,WebFlux是一种异步非阻塞的框架,异步非阻塞的框架在Servlet3.1以后才支持,核心是基于Reactor的相关API进行实现的
>
> 3.异步非阻塞:
>
> ​	异步和同步,阻塞和非阻塞,针对对象不一样
>
> ​	异步和同步针对调用者,调用者发送请求,如果等着对方回应之后才去做其他事情就是同步,否则,就是异步
>
> ​	阻塞和非阻塞针对被调用者,被调用者收到请求之后,做完请求任务之后才给出反馈就是阻塞,受到请求之后马上给出反馈,再去做事情就是非阻塞
>
> 4.WebFlux特点:
>
> ​	1.非阻塞式:在有限的资源下,提高系统的吞吐量和伸缩性,以Reactor为基础实现响应式编程.
>
> ​	2.函数式编程:Spring5框架基于Java8,WebFlux使用Java8函数式编程方式实现路由请求
>
> 5.比较SpringMVC
>
> ​	1.两个框架都可以使用注解方式,都可以运行在Tomcat等容器中.
>
> ​	2.SpringMVC采用命令式编程,WebFlux采用异步响应式编程
>
> ![](https://fanaidi.gitee.io/blogimgs/Spring/SpringMVc和WebFlux比较.png)