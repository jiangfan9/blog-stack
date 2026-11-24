---
title: Groovy
date: 2024-07-23
categories: [后端开发]
tags: [Groovy, JVM]
description: Groovy 语言入门笔记：动态特性、闭包与 JVM 生态中的实践。
coverImg: /images/cover-2.svg
permalink: /posts/groovy
---

## Groovy简介

Groovy是用于Java虚拟机的一种敏捷的动态语言，它是一种成熟的面向对象的编程语言，既可以用于面向对象编程，又可以作为纯粹的脚本语言。使用该语言不必编写过多的代码，同时又具有闭包和动态语言种的其他特性。

Groovy是JVM的一个替代语言（Groovy可以在Java平台上进行Java编程），使用方式基本与使用Java代码的方式相同，该语言特别适合与Spring的动态语言支持一起使用，设计时充分考虑了Java集成，这使Groovy与Java代码的互操作很容易。

Groovy的特点：

- 易于掌握
- 遵循Java语义
- 动态语言
- 扩展了JDK

示例：

Java中的for循环：

~~~java
for(int i = 0; i &lt; 10; i++){
    ...
}
~~~

Groovy改写如下：

~~~groovy
10.times{
    ...
}
~~~

在使用Groovy编程时，Java有的Groovy几乎都有。Groovy同样扩展了java.lang.Object类，Groovy类就是Java类，Java语义都保留下来了，所以使用Groovy编写的表达式和语句，对于Java程序员而言，理解它没有任何障碍。

选择Groovy的另一个原因是它是动态语言。同时动态语言还包括Python、Javascript等。所谓动态语言是指在运行时扩展程序，包括修改类型、行为、对象结构。静态语言在编译时做的事情，动态语言在运行时做。

## 在windows下安装Groovy

进入https://groovy.apache.org/download.html

点击**download**按钮，开始下载，下载完成后解压文件。

**配置环境变量**

打开windows下环境变量窗口，新建一个名为GROOVY_HOME的环境变量，变量的值是解压后Groovy sdk的目录。

编辑Path变量，在Path变量种添加 **%GROOVY_HOME%\bin**

完成后点击确定。

按下 win+r 输入cmd，输入：

~~~bat
groovy -v
~~~

如果出现以下版本信息，则证明安装成功。

~~~bat
Groovy Version: 4.0.22 JVM: 1.8.0_411 Vendor: Oracle Corporation OS: Windows 11
~~~

## GDK介绍

Groovy虽然支持Java的语法但它并没有强迫我们学习新的类和库，而是通过向JDK中各种类添加方法，所以说Groovy扩展了JDK，这些扩展称之为GDK（Groovy JDK）。

Java中可以使用java.lang.process与系统进程进行交互，例如，我们在代码中调用git的help命令并把help的内容打印出来，用Java的实现代码如下：

~~~java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class ExecuteProcess {
    public static void main(String[] args) {
        try {
            // 获取Process实例
            Process process = Runtime.getRuntime().exec("git help");
            // 读取输入流
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
~~~

Groovy通过在java.lang.String类上添加一个execute()方法，使这一切变得很简单。

~~~groovy
println "git help".execute().text
~~~

## 数据类型

### 字符串

Groovy允许实例化java.lang.String类来定义一个字符串对象，同样地，也可以通过实例化groovy.lang.GString类定义一个字符串对象，两者可以混合使用。

例如，用单引号引起来的字符串

~~~groovy
'a single-quoted string'
~~~

三个单引号引起来的字符串

~~~groovy
'''a triple-single-quoted string'''
~~~

~~~groovy
def aMultilineString = '''line one
line two
line three
'''
~~~

说明：用单引号或三个单引号定义的字符串不支持混合编程

双引号引起来的字符串

~~~groovy
"a double-quoted string"
~~~

在Groovy中使用${}作为占位符，占位符里面代表一个表达式的值，例如：

~~~groovy
def name = 'Guillaume'
def greeting = "Hello ${name}"

assert greeting.toString() == "Hello Guillaume"
~~~

三个双引号引起来的字符串

用"""引号引起来的字符串行为上和双引号引起来的字符串是一样的，不同之处在于它代表多行字符串，就像三个单引号定义的字符串，例如：

~~~groovy
def name = 'Groovy'
def template = """hello ${name}
"""
println template
~~~

**字符串总结**

| 字符串名称   | 语法      | 是否可以混用 | 是否多行 | 转义字符 |
| ------------ | --------- | ------------ | -------- | -------- |
| 单引号的     | '...'     |              |          | \        |
| 三个单引号的 | '''...''' |              | √        | \        |
| 双引号的     | "..."     | √            |          | \        |
| 三个双引号的 | """...""" | √            | √        | \        |
| 斜线的       | /.../     | √            | √        | \        |

### 数值类型

Groovy的数值类型包括整数型（Integer）和小数型（decimal）两种，整型又包括以下几种：

- byte
- char
- short
- int
- long
- java.math.BigInteger

#### 整数型

~~~groovy
//基本类型
byte b = 1
char c = 2
short s = 3
int i = 4
long l = 5

//无限精度型
BigInteger bi = 6
~~~

使用def关键字定义数值类型变量

~~~groovy
// 整型
def a = 1
assert a instanceof Integer

// 定义整型最大值 Integer.MAX_VALUE
def b = 2147483647
assert b instanceof Integer

//定义整型最大值+1，Integer.MAX_VALUE + 1
def c = 2147483648
assert c instanceof Long

//定义long型最大值 Long.MAX_VALUE
def d = 9223372036854775807
assert d instanceof Long

//定义long型最大值+1，Long.MAX_VALUE + 1
def e = 9223372036854775808
assert e instanceof BigInteger
~~~

#### 小数型

以下变量都属于小数型

~~~groovy
// 基本类型
float f = 1.234
double d = 2.345

//带有精度的小数类型
BigDecimal bd = 3.456
~~~

可以使用科学计数法表示相应类型的数值，例如：

~~~groovy
assert 1e3 == 1_000.0
assert 2E4 == 20_000.0
assert 3e+1 == 30.0
assert 4E-2 == 0.04
assert 5e-1 == 0.5
~~~

Groovy支持下划线对数字进行分割，使得数字更容易识别

~~~groovy
long creditCardNumber = 1234_5678_9012_3456L
~~~

各种类型数值的后缀

| 类型       | 后缀    |
| ---------- | ------- |
| BigInteger | G \| g  |
| Long       | L \| l  |
| Integer    | \| \| i |
| BigDecimal | G \| g  |
| Double     | D \| d  |
| Float      | F \| f  |

例如：

~~~groovy
assert 42i = Integer.valueOf('42')
~~~

不同类型数值进行算术运算的规则

对于二元运算符，两个不同类型的数值进行运算后他们的结果按照以下规则确定

- 对于byte、char、short、int这几种类型之间运算的结果为int
- 涉及long与byte、char、short、int之间运算的结果为long
- 涉及BigInteger与其他类型数值之间的运算结果为BigInteger
- BigDecimal与byte、char、short、int之间的运算结果为BigDecimal
- float、double与BigDecimal之间的运算结果为double
- 两个BigDecimal之间的运算结果为BigDecimal

### 集合类型

Groovy没有自己的集合类型，它的List类型实际上用的就是JDK中的java.util.List包，当我们定义一个集合对象，Groovy默认采用java.util.ArrayList类型。

Groovy使用 **,** 把集合中的元素分隔开，外面用[]进行包裹，下面是定义集合对象的例子：

~~~groovy
def numbers = [1,2,3]
assert numbers instanceof List
assert numbers.size == 3
~~~

也可以在集合中放置不同类型的元素，例如：

~~~groovy
def heterogeneous = [1,"a",true]
~~~

默认定义的集合对象属于java.util.ArrayList类，也可以用as运算符，强制定义List接口的其他实现类的对象，例如：

~~~groovy
def arrayList = [1,2,3]
assert arrayList instanceof ArrayList

def linkedList = [1,2,3] as LinkedList
assert linkedList instanceof LinkedList

LinkedList otherLinked = [1,2,3]
assert otherLinked instanceof LinkedList
~~~

访问List集合中的元素使用 **[]** 下标运算符，其中的数值可以是正值也可以是负值，例如：

~~~groovy
def letters = ['a','b','c','d']

assert letters[0] == 'a'
assert letters[1] == 'b'

assert letters[-1] == 'd'
assert letters[-2] == 'c'

//使用左移运算符，在集合末尾添加元素
letters &lt;&lt; 'e'
assert letters[4] == 'e'
assert letters[-1] == 'e'
~~~

Groovy可以定义多维集合，例如：

~~~groovy
def multi = [[0,1],[2,3]]
// 取第一个集合中的第0个元素
assert multi[1][0] == 2
~~~

### 数组

Groovy中数组和集合的表示方式相同，也就是说Groovy复用list的表示形式来表示数组，但必须显式的声明数组的类型，例如：

~~~groovy
String[] arrStr = ['Ananas','Banana','kiwi']
// true
assert arrStr instanceof String[]
// true
assert !(arrStr instanceof List)
~~~

使用as运算符，强制转为要定义的类型

~~~groovy
def numArr = [1,2,3] as int[]
assert numArr instanceof int[]
~~~

也可以定义多维数组

~~~groovy
//定义一个二维数组，并指定元素个数
def matrix3 = new Integer[2][3]

// 声明时不指定数组元素个数
Integer[][] matrix2
matrix2 = [[1,2],[3,4]]
assert matrix2 instanceof Integer[][]
~~~

访问数组元素时按照和list一样的方式，使用下标运算符 **[]**，例如：

~~~groovy
String[] names = ['a','b','c','d']

//访问第一个元素
assert names[0] == 'a'

//给第二个元素重新赋值
names[2] = 'cc'
assert names[2] == 'cc'
~~~

### map类型

Groovy的map对象就是LinkedHashMap的实例

Groovy使用中括号定义一个map，map中的 **key/value对** 用 **逗号** 分割，例如：

~~~groovy
def colors = [red: '#FF0000',green: '#00FF00', blue: '#0000FF']

assert colors['red'] == '#FF0000'
assert colors.green == '#00FF00'

// 使用[]增加一个新的key/value
colors['pink'] = '#FF00FF'
// 也可以使用.新增一个key/value
colors.yellow = '#FFFF00'
~~~

说明：

Groovy定义的map对象实际上是java.util.LinkedHashMap类的实例

key值不光可以用string也可以用其他数据类型，比如，整型

~~~groovy
def numbers = [1: 'one',2: 'two']
~~~

下面的例子中用key这个变量定义了一个key，它的值为name，但Groovy会认为，map中的key是变量本身而不是赋予它的值。

~~~groovy
def key = 'name'
def person = [key: 'kitty']

assert !person.containsKey('name')
assert person.containsKey('key')
~~~

## 运算符

### 算术运算符

| 运算符 | 作用 | 备注                          |
| ------ | ---- | ----------------------------- |
| +      | 加   | 同时也是一元运算符，如：+4    |
| -      | 减   | 同时也是一元运算符，如：-2    |
| *      | 乘   |                               |
| /      | 除   | **intdiv()** 专门用于整数相除 |
| %      | 取余 |                               |
| **     | 次幂 | 例如：2**3=8                  |

### 赋值运算符

- +=
- -=
- *=
- /=
- %=
- **=

~~~groovy
def a = 4
a += 3

assert a == 7
~~~

### 关系运算符

| 运算符 | 作用       |
| ------ | ---------- |
| ==     | 相等       |
| !=     | 不等       |
| &lt;      | 小于       |
| &lt;=     | 小于等于   |
| >      | 大于       |
| >=     | 大于等于   |
| ===    | 完全等于   |
| !==    | 不完全等于 |

~~~groovy
assert 1 + 2 == 3
assert 3 != 4

assert -2 &lt; 3
assert 2 &lt;= 2
assert 3 &lt;= 4

assert 5 > 1
assert 5 >= -2
~~~

下面是groovy判断 **===**（全等）和 **!==** （不全等）运算符的示例：

~~~groovy
import groovy.transform.EqualsAndHashCode

@EqualsAndHashCode
class Creature {
    String type
}
def cat = new Creature(type: 'cat')
def copyCat = cat
def lion = new Creature(type: 'cat')

assert cat.is(copyCat)
assert cat === copyCat
assert cat !== lion
~~~

### 逻辑运算符

Groovy提供了三种逻辑运算符用于布尔表达式，分别是：

- &&: 逻辑与
- ||：逻辑或
- !：逻辑非

例如：

~~~groovy
assert true && true
assert true || false
assert !false
~~~

注：逻辑非运算符 **!** 优先级高于逻辑与 **&&**，逻辑与运算符 **&&** 优先级高于逻辑或 **||** ，例如：

~~~groovy
assert (!false && false) === false
assert true || true && false
~~~

**短路运算规则**

逻辑与 **&&** 和逻辑 **||**都支持短路运算，对于 **||**只要左边的操作数为true，不需要再判断右边的操作数就知道整个表达式的结果为true，对于 **&&** 只要左边的操作数为false，不需要再判断右边的操作数就知道整个表达式的结果为false。 

### 位运算符和位移运算符

Groovy的位运算符如下：

- &：按位与
- |：按位或
- ^：按位异或
- ~：按位取反

位运算符的操作数为整型数值，包括byte、short、int、long、BigInteger。如果操作数的类型是BigInteger那么返回结果的类型也是BigInteger;如果操作数是int型，返回结果也是int型，如果操作数是long型，返回结果也是long型。

Groovy提供了三种位移运算符，分别是：

- &lt;&lt;：左移运算符
- \>\>：右移运算符
- \>\>\>：右移无符号运算符

~~~groovy
assert 12.equals(3 &lt;&lt; 2)
assert 24L.equals(3L &lt;&lt; 3)
assert 48G.equals(3G &lt;&lt; 4)
~~~

### 条件运算符

条件运算符可用于取代 if-else 判断，例如：

~~~groovy
if (string != null && string.length() > 0){
    result = 'Found'
} else {
    result = 'Not Found'
}
~~~

利用条件运算符可以写成如下形式：

~~~groovy
result = (string != null && string.length() > 0) ? 'Found' : 'Not Found'
~~~

从Groovy3.0开始，引入了elvis操作符，也就是条件运算符的简便形式，例如：

~~~groovy
// 正常形式
displayName = user.name ? user.name : 'Anonymous'
// elvis操作符
displayName = user.name ?: 'Anonymous'
~~~

### 对象运算符

**安全导肮运算符（safe navigation operator）**

主要作用为避免出现 **NullPointerException** 异常，如果出现空指针异常，使用安全导航运算符将返回null，而不是抛出异常。例如：

~~~groovy
def person = Person.find {it.id == 345}
def name = person?.name
assert name == null
~~~

**直接访问字段运算符（Direct field access operator）**

使用该运算符可以不用调用get方法而直接获取字段的值，例如：

~~~groovy
class User{
    public final String name
    User(String name){this.name = name}
    String getName(){"Name: $name"}
}
def user = new User('Bob')
assert user.name == 'Name:Bob'
assert user.@name == 'Bob'
~~~

**方法引用运算符（method reference operator）**

方法引用运算符形如两个冒号 **::** ，目的就是调用方法。例如：

~~~groovy
assert 6G == [1G,2G,3G].stream().reduce(0G,BigInteger::add)
~~~

调用BigInteger实例的add方法，给每个元素减0，结果仍然不变。

~~~groovy
import java.util.stream.Collectors
assert [4G,5G,6G] == [1G,2G,3G].stream().map(3G::add).collect(Collectors.toList())
~~~

3G对象属于BigInteger类型，调用它的add方法，给每个元素加3

~~~groovy
import java.util.stream.Collectors

assert [1, 2, 3] == ['1', '2', '3'].stream().map(Integer::new).co
llect(Collectors.toList())
def result = [1, 2, 3].stream().toArray(Integer[]::new)
~~~

第1行代码使用方法引用运算符调用Integer类的构造方法创建Integer类对象，第2行代码同样的，调用数组类的构造方法创建一个数组对象。

### 正则表达式运算符

**~ 规则运算符**

**~** 运算符提供了一种简单的方式来创建一个java.util.regex.Pattern对象，例如：

~~~groovy
import java.util.regex.Pattern

def p = ~/foo/
assert p instanceof Pattern
~~~

**=~ 查找运算符**

**=~** 运算符用于创建一个java.util.regex.Matcher对象，例如：

~~~groovy
//定义一个字符串
def text = "some text to match"
//使用=~运算符创建一个Matcher对象，匹配文本中的match单词
def m = text =~ /match/
~~~

**==~** 匹配运算符

**==~** 运算符和  **=~**  运算符功能相似，只是返回结果不同，前者返回布尔值，后者返回Matcher对象。例如：

~~~groovy
m = text ==~ /match/
assert m instanceof Boolean
if(m){
    throw new RuntimeException("不是Boolean类")
}
~~~

## Groovy程序组成

Groovy提供了两种代码方式，一种是脚本一种是类，代码如下：

~~~Groovy
class Main {
    static void main(String... args) {
        println 'Groovy world!'
    }
}
~~~

与上面代码功能相同的脚本如下：

~~~Groovy
println 'Groovy world!'
~~~

**脚本与类混合**

上面的脚本实由groovy.lang.Script类编译成一个class文件，把脚本代码拷贝到groovy.lang.Script类的run方法进行执行，实际运行的代码形如下面的内容：

~~~Groovy
import org.codehaus.groovy.runtime.InvokerHelper

class Main extends Script{
    def run(){
        println 'Groovy world'
    }
    static void main(String[] args){
        InvokerHelper.runScript(Main,args)
    }
}
~~~

执行的步骤如下：

- Main.class继承Script类
- 把脚本的主体内容复制到run方法内
- 然后自动生成main()方法，最后运行run()

**方法**

可以在脚本中定义方法，例如：

~~~groovy
int fib(int n){
    n &lt; 2 ? 1 : fib(n - 1) + fib(n - 2)
}
assert fib(10) == 89
~~~

创建后的脚本类在编译后会把脚本中的所有方法装配到run方法中，这些对于用户来说都是透明的。

**变量**

在脚本中定义变量无需声明变量的类型，例如：

~~~groovy
int x = 1
int y = 2
assert x + y == 3
~~~

上面的定义与如下代码等同：

~~~groovy
x = 1
y = 2
assert x + y == 3
~~~

这两者在语义上有一些差别，上面的例子中声明的变量属于局部变量，只在run方法内部可见，而下面的无声明变量定义对于其他方法可见，这对于脚本与其他应用程序共享数据就显得很重要了。

## 面向对象

### 类

Groovy类是数据的集合和对该数据进行操作的方法的载体，类的数据和方法用于表示问题域中的一些现实世界对象。Groovy中的类声明了该类定义的对象的状态（数据）和行为。因此，Groovy类描述了该类的实例字段和方法。

下面的示例展示了Groovy类的定义及它的组成：

~~~groovy
class Student {
    int StudentID
    String StudentName

    static void main(String[] args){
        Student student = new Student()
        student.StudentID = 1
        student.StudentName = "Joe"
    }
}
~~~

getter和setter方法

在任何编程语言中，总是使用private关键字隐藏实例成员，通过提供getter和setter方法来相应地设置和获取实例变量的值。例如下面的代码：

~~~groovy
class Student {
    private int studentID
    private String studentName

    int getStudentID() {
        return studentID
    }

    void setStudentID(int studentID) {
        this.studentID = studentID
    }

    String getStudentName() {
        return studentName
    }

    void setStudentName(String studentName) {
        this.studentName = studentName
    }
}
~~~

### 内部类

内部类定义在另一个类中，外层类可以访问内部类，内部类也可以使用外层类的成员变量，即使是私有的，其他类不能访问内部类，内部类的示例如下：

~~~groovy
class Example{
    static void main(String[] args) {
        Outer outer = new Outer();
        outer.name = "Joe"
        outer.callInnerMethod()
    }
}

class Outer {
    String name

    def callInnerMethod(){
        new Inner().methodA()
    }

    class Inner{
        def methodA(){
            print(name)
        }
    }
}
~~~

在上面的例子中我们做了以下工作：

- 创建一个名为Outer的类，它将是我们的外层类
- 在Outer类中定义名为name的字符串
- 在我们的外层类中创建一个内部或嵌套类
- 在内部类中，我们可以访问在Outer类中定义的名称实例成员

### 继承

extends是用于继承类的关键字，我们通过一个示例介绍groovy中如何继承其他类

~~~groovy
class Example{
    static void main(String[] args) {
        Student student = new Student()
        student.studentId = 1
        student.marks1 = 10
        student.name = "Joe"
        print(student.name)
    }
}
class Person {
    public String name
    public Person(){}
}

class Student extends Person{
    int studentId
    int marks1

    public Student(){
        super()
    }
}
~~~

### 抽象类

抽象类表示通用概念，因此它不能被实例化，但可以被继承。抽象类中的抽象方法只有方法的定义而没有方法的实现，它的实现通过继承它的类来完成，定义抽象类通过关键字abstract来声明，抽象方法也是同样的。下面通过一个示例展示定义和使用抽象类：

~~~groovy
class Example {
    static void main(String[] args) {
        Student st = new Student()
        st.studentId = 1
        st.marks1 = 10
        st.name = "Joe"
        println(st.name)
        st.displayMarks()
    }
}
abstract class Person {
    public String name
    public Person(){}
    abstract void displayMarks();
}

class Student extends Person {
    int studentId
    int marks1

    public Student(){
        super()
    }

    @Override
    void displayMarks() {
        println(marks1)
    }
}
~~~

### 接口

接口定义了类需要遵守的规范，接口仅定义需要实现的方法的列表，但是不定义方法实现。接口需要使用interface关键字声明接口，接口的方法总是公开的，在接口中使用受保护或私有方法是一个错误。

~~~groovy
class Example{
    static void main(String[] args) {
        Student st = new Student()
        st.studentId = 1
        st.marks1 = 10
        st.displayMarks()
    }
}

interface Marks {
    void displayMarks();
}

class Student implements Marks{
    int studentId
    int marks1

    @Override
    void displayMarks() {
        println(marks1)
    }
}
~~~

在上面的示例中：

- 创建了一个名为Marks的接口并创建一个名为DisplayMarks的接口方法
- 在Student类中，使用implements关键字来实现接口
- 在实现类中必须为接口中displayMarks方法提供实现

## 闭包的概念及使用

闭包是轻量级、简洁、短小的程序。

Groovy中的闭包完全避免了冗长的代码，而且可以辅助创建轻量级、可复用的代码片段。

通过一个示例来比较传统方式和使用闭包方式的不同

~~~groovy
def sum(n){
    total = 0
    for(int i = 2;i &lt;= n;i += 2){
        total += i
    }
    total
}
println "sum of even numbers from 1 to 10 is ${sum(10)}"
~~~

上述代码运行了一个for循环，在偶数上迭代求和

~~~groovy
def product(n){
    prod = 0
    for(int i = 2;i &lt;= n;i += 2){
        prod *= i
    }
    prod
}
println "prod of even numbers from 1 to 10 is ${product(10)}"
~~~

我们在求和代码的基础上修改一下，编程求1到10中偶数的乘积。从中提出任务的共同部分就是for循环，把代码改造如下：

~~~groovy
def pickEven(n,block){
    for(int i = 2;i &lt;= n;i += 2){
        block(i)
    }
}
pickEven(10,{println it})
~~~

在for循环中，变量block保存了一个指向闭包的引用，我们可以像传递对象一样传递闭包。变量名可以是任何合法的变量名，我们把这种匿名代码块称为闭包（Closure）。

通过闭包的方式来求1 - 10中偶数之和，代码如下：

~~~groovy
total = 0
pickEven(10,{total += it})
println "sum of even numbers from 1 to 10 is ${total}"
~~~

通过闭包的方式来求1 - 10中偶数之积，代码如下：

~~~groovy
product = 1
pickEven(10,{product *= it})
println "prod of even numbers from 1 to 10 is ${product}"
~~~



