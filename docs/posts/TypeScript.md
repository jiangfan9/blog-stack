---
title: TypeScript
date: 2022-07-28
categories: [语言]
tags: [TypeScript, 类型系统, 泛型, 前端]
description: TypeScript 学习笔记，涵盖类型系统、接口与泛型、类型体操及工程化实践。
coverImg: /images/cover-1.svg
permalink: /posts/typescript
---

# TypeScript 系统学习指南

> 面向有 JavaScript 经验的开发者 · 从基础到高阶 · 基于 TypeScript 5.x
>
> 文档目标：读完能独立在工程中设计类型、读懂开源库的类型声明、并具备编写复杂类型工具的基础能力。

---

## 目录

- [写在前面](#写在前面)
- [第一部分：基础篇](#第一部分基础篇)
  - [1. 第一个 TypeScript 程序](#1-第一个-typescript-程序)
  - [2. 基础类型](#2-基础类型)
  - [3. 类型推断与类型注解](#3-类型推断与类型注解)
  - [4. 数组、元组与对象](#4-数组元组与对象)
  - [5. 接口与类型别名](#5-接口与类型别名)
  - [6. 函数类型](#6-函数类型)
  - [7. 联合类型、交叉类型与字面量类型](#7-联合类型交叉类型与字面量类型)
  - [8. 类型窄化](#8-类型窄化)
  - [9. 类](#9-类)
  - [10. 枚举](#10-枚举)
  - [11. 模块](#11-模块)
  - [基础篇练习](#基础篇练习)
- [第二部分：高阶篇](#第二部分高阶篇)
  - [12. 泛型](#12-泛型)
  - [13. 深入类型推断](#13-深入类型推断)
  - [14. keyof、typeof 与索引访问类型](#14-keyoftypeof-与索引访问类型)
  - [15. 映射类型](#15-映射类型)
  - [16. 条件类型与 infer](#16-条件类型与-infer)
  - [17. 模板字面量类型](#17-模板字面量类型)
  - [18. 内置工具类型原理剖析](#18-内置工具类型原理剖析)
  - [19. 类型体操实战](#19-类型体操实战)
  - [20. 结构化类型与型变](#20-结构化类型与型变)
  - [21. 声明文件与模块增强](#21-声明文件与模块增强)
  - [高阶篇练习](#高阶篇练习)
- [第三部分：工程篇](#第三部分工程篇)
  - [22. tsconfig 完全解析](#22-tsconfig-完全解析)
  - [23. 与 React / Vue 集成](#23-与-react--vue-集成)
  - [24. 构建与发布](#24-构建与发布)
  - [25. 最佳实践与常见陷阱](#25-最佳实践与常见陷阱)
  - [26. 后续学习路线](#26-后续学习路线)

---

## 写在前面

### 为什么需要 TypeScript

你写 JavaScript 时大概遇到过这些事：

| 痛点         | 具体表现                 | TypeScript 的解法    |
| ---------- | -------------------- | ----------------- |
| 类型错误运行时才暴露 | `user.nmae` 拼错，上线才报错 | 编译期报错，编辑器直接标红     |
| 重构不敢动      | 改了函数签名，不知道哪里还在调用     | 全项目引用一键重命名、改完自动检查 |
| IDE 提示弱    | 只能补全对象已有的键           | 基于类型精确补全参数和字段     |
| 接口契约靠文档    | 后端字段改了，前端毫不知情        | 类型即契约，改动立即暴露不一致   |
| 大型项目协作成本高  | 每人一套约定               | 类型系统强制统一约束        |

一句话概括：**TypeScript = JavaScript + 静态类型系统**，它给 JS 加了一层「编译期检查」，但运行时仍然是纯 JavaScript。

> 注意：TypeScript 不会让程序更"安全"于逻辑错误，它只消灭一大类类型相关的低级错误。类型正确 ≠ 逻辑正确。

### 学习路径总览

```text
基础篇（第 1-11 章）
  类型是什么 → 基础类型 → 推断 → 复合类型 → 函数 → 类与模块
        ↓
高阶篇（第 12-21 章）
  泛型 → 类型运算（keyof / 映射 / 条件 / 模板字面量）→ 工具类型 → 类型体操 → 声明文件
        ↓
工程篇（第 22-26 章）
  tsconfig → 框架集成 → 构建发布 → 最佳实践
```

### 环境准备

```bash
# 1. 安装 TypeScript（建议装在项目本地，保证团队版本一致）
npm init -y
npm install -D typescript tsx @types/node

# 2. 查看版本
npx tsc --version        # 期望 5.x

# 3. 初始化配置
npx tsc --init
```

写好 `hello.ts` 后有两种运行方式：

```bash
npx tsx hello.ts          # 开发时直接跑，无需编译（推荐）
npx tsc hello.ts          # 编译生成 hello.js
node hello.js             # 再运行 JS
```

配合编辑器：VS Code 内置 TS 支持，建议开启 `editor.formatOnSave`，并按项目根目录的 `tsconfig.json` 工作。

---

# 第一部分：基础篇

## 1. 第一个 TypeScript 程序

```ts
// hello.ts
function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet("TypeScript"));
```

对比一下 JS 版本，差异只有两处：参数后的 `: string` 和函数后的 `: string`。这就是**类型注解**——它不产生任何运行时代码，只在编译期被检查。

故意写错看看效果：

```ts
// @ts-expect-error 这里故意传数字，用来观察报错
console.log(greet(123));
// Argument of type 'number' is not assignable to parameter of type 'string'.
```

`// @ts-expect-error` 是一个实用技巧：它声明"下一行应当报错"，如果下一行**没有**报错，编译器反而会报错。写文档、写测试用例时非常好用。

### tsc 的常用参数

```bash
npx tsc --noEmit          # 只检查类型，不输出文件（CI 常用）
npx tsc --watch           # 监听文件变化
npx tsc --strict          # 开启全部严格检查
npx tsc --project .       # 按 tsconfig.json 编译
```

---

## 2. 基础类型

### 类型总览

| 类型                   | 说明                         | 示例                  |
| -------------------- | -------------------------- | ------------------- |
| `string`             | 字符串                        | `"hello"`           |
| `number`             | 数字（整数、浮点、NaN、Infinity 都是它） | `42`, `3.14`        |
| `boolean`            | 布尔                         | `true`, `false`     |
| `null` / `undefined` | 空值                         | `null`, `undefined` |
| `symbol`             | 唯一标识                       | `Symbol("id")`      |
| `bigint`             | 大整数                        | `123n`              |
| `void`               | 没有返回值（常用于函数返回类型）           | `() => void`        |
| `never`              | 永远不会出现的值                   | 抛异常的函数              |
| `unknown`            | 未知类型，安全版的 `any`            | 外部输入                |
| `any`                | 任意类型，关闭类型检查                | 尽量避免                |

### 基本注解

```ts
let name: string = "Alice";
let age: number = 30;
let isActive: boolean = true;
let nothing: null = null;
let notSet: undefined = undefined;
let id: symbol = Symbol("id");
let big: bigint = 9007199254740991n;

// 数组
let tags: string[] = ["ts", "frontend"];
let scores: Array<number> = [98, 87];

// void：函数没有返回值
function log(message: string): void {
  console.log(message);
}

// never：函数永远不会有正常的返回值
function fail(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

### `unknown` 与 `any` 的关键区别

```ts
let anything: any = "hello";
anything.toUpperCase();        // ✅ 编译通过，但运行时可能是 undefined
anything.foo.bar.baz;          // ✅ 编译也通过 —— 这就是 any 的危险之处

let value: unknown = "hello";
// value.toUpperCase();        // ❌ 报错：unknown 上没有任何可用方法

// 必须先"证明"它的类型才能使用
if (typeof value === "string") {
  value.toUpperCase();         // ✅ 类型被窄化为 string
}
```

**实践准则**：外部输入（接口返回、`JSON.parse`、用户输入）先用 `unknown` 接住，再校验后使用；不要用 `any` 图省事。

### `null` 与 `undefined`

开启 `strictNullChecks` 后（强烈建议），`null` 和 `undefined` 只能赋给自身和 `unknown`/`any`：

```ts
let maybeName: string | null = "Alice";
maybeName = null;              // ✅联合类型显式允许
// maybeName = undefined;      // ❌ 报错

let optional: string | undefined = undefined; // ✅
```

### 字面量类型

```ts
let exact: "hello" = "hello";
// exact = "world";           // ❌ 报错：类型只有 "hello" 这一个值

type Direction = "up" | "down" | "left" | "right";
let dir: Direction = "up";
dir = "down";                  // ✅
// dir = "north";              // ❌
```

字面量类型本身用处有限，但它和联合类型组合后，就是建模业务状态的利器（见第 7、8 章）。

---

## 3. 类型推断与类型注解

TypeScript 会自动推断大部分类型，**能推断就别手写**。

### 自动推断的场景

```ts
let count = 0;                 // 推断为 number
const message = "hi";          // 推断为 "hi"（const 保留字面量类型）
let arr = [1, 2, 3];            // 推断为 number[]
let obj = { name: "Alice", age: 30 };  // { name: string; age: number }

function add(a: number, b: number) {
  return a + b;                // 返回类型推断为 number
}

const btn = document.querySelector("button");  // HTMLButtonElement | null
```

### 什么时候必须写注解

1. **函数参数**：没有上下文时无法推断，默认是 `any`（严格模式下报错）。
2. **期望类型比推断类型更宽**：
   ```ts
   // 推断为具体字面量联合，后续只能赋这三个值
   let method = "GET";          // string（let 推断为宽类型）
   const method2 = "GET";       // "GET"（const 推断为字面量）
   let method3: "GET" | "POST" = "GET"; // 显式定义候选集合
   ```
3. **空数组、空对象**：
   ```ts
   const items: string[] = [];        // 不写会推断为 any[]
   const config: Record<string, number> = {};
   ```
4. **递归函数**需要显式返回类型：
   ```ts
   function sum(n: number): number {
     return n <= 0 ? 0 : n + sum(n - 1);
   }
   ```

### `as const` 断言

```ts
const settings = {
  theme: "dark",
  pageSize: 20,
} as const;

// settings.theme 的类型是 "dark"，不是 string
// settings 整体是 readonly，属性不可修改
// settings.theme = "light";   // ❌ 报错

const tuple = ["GET", "/api/users"] as const;
// 类型：readonly ["GET", "/api/users"]
```

---

## 4. 数组、元组与对象

### 数组

```ts
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ["a", "b"];   // 等价写法

// 只读数组
const readonlyNumbers: readonly number[] = [1, 2, 3];
// readonlyNumbers.push(4);    // ❌ 报错：没有 push

// 二维数组
const matrix: number[][] = [[1, 2], [3, 4]];

// 联合类型数组
const mixed: (string | number)[] = ["a", 1, "b", 2];
```

|   |   |
| - | - |

> 泛型数组写法 `Array<T>` 和 `T[]` 完全等价；在复杂类型（如 `Array<string | number>`）中，泛型写法可读性更好。

### 元组（Tuple）

元组是**长度和位置类型都固定**的数组。

```ts
const person: [string, number] = ["Alice", 30];
// person = [30, "Alice"];     // ❌ 顺序错误
// person.push(true);          // ❌ 类型不匹配

// 带标签的元组（TS 4.0+，可读性更好）
type Point = [x: number, y: number];
const p: Point = [10, 20];

// 可选元素
type MaybePoint = [x: number, y?: number];

// 剩余元素
type Numbers = [first: number, ...rest: number[]];
const ns: Numbers = [1, 2, 3, 4];

// 函数参数里使用元组：一次性约束多个参数
function draw(...args: Point): void {
  const [x, y] = args;
  console.log(x, y);
}
draw(1, 2);
```

### 对象类型

```ts
const user: { name: string; age: number; email?: string } = {
  name: "Alice",
  age: 30,
};
// email 带 ? 表示可选

// 索引签名：key 是 string，value 是 number
const scores: { [key: string]: number } = {
  alice: 98,
  bob: 87,
};

// 更常见的写法
const scores2: Record<string, number> = { alice: 98, bob: 87 };
```

**多余属性检查**是 TS 的一个重要保护：

```ts
interface User {
  name: string;
  age: number;
}

function createUser(user: User): User {
  return user;
}

createUser({ name: "Alice", age: 30 });           // ✅
// createUser({ name: "Alice", age: 30, nmae: "x" }); // ❌ 拼写错误被拦截

// 绕过检查：把对象先赋给变量（此时只做结构兼容性检查）
const input = { name: "Alice", age: 30, extra: true };
createUser(input);  // ✅ 允许，因为结构兼容（多出的属性不影响）
```

---

## 5. 接口与类型别名

### 接口（interface）

```ts
interface User {
  readonly id: number;      // 只读
  name: string;
  email?: string;           // 可选
  login(): void;            // 方法
  greet(): string;
}

const user: User = {
  id: 1,
  name: "Alice",
  login() { console.log("logged in"); },
  greet() { return `Hi, ${this.name}`; },
};
```

**继承**：

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark(): void;
}

// 多继承
interface Flyable { fly(): void; }
interface Bird extends Animal, Flyable {}

const dog: Dog = { name: "Rex", bark() { console.log("woof"); } };
```

**声明合并**：同名 interface 会自动合并，这是它独有的能力。

```ts
interface Window {
  myApp: string;
}

// 可以在另一个文件里继续扩展
interface Window {
  version: number;
}

// 现在 Window 同时拥有 myApp 和 version
```

### 类型别名（type）

```ts
type ID = string | number;
type Point = { x: number; y: number };
type Callback = (value: string) => void;
type Direction = "up" | "down";
```

type 不能重复声明，但表达力更强——可以表达联合、交叉、映射、条件类型等。

### interface 与 type 怎么选

| 场景             | 推荐                         |
| -------------- | -------------------------- |
| 描述对象/类的结构      | `interface`                |
| 定义联合类型、交叉类型    | `type`                     |
| 需要声明合并（扩展第三方库） | `interface`                |
| 定义函数类型、元组、映射类型 | `type`                     |
| 不确定时           | 对象用 `interface`，其余用 `type` |

实际项目中两者经常混用，官方也承认"大多数情况下可以任选其一"，保持团队风格统一即可。

---

## 6. 函数类型

### 定义函数类型的几种方式

```ts
// 1. 普通函数
function add(a: number, b: number): number {
  return a + b;
}

// 2. 类型别名描述函数签名
type Add = (a: number, b: number) => number;
const add2: Add = (a, b) => a + b;   // 参数类型由上下文推断

// 3. 接口描述函数
interface Adder {
  (a: number, b: number): number;
}
const add3: Adder = (a, b) => a + b;

// 4. 作为对象方法
const calc = {
  add(a: number, b: number): number { return a + b; },
};
```

### 参数类型

```ts
// 可选参数：必须放在必选参数之后
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

// 默认参数：会自动推断为 number，且调用时可省略
function pow(base: number, exponent = 2): number {
  return base ** exponent;
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

// 解构参数
function createUser({ name, age }: { name: string; age: number }): void {
  console.log(name, age);
}
```

### 函数重载

当同一个函数对不同参数有不同类型返回时，用重载表达。

```ts
function format(value: number): string;
function format(value: Date): string;
function format(value: number | Date): string {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toISOString();
}

format(3.14159);        // "3.14"
format(new Date(0));    // "1970-01-01T00:00:00.000Z"
```


> 重载签名（前两行）对调用者可见，实现签名（第三行）对调用者不可见。实现签名必须兼容所有重载。

一个更贴近业务的例子：

```ts
function get(id: number): { id: number };
function get(name: string): { name: string };
function get(value: number | string) {
  return typeof value === "number" ? { id: value } : { name: value };
}

const a = get(1);       // { id: number }
const b = get("Alice"); // { name: string }
```

### `this` 参数

TS 允许在函数参数列表首位声明 `this` 的类型，它不占用实际参数位置：

```ts
interface User {
  name: string;
  greet(this: User): string;
}

const user: User = {
  name: "Alice",
  greet() { return `Hi, ${this.name}`; },
};

user.greet();   // ✅
// const detached = user.greet; detached(); // ❌ this 上下文丢失
```

---

## 7. 联合类型、交叉类型与字面量类型

### 联合类型（Union）

```ts
type ID = number | string;

function printId(id: ID): void {
  console.log(id);
}

let status: "pending" | "success" | "failed" = "pending";
```

联合类型表示"可以是其中任意一种"，使用时只能访问所有成员**共有**的属性：

```ts
function print(value: string | number) {
  // console.log(value.length);  // ❌ number 没有 length
  console.log(value.toString()); // ✅ 两者都有
}
```

### 交叉类型（Intersection）

```ts
type Timestamped = { createdAt: Date; updatedAt: Date };
type WithId = { id: number };

type Entity = Timestamped & WithId;

const entity: Entity = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

交叉类型常用于**混入（mixin）**&#x573A;景。注意它和接口继承语义相近但不完全一样：同名属性类型冲突时，`&` 会产生 `never`。

### 判别联合（Discriminated Union）

这是 TS 中最重要的建模模式之一：用一个字面量字段作为"判别标签"。

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;   // TS 知道这里一定是 circle
    case "square":
      return shape.side ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}
```

配合穷尽性检查（第 8 章）可以做到：以后新增一种形状而忘了处理，编译直接报错。

---

## 8. 类型窄化

**窄化（Narrowing）**：把宽类型在某个分支中缩小为更具体的类型。

### `typeof`

```ts
function double(value: number | string): number | string {
  if (typeof value === "number") {
    return value * 2;        // number
  }
  return value + value;      // string
}
```

### 真值判断

```ts
function printName(name?: string) {
  if (name) {
    console.log(name.toUpperCase());  // string
  } else {
    console.log("anonymous");
  }
}
```

注意 `0`、`""`、`false`、`NaN` 都是假值，窄化时要小心业务语义。

### `instanceof`

```ts
function formatDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();   // Date
  }
  return value;                   // string
}
```

### `in` 操作符

```ts
type Cat = { meow(): void };
type Dog = { bark(): void };

function speak(pet: Cat | Dog) {
  if ("meow" in pet) {
    pet.meow();
  } else {
    pet.bark();
  }
}
```

### 判别标签 + 穷尽性检查

```ts
type Result =
  | { ok: true; data: string }
  | { ok: false; error: Error };

function handle(result: Result): void {
  if (result.ok) {
    console.log(result.data.toUpperCase());
  } else {
    console.log(result.error.message);
  }
}

// 穷尽性检查：所有分支处理完后，value 会变成 never
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 如果此时往 Shape 里加上 { kind: "triangle" } 而没改 switch，
// _exhaustive 那一行就会报错 —— 这就是编译期的"漏处理提醒"。
```

### 自定义类型谓词（type predicate）

```ts
interface Cat { meow(): void }
interface Dog { bark(): void }

function isCat(pet: Cat | Dog): pet is Cat {
  return "meow" in pet;
}

const pet: Cat | Dog = { meow() {} };
if (isCat(pet)) {
  pet.meow();   //  narrowed to Cat
}
```

### 断言函数（asserts）

```ts
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

function process(value: unknown) {
  assert(typeof value === "string", "value must be a string");
  value.toUpperCase();   // ✅ 之后 value 被窄化为 string
}
```

---

## 9. 类

### 基本用法与参数属性

```ts
class Animal {
  // 参数属性：public/private/protected/readonly + 参数名 = 自动声明并赋值
  constructor(
    public name: string,
    private age: number = 0,
  ) {}

  protected makeSound(): void {
    console.log(`${this.name} makes a sound`);
  }

  get description(): string {
    return `${this.name}, ${this.age} years old`;
  }
}

class Dog extends Animal {
  constructor(name: string, private breed: string) {
    super(name, 3);
  }

  bark(): void {
    this.makeSound();   // protected 成员子类可访问
    console.log("woof");
  }
}

const dog = new Dog("Rex", "Labrador");
dog.name;        // ✅ public
dog.bark();      // ✅
// dog.age;      // ❌ private
```

### 访问修饰符

| 修饰符         | 类内部 | 子类 | 外部 |
| ----------- | --- | -- | -- |
| `public`    | ✅   | ✅  | ✅  |
| `protected` | ✅   | ✅  | ❌  |
| `private`   | ✅   | ❌  | ❌  |

> `private` 是 TS 编译期的约束，运行时仍是普通属性。如果需要真正的私有，用 ECMAScript 的 `#field`。

### 抽象类与 implements

```ts
abstract class Repository<T> {
  abstract findById(id: number): T | undefined;
  abstract save(entity: T): void;

  // 抽象类可以有具体实现
  log(msg: string): void {
    console.log(`[Repository] ${msg}`);
  }
}

interface Serializable {
  serialize(): string;
}

class UserRepository extends Repository<{ id: number; name: string }> implements Serializable {
  private items = new Map<number, { id: number; name: string }>();

  findById(id: number) {
    return this.items.get(id);
  }

  save(entity: { id: number; name: string }) {
    this.items.set(entity.id, entity);
  }

  serialize(): string {
    return JSON.stringify([...this.items.values()]);
  }
}
```

### `override` 关键字

TS 4.3+ 支持 `override`，开启 `noImplicitOverride` 后强制标注，避免"以为重写了其实没重写"：

```ts
class Base {
  greet(): string { return "hello"; }
}

class Child extends Base {
  override greet(): string { return "hi"; }
  // greet(): string { ... }  // ❌ noImplicitOverride 下报错
}
```

---

## 10. 枚举

### 数字枚举

```ts
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

const dir = Direction.Up;   // Direction.Up
Direction[0];               // "Up"（反向映射，数字枚举特有）
```

### 字符串枚举

```ts
enum HttpMethod {
  GET = "GET",
  POST = "POST",
}

function request(method: HttpMethod): void {
  console.log(method);
}

request(HttpMethod.GET);
// request("GET");         // ❌ 字符串枚举不接受裸字符串
```

### 常量枚举

```ts
const enum Color {
  Red = "red",
  Blue = "blue",
}

const c = Color.Red;   // 编译后被内联为 "red"，不产生运行时对象
```

> 注意：`isolatedModules` 或某些打包器下 `const enum` 有兼容问题，库作者通常避免使用。

### 推荐：用 `as const` 对象替代枚举

```ts
const Direction = {
  Up: "UP",
  Down: "DOWN",
} as const;

type Direction = (typeof Direction)[keyof typeof Direction];  // "UP" | "DOWN"

const dir: Direction = Direction.Up;
// const bad: Direction = "LEFT";  // ❌

// 好处：无额外运行时代码、可被 tree-shaking、类型即值
```

这已成为现代 TS 工程的主流做法，尤其是前端项目。

---

## 11. 模块

### 导出与导入

```ts
// math.ts
export const PI = 3.14159;
export function add(a: number, b: number): number { return a + b; }
export default class Calculator {}

// main.ts
import Calculator, { PI, add } from "./math";
import { add as plus } from "./math";
import * as MathUtils from "./math";

// 仅类型导入（编译后完全消失，避免循环依赖）
import type { User } from "./types";
```

### `export =` 与兼容 CommonJS

```ts
// legacy.ts
export = function greet(name: string) { return `Hi ${name}`; };

// 消费方式
import greet = require("./legacy");
```

现代项目建议统一用 ES Module 语法，并配置 `"module": "ESNext"`。

### 类型与值的命名空间

TypeScript 中类型和值在不同的命名空间，同名可以同时存在：

```ts
class Foo {}

type Foo = { id: number };   // ✅ 不冲突

const x: Foo = { id: 1 };
const y = new Foo();
```

---

## 基础篇练习

1. 定义一个 `Product` 接口，包含只读 `id`、必填 `name`、可选 `description`，并写一个函数根据价格返回不同折扣文案。
2. 用判别联合建模「订单状态」：`draft / paid / shipped / cancelled`，每个状态带不同字段，写一个函数穷尽处理所有状态。
3. 写一个类型谓词 `isStringArray(value: unknown): value is string[]`，并实际使用。
4. 把下面的 JS 改造成 TS，并让 `getConfig` 的返回值有精确类型：
   ```js
   const defaults = { host: "localhost", port: 8080, ssl: false };
   function getConfig(overrides) { return { ...defaults, ...overrides }; }
   ```

---

# 第二部分：高阶篇

## 12. 泛型

泛型是 TypeScript 最核心的高阶能力：**把类型作为参数传进去**，从而让一份代码适配多种类型，同时保留类型信息。

### 从问题出发

不用泛型，只能退化成 `any`，类型信息丢失：

```ts
function identity(value: any): any {
  return value;
}

const result = identity("hello");
// result 是 any，无法获得字符串的方法提示
```

用泛型：

```ts
function identity<T>(value: T): T {
  return value;
}

const a = identity<string>("hello");  // 显式指定，类型为 string
const b = identity(123);              // 推断为字面量类型 123
const c = identity({ name: "Alice" });// 推断为 { name: string }
b.toFixed(2);                         // ✅ 类型信息被保留
```

### 泛型约束

```ts
// 要求 T 必须有 length 属性
function loggingIdentity<T extends { length: number }>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity("hello");       // ✅
loggingIdentity([1, 2, 3]);     // ✅
// loggingIdentity(123);        // ❌ number 没有 length
```

用 `keyof` 约束键名（非常常见的模式）：

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
const name = getProperty(user, "name");  // string
const age = getProperty(user, "age");    // number
// getProperty(user, "email");           // ❌ 报错
```

### 泛型默认值

```ts
interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

type UserResponse = ApiResponse<{ id: number; name: string }>;
type EmptyResponse = ApiResponse;   // data 为 unknown
```

### 泛型类型、接口与类

```ts
type Box<T> = { value: T };

interface Container<T> {
  item: T;
  add(item: T): void;
}

class Stack<T> {
  private items: T[] = [];

  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}

const stack = new Stack<number>();
stack.push(1);
// stack.push("1");   // ❌
```

### 多个泛型参数与参数间约束

```ts
function assign<T extends U, U>(target: T, source: U): T {
  return Object.assign(target, source);
}

function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

const merged = merge({ name: "Alice" }, { age: 30 });
// { name: string } & { age: number }
```

### 泛型实践建议

- 用**最少的**泛型参数，能用具体类型就别用泛型。
- 泛型参数命名要有意义：`T` 用于通用类型，`K` 键，`V` 值，`E` 元素，`R` 返回值。
- 警惕 "泛型 = any" 的退化：如果函数体内对所有 `T` 的操作都一样，说明可能不需要泛型。


## 14. keyof、typeof 与索引访问类型

这三个操作符是类型体操的基石。

### `keyof`

取得对象类型的所有键，组成联合类型：

```ts
type Person = { name: string; age: number; active: boolean };
type PersonKeys = keyof Person;   // "name" | "age" | "active"

// 对原始类型也能用
type StringKeys = keyof string;   // 包含 "length" | "toString" | ...
```

### `typeof`

在**类型位置**使用 `typeof`，取得变量的类型：

```ts
const config = {
  host: "localhost",
  port: 8080,
};

type Config = typeof config;
// { host: string; port: number }

const config2 = { host: "localhost", port: 8080 } as const;
type Config2 = typeof config2;
// { readonly host: "localhost"; readonly port: 8080 }
```

### 索引访问类型（Indexed Access Types）

```ts
type Person = {
  name: string;
  age: number;
  address: { city: string };
};

type Name = Person["name"];              // string
type AgeOrName = Person["age" | "name"]; // number | string
type Address = Person["address"];        // { city: string }
type City = Person["address"]["city"];   // string

// 用 keyof 动态取所有值的联合
type PersonValues = Person[keyof Person]; // string | number | { city: string }
```

### 组合技：从数据推导类型

```ts
const routes = {
  home: "/",
  users: "/users",
  profile: "/users/:id",
} as const;

type RouteName = keyof typeof routes;    // "home" | "users" | "profile"
type RoutePath = (typeof routes)[RouteName]; // "/" | "/users" | "/users/:id"

function navigate(route: RouteName): void {
  console.log(routes[route]);
}
navigate("users");
// navigate("unknown");  // ❌
```

这个模式让「数据源」成为唯一事实来源，新增路由时类型自动更新。

---

## 15. 映射类型

映射类型（Mapped Types）让你**基于一个类型的每个键生成新类型**，是内置工具类型的实现基础。

### 基本语法

```ts
type Copy<T> = {
  [K in keyof T]: T[K];
};

type User = { name: string; age: number };
type UserCopy = Copy<User>;   // { name: string; age: number }
```

`[K in keyof T]` 遍历 `T` 的每个键，`T[K]` 取原类型对应值。

### 修改修饰符

```ts
// 全部可选
type Partial2<T> = {
  [K in keyof T]?: T[K];
};

// 全部只读
type Readonly2<T> = {
  readonly [K in keyof T]: T[K];
};

// 移除可选性（用 -?）
type Required2<T> = {
  [K in keyof T]-?: T[K];
};

// 移除只读（用 -readonly）
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
```

### 挑选键的子集

```ts
type Pick2<T, K extends keyof T> = {
  [P in K]: T[P];
};

type User = { id: number; name: string; email: string };
type BasicUser = Pick2<User, "id" | "name">;  // { id: number; name: string }
```

### 键重映射（`as` 子句，TS 4.1+）

```ts
// 给所有键加 get 前缀并首字母大写
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type User = { name: string; age: number };
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
```

过滤键（映射为 `never` 即移除）：

```ts
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type Mixed = { name: string; age: number; email: string };
type Strings = OnlyStrings<Mixed>;  // { name: string; email: string }
```

### 成套变换

```ts
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type Stringify<T> = {
  [K in keyof T]: string;
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

---

## 16. 条件类型与 infer

### 条件类型基础

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<number>;   // false
type C = IsString<string | number>;  // boolean（分发特性，见下）
```

### 分发特性（Distributive Conditional Types）

当条件类型左侧是**裸类型参数**时，联合类型会被逐个分发：

```ts
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>;
// string[] | number[]，而不是 (string | number)[]
```

关闭分发：把类型参数包成元组：

```ts
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type Result2 = ToArrayNonDist<string | number>;
// (string | number)[]
```

这个技巧在写 `IsNever` 等工具类型时特别重要：

```ts
type IsNever<T> = [T] extends [never] ? true : false;
// 直接 T extends never 对 never 会得到 never，而不是 true
```

### `infer`：在类型中"声明变量"

`infer` 只能在条件类型的 `extends` 子句中使用，用于**提取**类型的一部分。

```ts
// 提取数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : T;

type A = ElementType<string[]>;   // string
type B = ElementType<number[]>;   // number
type C = ElementType<boolean>;    // boolean

// 提取函数返回值
type MyReturnType<T extends (...args: any[]) => any> =
  T extends (...args: any[]) => infer R ? R : never;

type D = MyReturnType<(x: number) => string>;  // string

// 提取 Promise 内部类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type E = UnwrapPromise<Promise<number>>;       // number
```

### 多个 infer 候选

```ts
type First<T> = T extends [infer F, ...any[]] ? F : never;
type Last<T> = T extends [...any[], infer L] ? L : never;

type T1 = First<[1, 2, 3]>;  // 1
type T2 = Last<[1, 2, 3]>;   // 3
```

### `infer ... extends`（TS 4.7+）

可以在 `infer` 上直接加约束，匹配成功时把结果转成该约束类型：

```ts
type FirstDigit<S extends string> =
  S extends `${infer D extends number}${string}` ? D : never;

type A = FirstDigit<"7abc">;   // 7（number 类型的字面量）
type B = FirstDigit<"42abc">;  // 4 —— 该写法只捕获开头的第一个数字字符
```

### 条件类型实战：判断联合成员

```ts
type Includes<T extends readonly unknown[], U> =
  T extends readonly [infer First, ...infer Rest]
    ? First extends U ? true : Includes<Rest, U>
    : false;

type R1 = Includes<["a", "b", "c"], "b">;  // true
type R2 = Includes<["a", "b"], "z">;       // false
```

---

## 17. 模板字面量类型

TS 4.1 引入，可以在类型层面操作字符串。

### 基础用法

```ts
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">;   // "onClick"
type HoverEvent = EventName<"hover">;   // "onHover"
```

### 内置的四个字符串类型工具

```ts
type Upper = Uppercase<"hello">;      // "HELLO"
type Lower = Lowercase<"HELLO">;      // "hello"
type Cap = Capitalize<"hello">;       // "Hello"
type Uncap = Uncapitalize<"Hello">;   // "hello"
```

### 字符串模式匹配

```ts
type GetPrefix<S extends string> =
  S extends `${infer Prefix}.${string}` ? Prefix : never;

type P = GetPrefix<"user.controller.ts">;  // "user"

type GetParam<S extends string> =
  S extends `${string}/:${infer Param}` ? Param : never;

type Id = GetParam<"/users/:id">;  // "id"
```

### 递归处理字符串

```ts
type Split<S extends string, Sep extends string> =
  S extends `${infer Head}${Sep}${infer Tail}`
    ? [Head, ...Split<Tail, Sep>]
    : [S];

type Parts = Split<"a,b,c", ",">;  // ["a", "b", "c"]

type TrimLeft<S extends string> =
  S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;

type Trimmed = TrimLeft<"   hello">;  // "hello"
```

### 生成联合类型

```ts
type Locale = "en" | "zh";
type Page = "home" | "about";
type Route = `/${Locale}/${Page}`;
// "/en/home" | "/en/about" | "/zh/home" | "/zh/about"

type Version = `v${1 | 2 | 3}.${0 | 1}`;
// "v1.0" | "v1.1" | "v2.0" | "v2.1" | "v3.0" | "v3.1"
```

> 注意：模板字面量展开成联合时会产生笛卡尔积，成员过多会拖慢编译甚至触发 TS 的递归深度限制（约 1000 层）。控制组合规模。

---

## 18. 内置工具类型原理剖析

理解源码比死记用法有效得多。以下实现来自 TypeScript 官方 `lib.es5.d.ts`（简化整理）。

### 修改属性修饰器

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

```ts
interface User { id: number; name: string }

type P = Partial<User>;       // { id?: number; name?: string }
type R = Readonly<User>;      // { readonly id: number; readonly name: string }
```

### 挑选与剔除

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

|                                            |        |                        |
| ------------------------------------------ | ------ | ---------------------- |
| 注意 `Omit` 的 `K` 约束是 `keyof any`（即 \`string | number | symbol\`），因此允许传入不存在的键。 |

### 联合类型操作

```ts
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T extends null | undefined ? never : T;

type A = Exclude<"a" | "b" | "c", "a">;        // "b" | "c"
type B = Extract<string | number, number>;      // number
type C = NonNullable<string | null | undefined>; // string
```

### 函数相关

```ts
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;

type Awaited<T> =
  T extends null | undefined ? T :
  T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
    ? F extends (value: infer V, ...args: infer _) => any ? Awaited<V> : never
    : T;
```


```ts
type Fn = (id: number, name: string) => boolean;

type Args = Parameters<Fn>;       // [number, string]
type Ret = ReturnType<Fn>;        // boolean

class User { constructor(public id: number) {} }
type CArgs = ConstructorParameters<typeof User>;  // [id: number]
type Inst = InstanceType<typeof User>;            // User

type Unwrapped = Awaited<Promise<Promise<string>>>;  // string
```

### 对象映射

```ts
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type Roles = Record<"admin" | "user" | "guest", number>;
// { admin: number; user: number; guest: number }
```

### 速查表

| 工具类型                                                      | 作用                |
| --------------------------------------------------------- | ----------------- |
| `Partial<T>`                                              | 所有属性变可选           |
| `Required<T>`                                             | 所有属性变必填           |
| `Readonly<T>`                                             | 所有属性变只读           |
| `Pick<T, K>`                                              | 挑出指定键             |
| `Omit<T, K>`                                              | 剔除指定键             |
| `Exclude<T, U>`                                           | 从联合中排除            |
| `Extract<T, U>`                                           | 从联合中提取            |
| `NonNullable<T>`                                          | 去掉 null/undefined |
| `Parameters<T>`                                           | 取函数参数元组           |
| `ReturnType<T>`                                           | 取函数返回值            |
| `ConstructorParameters<T>`                                | 取构造函数参数           |
| `InstanceType<T>`                                         | 取构造函数的实例类型        |
| `Awaited<T>`                                              | 递归解包 Promise      |
| `Record<K, T>`                                            | 构造键值映射对象          |
| `ThisParameterType<T>` / `OmitThisParameter<T>`           | 处理 `this` 参数      |
| `Uppercase` / `Lowercase` / `Capitalize` / `Uncapitalize` | 字符串大小写变换          |

---

## 19. 类型体操实战

"类型体操"指在类型层面做编程。它不是日常必需，但掌握后能读懂高级库源码、设计强类型 API。

### 练习 1：手写 MyPick / MyOmit

```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type MyOmit<T, K extends keyof any> = {
  [P in Exclude<keyof T, K>]: T[P];
};

type User = { id: number; name: string; email: string };
type A = MyPick<User, "id" | "name">;  // { id: number; name: string }
type B = MyOmit<User, "email">;        // { id: number; name: string }
```

### 练习 2：DeepPartial

递归地把所有层级的属性变可选：

```ts
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type Config = {
  server: { host: string; port: number };
  features: { auth: boolean };
};

type PartialConfig = DeepPartial<Config>;
// { server?: { host?: string; port?: number }; features?: { auth?: boolean } }
```

> 注意：数组、Date、函数等也是 `object`，上面的简单实现会把它们错误递归。生产版本需要加特判。

### 练习 3：元组转联合

```ts
type TupleToUnion<T extends readonly unknown[]> = T[number];

type Arr = ["a", "b", "c"];
type U = TupleToUnion<Arr>;  // "a" | "b" | "c"
```

### 练习 4：扁平化数组

```ts
type Flatten<T> = T extends readonly (infer U)[] ? U : T;

type A = Flatten<string[]>;         // string
type B = Flatten<string[][]>;       // string[]（只扁平一层）

// 递归版本
type DeepFlatten<T> = T extends readonly (infer U)[] ? DeepFlatten<U> : T;
type C = DeepFlatten<string[][][]>;  // string
```

### 练习 5：链式调用类型

实现 `chain().a().b().c().value` 并返回累积对象：

```ts
type Chainable<T = {}> = {
  option<K extends string, V>(
    key: K,
    value: V,
  ): Chainable<T & { [P in K]: V }>;
  get(): T;
};

declare const chain: () => Chainable;

const result = chain()
  .option("name", "Alice")
  .option("age", 30)
  .get();
// result: { name: string } & { age: number }
```

### 练习 6：手写 Awaited（简化版）

```ts
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type A = MyAwaited<Promise<string>>;              // string
type B = MyAwaited<Promise<Promise<number>>>;     // number
```

### 类型体操的学习方法

1. 先写**类型测试**，用 `@ts-expect-error` 和赋值断言验证结果。
2. 从「能不能编译通过」入手，再追求「推断结果精确」。
3. 不要在生产代码里过度使用——可读性比炫技重要。
4. 推荐练习平台：type-challenges（GitHub）。

类型测试示例：

```ts
type Expect<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

type Test1 = Expect<Equal<MyPick<User, "id">, { id: number }>>;
```

---

## 20. 结构化类型与型变

### 结构化类型（Duck Typing）

TS 是结构化类型系统：**只要结构满足，就认为类型兼容**，不需要显式继承。

```ts
interface Point { x: number; y: number }

function distance(p: Point): number {
  return Math.sqrt(p.x ** 2 + p.y ** 2);
}

const obj = { x: 3, y: 4, label: "A" };
distance(obj);   // ✅ 多了 label 也没关系
```

这是它与 Java/C# 名义类型系统的根本区别。

### 协变与逆变

```ts
interface Animal { name: string }
interface Dog extends Animal { bark(): void }

// 协变（Covariance）：子类型 → 父类型，安全
let animal: Animal = { name: "generic" };
let dog: Dog = { name: "Rex", bark() {} };
animal = dog;        // ✅

// 逆变（Contravariance）：函数参数方向相反
type Handler<T> = (value: T) => void;

let handleAnimal: Handler<Animal> = (a) => console.log(a.name);
let handleDog: Handler<Dog> = (d) => d.bark();

// strictFunctionTypes 开启后：
handleDog = handleAnimal;   // ✅ 处理 Animal 的函数能处理 Dog（参数更宽是安全的）
// handleAnimal = handleDog; // ❌ 处理 Dog 的函数不能保证处理所有 Animal
```

**记忆口诀**：返回值位置协变（可以返回更具体的），参数位置逆变（可以接受更宽泛的）。

### `strictFunctionTypes`

这个编译选项让函数参数检查从"双向协变"变成严格的"逆变"。方法声明（对象方法语法）是例外，仍是双向协变的——这是为了兼容 JS 生态的常见写法。

### 弱类型检测

如果目标类型**所有属性都是可选的**，而源类型没有任何重合属性，会报错：

```ts
type Options = { a?: string; b?: number };

// const o: Options = { c: true };  // ❌ 没有共同属性
const o2: Options = { a: "x" };     // ✅
```

---

## 21. 声明文件与模块增强

### 什么是 `.d.ts`

`.d.ts` 文件只描述类型，不含实现。它让 TypeScript 理解没有类型的 JavaScript 库。

```ts
// types/legacy-lib.d.ts
declare module "legacy-lib" {
  export function formatDate(date: Date, pattern: string): string;
  export const version: string;
}
```

### 常见声明语法

```ts
declare const process: {
  env: Record<string, string | undefined>;
};

declare function require(path: string): any;

declare class EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
}

declare global {
  interface Window {
    __APP_VERSION__: string;
  }
}

export {};   // 有 export 时是模块，declare global 才生效
```

### 使用 DefinitelyTyped

大量库的类型由社区维护：

```bash
npm install -D @types/lodash @types/node @types/react
```

查一个库有没有类型包：npm 上搜 `@types/<包名>`。TS 5.x 中，很多库已内置类型（看 `package.json` 的 `types` 字段）。

### 模块增强（Module Augmentation）

给第三方库补充字段：

```ts
// augment-express.d.ts
import "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;   // 登录后挂载的用户 ID
  }
}

export {};
```

之后在所有文件里 `req.userId` 都有类型了。

### 编写库时的声明文件

```json
{
  "name": "my-lib",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs"
    }
  }
}
```

配合 `tsconfig.json` 中的 `"declaration": true`，编译 JS 时自动生成 `.d.ts`。

---

## 高阶篇练习

1. 实现 `MyExclude<T, U>`，不使用内置 `Exclude`。
2. 实现 `TupleToObject<T extends readonly string[]>`，把 `["a", "b"]` 变成 `{ a: "a"; b: "b" }`。
3. 实现 `Trim<S>`，去掉字符串两端的空格（用模板字面量类型递归）。
4. 用 `satisfies` 重构一个配置对象，让它既符合接口约束，又保留每个字段的字面量类型。
5. 写一个泛型函数 `deepFreeze<T>(obj: T): DeepReadonly<T>`，类型为递归只读。
6. 给 `window` 扩展一个自定义属性，并在组件中安全使用。

---

# 第三部分：工程篇

## 22. tsconfig 完全解析

### 推荐基础配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### 关键选项说明

| 选项                           | 作用                              | 建议                                             |
| ---------------------------- | ------------------------------- | ---------------------------------------------- |
| `target`                     | 输出 JS 的语法版本                     | 现代项目 `ES2022`                                  |
| `lib`                        | 可用的类型库                          | 按需加 `DOM`、`ES2023`                             |
| `module`                     | 模块格式                            | 打包器用 `ESNext`，Node CJS 用 `CommonJS`            |
| `moduleResolution`           | 模块解析策略                          | Vite/webpack 用 `Bundler`，Node ESM 用 `NodeNext` |
| `strict`                     | 严格模式总开关                         | **必须 true**                                    |
| `noImplicitAny`              | 禁止隐式 any                        | strict 已包含                                     |
| `strictNullChecks`           | null/undefined 严格检查             | strict 已包含                                     |
| `noUncheckedIndexedAccess`   | 索引访问结果含 undefined               | 建议开启                                           |
| `exactOptionalPropertyTypes` | 区分 `?: T` 与 `?: T \| undefined` | 视团队情况                                          |
| `esModuleInterop`            | CJS/ESM 互操作                     | true                                           |
| `skipLibCheck`               | 跳过 `.d.ts` 检查                   | 大型项目必开，提速明显                                    |
| `verbatimModuleSyntax`       | 严格按写的输出 import/export           | 新项目推荐                                          |
| `paths`                      | 路径别名                            | 需同步配置打包器                                       |

### `strict` 包含哪些

```json
{
  "strictNullChecks": true,
  "noImplicitAny": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "useUnknownInCatchVariables": true,
  "alwaysStrict": true
}
```

> 新项目直接 `"strict": true`，不要一项项开。老项目迁移时可先关掉 strict，逐项开启。

### 多项目与项目引用

大型 monorepo 用 `references` 拆分：

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ]
}
```

子项目需设置 `"composite": true`，然后 `npx tsc --build` 会按依赖顺序增量编译。

---

## 23. 与 React / Vue 集成

### React

```tsx
import { useState, type ReactNode } from "react";

// 组件 Props
interface UserCardProps {
  user: { id: number; name: string };
  onClick?: (id: number) => void;
  children?: ReactNode;
}

function UserCard({ user, onClick, children }: UserCardProps) {
  return (
    <div onClick={() => onClick?.(user.id)}>
      {user.name}
      {children}
    </div>
  );
}

// 泛型组件
function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  return <>{items.map((item, i) => <div key={i}>{render(item)}</div>)}</>;
}

// Hooks 泛型
const [users, setUsers] = useState<User[]>([]);
const ref = useRef<HTMLInputElement>(null);
```

配置要点：

```json
{
  "jsx": "react-jsx",
  "lib": ["ES2022", "DOM", "DOM.Iterable"]
}
```

事件类型从 React 导入：

```tsx
import type { ChangeEvent, MouseEvent } from "react";

function handleChange(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value);
}
```

### Vue 3

```vue
<script setup lang="ts">
interface User {
  id: number;
  name: string;
}

// defineProps 泛型（Vue 3.3+）
const props = defineProps<{
  users: User[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  select: [id: number];
}>();

const count = ref<number>(0);
const user = ref<User | null>(null);

function onSelect(id: number) {
  emit("select", id);
}
</script>
```

类型检查用 `vue-tsc` 代替 `tsc`：

```bash
npm install -D vue-tsc
npx vue-tsc --noEmit
```

通用建议：不要把 `any` 泄漏到组件 props；用 `satisfies` 校验配置常量；事件 payload 用判别联合建模。

---

## 24. 构建与发布

### tsc 直接输出

```bash
npx tsc --declaration --declarationMap --sourceMap --outDir dist
```

生成：

```text
dist/
  index.js
  index.js.map
  index.d.ts
  index.d.ts.map
```

### 库发布清单

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"]
}
```


发布前用 `arethetypeswrong.github.io` 检查类型入口是否正确解析。

### 常用工具

| 工具                 | 用途            |
| ------------------ | ------------- |
| `tsc`              | 类型检查、声明文件生成   |
| `tsx` / `ts-node`  | 直接运行 TS       |
| `esbuild` / `swc`  | 快速转译（不做类型检查）  |
| `tsup` / `unbuild` | 库打包，自动产出 d.ts |
| `vite`             | 应用打包          |
| `dtslint` / `tsd`  | 声明文件测试        |

> 关键认知：**esbuild/swc 只转译不检查类型**。CI 里必须单独跑 `tsc --noEmit`。

---

## 25. 最佳实践与常见陷阱

### 该做的

1. **开启 strict**，这是收益最高的一步。
2. **公共 API 显式写返回类型**，方便重构和生成文档。
3. **用 `unknown` 代替 `any`** 处理外部数据。
4. **用判别联合建模业务状态**，而不是一堆可选字段。
5. **用 `satisfies` 校验配置**，保留精确推断。
6. **类型从数据推导**：`typeof` + `as const` + `keyof` 减少重复维护。
7. **类型测试**：用 `@ts-expect-error` 固化错误用例。

### 不该做的

```ts
// ❌ 1. 非空断言滥用
const el = document.querySelector("#app")!;  // 可能为 null

// ❌ 2. 双重断言绕过检查
const user = {} as unknown as User;  // 等于关掉了类型系统

// ❌ 3. 用 enum 当普通常量对象
// 考虑 as const 对象，无运行时开销

// ❌ 4. 类型过度抽象
type DeeplyNestedGeneric<T extends Foo<Bar<Baz>>> = ...;
// 如果团队读不懂，类型就失去了沟通价值

// ❌ 5. 用 // @ts-ignore 掩盖问题
// @ts-ignore
someBrokenCall();
// 改用 @ts-expect-error 并写下原因
```

### 性能优化

- 开启 `skipLibCheck` 跳过第三方声明检查。
- 大项目用 `incremental: true` 或项目引用。
- 避免过深的递归类型和巨大的字面量联合。
- 用 `import type` 明确类型导入，减少运行时依赖图。

### 关于 `type` vs `interface` 的最终建议

不必纠结。一个实用规则：**库/公共 API 用 interface（可扩展），内部数据形状用 type（表达力更强）**。团队统一比"正确"更重要。

---

## 26. 后续学习路线

### 练习资源

- **type-challenges**：从简单到地狱级类型体操题，GitHub 免费。
- **typescript-eslint**：类型感知的 lint 规则，提升代码质量。
- **TS 官方 Handbook**：最权威的参考，本文档的很多概念可追溯到它。

### 推荐阅读顺序

1. 官方 Handbook 的 "Everyday Types" 与 "Narrowing" —— 巩固基础。
2. "Generics" 与 "Utility Types" —— 理解泛型生态。
3. "Advanced Types" / "Type Manipulation" —— 系统学类型运算。
4. 读几个开源库源码的 `.d.ts`（如 lodash、react-redux）—— 看真实工程怎么写类型。
5. type-challenges 中等难度题 —— 刻意练习。

### 一个实践项目建议

把一个现有的 JavaScript 小项目逐步迁移到 TypeScript：

1. 加 `tsconfig.json`，先设 `allowJs: true, checkJs: false`。
2. 一个个文件改成 `.ts`，先解决 `noImplicitAny` 报错。
3. 开启 `strict`，逐项消灭报错。
4. 给公共函数补上精确的返回类型与泛型。
5. 用 `declaration: true` 产出 `.d.ts`，验证 API 类型是否好用。

这是把"知道 TS"变成"会用 TS"最短的路径。

---

## 附录：概念速查

```text
类型注解      : string          告诉编译器这个值是什么类型
类型推断      : let x = 1        编译器自己算出来
联合类型      : A | B            二选一
交叉类型      : A & B            两者合并
类型别名      : type X = ...     给类型起名字
接口          : interface X {}   描述对象结构，可声明合并
泛型          : function f<T>    类型参数化
keyof         : keyof T          取键的联合
typeof        : typeof x         取变量的类型
索引访问      : T[K]             取属性类型
映射类型      : { [K in keyof T]: ... }  遍历键生成新类型
条件类型      : T extends U ? A : B      类型层面的 if
infer         : T extends (infer R)[]    在类型中提取片段
类型谓词      : x is T           自定义窄化规则
satisfies     : x satisfies T    校验但保留精确推断
as const      : 保留字面量、变只读
declare       : 声明已存在的值/模块，不产生代码
```



---
