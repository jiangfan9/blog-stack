---
title: Java
date: 2024-02-28
categories: [后端开发]
tags: [Java, 基础]
description: Java 基础知识点整理：访问权限、集合、并发与常用 API。
coverImg: /images/cover-4.svg
permalink: /posts/java
---


### 一. java四种访问权限修饰符

#### 1.四种访问权限修饰符的范围

|              | public | protected | (default) | private |
| ------------ | ------ | --------- | --------- | ------- |
| 同一个类     | √      | √         | √         | √       |
| 同一个包     | √      | √         | √         | ×       |
| 子孙类       | √      | √         | ×         | ×       |
| 不同包非子类 | √      | ×         | ×         | ×       |

（说明：其中√表示可访问×表示不可访问 ，default为默认修饰符，并不是关键字，不用写）
四种修饰符按权限大小：public>protected>(default)>private

### 二. final关键字

#### 1.用来修饰一个类

如果引用为基本数据类型，则该引用为常量，该值无法修改；
如果引用为引用数据类型，比如对象、数组，则该对象、数组本身可以修改，但指向该对象或数组的地址的引用不能修改。
如果引用为类的成员变量，则必须当场赋值，否则编译会报错。

#### 2.用来修饰一个方法

当使用final修饰方法时，这个方法将成为最终方法，无法被子类重写。但是，该方法仍然可以被继承。

#### 3.用来修饰类

当用final修改类时，该类成为最终类，无法被继承。简称为“断子绝孙类”。

### 三. 基本数据类型对应的包装类

#### 1.基本数据类型对应的包装类

| 基本数据类型 | 包装类    |
| ------------ | --------- |
| byte         | Byte      |
| short        | Short     |
| int          | Integer   |
| float        | Float     |
| double       | Double    |
| char         | Character |
| boolean      | Boolean   |

#### 2.基本数据类型 -> 字符串

(1)基本数据类型的值+““（最简单的方式）
(2)使用包装类中的静态方法：static String toString(int i) 返回表示指定整数的 String对象。
(3)使用String类中的静态方法：static String valueOf(int i) 返回 int参数的字符串表示形式。 

#### 3.字符串 -> 基本数据类型

(1)使用包装类中的静态方法parseXX("字符串")
(2)static int parseInt(String s) 将字符串参数解析为带符号的十进制整数。  
(3)static double parseDouble(String s) 返回一个新 double初始化为指定的代表的值 String ，如通过执行 valueOf类的方法 Double 。 

### 四.集合

#### 1.List

|            | 底层数据结构 | 查询速度 | 增删速度 | 线程安全 | 效率 | 是否可以存储重复元素 |
| ---------- | ------------ | -------- | -------- | -------- | ---- | -------------------- |
| ArrayList  | 数组         | 快       | 慢       | 不安全   | 高   | 可以                 |
| LinkedList | 链表         | 慢       | 快       | 不安全   | 高   | 可以                 |
| Vector     | 数组         | 快       | 满       | 安全     | 低   | 可以                 |

（注意：Vector：它的方法上加了synchronized关键字，所以它是线程安全的，但也因此，它的效率很低，几乎已经被淘汰了。

**适用场景分析**：当需要对数据进行对此访问的情况下选用ArrayList，当需要对数据进行多次增加删除修改时采用LinkedList。）

#### 2.Set

|               | 底层数据结构         | 元素顺序 | 线程安全 | 效率 | 是否可以存储null元素 |
| ------------- | -------------------- | -------- | -------- | ---- | -------------------- |
| HashSet       | 哈希表               | 无序     | 不安全   | 高   | 可以                 |
| LinkedHashSet | 链表和哈希表共同实现 | 有序     | 不安全   | 高   | 可以                 |
| TreeSet       | 二叉树               | 无序     |          |      | 不可以               |

（注意：HashSet：元素的唯一性是靠所存储元素类型是否重写hashCode()和equals()方法来保证的，如果没有重写这两个方法，则无法保证元素的唯一性.

TreeSet:元素唯一且已经排好序；唯一性同样需要重写

LinkedHashSet：是HashSet的子类，链表保证元素的添加顺序，哈希表保证元素的唯一性。

**适用场景分析**：HashSet是基于Hash算法实现的，其性能通常都优于TreeSet。为快速查找而设计的Set，我们通常都应该使用HashSet，在我们需要排序的功能时，我们才使用TreeSet。）

#### 3.Map

Map用于保存具有映射关系的数据，Map里保存着两组数据：key和value，它们都可以使任何引用类型的数据，但key不能重复。所以通过指定的key就可以取出对应的value。

|               | key值是否有序 | key值是否排序 | key值是否排序 | key值是否可以为NULL |
| ------------- | ------------- | ------------- | ------------- | ------------------- |
| HashMap       | 否            | 否            | 否            | 是                  |
| LinkedHashMap | 是            | 否            | 否            | 是                  |
| TreeMap       | 否            | 是            | 否            | 否                  |

（注意：存入TreeMap中的元素要么实现了Comparatable接口；要么使用Comparator接口作为构造参数创建Set对象。）

**适用场景分析**：如果更新时不需要保持元素的顺序，就使用HashMap，如果需要保持元素的插入顺序或者访问顺序，就使用LinkedHashMap，如果需要使图按照键值排序，就使用TreeMap。

HashMap：适用于Map中插入、删除和定位元素。
Treemap：适用于按自然顺序或自定义顺序遍历键(key)。

#### 4.List和Set总结

1.List,Set都是继承自Collection接口，Map则不是
2.List特点：元素有放入顺序，元素可重复 ，Set特点：元素无放入顺序，元素不可重复，重复元素会覆盖掉，（注意：元素虽然无放入顺序，但是元素在set中的位置是有该元素的HashCode决定的，其位置其实是固定的，加入Set 的Object必须定义equals()方法 ，另外list支持for循环，也就是通过下标来遍历，也可以用迭代器，但是set只能用迭代，因为他无序，无法用下标来取得想要的值。）
3.Set和List对比：
Set：检索元素效率低下，删除和插入效率高，插入和删除不会引起元素位置改变。
List：和数组类似，List可以动态增长，查找元素效率高，插入删除元素效率低，因为会引起其他元素位置改变。
4.ArrayList与LinkedList的区别和适用场景
Arraylist：
优点：ArrayList是实现了基于动态数组的数据结构,因为地址连续，一旦数据存储好了，查询操作效率会比较高（在内存里是连着放的）。
缺点：因为地址连续， ArrayList要移动数据,所以插入和删除操作效率比较低。

LinkedList：
优点：LinkedList基于链表的数据结构,地址是任意的，所以在开辟内存空间的时候不需要等一个连续的地址，对于新增和删除操作add和remove，LinkedList比较占优势。LinkedList 适用于要头尾操作或插入指定位置的场景
缺点：因为LinkedList要移动指针,所以查询操作性能比较低。

**适用场景分析**：
当需要对数据进行对此访问的情况下选用ArrayList，当需要对数据进行多次增加删除修改时采用LinkedList。

### 五. 泛型

#### 1.含有泛型的方法：

格式：修饰符 &lt;泛型> 返回值类型 方法名（参数列表（可以使用泛型））{}
或 修饰符 static &lt;泛型> 返回值类型 方法名（参数列表（可以使用泛型））{}

```java
public class GenericMethod {
    //含有泛型的普通方法
    public &lt;E> void method(E e){
        System.out.println(e);
    }
    //含有泛型的静态方法
    public static &lt;M> void method01(M m){
        System.out.println(m);
    }
}
```

#### 2.含有泛型的类：

格式：修饰符 class 类名&lt;泛型>{}

```java
/**
含有泛型的类：变量的类型是泛型，方法的参数类型和返回值类型也是泛型
*/
public class GenericClass&lt;E> {
private E name;
private E password;

public GenericClass(E name, E password) {
    this.name = name;
    this.password = password;
}

public E getName() {
    return name;
}

public void setName(E name) {
    this.name = name;
}

public E getPassword() {
    return password;
}

public void setPassword(E password) {
    this.password = password;
}
}
```

#### 3.含有泛型的接口

格式：修饰符 interface 接口名&lt;泛型>{}

```java
/**

含有泛型的接口

@param &lt;E>
*/
public interface IGeneric&lt;E> {
void method(E e) ;
}
```

```java
/**

含有泛型的接口的实现类：

第一种表示方式：实现接口，并指定泛型
*/
public class GenericImp1 implements IGeneric&lt;String>{

@Override
public void method(String s) {
    System.out.println(s);
}
}
```

```java
/**

含有接口的实现类：

第二种表示方式：接口使用什么类型，实现类就使用什么类型

就相当于定义了一个含有泛型的类，创建对象时指定泛型的类型
*/
public class GenericImp2&lt;E> implements IGeneric&lt;E>{

@Override
public void method(E e) {
    System.out.println(e);
}
}
```

#### 4.泛型的通配符

如果不知道数据类型，可以用？代替，只能在传参的时候使用通配符，定义的时候不能使用通配符

```java
import java.util.ArrayList;
import java.util.Iterator;

/**

泛型通配符
*/
public class GenericTpf {
public static void main(String[] args) {
    ArrayList&lt;String> arrayList = new ArrayList&lt;>();
    arrayList.add("aa");
    arrayList.add("bb");
    ArrayList&lt;Integer> arrayList1 = new ArrayList&lt;>();
    arrayList1.add(1);
    arrayList1.add(2);
    printArray(arrayList);
    printArray(arrayList1);
}
public static void printArray(ArrayList&lt;?> arrayList) {
    //使用迭代器遍历
    Iterator&lt;?> it = arrayList.iterator();
    while (it.hasNext()){
        //it.next()方法，取出的元素是Object类型
        Object next = it.next();
        System.out.println(next);
    }
}
}
```

#### 5.泛型的限定

泛型的上限限定：？extends E 代表使用的泛型只能是E类型的子类或本身
泛型的下限限定：? super E 代表使用的泛型只能是E类型的父类或本身

### 六. 异常

#### 1.异常关系图

![异常](https://fanaidi.gitee.io/blogimgs/Java/%E5%BC%82%E5%B8%B8%E5%85%B3%E7%B3%BB%E5%9B%BE.jpg)

```java
package exception;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ExceptionTest {
    public static void main(String[] args) {
        //编译期异常，进行编码（写代码），程序出现异常
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("YYYY-MM-DD");
        Date date = null;
        try {
            date = simpleDateFormat.parse("1999-11");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        System.out.println(date);
        System.out.println("后续代码");
        System.out.println("---------------------------");
        //运行期异常，Java程序运行过程中出现的错误
        int[] arr = {1,2,3};
        try {
            System.out.println(arr[3]);
        }catch (Exception e){
            System.out.println(e);
        }
    }
}
```

```java
/**

OutOfMemoryError 内存溢出错误，后续代码不会执行
*/
public class ErrorTest {
public static void main(String[] args) {
    int[] arr = new int[1024*1024*1024];
    System.out.println("后续代码");
}
}
```

#### 2.throw

**格式：**throw new xxxException("异常产生的原因");
**作用：**使用throw关键字在指定的方法中抛出指定的异常
**注意：**throw关键字必须写在方法的内部
	 throw关键字后面new的对象必须是Exception或者Exception的子类
	 throw关键字抛出指定的异常对象，我们就必须处理这个异常对象
	 throw关键字后面创建的是RuntimeException或RuntimeException的子类对象，我们可以不处理，默认交给JVM处理（打印异常对象，中断程序）
	 throw关键字后面创建的编译异常（写代码的时候报错），我们就必须处理这个异常，要么throws，要么try...catch

```java
public class ThrowTest {
    public static void main(String[] args) {
//        int[] arr = null;
//        test001(arr,0);
        System.out.println("------------------------------------------------");
        int[] arr2 = new int[3];
        test001(arr2,3);
    }
    //传入一个数组和下标，输出指定的值
    private static void test001(int[] arr,int index) {
        //对传入的arr进行合法性校验
        if(arr == null){
            throw new NullPointerException("数组为空");
        }
        //对传入的index进行合法性校验
        if(index&lt;0 || index >arr.length-1){
            throw new ArrayIndexOutOfBoundsException("数组溢出");
        }
    }
}
```

可以使用Objects.requireNonNull()方法对参数进行合法性判断（判断参数是否为NULL）

```java
import java.util.Objects;

public class ObjTest {
    public static void main(String[] args) {
        test001(null);
    }

private static void test001(Object o) {
    Objects.requireNonNull(o,"传入的值不能为空");
}

}
```

#### 3.throws

**格式：**

> 在方法声明时使用
> 修饰符 返回值类型 方法名（参数列表） throws AAAException,BBBException...{
> throw new AAAException("产生原因");
> throw new BBBException("产生原因");
> }

**作用：**

> 当方法内部抛出异常对象的时候，那么我们就必须处理这个异常对象可以使用throws关键字处理异常对象，会把异常对象声明抛出给方法的调用者处（自己不处理，让别人处理），最终交给JVM处理（中断处理）

**注意**

> (1).throws关键字必须写在方法声明处
> (2).throws关键字后面声明的异常必须是Exception或Exception的子类
> (3).方法内部如果抛出了多个异常对象，那么throws后面也必须声明多个异常。如果抛出的异常有子父类关系，那么直接声明父类异常即可。
> (4).调用了一个声明抛出异常的方法，我们就必须处理声明的异常。要么继续使用throws声明抛出，交给方法的调用者处理，最终交给JVM。要么		 try...catch..自己处理

##### a.异常处理的第一种方式（交给别人处理）

```java
import java.io.FileNotFoundException;
   import java.io.IOException;

   public class ThrowsTest {
       //FileNotFoundException extends IOException
       public static void main(String[] args) throws IOException{
           test001("c://a.tx");
       }
       //判断文件路径的合法性
       private static void test001(String fileName) throws FileNotFoundException,IOException{
           //判断路径
           if(!fileName.equals("c://a.txt")){
               throw new FileNotFoundException("找不到c:/a.txt");
           }
           System.out.println("找到了");
       }
   }
```

##### b.异常处理的第二种方式（自己处理）try...catch

**格式：**

> try{
> 可能产生异常的代码
> }catch(定义一个异常的变量，用来接收try中接收的异常对象){
> 异常的处理逻辑，获取异常对象后，怎么处理异常对象
> 一般在工作中，会把异常的信息记录到日志中
> }
> ...
> catch(异常类型名 变量名){
>
> }

**注意：**

> (1).try中可能会抛出多个异常对象，那么就可以使用多个catch处理这些异常对象
> (2).如果try中产生了异常，就会执行catch中的异常处理逻辑，执行完毕catch中的异常处理逻辑，就会执行try...catch之后的代码。
> (3).如果try中没有产生异常，就不会执行catch中的异常处理逻辑。执行完try中的代码，继续执行try...catch之后的代码。

```java
import java.io.FileNotFoundException;
import java.io.IOException;

public class ThrowsTest {
    //FileNotFoundException extends IOException
    public static void main(String[] args){
        try {
            //可能产生异常的代码
            test001("c://a.tx");
        } catch (IOException e) {//try中抛出什么异常对象，catch就定义什么异常变量，用来接收这个异常变量
            e.printStackTrace();
        }
        //后续代码
        System.out.println("后续代码");
    }
    //判断文件路径的合法性
    private static void test001(String fileName) throws FileNotFoundException,IOException{
        //判断路径
        if(!fileName.equals("c://a.txt")){
            throw new FileNotFoundException("找不到c:/a.txt");
        }
    }
}
```

#### 4.异常处理方法

> getMessage() 返回此可抛出的简短描述。
> toString() 返回此throwable的详细消息字符串。 
> printStackTrace() 将此throwable和其追溯打印到标准错误流。（JVM打印异常对象，默认此方法，打印的异常信息是最全面的） 

```java
import java.io.FileNotFoundException;
import java.io.IOException;

public class ThrowsTest {
    //FileNotFoundException extends IOException
    public static void main(String[] args){
        try {
            //可能产生异常的代码
            test001("c://a.txt");
        } catch (IOException e) {//try中抛出什么异常对象，catch就定义什么异常变量，用来接收这个异常变量
            e.printStackTrace();
            e.getMessage();
            System.out.println(e.toString());
        }
        //后续代码
        System.out.println("后续代码");
    }
    //判断文件路径的合法性
    private static void test001(String fileName) throws FileNotFoundException,IOException{
        //判断路径
        if(!fileName.equals("c://a.txt")){
            throw new FileNotFoundException("找不到c:/a.txt");
        }
    }
    private static void test002(String fileName) throws IOException{
        //判断后缀是不是.txt结尾
        if(!fileName.endsWith(".txt")){
            throw new IOException("文件不是以.txt结尾");
        }
    }
}
```

#### 5.finally代码块

**格式：**

> try{
> 可能产生异常的代码
> }catch(定义一个异常的变量，用来接收try中接收的异常对象){
> 异常的处理逻辑，获取异常对象后，怎么处理异常对象
> 一般在工作中，会把异常的信息记录到日志中
> }finall{
> 无论是否出现异常都会执行
> }

**注意：**

> (1).finally不能单独使用，必须和try一起使用
> (2).finally一般用于资源释放，无论程序是否出现异常，都要释放资源（IO）
> (3).如果finally有return语句，永远返回finally里面的结果，避免该情况

```java
import java.io.FileNotFoundException;
import java.io.IOException;

public class ThrowsTest {
    //FileNotFoundException extends IOException
    public static void main(String[] args){
        try {
            //可能产生异常的代码
            test002("c://a.tx");
        } catch (IOException e) {//try中抛出什么异常对象，catch就定义什么异常变量，用来接收这个异常变量
            e.printStackTrace();
//            e.getMessage();
//            System.out.println(e.toString());
        }finally {
            System.out.println("释放资源");
        }
        //后续代码
        System.out.println("后续代码");
    }
    //判断文件路径的合法性
    private static void test001(String fileName) throws FileNotFoundException,IOException{
        //判断路径
        if(!fileName.equals("c://a.txt")){
            throw new FileNotFoundException("找不到c:/a.txt");
        }
    }
    private static void test002(String fileName) throws IOException{
        //判断后缀是不是.txt结尾
        if(!fileName.endsWith(".txt")){
            throw new IOException("文件不是以.txt结尾");
        }
    }
}
```

#### 6.异常的注意事项

(1).多个异常分别处理
(2).多个异常一次捕获，多次处理（注意：catch里面定义的异常变量，如果有子父类关系，那么子类的异常变量必须在上面，否则就会报错
ArrayIndexOutOfBoundsException extends IndexOutOfBoundsException）
解析：try中如果出现了异常对象，会把异常对象抛出给catch处理，抛出的异常对象会从上往下依次赋值给catch中定义的异常变量。如果上面是父类的异常对象，抛出的异常对象都会赋值给父类的异常对象，子类的异常对象就不会被使用。（多态）
(3).一次捕获，一次处理（运行时异常被抛出可以不处理，即不捕获也不声明，默认给虚拟机处理，终止程序，什么时候不抛出运行时异常了，再继续执行）

```java
import java.util.List;

public class ExceptiZhuYi {
    public static void main(String[] args) {
        //多个异常分别处理
        try {
            int[] arr = new int[3];
            System.out.println(arr[3]);//ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
        } catch (ArrayIndexOutOfBoundsException e) {
            e.printStackTrace();
        }
        try {
            List&lt;Integer> list = List.of(1, 2, 3);
            System.out.println(list.get(3));//IndexOutOfBoundsException: Index 3 out of bounds for length 3
        } catch (IndexOutOfBoundsException e) {
            e.printStackTrace();
        }
        //多个异常一次捕获，多次处理
        //ArrayIndexOutOfBoundsException extends IndexOutOfBoundsException
        try {
            int[] arr = new int[3];
            System.out.println(arr[3]);//ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
            List&lt;Integer> list = List.of(1, 2, 3);
            System.out.println(list.get(3));//IndexOutOfBoundsException: Index 3 out of bounds for length 3
        } catch (ArrayIndexOutOfBoundsException e) {
            e.printStackTrace();
        } catch (IndexOutOfBoundsException e) {
            e.printStackTrace();
        }
        //一次捕获，一次处理
        try {
            int[] arr = new int[3];
            System.out.println(arr[3]);//ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
            List&lt;Integer> list = List.of(1, 2, 3);
            System.out.println(list.get(3));//IndexOutOfBoundsException: Index 3 out of bounds for length 3
        } catch (Exception e) {
            e.printStackTrace();
        }
        //运行时异常被抛出可以不处理，即不捕获也不声明
        //默认给虚拟机处理，终止程序，什么时候不抛出运行时异常了，再继续执行
        int[] arr = new int[3];
        System.out.println(arr[3]);//ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
        List&lt;Integer> list = List.of(1, 2, 3);
        System.out.println(list.get(3));//IndexOutOfBoundsException: Index 3 out of bounds for length 3
    }
}
```

#### 7.子父类异常

  (1)如果父类抛出了多个异常，子类重写父类方法时，抛出和父类相同的异常或父类异常的子类或不抛出
  (2)父类方法没有抛出异常，子类重写父类方法时也不能抛出异常。此时子类产生该异常，只能捕获处理，不能声明抛出。
  注意：父类什么样子，子类就什么样子

#### 8.自定义异常类

**格式:** 

> public class xxxException extends Exception|RuntimeException{
>  添加一个空参数的构造方法
>  添加一个带异常信息的构造方法
>  }

 **注意：**

> (1).自定义异常类一般是以Exception结尾，说明该类是一个异常类
> (2).自定义异常类必须继承Exception或RuntimeException
> (3).继承Exception：要么自定义的异常类就是一个编译器异常类，如果方法内部抛出了编译器异常，就必须处理这个异常，要么throws，要么try..catch
> (4).继承RuntimeException: 要么自定义的异常类就是一个运行期异常，无需处理，交给虚拟机处理。

```java
public class RegisterException extends Exception{

public RegisterException() {
    super();
}

public RegisterException(String message) {
    super(message);
}

}
```

### 七. 线程和进程

#### 1.并发和并行

并发：交替执行
并行：同时执行

#### 2.线程和进程

线程：是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位。一条线程指的是进程中一个单一顺序的控制流，一个进程中可以并发多个线程，每条线程并行执行不同的任务。

进程：进程是一个具有一定独立功能的程序关于某个数据集合的一次运行活动。它是操作系统动态执行的基本单元，在传统的操作系统中，进程既是基本的分配单元，也是基本的执行单元。

#### 3.创建多线程

##### a.创建多线程的第一种方式：

​	1.创建Thread类的子类

​	2.在Thread类的子类中重写Thread类的run方法，设置线程任务

​	3.创建Thread类的子类对象

​	4.调用Thread类的start方法，开启新的线程，执行run方法

​	**注意：**

​	public void start()

​	导致此线程开始执行;Java虚拟机调用此线程的`run`方法。

​	结果是两个线程同时运行：当前线程（从调用返回到start方法）和另一个线程（执行其run方法）。 

​	不止一次启动线程是不合法的。 特别地，一旦线程完成执行就可能不会重新启动。 

##### b.创建线程的第二种方式：

​	1.创建runable接口的实现类

​	2.在实现类中重写runable接口的run方法 ，设置线程任务

​	3.创建runable接口的实现类对象

​	4.创建Thread类对象，构造方法中传递runable接口的实现类对象

​	5.调用Thread类对象的start方法，开启新线程执行run方法

##### c.匿名内部类方式实现线程的创建

**匿名内部类作用：**简化代码

**解析：**把子类继承父类，重写父类的方法，创建子类对象合一步完成。

​			    把实现类实现接口，重写接口中的方法，创建实现类对象合成一步完成。

**匿名内部类的最终产物：**子类/实现类对象，而这个类没有名字。

**格式：**

new 父类/接口（）{

​	重写父类/接口中的方法

}

~~~java
package com.company.threadTest;

public class ThreadTest {
    public static void main(String[] args) {
        //线程的父类Thread
        new Thread(){
            //重写run方法，设置线程任务
            @Override
            public void run() {
                for (int i = 0; i &lt; 10; i++) {
                    System.out.println(Thread.currentThread().getName()+"  "+i);
                }
            }
        }.start();
        //线程的接口Runnable
        new Thread(new Runnable(){

            @Override
            public void run() {
                for (int i = 0; i &lt; 10; i++) {
                    System.out.println(Thread.currentThread().getName()+"  "+i);
                }
            }
        }).start();
    }
}
~~~



#### 4.Thread和Runable的区别

​	实现Runnable接口创建多线程的好处：

​	1.避免了单线程的局限性（实现Runnable接口，还可以继承其他类，实现其他接口）

​	2.增强程序的扩展性，降低程序的耦合性（实现Runnable接口的方式，把设置线程任务和开启新线程进行了分离。实现类中重写了run方法：用来设置线程任务。创建Thread类对象，调用start方法，开启新的线程执行run方法）

#### 5.线程安全

##### 1.线程安全

- 单线程程序是不会出现安全问题的
- 多线程程序，没有访问共享数据，不会产生问题
- 多线程访问了共享的数据，会产生线程安全问题

##### 2.线程同步

有三种方式完成同步操作：

- 同步代码块
- 同步方法
- 锁机制

##### 3.同步代码块

synchronized关键字可以用于方法中的某个区块中，表示只对这个区块的资源实行互斥访问。

**格式：**

> synchronized(同步锁){
> 需要同步操作的代码
> }

同步锁：对象的同步锁只是一个概念，可以想象为在对象上标记了一个锁。

1.锁对象可以是任意类型

2.多个线程对象 要使用同一把锁。

（注意：在任何时候，最多允许一个线程拥有同步锁，谁拿到锁就进入代码块，其他的线程只能在外面等着（BLOCKED））

##### 4.同步方法

**格式：**

> 修饰符 synchronized 返回值类型 方法名（参数列表）{
> 可能会出现线程安全问题的代码
> }

**解析：**同步方法会把方法内部的代码锁住，只让一个线程执行，同步方法的锁对象就是实现类对象。

**4.1静态的同步方法**

**格式:**

> 修饰符 static synchronized 返回值类型 方法名（参数列表）{
> 可能会出现线程安全问题的代码
> }

**解析：**锁对象是谁？不能是this，this是创建对象之后产生的，静态方法优先于对象，静态方法的锁对象是本类的class属性-->class文件对象（反射)

##### 5.Lock锁

**使用步骤：**

> 1.在成员位置创建ReentrantLock对象
> 2.在可能会出现安全问题的代码前调用Lock接口中的lock方法获取锁。
> 3.在可能会出现安全问题的代码后调用Lock接口中的unlock方法释放锁。

#### 6.线程状态

##### 1.线程状态概述

- NEW
  至今尚未启动的线程处于这种状态。 
- RUNNABLE
  正在  Java 虚拟机中执行的线程处于这种状态。 
- BLOCKED
  受阻塞并等待某个监视器锁的线程处于这种状态。 
- WAITING
  无限期地等待另一个线程来执行某一特定操作的线程处于这种状态。 
- TIMED_WAITING
  等待另一个线程来执行取决于指定等待时间的操作的线程处于这种状态。 
- TERMINATED
  已退出的线程处于这种状态。 

![线程状态图](https://fanaidi.gitee.io/blogimgs/Java/%E7%BA%BF%E7%A8%8B%E7%8A%B6%E6%80%81%E5%9B%BE.png)

~~~java
public class WaitAndNotify {
    public static void main(String[] args) {
        //创建锁对象保证唯一
        Object obj = new Object();
        //创建顾客线程
        new Thread(){
            @Override
            public void run() {
                synchronized (obj){
                    System.out.println("顾客：告知老板要的包子数量");
                    try {
                        obj.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                //唤醒之后执行的代码
                System.out.println("顾客：开吃");
            }
        }.start();
        //创建老板线程
        new Thread(){
            @Override
            public void run() {
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (obj){
                      System.out.println("老板：花了五秒做包子,做好之后，告知顾客可以吃了");
                      obj.notify();
                  }
            }
        }.start();
    }
}
~~~

#### 7.调用wait和notify方法需要注意的细节

> 1.wait方法和notify方法必须由同一个锁对象调用。因为：对应的锁对象可以通过notify唤醒使用同一个锁对象调用的wait方法后的线程。
> 2.wait方法和notify方法是属于Object类的方法。因为：锁对象可以是任意对象，而任意对象的所属类都是继承Object类
> 3.wait方法和notify方法必须要在同步代码块或是同步函数中使用。因为：必须通过锁对象调用这两个方法。

#### 8.线程池

![](https://fanaidi.gitee.io/blogimgs/Java/%E7%BA%BF%E7%A8%8B%E6%B1%A0.jpg)

线程池：JDK1.5之后提供的

java.util.concurrent.Executors：线程池的工厂类，用来生成线程池。

static ExecutorService newFixedThreadPool(int nThreads) 
创建一个可重用固定线程数的线程池，以共享的无界队列方式来运行这些线程。 

**线程池的使用步骤：**

1. 使用线程池的工厂类Executors里面提供的静态方法newFixedThreadPool生产一个指定线程数量的线程池
2. 创建一个类，实现Runnable接口，重写run方法，设置线程任务
3. 调用ExecutorService中的方法submit，传递线程任务（实现类），开启线程，执行run方法
4. 调用ExecutorService中的方法shutdown销毁线程池（不建议执行）

### 八.Lambda表达式

#### Lambda表达式的标准格式

> 由三部分组成：
> 1.一些参数
> 2.一个箭头
> 3.一段代码
> 格式：（参数列表）->{重写方法的代码};
> 解析：
> （）:接口中抽象方法的参数列表，没有参数，就空着，有参数就写出参数，多个参数使用逗号分隔，
> ->:传递的意思，把参数传递给方法体{}
> {}:重写接口的抽象方法的方法体

#### Lambda表达式的省略格式

**可以省略的内容：**

1. （参数列表）：括号中参数列表的数据类型，可以省略不写
2. （参数列表）：括号中的参数如果只有一个，那么类型和（）都可以省略
3. {一些代码}：如果{}中的代码只有一行，无论是否有返回值，都可以省略（{}，return，分号）
   注意：要省略{}，return，分号必须一起省略

#### Lambda表达式的使用前提

1. 使用Lambda必须具有接口，且要求接口中有且仅有一个抽象方法。
2. 使用Lambda必须具有上下文推断（也就是方法的参数或局部变量类型必须为Lambda对应的接口类型，才能使用Lambda作为接口的实例）
   注意：有且仅有一个方法的接口，称为函数式接口。

### 九.File类

#### 1.概述

> java.io.File类
> 文件和目录路径名的抽象表示形式。
> Java把电脑中的文件和文件夹（目录）封装为了一个File类，我们可以使用File类对文件和文件夹进行操作
> 我们可以使用File类的方法：
> 1.创建一个文件/文件夹
> 2.删除一个文件/文件夹
> 3.获取一个文件/文件夹
> 4.判断文件夹是否存在
> 5.对文件夹进行遍历
> 6.获取文件的大小
> 注意：File类是一个与系统无关的类，任何的操作系统都可以使用这个类中的方法
> 重点：记住三个单词
> file：文件
> directory：文件夹/目录
> path：路径

#### 2.File类的静态成员变量

~~~java
static String pathSeparator //与系统有关的路径分隔符，为了方便，它被表示为一个字符串。路径分割符：windows(;)linux(:)
static char pathSeparatorChar //与系统有关的路径分隔符。 文件名称分隔符：windows(反斜杠\)linux(/)
static String separator //与系统有关的默认名称分隔符，为了方便，它被表示为一个字符串。 windows(\)
static char separatorChar //与系统有关的默认名称分隔符。  windows(\)

~~~

#### 3.绝对路径和相对路径

**绝对路径：**是一个完整的路径（以盘符（C:/D:）开始的路径）
**相对路径：**是一个简化的路径（相对路劲是相对于当前项目的根路径，路径可以简化书写）
**注意：**

1. 路径是不区分大小写的
2. 路径中的文件名称分隔符，windows使用反斜杠（\），反斜杠是转义字符，两个反斜杠代表一个普通的反斜杠

#### 4.File类的构造方法

~~~java
//通过将给定路径名字符串转换为抽象路径名来创建一个新 File 实例。 
/*
注意：参数:String pathname是字符串的路径名称
		 路径可以是以文件结尾，也可以是以文件夹结尾
		 路径可以是相对路径也可以是绝对路径
		 路径可以是存在的，也可以是不存在的
		 创建File对象，只是把字符串封装为File对象，不考虑路径的真假情况
*/
File(String pathname) 
          
//根据 parent 抽象路径名和 child 路径名字符串创建一个新 File 实例。 
File(File parent, String child) 
    
//根据 parent 路径名字符串和 child 路径名字符串创建一个新 File 实例。 
File(String parent, String child) 
    
//通过将给定的 file: URI 转换为一个抽象路径名来创建一个新的 File 实例。           
File(URI uri) 
~~~

#### 5.File类获取功能的方法

~~~java
//无论构造方法中传递的是相对路径还是绝对路径，getAbsolutePath方法返回的都是绝对路径
  String getAbsolutePath()  //抽象路径名的绝对路径名字符串。
//构造方法中传递的是什么，getPath方法返回的就是什么
  String getPath() //抽象路径名转换为一个路径名字符串。 
//获取的就是构造方法中传递的路径的结尾部分（文件/文件夹）
  String getName() //由此抽象路径名表示的文件或目录的名称。 
//获取文件的大小，以字节为单位，文件夹是没有大小概念的，不能获取文件夹的大小（返回的是0），如果路径不存在，则返回0
  long length() //由此抽象路径名表示的文件的长度。 
~~~

#### 6.File类判断功能的方法

~~~java
boolean exists() //测试此抽象路径名表示的文件或目录是否存在。 

boolean isDirectory() //测试此抽象路径名表示的文件是否是一个目录。 

boolean isFile() //测试此抽象路径名表示的文件是否是一个标准文件。 

~~~

#### 7.File类创建删除功能的方法

~~~java
//此方法只能创建文件，不能创建文件夹，创建文件的路径必须存在，否则会抛出异常，如果文件存在，返回false
boolean createNewFile() //当且仅当不存在具有此抽象路径名指定名称的文件时，不可分地创建一个新的空文件。
//----------------------------------------------------------------------------------------
//只能创建单级文件夹
boolean mkdir() //创建此抽象路径名指定的目录。 
//既可以创建单级，也可以创建多级
boolean mkdirs() //创建此抽象路径名指定的目录，包括所有必需但不存在的父目录。 
//返回值 true：文件不存在，创建文件，返回true   false：文件存在，不会创建，返回false
//注意：只能创建文件夹，不能创建文件，创建文件的路径必须存在，否则会抛出异常，如果文件存在，返回false
//-----------------------------------------------------------------------------
//文件/文件夹删除成功，返回true，文件夹中有内容，不会删除返回false，构造方法中路径不存在返回false
//删除成功后不会到回收站
boolean delete() //删除此抽象路径名表示的文件或目录。 
~~~

#### 8.File类遍历目录功能

~~~java
//返回File类型的数组，
File[] listFiles() //返回一个抽象路径名数组，这些路径名表示此抽象路径名表示的目录中的文件。 
//返回String类型的数组，数组中存储的是文件或文件夹的名称
String[] list() //返回一个字符串数组，这些字符串指定此抽象路径名表示的目录中的文件和目录。 
//注意：1. tFiles和list方法遍历的是构造方法中给出的目录。
//2.如果构造方法中给出的路径的目录不存在，会抛出空指针异常。
//3.如果构造方法中给出的路径不是一个目录，会抛出空指针异常。
//4.可以获取隐藏的文件或文件夹的名称
~~~

#### 9.递归打印多级目录&搜索文件

~~~java
import java.io.File;

public class DiGuiWenJianJia {
    public static void main(String[] args) {
        File file = new File("D:\\aaaaa");
        getAllFiles(file);
        System.out.println("---------------------------");
        getAppointFiles(file);
    }

    /**
     * 获取指定的文件
     * @param dir
     */
    private static void getAppointFiles(File dir) {
        File[] files = dir.listFiles();
        for (File file1 : files) {
            if (file1.isDirectory()) {
                //System.out.println(file1.getName());
                getAllFiles(file1);
            } else {
                //String path = file1.getPath();
                //String s = file1.toString();
                String name = file1.getName();
                boolean b = name.endsWith(".txt");
                if (b) {
                    System.out.println(file1.getName());
                }
            }
        }
    }

    /**
     * 获取要遍历的目录虾下面的所有文件和目录的名称
     *
     * @param dir
     */
    private static void getAllFiles(File dir) {
        File[] files = dir.listFiles();
        for (File file1 : files) {
            if (file1.isDirectory()) {
                System.out.println(file1.getName());
                getAllFiles(file1);
            } else {
                System.out.println(file1.getName());
            }
        }
    }
}
~~~

#### 10.FileFilter过滤器

~~~java
/**FileFilter是用于抽象路径名的过滤器。是一个接口，有一个抽象方法accept。
*boolean accept(File pathname)测试指定抽象路径名是否应该包含在某个路径名列表中。 
*参数：File pathname：使用fileLists遍历目录，获取每个文件对象
*/
File[] listFiles(FileFilter filter)//返回抽象路径名数组，这些路径名表示此抽象路径名表示的目录中满足指定过滤器的文件和目录。 
/**
*FilenameFilter 实现此接口的类实例可用于过滤器文件名。
*作用：用于过滤文件名称
*抽象方法：boolean accept(File dir, String name) 测试指定文件是否应该包含在某一文件列表中。
*参数：File dir：构造方法中传递的被遍历的目录， String name：使用fileLists遍历目录，获取每个文件/文件夹的名称
*/
File[] listFiles(FilenameFilter filter)//返回抽象路径名数组，这些路径名表示此抽象路径名表示的目录中满足指定过滤器的文件和目录。 
~~~

##### 1.使用FileFilter|FilenameFilter获取指定文件

~~~java
import java.io.File;
import java.io.FileFilter;
import java.io.FilenameFilter;

/**
 * 使用过滤器获取指定文件
 */
public class FileFilterTest {
    public static void main(String[] args) {
        File file = new File("D:\\aaaaa");
        getAppointFiles(file);
        System.out.println("------------------------------");
        getAppointFiles01(file);
    }

    private static void getAppointFiles(File dir) {
        /**
         * FilenameFilter实现
         */
        File[] files = dir.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                if (pathname.isDirectory()) {
                    getAppointFiles(pathname);
                }
                return pathname.getName().toLowerCase().endsWith(".txt");
            }
        });
        for (File file : files) {
            System.out.println(file);
        }

    }
    private static void getAppointFiles01(File dir) {
        /**
         * FilenameFilter实现
         */
        File[] files1 = dir.listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                if (new File(dir,name).isDirectory()){
                    getAppointFiles(new File(dir,name));
                }
                return name.toLowerCase().endsWith(".txt");
            }
        });
        for (File file1 : files1) {
            System.out.println(file1);
        }

    }
}
~~~

### 十.IO流

#### 1.IO概述

> i：input
> o：output
> 流：数据（字符，字节）一个字符=2个字节 一个字节 = 8个二进制位
> 字节流的顶级父类：InputStream，OutputStream
> 字符流的顶级父类：Reader，Writer

#### 2.字节输出流

##### 1.FileOutputStream

**构造方法：**

~~~java
FileOutputStream(String name)//创建一个向具有指定名称的文件中写入数据的输出文件流。
FileOutputStream(File file) //创建一个向指定 File 对象表示的文件中写入数据的文件输出流。
/*
参数：写入数据的目的地
     String name 目的地是一个文件的路径
     File file 目的地是一个文件
作用： 1.创建一个FileOutputStream对象
      2.会根据构造方法中传递的文件/文件路径，创建一个空的文件
      3.会把FileOutputStream对象指向创建好的文件
*/
~~~

**字节输出流的使用步骤：**

1. 创建一个FileOutputStream对象，构造方法中传递写入数据的目的地
2. 调用FileOutputStream对象中的方法write，把数据写入文件中
3. 释放资源（流使用会占用一定的内存，使用完毕要把内存清空，提高程序的效率）

**write方法**

~~~java
//一次写多个字节，如果写的第一个字节是正数（0-127），那么显示的时候会查询ASCII表，如果写的第一个字节是负数，那么第一个字节会和第二个字节，两个字节一起组成一个中文显示，查询系统默认码表（GBK）
void write(byte[] b) //将 b.length 个字节从指定 byte 数组写入此文件输出流中。 
void write(byte[] b, int off, int len) //将指定 byte 数组中从偏移量 off 开始的 len 个字节写入此文件输出流。 
void write(int b) //将指定字节写入此文件输出流。 

~~~

**字节输出流的追加写和换行**

~~~java
FileOutputStream(String name, boolean append) //创建一个向具有指定 name 的文件中写入数据的输出文件流。
FileOutputStream(File file, boolean append) //创建一个向指定 File 对象表示的文件中写入数据的文件输出流。
/*
参数：String name，File file 写入数据的目的地
    boolean append：追加写开关
    true：创建对象不会覆盖源文件，继续在文件的末尾追加写数据
    false：创建一个新文件，覆盖原文件
写换行：换行符号
    windows：\r\n
    linux:/n
    mac:/r
*/
~~~

~~~java
import java.io.FileOutputStream;
import java.io.IOException;
public class WriteTest {
    public static void main(String[] args) throws IOException {
        FileOutputStream fileOutputStream = new FileOutputStream("src\\a.txt", true);
        fileOutputStream.write("你好".getBytes());
        for (int i = 0; i &lt; 10; i++) {
            fileOutputStream.write("你好".getBytes());
            fileOutputStream.write("\r\n".getBytes());
        }
        fileOutputStream.close();
    }
}
~~~

#### 3.字节输入流

##### FileInputStream

**作用：**把硬盘中的数据读取到内存中使用

**注意：**一个中文：GBK（2个字节），UTF-8（3个字节）

**构造方法**

~~~java
FileInputStream(File file) //通过打开一个到实际文件的连接来创建一个 FileInputStream，该文件通过文件系统中的 File 对象 file 指定。
FileInputStream(String name)//通过打开一个到实际文件的连接来创建一个 FileInputStream，该文件通过文件系统中的路径名 name 指定。
/*
参数：String name 文件的路径
     File file 文件
作用：1.会创建FileInputStream对象
     2.会把FileInputStream对象指定构造方法中要读取的文件
*/
~~~

**字节输入流的使用步骤：**

> 1.创建一个FileInputStream对象，构造方法中绑定要读取的数据源
> 2.调用FileInputStream对象中的方法read，读取文件
> 3.释放资源

**read方法**

~~~java
//读取一个字节，读到文件的末尾返回-1
int read()//从此输入流中读取一个数据字节。 
int read(byte[] b) //从此输入流中将最多 b.length 个字节的数据读入一个 byte 数组中。 
/*参数 byte[] b的作用：起到缓冲作用，存储每次读取到的多个字节
       数组的长度一般定义为1024或者1024的整数倍
  方法的返回值int是什么？每次读取的有效字节个数
*/
~~~

~~~java
import java.io.FileInputStream;
import java.io.IOException;

public class ReadTest {
    public static void main(String[] args) throws IOException {
        FileInputStream fileInputStream = new FileInputStream("src\\a.txt");
        int len = 0;
        //固定写法
        while((len = fileInputStream.read())!=-1){
            System.out.println(len);
        }
    }
}
~~~

~~~java
import java.io.FileInputStream;
import java.io.IOException;

public class ReadTest {
    public static void main(String[] args) throws IOException {
        FileInputStream fileInputStream = new FileInputStream("src\\a.txt");
        byte[] bytes = new byte[1024];
        int len = 0;
        while((len = fileInputStream.read(bytes))!=-1){
            System.out.println(new String(bytes,0,len));
        }
    }
}
~~~

 **文件复制**

~~~java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * 文件复制
 */
public class FileCopy {
    public static void main(String[] args) throws IOException {
        FileInputStream fis = new FileInputStream("d:\\1.jpg");
        FileOutputStream fos  =new FileOutputStream("d:\\aaaaa\\2.jpg");
        byte[] bytes = new byte[1024];
        int len = 0;
        while ((len = fis.read(bytes))!=-1){
            fos.write(bytes,0,len);
        }
        fos.close();
        fis.close();
    }
}
~~~

#### 4.字符流

##### 1.Reader

~~~
Reader：是抽象类，是字符输入流的超类
~~~

**共性的成员方法**

~~~java
int read() //读取单个字符。 
int read(char[] cbuf) //将字符读入数组。 
abstract  void close() //关闭该流并释放与之关联的所有资源。 
~~~

##### 2.FileReader(文件字符输入流)

**构造方法**

~~~java
FileReader(String fileName)  在给定从中读取数据的文件名的情况下创建一个新 FileReader。
FileReader(File file)//在给定从中读取数据的 File 的情况下创建一个新 FileReader。
//参数：读取的数据源 String fileName：文件的路径 File file 一个文件
//作用：1.会创建一个FileReader对象 2.会把FileReader对象指向要读取的文件
~~~

**使用步骤**

1. 创建一个FileReader对象，构造方法中绑定要读取的数据源
2. 调用FileInputStream对象中的方法read，读取文件
3. 释放资源

##### 3.Writer

> Writer:是抽象类，是字符输出流的超类

**共性的成员方法**

~~~java
abstract  void close() //关闭此流，但要先刷新它。 
abstract  void flush() //刷新该流的缓冲。 
void write(char[] cbuf) //写入字符数组。 
abstract  void write(char[] cbuf, int off, int len) //写入字符数组的某一部分。 
void write(int c) //写入单个字符。 
void write(String str) //写入字符串。 
void write(String str, int off, int len) //写入字符串的某一部分。 

~~~

##### 4.FileWriter（文件字符输出流）

**构造方法**

~~~java
FileWriter(File file) //根据给定的 File 对象构造一个 FileWriter 对象。
FileWriter(String fileName) //根据给定的文件名构造一个 FileWriter 对象。
~~~

**使用步骤**

1. 创建一个FileWriter对象，构造方法中绑定要写入数据的目的地
2. 调用FileWriter对象中的方法write，把数据写入内存缓冲区（字符转换为字节的过程）
3. 使用FileWriter中的方法flush，把内存缓冲区的数据，刷新到文件中
4. 释放资源（会先把内存缓冲区的数据刷新到文件中）

**flush和close方法的区别**

**flush:**刷新缓冲区，流对象可以继续使用
**close：**先刷新缓冲区，然后通知系统释放资源。流对象不可以再被使用了

**字符流的续写和换行**

~~~java
FileWriter(File file, boolean append) //根据给定的 File 对象构造一个 FileWriter 对象。
FileWriter(String fileName, boolean append) //根据给定的文件名以及指示是否附加写入数据的 boolean 值来构造 FileWriter 对象。
/*
参数：String name，File file 写入数据的目的地
    boolean append：追加写开关
    true：创建对象不会覆盖源文件，继续在文件的末尾追加写数据
    false：创建一个新文件，覆盖原文件
写换行：换行符号
    windows：\r\n
    linux:/n
    mac:/r
*/
~~~

#### 5.Properties集合

> Properties集合是一个唯一和IO流相结合的集合，属性列表中每个键值对都是一个字符串，Properties集合是双列集合，key和value默认是字符串。
> 可以使用Properties集合中的方法store，把集合中的临时数据，持久化写入到硬盘中存储。
> 可以使用Properties集合中的方法load，把硬盘中保存的文件（键值对），读取到集合中使用。

~~~java
Object setProperty(String key, String value) //调用 Hashtable 的方法 put。 
String getProperty(String key)//用指定的键在此属性列表中搜索属性。 
Set&lt;String> stringPropertyNames() //返回此属性列表中的键集，其中该键及其对应值是字符串，如果在主属性列表中未找到同名的键，则还包括默认属性列表中不同的键。 
~~~

**使用步骤**

1. 创建Properties对象，添加数据
2. 创建字节/字符输出流，对象，构造方法中绑定要输出的目的地
3. 使用Properties集合中的方法store，把集合中的临时数据，持久化写入到硬盘中存储
4. 释放资源

**Properties集合中的store方法**

~~~java
import java.io.FileWriter;
import java.io.IOException;
import java.util.Properties;

public class PropertiesDemo {
    public static void main(String[] args) throws IOException {
        Properties properties = new Properties();
        properties.setProperty("2001","张三");
        properties.setProperty("2002","李四");
        properties.setProperty("2003","王五");
        FileWriter fileWriter = new FileWriter("src/com/company/propertiesdemo/a.txt");
        properties.store(fileWriter,"save file");
        fileWriter.close();
    }
}
~~~

**Properties集合中的load方法**

**使用步骤**

1. 创建Properties对象
2. 使用Properties集合对象中的方法load读取保存键值对的文件
3. 遍历Properties集合

**注意**

1. 存储键值对的文件中，键与值的默认的连接符号可以使用=，空格（其他符号）
2. 存储键值对的文件中，可以使用#进行注释，被注释的键值对不会再被读取
3. 存储键值对的文件中，键与值默认都是字符串，不用再加上引号

~~~java
import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;
import java.util.Set;

public class PropertiesDemo {
    public static void main(String[] args) throws IOException {
        Properties properties = new Properties();
        properties.load(new FileReader("src/com/company/propertiesdemo/a.txt"));
        Set&lt;String> set = properties.stringPropertyNames();
        for (String key : set) {
            String value = properties.getProperty(key);
            System.out.println("key:"+key+"value:"+value);
        }

    }
}
~~~

#### 6.缓冲流

##### 1.BufferedOutputStream(字节缓冲输出流)

~~~java
 public class BufferedOutputStreamextends FilterOutputStream
 //该类实现缓冲的输出流。通过设置这种输出流，应用程序就可以将各个字节写入底层输出流中，而不必针对每次字节写入调用底层系统。 
~~~

**构造方法**

~~~java
BufferedOutputStream(OutputStream out) //创建一个新的缓冲输出流，以将数据写入指定的底层输出流。 
BufferedOutputStream(OutputStream out, int size) //创建一个新的缓冲输出流，以将具有指定缓冲区大小的数据写入指定的底层输出流。 
/**
*参数：OutputStream out：字节输出流 我们可以传递FileOutputStream，缓冲流会给FileOutputStream增加一个缓冲区，提高File 	*	  OutputStream对象效率，int size：指定缓冲流内部缓冲区的大小，把数据写入内部缓冲区中。
*/
~~~

**使用步骤**

1. 创建FileOutputStream，构造方法中绑定要输出的目的地。
2. 创建BufferedOutputStream，构造方法中传递FileOutputStream对象，提高FileOutputStream对象效率
3. 使用BufferedOutputStream对象中的write方法，把数据写入内部缓冲区中
4. 使用BufferedOutputStream对象中的方法flush，把内部缓冲区中的数据，刷新到文件中
5. 释放资源（会先调用flush方法刷新数据，第四步可以省略）

##### 2.BufferedInputStream(字节缓冲输入流)

~~~java
public class BufferedInputStreamextends FilterInputStream
//BufferedInputStream 为另一个输入流添加一些功能，即缓冲输入以及支持 mark 和 reset 方法的能力。在创建 BufferedInputStream 时，会创建一个内部缓冲区数组。在读取或跳过流中的字节时，可根据需要从包含的输入流再次填充该内部缓冲区，一次填充多个字节。mark 操作记录输入流中的某个点，reset 操作使得在从包含的输入流中获取新字节之前，再次读取自最后一次 mark 操作后读取的所有字节。
~~~

**构造方法**

~~~java
BufferedInputStream(InputStream in) //创建一个 BufferedInputStream 并保存其参数，即输入流 in，以便将来使用。 
BufferedInputStream(InputStream in, int size) //创建具有指定缓冲区大小的 BufferedInputStream 并保存其参数，即输入流 in，以便将来使用。 
/**
*参数：InputStream in：字节输入流
	我们可以传递FileInputStream，缓冲流会给FileInputStream增加一个缓冲区，提高FileInputStream对象效率
	int size：指定缓冲流内部缓冲区的大小，不指定默认
*/
~~~

**使用步骤**

1. 创建FileInputStream，构造方法中绑定要读取的数据源。
2. 创建BufferedInputStream对象，构造方法中传递FileInputStream对象，提高FileInputStream对象效率
3. 使用BufferedInputStream对象中的read方法，读取文件
4. 释放资源（）

##### 3.BufferedWriter(字符缓冲输出流)

~~~java
public class BufferedWriter extends Writer
//将文本写入字符输出流，缓冲各个字符，从而提供单个字符、数组和字符串的高效写入。 
//可以指定缓冲区的大小，或者接受默认的大小。在大多数情况下，默认值就足够大了。 

//该类提供了 newLine() 方法，它使用平台自己的行分隔符概念，此概念由系统属性 line.separator 定义。并非所有平台都使用新行符 ('\n') 来终止各行。因此调用此方法来终止每个输出行要优于直接写入新行符。 


~~~

**构造方法**

~~~java
BufferedWriter(Writer out) //创建一个使用默认大小输出缓冲区的缓冲字符输出流。 
BufferedWriter(Writer out, int sz) //创建一个使用给定大小输出缓冲区的新缓冲字符输出流。 
/**
*参数：Writer out：字符输出流
	我们可以传递FileWriter，缓冲流会给FileWriter增加一个缓冲区，提高FileWriter对象效率
	int size：指定缓冲流内部缓冲区的大小，不指定默认
*/
~~~

**特有的成员方法**

~~~java
void newLine() //写入一个行分隔符。 会根据不同的系统，获取不同的分隔符
~~~

**使用步骤**

1. 创建字符缓冲输出流对象，构造方法中传递字符输出流
2. 调用字符缓冲输出流中的方法write，把数据写入到内存缓冲区中
3. 调用字符缓冲输出流中的方法flush，把内部缓冲区中的数据，刷新到文件中
4. 释放资源

##### 4.BufferedReader

~~~java
public class BufferedReader extends Reader
//从字符输入流中读取文本，缓冲各个字符，从而实现字符、数组和行的高效读取。 

//可以指定缓冲区的大小，或者可使用默认的大小。大多数情况下，默认值就足够大了。 

//通常，Reader 所作的每个读取请求都会导致对底层字符或字节流进行相应的读取请求。因此，建议用 BufferedReader 包装所有其 read() 操作可能开销很高的 Reader（如 FileReader 和 InputStreamReader）。

~~~

**构造方法**

~~~java
BufferedReader(Reader in) //创建一个使用默认大小输入缓冲区的缓冲字符输入流。 
BufferedReader(Reader in, int sz) //创建一个使用指定大小输入缓冲区的缓冲字符输入流。 
/**
*参数：Reader in：字符输入流
	我们可以传递FileReader，缓冲流会给FileReader增加一个缓冲区，提高FileReader对象效率
	int size：指定缓冲流内部缓冲区的大小，不指定默认
*/
~~~

**特有的成员方法**

~~~java
String readLine() // 读取一个文本行。 
//读取一个文本行。通过下列字符之一即可认为某行已终止：换行 ('\n')、回车 ('\r') 或回车后直接跟着换行。 
//返回：包含该行内容的字符串，不包含任何行终止符，如果已到达流末尾，则返回 null 
    

~~~

**使用步骤**

1. 创建字符缓冲输入流对象，构造方法中传递字符输入流
2. 调用字符缓冲输出流中的方法read/readline读取文本
3. 释放资源

~~~java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class BufferedReaderDemo {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader("src/a.txt"));
        String line;
        while((line = br.readLine())!=null){
            System.out.println(line);
        }
    }
}
~~~

#### 7.转换流

##### 1.OutputStreamWriter

~~~~java
public class OutputStreamWriter extends Writer
//OutputStreamWriter 是字符流通向字节流的桥梁：可使用指定的 charset 将要写入流中的字符编码成字节。它使用的字符集可以由名称指定或显式给定，否则将接受平台默认的字符集。 

//每次调用 write() 方法都会导致在给定字符（或字符集）上调用编码转换器。在写入底层输出流之前，得到的这些字节将在缓冲区中累积。可以指定此缓冲区的大小，不过，默认的缓冲区对多数用途来说已足够大。注意，传递给 write() 方法的字符没有缓冲。 


~~~~

**构造方法**

~~~java
OutputStreamWriter(OutputStream out) //创建使用默认字符编码的 OutputStreamWriter。
OutputStreamWriter(OutputStream out, String charsetName) //创建使用指定字符集的 OutputStreamWriter。
/**
*参数：OutputStream out：字节输出流，可以用来写转换之后的字节到文件中
*	  String charsetName：指定的编码表名称，不区分大小写，可以是utf-8/UTF-8，gbk/GBK..,不指定默认utf-8
*/
~~~

**使用步骤**

1. 创建OutputStreamWriter对象，构造方法中传递字节输出流和指定的编码表名称
2. 使用OutputStreamWriter对象中的方法write，把字符转换为字节存储到缓冲区中（编码）
3. 使用OutputStreamWriter对象中的方法flush，把内存缓冲区中的字节刷新到文件中（使用字节流写字节的过程）
4. 释放资源

##### 2.InputStreamReader

~~~java
public class InputStreamReader extends Reader
~~~

**构造方法**

~~~java
InputStreamReader(InputStream in) //创建一个使用默认字符集的 InputStreamReader。
InputStreamReader(InputStream in, String charsetName) //创建使用指定字符集的 InputStreamReader。
/**
*参数：InputStream in：字节输入流，用来读取文件中保存的字节
*	  String charsetName：指定的编码表名称，不区分大小写，可以是utf-8/UTF-8，gbk/GBK..,不指定默认utf-8
*/
~~~

**使用步骤**

1. 创建InputStreamReader对象，构造方法中传递字节输出流和指定的编码表名称
2. 使用InputStreamReader对象中的方法read读取文件
3. 释放资源

#### 8.序列化和反序列化

> 序列化：序列化就是指把对象转换为字节序列的过程
> 反序列化：把字节序列恢复为对象的过程。

**注意**

> 序列化和反序列化的时候，会抛出NotSerializableException（没有序列化异常）
> 类通过实现 java.io.Serializable 接口以启用其序列化功能。
> Serializable接口也叫标记型接口
> 	要进行序列化和反序列化的时候，就会检测类上是否有这个标记
> 	有：就会序列化和反序列化
> 	没有：就会抛出NotSerializableException

##### 1.ObjectOutputStream

~~~java
public class ObjectOutputStream extends OutputStream implements ObjectOutput, ObjectStreamConstants
//ObjectOutputStream 将 Java 对象的基本数据类型和图形写入 OutputStream。可以使用 ObjectInputStream 读取（重构）对象。通过在流中使用文件可以实现对象的持久存储。如果流是网络套接字流，则可以在另一台主机上或另一个进程中重构对象。 
~~~

**构造方法**

~~~java
ObjectOutputStream(OutputStream out) //创建写入指定 OutputStream 的 ObjectOutputStream。
~~~

**特有的成员方法**

~~~java
void writeObject(Object obj) //将指定的对象写入 ObjectOutputStream。 
~~~

**使用步骤**

1. 创建ObjectOutputStream对象，构造方法中传递字节输出流
2. 使用ObjectOutputStream对象中的writeObject方法，把对象写到文件中
3. 释放资源

##### 2.ObjectInputStream

~~~java
public class ObjectInputStream extends InputStream implements ObjectInput, ObjectStreamConstants //ObjectInputStream 对以前使用 ObjectOutputStream 写入的基本数据和对象进行反序列化。 

~~~

**构造方法**

~~~java
ObjectInputStream(InputStream in) //创建从指定 InputStream 读取的 ObjectInputStream。
//参数：InputStream in：字节输入流
~~~

**特有的成员方法**

~~~java
Object readObject() //从 ObjectInputStream 读取对象。 
public final Object readObject() throws IOException,ClassNotFoundException
//声明抛出了IOException,ClassNotFoundException
~~~

**使用步骤**

1. 创建ObjectInputStream对象，构造方法中传递字节输入流
2. 使用ObjectInputStream对象中的方法readObject，读取保存对象的文件
3. 释放资源
4. 使用读取出来的对象（打印）

**反序列化的前提**

1. 类必须实现Serializable
2. 必须存在类对应的class文件

##### 3.transient关键字

> 被transient关键字修饰的成员变量，不能被序列化

#### 9.PrintStream（打印流）

~~~java
public class PrintStream extends FilterOutputStream implements Appendable, CloseablePrintStream 
//为其他输出流添加了功能，使它们能够方便地打印各种数据值表示形式。

~~~

**特点**

1. 只负责数据的输出，不负责数据的读取
2. 与其他输出流不同，	PrintStream永远不会抛出IOException

**特有的方法**

~~~java
void print（任意类型的值） 
void println（任意类型的值并换行）
~~~

**构造方法**

~~~java
PrintStream(File file) //创建具有指定文件且不带自动行刷新的新打印流。
PrintStream(OutputStream out) //创建新的打印流。 
PrintStream(String fileName) //创建具有指定文件名称且不带自动行刷新的新打印流。
~~~

**继承自父类的方法**

~~~java
 void write(byte[] buf, int off, int len) //将 len 字节从指定的初始偏移量为 off 的 byte 数组写入此流。 
 void write(int b) //将指定的字节写入此流。 
~~~

**注意**

1. 如果使用继承自父类的write方法写数据，那么查看数据的时候会查询编码表 97->a
2. 如果使用自己特有的方法print/println方法写数据，写的数据原样输出 97->97

### 十一.网络编程

#### 1.软件结构

> C/S: C是英文单词“Client”的首字母，即客户端的意思，C/S就是“Client/Server”的缩写，即“客户端/服务器”模式。
> B/S: B是英文单词“Browser”的首字母，即浏览器的意思；S是英文单词“Server”的首字母，即服务器的意思。B/S就是“Browser/Server”的缩写，即“浏览器/服务器”模式。

#### 2.网络通信协议

**概念**

> 网络通信协议是一种网络通用语言，为连接不同操作系统和不同硬件体系结构的互联网络引提供通信支持，是一种网络通用语言。
> 网络通信协议由三个要素组成：
> 语义，解释控制信息每个部分的意义。它规定了需要发出何种控制信息，以及完成的动作与做出什么样的响应。
> 语法，用户数据与控制信息的结构与格式，以及数据出现的顺序。
> 时序，对事件发生顺序的详细说明。
> 可以形象地把这三个要素描述为：语义表示要做什么，语法表示要怎么做，时序表示做的顺序。

##### 1.TCP/IP协议

>   TCP/IP（Transmission Control Protocol/Internet Protocol,传输控制协议/网际协议） 协议具有很强的灵活性，支持任意规模的网络，几乎可连接所有服务器和工作站。在使用TCP/IP协议时需要进行复杂的设置，每个结点至少需要一个“IP地址”、一个“子网掩码”、一个“默认网关”、一个“主机名”，对于一些初学者来说使用不太方便。
>   TCP/IP参考模型是首先由ARPANET所使用的网络体系结构，共分为四层：网络接口层（又称链路层）、网络层（又称互联层）、传输层和应用层，每一层都呼叫它的下一层所提供的网络来完成自己的需求。
>   每一层对应的协议有：
> 1.网络接口层协议：Ethernet 802.3、Token Ring 802.5、X.25、Frame relay、HDLC、PPP ATM等。
> 2.网络层协议：IP（Internet Protocol，英特网协议）、ICMP（Internet Control Message Protocol，控制报文协议）、ARP（Address Resolution Protocol，地址转换协议）、RARP（Reverse ARP，反向地址转换协议）。
> 3.传输层协议： TCP（Transmission Control Protocol，传输控制协议）和UDP（User Datagram protocol，用户数据报协议）。
> 4.应用层协议：FTP（File Transfer Protocol，文件传输协议）、TELNET（用户远程登录服务协议）、DNS（Domain Name Service，是域名解析服务）、SMTP（Simple Mail Transfer Protocol，简单邮件传输协议）、NFS（Network File System，网络文件系统）、HTTP（Hypertext Transfer Protocol，超文本传输协议）。

##### 2.协议的分类

**TCP**

> 传输控制协议（TCP，Transmission Control Protocol）是一种面向连接的、可靠的、基于字节流的传输层通信协议

**UTP**

> UDP 是User Datagram Protocol的简称， 中文名是用户数据报协议，是OSI（Open System Interconnection，开放式系统互联） 参考模型中一种无连接的传输层协议，提供面向事务的简单不可靠信息传送服务

#### 3.网络编程三要素

##### 1.协议

> 计算机网络通信必须必须遵守的规则

##### 2.IP地址

> IP地址（Internet Protocol Address）是指互联网协议地址，又译为网际协议地址。
> IP地址是IP协议提供的一种统一的地址格式，它为互联网上的每一个网络和每一台主机分配一个逻辑地址，以此来屏蔽物理地址的差异。

##### 3.端口号

> 所谓的端口，就好像是门牌号一样，客户端可以通过ip地址找到对应的服务器端，但是服务器端是有很多端口的，每个应用程序对应一个端口号，通过类似门牌号的端口号，客户端才能真正的访问到该服务器。为了对端口进行区分，将每个端口进行了编号，这就是端口号

**注意**

1. 1024之前的端口号我们不能使用，已经被系统分配给已知的网络软件了
2. 网络软件的端口号不能重复
3. 端口号由两个字节组成，取值范围在0-65535之间

**常用的端口号**

1. 80端口 网络端口 www.baidu.com:80 正确的网址  www.baidu.com:70 错误的网址
2. 数据库  mysql：3306   Oracle：1512
3. Tomcat服务器：8080

#### 4.TCP通信程序

##### 1.概述

> TCP通信能实现两台计算机之间的数据交互，通信的两端，要严格区分为客户端（Client）和服务端（Server）

**通信的步骤**

服务器端先启动
服务器端不会主动请求客户端
必需使用客户端请求服务器端
客户端和服务器端就会建立一个逻辑连接
而这个连接包含一个对象
这个对象就是IO对象
客户端和服务器端就可以使用
IO对象进行通信
通信的数据不仅仅是字符
所以IO对象是字节流对象

**服务器必须明确两件事情**

1. 多个客户端同时和服务器进行交互，服务器必须明确和哪个客户端进行的交互，在服务器端有一个方法，叫accept客户端获取到请求的客户端对象
2. 多个客户端同时和服务器端进行交互，就需要使用多个IO流对象
   服务器是没有IO流的，服务器可以获取到请求的客户端对象Socket
   使用每个客户端Socket中提供的IO流和客户端进行交互
   服务器端使用客户端的字节输入流读取客户端发送的数据
   服务器端使用客户端的字节输出流给客户端回写数据
   简单记：服务器使用客户端的流和客户端交互

##### 2.TCP通信的客户端

> TCP通信的客户端:向服务器发送连接请求，给服务器发送数据，读取服务器回写的数据

**表示客户端的类**

> java.net.Socket:此类实现客户端套接字（也可以叫"套接字"）。套接字是两台机器间通信的端点
> 套接字包含了IP地址和端口号的网络单位

**构造方法**

~~~java
Socket(String host, int port) //创建一个流套接字并将其连接到指定主机上的指定端口号。
/**
*参数：String host：服务器主机的名称/服务器的IP地址
*	  int port：服务器的端口号 
*/
~~~

**成员方法**

~~~java
OutputStream getOutputStream() //返回此套接字的输出流。 
InputStream getInputStream() //返回此套接字的输入流。 
void close() //关闭此套接字。 
~~~

**使用步骤**

1. 创建客户端对象Socket，构造方法中绑定服务器的IP地址和端口号
2. 使用Socket对象中的方法getOutputStream获取网络字节输出流OutputStream对象。
3. 使用网络字节输出流OutputStream对象中的方法write，给服务器发送数据。
4. 使用Socket对象中的方法getInputStream获取网络字节输入流InputStream对象
5. 使用网络字节输入流InputStream对象中的方法read，读取服务器回写的数据
6. 释放资源（Socket）

**注意**

1. 客户端和服务器进行交互，必须使用Socket中提供的网络流，不能使用自己创建的流对象
2. 当我们创建客户端对象Socket的时候，就会去请求服务器和服务器经过三次握手建立连接通路。如果服务器没有启动，那么就会抛出异常
   如果服务器已经启动，就可以进行交互了。

##### 3.TCP通信的服务器端

**TCP通信的服务器端：**接收客户端的请求，读取客户端发送的数据，给客户端回写数据

**表示服务器端的类**

> java.net.ServerSocket
> 此类实现服务器套接字。服务器套接字等待请求通过网络传入。它基于该请求执行某些操作，然后可能向请求者返回结果。 
>
> 服务器套接字的实际工作由 SocketImpl 类的实例执行。应用程序可以更改创建套接字实现的套接字工厂来配置它自身，从而创建适合本地防火墙的套接字。

**构造方法**

~~~java
ServerSocket(int port) //创建绑定到特定端口的服务器套接字。
~~~

**成员方法**

~~~
Socket accept() //	侦听并接受到此套接字的连接。 
~~~

**使用步骤**

1. 创建服务器对象ServerSocket，构造方法中传递端口号
2. 使用ServerSocket对象中的accept方法，获取到请求的客户端对象Socket
3. 使用Socket对象中的方法getInputStream获取网络字节输入流InputStream
4. 使用网络字节输入流InputStream对象中的方法read，读取客户端发送的数据 
5. 使用Socket对象中的方法getOutputStream获取网络字节输出流OutputStream对象。
6. 使用网络字节输出流OutputStream对象中的方法write，给客户端回写数据
7. 释放资源（Socket，ServerSocket）

**代码实现**

**客户端**

~~~java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/**
 * 客户端
 */
public class TCPClient {
    public static void main(String[] args) throws IOException {
        //1.创建客户端对象Socket，构造方法中绑定服务器的IP地址和端口号
        Socket socket = new Socket("127.0.0.1", 8888);
        //2.使用Socket对象中的方法getOutputStream获取网络字节输出流OutputStream对象。
        OutputStream os = socket.getOutputStream();
        //3.使用网络字节输出流OutputStream对象中的方法write，给服务器发送数据。
        os.write("你好，服务器".getBytes());
        //4.使用Socket对象中的方法getInputStream获取网络字节输入流InputStream对象
        InputStream inputStream = socket.getInputStream();
        //5.使用网络字节输入流InputStream对象中的方法read，读取服务器回写的数据
        byte[] bytes = new byte[1024];
//        int len = 0;
//        while((len = inputStream.read(bytes))!=-1){
//            System.out.println(new String(bytes,0,len));
//        }
        int len = inputStream.read(bytes);
        System.out.println(new String(bytes,0,len));
        //6.释放资源（Socket）
        socket.close();
    }
}
~~~

**服务器端**

~~~java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * 服务器端
 */
public class TCPServer {
    public static void main(String[] args) throws IOException {

        //1.创建服务器对象ServerSocket，构造方法中传递端口号
        ServerSocket serverSocket = new ServerSocket(8888);
        //2.使用ServerSocket对象中的accept方法，获取到请求的客户端对象Socket
        Socket socket = serverSocket.accept();
        //3.使用Socket对象中的方法getInputStream获取网络字节输入流InputStream
        InputStream inputStream = socket.getInputStream();
        //4.使用网络字节输入流InputStream对象中的方法read，读取客户端发送的数据
        byte[] bytes = new byte[1024];
//        int len = 0;
//        while((len = inputStream.read(bytes))!=-1){
//            System.out.println(new String(bytes,0,len));
//        }
        int len = inputStream.read(bytes);
        System.out.println(new String(bytes,0,len));
        //5.使用Socket对象中的方法getOutputStream获取网络字节输出流OutputStream对象。
        OutputStream outputStream = socket.getOutputStream();
        //6.使用网络字节输出流OutputStream对象中的方法write，给客户端回写数据
        outputStream.write("你好，客户端".getBytes());
        //7.释放资源（Socket，ServerSocket）
        socket.close();
        serverSocket.close();
    }
}
~~~

##### 4.文件上传案例

**客户端**

~~~java
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/**
 *
 */
public class TCPClient {
    public static void main(String[] args) throws IOException {
        //1.创建一个本地输入流对象FileInputStream，构造方法中绑定要读取的数据源
        FileInputStream fis = new FileInputStream("D:\\1.jpg");
        //2.创建一个客户端对象Socket，构造方法中绑定服务器的IP地址和端口号
        Socket socket = new Socket("127.0.0.1",8888);
        //3.使用Socket对象中的方法getOutputStream获取网络字节输出流OutputStream对象。
        OutputStream os = socket.getOutputStream();
        //4.使用本地字节输入流FileInputStream对象中的方法read，读取本地文件
        byte[] bytes = new byte[1024];
        int len = 0;
        while((len = fis.read(bytes))!=-1){
            //5.使用网络字节输出流OutputStream对象中的方法write，把读取到的文件上传到服务器。
            os.write(bytes,0,len);
        }
        /**
         * 结束标记
         */
        socket.shutdownOutput();
        //6.使用Socket对象中的方法getInputStream获取网络字节输入流InputStream对象
        InputStream is = socket.getInputStream();
        //7.使用网络字节输入流InputStream对象中的方法read，读取服务器回写的数据
        while((len = is.read(bytes))!=-1){
            System.out.println(new String(bytes,0,len));
        }
        //8.释放资源（Socket FileInputStream）
        fis.close();
        socket.close();
    }
}
~~~

**服务器端**

~~~java
/**
 * 文件上传的服务器端
 */
public class TCPServer {
    public static void main(String[] args) throws IOException {
        //1.创建一个服务器ServerSocket对象，和系统指定的端口号
        ServerSocket serverSocket = new ServerSocket(8888);
        //2.使用ServerSocket对象中的accept方法，获取到请求的客户端Socket对象
        new Thread(new Runnable() {
            @Override
            public void run() {
                while(true){
                    try{
                        Socket socket = serverSocket.accept();
                        //3.使用Socket对象中的方法getInputStream，获取到网路字节输入流InputStream对象
                        InputStream is = socket.getInputStream();
                        //4.判断d:\\upload文件夹是否存在，不存在则创建
                        File file = new File("d:\\upload");
                        if(!file.exists()){
                            file.mkdir();
                        }
                        //5.创建一个本地字节输出流FileOutputStream对象，构造方法中绑定要输出的目的地
                        FileOutputStream fos = new FileOutputStream(file+"\\1.jpg");
                        //6.使用网络字节输入流InputStream对象中的方法read，读取客户端上传的文件
                        int len =0;
                        byte[] bytes = new byte[1024];
                        while((len = is.read(bytes))!=-1){
                            //7.使用本地字节输出流FileOutputStream对象中的方法write，把读取到的文件保存到服务器的硬盘上
                            fos.write(bytes,0,len);
                        }
                        //8.使用Socket对象中的方法getOutputStream，获取到网路字节输入流OutputStream对象
                        OutputStream os = socket.getOutputStream();
                        //9.使用网络字节输出流OutputStream对象中的方法write，给客户端回写上传成功
                        os.write("上传成功".getBytes());
                        //10.释放资源（FileOutputStream，Socket，ServerSocket）
                        fos.close();
                        socket.close();
                    }catch (IOException e){
                        e.printStackTrace();
                    }finally {

                    }
                }
            }
        }).start();
    }
}
~~~

##### 5.模拟BS服务器

~~~java
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * 创建BS版TCP服务器
 *
 */
public class BSTCPServer {
    public static void main(String[] args) throws IOException {
        //1.创建一个服务器ServerSocket对象，和系统指定的端口号
        ServerSocket serverSocket = new ServerSocket(8080);
        /**
         * 浏览器解析服务器回写的html页面，页面中有图片，那么浏览器会单独的开启一个线程，读取服务器的文件
         */
        while(true){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        //2.使用ServerSocket对象中的accept方法，获取到请求的浏览器Socket对象
                        Socket socket = serverSocket.accept();
                        //3.使用Socket对象中的方法getInputStream，获取到网路字节输入流InputStream对象
                        InputStream is = socket.getInputStream();
                        //4.把is网络字节输入流对象，转换为字符缓冲流
//                        int len =0;
//                        byte[] bytes = new byte[1024];
//                        while((len = is.read(bytes))!=-1){
//                            //7.使用本地字节输出流FileOutputStream对象中的方法write，把读取到的文件保存到服务器的硬盘上
//                            System.out.println(new String(bytes,0,len));
//                        }
                        BufferedReader br = new BufferedReader(new InputStreamReader(is));
                        //把客户端请求的第一行读取出来
                        String line = br.readLine();
                        //把读取的信息进行切割,只要中间部分
                        String[] str = line.split(" ");
                        //把路径前面的/去掉，进行截取
                        String htmlPath = str[1].substring(1);
                        //创建一个本地字节输入流，构造方法中绑定要读取的html路径
                        FileInputStream fis = new FileInputStream(htmlPath);
                        //8.使用Socket对象中的方法getOutputStream，获取到网路字节输入流OutputStream对象
                        OutputStream os = socket.getOutputStream();
                        //写入HTTP协议响应头，固定写法
                        os.write("HTTP/1.1 200 OK\r\n".getBytes());
                        os.write("Content-Type:text/html\r\n".getBytes());
                        os.write("\r\n".getBytes());
                        //一读一写复制文件，把服务器读取的文件回写到客户端
                        int len =0;
                        byte[] bytes = new byte[1024];
                        while((len = fis.read(bytes))!=-1){
                            //7.使用本地字节输出流FileOutputStream对象中的方法write，把读取到的文件保存到服务器的硬盘上
                            os.write(bytes,0,len);
                        }
                        fis.close();
                        socket.close();
                    }catch (IOException e){
                        e.printStackTrace();
                    }
                }
            }).start();
        }

        //serverSocket.close();
    }
}
~~~

### 十二.函数式接口

**概念**

> 有且仅有一个抽象方法的接口

**格式**

> 修饰符 interface 接口名称{
> 	public abstract 返回值类型 方法名称（可选参数信息）；
> 	//其他非抽象方法
> }

#### 1.FunctionInterface注解

**作用**

可以检测接口是否是一个函数式接口
是：编译成功
否：编译失败（接口中没有抽象方法或者抽象方法个数大于1）

#### 2.函数式编程

##### 1.lambda的延迟执行

> 有些场景的代码执行后，结构不一定会被使用，从而造成性能浪费。而lambda表达式时延迟执行的，正好可以作为解决方案，提升性能

#### 3.常用的函数式接口

##### 1.Supplier

> java.util.function Interface Supplier&lt;T>接口仅包含一个无参的方法T get().用来获取一个泛型参数指定类型的对象数据。
>
> Supplier&lt;T>接口被称之为生产型接口，指定接口的泛型是什么类型，那么接口中get方法就会生产什么类型的数据

**案例**

~~~java
import java.util.function.Supplier;

/**
 * 使用函数式接口Supplier，查找数组中的最大值
 */
public class SupplierDemo {
    public static int getMax(Supplier&lt;Integer> sup){
        return sup.get();
    }

    public static void main(String[] args) {
        int[] arr = {1,9,30,5,60,30,100,59};
        int maxValue = getMax(()->{
            //定义变量，记录最大值
            int max=arr[0];
            for (int i : arr) {
                if (i>max){
                    max = i;
                }
            }
            return max;
        });
        System.out.println(maxValue);
    }
}
~~~

##### 2.consumer

> java.util.function Interface Consumer&lt;T>
> 正好和Supplier接口相反，它不是生产一个数据，而是消费一个数据，其数据类型由泛型决定
> Consumer接口中包含的抽象方法void accept（T t），意为消费一个指定泛型的数据，至于怎么消费，自定义

**案例**

~~~java
import java.util.function.Consumer;

/**
 * 使用Consumer接口反转输出字符串
 */
public class ConsumerDemo {
    public static void method(String name, Consumer&lt;String> con){
        con.accept(name);
    }

    public static void main(String[] args) {
        method("张三",(name)->{
            //把字符串进行反转输出
            String reName = new StringBuffer(name).reverse().toString();
            System.out.println(reName);
        });
    }
}
~~~

**Concusmer接口的默认方法andThen**

> default Consumer&lt;T> andThen(Consumer&lt;? super T> after)返回一个组合的Consumer ， Consumer执行该操作，后跟after操作。 如果执行任一操作会抛出异常，它将被转发到组合操作的调用者。 如果执行此操作抛出一个异常， after操作将不被执行。 
> 需要两个Consumer接口，可以把两个Consumer接口组合到一起，在对数据进行消费

**案例**

~~~java
import java.util.function.Consumer;

public class ConsumerDefaultFDemo {
    public static void method(String str, Consumer&lt;String> con1,Consumer&lt;String> con2){
        //使用andThen方法，把两个Consumer接口连接到一起，再消费数据
        con1.andThen(con2).accept(str);
    }

    public static void main(String[] args) {
        method("Hello",(str)->System.out.println(str.toLowerCase()),(str)->System.out.println(str.toUpperCase()));
    }
}
~~~

##### 3.Predicate

> java.util.function Interface Predicate&lt;T>
> **作用：**对某种数据类型的数据进行判断，结果返回一个boolean值
> 接口中包含一个抽象方法：
> boolean test(T t) ：用来对指定数据类型进行判断
> **结果：**符合条件，返回True
> 	 不符合条件，返回False

**案例**

~~~java
import java.util.function.Predicate;

public class PredicateDemo {
    public static boolean checkedString(String str, Predicate&lt;String> pre){
        return pre.test(str);
    }

    public static void main(String[] args) {
        boolean b = checkedString("abcdef",(str)->{
            //判断字符串的长度是否大于5
            return str.length()>5;
        });
        System.out.println(b);
    }
}
~~~

###### 1.Predicate接口中的默认方法and

> Predicate接口中的默认方法and：表并且关系，也可以用于连接两个判断条件

**案例**

~~~java
import java.util.function.Predicate;

/**
 * Predicate方法中的默认方法and
 */
public class PredicateAndDemo {
    public static boolean checkedString(String str, Predicate&lt;String> pre1,Predicate&lt;String> pre2){
        return pre1.and(pre2).test(str);
    }

    public static void main(String[] args) {
        boolean b = checkedString("abcde",(str)->str.length()>5,(str)->str.contains("a"));
        System.out.println(b);
    }
}
~~~

###### 2.Predicate接口中的默认方法or

> Predicate接口中的默认方法or:表或关系 和and方法用法一样

###### 3.Predicate接口中的默认方法negate

> Predicate接口中的默认方法negate:表取反

**案例**

~~~java
import java.util.function.Predicate;

public class PredicateNegateDemo {

    public static boolean checkedString(String str, Predicate&lt;String> pre){
        return pre.negate().test(str);
    }

    public static void main(String[] args) {
        boolean b = checkedString("abcde",(str)->str.length()>5);
        System.out.println(b);
    }
}
~~~

###### 4.Predicate综合案例

~~~java
import java.util.function.Predicate;

/**
 * 判断给定的数组中，名字长度大于等于4，且性别是女的人
 */
public class PredicatePracticeDemo {
    public static boolean check(String str, Predicate&lt;String> pre1,Predicate&lt;String> pre2){
        return pre1.and(pre2).test(str);
    }

    public static void main(String[] args) {
        String[] strings = {"迪丽热巴，女","古力娜扎，女","马儿扎哈，男","赵丽颖，女"};
        for (String message : strings) {
            boolean b = check(message,(str)->{
                String[] name = str.split("，");
                return name[0].length()>=4;
            },(str)->{
                String[] sex = str.split("，");
                return sex[1].equals("女");
            });
            if (b){
                System.out.println(message);
            }
        }

    }
}
~~~

#### 4.Function接口

> java.util.function Interface Function&lt;T,R>
> 用来根据一个类型的数据得到另一个类型的数据，前者称为前置条件，后者称为后置条件
> 最主要的抽象方法是：R apply(T t),根据类型T的参数获取类型R的结果

**案例**

~~~java
import java.util.function.Function;

/**
 * 将字符串转换为int类型
 */
public class FunctionDemo {
    public static Integer test(String str, Function&lt;String,Integer> fun) {
        return fun.apply(str);
    }

    public static void main(String[] args) {
        int i = test("123",(str)->Integer.parseInt(str));
        System.out.println(i);
    }
}
~~~

##### 1.Function接口中的默认方法andThen

> Function接口中的默认方法andThen：用来进行组合操作

**案例**

~~~java
import java.util.function.Function;
/**
 * 将字符串“123”转换为Integer类型，再+10，再转换为字符串输出
 */
public class FunctionAndThenDemo {
    public static void change(String str, Function&lt;String,Integer> fun1,Function&lt;Integer,String> fun2) {
        String s = fun1.andThen(fun2).apply(str);
        System.out.println(s);
    }

    public static void main(String[] args) {
        change("123",(str)->{
            int i = Integer.parseInt(str)+10;
            return i;
        },(str)->{
            String s = str.toString();
            return s;
        });
    }
}
~~~

### 十三.Stream流

**概念**

> public interface Stream&lt;T> extends BaseStream&lt;T,Stream&lt;T>>
> 从jdk1.8开始，关注的是做什么，而不是怎么做
> 1.Stream是元素的集合，这点让Stream看起来用些类似Iterator；
> 2.可以支持顺序和并行的对原Stream进行汇聚的操作；
> 大家可以把Stream当成一个高级版本的Iterator。原始版本的Iterator，用户只能一个一个的遍历元素并对其执行某些操作；高级版本的Stream，用户只要给出需要对其包含的元素执行什么操作，比如“过滤掉长度大于10的字符串”、“获取每个字符串的首字母”等，具体这些操作如何应用到每个元素上，就给Stream就好了！

**注意**

Stream流其实是一个集合元素的函数模型，它并不是集合，也不是数据结构，其本身并不存储任何元素（或其地址值）
Stream流是一个来自数据源的元素队列：

1. 元素是特定类型的对象，形成一个队列。java中的Stream并不会存储元素，而是按需计算。
2. 数据源：流的来源可以是集合、数组等。

#### 1.使用Stream流的方式遍历集合

**案例**

~~~java
import java.util.ArrayList;
import java.util.List;

/**
 * 使用Stream流过滤名字长度为2且以张开头的名字，打印输出
 */
public class StreamDemo {
    public static void main(String[] args) {
        List&lt;String> list = new ArrayList&lt;>();
        list.add("张三");
        list.add("李四");
        list.add("张三丰");
        list.stream().filter((name)->name.length()==2)
                .filter((name)->name.startsWith("张"))
                .forEach(name-> System.out.println(name));

    }
}
~~~

#### 2.两种获取Stream流的方式

1. 所有的Collection集合都可以通过stream默认方法获取流
2. Stream接口的静态方法of可以获取数组对应的流 static &lt;T> Stream&lt;T> of(T... values)

**示例**

```java
import java.util.*;
import java.util.stream.Stream;

public class GetStreamDemo {
    public static void main(String[] args) {
        //把集合转换为Stream流
        List&lt;String> list = new ArrayList&lt;>();
        Stream&lt;String> stream = list.stream();

        Set&lt;String> set = new HashSet&lt;>();
        Stream&lt;String> stream1 = set.stream();

        //Map需要将键与值转换为Collection集合
        Map&lt;String,String> map = new HashMap&lt;>();
        Set&lt;String> keySet = map.keySet();
        Stream&lt;String> stream2 = keySet.stream();
        Collection&lt;String> values = map.values();
        Stream&lt;String> stream3 = values.stream();

        //获取键值对（键与值的映射关系 entrySet）
        Set&lt;Map.Entry&lt;String, String>> entries = map.entrySet();
        Stream&lt;Map.Entry&lt;String, String>> stream4 = entries.stream();

        //把数组转换为Stream流
        Stream&lt;Integer> stream5 = Stream.of(1, 2, 3, 4, 5);
        //可变参数可以传递数组
        Integer[] arr = {1,2,3,4,5};
        Stream&lt;Integer> stream6 = Stream.of(arr);
        String[] arr2 = {"123","asda","ccc"};
        Stream&lt;String> stream7 = Stream.of(arr2);

    }
}
```

#### 3.常用方法

##### 1.fouEach(逐一处理)

> void forEach(Consumer&lt;? super T> action)该方法接收一个Consumer接口，会将每一个流元素交给该函数处理
> Consumer接口中包含的抽象方法void accept（T t）

**简单记**

> forEach方法，用来遍历流中的数据
> 是一个终结方法，遍历之后就不能继续调用Stream流中的其他方法

**特点**

>1.Stream流属于管道流，只能被消费一次
>第一个Stream流调用完毕方法，数据就会流转到下一个Stream上，而这时第一个Stream流已经使用完毕，就会关闭，使用第一个Stream流就不能再调用方法了

**示例**

~~~java
import java.util.stream.Stream;

public class StreamForEach {
    public static void main(String[] args) {
        //获取一个Stream流
        Stream&lt;String> stream = Stream.of("张三", "李四", "王五", "赵六");
        //使用Stream流中的方法forEach对Stream流中的数据进行遍历
        stream.forEach(name-> System.out.println(name));
    }
}

~~~

##### 2.filter(过滤)

> Stream&lt;T> filter(Predicate&lt;? super T> predicate)对Stream流中的元素进行过滤
> Predicate中的抽象方法boolean test(T t) ：用来对指定数据类型进行判断

**示例**

~~~java
import java.util.stream.Stream;

public class StreamFilter {
    public static void main(String[] args) {
        Stream&lt;String> stream = Stream.of("张三", "李四", "王五", "张三丰");
        stream.filter(name -> name.startsWith("张")).forEach(name-> System.out.println(name));

    }
}

~~~

##### 3.map(映射)

> &lt;R> Stream&lt;R> map(Function&lt;? super T,? extends R> mapper)
> 该接口需要一个Function函数式接口参数，可以将当前流中的T类型数据转换为另一种R类型的流
> Function中的抽象方法：
> R apply(T t)

**示例**

~~~java
import java.util.stream.Stream;

/**
 * 将字符串转换为Integer类型输出
 */
public class StreamMap {
    public static void main(String[] args) {
        Stream&lt;String> stream = Stream.of("1", "2", "3", "4");
        Stream&lt;Integer> integerStream = stream.map((String s) -> {
            return Integer.parseInt(s);
        });
        integerStream.forEach(name-> System.out.println(name));
    }
}

~~~

##### 4.count(统计)

> long count()：用于统计Stream流中元素的个数
> count方法是一个终结方法，返回值是一个long类型的整数
> 所有不能再继续调用Stream流中的其他方法了

**示例**

~~~java
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * 获取Stream流中元素的个数
 */
public class StreamCount {
    public static void main(String[] args) {
        List&lt;Integer> list = new ArrayList&lt;>();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        Stream&lt;Integer> stream = list.stream();
        long count = stream.count();
        System.out.println(count);

    }
}
~~~

##### 5.limit(截取)

> Stream&lt;T> limit(long maxSize) 可以对流进行截取，只取用前n个
> 参数是一个long型，如果集合长度大于参数则进行截取，否则不进行操作
> limit方法是一个延迟方法，只是对流中的元素进行截取，返回的是一个新的流，所有可以继续调用Stream流中的其他方法 

**示例**

~~~java
import java.util.stream.Stream;

/**
 * 对字符串数组进行截取
 */
public class StreamLimit {
    public static void main(String[] args) {
        String[] arr = {"张三","李四","王五","赵六"};
        Stream&lt;String> stream = Stream.of(arr);
        stream.limit(2).forEach(name-> System.out.println(name));
    }
}
~~~

##### 6.skip(跳过)

> Stream&lt;T> skip(long n)用于跳过元素
> 如果流的当前长度大于n,则跳过前n个,否则将会得到一个长度为0的空流

**示例**

~~~java
import java.util.stream.Stream;

public class StreamSkip {
    /**
     * 跳过字符串数组中前两个元素
     */
    public static void main(String[] args) {
        String[] arr = {"张三", "李四", "王五", "赵六"};
        Stream&lt;String> stream = Stream.of(arr);
        stream.skip(2).forEach(name -> System.out.println(name));
    }
}

~~~

##### 7.concat

> static &lt;T> Stream&lt;T> generate(Supplier&lt;T> s):用于把流组合到一起

**示例**

~~~java

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class StreamConcat {
    public static void main(String[] args) {
        String[] arr = {"张三","李四","王五","赵六"};
        List&lt;Integer> list = new ArrayList&lt;>();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        Stream&lt;Integer> stream2 = list.stream();
        Stream&lt;String> stream1 = Stream.of(arr);
        Stream&lt;Serializable> concat = Stream.concat(stream1, stream2);
        concat.forEach(name-> System.out.println(name));
    }
}
~~~

### 十四.方法引用

#### 1.方法引用符

> 双冒号::为引用运算符,而它所在的表达式被称为方法引用.如果Lambda要表达的函数方案已经存在于某个方法的实现中,那么则可以通过双冒号来引用该方法作为Lambda的代替者
> 注意:
> Lambda中传递的参数一定是方法中的那个方法可以接收的类型,否则会抛出异常

#### 2.通过对象名引用成员方法

**使用前提**

> 对象名已经存在,成员方法也是已经存在,就可以使用对象名引用成员方法

**示例**

~~~java
public interface Printable {
    void print(String s);
}
~~~

~~~java
public class MethodRerObject {
    public void printUpperCaseString(String s){
        System.out.println(s.toUpperCase());
    }
}

~~~

~~~java

public class DemoObjectReference {
    public static void printString(Printable p){
        p.print("Hello");
    }

    public static void main(String[] args) {
//        printString((s)->{
//            MethodRerObject methodRerObject = new MethodRerObject();
//            methodRerObject.printUpperCaseString(s);
//        });

        MethodRerObject methodRerObject = new MethodRerObject();
        printString(methodRerObject::printUpperCaseString);
    }
}

~~~

#### 3.通过类名引用静态成员方法

> 类已经存在,静态成员方法也已经存在,就可以通过类名直接引用静态成员方法

**示例**

~~~java
@FunctionalInterface
public interface Calcable {
    int calcAbs(int n);
}

~~~

~~~java
public class MethodStaticObject {
    public static int method(int n,Calcable c){
        return c.calcAbs(n);
    }

    public static void main(String[] args) {
        int num = method(-10,(n)->{
            return Math.abs(n);
        });
        System.out.println(num);
        //使用方法引用优化Lambda
        int num2 = method(-10,Math::abs);
        System.out.println(num2);
    }
}
~~~

### 十五.Junit

#### 1.测试分类

> **黑盒测试:**不需要写代码,给输入值,看程序是否能够输出期望的值.
> **白盒测试:**需要写代码,关注程序具体的执行流程

####  2.使用步骤

1. 定义一个测试类(测试用例)
   建议:
   	测试类名:被测试的类名Test  Test
   	包名:***.***.**.test 
2. 定义测试的方法:可以独立运行
   建议:
   	方法名:test测试的方法名 testAdd()
   	返回值:void
   	参数列表:空参
3. 给方法加@Test
4. 导入junit依赖环境
   判定结果
   红色:失败
   绿色:成功
   一般会使用断言操作来处理结果
   Assert.assertEquals(期望的结果,程序真实的结果)

#### 3.@before&@after

**@before:**修饰的方法会在测试方法之前执行
**@after:**修饰的方法会在测试方法之后执行

### 十六.反射

**概念**

> 将类的各个组成部分封装为对象,这就是反射机制
> 反射:框架设计的灵魂
> 框架:半成品软件.可以在框架的基础上进行软件开发,简化代码

**好处**

1. 可以在程序运行过程中,操作这些对象.
2. 可以解耦,提高程序的可扩展性

#### 获取Class对象的方式

1. Class.forName("全类名"):将字节码文件加载进内存,返回Class对象.//多用于配置文件,将类名定义在配置文件中.读取文件,加载类
2. 类名.class:通过类名的属性class获取.//多用于参数的传递
3. 对象.getClass():getClass()方法在Object类中定义.//多用于对象的获取字节码的方式
   **结论:**同一个字节码文件(*.class)在一次程序运行过程中,只会被加载一次,不论通过哪一种方式获取的Class对象都是同一个

#### Class对象的功能

##### 1.获取成员变量们

~~~java
Field getField(String name) //返回一个 Field 对象，它反映此 Class 对象所表示的类或接口的指定公共成员字段。 
Field[] getFields() 返回一个包含某些 Field 对象的数组，这些对象反映此 Class 对象所表示的类或接口的所有可访问公共字段。 
~~~

##### 2.获取构造方法们

~~~java
Constructor&lt;T> getConstructor(Class&lt;?>... parameterTypes) //返回一个 Constructor 对象，它反映此 Class 对象所表示的类的指定公共构造方法。 
Constructor&lt;?>[] getConstructors() //返回一个包含某些 Constructor 对象的数组，这些对象反映此 Class 对象所表示的类的所有公共构造方法。 
Constructor&lt;T> getDeclaredConstructor(Class&lt;?>... parameterTypes) //返回一个 Constructor 对象，该对象反映此 Class 对象所表示的类或接口的指定构造方法。 
Constructor&lt;?>[] getDeclaredConstructors() //返回 Constructor 对象的一个数组，这些对象反映此 Class 对象表示的类声明的所有构造方法。 
~~~

##### 3.获取成员方法们

~~~java
Method getMethod(String name, Class&lt;?>... parameterTypes) //返回一个 Method 对象，它反映此 Class 对象所表示的类或接口的指定公共成员方法。 
Method[] getMethods() //返回一个包含某些 Method 对象的数组，这些对象反映此 Class 对象所表示的类或接口（包括那些由该类或接口声明的以及从超类和超接口继承的那些的类或接口）的公共 member 方法。 
Method getDeclaredMethod(String name, Class&lt;?>... parameterTypes) //返回一个 Method 对象，该对象反映此 Class 对象所表示的类或接口的指定已声明方法。 
Method[] getDeclaredMethods() //返回 Method 对象的一个数组，这些对象反映此 Class 对象表示的类或接口声明的所有方法，包括公共、保护、默认（包）访问和私有方法，但不包括继承的方法。 

~~~

##### 4.获取类名

~~~java
String getName() //以 String 的形式返回此 Class 对象所表示的实体（类、接口、数组类、基本类型或 void）名称。 
~~~

### 十七.注解

**定义**

> Java 注解（Annotation）又称 Java 标注，是 JDK5.0 引入的一种注释机制。
> Java 语言中的类、方法、变量、参数和包等都可以被标注。和 Javadoc 不同，Java 标注可以通过反射获取标注内容。在编译器生成类文件时，标注可以被嵌入到字节码中。Java 虚拟机可以保留标注内容，在运行时可以获取到标注内容 。 当然它也支持自定义 Java 标注。

**内置的注解**

> Java 定义了一套注解，共有 7 个，3 个在 java.lang 中，剩下 4 个在 java.lang.annotation 中。

**作用在代码的注解是**

> @Override - 检查该方法是否是重写方法。如果发现其父类，或者是引用的接口中并没有该方法时，会报编译错误。
> @Deprecated - 标记过时方法。如果使用该方法，会报编译警告。
> @SuppressWarnings - 指示编译器去忽略注解中声明的警告。

作用在其他注解的注解(或者说 元注解)是:

> @Retention - 标识这个注解怎么保存，是只在代码中，还是编入class文件中，或者是在运行时可以通过反射访问。(RUNTIME>CLASS>SOURCE)
> @Documented - 标记这些注解是否包含在用户文档中。
> @Target - 标记这个注解应该是哪种 Java 成员。
> @Inherited - 标记这个注解是继承于哪个注解类(默认 注解并没有继承于任何子类)

从 Java 7 开始，额外添加了 3 个注解:

> @SafeVarargs - Java 7 开始支持，忽略任何使用参数为泛型变量的方法或构造函数调用产生的警告。
> @FunctionalInterface - Java 8 开始支持，标识一个匿名函数或函数式接口。
> @Repeatable - Java 8 开始支持，标识某注解可以在同一个声明上使用多次。

#### 自定义注解

> 使用@interface自定义注解时,自动继承了java.lang.annotation.Annotation接口

**分析**

- @interface用来声明一个注解,格式:public @interface 注解名{定义内容}
- 其中的每一个方法实际上是声明了一个配置参数
- 方法的名称就是参数的名称
- 返回值类型就是参数的类型(返回值类型只能是基本类型,Class,String,enum)
- 可以通过default来声明参数的默认值
- 如果只有一个参数成员,一般参数名为value
- 注解元素必须要有值,我们定义注解元素时,经常使用空字符串,0作为默认值

~~~java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

public class TestAnnotation {
    @MyAnnotation(age=18)
    public void test(){}
    @MyAnnotation01("aa")
    public void test01(){}
}
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE,ElementType.METHOD})
@interface MyAnnotation{
    String name() default "";
    int age();
    String[] hobby() default {"唱歌","打游戏"};
}
@interface MyAnnotation01{
    String value();
}
~~~





