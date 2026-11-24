---
title: TypeScript 基础
date: 2023-10-25
categories: [前端]
tags: [TypeScript, 基础]
description: TypeScript 类型系统、接口与泛型基础学习笔记。
coverImg: /images/cover-1.svg
permalink: /posts/typescript-basics
---

## 1.TypeScript基本概念

### TypeScript是什么

- TypeScript 中文手册 https://typescript.bootcss.com/

- TypeScript 简称TS，是**JavaScript的超集**，简单来说，JS有的TS都有
- TypeScript = Type + JavaScript（在JS基础上，**为JS添加了类型支持**）
- TypeScript 是微软开发的开源编程语言，可以在任何运行JavaScript的地方运行

### 为什么要有TypeScript

**内容：**

- 背景：JS的类型系统存在“先天缺陷”弱类型，JS代码中绝大部分错误都是类型错误（Uncaught TypeError）

  - 开发的时候，定义的变量本应该就有类型

- 这些经常出现的错误，导致了在使用JS进行项目开发时，增加了找Bug，改Bug的时间，严重影响开发效率

- 例

  ~~~javascript
  var num = 18;
  num.toLowerCase();
  ~~~

- 从编程语言的动静来区分，TypeScript属于静态类型的编程语言，JavaScript属于动态类型的编程语言

  - 静态类型：编译期做类型检查
  - 动态类型：执行期做类型检查

- 代码编译和执行顺序：1.编译 2.执行

- 对于JS来说：需要等到代码真正去执行的时候才能发现错误（晚）

- 对于TS来说：在代码编译的时候（代码执行前）就可以发现错误（早）

- 配合VSCode等开发工具，TS可以提前到在编写代码的同时就发现代码中的错误，减少找Bug，改Bug时间

### 安装编译TS的工具包

为什么要安装编译TS的工具包？

- Node.js/浏览器，只认识JS代码，不认识TS代码，需要先将TS代码转为JS代码，然后才能运行

**安装命令**

~~~
npm i -g typescript
yarn global add typescript
~~~

**注意：**

- typescript包：用来编译TS代码的包，提供了tsc命令，实现了TS->JS的转化
- 验证是否安装成功：tsc -v(查看typescript的版本)

### 编译并运行TS代码

1. 创建 hello.ts 文件（注意：TS文件的后缀名为 .ts）
2. 将TS编译为JS：在终端中属于命令，tsc hello.ts (此时，在同级目录中会出现一个同名的JS文件)
3. 执行JS代码：在终端中输入命令：node hello.js

**注意：**

- 创建TS文件 -> 编译TS文件 -> 执行JS文件
- 由TS编译生成的JS代码，代码中就没有类型信息了
- 实际工作中，这些工作交给webpack或vite

### 创建基于TS的vue项目

~~~
yarn create vite
~~~

## 2.TypeScript基础

#### 类型注解

**例：**

~~~javascript
//相当于省略了：number，根据初始值进行类型推断
let age = 18
let age:number = 18
~~~

**说明：**

- 代码中的:number就是类型注解
- 作用：为变量添加类型约束。比如上述代码中，约定age的类型为number
- 解释：约定了什么类型，就只能给变量赋值该类型的值，否则，就会报错
- 约定了类型之后，代码的提示就会非常的清晰

**错误演示：**

~~~javascript
//错误原因：将string类型的值赋值给了number类型的变量，类型不一致
let age:number = '18'
~~~

#### 类型概述

可以将TS中的常用基础类型细分为两类：

- JS已有类型
  - 原始类型，简单类型（number、string、boolean、null、undefined）
  - 复杂数据类型（数组、对象，函数等）
- TS新增类型
  - 联合类型
  - 自定义类型（类型别名）
  - 接口
  - 元组
  - 字面量类型
  - 枚举
  - void
  - ...

#### 数组类型

数据类型的两种写法：

- number[]
- Array&lt;number>

~~~javascript
let numbers:number[] = [1,3,5]
let strings:Array&lt;string> = ['1','b','c']
~~~

#### 联合类型

数组中既有number类型，又有string类型，这个数据的类型应该如何写

~~~typescript
let arr:(number|string)[] = [1,'a',3,'b']
~~~

> |(竖线) :在TS中叫做联合类型。即：由两个或多个其他类型组成的类型，表示可以是这些类型中的任意一种

#### 类型别名

类型别名：为任意类型起别名

使用场景：当同一类型（复杂）被多次使用时，可以通过类型别名，简化该类型的使用

~~~typescript
type CustomArray = (number | string)[]
let arr1: CustomArray = [1,'a',3,'b']
~~~

**注意**

1. 使用type 关键字来创建自定义类型
2. 类型别名（比如，此处的CustomArray）可以是任意合法的变量名称
3. 推荐使用大写字母开头
4. 创建类型别名后，直接使用该类型别名作为变量的类型注解即可

#### 函数类型

##### 基本使用

函数的类型实际上指的是：==函数参数== 和 ==返回值== 的类型

为函数指定类型的两种方式：

- 单独指定参数、返回值的类型
- 同时指定参数、返回值的类型

1. 单独指定参数、返回值的类型

~~~typescript
//函数声明
function add(num1:number,num2:number):number{
    return num1 + num2
}
//箭头函数
const add = (num1:number,num2:number):number =>{
    return num1 + num2
}
~~~

2. 同时指定参数、返回值类型：

~~~typescript
type AddFn = (num1:number,num2:number) => number
const add:AddFn = (num1,num2) =>{
    return num1 + num2
}
~~~

**注意：**

- 当函数作为表达式时，可以通过类似箭头函数形式的语法来为函数添加类型
- 这种形式只适用于函数表达式

**扩展**

~~~typescript
//只能用于箭头函数
type FnType = (a: number, b: number) => number
const AddFn: FnType = (x, y) => {
    return x + y
}
console.log(AddFn(1,2))
~~~

##### void类型

如果函数没有返回值，那么，函数返回值类型为：==void==

~~~typescript
function say(name:string):void{
    console.log(name)
}
say('a')
~~~

**注意**

如果一个函数没有返回值，此时，在TS的类型中，应该使用 ==void== 类型

~~~typescript
// 如果什么都不写，此时，add函数的返回值类型为：void
const add = ()=>{}
//这种写法是明确指定函数返回值类型为void，与上面不指定返回值类型相同
const add = ():void => {}
//但，如果指定，返回值类型为undefined，此时，函数体中必须显示return undefined才可以
const add = ():undefined =>{
    return undefined
}
~~~

##### 可选参数

使用函数实现某个功能时，参数可以传也可以不传。这种情况下，在给函数参数指定类型时，就用到了==可选参数==

比如，数组的slice方法，可以==slice()==,也可以==slice(1)==，还可以==slice(1,3)==

> 可选参数：在可传可不传的参数名称后面加==?==（问号）

~~~typescript
const print = (name?: string, gender?: string): void => {
    console.log(name, gender)
}
~~~

**注意**

- 可选参数只能出现在参数列表的最后，也就是说可选参数后面不能再出现必选参数

#### 对象类型

JS中的对象是由属性和方法构成的，而TS对象的类型就是在描述对象的结构（有什么类型的属性和方法）

~~~typescript
//空对象
let person: {} = {}

// 有属性的对象
let person1: { name: string } = {
    name: '同学'
}

// 既有属性又有方法的对象
// 在一行代码中指定对象的多个属性类型时，使用；来分隔
let person2: {name:string;sayHi():void} = {
    name: 'jack',
    sayHi(){

    }
}

// 对象中如果有多个属性，可以换行写
// 通过换行来分隔多个属性类型，可以去掉；
let person3: {
    name: string
    sayHi():void
} = {
    name: 'jack',
    sayHi() {

    },
}
~~~

**总结**

1. 使用 =={}== 描述对象结构
2. 属性采用 ==属性名：类型== 的形式
3. 方法采用 ==方法名():返回值类型== 的形式

##### 箭头函数形式的方法类型

方法的类型也可以使用箭头函数形式

~~~typescript
type Person = {
    greet: (name:string) => void
    greet1(name:string):void
}
let person:Person = {
    greet(name){
        console.log(name)
    },
    greet1(name){
        console.log(name)
    }
}
~~~

##### 对象可选属性

- 对象的属性或方法，也可以是可选的，此时就用到可选属性了
- 比如，我们在使用axios({...})时，如果发送GET请求，method属性就可以省略
- 可选属性的语法与函数可选参数的语法一致，都使用？来表示

~~~typescript
type Config = {
    url: string
    method?: string 
}

function myAxios(config:Config){
    console.log(config)
}
myAxios({
    url:''
})
let obj:Config = {
    url: '',
    method: ''
}
//可选链操作符，前面有才会执行后面的函数
obj.method?.concat()
~~~

#### 接口类型

##### 基本使用

当一个对象类型被多次使用时，一般会使用接口（interfacce）来描述对象的类型，达到复用目的

**注意**

- 使用 ==interface== 关键字来声明接口
- 接口名称（比如，此处的IPerson），可以是任何任意合法的变量名称，推荐以 ==I== 开头
- 声明接口后，直接使用接口名称作为变量的类型
- 因为每一行只有一个属性类型，因此，属性类型后没有；（分号）

~~~typescript
interface IPerson{
    name: string
    age: number
    gender: string
    sayHi(): void
}
let person:IPerson = {
    name:'zs',
    age: 18,
    gender: '男',
    sayHi() {
        console.log('123')
    },
}
console.log(person.name)
person.sayHi()
~~~

##### interface vs type

interface和type（类型别名）的对比：

**相同点**

- 都可以给对象指定类型

**不同点**

- 接口，只能为对象指定类型
- 类型别名，不仅可以为对象指定类型，实际上可以为任意类型指定别名

**推荐：**能用type就用type

##### 接口继承

如果两个接口之间有相同的属性或方法，可以将公共的属性或方法抽离出来，通过继承来实现复用

**示例**

~~~typescript
interface IPerson {
    name: string
    age: number
    gender: string
    sayHi(): void
}
interface IStudent extends IPerson {
    score: number,
    class: string
}
let student: IStudent = {
    name: 'ls',
    age:18,
    gender: '女',
    sayHi() {
        console.log('hello')
    },
    score: 80,
    class: '6'
}
console.log(student.score)
~~~

使用 ==extends== 关键字可以让 IStudent 拥有 IPerson 所有的属性和方法

**扩展：**如何用 ==type== 实现 ==接口继承== 一样的效果？

~~~typescript
type Person = {
    name: string
    age: number
    gender: string
    sayHi(): void
}
type Student = {
    score: number,
    class: string
} & Person
let student: Student = {
    name: 'ls',
    age:18,
    gender: '女',
    sayHi() {
        console.log('hello')
    },
    score: 80,
    class: '6'
}
console.log(student.name)
student.sayHi()
~~~

#### 元组类型

**场景**

在地图中，使用经纬度坐标来标记位置信息。可以使用数组来记录坐标，那么，该数组中只有两个元素，并且这两个元素都是数值类型。

~~~typescript
let position: number[] = [1123.123, 345.234]
~~~

使用 ==number[]== 的缺点：不严谨，因为该类型的数组中可以出现任意多个数字

更好的方式：==元组==

元组是另一种类型的数组，它确切的知道包含多少个元素，**以及特定索引对应的类型**

~~~typescript
let position: [number, number] = [1123.123, 345.234]
~~~

**注意**

- 元组类型可以确切的标记出有多少个元素，以及每个元素的类型
- 该示例中，元素有两个元素，每个元素的类型都是number

#### 类型推论

- 在TS中，某些没有明确指出类型的地方，TS的类型推论机制会帮助提供类型
- 换句话说，由于类型推论的存在，这些地方，类型注解可以省略不写
- 发生类型推论的2种常见场景
  - 声明变量并初始化时
  - 决定函数返回值时

~~~typescript
let age = 18
function add(num1: number,num2: number){
    return num1 + num2
}
~~~

**注意**

- 能省略类型注解的地方就省略
- 如果不知道类型，可以通过鼠标放在变量名称上，利用VSCode的提示来查看类型

#### 字面量

##### 基本使用

思考以下代码，两个变量的类型分别是什么？

~~~typescript
let str1 = "hello TS"
const str2 = "hello TS"
~~~

通过TS类型推论机制，可以得到答案：

- 变量str1的类型为：string
- 变量str2的类型为：'hello TS'

**解释**

1. str1是一个变量(let)，它的值可以是任意字符串，所以类型为：string
2. str2是一个常量(const),它的值不能变化，只能是'hello TS'，所以，它的类型为：'hello TS'
3. 此处的'hello TS'，就是一个**字面量类型**，也就是说某个特定的字符串也可以作为TS中的类型
4. 任意的JS字面量（比如，对象、数字等）都可以作为类型使用

##### 使用模式和场景

**使用模式：**字面量类型配合联合类型一起使用

**使用场景：**用来表示一组明确的可选值列表

比如，在贪吃蛇中，游戏的方向的可选值只能是上、下、左、右中的任意一个

~~~typescript
// 使用自定义类型
type Direction = 'up' | 'down' | 'left' | 'right'
function changeDirection(direction: Direction) {
    console.log(direction)
}
// 调用函数时，会有类型提示
changeDirection('up')
~~~

参数 direction 的值只能是 'up' 、 'down' 、 'left' 、 'right'中的一个

相比于string，使用字面量类型更加精确、严谨

#### 枚举类型

##### 基本使用

- 枚举的功能类似字面量类型+联合类型组合的功能，也可以表示一组明确的可选值
- 枚举：定义一组命名常量，它描述一个值，该值可以是这些命名常量中的一个

~~~typescript
enum Direction {
    Up,
    Down,
    Left,
    Right
}
function changeDirection(direction: Direction) {
    console.log(direction)
}
changeDirection(Direction.Down)
~~~

##### 枚举实现原理

- 枚举是TS为数不多的非JavaScript类型级扩展（不仅仅是类型）的特性之一
- 因为：其他类型仅仅被当做类型，而枚举不仅用作类型，还提供值（枚举成员都是有值的）
- 也就是说，其他的类型会在编译为JS代码时自动移除。但是，**枚举类型会被编译为JS代码**。

~~~typescript
enum Direction {
    Up,
    Down,
    Left,
    Right
}
//会编译为以下代码
var Direction = void 0;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
~~~

#### any类型

**原则上，不推荐使用any！**这会让TypeScript变成'AnyScript'（失去TS类型保护的优势）

因为当值的类型为any时，可以对该值进行任意操作，并且不会有代码提示

~~~typescript
let obj:any = {x: 0}
obj.bar = 100
obj()
const n:number = obj
~~~

**解释**

- 以上操作都不会有任何类型错误提示，即使可能存在错误
- 尽可能避免使用any类型，除非临时使用any来避免书写很长、很复杂的类型
- 其他隐式具有any类型的情况
  - 声明变量不提供类型也不提供默认值
  - 函数参数不加类型
- 注意：因为不推荐使用any，所有，这两种情况都应该提供类型

#### 类型断言

有时候你比TS更加明确一个值的类型，此时，可以使用类型断言来指定更具体的类型，比如

~~~typescript
const aLink = document.getElementById('link')
~~~

- 该方法返回值的类型是HTMLElement,该类型只包含所有标签公共的属性或方法，不包含a标签特有的href等属性
- 因此，**这个类型太宽泛（不具体）**，无法操作href等a标签特有的属性或方法
- 解决方式：这种情况下就需要使用 ==类型断言== 指定更加具体的类型

示例

~~~typescript
const aLink = document.getElementById('link') as HTMLAnchorElement
~~~

解释

1. 使用 ==as== 关键字实现类型断言
2. 关键字as后面的类型是一个更加具体的类型（HTMLAnchorElement 是 HTMLElement 的子类型）
3. 通过类型断言，aLink的类型变得更加具体，这样就可以访问a标签特有的属性或方法了

另一种语法，使用 ==&lt;>== 语法，这种语法形式不常用，知道即可

~~~typescript
const aLink = &lt;HTMLAnchorElement>document.getElementById('link') 
~~~

#### 泛型

##### 基本介绍

泛型可以在保证类型安全前提下，让函数等与多种类型一起工作，从而实现复用，常用于函数、接口、class中

##### 泛型函数

~~~typescript
function id&lt;T>(val: T) {
    return val
}
function getId&lt;T>(val: T): T {
    return val
}
~~~

解释：

1. 语法：在函数名称的后面添加 ==&lt;>==,尖括号中添加变量类型，比如此处的T
2. 类型变量 T，是一种特殊类型的变量，它处理类型而不是值
3. 该类型变量相当于一个类型容器，能够捕获用户提供的类型（具体是什么类型由用户调用该函数时指定）
4. 因为T 是类型，因此可以将其作为函数参数和返回值类型，表示参数和返回值具有相同的类型
5. 类型变量 T，可以是任何合法的变量名称

调用泛型函数

~~~typescript
const n = id&lt;number>(123)
const b = id&lt;boolean>(true)
~~~

解释：

1. 语法：在函数名称后面添加&lt;>,尖括号中指定具体的类型，比如此处的number
2. 当传入类型number后，这个类型就会被函数声明时指定的类型变量T捕获到
3. 此时，T的类型就是number，所以，函数id参数和返回值的类型也都是number
4. 同样，如果传入类型string，函数id参数和返回值的类型就是string
5. 通过泛型就做到了让id函数与多种不同的类型一起工作，实现了复用的同时保证了类型安全

##### 添加约束

~~~typescript
interface ILength {
    length: number
}
function id&lt;T extends ILength>(val: T){
    console.log(val.length)
    return val
}

const n = id&lt;string>('123')
console.log(n)
~~~

**解释**

1. 创建描述约束的接口ILength，该接口要求提供length属性
2. 通过 ==extends== 关键字使用该接口，为泛型（类型变量）添加约束
3. 该约束表示：传入的类型必须具有length属性

**注意**

传入的实参（比如，数组）只要有length属性即可（类型兼容）

##### 多个类型变量

泛型的类型变量可以有多个，并且类型变量之间还可以约束（比如，第二个类型变量受第一个类型变量约束）比如，创建一个函数来获取对象中属性的值。

~~~typescript
function getProp&lt;T,Key extends keyof T>(obj: T,key: Key){
    return obj[key]
}

let person = {
    name: 'zs',
    age: 18
}
const name = getProp(person,'name')
console.log(name)
~~~

**解释**

1. 添加了第二个类型变量Key，两个类型变量之间使用 ==,== 分隔
2. keyof关键字接收一个对象类型，生成其键名称（可能是字符串或数字）的联合类型
3. 本示例中 keyof T 实际上获取的是person对象所有键的联合类型，也就是：'name'、'age'
4. 类型变量Key受T约束，可以理解为：Key只能是T所有键中的任意一个，或者说只能访问对象中存在的属性

##### 泛型接口

泛型接口：接口也可以适配泛型来使用，以增加其灵活性，增强其复用性

~~~typescript
interface IdFunc&lt;Type>{
    id: (value: Type) => Type
    ids: () => Type[]
}

let obj: IdFunc&lt;number> = {
    id(value){
        return value
    },
    ids(){
        return [1,2,3]
    }
}
~~~

解释：

1. 在接口名称的后面添加&lt;类型变量>，那么，这个接口就变成了泛型接口
2. 接口的类型变量，对接口中所有其他成员可见，也就是接口中所有成员都可以使用类型变量
3. 使用泛型接口时，需要显式指定具体的类型（比如，此处的IdFun&lt;number>）
4. 此时，id方法的参数和返回值类型都是number，ids方法的返回值类型是number[]

##### JS中的泛型接口

实际上，JS中的数组在TS中就是一个泛型接口

当我们在使用数组时，TS会根据数组的不同类型，来自动将类型变量设置为相应的类型，可以通过 ctrl + 鼠标左键 来查看具体的类型信息

## 3.类型声明文件

### 基本介绍

**类型声明文件：**用来为已存在的JS库提供类型信息

TS中有两种文件类型：

1. .ts
2. .d.ts

ts文件：

1. 既包含类型信息又可执行代码
2. 可以编译为.js文件，然后，执行代码
3. 用途：编写程序代码的地方

.d.ts文件

1. 只包含类型信息的类型声明文件
2. 不会生成.js文件，仅用于提供类型信息，在.d.ts文件中不允许出现可执行的代码，只用于提供类型
3. 用途：为JS提供类型信息

总结：.ts是implementation（代码实现文件）；.d.ts是declaration（类型声明文件）

如果要为JS库提供类型信息，要使用.d.ts文件

### 内置类型声明文件

- TS为JS运行时可用的所有标准化内置API都提供了声明文件
- 比如，在使用数组时，数组所有方法都会有相应的代码提示以及类型信息

~~~typescript
const strs = ['a','b','c']
//鼠标放forEach上查看类型
strs.forEach
~~~

- 实际上这都是TS提供的内置类型声明文件
- 可用通过Ctrl+鼠标左键来查看内置类型声明文件内容
- 比如，查看forEach方法的类型声明，在VSCode中会自动跳转到lib.es5.d.ts类型声明文件中
- 当然，像window，document等BOM，DOM API也都有相应的类型声明（lib.dom.d.ts）

### 第三方类型声明文件

第三方库可能没有提供类型声明文件，那么我们无法正常在ts中使用，就需要自行下载第三方提供的类型声明文件。

在 ==@types/xxx== 来找

### 自定义类型声明文件-共享数据

- 如果多个.ts文件中都用到同一个类型，此时可以创建.ts文件提供该类型，实现类型共享

- 操作步骤：

  - 创建index.ts类型声明文件
  - 创建需要共享的类型，并使用export导出（TS中的类型也可以使用import/export实现模块化功能）
  - 在需要使用共享类型的.ts文件中，通过import导入即可（.d.ts后缀导入时，直接省略）

  自定义类型声明文件为js提供声明

  1. 在将js项目迁移到ts项目时，为了让已有的.js文件有类型声明
  2. 成为库作者，创建库给他人使用。
