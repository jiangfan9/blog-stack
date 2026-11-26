---
title: JavaScript
date: 2022-07-28
categories: [语言]
tags: [JavaScript, ES6, 异步, 前端]
description: JavaScript 语言学习笔记，涵盖变量、闭包、原型链、事件循环、异步编程与高阶技巧。
coverImg: /images/cover/JavaScript.png
permalink: /posts/javascript
---

# JavaScript 系统学习指南：从基础到高阶

> 一份带代码示例的渐进式学习文档。建议按顺序阅读，每节的示例都可以直接复制到浏览器控制台或 Node.js 环境中运行。

## 目录

- [写在前面](#写在前面)
- [第一部分：基础篇](#第一部分基础篇)
- [第二部分：进阶篇](#第二部分进阶篇)
- [第三部分：高阶篇](#第三部分高阶篇)
- [附录：学习路线与资源](#附录学习路线与资源)

---

## 写在前面

### 如何运行文中的代码

1. **浏览器控制台**：按 `F12` 打开开发者工具，切换到 `Console`，粘贴代码回车即可。
2. **Node.js**：安装 Node.js 后，把代码保存为 `demo.js`，运行 `node demo.js`。本文涉及 DOM 的示例需在浏览器中运行。

### 推荐学习顺序

```
基础篇 → 进阶篇 → 高阶篇
   ↑        ↑        ↑
 语法     思维     原理与工程化
```

不要跳过基础直接看高阶——JavaScript 的高阶概念（闭包、原型、事件循环）几乎都建立在基础语法之上。

---

# 第一部分：基础篇

## 1. JavaScript 是什么

JavaScript 是一门运行在浏览器和服务器（Node.js）上的脚本语言，主要用于：

- 网页交互（DOM 操作、事件处理）
- 服务端开发（Node.js）
- 移动应用 / 桌面应用（React Native、Electron）
- 数据可视化、工具脚本等

```js
// 你的第一个 JavaScript 程序
console.log('Hello, JavaScript!');
```

## 2. 变量与常量

| 声明方式 | 作用域 | 可否重新赋值 | 可否重复声明 | 提升 |
|---------|--------|-------------|-------------|------|
| `var`   | 函数作用域 | 是 | 是 | 是（初始化为 undefined） |
| `let`   | 块级作用域 | 是 | 否 | 有（但存在暂时性死区） |
| `const` | 块级作用域 | 否 | 否 | 有（但存在暂时性死区） |

```js
// var：函数作用域，不推荐在现代代码中使用
var a = 1;
var a = 2; // 允许重复声明
console.log(a); // 2

// let：块级作用域，可重新赋值
let count = 0;
count = count + 1;
console.log(count); // 1
// let count = 3; // SyntaxError：不能重复声明

// const：块级作用域，不可重新赋值（但对象内容可改）
const PI = 3.14159;
// PI = 3; // TypeError: Assignment to constant variable

const user = { name: 'Alice' };
user.name = 'Bob'; // ✅ 可以修改对象的属性
// user = { name: 'Carol' }; // ❌ 不能重新赋值整个对象
```

**最佳实践**：默认用 `const`，需要重新赋值时用 `let`，几乎不用 `var`。

## 3. 数据类型

JavaScript 有 8 种基本数据类型：

- **原始类型**（7 种）：`Number`、`String`、`Boolean`、`undefined`、`null`、`Symbol`、`BigInt`
- **引用类型**（1 种）：`Object`（包括数组、函数、日期等）

```js
// 原始类型
let num = 42;           // Number
let str = 'hello';      // String
let bool = true;        // Boolean
let u = undefined;      // undefined：声明未赋值
let n = null;           // null：空值
let sym = Symbol('id'); // Symbol：唯一标识符
let big = 9007199254740991n; // BigInt：大整数

// 引用类型
let obj = { name: 'Tom', age: 18 };
let arr = [1, 2, 3];
let fn = function () {};

// typeof 判断类型
console.log(typeof num);      // "number"
console.log(typeof str);      // "string"
console.log(typeof bool);     // "boolean"
console.log(typeof u);        // "undefined"
console.log(typeof n);        // "object" —— 历史遗留问题
console.log(typeof sym);      // "symbol"
console.log(typeof big);      // "bigint"
console.log(typeof arr);      // "object"
console.log(typeof fn);       // "function"
console.log(typeof null);     // "object"（著名的 bug）

// 更精确地判断引用类型
console.log(Array.isArray(arr));        // true
console.log(obj instanceof Object);     // true
console.log(arr instanceof Array);      // true
```

## 4. 类型转换

### 显式转换

```js
// 转数字
console.log(Number('123'));     // 123
console.log(parseInt('123px')); // 123
console.log(parseFloat('3.14')); // 3.14
console.log(Number('abc'));     // NaN

// 转字符串
console.log(String(123));       // "123"
console.log((123).toString());  // "123"

// 转布尔
console.log(Boolean(1));        // true
console.log(Boolean(0));        // false
console.log(Boolean(''));       // false
console.log(Boolean([]));       // true —— 空数组是对象，为真值
```

### 隐式转换

```js
console.log('5' + 3);   // "53" —— 字符串拼接
console.log('5' - 3);   // 2 —— 减法会把字符串转成数字
console.log('5' * 3);   // 15
console.log(1 + '2' + 3); // "123"

// 假值（falsy）：在布尔上下文中会转为 false 的值
// false, 0, -0, 0n, "", null, undefined, NaN
if (0) { console.log('不会执行'); }
if ('hello') { console.log('会执行'); }
```

## 5. 运算符

```js
// 算术运算符
console.log(5 + 3, 5 - 3, 5 * 3, 5 / 3, 5 % 3, 2 ** 3); // 8 2 15 1.666... 2 8

// 赋值运算符
let x = 10;
x += 5; // 等价于 x = x + 5
console.log(x); // 15

// 比较运算符（推荐用 ===，避免隐式转换）
console.log(1 == '1');   // true  —— 值相等（发生了隐式转换）
console.log(1 === '1');  // false —— 严格相等，类型和值都要相同
console.log(NaN === NaN); // false —— NaN 不等于任何值，包括自己

// 逻辑运算符
console.log(true && false); // false —— 与
console.log(true || false); // true  —— 或
console.log(!true);         // false —— 非

// 三元运算符
let age = 18;
let status = age >= 18 ? '成年' : '未成年';
console.log(status); // "成年"

// 可选链（?.）：避免访问 undefined/null 属性时报错
let user = { profile: { name: 'Alice' } };
console.log(user?.profile?.name);  // "Alice"
console.log(user?.address?.city);  // undefined（不会抛错）

// 空值合并（??）：左侧为 null/undefined 时取右侧
let port = null;
console.log(port ?? 3000); // 3000
console.log(0 ?? 3000);    // 0（注意与 || 的区别）
```

## 6. 流程控制

```js
// if / else if / else
let score = 85;
if (score >= 90) {
  console.log('优秀');
} else if (score >= 60) {
  console.log('及格');
} else {
  console.log('不及格');
}

// switch
let day = 3;
switch (day) {
  case 1: console.log('周一'); break;
  case 2: console.log('周二'); break;
  case 3: console.log('周三'); break;
  default: console.log('其他');
}

// for 循环
for (let i = 0; i < 5; i++) {
  console.log(i); // 0 1 2 3 4
}

// while / do-while
let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}

// for...of：遍历可迭代对象（数组、字符串等）—— 推荐
let colors = ['red', 'green', 'blue'];
for (const color of colors) {
  console.log(color);
}

// for...in：遍历对象的可枚举属性（不推荐用于数组）
let person = { name: 'Tom', age: 18 };
for (const key in person) {
  console.log(key, person[key]);
}
```

## 7. 函数

```js
// 1. 函数声明（存在函数提升）
function add(a, b) {
  return a + b;
}

// 2. 函数表达式
const subtract = function (a, b) {
  return a - b;
};

// 3. 箭头函数（ES6，简洁且不绑定自己的 this）
const multiply = (a, b) => a * b;
const greet = name => `Hello, ${name}!`; // 单参数可省略括号
const getObj = () => ({ name: 'Tom' }); // 返回对象需加括号

console.log(add(1, 2));       // 3
console.log(subtract(3, 1));  // 2
console.log(multiply(2, 4));  // 8
console.log(greet('Alice'));  // "Hello, Alice!"

// 4. 默认参数
function intro(name = 'Anonymous', age = 0) {
  console.log(`${name}, ${age}岁`);
}
intro();            // "Anonymous, 0岁"
intro('Tom', 18);   // "Tom, 18岁"

// 5. 剩余参数（rest）：把多个参数收集为数组
function sum(...nums) {
  return nums.reduce((acc, cur) => acc + cur, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// 6. 立即执行函数表达式（IIFE）
(function () {
  console.log('立即执行');
})();
```

## 8. 数组

```js
let arr = [1, 2, 3];

// 访问与修改
console.log(arr[0]);     // 1
arr[1] = 99;
console.log(arr);        // [1, 99, 3]
console.log(arr.length); // 3

// 增删改
arr.push(4);        // 末尾添加
arr.pop();          // 末尾删除
arr.unshift(0);     // 开头添加
arr.shift();        // 开头删除
console.log(arr);   // [0, 1, 99, 3]

// 常用方法
let nums = [1, 2, 3, 4, 5];
console.log(nums.slice(1, 3));      // [2, 3] —— 截取，不改原数组
console.log(nums.splice(1, 2));     // [2, 3] —— 删除，会改原数组
console.log(nums.indexOf(4));       // 1 —— splice 后 3 已被删除，4 在索引 1；找不到返回 -1
console.log(nums.includes(3));      // false —— splice 后 3 已不在数组中
console.log(nums.join('-'));        // "1-4-5"
console.log([...nums, 6]);          // [1, 4, 5, 6] —— 扩展运算符
console.log(nums.reverse());        // [5, 4, 1] —— 反转（改原数组）

// 数组排序（注意默认按字符串排序）
console.log([10, 2, 1].sort());             // [1, 10, 2] —— 默认字典序
console.log([10, 2, 1].sort((a, b) => a - b)); // [1, 2, 10] —— 数值升序
```

## 9. 对象

```js
// 创建对象
let person = {
  name: 'Alice',
  age: 25,
  // 方法
  sayHello() {
    console.log(`Hi, I'm ${this.name}`);
  }
};

// 访问属性
console.log(person.name);    // "Alice"
console.log(person['age']);  // 25 —— 方括号语法
person.sayHello();           // "Hi, I'm Alice"

// 动态添加 / 删除属性
person.email = 'alice@example.com';
delete person.age;

// 遍历对象
for (const key in person) {
  console.log(key, person[key]);
}
// 或
console.log(Object.keys(person));   // ["name", "sayHello", "email"]
console.log(Object.values(person)); // 值数组
console.log(Object.entries(person)); // 键值对数组

// 解构赋值（ES6）
const { name, email } = person;
console.log(name, email);
```

## 10. 字符串

```js
let str = 'Hello World';

console.log(str.length);              // 11
console.log(str.toUpperCase());       // "HELLO WORLD"
console.log(str.toLowerCase());       // "hello world"
console.log(str.includes('World'));   // true
console.log(str.startsWith('Hello')); // true
console.log(str.endsWith('World'));   // true
console.log(str.indexOf('World'));    // 6
console.log(str.slice(0, 5));         // "Hello"
console.log(str.split(' '));          // ["Hello", "World"]
console.log(str.replace('World', 'JS')); // "Hello JS"
console.log('  hi  '.trim());         // "hi"
console.log('ab'.repeat(3));          // "ababab"

// 模板字符串（ES6）
let name = 'Alice';
let msg = `Hello, ${name}! 1 + 1 = ${1 + 1}`;
console.log(msg); // "Hello, Alice! 1 + 1 = 2"
```

---

# 第二部分：进阶篇

## 1. 作用域与闭包

### 作用域

```js
// 全局作用域
let globalVar = 'global';

function test() {
  // 函数作用域
  let localVar = 'local';
  console.log(globalVar); // 可以访问全局
}

// console.log(localVar); // ReferenceError —— 外部访问不到函数内部变量

// 块级作用域
if (true) {
  let blockVar = 'block';
  console.log(blockVar); // "block"
}
// console.log(blockVar); // ReferenceError
```

### 闭包

**闭包 = 函数 + 它能访问的外部变量**。即使外部函数已经返回，内部函数仍能记住并访问外部作用域的变量。

```js
function counter() {
  let count = 0; // 被闭包"捕获"
  return function () {
    count++;
    console.log(count);
  };
}

const add = counter();
add(); // 1
add(); // 2
add(); // 3 —— count 的状态被保留了下来

const another = counter();
another(); // 1 —— 新的独立闭包

// 经典应用：私有变量
function createBank(initial) {
  let balance = initial;
  return {
    deposit(amount) { balance += amount; },
    getBalance() { return balance; }
  };
}
const account = createBank(100);
account.deposit(50);
console.log(account.getBalance()); // 150
// 外部无法直接访问 balance —— 实现了封装
```

> ⚠️ 注意：闭包会让变量常驻内存，滥用可能导致内存泄漏。

## 2. this 关键字

`this` 的指向取决于**函数如何被调用**，而不是定义位置。

```js
// 1. 普通函数调用：this 指向全局对象（严格模式下为 undefined）
function show() { console.log(this); }
show();

// 2. 方法调用：this 指向调用该方法的对象
const obj = {
  name: 'Tom',
  say() { console.log(this.name); }
};
obj.say(); // "Tom"

// 3. 构造函数中：this 指向新创建的实例
function Person(name) { this.name = name; }
const p = new Person('Alice');
console.log(p.name); // "Alice"

// 4. 箭头函数：没有自己的 this，继承外层作用域的 this
const timer = {
  delay: 1000,
  start() {
    setTimeout(() => {
      console.log(this.delay); // 1000 —— 箭头函数继承 start 的 this
    }, this.delay);
  }
};
timer.start();

// 5. call / apply / bind：显式改变 this 指向
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}
const user = { name: 'Bob' };
greet.call(user, 'Hi');       // "Hi, Bob"
greet.apply(user, ['Hello']); // "Hello, Bob"
const boundGreet = greet.bind(user);
boundGreet('Hey');            // "Hey, Bob"
```

## 3. 原型与原型链

每个对象都有一个原型（`[[Prototype]]`），访问属性时若自身没有，就会沿原型链向上查找。

```js
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function () {
  console.log(`Hi, I'm ${this.name}`);
};

const p = new Person('Alice');
p.sayHello(); // "Hi, I'm Alice" —— 来自原型上的方法

// 关系验证
console.log(p.__proto__ === Person.prototype); // true
console.log(Person.prototype.constructor === Person); // true
console.log(Object.getPrototypeOf(p) === Person.prototype); // true

// 原型链查找：实例 → 构造函数原型 → Object.prototype → null
console.log(p.toString()); // 来自 Object.prototype
console.log(p.__proto__.__proto__ === Object.prototype); // true

// hasOwnProperty：判断属性是否为自身拥有
console.log(p.hasOwnProperty('name'));     // true
console.log(p.hasOwnProperty('sayHello')); // false（在原型上）
```

## 4. 面向对象：class

`class` 是原型链语法糖，让面向对象写法更清晰。

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound`);
  }
  // getter
  get info() {
    return `${this.name} the animal`;
  }
  // setter
  set info(value) {
    this.name = value;
  }
  // 静态方法
  static create(name) {
    return new Animal(name);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Rex', 'Labrador');
dog.speak();            // "Rex barks"
console.log(dog.info);  // "Rex the animal"
dog.info = 'Max';
console.log(dog.name);  // "Max"
const cat = Animal.create('Kitty');
console.log(cat.info); // "Kitty the animal"
```

## 5. 数组高阶函数

```js
const nums = [1, 2, 3, 4, 5, 6];

// map：映射，返回新数组
console.log(nums.map(n => n * 2)); // [2, 4, 6, 8, 10, 12]

// filter：过滤，返回满足条件的元素
console.log(nums.filter(n => n % 2 === 0)); // [2, 4, 6]

// reduce：归并，把数组计算成单个值
console.log(nums.reduce((sum, n) => sum + n, 0)); // 21
// 求最大值
console.log(nums.reduce((max, n) => n > max ? n : max, nums[0])); // 6

// find / findIndex：查找
console.log(nums.find(n => n > 3));      // 4
console.log(nums.findIndex(n => n > 3)); // 3

// some / every：判断
console.log(nums.some(n => n > 5));  // true —— 只要有一个满足
console.log(nums.every(n => n > 0)); // true —— 全部满足

// flat：扁平化
console.log([1, [2, [3]]].flat(2)); // [1, 2, 3]
```

## 6. 异步编程

### 回调 → Promise → async/await

```js
// 1. 回调函数（容易形成"回调地狱"）
setTimeout(() => {
  console.log('1 秒后执行');
}, 1000);

// 2. Promise：表示异步操作的最终完成或失败
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    success ? resolve('成功') : reject('失败');
  }, 1000);
});
p.then(result => console.log(result))
 .catch(error => console.error(error))
 .finally(() => console.log('无论成功失败都执行'));

// Promise 静态方法
Promise.all([Promise.resolve(1), Promise.resolve(2)])
  .then(results => console.log(results)); // [1, 2] —— 全部成功
Promise.race([Promise.resolve('a'), Promise.resolve('b')])
  .then(result => console.log(result)); // "a" —— 取最先完成的

// 3. async/await：用同步写法写异步代码（推荐）
function fetchUser(id) {
  return new Promise(resolve => {
    setTimeout(() => resolve({ id, name: 'Alice' }), 500);
  });
}

async function main() {
  try {
    console.log('开始');
    const user = await fetchUser(1); // 等待 Promise 完成
    console.log(user);               // { id: 1, name: "Alice" }
  } catch (error) {
    console.error(error);
  }
}
main();
```

## 7. 事件循环（Event Loop）

JavaScript 是单线程的，通过事件循环实现异步：

```
调用栈 (Call Stack)
    ↓ 清空后
微任务队列 (Microtask): Promise.then / await / queueMicrotask
    ↓ 全部执行完
宏任务队列 (Macrotask): setTimeout / setInterval / I/O
```

```js
console.log('1 —— 同步');

setTimeout(() => console.log('5 —— 宏任务 setTimeout'), 0);

Promise.resolve()
  .then(() => console.log('3 —— 微任务 Promise'));

async function asyncFn() {
  console.log('2 —— 同步（async 函数体内）');
  await Promise.resolve();
  console.log('4 —— 微任务（await 之后）');
}
asyncFn();

// 输出顺序：1 → 2 → 3 → 4 → 5
// 记忆口诀：同步先行 → 微任务 → 宏任务
```

## 8. 模块化

```js
// ===== math.js（ES Module）=====
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }
```

```js
// ===== main.js =====
import multiply, { PI, add } from './math.js';
console.log(add(1, 2), multiply(2, 3), PI);
```

```js
// CommonJS（Node.js 传统写法）
// math.js：module.exports = { add, PI };
// main.js：const { add, PI } = require('./math');

// 动态导入（按需加载）
// import('./math.js').then(module => console.log(module.add(1, 2)));
```

## 9. DOM 操作与事件

```js
// 选择元素
const box = document.querySelector('.box');
const items = document.querySelectorAll('li');

// 修改内容与属性
box.textContent = '新文本';
box.innerHTML = '<strong>加粗文本</strong>';
box.classList.add('active');
box.setAttribute('data-id', '123');

// 修改样式
box.style.color = 'red';

// 创建与插入元素
const p = document.createElement('p');
p.textContent = '动态创建的段落';
box.appendChild(p);

// 事件监听
box.addEventListener('click', event => {
  console.log('被点击了', event.target);
});

// 事件委托：在父元素上监听子元素的事件
document.querySelector('ul').addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    console.log('点击了列表项:', e.target.textContent);
  }
});
```

## 10. 错误处理

```js
// try / catch / finally
try {
  JSON.parse('invalid json'); // 故意制造错误
} catch (error) {
  console.error('捕获到错误:', error.message);
} finally {
  console.log('无论是否出错都会执行');
}

// 主动抛出错误
function divide(a, b) {
  if (b === 0) {
    throw new Error('除数不能为 0');
  }
  return a / b;
}
try {
  console.log(divide(10, 0));
} catch (e) {
  console.error(e.message); // "除数不能为 0"
}

// 常见错误类型：Error / TypeError / ReferenceError / SyntaxError / RangeError
```

---

# 第三部分：高阶篇

## 1. 执行上下文与调用栈

执行上下文是代码执行时的"环境"，包含变量环境、词法环境、`this` 等。

```js
var a = 'global';

function outer() {
  var b = 'outer';
  function inner() {
    var c = 'inner';
    console.log(a, b, c); // 通过作用域链访问所有变量
  }
  inner();
}
outer();

// 调用栈：inner() 入栈 → outer() 入栈 → 全局上下文（栈底）
// 执行顺序：后进先出，inner 执行完先出栈

// var 提升 vs let 暂时性死区
console.log(hoisted); // undefined —— var 声明提升，值为 undefined
var hoisted = 1;
// console.log(notHoisted); // ReferenceError —— let 的暂时性死区
let notHoisted = 2;
```

## 2. 内存管理与垃圾回收

内存生命周期：分配 → 使用 → 回收。现代引擎主要用**标记-清除**算法：从根对象出发，不可达的对象被回收。

```js
// 常见内存泄漏场景与规避

// 1. 意外的全局变量
function leak() {
  leakedVar = '我是全局变量'; // 没用 var/let/const，会挂到 window
}
// 解决：使用严格模式 'use strict' 或始终声明变量

// 2. 被遗忘的定时器 / 事件监听
let timer = setInterval(() => { /* ... */ }, 1000);
clearInterval(timer); // 不使用时一定要清除

const btn = document.querySelector('button');
const handler = () => console.log('click');
btn.addEventListener('click', handler);
btn.removeEventListener('click', handler); // 不使用时解绑

// 3. 闭包持有大对象
function bigClosure() {
  const hugeData = new Array(1000000).fill('data');
  return () => console.log(hugeData.length); // 闭包让 hugeData 无法被回收
}
// 解决：用完后手动置 null，或缩小闭包捕获范围
```

## 3. 迭代器与生成器

```js
// 可迭代协议：实现 Symbol.iterator 方法
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }

// for...of 的本质就是调用迭代器
for (const item of arr) {
  console.log(item);
}

// 生成器函数：function* + yield，可暂停/恢复执行
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++; // 暂停并产出一个值
  }
}
const gen = idGenerator();
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3

// 生成器实现无限序列、协程式流程控制
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const fib = fibonacci();
let seq = '';
for (let i = 0; i < 10; i++) {
  seq += fib.next().value + ' ';
}
console.log(seq.trim()); // "0 1 1 2 3 5 8 13 21 34"
```

## 4. Proxy 与 Reflect

`Proxy` 可以拦截并自定义对象的基本操作（读取、赋值、删除等）。

```js
// 基础拦截
const target = { name: 'Tom', age: 18 };
const proxy = new Proxy(target, {
  get(obj, key) {
    console.log(`读取属性: ${key}`);
    return key in obj ? obj[key] : '默认值';
  },
  set(obj, key, value) {
    console.log(`设置属性: ${key} = ${value}`);
    if (key === 'age' && (value < 0 || value > 150)) {
      throw new Error('年龄不合法');
    }
    return Reflect.set(obj, key, value); // 用 Reflect 完成默认行为
  }
});
console.log(proxy.name); // 输出日志 + "Tom"
proxy.age = 20;          // 输出日志
// proxy.age = 200;      // Error: 年龄不合法

// 应用：数据校验
function createReactive(obj) {
  return new Proxy(obj, {
    set(target, key, value) {
      console.log(`视图更新: ${key} 变为 ${value}`);
      return Reflect.set(target, key, value);
    }
  });
}
const state = createReactive({ count: 0 });
state.count++; // "视图更新: count 变为 1" —— Vue 3 响应式原理的简化版
```

## 5. 深拷贝与浅拷贝

```js
const original = { a: 1, nested: { b: 2 } };

// 浅拷贝：只复制第一层，嵌套对象仍共享引用
const shallow = { ...original };
shallow.nested.b = 99;
console.log(original.nested.b); // 99 —— 原对象被影响

// 深拷贝方式 1：JSON（简单但有局限）
const deep1 = JSON.parse(JSON.stringify(original));
deep1.nested.b = 100;
console.log(original.nested.b); // 99 —— 互不影响
// 局限：无法处理函数、undefined、Symbol、Date、循环引用、RegExp 等

// 深拷贝方式 2：structuredClone（现代浏览器/Node 17+）
const deep2 = structuredClone(original);

// 深拷贝方式 3：手写递归（面试常考）
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj; // 原始类型直接返回
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (map.has(obj)) return map.get(obj); // 处理循环引用

  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepClone(obj[key], map);
  }
  return clone;
}
const deep3 = deepClone(original);
console.log(deep3);
```

## 6. 防抖与节流

```js
// 防抖（debounce）：停止触发后等待 n 毫秒才执行 —— 适用于搜索框输入
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流（throttle）：每 n 毫秒最多执行一次 —— 适用于滚动、按钮点击
function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用示例（浏览器中）
// const search = debounce(() => console.log('发送请求'), 300);
// input.addEventListener('input', search);
// window.addEventListener('scroll', throttle(() => console.log('滚动'), 200));
```

## 7. 函数柯里化与组合

```js
// 柯里化：把多参数函数转成一系列单参数函数
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6

// 偏函数：固定部分参数
const multiply = (a, b) => a * b;
const double = multiply.bind(null, 2);
console.log(double(5)); // 10

// 函数组合：把多个函数串联成管道（从右到左执行）
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const add1 = x => x + 1;
const times2 = x => x * 2;
console.log(compose(add1, times2)(3)); // 7 —— 先 times2(3)=6，再 add1(6)=7
console.log(pipe(add1, times2)(3));    // 8 —— 先 add1(3)=4，再 times2(4)=8
```

## 8. 常用设计模式

```js
// 1. 单例模式：保证一个类只有一个实例
class Singleton {
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}
console.log(Singleton.getInstance() === Singleton.getInstance()); // true

// 2. 工厂模式：封装对象创建逻辑
function createUser(type, name) {
  const users = {
    admin: { name, role: 'admin', permissions: ['read', 'write'] },
    guest: { name, role: 'guest', permissions: ['read'] }
  };
  return users[type] || null;
}
console.log(createUser('admin', 'Alice'));

// 3. 发布-订阅模式：解耦事件发布者与订阅者
class EventEmitter {
  constructor() { this.events = {}; }
  on(event, fn) {
    (this.events[event] ||= []).push(fn);
  }
  emit(event, ...args) {
    (this.events[event] || []).forEach(fn => fn(...args));
  }
}
const emitter = new EventEmitter();
emitter.on('login', user => console.log('欢迎', user));
emitter.emit('login', 'Alice'); // "欢迎 Alice"

// 4. 模块模式：用闭包封装私有状态
const counterModule = (function () {
  let count = 0; // 私有
  return {
    increment: () => ++count,
    getCount: () => count
  };
})();
counterModule.increment();
console.log(counterModule.getCount()); // 1
```

## 9. 性能优化要点

```js
// 1. 减少 DOM 操作：用文档片段批量插入
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // 在内存中操作，不触发重排
}
document.querySelector('ul').appendChild(fragment); // 只插入一次

// 2. 事件委托：用一个监听器代替多个
// （见进阶篇第 9 节示例）

// 3. 缓存计算结果：记忆化（memoization）
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
const fib = memoize(n => n <= 1 ? n : fib(n - 1) + fib(n - 2));
console.log(fib(40)); // 快速得出 102334155

// 4. 避免循环中创建函数 / 重复计算
// 5. 大计算量任务用 Web Worker，避免阻塞主线程
// 6. 图片懒加载、代码分割、按需加载
```

## 10. 元编程与进阶特性

```js
// Symbol：创建唯一的键，避免属性名冲突
const id = Symbol('id');
const user = { [id]: 123, name: 'Alice' };
console.log(user[id]); // 123

// well-known Symbol：改变语言行为
const arr = [1, 2, 3];
arr[Symbol.iterator]; // 让数组可被 for...of 遍历
console.log([1, 2][Symbol.iterator]().next());

// Object.defineProperty：精确控制属性行为（Vue 2 响应式原理）
let value = 1;
const obj = {};
Object.defineProperty(obj, 'value', {
  get() { return value; },
  set(newValue) {
    console.log(`值从 ${value} 变为 ${newValue}`);
    value = newValue;
  },
  enumerable: true,
  configurable: true
});
obj.value = 2; // "值从 1 变为 2"

// Reflect：操作对象的标准化方式
console.log(Reflect.get(obj, 'value')); // 2
Reflect.set(obj, 'value', 3);
console.log(Reflect.has(obj, 'value')); // true

// 装饰器（Decorator，需 Babel/TS 支持）—— 用于注解和修改类成员
// @log
// class MyClass { ... }
```

---

# 附录：学习路线与资源

## 建议练习路径

| 阶段 | 推荐练习项目 |
|------|-------------|
| 基础 | 待办事项列表、计算器、猜数字游戏 |
| 进阶 | 天气预报应用（调用 API）、购物车、简易路由 |
| 高阶 | 手写 Promise、响应式框架迷你版、任务调度器 |

## 推荐资源

- **文档**：MDN Web Docs（JavaScript 权威参考）、JavaScript.info（系统教程）
- **练习**：LeetCode（算法）、Codewars（趣味编程）、Frontend Mentor（实战项目）
- **深入**：《你不知道的 JavaScript》系列、《JavaScript 高级程序设计》

## 检验学习成果的自测题

1. `var`、`let`、`const` 的区别是什么？什么是暂时性死区？
2. `==` 和 `===` 的区别？`NaN === NaN` 的结果是什么？
3. 什么是闭包？它有哪些应用场景和隐患？
4. `this` 的指向由什么决定？箭头函数的 `this` 有何特殊？
5. 描述原型链查找过程。
6. `Promise` 有哪几种状态？`Promise.all` 与 `Promise.race` 的区别？
7. 事件循环中微任务和宏任务的执行顺序是怎样的？
8. 深拷贝与浅拷贝的区别？`JSON.parse(JSON.stringify())` 有哪些局限？
9. 防抖和节流的区别及各自适用场景？
10. 闭包、定时器、事件监听为什么会造成内存泄漏？

---
