---
title: MyBatis
date: 2021-04-16
categories: [后端开发]
tags: [MyBatis, ORM]
description: MyBatis 持久层框架配置、映射与动态 SQL 学习笔记。
coverImg: /images/cover-1.svg
permalink: /posts/mybatis
---



# 一.MyBatis的入门案例

## 1.步骤

~~~
步骤:
	1.读取配置文件: InputStream inputStream = Resources.getResourceAsStream("sqlMapperConfig.xml");
		读取配置文件的时候,一般不用绝对路径和相对路径.
		采用:
			1.使用类加载器.它只能读取类路径的配置文件
			2.使用ServletContext对象的getRealPath()
	2.创建SqlSessionFactory工厂:
		SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
		创建工厂mybatis使用了构建者模式
		构建者模式的优势:
			把对象的创建细节隐藏,使使用者直接调用方法即可拿到对象
	3.创建SqlSession
		生产SqlSession使用了工厂模式
			工厂模式的优势:
				解耦(降低类之间的依赖关系)
	4.创建Dao接口的代理对象
		创建Dao接口实现类使用了代理模式
			代理模式的优势:
				不修改源码的基础上对已有方法增强
	5.执行dao中的方法
	6.释放资源
注意事项:
	不要忘记在映射配置中告知mybatis要封装到哪个实体类中
	配置的方式:指定实体类的全限定类名
~~~

## 2.MyBatis的一些重要对象

#### Resources

> 作用:读取主配置信息

#### SqlSessionFactoryBuilder

> 作用:负责创建SqlSessionFactory对象

#### SqlSessionFactory

> 是接口，创建此对象需要使用更多的资源和时间。
>
> ​	作用是创建SqlSession的工厂，就是创建SqlSession对象。
>
> ​	DefaultSqlSessionFactory是SqlSessionFactory的实现类
>
> ​	SqlSessionFactory中的方法：
>
> ​		openSession():获取一个默认的SqlSession对象，默认是需要手动提交事务的
>
> ​		openSession(boolean):参数表示是否自动提交事务
>
> ​			true:创建一个自动提交事务的SqlSession
>
> ​			false:等同于没有参数的openSession()

#### SqlSession

> SqlSession是接口
>
> ​	作用:提供了大量的执行sql语句的方法
>
> ​	DefaultSqlSession是SqlSession的实现类 

# 2.OGNL表达式

~~~
Object Graphic Navigation Language
对象     图       导航       语言
他是通过对象的取值方法来获取数据.在写法上把get给省略了
	比如:我们获取用户的名称
		类中的写法:user.getUsername();
		OGNL表达式的写法:user.username
mybatis中为什么能直接写username,而不用user.呢?
	因为在parameterType中已经提供了属性所属的类,所以此时不需要写对象名
~~~



# 3.URL和URI

~~~
URL:Uniform Resource Locator 统一资源定位符.他是可以唯一定位一个资源的.
	写法:
	http://localhost:8080/maybatis/demo
	协议    主机      端口    URI
URI:Uniform Resource Identifier 统一资源标识符.它是在应用中可以唯一定位一个资源的
~~~

# 4.mybatis中的连接池使用及分析

## 1.连接池:

~~~
连接池:
	我们在实际开发中都会使用连接池
	因为它可以减少我们获取连接所消耗的时间
连接池就是用于存储连接的一个容器
	容器其实就是一个集合对象,该集合必须是线程安全的,不能两个线程拿到统一连接
	该集合还必须实现队列的特性:先进先出
~~~

## 2.mybatis中的连接池

~~~
mybatis连接池提供了3种方式的配置:
	配置的位置:
		主配置文件SqlMapConfig.xml中的dataSource标签,type属性就是表示采用何种连接池方式.
	type属性的取值:
		POOLED:采用传统的javax.sql.DataSource规范中的连接池,mybatis中有针对规范的实现
		UNPOOLED:采用传统的获取连接的方式,虽然也实现了javax.sql.DataSource接口,但是并没有使用池的思想.
		JNDI:采用服务器提供的JNDI技术实现,来获取DataSource对象,不同的服务器所能拿到DataSource是不一样的
			注意:如果不是web或者maven的war工程,是不能使用的
			
~~~

# 5.mybatis中的事务

~~~
1.什么是事务?
2.事务的四大特性ACID
3.不考虑隔离性会产生的3个问题
4.解决办法:四种隔离级别

mybatis是通过Sqlsession对象的commit方法和rollback方法实现事务的提交和回滚
~~~

# 6.mybatis中的延迟加载

~~~
什么是延迟加载?
	在真正使用数据时才发起查询,不用的时候不查询.按需加载
什么是立即加载?
	不管用不用,只要一调用方法,马上发起查询
在对应的四种表关系中:一对多,多对一,一对一,多对多
	一对多,多对多:通常情况下我们都是采用延迟加载
	多对一,一对一: 通常情况下我们都是采用立即加载
~~~

# 7.mybatis中的缓存

~~~
什么是缓存?
	存在于内存中的临时数据
为什么使用缓存
	减少和数据库的交互次数,提高执行效率
什么样的数据使用缓存,什么样的数据不能使用缓存
	适用于缓存:
		经常查询并且不经常改变的
		数据的正确与否对最终结果影响不大的
	不适用于缓存:
		经常改变的数据
		数据的正确与否对最终结果影响很大的
		例如:商品的库存,银行的汇率,股市的牌价
~~~

## 1.mybatis中的一级缓存和二级缓存

### 一级缓存

~~~
它指的是mybatis中sqlsession对象的缓存
当我们执行查询之后,查询的结果会同时存入到sqlsession为我们提供的一块区域中
该区域的结构是一个Map,当我们再次查询同样的数据,mybatis会先去sqlsession中查询是否有,有的话,直接拿出来用
当sqlsession对象消失时,mybatis的一级缓存也消失了

清空缓存的方法:
sqlSession.clearCache()

一级缓存的分析:
	一级缓存SqlSession范围的缓存,当调用SqlSession的修改,添加,删除,commit(),close()等方法时,就会清空一级缓存
~~~

### 二级缓存

~~~
它是指Mybatis中SqlSessionFactory对象的缓存.由同一个SqlSessionFactory对象创建的SqlSession共享其缓存
二级缓存的步骤:
	第一步:让mybatis框架支持二级缓存(在SqlMapConfig.xml中配置)
	第二步:让当前映射文件支持二级缓存(在当前xml中配置)
	第三步:让当前的操作支持二级缓存(在select标签中配置)
~~~

