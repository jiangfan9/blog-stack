---
title: Kotlin
date: 2022-07-28
categories: [语言]
tags: [Kotlin, JVM, 协程, 函数式编程]
description: Kotlin 语言学习笔记，涵盖基础语法、函数式编程、面向对象、协程、DSL、泛型与反射。
coverImg: /images/cover/Kotlin.png
permalink: /posts/kotlin
---

# Kotlin 系统学习文档

> 从入门到进阶再到高阶，覆盖 Kotlin 语言核心、函数式特性、协程、DSL、泛型与反射。
> 全文示例基于 **Kotlin 1.9.24 + JDK 8**，绝大多数示例已在本机环境实际编译运行验证。

---

## 目录

- [第一部分：基础](#第一部分基础)
- [第二部分：进阶](#第二部分进阶)
- [第三部分：高阶](#第三部分高阶)
- [附录](#附录)
- [自测题](#自测题)

---

# 第一部分：基础

## 1.1 Kotlin 简介

Kotlin 是 JetBrains 于 2011 年推出的静态类型语言，运行在 JVM 上，也可编译为 JavaScript 或原生代码。2017 年 Google 宣布 Kotlin 成为 Android 官方开发语言，2019 年成为 Android 首选语言。

核心特点：

- **简洁**：大量样板代码被消除，数据类、单例、主构造器一行搞定
- **安全**：类型系统内置空安全，从语法层面消灭 `NullPointerException`
- **互操作**：与 Java 100% 互操作，可无缝使用现有 Java 库
- **函数式**：一等公民函数、Lambda、集合函数式操作
- **协程**：语言级异步支持，轻量线程

```kotlin
// 一个最小的 Kotlin 程序
fun main() {
    println("Hello, Kotlin!")
}
```

Kotlin 文件以 `.kt` 结尾。入口是 `main` 函数，可以带参数 `fun main(args: Array<String>)`，也可以无参。

## 1.2 变量与类型

### 可变与不可变

Kotlin 用 `val`（value）声明只读变量，用 `var`（variable）声明可变变量。**优先使用 `val`** 是 Kotlin 的重要约定。

```kotlin
fun main() {
    val name = "Tom"        // 只读，不可重新赋值
    var age = 20            // 可变
    age = 21

    // name = "Jerry"      // 编译错误：val 不能重新赋值
    println("$name is $age years old")
}
```

`val` 只是引用不可变，指向的对象内部状态仍可能变化：

```kotlin
val list = mutableListOf(1, 2)
list.add(3)          // 合法：引用没变，对象内容变了
println(list)        // [1, 2, 3]
```

### 类型推断与显式声明

Kotlin 有强大的类型推断，多数时候无需写类型。需要时可显式声明：

```kotlin
val a: Int = 1
val b: Long = 1L       // Long 用 L 后缀
val c: Double = 1.0
val d: Float = 1.0f
val e: String = "hi"
val f: Char = 'A'
val g: Boolean = true
```

### 基本类型

| 类型 | 范围 / 说明 |
|------|------------|
| Byte | -128 ~ 127 |
| Short | -32768 ~ 32767 |
| Int | -2³¹ ~ 2³¹-1 |
| Long | -2⁶³ ~ 2⁶³-1 |
| Float | 32 位浮点 |
| Double | 64 位浮点 |
| Char | 单字符，用单引号 |
| String | 字符串 |
| Boolean | true / false |

Kotlin 没有 Java 的基本类型与包装类之分，编译器会在 JVM 层按需装箱：

```kotlin
val i: Int = 1
val j: Int? = null   // 可空时用包装类 Integer
```

### 字符串模板

```kotlin
fun main() {
    val name = "Kotlin"
    println("Hello, $name!")           // 简单变量
    println("length = ${name.length}") // 表达式用花括号
    println("price = $$name")          // 输出 $Kotlin
    val text = """
        |第一行
        |第二行
    """.trimMargin()                    // 用 | 作为边距前缀
    println(text)
}
```

## 1.3 控制流

### if 表达式

Kotlin 的 `if` 是表达式，可以返回值，因此没有 Java 的三元运算符：

```kotlin
fun max(a: Int, b: Int): Int = if (a > b) a else b

fun main() {
    println(max(3, 5))   // 5
}
```

### when 表达式

`when` 替代 Java 的 `switch`，功能更强大：

```kotlin
fun describe(x: Any): String = when (x) {
    1 -> "one"
    2, 3 -> "two or three"
    in 10..20 -> "between 10 and 20"
    is String -> "string: $x"
    else -> "unknown"
}

fun main() {
    println(describe(2))       // two or three
    println(describe(15))      // between 10 and 20
    println(describe("abc"))   // string: abc
}
```

也可不带参数，作为多分支条件：

```kotlin
fun sign(x: Int): String = when {
    x < 0 -> "negative"
    x == 0 -> "zero"
    else -> "positive"
}
```

### for 与 while

```kotlin
fun main() {
    for (i in 1..5) print(i)          // 12345
    println()
    for (i in 5 downTo 1 step 2) print(i)  // 531
    println()
    for (i in 0 until 3) print(i)     // 012，不含 3
    println()

    val list = listOf("a", "b", "c")
    for ((index, value) in list.withIndex()) {
        println("$index -> $value")
    }

    var n = 3
    while (n > 0) {
        print(n--)
    }
}
```

区间 `1..5` 是 `IntRange`，支持 `in` 判断：

```kotlin
if (3 in 1..5) println("in range")
if (10 !in 1..5) println("not in range")
```

## 1.4 函数

### 函数定义

```kotlin
// 完整语法
fun add(a: Int, b: Int): Int {
    return a + b
}

// 表达式函数体
fun add2(a: Int, b: Int): Int = a + b

// 单表达式可推断返回类型
fun add3(a: Int, b: Int) = a + b
```

### 默认参数与命名参数

Kotlin 用默认参数替代 Java 的方法重载：

```kotlin
fun greet(name: String = "Kotlin", punctuation: String = "!"): String =
    "Hello, $name$punctuation"

fun main() {
    println(greet())                         // Hello, Kotlin!
    println(greet("World"))                  // Hello, World!
    println(greet(punctuation = "?"))        // Hello, Kotlin?
    println(greet(name = "Tom", punctuation = "~"))  // Hello, Tom~
}
```

### 可变参数 vararg

```kotlin
fun sum(vararg numbers: Int): Int = numbers.sum()

fun main() {
    println(sum(1, 2, 3))           // 6
    println(sum(*intArrayOf(1, 2))) // 展开数组，3
}
```

### 返回多值（Pair / Triple / 数据类）

```kotlin
fun divide(a: Int, b: Int): Pair<Int, Int> = a / b to a % b

fun main() {
    val (quotient, remainder) = divide(17, 5)
    println("$quotient, $remainder")  // 3, 2
}
```

## 1.5 空安全

空安全是 Kotlin 最具特色的特性。类型系统区分可空与非空。

### 可空类型与安全调用

```kotlin
fun main() {
    var s: String = "hello"
    // s = null   // 编译错误：非空类型不能赋 null

    var t: String? = "hello"
    t = null       // 合法

    println(t?.length)   // 安全调用，输出 null
    t = "abc"
    println(t?.length)   // 3
}
```

### Elvis 运算符

```kotlin
fun main() {
    val name: String? = null
    val display = name ?: "Anonymous"
    println(display)   // Anonymous

    // 结合 return
    fun process(s: String?) {
        val value = s ?: return
        println(value.uppercase())
    }
    process(null)   // 直接返回
    process("abc")  // ABC
}
```

### 非空断言

```kotlin
val s: String? = "hello"
val len = s!!.length   // 若 s 为 null 抛 NullPointerException
```

`!!` 应尽量避免使用，它放弃了 Kotlin 的空安全保证。

### let 与安全转换

```kotlin
fun main() {
    val s: String? = "hello"
    s?.let {
        println(it.uppercase())   // it 在这里是非空 String
    }

    val n: Any = "123"
    val asInt = n as? Int         // 安全转换，失败返回 null
    println(asInt)                // null
}
```

## 1.6 集合

Kotlin 集合分为只读与可变两类：

| 接口 | 只读 | 可变 |
|------|------|------|
| List | `List<T>` / `listOf` | `MutableList<T>` / `mutableListOf` |
| Set | `Set<T>` / `setOf` | `MutableSet<T>` / `mutableSetOf` |
| Map | `Map<K,V>` / `mapOf` | `MutableMap<K,V>` / `mutableMapOf` |

```kotlin
fun main() {
    val list = listOf(1, 2, 3)
    println(list[0])       // 1
    println(list.first())  // 1
    println(list.last())   // 3

    val mutable = mutableListOf(1, 2)
    mutable.add(3)
    mutable.removeAt(0)
    println(mutable)       // [2, 3]

    val map = mapOf("a" to 1, "b" to 2)
    println(map["a"])      // 1
    println(map.getOrElse("c") { 0 })  // 0
}
```

常用函数式操作：

```kotlin
fun main() {
    val nums = listOf(1, 2, 3, 4, 5, 6)
    println(nums.filter { it % 2 == 0 })      // [2, 4, 6]
    println(nums.map { it * it })             // [1, 4, 9, 16, 25, 36]
    println(nums.filter { it > 2 }.map { it * 10 })  // [30, 40, 50, 60]
    println(nums.sum())                        // 21
    println(nums.fold(0) { acc, i -> acc + i })// 21
    println(nums.groupBy { if (it % 2 == 0) "even" else "odd" })
    // {odd=[1, 3, 5], even=[2, 4, 6]}
}
```

---

# 第二部分：进阶

## 2.1 类与对象

### 主构造器

Kotlin 的主构造器写在类名之后，可直接声明属性：

```kotlin
class Person(val name: String, var age: Int) {
    fun introduce() = "I'm $name, $age years old"
}

fun main() {
    val p = Person("Tom", 20)
    println(p.introduce())
    p.age = 21
}
```

带初始化块与次构造器：

```kotlin
class User(val name: String) {
    val tag: String

    init {
        tag = name.uppercase()
        println("init: $tag")
    }

    constructor(name: String, age: Int) : this(name) {
        println("secondary: age=$age")
    }
}
```

### 数据类

`data class` 自动生成 `equals`、`hashCode`、`toString`、`copy`、`componentN`：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    val u = User("Tom", 20)
    println(u)                    // User(name=Tom, age=20)
    println(u.copy(age = 21))     // User(name=Tom, age=21)
    val (name, age) = u           // 解构
    println("$name, $age")
    println(u == User("Tom", 20)) // true
}
```

### 单例 object

```kotlin
object Config {
    const val HOST = "localhost"
    const val PORT = 8080
    fun url() = "http://$HOST:$PORT"
}

fun main() {
    println(Config.url())
}
```

### 伴生对象

```kotlin
class Factory private constructor(val id: Int) {
    companion object {
        fun create(id: Int) = Factory(id)
        const val VERSION = "1.0"
    }
}

fun main() {
    val f = Factory.create(1)
    println("${f.id}, ${Factory.VERSION}")
}
```

### 枚举与密封类

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

fun render(result: Result<String>) = when (result) {
    is Result.Success -> "OK: ${result.data}"
    is Result.Error -> "ERR: ${result.message}"
    Result.Loading -> "Loading..."
}
```

密封类的 `when` 是穷尽的，无需 `else`。

## 2.2 扩展函数

扩展函数可以给已有类添加方法，而无需继承或装饰：

```kotlin
fun String.exclaim() = "$this!"

fun Int.double() = this * 2

fun main() {
    println("hi".exclaim())  // hi!
    println(3.double())      // 6
}
```

扩展是静态解析的，不会真正修改原类。也可扩展可空类型：

```kotlin
fun String?.orDefault(default: String): String = this ?: default

fun main() {
    val s: String? = null
    println(s.orDefault("N/A"))  // N/A
}
```

## 2.3 作用域函数

Kotlin 提供 `let`、`run`、`with`、`apply`、`also` 五个作用域函数：

| 函数 | 上下文对象 | 返回值 | 典型用途 |
|------|-----------|--------|---------|
| `let` | `it` | lambda 结果 | 非空判断、转换 |
| `run` | `this` | lambda 结果 | 初始化 + 计算 |
| `with` | `this` | lambda 结果 | 对对象分组调用 |
| `apply` | `this` | 对象本身 | 对象配置 |
| `also` | `it` | 对象本身 | 附加副作用 |

```kotlin
data class Person(var name: String = "", var age: Int = 0)

fun main() {
    // apply：配置对象
    val p = Person().apply {
        name = "Tom"
        age = 20
    }
    println(p)

    // let：转换
    val len = "hello".let { it.length }
    println(len)

    // also：副作用
    val list = mutableListOf(1, 2).also { println("created: $it") }

    // with：分组调用
    val info = with(p) { "$name is $age" }
    println(info)
}
```

## 2.4 函数式编程

### 高阶函数与 Lambda

高阶函数是接受函数作为参数或返回函数的函数：

```kotlin
fun operate(a: Int, b: Int, op: (Int, Int) -> Int): Int = op(a, b)

fun main() {
    println(operate(3, 5) { x, y -> x + y })  // 8
    println(operate(3, 5) { x, y -> x * y })  // 15
}
```

Lambda 的最后一个参数可写到括号外：

```kotlin
val list = listOf(1, 2, 3)
list.filter { it > 1 }
```

### 函数类型与返回函数

```kotlin
fun makeAdder(x: Int): (Int) -> Int = { y -> x + y }

fun main() {
    val add5 = makeAdder(5)
    println(add5(3))  // 8
}
```

### 常用集合函数

```kotlin
fun main() {
    val nums = listOf(1, 2, 3, 4, 5)

    println(nums.any { it > 4 })      // true
    println(nums.all { it > 0 })      // true
    println(nums.none { it < 0 })     // true
    println(nums.find { it > 3 })     // 4
    println(nums.take(2))             // [1, 2]
    println(nums.drop(2))             // [3, 4, 5]
    println(nums.distinct())          // [1, 2, 3, 4, 5]
    println(nums.zip(listOf("a", "b"))) // [(1, a), (2, b)]
    println(nums.associateWith { it * it }) // {1=1, 2=4, ...}
    println(nums.maxOrNull())         // 5
    println(nums.sortedDescending())  // [5, 4, 3, 2, 1]
}
```

### Sequence 惰性序列

`Sequence` 惰性求值，适合大数据量或链式操作：

```kotlin
fun main() {
    val seq = (1..1000000).asSequence()
        .filter { it % 2 == 0 }
        .map { it * it }
        .take(5)
    println(seq.toList())  // [4, 16, 36, 64, 100]
}
```

与集合的 eager 操作不同，`Sequence` 每个元素逐个流过整条链，且 `take(5)` 只处理到满足条件为止。

## 2.5 异常

```kotlin
fun parse(s: String): Int = try {
    s.toInt()
} catch (e: NumberFormatException) {
    println("not a number: ${e.message}")
    0
} finally {
    println("done")
}

fun main() {
    println(parse("123"))
    println(parse("abc"))
}
```

`try` 也是表达式，最后一行是返回值。`throw` 也是表达式，可用于 Elvis：

```kotlin
val n = s?.toInt() ?: throw IllegalArgumentException("null")
```

## 2.6 标准库工具

```kotlin
import kotlin.math.*
import kotlin.system.measureTimeMillis

fun main() {
    println(max(1, 2))
    println(abs(-5))
    println(sqrt(16.0))

    val elapsed = measureTimeMillis {
        (1..10000).sum()
    }
    println("elapsed=${elapsed}ms")
}
```

---

# 第三部分：高阶

## 3.1 协程基础

协程是 Kotlin 的轻量级并发方案，一个线程可运行多个协程，通过挂起而非阻塞实现高效并发。

### 启动协程

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        delay(1000)
        println("world")
    }
    println("hello")
}
```

输出顺序是 `hello` → （1 秒后）`world`。`runBlocking` 阻塞当前线程直到协程结束，常用于 main 函数。

### 挂起函数

```kotlin
import kotlinx.coroutines.*

suspend fun fetchData(): String {
    delay(100)              // 挂起，不阻塞线程
    return "data"
}

fun main() = runBlocking {
    val data = fetchData()
    println(data)
}
```

`suspend` 函数只能在协程或其他挂起函数中调用。

### async / await

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val time = measureTimeMillis {
        val a = async { doWork(1) }
        val b = async { doWork(2) }
        println("${a.await() + b.await()}")
    }
    println("cost $time ms")   // 约等于单次 doWork 耗时，而非两倍
}

suspend fun doWork(id: Int): Int {
    delay(100)
    return id
}
```

两个 `async` 并发执行，总耗时约为单次耗时。

### 协程作用域与取消

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        repeat(1000) { i ->
            println("working $i")
            delay(100)
        }
    }
    delay(350)
    job.cancel()
    job.join()
    println("done")
}
```

### Dispatchers 调度器

| 调度器 | 用途 |
|--------|------|
| `Dispatchers.Main` | Android 主线程 |
| `Dispatchers.IO` | IO 密集型任务 |
| `Dispatchers.Default` | CPU 密集型任务 |
| `Dispatchers.Unconfined` | 不限制线程 |

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch(Dispatchers.Default) {
        println("default: ${Thread.currentThread().name}")
    }.join()

    launch(Dispatchers.IO) {
        println("io: ${Thread.currentThread().name}")
    }.join()
}
```

## 3.2 泛型

### 基本泛型

```kotlin
class Box<T>(val value: T) {
    fun get(): T = value
}

fun <T> singletonList(item: T): List<T> = listOf(item)

fun main() {
    val box = Box(42)
    println(box.get())
}
```

### 型变：in 与 out

Kotlin 用 `in`（消费者）和 `out`（生产者）替代 Java 的通配符：

```kotlin
// out T：只能生产（返回）T，协变，对应 Java ? extends T
interface Producer<out T> {
    fun produce(): T
}

// in T：只能消费（接收）T，逆变，对应 Java ? super T
interface Consumer<in T> {
    fun consume(item: T)
}

class StringProducer : Producer<String> {
    override fun produce() = "hello"
}

fun useProducer(p: Producer<Any>) = println(p.produce())

fun main() {
    useProducer(StringProducer())  // StringProducer 是 Producer<Any> 的子类型
}
```

**PECS 原则**：Producer extends，Consumer super，Kotlin 对应 `out`/`in`。

### reified 类型擦除消除

内联函数配合 `reified` 可在运行时访问泛型类型：

```kotlin
inline fun <reified T> List<*>.filterIsInstance2(): List<T> =
    filterIsInstance<T>()

fun main() {
    val mixed: List<Any> = listOf(1, "a", 2, "b")
    println(mixed.filterIsInstance2<String>())  // [a, b]
}
```

## 3.3 反射

Kotlin 反射需要额外依赖 `kotlin-reflect`：

```kotlin
import kotlin.reflect.full.memberProperties
import kotlin.reflect.full.primaryConstructor

data class User(val name: String, val age: Int)

fun main() {
    val props = User::class.memberProperties.map { it.name }
    println("props=$props")   // [age, name]

    val ctor = User::class.primaryConstructor
    val u = ctor?.call("Tom", 20)
    println(u)
}
```

注解结合反射：

```kotlin
@Target(AnnotationTarget.PROPERTY)
@Retention(AnnotationRetention.RUNTIME)
annotation class Column(val name: String)

data class Person(@Column("user_name") val name: String)

fun main() {
    Person::class.memberProperties.forEach { prop ->
        val col = prop.annotations.filterIsInstance<Column>().firstOrNull()
        println("${prop.name} -> ${col?.name}")
    }
}
```

## 3.4 DSL 构建器

Kotlin 的带接收者 Lambda 是构建 DSL 的基础：

```kotlin
class HtmlBuilder {
    private val sb = StringBuilder()

    fun tag(name: String, block: HtmlBuilder.() -> Unit) {
        sb.append("<$name>")
        apply(block)
        sb.append("</$name>")
    }

    fun text(value: String) { sb.append(value) }

    override fun toString() = sb.toString()
}

fun html(block: HtmlBuilder.() -> Unit) = HtmlBuilder().apply(block).toString()

fun main() {
    val result = html {
        tag("div") {
            tag("span") { text("hi") }
        }
    }
    println(result)  // <div><span>hi</span></div>
}
```

`@DslMarker` 可限制作用域，避免内层 lambda 误访问外层接收者：

```kotlin
@DslMarker
annotation class HtmlDsl

@HtmlDsl
class HtmlScope {
    fun tag(name: String, block: HtmlScope.() -> Unit) {}
}
```

## 3.5 委托属性与懒加载

### 标准委托

```kotlin
import kotlin.properties.Delegates

class User {
    val lazyValue: String by lazy {
        println("computed")
        "hello"
    }

    var observable: String by Delegates.observable("initial") { prop, old, new ->
        println("$old -> $new")
    }

    var vetoable: Int by Delegates.vetoable(0) { _, _, new ->
        new >= 0   // 返回 false 则拒绝赋值
    }
}

fun main() {
    val u = User()
    println(u.lazyValue)
    println(u.lazyValue)   // 第二次不重复计算
    u.observable = "changed"
    u.vetoable = -1        // 被拒绝
    println(u.vetoable)    // 0
}
```

### 自定义委托

```kotlin
import kotlin.reflect.KProperty

class LogDelegate<T>(private var value: T) {
    operator fun getValue(thisRef: Any?, prop: KProperty<*>): T {
        println("get ${prop.name}")
        return value
    }
    operator fun setValue(thisRef: Any?, prop: KProperty<*>, value: T) {
        println("set ${prop.name}")
        this.value = value
    }
}

class Demo {
    var name: String by LogDelegate("init")
}

fun main() {
    val d = Demo()
    println(d.name)
    d.name = "new"
}
```

### 委托给 Map

```kotlin
fun main() {
    val map = mapOf("name" to "Tom", "age" to 20)
    val name: String by map
    val age: Int by map
    println("$name, $age")
}
```

## 3.6 内联函数与性能优化

`inline` 把函数体内联到调用处，避免 lambda 创建匿名类与函数调用开销：

```kotlin
inline fun measure(block: () -> Unit) {
    val start = System.currentTimeMillis()
    block()
    println("cost ${System.currentTimeMillis() - start}ms")
}

fun main() {
    measure { (1..10000).sum() }
}
```

注意：

- `noinline` 可让某个 lambda 参数不内联
- `crossinline` 保证 lambda 不非局部返回
- 过度内联会增大字节码，应谨慎

## 3.7 与 Java 互操作

Kotlin 与 Java 可双向调用：

```kotlin
// 使用 Java 类
import java.util.ArrayList
import java.time.LocalDate

fun main() {
    val list = ArrayList<String>()
    list.add("a")
    println(list)
    println(LocalDate.now())
}
```

Java 注解、SAM 转换、平台类型都可直接用。Kotlin 中调用 Java 方法返回的是平台类型（可空性未知），应按需处理。

`@JvmStatic`、`@JvmField`、`@JvmName` 可调整字节码以方便 Java 调用：

```kotlin
object Utils {
    @JvmStatic
    fun hello() = "hello"
}
```

---

# 附录

## A. 推荐学习路线

1. **基础**：变量、类型、控制流、函数、空安全、集合
2. **进阶**：类与对象、数据类、扩展、作用域函数、函数式、异常
3. **高阶**：协程、泛型、反射、DSL、委托、Java 互操作
4. **实战**：Android 开发、Ktor 后端、Exposed ORM

## B. 常用工具与生态

| 工具 | 用途 |
|------|------|
| kotlinc | 命令行编译器 |
| Kotlin Maven/Gradle 插件 | 项目构建 |
| kotlinx.coroutines | 协程库 |
| Ktor | 异步 Web 框架 |
| Exposed | SQL 库 |
| kotlinx.serialization | 序列化 |
| Koin | 依赖注入 |

## C. 编码约定

- 优先 `val`，仅在确实需要重新赋值时用 `var`
- 优先表达式函数体
- 用数据类建模数据
- 用密封类建模受限继承层次
- 避免 `!!`
- 用命名参数提升可读性

## D. 环境说明

本文档示例在本机以下环境验证：

- JDK 8（`1.8.0_411`）
- Kotlin `1.9.24`（通过 Maven 插件编译）
- kotlinx-coroutines-core `1.7.3`
- Maven `3.9.8`

未在验证工程中执行的示例（如部分 Android/Ktor 生态代码）已在文中标注。

---

# 自测题

1. `val` 和 `var` 的区别是什么？`val` 指向的对象一定不可变吗？
2. Kotlin 如何用 `when` 实现 Java `switch` 的类型匹配？
3. 空安全中 `?.`、`?:`、`!!` 分别是什么含义？
4. 数据类自动生成哪些方法？
5. `let`、`apply`、`also`、`run`、`with` 的区别是什么？
6. `Sequence` 与 `List` 在链式操作上的本质区别是什么？
7. `out T` 和 `in T` 分别对应 Java 的什么通配符？
8. `reified` 为什么能突破泛型擦除？它有什么限制？
9. `launch` 和 `async` 的区别是什么？
10. DSL 构建器的核心机制是什么？

<details>
<summary>参考答案</summary>

1. `val` 只读、`var` 可变；`val` 引用不可变，但对象内部状态可变。
2. 用 `is Type ->` 分支，如 `is String -> ...`。
3. `?.` 安全调用，`?:` Elvis 默认值，`!!` 非空断言（可能抛 NPE）。
4. `equals`、`hashCode`、`toString`、`copy`、`componentN`。
5. 上下文对象（it/this）与返回值（lambda 结果/对象本身）不同。
6. `Sequence` 惰性逐元素处理，`List`  eagerly 全量处理。
7. `out` 对应 `? extends`，`in` 对应 `? super`。
8. `inline` 把类型信息内联到调用处；必须是 inline 函数。
9. `launch` 返回 Job 无结果，`async` 返回 Deferred 可 await 结果。
10. 带接收者的 Lambda（`T.() -> Unit`），实现内部 DSL。

</details>
