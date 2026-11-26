---
title: Groovy
date: 2022-07-28
categories: [语言]
tags: [Groovy, JVM, DSL, 元编程]
description: Groovy 语言学习笔记，涵盖 GDK、闭包、元编程、AST 转换、内部 DSL 与 Spock 测试。
coverImg: /images/cover-1.svg
permalink: /posts/groovy
---

# Groovy 系统学习文档

> 从入门到进阶再到高阶，覆盖 Groovy 语言核心、GDK、元编程、DSL、AST 转换、并发与测试。
> 全文示例基于 **Groovy 4.0.x**，绝大多数示例已在本机 **Groovy 4.0.22 + JDK 8** 环境实际运行验证。

---

## 写在前面

### Groovy 是什么

Groovy 是运行在 JVM 上的动态语言，语法与 Java 高度相似，同时提供了闭包、动态类型、元编程、DSL 等能力。它与 Java 可以无缝互操作：Groovy 代码编译为 JVM 字节码，可以直接使用 Java 类库，Java 代码也可以调用 Groovy 编写的类。

常见使用场景：

| 场景 | 典型技术 |
|------|---------|
| 构建脚本 | Gradle（构建脚本默认使用 Groovy DSL） |
| 测试 | Spock（基于 Groovy 的测试框架） |
| 脚本运维 | Jenkins Pipeline、脚本化批处理 |
| Web 开发 | Grails 框架 |
| 规则/DSL | 内部 DSL、配置脚本、规则引擎 |

### 环境说明与版本约定

| 项目 | 说明 |
|------|------|
| 本机验证环境 | Groovy 4.0.22 / JDK 8（Oracle） |
| 文档主线版本 | Groovy 4.0.x |
| 最低要求 | Groovy 4.0 需要 **JDK 8+**；Groovy 4 推荐 JDK 11+ |
| 与 Groovy 2.x/3.x 的差异 | 4.x 默认启用 Parrot 解析器，支持箭头 `switch`、更多 AST 转换；`?->`（null-safe 方法调用）在 4.0 中**不可用**，请使用 `?.` |
| 外部依赖示例 | Grapes、GPars、Spock 需要联网拉依赖，文档中标有说明，未做本地运行验证 |

运行方式：

```bash
# 交互式脚本文件
groovy hello.groovy

# 单行执行
groovy -e "println 'hello'"

# 交互式 REPL
groovysh

# 图形控制台
groovyConsole
```

### 代码约定

- 示例中的 `println` 为 Groovy 内置的便捷输出方法，等价于 Java 的 `System.out.println`。
- 代码块标注 `groovy` 的均可直接复制运行；标注 `java` / `bash` / `gradle` 的按语言说明使用。
- 注释中标注 `// =>` 的是该语句的实际输出，已尽可能与运行结果保持一致。

---

# 第一部分：基础篇

## 1. 第一个 Groovy 程序

Groovy 脚本不需要 `class` 和 `main` 方法，文件内容会被引擎包装为一个脚本类执行。

```groovy
// hello.groovy
println 'Hello, Groovy!'           // 单引号：普通字符串
println "Groovy version: ${GroovySystem.version}"  // 双引号：GString 插值

def name = 'World'
println "Hello, $name!"            // 简单变量 interpolation 可省略花括号
```

运行：

```bash
groovy hello.groovy
# Hello, Groovy!
# Groovy version: 4.0.22
# Hello, World!
```

**与 Java 的第一个差异**：分号可省略、`println` 可直接调用、`def` 声明变量无需指定类型。

## 2. 变量与动态类型

### 2.1 def 与显式类型

```groovy
def a = 10                        // 动态类型：运行时决定类型
int b = 20                        // 静态类型：编译期确定
String s = 'hello'
def list = [1, 2, 3]

println a.getClass().simpleName   // => Integer
println b.getClass().simpleName   // => Integer
println s.getClass().simpleName   // => String
println list.getClass().simpleName // => ArrayList

// def 变量可以改变引用的类型
a = 'now I am a string'
println a.getClass().simpleName   // => String
```

### 2.2 数字字面量与自动装箱

```groovy
def i = 1                         // Integer
def l = 1L                        // Long
def d = 1.5                       // BigDecimal（Groovy 默认小数类型）
def f = 1.5f                      // Float
def bd = 1.5G                     // BigDecimal（G 后缀）
def bi = 123G                     // BigInteger（整数 + G）

println d.getClass().simpleName   // => BigDecimal
println bi.getClass().simpleName  // => BigInteger

// 大数运算不会溢出（BigInteger / BigDecimal 自动提升）
def huge = 12345678901234567890G * 9876543210G
println huge                      // => 121932631124828532111263526900
```

> **易错点**：Groovy 的小数字面量默认是 `BigDecimal`，不是 Java 的 `double`。做浮点科学计算时建议显式用 `1.5d`。

### 2.3 相等性：== 与 is

```groovy
def s1 = new String('abc')
def s2 = new String('abc')

println(s1 == s2)                 // => true，== 调用 equals()，并自动处理 null
println(s1.is(s2))                // => false，is() 判断引用是否同一对象

def n = null
println(n == null)                // => true，不会 NPE
println(n.is(null))               // => false
```

## 3. 字符串与 GString

Groovy 提供多种字符串字面量，适用于不同场景。

```groovy
def plain = 'hello'               // java.lang.String
def name = 'Groovy'
def gstr = "Hello, $name!"        // GString（有插值时）
def gstr2 = "Hello, ${name.toUpperCase()}!"  // 表达式用 ${}

println plain.class.simpleName    // => String
println gstr.class.simpleName     // => GStringImpl

// 三引号：多行字符串，保留换行与格式
def multi = '''line1
line2
line3'''
println multi

// Slashy 字符串：写正则/路径时无需转义反斜杠
def path = /C:\Users\jf\doc/
println path                      // => C:\Users\jf\doc

// Dollar slashy 字符串：可同时包含单双引号
def msg = $/He said "hi", it's ok/$
println msg
```

### 常用字符串方法

```groovy
def s = '  Hello Groovy  '

println s.trim()                  // => 'Hello Groovy'
println s.size()                  // => 16
println s.toUpperCase()           // => '  HELLO GROOVY  '
println s.contains('Groovy')      // => true
println s.startsWith('  Hello')   // => true
println s.endsWith('  ')          // => true
println 'ab' * 3                  // => 'ababab'（字符串乘法）
println 'a-b-c'.split('-')        // => [a, b, c]
println 'a,b,c'.tokenize(',')     // => [a, b, c]
println 'hello'.reverse()         // => 'olleh'
println '7'.padLeft(3, '0')       // => '007'
println 'Groovy'.center(11, '-')  // => '--Groovy---'
println 'abc'.next()              // => 'abd'
```

> **易错点**：GString 与 String 是不同类型。作为 Map 的 key 时，`"${'a'}"` 与 `'a'` 并不相等。需要时用 `.toString()` 转换。

## 4. 集合：List、Map、Range

### 4.1 List

```groovy
def nums = [1, 2, 3, 4, 5]

println nums[0]                   // => 1
println nums[-1]                  // => 5，负数从末尾取
println nums[1..3]                // => [2, 3, 4]
println nums.size()               // => 5

nums << 6                         // 追加元素
println nums                      // => [1, 2, 3, 4, 5, 6]

println(nums + [7, 8])            // => [1, 2, 3, 4, 5, 6, 7, 8]
println(nums - [1, 2])            // => [3, 4, 5, 6]
println([1, 2] * 2)               // => [1, 2, 1, 2]

println nums.first()              // => 1
println nums.last()               // => 6
println nums.head()               // => 1
println nums.tail()               // => [2, 3, 4, 5, 6]
println nums.take(3)              // => [1, 2, 3]
println nums.drop(3)              // => [4, 5, 6]
println([1, 2, [3, 4]].flatten()) // => [1, 2, 3, 4]
println([3, 1, 2].sort())         // => [1, 2, 3]
println([1, 1, 2].unique())       // => [1, 2]（会修改原列表）
println([1, 2, 3].join('-'))      // => '1-2-3'
println([1, 2].toSet())           // => [1, 2]（Set）
println([1, 2, 3] as int[])       // => int[] 数组
```

### 4.2 Map

```groovy
def user = [name: 'Alice', age: 20, city: 'Beijing']

println user.name                 // => Alice（属性式访问）
println user['age']               // => 20（下标式访问）
println user.size()               // => 3

user.email = 'alice@example.com'  // 添加/修改
println user                      // => [name:Alice, age:20, city:Beijing, email:alice@example.com]

user.each { k, v -> println "$k = $v" }

def grouped = ['a', 'bb', 'ccc'].groupBy { it.size() }
println grouped                   // => [1:[a], 2:[bb], 3:[ccc]]

def counts = ['a', 'bb', 'ccc'].collectEntries { [it, it.size()] }
println counts                    // => [a:1, bb:2, ccc:3]

// withDefault：访问不存在的 key 时返回默认值并自动写入
def counter = [a: 1].withDefault { 0 }
println counter.b                 // => 0
println counter                   // => [a:1, b:0]
```

> **易错点**：Map 中未加引号的 key 是**字符串**，不是变量。例如 `def k='x'; def m=[k:1]`，key 是 `'k'` 而不是 `'x'`。要用变量作 key 需写 `[(k): 1]`。

### 4.3 Range

```groovy
println(1..5)                     // => 1..5（闭区间）
println(1..<5)                    // => 1..<5（半开区间，不含 5）
println('a'..'d')                 // => a..d（字符区间，迭代得到 a b c d）
println((1..10).step(2))          // => [1, 3, 5, 7, 9]
println((5..1))                   // => [5, 4, 3, 2, 1]（递减）

for (i in 1..3) { print "$i " }   // => 1 2 3
```

## 5. 运算符

Groovy 在 Java 运算符基础上增加了若干实用操作符。

```groovy
// Elvis 操作符：简化三元判空
def name = null
println(name ?: 'unknown')        // => unknown

// 安全导航：避免 null 链式调用 NPE
def user = null
println(user?.address?.city)      // => null，不抛异常

// 太空飞船：比较大小，返回 -1 / 0 / 1
println(3 <=> 5)                  // => -1
println(5 <=> 5)                  // => 0
println(5 <=> 3)                  // => 1

// in 操作符：调用 isCase()（区间/集合/正则均可）
println(3 in 1..5)                // => true
println('foo' in ['foo', 'bar'])  // => true
println('abc123' =~ /\d+/)        // => java.util.regex.Matcher（部分匹配）

// 展开操作符 *.：对集合每个元素调用方法/取属性
def users = [[name:'A'], [name:'B']]
println(users*.name)              // => [A, B]
println(['a', 'b']*.toUpperCase()) // => [A, B]

// as 类型强制转换
println('123' as Integer)         // => 123
println([1, 2, 3] as Set)         // => [1, 2, 3]

// 双重否定 !!：将对象转为 boolean（Groovy 3+）
println(!!'ok')                   // => true
println(!!null)                   // => false
```

### 方法调用的省略写法

```groovy
def greet(name, greeting) { println "$greeting, $name!" }

greet('Alice', 'Hi')              // 常规写法
greet 'Alice', 'Hi'               // 省略括号（命令链风格）
```

## 6. 流程控制

```groovy
// if / else
def score = 85
if (score >= 90) {
    println 'A'
} else if (score >= 60) {
    println 'B'
} else {
    println 'C'
}

// switch：可匹配 Range、正则、类型、集合、多值
def value = 5
switch (value) {
    case 1..10:
        println 'in range 1..10'  // => in range 1..10
        break
    case String:
        println 'is a string'
        break
    default:
        println 'other'
}

// Groovy 4 箭头 switch（每个 case 自带表达式，无需 break）
def label(v) {
    switch (v) {
        case 1 -> 'one'
        case 2, 3 -> 'two or three'
        default -> 'other'
    }
}
println label(1)                  // => one
println label(3)                  // => two or three

// 循环
for (i in 0..<3) { print "$i " }  // => 0 1 2
3.times { print 'x' }             // => xxx
1.upto(3) { print it }            // => 123
3.downto(1) { print it }          // => 321
```

> **易错点**：闭包里**不能**使用 `break` / `continue`（编译报错）。如需提前结束遍历，用 `find` / `any` / `every`，或改用普通 `for` 循环。

## 7. 方法

```groovy
// 返回值可省略 return：最后一个表达式即返回值
def add(a, b) { a + b }
println add(2, 3)                 // => 5

// 默认参数
def greet(name, greeting = 'Hello') { "$greeting, $name!" }
println greet('Alice')            // => Hello, Alice!
println greet('Bob', 'Hi')        // => Hi, Bob!

// 命名参数：脚本中的方法需显式接收 Map 才能使用命名参数写法
def connect(Map opts) { "$opts.host:$opts.port, timeout=${opts.get('timeout', 3000)}" }
println connect(host: 'localhost', port: 8080)
// => localhost:8080, timeout=3000

// 变长参数
def sum(int... nums) { nums.sum() }
println sum(1, 2, 3, 4)           // => 10

// 方法指针：把方法转成闭包
def upper = 'hello'.&toUpperCase
println upper()                   // => HELLO

// 闭包作为方法参数
[1, 2, 3].each { println it * 2 }
```

## 8. 闭包入门

闭包是 Groovy 最重要的特性，本质是一段可传递、可执行的代码块。

```groovy
// 定义与调用
def greet = { name -> "Hello, $name!" }
println greet('Alice')            // => Hello, Alice!
println greet.call('Bob')         // => Hello, Bob!

// 单参数默认用 it
def doubleIt = { it * 2 }
println doubleIt(21)              // => 42

// 无参数用 -> 显式声明
def now = { -> new Date() }
println now()

// 闭包作为方法参数
def nums = [1, 2, 3, 4, 5, 6]
println nums.findAll { it % 2 == 0 }   // => [2, 4, 6]
println nums.collect { it * it }      // => [1, 4, 9, 16, 25, 36]
println nums.inject(0) { acc, n -> acc + n }  // => 21（求和）

// 闭包可赋值给变量并当作对象传递
def op = { a, b -> a + b }
println([[1, 2], [3, 4]].collect { op(it[0], it[1]) })  // => [3, 7]
```

> **易错点**：闭包内的 `return` 会从**包含闭包的方法**返回，而不是只从闭包返回。若只需结束本次闭包调用，避免使用 `return`，改用条件表达式。

## 9. 类与对象（POGO）

Groovy 的类默认字段是 property（自动生成 getter/setter），称为 POGO（Plain Old Groovy Object）。

```groovy
import groovy.transform.MapConstructor

@MapConstructor                    // 显式声明其它构造器后，需此注解才能保留 Map 构造器
class User {
    String name                   // property：自动生成 getName()/setName()
    int age

    User(String name, int age) {
        this.name = name
        this.age = age
    }

    String introduce() { "I'm $name, $age years old." }
}

def u1 = new User('Alice', 20)
println u1.name                   // => Alice（实际调用 getName()）
println u1.introduce()            // => I'm Alice, 20 years old.

// Map 构造器：无需定义对应构造器即可按属性名初始化
def u2 = new User(name: 'Bob', age: 25)
println u2.introduce()            // => I'm Bob, 25 years old.

// 命名参数 + 闭包（链式配置）
def u3 = new User(name: 'Carol', age: 30)
println u3.with { "$name/$age" }  // => Carol/30
```

### 默认可见性与字段

```groovy
class Demo {
    String prop = 'property'      // property：自动 getter/setter，外部可见
    private String secret = 'hidden' // private 字段：不生成 public getter
    def method() { 'ok' }         // 方法默认 public
}

def d = new Demo()
println d.prop                    // => property
// println d.secret               // 编译错误：private 不可见
```

## 10. 包与导入

Groovy 默认自动导入大量常用包，无需显式 `import`：

```groovy
// 默认导入包括：
// java.lang.*, java.util.*, java.io.*, java.net.*,
// groovy.lang.*, groovy.util.*,
// java.math.BigInteger, java.math.BigDecimal

def list = new ArrayList()        // java.util.* 自动导入
def file = new File('test.txt')   // java.io.* 自动导入

// 静态导入
import static java.lang.Math.PI
println PI                        // => 3.141592653589793

// 别名导入
import java.util.Date as JDate
println new JDate().class.simpleName  // => Date
```

---

# 第二部分：进阶篇

## 1. GDK：Groovy 开发工具包

GDK（Groovy Development Kit）通过扩展方法为 JDK 类增加了大量便利方法。本质上，`String`、`List`、`File` 等类被注入了额外方法。

### 1.1 Object 通用扩展

```groovy
// with / tap：在闭包中操作对象，避免重复书写变量名
def sb = new StringBuilder().with {
    append('Hello').append(' ').append('Groovy')
    it                            // 返回 StringBuilder 自身
}
println sb.toString()             // => Hello Groovy

def list = [1, 2].tap { it << 3 } // tap 返回调用者本身
println list                      // => [1, 2, 3]

// asType：类型强制转换
println '42' as int                // => 42
```

### 1.2 集合处理流水线

```groovy
def words = ['apple', 'banana', 'cherry', 'date']

def result = words
        .findAll { it.length() > 4 }        // 过滤
        .collect { it.toUpperCase() }       // 映射
        .sort()                             // 排序
        .join(', ')                         // 拼接

println result                    // => APPLE, BANANA, CHERRY

// 更多常用操作
println words.any { it.startsWith('b') }   // => true
println words.every { it.size() > 2 }      // => true
println words.count { it.contains('a') }   // => 3
println words.find { it.startsWith('c') }  // => cherry
println words.max { it.size() }            // => banana（长度最大）
println words.collectMany { it.toList() }  // => [a, p, p, l, e, ...]

// groupBy / countBy
println(['a','b','a'].countBy { it })     // => [a:2, b:1]
```

## 2. 闭包进阶

### 2.1 curry / rcurry / ncurry

```groovy
def add = { a, b, c -> a + b + c }

println add.curry(1)(2, 3)        // => 6，固定第一个参数
println add.curry(1, 2)(3)        // => 6，一次固定多个
println add.rcurry(3)(1, 2)       // => 6，固定末尾参数
println add.ncurry(1, 2)(1, 3)    // => 6，从索引 1 开始固定
```

### 2.2 compose / andThen

```groovy
def add1 = { it + 1 }
def times2 = { it * 2 }

println add1.compose(times2)(3)   // => 7：先 times2 后 add1 => (3*2)+1
println add1.andThen(times2)(3)   // => 8：先 add1 后 times2 => (3+1)*2
```

### 2.3 memoize 与 trampoline

```groovy
// memoize：缓存闭包计算结果
def calls = 0
def expensive = { int n -> calls++; n * n }.memoize()
println expensive(10)             // => 100
println expensive(10)             // => 100（命中缓存）
println "calls=$calls"            // => calls=1

// trampoline：把递归改写成循环，避免栈溢出
def fib
fib = { n -> n < 2 ? n : fib(n - 1) + fib(n - 2) }.trampoline()
println fib(10)                   // => 55
println fib(30)                   // => 832040（普通递归在小 n 也可，trampoline 更安全）
```

### 2.4 delegate 与 resolveStrategy

闭包的 `this`（定义类）、`owner`（定义类或外层闭包）、`delegate`（代理对象）决定属性解析顺序。这是实现 DSL 的核心机制。

```groovy
class Config {
    String host
    int port
}

def configClosure = {
    host = 'localhost'            // 委托给 delegate 的属性
    port = 8080
}

def cfg = new Config()
configClosure.delegate = cfg
configClosure.resolveStrategy = Closure.DELEGATE_FIRST
configClosure.call()

println "${cfg.host}:${cfg.port}" // => localhost:8080
```

## 3. 元编程基础

元编程（Metaprogramming）指在运行时修改对象的行为。

### 3.1 Expando：动态添加属性与方法

```groovy
def person = new Expando()
person.name = 'Alice'
person.greet = { "Hi, I'm $name" }

println person.name               // => Alice
println person.greet()            // => Hi, I'm Alice
```

### 3.2 metaClass：给已有类添加方法

```groovy
// 给 String 添加一个方法（仅影响当前类实例）
String.metaClass.shout = { -> delegate.toUpperCase() + '!' }
println 'hello'.shout()           // => HELLO!

// 用方法拦截统一处理
class Service {
    def greet(name) { "Hello, $name" }
}

def s = new Service()
s.metaClass.invokeMethod = { String name, args ->
    println "调用方法: $name, 参数: $args"
    delegate.metaClass.getMetaMethod(name, args).invoke(delegate, args)
}
println s.greet('Bob')
// 调用方法: greet, 参数: [Bob]
// Hello, Bob
```

### 3.3 methodMissing / propertyMissing

```groovy
class DynamicBean {
    def data = [:]

    def methodMissing(String name, args) {
        if (name.startsWith('get')) {
            def key = name[3].toLowerCase() + name.substring(4)
            return data[key]
        }
        throw new MissingMethodException(name, DynamicBean, args)
    }

    def propertyMissing(String name) {
        data[name]
    }

    def propertyMissing(String name, value) {
        data[name] = value
    }
}

def bean = new DynamicBean()
bean.name = 'Alice'
println bean.name                 // => Alice（走 propertyMissing 读取）
println bean.getName()            // => Alice（走 methodMissing）
```

## 4. 类型检查与静态编译

Groovy 默认是动态类型，但可以选择编译期检查以获得 Java 级别的性能与类型安全。

```groovy
import groovy.transform.TypeChecked
import groovy.transform.CompileStatic
import groovy.transform.CompileDynamic

// @TypeChecked：编译期类型检查，仍生成动态调用字节码
@TypeChecked
class Checked {
    int add(int a, int b) { a + b }
    // def bad() { 'x' + 1 } // 编译错误：类型不匹配
}

// @CompileStatic：编译期类型检查 + 生成静态调用字节码（性能接近 Java）
@CompileStatic
class FastMath {
    static int sum(List<Integer> nums) {
        nums.inject(0) { acc, n -> acc + n }
    }
}
println FastMath.sum([1, 2, 3])   // => 6

// @CompileDynamic：在静态编译类中局部恢复动态特性
@CompileStatic
class Mixed {
    @CompileDynamic
    def dynamicCall(obj) { obj.foo() }  // 动态方法调用
}
```

选择建议：

| 场景 | 推荐 |
|------|------|
| 脚本、DSL、探索式代码 | 动态类型（默认） |
| 业务逻辑、库代码 | `@CompileStatic` |
| 只需类型安全检查 | `@TypeChecked` |
| 静态类中少量动态调用 | `@CompileDynamic` 局部标注 |

## 5. Groovy 与 Java 互操作

### 5.1 Groovy 调用 Java

```groovy
// 直接使用 JDK / 第三方 Java 类
def list = new java.util.ArrayList<String>()
list.add('a')
println list                      // => [a]

// SAM（函数式接口）转换：闭包自动转成 Runnable / Comparator 等
Runnable r = { println 'running' }
new Thread(r).start()

def sorted = ['bbb', 'a', 'cc'].sort { a, b -> a.size() <=> b.size() }
println sorted                    // => [a, cc, bbb]
```

### 5.2 Java 调用 Groovy

Java 侧只需引入 Groovy 依赖，即可通过 `GroovyShell` 或 `GroovyClassLoader` 执行脚本。

```java
// Java 代码（需引入 groovy jar）
import groovy.lang.GroovyShell;

public class JavaCallGroovy {
    public static void main(String[] args) {
        GroovyShell shell = new GroovyShell();
        Object result = shell.evaluate("1 + 2");
        System.out.println(result);  // 3
    }
}
```

### 5.3 JavaBean 属性语法糖

```groovy
class Person {
    String name
    int age
}

def p = new Person()
p.setName('Alice')                // Java 风格
println p.getName()               // => Alice

p.name = 'Bob'                    // Groovy 属性语法（等价 setName）
println p.name                    // => Bob（等价 getName）
```

## 6. Builder：XML 与 JSON

Groovy 内置多个 Builder，用闭包式 DSL 生成结构化数据。

### 6.1 MarkupBuilder 生成 XML

```groovy
import groovy.xml.MarkupBuilder

def writer = new StringWriter()
def xml = new MarkupBuilder(writer)

xml.catalog {
    book(id: '1') {
        title('Groovy in Action')
        author('Dierk Koenig')
    }
    book(id: '2') {
        title('Programming Groovy')
    }
}

println writer.toString()
// <catalog>
//   <book id='1'>
//     <title>Groovy in Action</title>
//     <author>Dierk Koenig</author>
//   </book>
//   <book id='2'>
//     <title>Programming Groovy</title>
//   </book>
// </catalog>
```

### 6.2 JsonBuilder / JsonOutput / JsonSlurper

```groovy
import groovy.json.JsonBuilder
import groovy.json.JsonOutput
import groovy.json.JsonSlurper

// JsonBuilder：闭包式构建
def json = new JsonBuilder()
json.user {
    name 'Alice'
    age 20
    roles 'admin', 'user'
}
println json.toString()
// => {"user":{"name":"Alice","age":20,"roles":["admin","user"]}}

// JsonOutput：对象转 JSON
def map = [name: 'Bob', active: true]
println JsonOutput.toJson(map)     // => {"name":"Bob","active":true}
println JsonOutput.prettyPrint(JsonOutput.toJson(map))

// JsonSlurper：解析 JSON
def parsed = new JsonSlurper().parseText('{"name":"Carol","age":30}')
println parsed.name                // => Carol
println parsed.age                 // => 30
```

### 6.3 XmlSlurper 解析 XML

```groovy
import groovy.xml.XmlSlurper

def xmlText = '''
<catalog>
  <book id="1"><title>Groovy in Action</title></book>
  <book id="2"><title>Programming Groovy</title></book>
</catalog>
'''

def catalog = new XmlSlurper().parseText(xmlText)
println catalog.book.size()        // => 2
println catalog.book[0].title.text()  // => Groovy in Action
println catalog.book.findAll { it.@id == '2' }*.title*.text()
// => [Programming Groovy]
```

## 7. 文件与 IO

Groovy 为 `File` 增加了大量便捷方法。

```groovy
import groovy.io.FileType

def file = new File('demo.txt')
file.text = 'line1\nline2\nline3\n'  // 直接写文本

println file.text                  // 一次读全文
file.eachLine { line, no -> println "$no: $line" }
// 1: line1
// 2: line2
// 3: line3

file.withWriter('UTF-8') { w -> w.write('new content') }
file.append('appended\n')          // 追加

// 遍历目录
new File('.').eachFileRecurse(FileType.FILES) { f ->
    if (f.name.endsWith('.txt')) println f.name
}

// 资源安全关闭
new StringReader('abc').withCloseable { reader ->
    println reader.read()          // => 97（字符 a 的 ASCII）
}
```

### 序列化扩展

```groovy
def data = [name: 'Alice', age: 20]

// 用 JDK 标准序列化（Map 等 Serializable 对象）
def baos = new ByteArrayOutputStream()
new ObjectOutputStream(baos).writeObject(data)
def restored = new ObjectInputStream(
        new ByteArrayInputStream(baos.toByteArray())).readObject()

println restored                   // => [name:Alice, age:20]
```

## 8. 正则表达式

```groovy
// ~//   创建 Pattern
// =~    部分匹配，返回 Matcher
// ==~   全匹配，返回 boolean

def pattern = ~/\d{3}-\d{4}/
println pattern.class.simpleName   // => Pattern
println('123-4567' ==~ /\d{3}-\d{4}/)  // => true（全匹配）
println('abc123def' =~ /\d+/)      // => Matcher（部分匹配）

def m = 'abc123def456' =~ /(\d+)/
while (m.find()) {
    println "found: ${m.group(1)} at ${m.start()}"
}
// found: 123 at 3
// found: 456 at 9

// 替换（支持闭包）
println 'hello123'.replaceFirst(/\d+/) { it -> (it as int) + 1 }
// => hello124
```

## 9. 异常、断言与资源

```groovy
// try / catch / finally，支持多异常捕获
try {
    def n = 'not a number' as int
} catch (NumberFormatException | ClassCastException e) {
    println "转换失败: ${e.class.simpleName}"
} finally {
    println 'cleanup'
}

// assert：Groovy 支持「power assert」，失败时打印表达式中间值
def x = 1
def y = 2
// assert x + y == 4   // 失败时会显示 x + y 的值 3

// 断言可用于文档式自检
assert [1, 2, 3].sum() == 6
assert 'hello'.size() == 5
println 'all assertions passed'
```

## 10. 日期与时间处理

Groovy 通过 GDK 扩展了 `Date`，并提供 `TimeCategory` 简化日期计算。

```groovy
import groovy.time.TimeCategory

def now = new Date()
println now.format('yyyy-MM-dd HH:mm:ss')

// Date 扩展方法：plus(int) 的单位是「天」
println now.plus(1)                // 加 1 天
println now.clearTime()            // 清零时分秒（原地修改 now）

use(TimeCategory) {
    println 1.day.from.now         // 从明天零点起（TimeCategory 语义）
    println 2.hours.ago            // 两小时前
    println((new Date() + 3.days).format('yyyy-MM-dd'))  // 3 天后，注意 println 后不留空格
}

// 字符串解析
def d = Date.parse('yyyy-MM-dd', '2026-01-01')
println d.format('yyyy/MM/dd')     // => 2026/01/01
```

---

# 第三部分：高阶篇

## 1. AST 转换

AST（Abstract Syntax Tree，抽象语法树）转换在**编译期**修改代码结构，是 Groovy 框架级能力的基石。Lombok 在 Java 中做的事，Groovy 用内置注解即可完成。

### 1.1 常用内置 AST 转换

```groovy
import groovy.transform.*

@Canonical                         // = @ToString + @EqualsAndHashCode + @TupleConstructor
class Point {
    int x
    int y
}

def p1 = new Point(1, 2)           // 元组构造器
def p2 = new Point(1, 2)
println p1                         // => Point(1, 2)（自动生成 toString）
println(p1 == p2)                  // => true（自动生成 equals/hashCode）

@ToString(includeNames = true, excludes = 'password')
@EqualsAndHashCode
@TupleConstructor
class Account {
    String username
    String password
}
println new Account('alice', 'secret')
// => Account(username:alice)

@groovy.transform.builder.Builder  // 位于 groovy.transform.builder 子包
@ToString
class User {
    String name
    int age
}
def u = User.builder().name('Alice').age(20).build()
println u                          // => User(Alice, 20)（@ToString 提供输出）

class HeavyResource {
    @Lazy                          // @Lazy 是字段注解，延迟初始化该字段
    private Object resource = { println 'initialized'; 'data' }()

    def work() { resource }        // 首次访问 resource 时才求值
}
def r = new HeavyResource()        // 构造不打印
println 'created'                  // => created
println r.work()                   // 首次访问才打印 initialized
// => initialized
// => data
```

### 1.2 其他常用注解

| 注解 | 作用 |
|------|------|
| `@Singleton` | 单例类 |
| `@Immutable` | 不可变类（深度不可变） |
| `@Delegate` | 方法委托给字段 |
| `@Sortable` | 自动生成 `compareTo` |
| `@Memoized` | 缓存方法返回值 |
| `@Slf4j` / `@Log` | 自动注入日志字段 |
| `@PackageScope` | 修改默认可见性 |
| `@Field` | 脚本中定义真正的类字段 |
| `@DelegatesTo` | 为 DSL 提供 IDE 类型提示 |

```groovy
import groovy.transform.Memoized

class PriceService {
    @Memoized
    BigDecimal price(String sku) {
        println "计算价格: $sku"
        new BigDecimal(sku.hashCode() % 100)
    }
}

def svc = new PriceService()
println svc.price('A001')
println svc.price('A001')          // 第二次不再打印「计算价格」
```

### 1.3 自定义局部 AST 转换（概念示例）

自定义转换需要实现 `ASTTransformation`，并通过注解声明。以下是骨架示意，实际开发需放在独立源文件中先编译，再被目标脚本使用。

```groovy
// 概念示例：定义一个 @Loggable 注解，在编译期自动插入日志字段
import org.codehaus.groovy.transform.GroovyASTTransformationClass
import java.lang.annotation.*

@Retention(RetentionPolicy.SOURCE)
@Target([ElementType.TYPE])
@GroovyASTTransformationClass('com.example.LoggableTransformation')
@interface Loggable {}

// 转换器示意（需实现 ASTTransformation 接口）
// class LoggableTransformation implements ASTTransformation {
//     void visit(ASTNode[] nodes, SourceUnit source) {
//         // 通过 source.AST 获取 ClassNode，注入字段/方法
//     }
// }

println Loggable  // 验证注解定义成功；实际转换器需单独编译后才会生效
```

## 2. MOP 与元编程深入

MOP（Meta Object Protocol）是 Groovy 动态调用的核心协议。理解调用链有助于排查性能问题与实现框架。

### 2.1 方法调用分派流程

```groovy
class Demo {
    def foo() { 'normal foo' }
}

def d = new Demo()

// 1. 直接调用：走 MOP 标准分派
println d.foo()                    // => normal foo

// 2. 通过 metaClass 调用
println d.metaClass.invokeMethod(d, 'foo', [])  // => normal foo

// 3. methodMissing：方法不存在时的兜底
class Dynamic {
    def methodMissing(String name, args) { "missing: $name($args)" }
}
println new Dynamic().whatever(1, 2)  // => missing: whatever([1, 2])
```

调用链大致为：`调用点缓存 → MetaClassImpl/ExpandoMetaClass → invokeMethod → methodMissing → MissingMethodException`。

### 2.2 ExpandoMetaClass 与全局修改

```groovy
// 为 Number 增加方法（影响所有数字类型）
Number.metaClass.twice = { delegate * 2 }
println 5.twice()                  // => 10
println 2.5.twice()                // => 5.0

// 为某个类批量定义方法
class Calculator {}
Calculator.metaClass {
    add { a, b -> a + b }
    sub { a, b -> a - b }
}
def calc = new Calculator()
println calc.add(5, 3)             // => 8
println calc.sub(5, 3)             // => 2
```

### 2.3 invokeMethod 拦截（AOP 雏形）

```groovy
class Traced {
    def work(x) { "work:$x" }

    def invokeMethod(String name, args) {
        println "[TRACE] before $name"
        def result = metaClass.getMetaMethod(name, args).invoke(this, args)
        println "[TRACE] after $name"
        result
    }
}
println new Traced().work(1)
// [TRACE] before work
// [TRACE] after work
// work:1
```

> **性能提示**：动态元编程会绕过调用点缓存并在每次调用时做方法查找。热点代码中使用 `@CompileStatic` 可避免这部分开销。

## 3. trait（特质）

trait 是 Groovy 的「带实现的接口」，支持多重继承、状态字段与默认方法，弥补 Java 单继承的不足。

```groovy
trait Greeting {
    String prefix = 'Hello'        // trait 可以有状态
    String greet(String name) { "$prefix, $name!" }
    abstract String requireName()  // 抽象方法：实现类必须实现（需显式 abstract）
}

trait Loud {
    String greet(String name) {    // 覆盖其他 trait 的同名方法
        super.greet(name).toUpperCase()
    }
}

class Person implements Greeting, Loud {
    String requireName() { 'Alice' }
}

def p = new Person()
println p.greet('Bob')             // => HELLO, BOB!
println p.requireName()            // => Alice

// 无抽象方法的 trait 可通过 as 动态混入
trait Tag { String label() { 'tag' } }
class Plain {}
println((new Plain() as Tag).label()) // => tag
```

> 提示：`as Greeting` 会生成代理类；若 trait 含抽象方法，代理调用时会因未实现而报错。实际项目更常见的是在类声明中 `implements`。

## 4. Grapes：脚本依赖管理

Grapes 允许在脚本顶部用 `@Grab` 声明依赖，运行时自动下载到本地缓存（`~/.groovy/grapes`）。适合脚本化工具与一次性任务。

```groovy
// 需要联网；首次运行会下载依赖
@Grab('commons-lang:commons-lang:2.6')
import org.apache.commons.lang.StringUtils

println StringUtils.reverse('Groovy')  // => yvoorG

// 指定仓库
// @GrabResolver(name = 'aliyun', root = 'https://maven.aliyun.com/repository/public')
// @GrabConfig(systemClassLoader = true)  // 需要系统类加载器时使用
```

> **验证说明**：Grapes 依赖网络下载，本机示例未做运行验证。离线或企业内网环境请手动放置 jar 或使用构建工具管理依赖。

## 5. 脚本高级与命令行工具

### 5.1 脚本绑定与 @Field

```groovy
import groovy.transform.Field

// 脚本中的顶层变量默认存于 Binding，脚本方法无法直接访问
// @Field 将其变为脚本类的真正字段，才能被方法访问
@Field
static int counter = 0

@Field
static final String APP_NAME = 'DemoApp'

def show() { "$APP_NAME counter=$counter" }
counter++
println show()                     // => DemoApp counter=1
```

### 5.2 CliBuilder 解析命令行参数

```groovy
import groovy.cli.commons.CliBuilder

def cli = new CliBuilder(usage: 'app.groovy [options]')
cli.h(longOpt: 'help', '显示帮助')
cli.n(longOpt: 'name', args: 1, argName: 'name', '用户名')
cli.v(longOpt: 'verbose', '详细模式')

def opts = cli.parse(['-n', 'Alice', '-v'])
if (opts.h) { cli.usage(); return }
println "name=${opts.n}, verbose=${opts.v}"
// => name=Alice, verbose=true
```

### 5.3 动态执行脚本

```groovy
def shell = new GroovyShell()
def result = shell.evaluate('''
    def square(x) { x * x }
    square(7)
''')
println result                     // => 49

// 绑定变量到脚本
def binding = new Binding([name: 'Alice'])
println new GroovyShell(binding).evaluate('"Hello, $name!"')
// => Hello, Alice!
```

## 6. GPars 并发编程

GPars 是 Groovy 的并发库，提供并行集合、Actor、Dataflow 等模型。需要额外依赖（`@Grab('org.codehaus.gpars:gpars:1.2.1')`）。

```groovy
// 需联网拉依赖，示例展示 API 用法
@Grab('org.codehaus.gpars:gpars:1.2.1')
import groovyx.gpars.GParsPool

def nums = (1..8).toList()
GParsPool.withPool(4) {
    def squares = nums.collectParallel { it * it }
    println squares                // => [1, 4, 9, 16, 25, 36, 49, 64]

    println nums.parallel.findAny { it > 5 }  // 并行查找任一满足条件的元素
}

// Actor 模型（消息驱动）
// import groovyx.gpars.actor.Actors
// def actor = Actors.actor {
//     loop { react { msg -> println "收到: $msg" } }
// }
// actor << 'hello'
```

> **验证说明**：GPars 示例依赖外部库，本机未做运行验证。生产项目建议通过 Gradle/Maven 管理依赖并核对与 Groovy 4 的兼容性。

## 7. 内部 DSL 开发

DSL（领域特定语言）是 Groovy 的杀手级场景。Gradle 构建脚本就是典型的内部 DSL。

### 7.1 命令链（Command Chain）

```groovy
// Groovy 允许省略方法调用的括号和点号，形成自然语言式调用
def select = { col -> [from: { table -> "SELECT $col FROM $table" }] }
println select('name').from('users')
// => SELECT name FROM users

// 更自然的 DSL：通过闭包 + delegate 实现
class Task {
    String name
    Closure action
}

class Project {
    List<Task> tasks = []
    void task(String name, Closure config) {
        def t = new Task(name: name)
        config.delegate = t
        config.resolveStrategy = Closure.DELEGATE_FIRST
        config.call()
        tasks << t
    }
}

def project = new Project()
project.with {
    task('compile') {               // 命令链写法在方法+闭包场景易歧义，建议加括号
        name = 'compile'
        action = { println 'compiling...' }
    }
    task('test') {
        name = 'test'
        action = { println 'testing...' }
    }
}
println project.tasks*.name        // => [compile, test]
project.tasks[0].action.call()     // => compiling...
```

### 7.2 @DelegatesTo 提供类型提示

```groovy
import groovy.lang.DelegatesTo

class EmailBuilder {
    String from, to, subject
    void from(String v) { this.from = v }
    void to(String v) { this.to = v }
    void subject(String v) { this.subject = v }
}

def build(@DelegatesTo(EmailBuilder) Closure config) {
    def email = new EmailBuilder()
    config.delegate = email
    config.resolveStrategy = Closure.DELEGATE_FIRST
    config.call()
    email
}

def e = build {
    from 'alice@example.com'
    to 'bob@example.com'
    subject 'Hello'
}
println "${e.from} -> ${e.to}: ${e.subject}"
// => alice@example.com -> bob@example.com: Hello
```

## 8. Gradle 与 Groovy

Gradle 的构建脚本（`build.gradle`）就是 Groovy DSL。理解 Groovy 有助于编写自定义任务与插件。

```groovy
// build.gradle 示例
plugins {
    id 'java'
    id 'groovy'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.apache.groovy:groovy:4.0.22'
    testImplementation 'org.spockframework:spock-core:2.4-M4-groovy-4.0'
}

// 自定义任务
tasks.register('hello') {
    doLast {
        println 'Hello from Gradle task!'
    }
}

// 任务依赖与配置
tasks.register('copyDocs', Copy) {
    from 'src/docs'
    into "$buildDir/docs"
    dependsOn 'hello'
}

// 增量构建：声明输入/输出，Gradle 才能正确跳过 up-to-date 任务
tasks.register('generateReport') {
    inputs.file 'data.csv'
    outputs.file "$buildDir/report.txt"
    doLast {
        file("$buildDir/report.txt").text = 'generated'
    }
}
```

常用命令：

```bash
gradle tasks          # 查看所有任务
gradle hello          # 执行自定义任务
gradle build          # 编译 + 测试 + 打包
gradle --offline      # 离线模式
```

## 9. Spock 测试框架

Spock 是专为 Groovy/Java 设计的行为驱动（BDD）测试框架，语法表达力强，自带 Mock/Stub。

```groovy
// src/test/groovy/CalculatorSpec.groovy
// 需依赖：org.spockframework:spock-core:2.x-groovy-4.0
import spock.lang.Specification
import spock.lang.Unroll

class Calculator {
    int add(int a, int b) { a + b }
    int divide(int a, int b) { a / b as int }
}

class CalculatorSpec extends Specification {

    def "加法应返回两数之和"() {
        given: '准备被测对象'
        def calc = new Calculator()

        when: '执行被测方法'
        def result = calc.add(2, 3)

        then: '断言结果'
        result == 5
    }

    @Unroll
    def "除法 #a / #b 应得到 #expected"() {
        expect:
        new Calculator().divide(a, b) == expected

        where: '数据驱动测试'
        a  | b || expected
        6  | 2 || 3
        9  | 3 || 3
        10 | 2 || 5
    }

    def "除零应抛出异常"() {
        when:
        new Calculator().divide(1, 0)

        then:
        thrown(ArithmeticException)
    }
}
```

Mock 与交互验证：

```groovy
interface UserRepository { String findName(int id) }

class UserService {
    UserRepository repo
    String userName(int id) { repo.findName(id) }
}

// 无需 Spock 也能演示：闭包转接口作为 Stub
def stub = { int id -> 'Alice' } as UserRepository
def service = new UserService(repo: stub)
println service.userName(1)        // => Alice

// 在 Spock 的 Specification 中则写成（需 Spock 依赖）：
// def repo = Mock(UserRepository)
// def service = new UserService(repo: repo)
// when: def name = service.userName(1)
// then:
// 1 * repo.findName(1) >> 'Alice'   // 期望调用 1 次并返回 Alice
// name == 'Alice'
```

> **验证说明**：Spock 示例需外部依赖与 Gradle/Maven 环境，本机未做运行验证。

## 10. 性能优化与最佳实践

### 10.1 性能要点

| 要点 | 说明 |
|------|------|
| 热点代码使用 `@CompileStatic` | 生成静态调用字节码，性能接近 Java |
| 避免循环内动态属性访问 | 动态分派有缓存但仍有开销 |
| 大量字符串拼接用 `StringBuilder` | GString 每次插值会创建对象 |
| 谨慎使用 `metaClass` 全局修改 | 影响范围大，且绕过调用点缓存 |
| 闭包注意捕获外部变量 | 每个闭包实例会持有引用，避免意外内存驻留 |
| 集合流水线的中间集合 | 大数据量时可考虑 `find`/`any` 短路或手写循环 |

### 10.2 常见坑

```groovy
// 1. == 与 is
def a = new String('x')
def b = new String('x')
assert (a == b)        // true，值相等
assert !a.is(b)        // true，引用不同

// 2. 闭包中 return 从外层方法返回
def findEarly(list) {
    list.each { if (it == 3) return it }  // 注意：return 会直接从 findEarly 返回 null
    'not found'
}
// 正确做法：用 find
assert [1,2,3].find { it == 3 } == 3

// 3. GString 作 Map key
def key = "${'abc'}"
def map = [(key): 1]
println map['abc']     // => null，因为 key 是 GString 不是 String
println map[key.toString()]  // => null
println map[key]       // => 1

// 4. unique/sort 会修改原集合
def nums = [3, 1, 2]
nums.sort()
println nums           // => [1, 2, 3]，原集合已被修改
// 不想修改原集合用 nums.toSorted()
```

### 10.3 最佳实践清单

- 脚本优先保持简洁；业务代码用类组织并加 `@CompileStatic`。
- DSL 用闭包 + `delegate` + `resolveStrategy` 实现，配合 `@DelegatesTo` 提升 IDE 体验。
- 需要改第三方类行为时，优先用局部 `metaClass`，避免全局污染。
- 测试用 Spock，数据驱动 + 交互验证能显著减少样板代码。
- 依赖管理交给 Gradle/Maven，脚本临时依赖才用 `@Grab`。

---

# 附录

## 学习路线建议

| 阶段 | 内容 | 目标 |
|------|------|------|
| 第 1 周 | 基础篇 1~10 | 能写日常脚本，熟悉集合与闭包 |
| 第 2 周 | 进阶篇 1~6 | 掌握 GDK、元编程、静态编译、Builder |
| 第 3 周 | 进阶篇 7~10 + 高阶篇 1~3 | 理解 IO、正则、AST 转换、MOP、trait |
| 第 4 周 | 高阶篇 4~10 | 掌握 Grapes、DSL、Gradle、Spock、性能优化 |

## 练习项目

1. **批量文件重命名工具**：用 `File.eachFileRecurse` + 正则实现按规则重命名。
2. **CSV 报表生成器**：读取 CSV，用 `groupBy` 统计，用 `MarkupBuilder` 输出 HTML 报表。
3. **简易构建 DSL**：实现 `task 'name' { ... }` 风格的项目配置脚本。
4. **REST API 测试脚本**：用 `@Grab` 引入 HTTP 客户端，用 `JsonSlurper` 解析响应并断言。
5. **Spock 测试套件**：为一个 Java/Groovy 类编写数据驱动测试与 Mock 交互测试。

## 推荐资源

- Groovy 官方文档：<https://docs.groovy-lang.org/>
- Groovy 风格指南：<https://groovy-lang.org/style-guide.html>
- Groovy Koans（互动练习）：<https://github.com/IntelliJB/groovy-koans>
- Spock 官方文档：<https://spockframework.org/spock/docs/>
- Gradle Groovy DSL 文档：<https://docs.gradle.org/current/dsl/>

## 自测题

1. Groovy 中 `==` 与 `is()` 的区别是什么？为什么 `null == null` 为 true 而 `null.is(null)` 为 false？
2. GString 与普通 String 的区别是什么？为什么说 GString 不适合作为 Map 的 key？
3. `findAll`、`collect`、`inject` 各自的作用是什么？请用流水线方式统计一段文本中各单词出现次数。
4. Elvis 操作符 `?:` 与安全导航 `?.` 分别解决什么问题？
5. 闭包的 `this`、`owner`、`delegate` 有什么区别？`resolveStrategy` 如何影响属性解析？
6. `curry`、`rcurry`、`ncurry` 分别固定哪个位置的参数？`compose` 与 `andThen` 的执行顺序有何不同？
7. `@TypeChecked` 与 `@CompileStatic` 的区别是什么？分别在什么场景下使用？
8. 什么是 AST 转换？`@Canonical` 等价于哪三个注解的组合？
9. MOP 的方法调用链大致包含哪些环节？`methodMissing` 在什么时机被触发？
10. trait 与接口的区别是什么？trait 为什么可以有状态？
11. `@Grab` 的作用是什么？为什么生产项目更推荐 Gradle/Maven？
12. 用 `MarkupBuilder` 与 `JsonBuilder` 分别适合什么场景？
13. Spock 中 `given/when/then` 与 `expect/where` 分别适合什么测试风格？
14. 为什么说闭包里的 `return` 容易踩坑？如何避免？
15. 列举三种提升 Groovy 热点代码性能的做法。
