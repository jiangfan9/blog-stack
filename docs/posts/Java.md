---
title: Java
date: 2022-07-28
categories: [语言]
tags: [Java, JDK, JVM, 并发]
description: Java 语言学习笔记，涵盖基础语法、集合框架、Lambda/Stream、JVM、并发与 JDK 8-25 新特性。
coverImg: /images/cover-1.svg
permalink: /posts/java
---

# Java 系统学习指南：从基础到高阶

> 一份带代码示例的渐进式学习文档。以 Java 8 为基础语法主线，同时覆盖 Java 8 之后的重要新特性（均已标注最低版本要求）。文中的示例代码均可复制到本地环境运行验证。

## 目录

- [写在前面](#写在前面)
- [第一部分：基础篇](#第一部分基础篇)
- [第二部分：进阶篇](#第二部分进阶篇)
- [第三部分：高阶篇](#第三部分高阶篇)
- [附录：学习路线与资源](#附录学习路线与资源)

---

## 写在前面

### Java 版本说明

| 版本 | 地位 | 本文涉及内容 |
|------|------|-------------|
| Java 8 | 最广泛使用的 LTS，本文语法基线 | Lambda、Stream、日期 API、接口默认方法 |
| Java 11 | LTS | HTTP Client、String 新方法 |
| Java 17 | LTS | sealed 类、record、文本块 |
| Java 21 | LTS | 虚拟线程、序列集合、switch 模式匹配 |
| Java 25 | 最新 LTS | 作用域值、模块导入、紧凑源文件、灵活构造器、分代 Shenandoah |

> 本文所有未标注版本的示例均可在 **Java 8** 编译运行；标注了「Java XX+」的示例需要对应版本的支持。

### 环境搭建与运行方式

```bash
# 1. 检查 JDK 是否安装
javac -version   # 编译器
java -version    # 运行时

# 2. 编译并运行（文件名必须与 public 类名一致）
javac HelloWorld.java
java HelloWorld
```

**JVM / JRE / JDK 的关系**：

```
JDK = JRE + 开发工具（javac、jstack、jmap 等）
JRE = JVM + 核心类库
JVM = 执行字节码的虚拟机
```

编译运行流程：`HelloWorld.java` --(javac)--> `HelloWorld.class` --(java)--> 程序执行。

---

# 第一部分：基础篇

## 1. 第一个 Java 程序

```java
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

要点：

- 文件名必须与 `public class` 的名称完全一致，包括大小写
- `public static void main(String[] args)` 是程序入口，固定写法
- Java 是强类型、编译型语言，先编译成字节码再运行

## 2. 变量与数据类型

Java 有 **8 种基本类型** 和 **引用类型**。

### 8 种基本类型

| 类型 | 字节 | 取值范围 | 包装类 |
|------|------|---------|--------|
| `byte` | 1 | -128 ~ 127 | `Byte` |
| `short` | 2 | -32768 ~ 32767 | `Short` |
| `int` | 4 | 约 ±21 亿 | `Integer` |
| `long` | 8 | 很大 | `Long` |
| `float` | 4 | 单精度浮点 | `Float` |
| `double` | 8 | 双精度浮点 | `Double` |
| `char` | 2 | 单个字符 | `Character` |
| `boolean` | 1bit（逻辑） | true / false | `Boolean` |

```java
public class BasicTypes {
    public static void main(String[] args) {
        byte b = 100;
        short s = 1000;
        int i = 100000;
        long l = 10000000000L;     // long 字面量需要加 L
        float f = 3.14f;           // float 字面量需要加 f
        double d = 3.1415926;
        char c = 'A';              // 字符用单引号
        boolean flag = true;

        System.out.println(b + ", " + s + ", " + i + ", " + l);
        System.out.println(f + ", " + d + ", " + c + ", " + flag);

        // 引用类型：类、接口、数组
        String str = "hello";      // String 是类，不是基本类型
        int[] arr = {1, 2, 3};
        System.out.println(str + ", " + arr.length);
    }
}
```

### 常量与命名规范

```java
public class Constants {
    // final 修饰的常量不可重新赋值，通常用全大写 + 下划线
    static final int MAX_SIZE = 100;
    public static final double PI = 3.14159;

    public static void main(String[] args) {
        // MAX_SIZE = 200; // 编译错误：不能给 final 变量重新赋值
        System.out.println(MAX_SIZE + " " + PI);
    }
}
```

## 3. 类型转换

### 自动类型转换（小类型 → 大类型）

```java
public class AutoCast {
    public static void main(String[] args) {
        byte b = 10;
        int i = b;        // byte → int，自动转换
        long l = i;       // int → long
        float f = l;      // long → float
        double d = f;     // float → double
        System.out.println(d); // 10.0

        // char 也可以自动转为 int（ASCII/Unicode 码）
        char c = 'A';
        int code = c;
        System.out.println(code); // 65
    }
}
```

### 强制类型转换（大类型 → 小类型）

```java
public class ForceCast {
    public static void main(String[] args) {
        double d = 3.99;
        int i = (int) d;    // 强制转换，直接截断小数部分
        System.out.println(i); // 3

        int big = 128;
        byte b = (byte) big; // 超出 byte 范围，结果溢出
        System.out.println(b); // -128

        // 表达式中的自动提升
        int a = 5;
        double result = a / 2.0; // 有 double 参与，a 被提升为 double
        System.out.println(result); // 2.5
    }
}
```

### 自动装箱与拆箱

```java
public class Boxing {
    public static void main(String[] args) {
        int primitive = 10;
        Integer wrapper = primitive;   // 自动装箱：int → Integer
        int back = wrapper;            // 自动拆箱：Integer → int
        System.out.println(wrapper + ", " + back);

        // 字符串 ↔ 基本类型
        String s = "123";
        int n = Integer.parseInt(s);   // 字符串转 int
        String s2 = String.valueOf(n); // int 转字符串
        System.out.println(n + 1 + ", " + s2 + "!");
    }
}
```

## 4. 运算符

```java
public class Operators {
    public static void main(String[] args) {
        // 算术
        System.out.println(5 + 3 + ", " + (5 - 3) + ", " + 5 * 3 + ", " + 5 / 3 + ", " + 5 % 3);

        // 自增自减
        int a = 5;
        System.out.println(a++); // 5 —— 先取值后自增
        System.out.println(++a); // 7 —— 先自增后取值

        // 赋值
        int b = 10;
        b += 5; // 等价于 b = b + 5
        System.out.println(b); // 15

        // 比较（注意区分 == 与 equals）
        int x = 10, y = 20;
        System.out.println(x == y);   // false
        System.out.println(x != y);   // true

        // 逻辑
        boolean t = true, f = false;
        System.out.println(t && f); // false —— 短路与
        System.out.println(t || f); // true  —— 短路或
        System.out.println(!t);     // false

        // 三元
        int score = 85;
        String level = score >= 90 ? "优秀" : "及格";
        System.out.println(level);

        // 位运算（了解即可）
        System.out.println(6 & 3);  // 2 —— 按位与 110 & 011 = 010
        System.out.println(6 | 3);  // 7 —— 按位或
        System.out.println(6 ^ 3);  // 5 —— 按位异或
        System.out.println(1 << 3); // 8 —— 左移 3 位
    }
}
```

## 5. 流程控制

```java
public class ControlFlow {
    public static void main(String[] args) {
        // if / else if / else
        int score = 85;
        if (score >= 90) {
            System.out.println("优秀");
        } else if (score >= 60) {
            System.out.println("及格");
        } else {
            System.out.println("不及格");
        }

        // switch（Java 8 支持 byte/short/int/char/String/enum）
        int day = 3;
        switch (day) {
            case 1: System.out.println("周一"); break;
            case 2: System.out.println("周二"); break;
            case 3: System.out.println("周三"); break;
            default: System.out.println("其他");
        }
        // 注意：没有 break 会穿透到下一个 case

        // for 循环
        for (int i = 0; i < 5; i++) {
            System.out.print(i + " ");
        }
        System.out.println();

        // while
        int j = 0;
        while (j < 3) {
            System.out.print(j + " ");
            j++;
        }
        System.out.println();

        // do-while：至少执行一次
        int k = 5;
        do {
            System.out.println("do-while 执行一次: " + k);
        } while (k < 3);

        // 增强 for（遍历数组/集合）
        int[] nums = {10, 20, 30};
        for (int n : nums) {
            System.out.print(n + " ");
        }
        System.out.println();

        // break 与 continue
        for (int m = 0; m < 5; m++) {
            if (m == 2) continue; // 跳过本次
            if (m == 4) break;    // 结束循环
            System.out.print(m + " ");
        }
        System.out.println();
    }
}
```

## 6. 数组

```java
import java.util.Arrays;

public class ArraysDemo {
    public static void main(String[] args) {
        // 声明与初始化
        int[] a1 = new int[5];          // 默认值全为 0
        int[] a2 = {1, 2, 3, 4, 5};     // 静态初始化
        int[] a3 = new int[]{6, 7, 8};

        System.out.println(a2.length);  // 5 —— 长度
        System.out.println(a2[0]);      // 1 —— 索引从 0 开始
        a2[1] = 99;

        // Arrays 工具类
        System.out.println(Arrays.toString(a2));       // 打印数组内容
        Arrays.sort(a2);                               // 排序（升序，改原数组）
        System.out.println(Arrays.toString(a2));
        System.out.println(Arrays.binarySearch(a2, 3)); // 二分查找，返回索引
        int[] copy = Arrays.copyOf(a2, 3);              // 复制前 3 个元素
        System.out.println(Arrays.toString(copy));
        Arrays.fill(a1, 7);                             // 填充
        System.out.println(Arrays.toString(a1));

        // 二维数组
        int[][] matrix = {{1, 2}, {3, 4}, {5, 6}};
        System.out.println(matrix.length);    // 3 —— 行数
        System.out.println(matrix[1][0]);     // 3
        for (int[] row : matrix) {
            System.out.println(Arrays.toString(row));
        }
    }
}
```

## 7. 方法

```java
public class Methods {
    // 方法定义：修饰符 返回值类型 方法名(参数列表) { 方法体 }
    public static int add(int a, int b) {
        return a + b;
    }

    // 方法重载：同名方法，参数列表不同
    public static double add(double a, double b) {
        return a + b;
    }
    public static int add(int a, int b, int c) {
        return a + b + c;
    }

    // 可变参数（本质是数组）
    public static int sum(int... nums) {
        int total = 0;
        for (int n : nums) total += n;
        return total;
    }

    // 递归：方法调用自身
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    // Java 是值传递：基本类型传值的副本，引用类型传引用的副本
    public static void changeBasic(int x) {
        x = 100;
    }
    public static void changeArray(int[] arr) {
        arr[0] = 100; // 修改的是同一个数组对象
    }

    public static void main(String[] args) {
        System.out.println(add(1, 2));         // 3
        System.out.println(add(1.5, 2.5));     // 4.0
        System.out.println(add(1, 2, 3));      // 6
        System.out.println(sum(1, 2, 3, 4));   // 10
        System.out.println(factorial(5));      // 120

        int x = 1;
        changeBasic(x);
        System.out.println(x); // 1 —— 基本类型不受影响

        int[] arr = {1, 2};
        changeArray(arr);
        System.out.println(arr[0]); // 100 —— 引用类型对象内容被改变
    }
}
```

## 8. 字符串

### String 的不可变性与常用方法

```java
public class StringDemo {
    public static void main(String[] args) {
        String s = "Hello World";

        System.out.println(s.length());             // 11
        System.out.println(s.toUpperCase());        // "HELLO WORLD"
        System.out.println(s.toLowerCase());        // "hello world"
        System.out.println(s.contains("World"));    // true
        System.out.println(s.startsWith("Hello"));  // true
        System.out.println(s.endsWith("World"));    // true
        System.out.println(s.indexOf("World"));     // 6
        System.out.println(s.substring(0, 5));      // "Hello"
        System.out.println(s.replace("World", "Java")); // "Hello Java"
        System.out.println("  hi  ".trim());        // "hi"
        System.out.println(String.join("-", "a", "b", "c")); // "a-b-c"
        // System.out.println("ab".repeat(3)); // Java 11+ 新增，见高阶篇新特性章节

        // split：按正则拆分
        String[] parts = "a,b,c".split(",");
        System.out.println(java.util.Arrays.toString(parts)); // [a, b, c]

        // 字符串拼接：+ 在编译期优化；大量拼接用 StringBuilder
        String name = "Tom";
        String msg = "Hello, " + name + "!";
        System.out.println(msg);
    }
}
```

> ⚠️ **`==` 与 `equals` 的区别**：`==` 比较的是引用地址，`equals` 比较的是内容。字符串比较务必用 `equals`。

```java
public class StringEquals {
    public static void main(String[] args) {
        String a = "hello";              // 字符串常量池
        String b = "hello";
        String c = new String("hello");  // 堆中新对象

        System.out.println(a == b);         // true —— 指向常量池同一对象
        System.out.println(a == c);         // false —— 不同对象
        System.out.println(a.equals(c));    // true —— 内容相同
        System.out.println("hello".equals(a)); // 推荐：常量放前面避免空指针
    }
}
```

### StringBuilder

```java
public class StringBuilderDemo {
    public static void main(String[] args) {
        // String 不可变，频繁拼接会产生大量临时对象
        // StringBuilder 可变，适合循环中拼接
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            sb.append(i).append(",");
        }
        System.out.println(sb.length());
        System.out.println(sb.substring(0, 10));
        System.out.println(sb.reverse().substring(0, 10));

        // StringBuffer 是线程安全版本，性能略低
    }
}
```

## 9. 面向对象基础

### 类与对象

```java
// 定义一个类
class Student {
    // 成员变量（属性）
    String name;
    int age;

    // 构造器：与类同名，无返回值
    public Student(String name, int age) {
        this.name = name;   // this 指代当前对象，区分成员变量和参数
        this.age = age;
    }

    // 方法
    public void study() {
        System.out.println(name + " 正在学习");
    }

    public String introduce() {
        return "我是" + name + "，今年" + age + "岁";
    }
}

public class OopBase {
    public static void main(String[] args) {
        // 创建对象
        Student s1 = new Student("Alice", 18);
        Student s2 = new Student("Bob", 20);
        System.out.println(s1.name);        // Alice
        System.out.println(s2.introduce()); // 我是Bob，今年20岁
        s1.study();                         // Alice 正在学习
    }
}
```

### static 关键字

```java
class Counter {
    static int count = 0; // 静态变量：属于类，所有对象共享
    int instanceValue;    // 实例变量：每个对象一份

    public Counter(int v) {
        this.instanceValue = v;
        count++; // 每创建一个对象，计数 +1
    }

    // 静态方法：属于类，可用类名直接调用
    public static void printCount() {
        System.out.println("对象总数: " + count);
        // System.out.println(instanceValue); // 错误：静态方法不能直接访问非静态成员
    }

    // 静态代码块：类加载时执行一次
    static {
        System.out.println("Counter 类被加载");
    }
}

public class StaticDemo {
    public static void main(String[] args) {
        Counter c1 = new Counter(1);
        Counter c2 = new Counter(2);
        Counter.printCount(); // 对象总数: 2
        System.out.println(c1.count + ", " + c2.count); // 2, 2 —— 共享同一个值
        System.out.println(c1.instanceValue + ", " + c2.instanceValue); // 1, 2
    }
}
```

### 封装：访问修饰符

```java
class Person {
    private String name;  // private：只能在类内部访问
    protected int age;    // protected：同包 + 子类可访问
    public String id;     // public：任意位置可访问
    String address;       // 默认（包级）：同包内可访问

    // getter / setter：通过方法控制对私有字段的访问
    public String getName() { return name; }
    public void setName(String name) {
        if (name != null && !name.isEmpty()) {
            this.name = name;
        }
    }
}

public class Encapsulation {
    public static void main(String[] args) {
        Person p = new Person();
        p.setName("Alice");
        // p.name = "Bob"; // 编译错误：private 字段不可直接访问
        System.out.println(p.getName());
    }
}
```

---

# 第二部分：进阶篇

## 1. 继承与多态

```java
// 父类
class Animal {
    protected String name;

    public Animal(String name) { this.name = name; }

    public void eat() {
        System.out.println(name + " 正在吃东西");
    }

    public void makeSound() {
        System.out.println(name + " 发出声音");
    }
}

// 子类 extends 父类
class Dog extends Animal {
    public Dog(String name) { super(name); } // super 调用父类构造器

    // 方法重写（Override）
    @Override
    public void makeSound() {
        System.out.println(name + " 汪汪叫");
    }

    public void fetch() {
        System.out.println(name + " 接飞盘");
    }
}

class Cat extends Animal {
    public Cat(String name) { super(name); }
    @Override
    public void makeSound() {
        System.out.println(name + " 喵喵叫");
    }
}

public class Inheritance {
    public static void main(String[] args) {
        // 多态：父类引用指向子类对象
        Animal a1 = new Dog("Rex");
        Animal a2 = new Cat("Kitty");

        a1.makeSound(); // Rex 汪汪叫 —— 运行时调用子类重写的方法
        a2.makeSound(); // Kitty 喵喵叫
        a1.eat();       // Rex 正在吃东西 —— 继承父类方法

        // a1.fetch(); // 编译错误：编译时类型是 Animal，看不到子类特有方法
        Dog d = (Dog) a1; // 向下转型
        d.fetch();        // Rex 接飞盘
    }
}
```

**多态三要素**：继承、方法重写、父类引用指向子类对象。

## 2. 抽象类与接口

### 抽象类

```java
abstract class Shape {
    protected String name;
    public Shape(String name) { this.name = name; }

    // 抽象方法：只有声明，没有实现，子类必须重写
    public abstract double area();

    // 普通方法：子类可直接继承
    public void describe() {
        System.out.println(name + "，面积: " + area());
    }
}

class Circle extends Shape {
    private double radius;
    public Circle(double radius) { super("圆形"); this.radius = radius; }
    @Override
    public double area() { return Math.PI * radius * radius; }
}

class Rectangle extends Shape {
    private double w, h;
    public Rectangle(double w, double h) { super("矩形"); this.w = w; this.h = h; }
    @Override
    public double area() { return w * h; }
}

public class AbstractDemo {
    public static void main(String[] args) {
        Shape[] shapes = {new Circle(2), new Rectangle(3, 4)};
        for (Shape s : shapes) s.describe();
    }
}
```

### 接口

```java
// 接口：定义行为规范
interface Flyable {
    // 接口中的变量默认是 public static final
    int MAX_HEIGHT = 10000;

    // 抽象方法（默认 public abstract）
    void fly();

    // Java 8+ 默认方法：有实现，子类可直接用
    default void takeOff() {
        System.out.println("准备起飞");
    }

    // Java 8+ 静态方法
    static void info() {
        System.out.println("Flyable 接口");
    }
}

interface Swimmable {
    void swim();
}

class Duck implements Flyable, Swimmable {
    public void fly() { System.out.println("鸭子飞起来了"); }
    public void swim() { System.out.println("鸭子游起来了"); }
}

public class InterfaceDemo {
    public static void main(String[] args) {
        Duck duck = new Duck();
        duck.fly();
        duck.swim();
        duck.takeOff(); // 调用接口的默认方法
        Flyable.info(); // 调用接口的静态方法
        System.out.println(Flyable.MAX_HEIGHT);
    }
}
```

> **抽象类 vs 接口**：抽象类强调"是什么"（is-a），可包含状态和非抽象方法，单继承；接口强调"能做什么"（has-a/can-do），多实现。Java 8 后接口也可有默认方法，但依然不能有实例状态。

## 3. final 关键字

```java
final class FinalClass {  // final 类不能被继承
    public final void show() { // final 方法不能被重写
        System.out.println("final 方法");
    }
}

public class FinalDemo {
    public static void main(String[] args) {
        final int x = 10; // final 基本类型：值不可变
        // x = 20; // 编译错误

        final int[] arr = {1, 2, 3}; // final 引用：地址不可变，但内容可改
        arr[0] = 99; // ✅ 允许
        // arr = new int[]{4, 5}; // ❌ 编译错误

        System.out.println(arr[0]); // 99
    }
}
```

## 4. 异常机制

### try-catch-finally 与 try-with-resources

```java
import java.io.*;

public class ExceptionDemo {
    public static void main(String[] args) {
        // 基本异常处理
        try {
            int result = 10 / 0; // 会抛出 ArithmeticException
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("捕获异常: " + e.getMessage());
        } finally {
            System.out.println("finally 无论是否异常都执行");
        }

        // 多异常捕获（Java 7+）
        try {
            String s = null;
            s.length();
        } catch (NullPointerException | IndexOutOfBoundsException e) {
            System.out.println("空指针或越界: " + e.getClass().getSimpleName());
        }

        // try-with-resources（Java 7+）：自动关闭资源，无需手写 finally
        try (BufferedReader reader = new BufferedReader(new StringReader("line1\nline2"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 自定义异常与 throws

```java
// 自定义异常：继承 Exception（受检）或 RuntimeException（非受检）
class AgeException extends Exception {
    public AgeException(String message) { super(message); }
}

class PersonService {
    // throws 声明方法可能抛出的异常，由调用者处理
    public void setAge(int age) throws AgeException {
        if (age < 0 || age > 150) {
            throw new AgeException("年龄不合法: " + age); // 主动抛出
        }
        System.out.println("年龄设置成功: " + age);
    }
}

public class CustomException {
    public static void main(String[] args) {
        PersonService service = new PersonService();
        try {
            service.setAge(200);
        } catch (AgeException e) {
            System.out.println("捕获: " + e.getMessage());
        }
    }
}
```

**异常体系**：`Throwable` → `Error`（不可处理，如 OutOfMemoryError）和 `Exception`（可处理）→ `RuntimeException`（运行时异常，如 NullPointerException）与受检异常（如 IOException）。

## 5. 集合框架

```java
import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        // ===== List：有序、可重复 =====
        List<String> list = new ArrayList<>();
        list.add("banana");
        list.add("apple");
        list.add("apple");
        list.add(1, "orange"); // 按索引插入
        System.out.println(list);                 // [banana, orange, apple, apple]
        System.out.println(list.get(1));          // orange
        list.set(0, "grape");
        list.remove("apple");                     // 删除第一个匹配项
        System.out.println(list.size());          // 3

        // LinkedList：插入删除快，随机访问慢
        LinkedList<String> linked = new LinkedList<>();
        linked.addFirst("first");
        linked.addLast("last");
        System.out.println(linked);               // [first, last]

        // ===== Set：无序、不可重复 =====
        Set<Integer> set = new HashSet<>();
        set.add(1); set.add(2); set.add(2); set.add(3);
        System.out.println(set);                  // [1, 2, 3] —— 重复元素被忽略
        System.out.println(set.contains(2));      // true

        Set<Integer> treeSet = new TreeSet<>();   // 自动排序
        treeSet.add(3); treeSet.add(1); treeSet.add(2);
        System.out.println(treeSet);              // [1, 2, 3]

        // ===== Map：键值对 =====
        Map<String, Integer> map = new HashMap<>();
        map.put("Alice", 90);
        map.put("Bob", 85);
        map.put("Alice", 95); // 覆盖旧值
        System.out.println(map);                          // {Bob=85, Alice=95}
        System.out.println(map.get("Alice"));             // 95
        System.out.println(map.getOrDefault("Tom", 0));   // 0
        System.out.println(map.containsKey("Bob"));       // true
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }

        // TreeMap：按 key 排序
        Map<Integer, String> treeMap = new TreeMap<>();
        treeMap.put(3, "c"); treeMap.put(1, "a"); treeMap.put(2, "b");
        System.out.println(treeMap); // {1=a, 2=b, 3=c}

        // ===== 迭代器 =====
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            System.out.print(it.next() + " ");
        }
        System.out.println();

        // ===== Collections 工具类 =====
        List<Integer> nums = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5));
        Collections.sort(nums);
        Collections.reverse(nums);
        System.out.println(nums);
        System.out.println(Collections.max(nums));
    }
}
```

## 6. 泛型

```java
import java.util.*;

// 泛型类：T 是类型参数
class Box<T> {
    private T value;
    public Box(T value) { this.value = value; }
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}

public class GenericDemo {
    // 泛型方法：<T> 声明在返回值前
    public static <T> void printArray(T[] arr) {
        for (T item : arr) System.out.print(item + " ");
        System.out.println();
    }

    public static void main(String[] args) {
        Box<Integer> intBox = new Box<>(123);
        Box<String> strBox = new Box<>("hello");
        System.out.println(intBox.get() + ", " + strBox.get());
        // intBox.set("abc"); // 编译错误：类型不匹配

        Integer[] nums = {1, 2, 3};
        String[] strs = {"a", "b", "c"};
        printArray(nums);
        printArray(strs);

        // 通配符
        List<Object> objList = new ArrayList<>();
        List<String> strList = new ArrayList<>();
        strList.add("x");

        // ? extends Number：可以是 Number 或其子类的集合（只读）
        List<Integer> integers = new ArrayList<>();
        integers.add(42);
        List<? extends Number> numList = integers;
        Number n = numList.get(0); // 可以读，得到 42
        // numList.add(1); // 不能写

        // ? super Integer：可以是 Integer 或其父类的集合（可写）
        List<? super Integer> superList = new ArrayList<Number>();
        superList.add(1); // 可以写
    }
}
```

> **类型擦除**：Java 泛型在编译期检查，编译后泛型信息被擦除为原始类型（如 `List<T>` 变成 `List`），所以运行时无法获取泛型的具体类型。

## 7. Lambda 表达式与函数式接口

```java
import java.util.*;
import java.util.function.*;

public class LambdaDemo {
    public static void main(String[] args) {
        // 传统写法：匿名内部类
        Runnable r1 = new Runnable() {
            @Override
            public void run() {
                System.out.println("传统 Runnable");
            }
        };

        // Lambda 写法：更简洁
        Runnable r2 = () -> System.out.println("Lambda Runnable");
        r1.run();
        r2.run();

        // 带参数和返回值
        Comparator<String> comp = (a, b) -> a.length() - b.length();
        List<String> list = new ArrayList<>(Arrays.asList("apple", "hi", "banana"));
        list.sort(comp);
        System.out.println(list); // [hi, apple, banana]

        // ===== 常用函数式接口 =====
        Predicate<Integer> isEven = n -> n % 2 == 0;     // 判断：返回 boolean
        Function<Integer, Integer> doubleIt = n -> n * 2; // 转换：T → R
        Consumer<String> printer = s -> System.out.println(s); // 消费：无返回值
        Supplier<Double> random = Math::random;           // 供给：无参数有返回值

        System.out.println(isEven.test(4));       // true
        System.out.println(doubleIt.apply(5));    // 10
        printer.accept("消费者被调用");
        System.out.println(random.get());

        // 方法引用：ClassName::methodName
        list.forEach(System.out::println);
    }
}
```

**函数式接口**：有且仅有一个抽象方法的接口，可用 `@FunctionalInterface` 注解标记。Lambda 本质上是函数式接口的实例。

## 8. Stream API（Java 8+）

```java
import java.util.*;
import java.util.stream.*;

public class StreamDemo {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // 过滤 + 映射 + 终止
        List<Integer> result = nums.stream()
                .filter(n -> n % 2 == 0)      // 中间操作：保留偶数
                .map(n -> n * n)              // 中间操作：平方
                .sorted()                     // 中间操作：排序
                .collect(Collectors.toList()); // 终止操作：收集为 List
        System.out.println(result); // [4, 16, 36, 64, 100]

        // 常用终止操作
        System.out.println(nums.stream().count());                    // 10
        System.out.println(nums.stream().reduce(0, (a, b) -> a + b)); // 55
        System.out.println(nums.stream().mapToInt(Integer::intValue).sum()); // 55
        System.out.println(nums.stream().anyMatch(n -> n > 9));      // true
        System.out.println(nums.stream().allMatch(n -> n > 0));      // true
        System.out.println(nums.stream().findFirst().get());          // 1
        nums.stream().limit(3).forEach(n -> System.out.print(n + " ")); // 1 2 3
        System.out.println();
        nums.stream().skip(8).forEach(n -> System.out.print(n + " "));   // 9 10
        System.out.println();

        // distinct 去重
        List<String> words = Arrays.asList("a", "b", "a", "c", "b");
        System.out.println(words.stream().distinct().collect(Collectors.toList()));
        // [a, b, c]

        // 分组
        Map<Integer, List<String>> grouped = words.stream()
                .collect(Collectors.groupingBy(String::length));
        System.out.println(grouped); // {1=[a, b, a, c, b]}

        // 并行流（大数据量时可利用多核）
        long total = nums.parallelStream().mapToLong(n -> n).sum();
        System.out.println(total); // 55
    }
}
```

> **Stream 特点**：链式调用、惰性求值（遇到终止操作才执行）、不修改原数据源、一次消费（不能重复使用同一个 Stream）。

## 9. IO 流

```java
import java.io.*;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;

public class IODemo {
    public static void main(String[] args) throws IOException {
        // ===== 传统 IO：字符流 =====
        File file = new File("demo.txt");

        // 写入（FileWriter）
        try (Writer writer = new FileWriter(file)) {
            writer.write("第一行\n第二行\n第三行\n");
        }

        // 读取（BufferedReader 按行读）
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("读出: " + line);
            }
        }

        // ===== NIO.2（Java 7+）：Files 工具类更简洁 =====
        Path path = Paths.get("demo2.txt");
        Files.write(path, Arrays.asList("apple", "banana", "cherry"));
        List<String> lines = Files.readAllLines(path);
        System.out.println(lines);

        // 文件/目录操作
        System.out.println(Files.exists(path));          // 是否存在
        System.out.println(Files.size(path) + " bytes"); // 文件大小
        // Files.delete(path); // 删除
        // Files.createDirectory(Paths.get("mydir")); // 创建目录

        // ===== 字节流：复制文件 =====
        try (InputStream in = new FileInputStream("demo.txt");
             OutputStream out = new FileOutputStream("demo_copy.txt")) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
        }
        System.out.println("文件复制完成");
    }
}
```

## 10. 多线程基础

### 创建线程的三种方式

```java
// 方式一：继承 Thread 类
class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 3; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
        }
    }
}

// 方式二：实现 Runnable 接口（推荐，避免单继承限制）
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " 运行中");
    }
}

public class ThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        new MyThread().start();
        new Thread(new MyRunnable()).start();

        // 方式三：Lambda 简化
        Thread t = new Thread(() -> System.out.println("Lambda 线程"));
        t.start();
        t.join(); // 等待线程 t 执行完毕

        System.out.println("主线程结束");
    }
}
```

### 线程同步

```java
class TicketSeller implements Runnable {
    private int tickets = 10;

    @Override
    public void run() {
        while (true) {
            // synchronized：保证同一时刻只有一个线程执行该方法
            synchronized (this) {
                if (tickets <= 0) break;
                try { Thread.sleep(10); } catch (InterruptedException e) {}
                System.out.println(Thread.currentThread().getName() + " 卖出第 " + tickets-- + " 张票");
            }
        }
    }
}

public class SyncDemo {
    public static void main(String[] args) throws InterruptedException {
        TicketSeller seller = new TicketSeller();
        Thread t1 = new Thread(seller, "窗口1");
        Thread t2 = new Thread(seller, "窗口2");
        Thread t3 = new Thread(seller, "窗口3");
        t1.start(); t2.start(); t3.start();
        t1.join(); t2.join(); t3.join();
        System.out.println("售票结束");
    }
}
```

### volatile 与线程通信

```java
class SharedResource {
    // volatile：保证可见性（一个线程修改后其他线程立即看到），不保证原子性
    private volatile boolean running = true;
    private int data;

    public void stop() { running = false; }
    public boolean isRunning() { return running; }

    // wait/notify：线程间通信，必须在 synchronized 块中使用
    public synchronized void produce() throws InterruptedException {
        while (data != 0) wait(); // 等待消费者取走数据
        data = 1;
        System.out.println("生产了数据");
        notifyAll(); // 唤醒等待的消费者
    }

    public synchronized void consume() throws InterruptedException {
        while (data == 0) wait();
        data = 0;
        System.out.println("消费了数据");
        notifyAll();
    }
}

public class VolatileDemo {
    public static void main(String[] args) throws InterruptedException {
        SharedResource res = new SharedResource();
        new Thread(() -> {
            while (res.isRunning()) {
                // 工作线程持续运行，直到 running 变为 false
            }
            System.out.println("工作线程停止");
        }).start();
        Thread.sleep(50);
        res.stop();

        // wait/notify 演示
        SharedResource r2 = new SharedResource();
        new Thread(() -> {
            try { r2.produce(); } catch (InterruptedException e) {}
        }).start();
        new Thread(() -> {
            try { Thread.sleep(100); r2.consume(); } catch (InterruptedException e) {}
        }).start();
    }
}
```

---

# 第三部分：高阶篇

## 1. JVM 内存区域与垃圾回收

### 运行时数据区

```
┌─────────────────────────────────────┐
│            线程共享区                │
│  堆（Heap）：对象实例、数组           │
│  方法区/元空间：类信息、常量、静态变量  │
├─────────────────────────────────────┤
│            线程私有区                │
│  虚拟机栈：方法调用的栈帧（局部变量等） │
│  本地方法栈：native 方法              │
│  程序计数器：当前字节码行号            │
└─────────────────────────────────────┘
```

### 垃圾回收核心概念

- **判断对象存活**：可达性分析算法，从 GC Roots（栈中引用、静态变量、常量引用等）出发，不可达的对象可回收
- **GC 算法**：标记-清除（产生碎片）、复制（空间换时间，适合新生代）、标记-整理（适合老年代）、分代收集
- **GC 分类**：Minor GC（新生代）、Major GC（老年代）、Full GC（整个堆）
- **收集器**：Serial、Parallel Scavenge、CMS（低停顿）、G1（可预测停顿，JDK 9 默认）、ZGC（JDK 11+ 超低延迟）

```java
// 演示对象分配与 GC 观察（运行时加参数：-verbose:gc -Xmx20m）
public class GCDemo {
    public static void main(String[] args) {
        // 不断创建对象，观察 GC 日志输出
        for (int i = 0; i < 10000; i++) {
            byte[] data = new byte[1024 * 100]; // 每次分配 100KB
        }
        System.out.println("分配完成");
    }
}
```

## 2. 并发编程进阶

### 线程池

```java
import java.util.concurrent.*;

public class ThreadPoolDemo {
    public static void main(String[] args) throws Exception {
        // 推荐：显式创建 ThreadPoolExecutor，明确参数
        ThreadPoolExecutor pool = new ThreadPoolExecutor(
                2,                              // corePoolSize：核心线程数
                4,                              // maximumPoolSize：最大线程数
                60, TimeUnit.SECONDS,           // keepAliveTime：空闲线程存活时间
                new ArrayBlockingQueue<>(10),   // workQueue：任务队列
                Executors.defaultThreadFactory(),
                new ThreadPoolExecutor.AbortPolicy() // 拒绝策略
        );

        // 提交 10 个任务
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            pool.execute(() -> {
                System.out.println(Thread.currentThread().getName() + " 执行任务 " + taskId);
            });
        }
        pool.shutdown(); // 关闭线程池（等待已提交任务完成）

        // ===== Callable + Future：有返回值的任务 =====
        ExecutorService pool2 = Executors.newFixedThreadPool(2);
        Future<Integer> future = pool2.submit(() -> {
            Thread.sleep(100);
            return 42;
        });
        System.out.println("任务返回值: " + future.get()); // 42
        pool2.shutdown();
    }
}
```

> ⚠️ 生产环境不推荐用 `Executors` 创建线程池（`newFixedThreadPool`/`newCachedThreadPool`），因其默认队列无界或线程数无上限，可能导致 OOM。

### Lock 与 CAS

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class LockDemo {
    private static int count = 0;
    private static final Lock lock = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        // ReentrantLock：可重入锁，比 synchronized 更灵活
        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                lock.lock();
                try { count++; } finally { lock.unlock(); } // 必须在 finally 中释放锁
            }
        };
        Thread t1 = new Thread(task), t2 = new Thread(task);
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println("Lock 结果: " + count); // 2000

        // AtomicInteger：基于 CAS（Compare-And-Swap）的无锁原子操作
        AtomicInteger atomic = new AtomicInteger(0);
        Runnable casTask = () -> {
            for (int i = 0; i < 1000; i++) atomic.incrementAndGet();
        };
        Thread t3 = new Thread(casTask), t4 = new Thread(casTask);
        t3.start(); t4.start();
        t3.join(); t4.join();
        System.out.println("CAS 结果: " + atomic.get()); // 2000

        // CountDownLatch：等待多个线程完成
        CountDownLatch latch = new CountDownLatch(3);
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                System.out.println("子任务完成");
                latch.countDown();
            }).start();
        }
        latch.await(); // 阻塞直到计数归零
        System.out.println("所有子任务已完成");
    }
}
```

### ThreadLocal

```java
public class ThreadLocalDemo {
    // 每个线程拥有独立的变量副本，典型应用：保存用户会话、事务上下文
    private static final ThreadLocal<String> context = new ThreadLocal<>();

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            context.set("线程A的数据");
            System.out.println(Thread.currentThread().getName() + ": " + context.get());
            context.remove(); // 用完必须 remove，否则线程池场景可能内存泄漏
        }, "线程A").start();

        new Thread(() -> {
            context.set("线程B的数据");
            System.out.println(Thread.currentThread().getName() + ": " + context.get());
            context.remove();
        }, "线程B").start();
    }
}
```

## 3. 反射与注解

### 反射

```java
import java.lang.reflect.*;

class Person {
    private String name = "Alice";
    public int age = 18;

    public Person() {}
    public Person(String name) { this.name = name; }

    public void sayHello(String msg) {
        System.out.println(name + " says: " + msg);
    }
    private void secret() {
        System.out.println("私有方法被调用");
    }
}

public class ReflectionDemo {
    public static void main(String[] args) throws Exception {
        // 获取 Class 对象的三种方式
        Class<?> c1 = Class.forName("Person");
        Class<?> c2 = Person.class;
        Class<?> c3 = new Person().getClass();
        System.out.println(c1 == c2 && c2 == c3); // true

        // 通过反射创建对象
        Constructor<?> ctor = c1.getConstructor(String.class);
        Object obj = ctor.newInstance("Bob");

        // 调用方法
        Method method = c1.getMethod("sayHello", String.class);
        method.invoke(obj, "Hello"); // Bob says: Hello

        // 访问私有方法：setAccessible(true) 打破封装
        Method secret = c1.getDeclaredMethod("secret");
        secret.setAccessible(true);
        secret.invoke(obj); // 私有方法被调用

        // 访问字段
        Field ageField = c1.getField("age");
        System.out.println(ageField.get(obj)); // 18
        Field nameField = c1.getDeclaredField("name");
        nameField.setAccessible(true);
        System.out.println(nameField.get(obj)); // Bob

        // 获取所有方法
        for (Method m : c1.getDeclaredMethods()) {
            System.out.println("方法: " + m.getName());
        }
    }
}
```

### 注解

```java
import java.lang.annotation.*;
import java.lang.reflect.Method;

// 定义注解
@Target(ElementType.METHOD)      // 只能标注方法
@Retention(RetentionPolicy.RUNTIME) // 运行时保留，可通过反射读取
@interface MyLog {
    String value() default "";
}

class UserService {
    @MyLog("查询用户")
    public void getUser() {
        System.out.println("执行 getUser");
    }

    public void noAnnotation() {
        System.out.println("执行 noAnnotation");
    }
}

public class AnnotationDemo {
    public static void main(String[] args) throws Exception {
        // 通过反射读取注解，实现类似 AOP 的日志功能（框架原理）
        for (Method method : UserService.class.getDeclaredMethods()) {
            if (method.isAnnotationPresent(MyLog.class)) {
                MyLog log = method.getAnnotation(MyLog.class);
                System.out.println("[日志] 调用方法: " + method.getName() + "，说明: " + log.value());
            }
        }
        new UserService().getUser();
    }
}
```

## 4. HashMap 原理剖析

### 核心机制（Java 8）

- **数据结构**：数组 + 链表 + 红黑树。链表长度超过 8 且数组容量 ≥ 64 时转为红黑树
- **默认容量**：16，负载因子 0.75，达到 12 个元素时扩容为 2 倍
- **put 流程**：计算 hash → 定位桶 → 无冲突直接放入 → 有冲突比较 key → 相等覆盖 → 不等追加链表/树
- **hash 扰动**：`h ^ (h >>> 16)`，让高位参与运算，减少哈希冲突

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();

        // put 流程演示
        map.put("Alice", 90);
        map.put("Bob", 85);
        map.put("Alice", 95); // key 相同，覆盖旧值

        System.out.println(map); // {Bob=85, Alice=95}

        // 自定义对象作为 key：必须重写 hashCode 和 equals
        Map<Key, Integer> keyMap = new HashMap<>();
        keyMap.put(new Key("x"), 1);
        System.out.println(keyMap.get(new Key("x"))); // null —— 新对象 hashCode 不同
    }

    static class Key {
        String name;
        Key(String name) { this.name = name; }
        // 不重写 hashCode/equals，每次都是不同对象
    }
}
```

```java
// 正确做法：重写 hashCode 和 equals
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

class ProperKey {
    String name;
    ProperKey(String name) { this.name = name; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProperKey)) return false;
        return Objects.equals(name, ((ProperKey) o).name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name); // equals 相等的对象 hashCode 必须相等
    }
}

public class HashMapKeyDemo {
    public static void main(String[] args) {
        Map<ProperKey, Integer> map = new HashMap<>();
        map.put(new ProperKey("x"), 1);
        System.out.println(map.get(new ProperKey("x"))); // 1 —— 正确取出
    }
}
```

### ConcurrentHashMap

- Java 7：分段锁（Segment），并发度为段数
- Java 8：CAS + synchronized 锁单个桶头节点，并发度更高
- 不允许 null key 和 null value；迭代时弱一致性

## 5. 常用设计模式

### 单例模式（五种写法）

```java
// 1. 饿汉式：类加载即创建，简单但可能浪费
class Singleton1 {
    private static final Singleton1 INSTANCE = new Singleton1();
    private Singleton1() {}
    public static Singleton1 getInstance() { return INSTANCE; }
}

// 2. 懒汉式（线程安全）：synchronized 方法，性能较低
class Singleton2 {
    private static Singleton2 instance;
    private Singleton2() {}
    public static synchronized Singleton2 getInstance() {
        if (instance == null) instance = new Singleton2();
        return instance;
    }
}

// 3. 双重检查锁（DCL）：推荐，注意 volatile 防指令重排
class Singleton3 {
    private static volatile Singleton3 instance;
    private Singleton3() {}
    public static Singleton3 getInstance() {
        if (instance == null) {
            synchronized (Singleton3.class) {
                if (instance == null) instance = new Singleton3();
            }
        }
        return instance;
    }
}

// 4. 静态内部类：延迟加载 + JVM 保证线程安全，推荐
class Singleton4 {
    private Singleton4() {}
    private static class Holder {
        private static final Singleton4 INSTANCE = new Singleton4();
    }
    public static Singleton4 getInstance() { return Holder.INSTANCE; }
}

// 5. 枚举：最简洁，天然防反射和反序列化破坏，最推荐
enum Singleton5 {
    INSTANCE;
    public void doSomething() { System.out.println("枚举单例"); }
}

public class SingletonDemo {
    public static void main(String[] args) {
        System.out.println(Singleton1.getInstance() == Singleton1.getInstance()); // true
        System.out.println(Singleton3.getInstance() == Singleton3.getInstance()); // true
        Singleton5.INSTANCE.doSomething();
    }
}
```

### 工厂模式与策略模式

```java
// 简单工厂
interface Shape { void draw(); }
class Circle implements Shape { public void draw() { System.out.println("画圆形"); } }
class Square implements Shape { public void draw() { System.out.println("画方形"); } }

class ShapeFactory {
    public static Shape create(String type) {
        if ("circle".equalsIgnoreCase(type)) return new Circle();
        if ("square".equalsIgnoreCase(type)) return new Square();
        throw new IllegalArgumentException("未知类型: " + type);
    }
}

// 策略模式：定义一组算法，运行时选择
interface DiscountStrategy {
    double discount(double price);
}
class NormalDiscount implements DiscountStrategy {
    public double discount(double price) { return price; }
}
class VipDiscount implements DiscountStrategy {
    public double discount(double price) { return price * 0.8; }
}
class PriceService {
    private DiscountStrategy strategy;
    public PriceService(DiscountStrategy strategy) { this.strategy = strategy; }
    public double getPrice(double price) { return strategy.discount(price); }
}

public class DesignPatternDemo {
    public static void main(String[] args) {
        ShapeFactory.create("circle").draw(); // 画圆形
        System.out.println(new PriceService(new VipDiscount()).getPrice(100)); // 80.0
    }
}
```

### 动态代理（JDK Proxy）

```java
import java.lang.reflect.*;

interface UserService {
    void addUser(String name);
}
class UserServiceImpl implements UserService {
    public void addUser(String name) { System.out.println("添加用户: " + name); }
}

// InvocationHandler：代理逻辑，AOP 的核心原理
class LogHandler implements InvocationHandler {
    private Object target;
    public LogHandler(Object target) { this.target = target; }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("[日志] 方法调用前: " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("[日志] 方法调用后");
        return result;
    }
}

public class ProxyDemo {
    public static void main(String[] args) {
        UserService target = new UserServiceImpl();
        UserService proxy = (UserService) Proxy.newProxyInstance(
                target.getClass().getClassLoader(),
                target.getClass().getInterfaces(),
                new LogHandler(target)
        );
        proxy.addUser("Alice");
        // 输出：
        // [日志] 方法调用前: addUser
        // 添加用户: Alice
        // [日志] 方法调用后
    }
}
```

## 6. Java 8+ 新特性速览

### Java 8：Optional 与新日期 API

```java
import java.time.*;
import java.util.Optional;

public class Java8Features {
    public static void main(String[] args) {
        // ===== Optional：优雅处理 null，避免 NullPointerException =====
        Optional<String> opt = Optional.of("hello");
        System.out.println(opt.orElse("默认值"));           // hello
        System.out.println(opt.map(String::toUpperCase).get()); // HELLO
        Optional<String> empty = Optional.ofNullable(null);
        System.out.println(empty.orElse("默认值"));         // 默认值
        empty.ifPresent(s -> System.out.println(s));        // 不执行
        // empty.ifPresentOrElse(...); // Java 9+ 新增，见高阶篇新特性章节

        // ===== 新日期时间 API：线程安全，替代 Date/Calendar =====
        LocalDate date = LocalDate.of(2026, 11, 25);
        LocalTime time = LocalTime.of(14, 30);
        LocalDateTime dt = LocalDateTime.of(date, time);
        System.out.println(date); // 2026-11-25
        System.out.println(dt.plusDays(7)); // 2026-12-02T14:30
        System.out.println(date.getDayOfWeek()); // WEDNESDAY

        // 日期计算与格式化
        LocalDate nextMonth = date.plusMonths(1);
        Period period = Period.between(date, nextMonth);
        System.out.println(period.getMonths() + " 个月"); // 1
        System.out.println(dt.format(java.time.format.DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm")));
    }
}
```

### Java 10~21 重要特性（标注最低版本）

```java
// ===== Java 10+：var 局部变量类型推断 =====
var list = new java.util.ArrayList<String>(); // 编译器推断为 ArrayList<String>
list.add("hello");
System.out.println(list.get(0));

// ===== Java 11+：String 新方法 =====
String s = "  hello  ";
System.out.println(s.strip());        // "hello" —— strip 比 trim 更智能（Unicode）
System.out.println("ab".repeat(3));   // "ababab"

// ===== Java 14+：switch 表达式（简化版，无需 break） =====
int day = 3;
String dayName = switch (day) {
    case 1 -> "周一";
    case 2 -> "周二";
    case 3 -> "周三";
    default -> "其他";
};
System.out.println(dayName); // 周三

// ===== Java 15+：文本块（多行字符串） =====
String json = """
        {
          "name": "Alice",
          "age": 18
        }
        """;
System.out.println(json);

// ===== Java 16+：record（不可变数据类） =====
record Point(int x, int y) {}
Point p = new Point(3, 4);
System.out.println(p.x() + ", " + p.y()); // 3, 4
System.out.println(p); // Point[x=3, y=4] —— 自动生成 toString/equals/hashCode

// ===== Java 17+：sealed 类（ sealed 继承） =====
sealed interface Shape permits Circle2, Square2 {}
record Circle2(double r) implements Shape {}
record Square2(double side) implements Shape {}

// ===== Java 21+：虚拟线程（轻量级线程，高并发场景） =====
try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> System.out.println("虚拟线程运行"));
}
```

> 上述 Java 10+ 示例中，本机 JDK 8 环境无法编译。学习时可使用 JDK 17/21 的在线环境或本地多版本 JDK 切换工具（如 SDKMAN!、jenv）。

### JDK 8 ~ 25 版本新特性全览（补充）

> Java 自 9 起改为 **每 6 个月发布一个大版本**，每 3 年一个 **LTS（长期支持）版本**。目前主要 LTS 为 8、11、17、21、25。下表的特性以 OpenJDK 官方 JEP 为准，「预览」「孵化」表示需 `--enable-preview` 或 `--add-modules` 才能使用，可能在后续版本变更。

#### 逐版本特性速查表

| 版本 | 发布 | 定位 | 代表性新特性（JEP） |
|------|------|------|-------------------|
| **8** | 2014.03 | LTS | Lambda 表达式、Stream API、函数式接口、`java.time` 日期 API、Optional、接口默认方法/静态方法、方法引用 |
| **9** | 2017.09 | — | 模块系统 Jigsaw (JEP 261)、JShell (JEP 222)、集合工厂方法 `List.of` (JEP 269)、接口私有方法 (JEP 181)、G1 成为默认 GC (JEP 248)、紧凑字符串 (JEP 254) |
| **10** | 2018.03 | — | `var` 局部变量类型推断 (JEP 286)、应用类数据共享 AppCDS (JEP 310)、G1 并行 Full GC (JEP 307)、线程本地握手 (JEP 312) |
| **11** | 2018.09 | LTS | HTTP Client 正式 (JEP 321)、`String` 新方法 `isBlank/strip/lines/repeat`、单文件源码启动 `java Main.java` (JEP 330)、移除 JavaFX 与 CORBA、ZGC 实验 (JEP 333) |
| **12** | 2019.03 | — | switch 表达式（预览 JEP 325）、`Collectors.teeing`、G1 可中止混合集合、Shenandoah GC 实验 (JEP 379) |
| **13** | 2019.09 | — | 文本块（预览 JEP 355）、switch 表达式二次预览 (JEP 354)、动态 CDS 归档 (JEP 350) |
| **14** | 2020.03 | — | switch 表达式正式 (JEP 361)、文本块二次预览、`record`（预览 JEP 359）、`instanceof` 模式匹配（预览 JEP 305）、NPE 友好提示 (JEP 358)、移除 CMS GC (JEP 363) |
| **15** | 2020.09 | — | 文本块正式 (JEP 378)、sealed 类（预览 JEP 360）、隐藏类 (JEP 371)、ZGC/Shenandoah 正式、移除 Nashorn (JEP 372) |
| **16** | 2021.03 | — | `record` 正式 (JEP 395)、`instanceof` 模式匹配正式 (JEP 394)、`Stream.toList()`、jpackage 打包工具 (JEP 392)、强封装 JDK 内部 (JEP 396) |
| **17** | 2021.09 | LTS | sealed 类正式 (JEP 409)、switch 模式匹配（预览 JEP 406）、伪随机数生成器 API (JEP 356)、Foreign Function & Memory API（孵化 JEP 412）、Vector API（孵化 JEP 414） |
| **18** | 2022.03 | — | 默认 UTF-8 字符集 (JEP 400)、简单 Web 服务器 `jwebserver` (JEP 408)、Javadoc 代码片段 (JEP 413)、Finalization 废弃 (JEP 421) |
| **19** | 2022.09 | — | 虚拟线程（预览 JEP 425）、结构化并发（孵化 JEP 428）、作用域值 Scoped Values（孵化 JEP 429）、record 模式（预览 JEP 405）、Linux/RISC-V 移植 |
| **20** | 2023.03 | — | 虚拟线程二次预览、结构化并发/作用域值二次孵化、record 模式二次预览、Foreign Function & Memory API 二次预览 |
| **21** | 2023.09 | LTS | **虚拟线程正式** (JEP 444)、**序列集合** SequencedCollection (JEP 431)、switch 模式匹配正式 (JEP 441)、record 模式正式 (JEP 440)、分代 ZGC (JEP 439)、字符串模板（预览 JEP 430） |
| **22** | 2024.03 | — | **Foreign Function & Memory API 正式** (JEP 454)、未命名变量与模式 (JEP 456)、Stream Gatherers（预览 JEP 461）、多文件源码程序启动 (JEP 458)、类文件 API（预览 JEP 457） |
| **23** | 2024.09 | — | Markdown 文档注释 (JEP 467)、ZGC 分代模式成为默认 (JEP 474)、模块导入声明（预览 JEP 476）、灵活构造器体（预览 JEP 482）、`sun.misc.Unsafe` 内存访问方法废弃 (JEP 471) |
| **24** | 2025.03 | — | Stream Gatherers 正式 (JEP 485)、类文件 API 正式 (JEP 484)、AOT 类加载与链接 (JEP 483)、紧凑对象头（实验 JEP 450）、分代 Shenandoah（实验）、永久禁用 Security Manager (JEP 486)、抗量子密码 ML-KEM/ML-DSA (JEP 496/497) |
| **25** | 2025.09 | LTS | **作用域值正式** (JEP 506)、**模块导入正式** (JEP 511)、**紧凑源文件与实例 main 方法正式** (JEP 512)、**灵活构造器体正式** (JEP 513)、KDF API 正式 (JEP 510)、分代 Shenandoah 正式 (JEP 521)、稳定值（预览 JEP 502）、结构化并发五次预览 |

#### 各阶段关键特性代码示例

以下代码按主题组织，均在注释中标注最低版本。由于本机为 JDK 8，这些示例**未在本机编译验证**，需切换到对应版本 JDK 运行；标注「预览」的特性还需加 `--enable-preview` 参数。

**① 语法简化类（Java 9 ~ 21）**

```java
// ===== Java 9+：集合工厂方法，一行创建不可变集合 =====
List<String> list = List.of("a", "b", "c");
Set<Integer> set = Set.of(1, 2, 3);
Map<String, Integer> map = Map.of("Alice", 90, "Bob", 85);
// list.add("d"); // UnsupportedOperationException —— 不可变

// ===== Java 10+：var 局部变量类型推断（仅局部变量） =====
var name = "Alice";          // 推断为 String
var numbers = List.of(1,2,3); // 推断为 List<Integer>
// var 不能用于字段、方法参数、返回值、无初始化的变量

// ===== Java 11+：String 实用新方法 =====
System.out.println("   ".isBlank());      // true —— 判断空白
System.out.println("a\nb".lines().count()); // 2 —— 按行分割成流
System.out.println("ha".repeat(3));        // "hahaha"
System.out.println("  x  ".strip());       // "x" —— 比 trim 更智能

// ===== Java 14+：switch 表达式（正式），可返回值、无需 break =====
int day = 3;
String name2 = switch (day) {
    case 1, 2, 3, 4, 5 -> "工作日";
    case 6, 7 -> "周末";
    default -> "非法";
};

// ===== Java 16+：instanceof 模式匹配（正式），免去强制转换 =====
Object obj = "hello";
if (obj instanceof String s && s.length() > 3) {
    System.out.println(s.toUpperCase()); // 直接用 s，无需 (String) obj
}

// ===== Java 21+：序列集合 SequencedCollection（新增统一接口） =====
SequencedCollection<Integer> seq = new ArrayList<>(List.of(1, 2, 3));
seq.addFirst(0);              // 头插
seq.addLast(4);               // 尾插
System.out.println(seq.getFirst()); // 0
System.out.println(seq.reversed()); // [4, 3, 2, 1, 0]
```

**② 数据建模类：record 与 sealed（Java 14 ~ 17）**

```java
// ===== Java 16+：record —— 不可变数据载体，自动生成构造器/getter/equals/hashCode/toString =====
record Point(int x, int y) {
    // 可紧凑构造器做校验
    public Point {
        if (x < 0 || y < 0) throw new IllegalArgumentException("坐标不能为负");
    }
    public double distance() { return Math.sqrt(x * x + y * y); }
}
Point p = new Point(3, 4);
System.out.println(p);           // Point[x=3, y=4]
System.out.println(p.x());       // 3 —— 访问器是 x() 而非 getX()
System.out.println(p.distance());// 5.0

// ===== Java 17+：sealed 类 —— 限定哪些类可以继承，用于建模封闭领域 =====
sealed interface Shape permits Circle, Rectangle {}
record Circle(double r) implements Shape {}
record Rectangle(double w, double h) implements Shape {}
// final class Triangle implements Shape {} // 编译错误：不在 permits 列表中

// ===== Java 21+：switch 模式匹配 + record 解构（正式） =====
double area(Shape shape) {
    return switch (shape) {
        case Circle(double r) -> Math.PI * r * r;
        case Rectangle(double w, double h) -> w * h;
    };
}
```

**③ 并发与响应式类（Java 19 ~ 25）**

```java
// ===== Java 21+：虚拟线程 —— 轻量级线程，百万级并发不再是难题 =====
try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1000; i++) {
        executor.submit(() -> {
            Thread.sleep(10);
            return 1;
        });
    }
} // 自动关闭，等待所有任务完成

// ===== Java 25+：作用域值 Scoped Values（正式）—— ThreadLocal 的现代替代，不可变、开销更低 =====
static final ScopedValue<String> USER = ScopedValue.newInstance();
ScopedValue.where(USER, "Alice").run(() -> {
    System.out.println(USER.get()); // Alice —— 仅在此作用域及其子线程可见
});

// ===== Java 25+（预览）：结构化并发 —— 把相关任务当作一个工作单元管理 =====
// try (var scope = StructuredTaskScope.open()) {
//     var user = scope.fork(() -> loadUser());
//     var order = scope.fork(() -> loadOrder());
//     scope.join();
//     System.out.println(user.get() + order.get());
// }
```

**④ 现代工程化类（Java 22 ~ 25）**

```java
// ===== Java 22+：未命名变量 _ —— 表示不使用的变量，让代码意图更清晰 =====
try {
    Integer.valueOf("abc");
} catch (NumberFormatException _) {   // 异常对象不使用
    System.out.println("数字格式错误");
}

// ===== Java 24+：Stream Gatherers（正式）—— 自定义中间操作，补全 Stream API =====
var pairs = java.util.stream.Stream.of(1, 2, 3, 4)
        .gather(java.util.stream.Gatherers.windowFixed(2)) // 每 2 个元素一组
        .toList(); // [[1, 2], [3, 4]]

// ===== Java 25+：模块导入声明（正式）—— 一次导入整个模块导出的包 =====
// import module java.base;  // 无需逐个 import java.util.List 等

// ===== Java 25+：紧凑源文件与实例 main 方法（正式）—— 入门不再需要 public static void main =====
// 文件名 Main.java，内容仅需：
// void main() {
//     println("Hello, Java 25!"); // 自动导入 IO 与常用 API
// }
// 运行：java Main.java

// ===== Java 25+：灵活构造器体（正式）—— 允许在 super(...) 之前写校验语句 =====
// class Employee extends Person {
//     Employee(int age) {
//         if (age < 18) throw new IllegalArgumentException("年龄不合法"); // super() 之前
//         super(age);
//     }
// }
```

> **版本选择建议**：新项目优先选 **Java 21 或 25**（LTS，特性丰富、生态支持好）；遗留系统维护跟随现有版本即可。使用预览特性时注意其可能在后续版本变更，生产环境慎用。

## 7. JVM 调优与性能排查

### 常用 JVM 参数

```bash
# 堆内存设置
-Xms512m              # 初始堆大小
-Xmx2g                # 最大堆大小（通常设为 -Xms 相同值，避免扩容抖动）
-Xmn256m              # 新生代大小
-XX:MetaspaceSize=128m # 元空间初始大小

# GC 选择与日志
-XX:+UseG1GC          # 使用 G1 收集器（JDK 9+ 默认）
-Xlog:gc*             # 打印 GC 日志（JDK 9+）
-XX:+PrintGCDetails   # 打印 GC 详情（JDK 8）

# 调优示例
java -Xms1g -Xmx1g -XX:+UseG1GC -jar app.jar
```

### 排查工具

| 工具 | 用途 |
|------|------|
| `jps` | 查看 Java 进程 |
| `jstat` | 查看 GC 统计、类加载情况 |
| `jmap` | 导出堆转储（heap dump） |
| `jstack` | 查看线程栈，排查死锁 |
| `jcmd` | 综合诊断命令 |
| VisualVM / Arthas | 可视化监控与在线诊断 |

```bash
# 排查示例
jps -l                          # 列出 Java 进程 PID
jstat -gcutil <pid> 1000 10     # 每 1 秒采样一次 GC 情况，共 10 次
jmap -dump:format=b,file=heap.hprof <pid>  # 导出堆快照，用 MAT 分析内存泄漏
jstack <pid> > thread.txt       # 导出线程栈，分析死锁
```

### 代码层优化建议

```java
// 1. 循环中拼接字符串用 StringBuilder，不要用 +
// 2. 集合预设初始容量，避免频繁扩容
java.util.List<String> list = new java.util.ArrayList<>(1000); // 已知大约 1000 个元素

// 3. 避免不必要的自动装箱
int sum = 0;
for (int i = 0; i < 100000; i++) sum += i; // 用基本类型，不用 Integer

// 4. 及时释放无用引用（尤其是大对象）
// 5. 合理使用缓存，避免重复计算
// 6. 减少同步范围，降低锁竞争
```

## 8. 单元测试与构建工具

### JUnit 5 示例（需 Java 8+，引入 junit-jupiter 依赖）

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    @Test
    @DisplayName("加法测试")
    void testAdd() {
        assertEquals(5, 2 + 3);
    }

    @Test
    void testThrows() {
        assertThrows(ArithmeticException.class, () -> {
            int x = 1 / 0;
        });
    }

    @BeforeEach
    void setUp() { System.out.println("每个测试前执行"); }

    @AfterEach
    void tearDown() { System.out.println("每个测试后执行"); }
}
```

### Maven 基础（pom.xml 核心结构）

```xml
<!-- pom.xml -->
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.0</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

```bash
# 常用 Maven 命令
mvn compile       # 编译
mvn test          # 运行测试
mvn package       # 打包（生成 jar）
mvn clean install # 清理、构建并安装到本地仓库
```

---

# 附录：学习路线与资源

## 建议练习路径

| 阶段 | 推荐练习项目 |
|------|-------------|
| 基础 | 学生成绩管理系统（控制台版）、猜数字游戏、通讯录 |
| 进阶 | 图书管理系统（集合 + IO 持久化）、多线程售票模拟、简单聊天室 |
| 高阶 | 手写线程池、实现迷你 Spring IoC 容器（反射 + 注解）、高并发秒杀系统 |

## 推荐资源

- **官方文档**：Oracle Java Documentation、Java Language Specification
- **书籍**：《Java 核心技术》（Core Java）、《Effective Java》、《深入理解 Java 虚拟机》、《Java 并发编程实战》
- **练习**：LeetCode（算法）、HackerRank（Java 专项）、Codewars
- **工具**：IntelliJ IDEA（主流 IDE）、VisualVM、Arthas（在线诊断）

## 检验学习成果的自测题

1. `==` 与 `equals` 的区别？为什么字符串比较要用 `equals`？
2. Java 是值传递还是引用传递？如何用代码证明？
3. `final` 修饰引用类型变量时，什么不可变、什么可变？
4. 重载（Overload）与重写（Override）的区别？
5. 抽象类与接口的区别？Java 8 之后接口有了哪些新能力？
6. 受检异常与非受检异常的区别？finally 一定会执行吗？
7. ArrayList 与 LinkedList 的区别？HashMap 的底层原理是什么？
8. 泛型为什么有类型擦除？`List<? extends T>` 与 `List<? super T>` 的区别？
9. Stream 的中间操作和终止操作有什么区别？Stream 能重复使用吗？
10. 创建线程有几种方式？`synchronized` 与 `ReentrantLock` 的区别？
11. JVM 的内存区域有哪些？哪些是线程共享的？
12. GC Roots 有哪些？标记-清除、复制、标记-整理算法各自的优缺点？
13. 单例模式的五种实现中，为什么推荐枚举和静态内部类？
14. `volatile` 能保证原子性吗？它的作用是什么？
15. ThreadLocal 为什么可能导致内存泄漏？如何避免？

---
