---
title: JavaScript
date: 2021-09-01
categories: [前端]
tags: [JavaScript, 基础]
description: JavaScript 核心概念学习笔记：原型、作用域、异步与 DOM 操作。
coverImg: /images/cover-5.svg
permalink: /posts/javascript
---



# JavaScript的6种数据类型

## String

> 字符串可以是引号中的任意文本。可以使用单引号或双引号.

**常用方法**

~~~javascript
var str = "aaadererer23242432";
//计算字符串的长度 
console.log(str.length);//18
//字符串中某一个指定的字符首次出现的位置(从0开始)
console.log(str.indexOf('d'));//3
//把两个字符串连接起来
var str2 = "ereretsfdf";
console.log(str.concat(str2));//aaadererer23242432ereretsfdf
//字符串中的替换
var str3 = str.replace(/d/,"b")
console.log(str3);
//charCodeAt方法返回一个整数，代表指定位置字符的Unicode编码。
console.log(str.charCodeAt(0));//97
//fromCharCode方法从一些Unicode字符串中返回一个字符串。
console.log(String.fromCharCode(65));//A
//charAt方法返回指定索引位置处的字符。如果超出有效范围的索引值返回空字符串。
console.log(str.charAt(0));//a
//slice方法返回字符串的片段。
console.log(str.slice(0,3));//aaa
//substring方法返回位于String对象中指定位置的子字符串。
/*
strObj.substring(start,end)
说明：
start指明子字符串的起始位置，该索引从0开始起算。
end指明子字符串的结束位置，该索引从0开始起算。
substring方法使用start和end两者中的较小值作为子字符串的起始点。如果start或end为NaN或者为负数，那么将其替换为0。
*/
console.log(str.substring(0,3));//aaa
// substr方法返回一个从指定位置开始的指定长度的子字符串。
/**
  * strObj.substr(start[,length])
  * 说明：
  * start所需的子字符串的起始位置。字符串中的第一个字符的索引为0。
  * length在返回的子字符串中应包括的字符个数。
  */
console.log(str.substr(0,4));//aaad
//lastIndexOf方法返回String对象中字符串最后出现的位置。如果没有匹配到子字符串，则返回-1。
/**
  * strObj.lastIndexOf(substr[,startindex])
  * 说明：
  * substr要在String对象内查找的子字符串。
  * startindex该整数值指出在String对象内进行查找的开始索引位置。如果省略，则查找从字符串的末尾开始。
  */
console.log(str.lastIndexOf("a",3));//2
//search方法返回与正则表达式查找内容匹配的第一个字符串的位置。
/**
  * strObj.search(reExp)
  * 说明：
  * reExp包含正则表达式模式和可用标志的正则表达式对象。
  */
console.log(str.search("d"));//3
//将一个字符串分割为子字符串，然后将结果作为字符串数组返回。
/**
  * strObj.split([separator[,limit]])
  * 说明：
  * separator字符串或 正则表达式 对象，它标识了分隔字符串时使用的是一个还是多个字符。如果忽略该选项，返回包含整个字符串的单一元素数组。
  * limit该值用来限制返回数组中的元素个数。
  */
var str4 = "aa bb cc dd ee";
console.log(str4.split(" ",3));//["aa", "bb", "cc"]
~~~

## Number

> NaN：即非数值（Not a Number）。任何涉及NaN的操作都会返回NaN，NaN与任何值都不相等

## Boolean

> Boolean类型有两个字面值：true和false。**true不一定等于1，false不一定等于0。只有Number（true）Number(false)才是1或0，**注意的是true和false是区分大小写的。 

## Null

> null值表示一个空指针对象
>
> 注意:没有必要把一个变量的值初始化为undefined，但对于意在保存对象的变量则应明确的初始化为null值

## Undefine

> 对未初始化和未声明的变量执行typeof操作符都会返回undefined

## Object

# typeof操作符

> typeof操作符：用于检测给定变量的数据类型，对一个值试用typeof操作符可能返回下列某个字符串：
>
> “undefined”——表示值未定义；
>
> “boolean”——表示值是布尔值 ；
>
> “string”——表示值是字符；
>
> “number”——表示值是数值；
>
> “object”——表示值是对象或null；
>
> “function”——表示值是函数；

# 强制类型转换

## 1.将其他的数据类型转换为String

### 方式一:toString()方法

~~~javascript
var a = 123;
a = a.toString();
console.log(typeof a);//string
console.log(a);//123
			
var a = true;
a = a.toString();
console.log(typeof a);//string
console.log(a);//true
~~~

**注意**

> null和undefined这两个值没有toString()方法,如果调用他们的方法,会报错

### 方式二:调用String()函数

~~~javascript
var a = 123;
a = String(a);
console.log(typeof a);//string
console.log(a);//123

a = true;
a = String(a);
console.log(typeof a);//string
console.log(a);//true

a = null;
a = String(a);
console.log(typeof a);//string
console.log(a);//null

a = undefined;
a = String(a);
console.log(typeof a);//string
console.log(a);//undefined

~~~

> 使用String()函数做强制类型转换时
>
> 对于Number和Boolean实际上就是调用toString()方法
>
> 但是对于null和undefined,就不会调用toString()方法
>
> 他会将null 直接转换为"null"
>
> 他会将undefined 直接转换为"undefined "

## 2.将其他的数据类型转换为Number

### 方式一:调用Number函数

~~~javascript
//如果是纯数字的字符串,则直接将其转换为数字
var a = "123";
a = Number(a);
console.log(typeof a);//number
console.log(a);//123

//如果字符串中有非数字的内容,则转换为NaN
a = "123aaa";
a = Number(a);
console.log(typeof a);//number
console.log(a);//NaN

//如果字符串是一个空串或者是一个全是空格的字符串,则转换为0
a = "";
a = Number(a);
console.log(typeof a);//number
console.log(a);//0	

/**
 * Boolean转数字
 * true 转成 1
 * false 转成 0
 */
a = true;
a = Number(a);
console.log(typeof a);//number
console.log(a);//1

a = false;
a = Number(a);
console.log(typeof a);//number
console.log(a);//0

//null转数字 是0
a = null;
a = Number(a);
console.log(typeof a);//number
console.log(a);//0

//undefined转数字 是NaN
a = undefined;
a = Number(a);
console.log(typeof a);//number
console.log(a);//NaN

~~~

### 方式二:parseInt(),parseFloat()

> parseInt()可以将一个字符串中的有效的整数内容取出来,然后转为Number
>
> parseFloat()与parseInt()类型,不同的是他可以取小数

~~~javascript
a = "123px";
a = parseInt(a);
console.log(typeof a);//number
console.log(a);//123


a = "123a123";
a = parseInt(a);
console.log(typeof a);//number
console.log(a);//123

a = "b123a123";
a = parseInt(a);
console.log(typeof a);//number
console.log(a);//NaN

a = "123.123a123";
a = parseInt(a);
console.log(typeof a);//number
console.log(a);//123

a = "123.123a123";
a = parseFloat(a);
console.log(typeof a);//number
console.log(a);//123.123
		
a = "123.123.123a123";
a = parseFloat(a);
console.log(typeof a);//number
console.log(a);//123.123

/**
 * 如果对非String使用parseInt()或parseFloat()
 * 它会先将其转换为String然后再操作
 */
a = "123.123";
a = parseInt(a);
console.log(typeof a);//number
console.log(a);//123

~~~

## 3.将其他的数据类型转换为Boolean

### 使用Boolean函数

> 数字转Number 除了0和NaN,其余都是true

 ~~~javascript
//数字转Number 除了0和NaN,其余都是true
a = "123";
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//true


a = "-123";
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//true

a = Infinity;
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//true

a = 0;
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//false

a = NaN;
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//false

 ~~~

> 字符串转Boolean,除了空串,都是true

~~~javascript
//字符串转Boolean,除了空串,都是true
a = "";
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//false

a = "false";
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//true

~~~

> null和undefined都会转换为false

~~~javascript
//null和undefined都会转换为false
a = null;
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//false

a = undefined;
a = Boolean(a);
console.log(typeof a);//boolean
console.log(a);//false
~~~

# 运算符优先级

![](https://fanaidi.gitee.io/blogimgs/JavaScript/%E8%BF%90%E7%AE%97%E7%AC%A6%E4%BC%98%E5%85%88%E7%BA%A7.png)

# 对象的简介

## 分类

### 1.内建对象

> 由ES标准中定义的对象,在任何的ES的实现中都可以使用
>
> 比如: Math String Number Boolean Function Object

### 2.宿主对象

> 由JS的运行环境提供的对象,目前来讲主要由浏览器提供的对象
>
> 比如 BOM DOM

### 3.自定义对象

> 由开发人员自己创建的对象

## 对象的基本操作

### 创建对象

> 使用new关键字调用的函数,是构造函数constructor
>
> 构造函数是专门用来创建对象的函数

~~~javascript
var obj = new Object();
~~~

### 向对象添加属性

~~~javascript
obj.name = "孙悟空";
obj.gender = "男";
obj.age = 18; 
~~~

![](https://fanaidi.gitee.io/blogimgs/JavaScript/%E6%B7%BB%E5%8A%A0%E5%B1%9E%E6%80%A7.png)

### 读取对象中的属性

> 语法: 对象.属性名
>
> 如果读取对象的属性不存在,不会报错而是返回undefined

~~~javascript
console.log(obj.age);
~~~

### 修改对象中的属性值

> 语法: 对象.属性 = 新值

~~~
obj.age = 20;
~~~

### 删除对象的属性

> 语法: delete 对象.属性

~~~javascript
var obj = new Object();
obj.name = "孙悟空";
obj.gender = "男";
obj.age = 18; 
delete obj.age;
console.log(obj);
~~~

![](https://fanaidi.gitee.io/blogimgs/JavaScript/%E5%88%A0%E9%99%A4%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7.png)

### in运算符

> 通过该运算符可以检查一个对象中是否含有指定的属性
>
> -如果有则返回true,没有返回false
>
> -语法: "属性名"  in 对象

~~~javascript
//检查obj中是否含有test2属性
console.log("test" in obj);
~~~

### 使用对象字面量创建一个对象

> 使用对象字面量,可以在创建对象时,直接指定对象中的属性
>
> 语法: {属性名:属性值,属性名:属性值,.....}

~~~javascript
var obj = {};
obj.name = "swk";

var obj1 = {name:"swk",age:18};
~~~

## 函数function

> 函数function
>
> -函数也是一个对象
>
> -函数中可以封装一些功能(代码),在需要时可以执行这些功能(代码)
>
> -函数中可以保存一些代码在需要的时候调用
>
> -使用typeof检查一个函数对象时,会返回function

### 创建一个函数对象

~~~javascript
//可以将要封装的代码以字符串的形式传递给构造函数
var fun = new Function("console.log('hello')");
//封装到函数中的代码不会理解执行
//函数中的代码会在函数调用的时候执行
//调用函数语法: 	函数对象()
fun();
~~~

### 使用函数声明来创建一个函数

> 语法:
>
> ​		function	函数名([形参1,形参2,....形参N]){
>
> ​		语句....
>
> }

~~~javascript
function fun2(){
	console.log("hello world");
}
fun2();
~~~

### 使用函数表达式来创建函数

> 语法 	var 函数名 = function([形参1,形参2,....形参N]){
>
> ​	语句....
>
> }

~~~javascript
var fun3 = function(){
    console.log("hello");
}
~~~

### 函数的返回值

> 如果return语句后不跟任何值就相当于返回一个undefined
>
> 如果函数中不写return,则也会返回undefined
>
> return后可以跟任意类型的值

### 立即执行函数

>  定义:函数定义完,立即被调用

~~~javascript
(function(){
	alert("立即执行函数");
})();

(function(a,b){
    alert("a+b="+(a+b));
})(123,456);
~~~

## 枚举对象中的属性

> 使用for.....in语句
>
> 语法:
>
> for(var 变量 in 对象){}
>
> for..in语句 对象中有几个属性,循环体就会执行几次 

~~~javascript
var obj = {
	name:"孙悟空",
	age:17,
	gender:"男",
	address:"花果山"
};
for(var n in obj){
	console.log(obj[n]);
}
~~~

## 作用域

### 全局作用域

> -直接编写在script标签中的JS代码,都在全局作用域
>
> -全局作用域在页面打开时创建,在页面关闭时销毁
>
> -在全局作用域中有一个全局对象window,它代表的是一个浏览器的窗口,它由浏览器创建我们可以直接使用
>
> -在全局作用域中:
>
> ​							创建的变量都会作为window对象的属性保存
>
> ​							创建的函数都会作为window对象的方法保存

**注意**

> 变量的声明提前
>
> ​	-使用var关键字声明的变量,会在所有的代码执行之前被声明
>
> 函数的声明提前
>
> ​	-使用函数声明形式创建的函数 function 函数名(){}
>
> ​		它会在所有的代码执行之前就被创建
>
> ​	-使用函数表达式创建的函数,不会被声明提前,所以不能在声明前调用
>
> ​	

### 函数作用域

> -调用函数时创建函数作用域,函数执行完毕以后,函数作用域销毁
>
> -每调用一次函数就会创建一个新的函数作用域,他们之间是相互独立的
>
> -在函数作用域中可以访问到全局作用域的变量
>
> -在函数中要访问全局变量可以使用window对象
>
> -在函数作用域也有声明提前的特性

### this

> 解析器在调用函数每次都会向函数内部传递进一个隐含的参数,这个隐含的参数就是this,this指向的是一个对象
>
> 这个对象我们称为函数执行的上下文对象
>
> 根据函数的调用方式的不同,this会指向不同的对象
>
> 以函数形式调用,this是window
>
> 以方法的形式调用,this是调用方法的对象

## 使用工厂方法创建对象

 ~~~javascript
function createObj(name,age,gender){
	var obj = new Object();
	obj.name = name;
	obj.age = age;
	obj.gender = gender;
	return obj;
}
var obj1 = createObj("孙悟空",18,"男");
var obj2 = createObj("猪八戒",28,"男");
var obj3 = createObj("沙和尚",38,"男");
console.log(obj1);
console.log(obj2);
console.log(obj3);
 ~~~

## 构造函数

> -构造函数就是一个普通的函数,创建方式和普通函数没有区别,
>
> -不同的是构造函数习惯上首字母大写
>
> -构造函数和普通函数的区别就是调用方式的不同
>
> -普通函数是直接调用,而构造函数需要使用new关键字来调用
>
> -构造函数的执行流程:
>
> 1.立刻创建一个新对象
>
> 2.将新建的对象设置为函数中的this,在构造函数中可以引用新建的对象 
>
> 3.逐行执行函数中的代码
>
> 4.将新建的对象作为返回值返回

~~~javascript
//使用同一个构造函数创建的对象,我们称为一类对象,也将一个构造函数称为一个类
function Person(name,age,gender){
	this.name = name;
	this.age = age;
	this.gender = gender;
}
var per1 = new Person("孙悟空",18,"男");
var per2 = new Person("猪八戒",28,"男");
var per3 = new Person("沙和尚",38,"男");
console.log(per1);
console.log(per2);
console.log(per3);
~~~

#### instanceof

> -使用instanceof可以检查一个对象是否是一个类的实例
>
> -语法: 对象 instanceof 构造函数
>
> ​		-如果是,返回true,否则,返回false
>
> -所有的对象都是Object的后代,所以任何对象和Object做instanceof检查时都会返回true

## 原型对象

> -原型 prototype
>
> -我们所创建的每一个函数,解析器都会向函数中添加一个属性prototype,这个属性对于着一个对象,这个对象就是原型对象
>
> -如果函数作为普通函数调用prototype没有任何作用
>
> -当函数以构造函数调用时,它所创建的对象中都会有一个隐含的属性,指向该构造函数的原型对象.
>
> -我们可以通过__proto__来访问该属性
>
> -原型对象就相当于一个公共的区域,所有同一个类的实例都可以访问到这个原型对象,我们可以将对象中共有的内容,统一设置到原型对象中
>
> -当我们访问对象的一个属性或者方法时,他会先在对象自身中寻找,如果有,则直接使用,如果没有则会去原型对象中寻找,如果找到则直接使用
>
> -以后我们创建构造函数时,可以将这些对象共有的属性和方法,统一添加到构造函数的原型对象中,这样不用分别为每一个对象添加,也不会影响到全局作用域,就可以使每个对象都具有这些属性和方法了

~~~javascript
function MyClass(){
	
}
var mc = new MyClass();
var mc2 = new MyClass();
console.log(mc2.__proto__ == MyClass.prototype);//true
~~~

~~~javascript
function Person(name,age,gender){
	this.name = name;
	this.age = age;
	this.gender = gender;
}
Person.prototype.sayName = function(){
	alert(this.name);
}
var per1 = new Person("孙悟空",18,"男");
var per2 = new Person("猪八戒",28,"男");
var per3 = new Person("沙和尚",38,"男");
console.log(per1);
console.log(per2);
console.log(per3);
per1.sayName();
per2.sayName();
console.log(per1.sayName == per2.sayName)
~~~

## 数组(Array)

> -数组也是一个对象
>
> -它和我们普通对象功能类似,也是用来存储一些值的
>
> -不同的是普通对象是使用字符串作为属性名的,而数组是使用数字作为索引操作元素
>
> -索引:从0开始的整数就是索引
>
> -数组的存储性能比普通对象要好,在开发中我们经常使用数组来存储一些数据

### 创建数组对象

~~~javascript
var arr = new Array();
~~~

### 向数组中添加元素

> 语法: 数组[索引] = 值

~~~javascript
arr[0]=10;
arr[1]=20;
~~~

### 读取数组中的元素

> 语法: 数组[索引]
>
> 如果读取不存在的索引,他不会报错而是返回undefined

~~~javascript
arr[0]
~~~

### 获取数组的长度

> 语法: 数组.length
>
> 对于连续的数组,使用length可以获取到数组的长度(元素的个数)
>
> 对于非连续的数组,使用length会获取到数组的最大的索引+1
>
> 尽量不要创建非连续的数组

~~~javascript
arr.length;
~~~

**注意**

> -修改length
>
> ​	如果修改的length大于原长度,则多出的部分会空出来
>
> ​	如果修改的length小于原长度,则多出的元素会被删除

### 向数组的最后一个位置添加元素

> 语法: 数组[数组.length] = 值

~~~javascript
arr[arr.length] = 70;
~~~

### 使用字面量来创建数组

~~~javascript
var arr = [];
var arr1 = [1,2,3,4,5,6,7];
//使用构造函数创建数组时,也可以同时添加元素,将要添加的元素作为构造函数的参数传递
//元素之间使用,隔开
var arr2 = new Array(1,2,3);
//数组中的元素可以是任意数据类型
arr = ["hello",1,true,null,undefined];
//也可以是对象
var obj = {name:"孙悟空"};
arr[arr.length] = obj;
arr = [{name:"孙悟空"},{name:"猪八戒"}];
//也可以是函数
arr = [function(){alert(1)},function(){alert(2)}];
//也可以是数组
arr = [[1,2],[3,4]];
~~~

### 数组的四个方法

#### push()

> -该方法可以向数组的末尾添加一个或多个元素,并返回数组的新的长度
>
> -可以将要添加的元素作为方法的参数传递
>
> ​	这样这些元素将会自动添加到数组的末尾

#### pop()

> -该方法可以删除数组的最后一个元素,并返回被删除的元素

#### unshift()

> 向数组的开头添加一个或多个元素,并返回新的数组长度

####  shift()

> 可以删除数组的第一个元素,并将删除的元素返回

### 数组的遍历

~~~javascript
var arr = ["a","b","c","d"];
for(var i = 0;i &lt; arr.length;i++){
    console.log(arr[i]);
}
~~~

#### forEach()方法

> forEach()方法需要一个函数作为参数
>
> -像这种函数,由我们创建但是不由我们调用的,我们称为回调函数
>
> -数组中有几个元素,函数就会执行几次,每次执行时,浏览器会将遍历到的元素以实参的形式传递进来,我们可以定义形参,来读取这些内容
>
> -浏览器会在回调函数中传递三个参数:
> 	第一个参数,就是当前正在遍历的元素
>
> ​	第二个参数,就是当前正在遍历的元素的索引
>
> ​	第三个参数,就是正在遍历的数组

~~~javascript
var arr = ["a","b","c","d"];
arr.forEach(function(value , index , object){
    console.log(value);
    console.log(index);
    console.log(object);
});
~~~

### 数组的方法

#### slice()

> -可以用来提取数组中的指定元素
>
> -该方法不会改变元素数组,而是将截取到的元素封装到一个新数组中返回
>
> -参数:
>
> ​	1.截取开始的位置的索引,包含开始索引
>
> ​	2.截取结束的位置的索引,不包含结束索引
>
> ​		-第二个参数可以省略不写,此时会截取从开始索引往后的元素
>
> ​	-索引可以传递一个负数,负数是从后往前计算
>
> ​			-1表示最后一个

#### splice()

> -可以用于删除数组中的指定元素
>
> -使用splice()会影响到原数组,会将指定元素从原数组中删除,并将删除的元素作为返回值返回
>
> -参数:
>
> ​	1.第一个,表示开始位置的索引
>
> ​	2.第二个,表示删除的数量
>
> ​	3.第三个及以后,可以传递一些新的元素,这些元素将会自动插入到开始位置索引的前面

#### concat()

> 可以连接两个或多个数组,并将新的数组返回
>
> ​	-该方法不会对原数组产生影响

~~~javascript
var result = arr.concat(arr2,"a","b");
~~~

#### join()

> -该方法可以将数组转换为一个字符串
>
> -该方法不会对原数组产生影响,而是将转换后的字符串作为结果返回
>
> -在join中可以指定一个字符串作为参数,这个字符串将会成为数组中元素的连接符
>
> ​	如果不指定连接符,则默认使用,作为连接符

#### reverse()

> -该方法用来反转数组(颠倒顺序)
>
> -该方法会直接修改原数组

#### sort()

> -可以用来对数组中的元素进行排序
>
> -也会影响原数组,默认按照unicode编码进行排序
>
> -即使对于纯数字的数组,使用sort()排序时,也会按照Unicode编码来排序
>
> ​	所以对数字进行排序时,可能会得到错误的结果
>
> -我们可以自己来指定规则
>
> ​	我们可以在sort()中添加一个回调函数来指定排序规则,回调函数中需要定义两个形参,浏览器将会分别使用数组中的元素作为实参去调用回调函数,使用哪个元素调用不确定,但是肯定的是在数组中a一定在b前面 
>
> -浏览器会根据回调函数的返回值来决定元素的顺序,
>
> ​	如果返回一个大于0的值,则元素会交换位置
>
> ​	如果返回小于0的值,则元素位置不变
>
> ​	如果返回0,则认为两个元素相等,位置不变 

~~~java
arr = [1,2,4,11,3,5];
//方法一
arr.sort(function(a,b){
    if(a>b){
        return 1;
    }else if(a &lt; b){
        return -1;
    }else{
        return 0;
    }
});
//方法二
arr.sort(function(a,b){
    return a-b;
});
console.log(arr);
~~~

#### call()和apply()

> -这两个方法都是函数对象的方法,需要通过函数对象来调用
>
> -当对函数调用call()和apply()都会调用函数执行
>
> -在调用call和apply()可以将一个对象指定为第一个参数,此时这个对象将会称为函数执行时的this
>
> -call()方法可以将实参在对象之后依次传递
>
> -apply()方法需要将实参封装到一个数组中统一传递
>
> -this的情况:
>
> ​	1.以函数形式调用时,this永远都是window
>
> ​	2.以方法的形式调用时,this是调用方法的对象
>
> ​	3.以构造函数形式调用时,this是新创建的对象
>
> ​	3.使用call()和apply()调用时,this是指定的对象

## Arguments

> 在调用函数时,浏览器每次都会传递进两个隐含的参数:
>
> ​	1.函数的上下文对象this
>
> ​	2.封装实参的对象arguments
>
> ​		-arguments是一个类数组对象,它也可以通过索引来操作数据,也可以获取长度
>
> ​		-在调用函数时,我们所传递的实参都会封装到arguments中
>
> ​		-arguments.length可以用来获取实参的长度
>
> ​		-我们即使不定义形参,也可以通过arguments来使用实参,只是比较麻烦 arguments[0]表示第一个实参
>
> ​		-它里面有个属性叫callee,这个属性对应的函数对象就是当前正在执行的函数对象

## Date对象

#### 创建对象

~~~javascript
//创建date对象
//如果直接使用构造函数创建一个Date对象,则会封装为当前代码执行的时间
var date = new Date();
console.log(date);
///创建一个指定的时间对象
//需要在构造函数中传递一个表示时间的字符串作为参数
//日期的格式: 月份/日/年 时:分:秒
var d2 = new Date("9/1/2021 12:01:23");
console.log(d2);
~~~

#### Date对象中的方法

##### getDate()

> 获取当前日期是几日

##### getDay()

> 获取当前日期对象是周几
>
> 会返回0-6的值,0表示周日,1表示周一

##### getMonth()

> 获取当前时间对象的月份
>
> 会返回0-11的值,0表示1月,11表示12月

##### getFullYear()

> 获取当前日期对象的年份 

##### getTime()

> -获取当前日期对象的时间戳
>
> -时间戳指的是1970年1月1日,0时0分0秒到当前日期所花费的毫秒数
>
> -计算机底层在保存时间时使用都是时间戳

~~~javascript
//获取当前日期的时间戳
time = Date.now();
~~~

## Math对象

> -Math和其他的对象不同,它不是一个构造函数,它属于一个工具类,不用创建对象,它里面封装了数学运算相关的属性和方法
>
> -比如 Math.PI表示圆周率

### Math对象中的方法

#### Math.abs()

> 可以用来计算一个数的绝对值

#### Math.ceil()

> 可以对一个数进行向上取整,小数位只要有值,就自动进1

#### Math.floor()

> 可以对一个数进行向下取整,小数部分会被舍掉

#### Math.round()

> 可以对一个数进行四舍五入取整

#### Math.random()

> 可以用来生成0-1之间的随机数

#### Math.max()

> 可以获取多个数的最大值

#### Math.min()

> 可以获取多个数中的最小值

#### Math.pow(x,y)

> 返回x的y次幂

#### Math.sqrt()

> 用于对一个数进行开方运算

## 包装类

> 在JS中为我们提供了三个包装类,通过这三个包装类可以将基本数据类型的数据转换为对象
>
> String()				-可以将基本数据类型字符串转换为String对象
>
> Number()			-可以将基本数据类型的数字转换为Number对象
>
> Boolean()			-可以将基本数据类型的布尔值转换为Boolean对象

**注意**

> -我们在实际应用中,不会使用基本数据类型的对象
>
> -如果使用基本数据类型的对象,在做一些比较时,可能会带来一些不可预期的结果
>
> 
>
> -方法和属性只能添加给对象,不能添加给基本数据类型
>
> ​		-浏览器会临时使用包装类将其转换为对象,然后再调用对象的属性和方法
>
> ​		-调用完以后,再将其转换为基本数据类型

~~~javascript
var a = 123;
a = a.toString();
a.hello = "hello";
console.log(a);
console.log(a.hello);//undefined
~~~

## String

> 在底层,字符串是以字符数组的形式保存的  

### 获取字符串的长度

~~~javascript
var str = "Hello World";
//length属性可以获取字符串的长度
console.log(str.length);
~~~

### 方法

#### chartAt()

> 可以返回字符串中指定位置的字符
>
> 根据索引获取指定的字符

#### charCodeAt()

> 获取指定位置字符的字符编码(Unicode编码)

#### String.fromCharCode()

> 可以根据字符编码去获取字符

#### concat()

> 可以用来连接两个或多个字符串

#### indexOf()

> -该方法可以检索一个字符串是否含有指定内容
>
> -如果字符串中含有该内容,则会返回其第一次出现的索引
>
> -如果没有找到指定的内容,则返回-1
>
> -可以指定第二个参数,指定开始查找的位置

#### lastIndextOf()

> -该方法的用法和indexOf()一样,
>
> ​		不同的是indexOf是从前往后找,
>
> ​		而lastIndexOf是从后往前找
>
> -也可以指定开始查找的位置

#### slice()

> -可以从字符串中截取指定的内容
>
> -不会影响原字符串,而是将截取到的内容返回
>
> -参数:
>
> ​		第一个,开始位置的索引(包括开始位置)
>
> ​		第二个,结束位置的索引(不包括结束位置)
>
> ​			如果省略第二个参数,则会截取到后边所有的
>
> ​		-也可以传递一个负数作为参数,负数的画将会从后边计算

#### substring()

> 可以用来截取一个字符串,和slice()类似
>
> 参数:
>
> ​		第一个:开始截取位置的索引(包括开始位置)
>
> ​		第二个:结束位置的索引(不包括结束位置)
>
> ​		不同的是,这个方法不能接受负值作为参数,如果传递了一个负值,则默认使用0
>
> ​		而且它还自动调整参数的位置,如果第二个参数小于第二个,则自动交换

#### substr()

> 用来截取字符串
>
> 参数:
>
> ​		1.截取开始位置的索引
>
> ​		2.截取的长度

#### split()

> 可以将一个字符串拆分为一个数组

#### toUpperCase()

> 可以将字符串转换成大写并返回

#### toLowerCase()

> 可以将字符串转换成小写并返回

~~~javascript
var str = "Hello World";
//length属性可以获取字符串的长度
console.log(str.length);
var result = str.charAt(0);//H

result = str.charCodeAt(0);//72

result = String.fromCharCode(72);//H 

result = str.concat("!!!");//Hello World!!!

result = str.indexOf("l");//2

result = str.indexOf("l",3);//3

result = str.lastIndexOf("l");//9

result = str.slice(1,2);//e 
result = str.slice(1);//ello World

result = str.substring(1,2);//e

result = str.substr(1,2);//el

result = str.split(" ");//["Hello", "World"]

result = str.toUpperCase();//HELLO WORLD

result = str.toLowerCase();//hello world

console.log(result);
~~~

# 正则表达式

> 正则表达式用于定义一些字符串的规则,计算机可以根据正则表达式,来检查一个字符串是否符合规则,获取将字符串中符合规则的内容提取出来

## 创建正则表达式对象

> 语法: var 变量 = new RegExp("正则表达式","匹配模式");
>
> 使用typeof检查正则对象,会返回object
>
> 在构造函数中可以传递一个匹配模式作为第二个参数
>
> ​	可以是:
>
> ​			i 忽略大小写 (ignore)
>
> ​			g 全局匹配模式

## 使用字面量创建正则表达式

> 语法: var 变量 = /正则表达式/匹配模式
>
> 使用字面量的方式创建更加简单
>
> 使用构造函数更加灵活

## 方法

### test()

> test()
>
> 使用这个方法可以用来检查一个字符串是否符合正则表达式的规则,
>
> 符合返回true,否则返回false

~~~javascript
//使用字面量创建正则表达式
var reg = /a/i;
/**
* |表示或
* []里的内容也是或的关系
* [ab] == a|b
* [a-z]表示任意的小写字母
* [A-Z]任意大写字母
* [A-z]任意字母
* [^ ]除了
* [0-9]表示任意数字
*/
//检查一个字符串中是否有a或b
reg = /a|b/;
//检查一个字符串中是否含有abc或adc或aec
reg = /a[bde]c/;
console.log(reg.test("abc"));
~~~

### search()

> -可以搜索字符串中是否含有指定内容
>
> -如果搜索到指定内容,则会返回第一次出现的索引,如果没有搜索到返回-1
>
> -它可以接受一个正则表达式作为参数,然后会根据正则表达式去检索字符串
>
> -search()只会查找第一个,即使设置全局匹配,也没用

### match()

> -可以根据正则表达式,从一个字符串中将符合条件的内容提取出来
>
> -默认情况下我们的match只会找到第一个符合要求的内容,找到以后就停止检索
>
> -我们可以设置正则表达式为全局匹配模式,这样就会匹配到所有的内容
>
> ​	可以为一个正则表达式设置多个匹配模式,且顺序无所谓
>
> -match()会将匹配到的内容封装到一个数组中返回,即使只查询到一个结果 

### replace()

> -可以将字符串中指定内容替换为新的内容
>
> -参数:
>
> ​		1.被替换的内容
>
> ​		2.新的内容
>
> -默认只会替换第一个

### split()

> 可以将一个字符串拆分为一个数组
>
> 方法中可以传递一个正则表达式作为参数,这样方法将会根据正则表达式去拆分字符串
>
> 这个方法即使不指定全局匹配,也会全都拆分

## 量词

> -通过量词可以设置一个内容出现的次数
>
> -量词只对它前面的一个内容起作用
>
> -{n} 正好出现n次
>
> -{m,n}出现m-n次
>
> -{m,}m次以上
>
> -+至少一个,相当于{1,}
>
> -* 0个或多个,相当于{0,}
>
> ^ 表示开头　
>
> $ 表示结尾
>
> . 表示任意字符   \.表示.
>
> \w 表示任意字母、数字
>
> \W　除了字母、数字
>
> \d　任意的数字［０－９］
>
> \D　除了数字［0－9］
>
> \s　空格
>
> \S　除了空格
>
> \b　单词边界
>
> \B　除了单词边界

~~~javascript
//去除开头和结尾的空格
reg = /^\s*|\s*$/g;
var str = "    he  llo    ";
str = str.replace(reg,"");
console.log(str);//he  llo
~~~

# BOM

## window

> 代表的是整个浏览器的窗口,同时window也是网页中的全局对象

## Navigator

> -代表的当前浏览器的信息,通过该对象可以来识别不同的浏览器
>
> -由于历史原因,Navigator对象中的大部分属性都已经不能帮助我们识别浏览器了
>
> -一般我们只会使用userAgent来判断浏览器的信息

## Location

> -代表当前浏览器的地址栏信息,通过Location可以获取地址信息,或者操作浏览器跳转页面
>
> -该对象中封装了浏览器的地址栏的信息
>
> -如果直接将location属性修改为一个完整的路径,或相对路径,则页面会自动跳转到该路径,并且会生成相应的历史记录
>
> -语法:location  = "www.baidu.com"

#### assign()

> 用来跳转到其他页面,作用和直接修改location一样
>
> 语法: location.assign("www.baidu.com");

#### reload()

> -用于重新加载当前页面
>
> -如果在方法中传递一个true,作为参数,则会强制清空缓存,刷新页面 语法: location.reload(true)

#### replace()

> -可以使用新的页面替换当前页面,调用完毕也会跳转页面

## History

> -代表浏览器的历史记录,可以通过该对象来操作浏览器的历史记录
>
> ​		由于隐私原因,该对象不能获取到具体的历史记录,只能操作浏览器向前或向后翻页
>
> ​		而且该操作只在当次访问时有效

#### length属性

> 可以获取到当前访问的链接数量

##### back()

> 可以用来回退到上一个页面,作用和浏览器的回退按钮一样
>
> 语法: history.back()

##### forward()

> 可以跳转下一个页面,作用和浏览器的前进按钮一样
>
> 语法: history.forward()

##### go()

> 可以用来跳转到指定页面
>
> 它需要一个整数作为参数
>
> ​	1:表示向前跳转一个页面
>
> ​	2:表示向前跳转两个页面
>
> ​	-1:向后跳转一个页面
>
> ​	-2:向后跳转两个页面
>
> 语法: history.go(index)

## Screen

> 代表用户的屏幕的信息,通过该对象可以获取到用户的显示器的相关的信息

------

**注意**

> 这些BOM对象在浏览器中都是作为window对象的属性保存的,可以通过window对象来使用,也可以直接使用

# 定时器

## setInterval()

> -定时调用
>
> -可以将一个函数,每隔一段时间执行一次
>
> -参数:
>
> ​	1.回调函数,该函数会每隔一段时间被调用一次
>
> ​	2.每次调用间隔的时间,单位是毫秒
>
> -返回值:
>
> ​		返回一个Number类型的数据
>
> ​		这个数字用来作为定时器的唯一标识

## clearInterval()

> 可以用来关闭一个定时器
>
> 方法中需要一个定时器的标识作为参数,这样将关闭标识对应的定时器

## setTimeout()

> -延时调用:
>
> ​		延时调用一个函数不马上执行,而是隔一段时间以后执行,而且只会执行一次
>
> -延时调用和定时调用的区别,定时调用会执行多次,而延时调用只会执行一次
>
> -延时调用和定时调用实际上是可以互相代替的,在开发中可以根据自己的需要去选择

## clearTimeout()

> 用来关闭一个延时调用