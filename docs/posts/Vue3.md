---
title: Vue3
date: 2022-07-28
categories: [前端]
tags: [Vue3, Composition API, Pinia, Vite]
description: Vue3 框架学习笔记，涵盖组合式 API、Vue Router 4、Pinia、Vite 及与 Vue2 的差异。
coverImg: /images/cover-1.svg
permalink: /posts/vue3
---

# Vue3 系统学习文档

> 从入门到实战：Composition API + Vue Router 4 + Pinia + Vite + 与 Vue2 的完整差异对照
>
> 适用版本：Vue 3.5.46 / Vue Router 4.6.5 / Pinia 4.1.0 / Vite 8.3.8
>
> 本地验证：Node 22.22.2 / npm 10.9.7，生产构建通过，Vitest 组件测试 1/1 通过；`<script setup>`、Teleport、Suspense、Pinia、路由守卫均已实际编译

---

## 写在前面

### Vue3 的定位

Vue3 是 Vue 的当前主线版本，核心变化包括：

- **响应式系统重写**：`Object.defineProperty` → `Proxy`
- **组合式 API**：`setup()` / `<script setup>` + 组合式函数，解决大型组件逻辑复用问题
- **更好的 TypeScript 支持**
- **更小的包体积**：全局 API 改为按需引入，支持 Tree-shaking
- **更快的渲染**：静态提升、补丁标记、更高效的 diff 算法
- **新内置组件**：`Teleport`、`Suspense`

### 版本说明

| 工具 | 本文使用版本 | 说明 |
|------|--------------|------|
| Vue | 3.5.46 | 当前稳定版 |
| Vue Router | 4.6.5 | Vue3 生态最通用版本 |
| Pinia | 4.1.0 | 官方状态管理库，Vuex 的继任者 |
| Vite | 8.3.8 | 官方推荐构建工具 |
| @vitejs/plugin-vue | 6.0.11 | SFC 编译插件 |

> npm 上 `vue-router` 最新主版本已到 5.x（验证时为 5.5.1），要求 Vue 3.5.34+ 并引入数据加载器等新能力。本文以绝大多数生产项目使用的 **Router 4** 为主线讲解；新项目若依赖足够新，可按官方迁移指南升级到 5.x。

### 学习路线

```
差异篇：Vue2 → Vue3 全量对照 + 迁移清单
基础篇：Vite → 响应式(ref/reactive/computed/watch) → 组件 → 生命周期
进阶篇：Composable → 组件通信 → Teleport/Suspense → Router 4 → Pinia
高阶篇：响应式原理 → 编译优化 → TS → 测试 → SSR → 性能优化
```

---

# 第一部分：与 Vue2 的区别（重点章节）

## 1. 一句话总览

> Vue3 不是 Vue2 的简单升级，而是**响应式内核 + 组件编写范式 + 工具链**的整体重构。Options API 仍然可用，但组合式 API 是处理复杂逻辑的推荐方式。

## 2. 核心差异对照表

| 维度 | Vue2 | Vue3 |
|------|------|------|
| 创建应用 | `new Vue({ ... }).$mount()` | `createApp(App).mount()` |
| 全局配置 | `Vue.config.xxx` | `app.config.xxx` |
| 注册插件 | `Vue.use(plugin)` | `app.use(plugin)` |
| 原型扩展 | `Vue.prototype.$xxx = ...` | `app.config.globalProperties.$xxx = ...` |
| 响应式实现 | `Object.defineProperty` | `Proxy` |
| 新增属性响应 | 需 `this.$set` | 直接赋值即可 |
| 数组下标赋值 | 不响应 | 响应 |
| 主要 API 风格 | Options API | 组合式 API（Options API 仍支持） |
| 逻辑复用 | `mixins` | 组合式函数（Composable） |
| 根元素 | 必须单一根节点 | 支持多根节点（Fragment） |
| 组件 v-model | `value` + `input` | `modelValue` + `update:modelValue` |
| `.sync` | 支持 | 移除，改用 `v-model:prop` |
| 事件总线 | `new Vue()` + `$on/$off` | 移除 `$on/$off`，用 `mitt` / Pinia / provide-inject |
| 过滤器 | `filters` + `\|` | 移除，用 `computed` / 方法 |
| 指令钩子 | `bind/inserted/update/componentUpdated/unbind` | `created/beforeMount/mounted/updated/beforeUnmount/unmounted` |
| `$listeners` | 存在 | 移除，事件监听合入 `$attrs` |
| `$children` | 存在 | 移除 |
| `$attrs` | 不含 `class/style` | 包含 `class/style` |
| 生命周期 | `beforeDestroy` / `destroyed` | `onBeforeUnmount` / `onUnmounted` |
| slot 语法 | `slot` / `slot-scope` | 统一 `v-slot`（`#`） |
| Transition class | `v-enter` / `v-leave` | `v-enter-from` / `v-leave-from` |
| v-if 与 v-for 优先级 | `v-for` 优先 | `v-if` 优先 |
| 状态管理 | Vuex 3 | Pinia（官方推荐） |
| 路由 | Vue Router 3 | Vue Router 4 / 5 |
| 异步组件 | 直接返回 Promise | 需 `defineAsyncComponent` |
| 顶层 await | 不支持 | `<script setup>` 支持，配合 `Suspense` |
| TypeScript | 支持较弱 | 一等公民支持 |
| Tree-shaking | 有限 | 全局 API 按需导出，体积更小 |

## 3. 逐项详解

### 3.1 入口与全局 API

Vue2：

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(router)
Vue.use(store)
Vue.prototype.$request = request

new Vue({ router, store, render: h => h(App) }).$mount('#app')
```

Vue3：

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import request from './utils/request'

const app = createApp(App)

app.config.globalProperties.$request = request
app.use(createPinia())
app.use(router)
app.mount('#app')
```

> Vue3 没有“全局 Vue 构造器”的概念，`createApp` 创建的是**应用实例**，每个应用拥有独立的作用域，避免测试时互相污染。

### 3.2 响应式：`Object.defineProperty` → `Proxy`

Vue2 的问题：

```js
const vm = new Vue({ data: { user: { name: 'Tom' } } })

vm.user.age = 20        // ❌ 新增属性不响应
vm.$set(vm.user, 'age', 20) // ✅

vm.list[0] = 'new'      // ❌ 数组下标不响应
vm.list.splice(0, 1, 'new') // ✅
```

Vue3 全部可直接响应：

```js
import { reactive } from 'vue'

const state = reactive({
  user: { name: 'Tom' },
  list: ['a', 'b']
})

state.user.age = 20    // ✅ 响应
state.list[0] = 'new'  // ✅ 响应
state.list.push('c')   // ✅ 响应
```

但 Vue3 有新的注意点：

```js
const state = reactive({ count: 0 })

// ❌ 解构后丢失响应式
let { count } = state

// ✅ 用 toRefs 保持响应式
import { toRefs } from 'vue'
const { count } = toRefs(state)
```

`reactive()` 返回的是**代理对象**，不等于原对象：

```js
const raw = { count: 0 }
const state = reactive(raw)

state === raw  // false（Vue2.7 的 reactive(raw) === raw 为 true）
```

### 3.3 Options API → 组合式 API

Vue2 Options API：一个逻辑被拆散在 `data`、`methods`、`computed`、`watch` 中。

```js
export default {
  data() {
    return { count: 0, step: 1 }
  },
  computed: {
    double() { return this.count * 2 }
  },
  watch: {
    count(n) { console.log(n) }
  },
  methods: {
    add() { this.count += this.step }
  }
}
```

Vue3 组合式 API：同一段逻辑聚在一起。

```js
import { computed, ref, watch } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const step = ref(1)
    const double = computed(() => count.value * 2)

    watch(count, n => console.log(n))

    function add() {
      count.value += step.value
    }

    return { count, step, double, add }
  }
}
```

`<script setup>` 进一步简化：

```vue
<script setup>
import { computed, ref, watch } from 'vue'

const count = ref(0)
const step = ref(1)
const double = computed(() => count.value * 2)

watch(count, n => console.log(n))

function add() {
  count.value += step.value
}
</script>

<template>
  <p>{{ count }} * 2 = {{ double }}</p>
  <button @click="add">+{{ step }}</button>
</template>
```

> 模板中 `ref` 会自动解包，不需要 `.value`；JS/TS 中必须写 `.value`。

### 3.4 生命周期对照

| Vue2 Options API | Vue3 Options API | Vue3 组合式 API |
|------------------|------------------|-----------------|
| `beforeCreate` | `beforeCreate` | 无（用 `setup()` 本身） |
| `created` | `created` | 无（用 `setup()` 本身） |
| `beforeMount` | `beforeMount` | `onBeforeMount` |
| `mounted` | `mounted` | `onMounted` |
| `beforeUpdate` | `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `updated` | `onUpdated` |
| `beforeDestroy` | `beforeUnmount` | `onBeforeUnmount` |
| `destroyed` | `unmounted` | `onUnmounted` |
| `activated` | `activated` | `onActivated` |
| `deactivated` | `deactivated` | `onDeactivated` |
| `errorCaptured` | `errorCaptured` | `onErrorCaptured` |
| — | — | `onRenderTracked` / `onRenderTriggered`（调试） |

```js
import { onBeforeUnmount, onMounted, ref } from 'vue'

export default {
  setup() {
    const timer = ref(null)

    onMounted(() => {
      timer.value = setInterval(() => {}, 1000)
    })

    onBeforeUnmount(() => {
      clearInterval(timer.value)
    })
  }
}
```

### 3.5 模板与指令差异

#### 多根节点

```vue
<!-- Vue2：报错，组件必须有且只有一个根元素 -->
<template>
  <div>
    <h1>标题</h1>
    <p>内容</p>
  </div>
</template>
```

```vue
<!-- Vue3：允许多个根节点 -->
<template>
  <h1>标题</h1>
  <p>内容</p>
</template>
```

#### `v-if` 与 `v-for` 优先级

```html
<!-- Vue2：v-for 优先，每次循环都会判断 v-if -->
<li v-for="item in list" v-if="item.visible" :key="item.id">

<!-- Vue3：v-if 优先，条件不成立时循环不执行 -->
<li v-for="item in list" v-if="item.visible" :key="item.id">
```

> Vue3 中若需要“先过滤再循环”，推荐用 `computed` 生成过滤后的列表，避免同元素混用带来的歧义。

#### `key` 的位置

```html
<!-- Vue2：key 放在子元素 -->
<template v-for="item in list">
  <div :key="item.id">{{ item.name }}</div>
</template>

<!-- Vue3：key 放在 template 上 -->
<template v-for="item in list" :key="item.id">
  <div>{{ item.name }}</div>
</template>
```

#### Transition 类名

| Vue2 | Vue3 |
|------|------|
| `v-enter` | `v-enter-from` |
| `v-leave` | `v-leave-from` |
| `v-enter-active` | `v-enter-active` |
| `v-enter-to` | `v-enter-to` |

### 3.6 组件通信差异

#### 组件 `v-model`

Vue2：

```html
<CustomInput v-model="username" />
```

```js
// 子组件
props: ['value'],
methods: {
  onInput(e) { this.$emit('input', e.target.value) }
}
```

Vue3：

```html
<CustomInput v-model="username" />

<!-- 多个 v-model -->
<UserForm v-model:first-name="first" v-model:last-name="last" />
```

```vue
<script setup>
defineProps({
  modelValue: String,
  firstName: String,
  lastName: String
})

defineEmits([
  'update:modelValue',
  'update:firstName',
  'update:lastName'
])
</script>
```

#### `$attrs` 与 `$listeners`

```vue
<!-- Vue2 -->
<template>
  <input v-bind="$attrs" v-on="$listeners">
</template>
<script>
export default { inheritAttrs: false }
</script>
```

```vue
<!-- Vue3：$listeners 已移除，事件也在 $attrs 中 -->
<template>
  <input v-bind="$attrs">
</template>
<script setup>
defineOptions({ inheritAttrs: false })
</script>
```

> `defineOptions` 需要 Vue 3.3+；更低版本可单独写普通 `<script>` 块导出 `inheritAttrs`。

#### 事件总线

Vue2：

```js
const bus = new Vue()
bus.$on('event', handler)
bus.$emit('event', payload)
bus.$off('event', handler)
```

Vue3 用 `mitt`：

```bash
npm install mitt
```

```js
// src/utils/bus.js
import mitt from 'mitt'
export const bus = mitt()
```

```js
bus.on('event', handler)
bus.emit('event', payload)
bus.off('event', handler)
```

### 3.7 路由与状态管理

| 项目 | Vue2 | Vue3 |
|------|------|------|
| 路由 | `new Router({ mode: 'history' })` | `createRouter({ history: createWebHistory() })` |
| 路由实例获取 | `this.$route` / `this.$router` | `useRoute()` / `useRouter()`（组合式） |
| 通配路由 | `path: '*'` | `path: '/:pathMatch(.*)*'` |
| 滚动行为 | `{ x: 0, y: 0 }` | `{ top: 0 }` |
| 守卫 | `(to, from, next) => { next() }` | `(to, from) => { return true/false/路径 }` |
| 状态管理 | Vuex 3：`state/getters/mutations/actions` | Pinia：`state/getters/actions`，无 mutations |
| 模块 | Vuex modules + `namespaced` | 每个 store 天然独立，无需命名空间 |

### 3.8 被移除的能力与替代方案

| Vue2 能力 | Vue3 替代 |
|-----------|-----------|
| `filters` | `computed` 或方法 |
| `$on/$off/$once` | `mitt` / Pinia / `provide-inject` |
| `$children` | `ref` 数组、组件通信库或状态管理 |
| `$listeners` | `$attrs` |
| `Vue.prototype` | `app.config.globalProperties` |
| `.sync` | `v-model:prop` |
| `v-on.native` | 默认事件透传；需要声明 `emits` |
| `keyCode` 修饰符 | 使用按键别名，如 `@keyup.enter` |
| `inline-template` | 使用插槽 |
| 直接 `import Async from () => import()` | `defineAsyncComponent(() => import())` |

### 3.9 性能与打包

- **Tree-shaking**：`createApp`、`nextTick` 等改为具名导出，未使用的 API 不会打进产物
- **静态提升**：静态节点在编译阶段提取，不参与每次 diff
- **补丁标记（PatchFlag）**：只对比真正会变化的动态部分
- **事件缓存**：内联事件处理函数被缓存，避免重复创建
- **更优 diff**：引入最长递增子序列算法，减少节点移动

---

## 4. Vue2 → Vue3 迁移清单

```text
[ ] 升级构建工具：Vue CLI → Vite（或保持 webpack + vue-loader 16+）
[ ] 入口改为 createApp，插件改 app.use
[ ] Vue.prototype → app.config.globalProperties
[ ] 检查 filters，改为 computed / 方法
[ ] 检查事件总线，改为 mitt / Pinia
[ ] 检查 mixins，逐步改为 composables
[ ] 组件 v-model 从 value/input 改为 modelValue/update:modelValue
[ ] .sync 改为 v-model:xxx
[ ] $listeners 合入 $attrs
[ ] 指令钩子改名
[ ] beforeDestroy/destroyed → onBeforeUnmount/onUnmounted
[ ] 路由升级 Router 4，通配路由改成 /:pathMatch(.*)*
[ ] Vuex 迁移到 Pinia（可选但推荐）
[ ] 多根节点检查：Vue2 组件模板若有多个根，Vue3 可用但注意 $attrs 继承行为
[ ] 异步组件用 defineAsyncComponent 包裹
[ ] 运行 @vue/compat 迁移构建，逐条修复警告
```

---

# 第二部分：基础篇

## 5. 环境搭建与第一个应用

### 5.1 创建项目

```bash
npm create vue@latest

# 按提示选择：
# ✔ Project name: vue3-demo
# ✔ TypeScript?  Yes/No
# ✔ Vue Router?  Yes
# ✔ Pinia?       Yes
# ✔ Vitest?      Yes
```

### 5.2 目录结构

```
vue3-demo/
├── index.html
├── vite.config.js
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── components/
│   ├── views/
│   ├── router/
│   ├── stores/
│   └── composables/
```

### 5.3 `index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue3 Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### 5.4 `src/main.js`

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Vue3 指令生命周期：mounted / updated（Vue2 是 inserted / update）
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.use(createPinia())
app.use(router)
app.mount('#app')
```

---

## 6. 响应式基础

### 6.1 `ref`

```vue
<template>
  <p>{{ count }}</p>
  <button @click="count++">+1</button>
</template>

<script setup>
import { ref } from 'vue'

// 模板自动解包，脚本中需要 .value
const count = ref(0)
console.log(count.value)
</script>
```

`ref` 可以包裹任意类型：

```js
const user = ref({ name: 'Tom' })
user.value.name = 'Alice' // 深层响应式
```

### 6.2 `reactive`

```js
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: { name: 'Tom' },
  list: [1, 2, 3]
})

state.count++
state.user.name = 'Alice'
state.list.push(4)
```

```vue
<template>
  <p>{{ state.count }} / {{ state.user.name }}</p>
</template>
```

### 6.3 `toRef` / `toRefs`

```js
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'Tom'
})

// 单个属性转 ref
const countRef = toRef(state, 'count')

// 全部属性转 ref，常用于从 composable 返回
const { count, name } = toRefs(state)

countRef.value++
console.log(state.count) // 1
```

### 6.4 `computed`

```js
import { computed, ref } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// 可写
const fullName2 = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    ;[firstName.value, lastName.value] = value.split(' ')
  }
})
```

### 6.5 `watch` 与 `watchEffect`

```js
import { reactive, ref, watch, watchEffect } from 'vue'

const count = ref(0)
const state = reactive({ user: { name: 'Tom' } })

// 监听 ref
watch(count, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

// 监听 getter
watch(
  () => state.user.name,
  newVal => console.log(newVal)
)

// 监听多个源
watch([count, () => state.user.name], ([c, n]) => {
  console.log(c, n)
})

// watchEffect：立即执行，自动收集依赖
watchEffect(() => {
  console.log('count =', count.value)
})
```

`watchEffect` 清理副作用：

```js
watchEffect(onCleanup => {
  const timer = setInterval(() => {}, 1000)
  onCleanup(() => clearInterval(timer))
})
```

`watch` 选项：

```js
watch(source, callback, {
  immediate: true,  // 立即执行一次
  deep: true,       // 深度监听
  flush: 'post',    // 'pre' | 'post' | 'sync'
  once: true        // Vue 3.4+，只触发一次
})
```

---

## 7. 组件基础

### 7.1 `defineProps` / `defineEmits` / `defineExpose`

```vue
<!-- UserCard.vue -->
<template>
  <section class="card">
    <p>title = {{ title }}</p>
    <p>model = {{ modelValue }}</p>
    <button @click="emitSelect">select</button>
  </section>
</template>

<script setup>
// 定义 props
const props = defineProps({
  title: { type: String, default: '' },
  modelValue: { type: String, default: '' }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'select'])

function emitSelect() {
  emit('select', { id: 1, title: props.title })
}

// 暴露给父组件 ref 访问（Vue2 Options API 没有对应能力）
defineExpose({
  sayHello() {
    console.log('hello from child')
  }
})
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  padding: 12px;
}
</style>
```

父组件使用：

```vue
<template>
  <UserCard ref="cardRef" v-model="keyword" title="用户卡片" @select="onSelect" />
  <button @click="cardRef.sayHello()">调用子组件方法</button>
</template>

<script setup>
import { ref } from 'vue'
import UserCard from './components/UserCard.vue'

const keyword = ref('hello')
const cardRef = ref(null)

function onSelect(row) {
  console.log(row)
}
</script>
```

### 7.2 `v-model` 修饰符

```html
<MyInput v-model="text" />
<MyInput v-model.capitalize="text" />
<UserForm v-model:first-name="first" v-model:last-name="last" />
```

```vue
<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: Object,
  firstName: String,
  lastName: String
})

const emit = defineEmits([
  'update:modelValue',
  'update:firstName',
  'update:lastName'
])

function onInput(event) {
  let value = event.target.value
  if (props.modelModifiers?.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  emit('update:modelValue', value)
}
</script>
```

### 7.3 插槽

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <slot name="header"><h3>默认标题</h3></slot>
    <slot :user="user" :count="count" />
    <slot name="footer" />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const user = reactive({ name: 'Alice' })
const count = ref(10)
</script>
```

```vue
<Card>
  <template #header>
    <h2>自定义标题</h2>
  </template>

  <template #default="{ user, count }">
    <p>{{ user.name }} 的计数是 {{ count }}</p>
  </template>

  <template #footer>
    <span>页脚</span>
  </template>
</Card>
```

### 7.4 `provide / inject`

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, reactive, ref } from 'vue'

const version = ref('3.5.46')
const theme = reactive({ color: 'blue' })

provide('appVersion', version)
provide('theme', theme)
</script>
```

```vue
<!-- 后代组件 -->
<template>
  <p>{{ version }} / {{ theme.color }}</p>
</template>

<script setup>
import { inject } from 'vue'

const version = inject('appVersion', 'unknown')
const theme = inject('theme', { color: 'black' })
</script>
```

> 传入 `ref` / `reactive` 可保持响应性；直接传普通字符串不会响应。

---

## 8. 生命周期

```vue
<script setup>
import {
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref
} from 'vue'

const timer = ref(null)

onMounted(() => {
  timer.value = setInterval(() => {}, 1000)
  console.log('mounted')
})

onBeforeUnmount(() => {
  clearInterval(timer.value)
  console.log('before unmount')
})

onActivated(() => console.log('keep-alive 激活'))
onDeactivated(() => console.log('keep-alive 停用'))
</script>
```

---

# 第三部分：进阶篇

## 9. 组合式函数（Composables）

组合式函数是 Vue3 替代 `mixins` 的推荐方案，本质是**利用组合式 API 封装可复用逻辑的普通函数**。

### 9.1 `useMouse`

```js
// src/composables/useMouse.js
import { onMounted, onUnmounted, ref } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<script setup>
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <p>{{ x }}, {{ y }}</p>
</template>
```

### 9.2 `useLocalStorage`

```js
// src/composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  const raw = localStorage.getItem(key)
  const state = ref(raw === null ? initialValue : JSON.parse(raw))

  watch(
    state,
    value => localStorage.setItem(key, JSON.stringify(value)),
    { deep: true }
  )

  return state
}
```

### 9.3 `useFetch`

```js
import { ref, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  watchEffect(async onCleanup => {
    loading.value = true
    error.value = null

    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })

    try {
      const response = await fetch(toValue(url))
      if (!cancelled) data.value = await response.json()
    } catch (err) {
      if (!cancelled) error.value = err
    } finally {
      if (!cancelled) loading.value = false
    }
  })

  return { data, error, loading }
}
```

```vue
<script setup>
import { ref } from 'vue'
import { useFetch } from '@/composables/useFetch'

const id = ref(1)
const { data, error, loading } = useFetch(() => `/api/users/${id.value}`)
</script>
```

> Composable 约定：命名以 `use` 开头；返回 `ref` 或 `reactive`；在 `onMounted/onUnmounted` 中成对注册/清理副作用；可接收 `ref` 或 getter 作为参数并用 `toValue` 统一处理。

---

## 10. 组件通信全景

| 场景 | Vue3 方案 |
|------|-----------|
| 父 → 子 | `defineProps` |
| 子 → 父 | `defineEmits` |
| 父子双向 | `v-model` / `v-model:prop` |
| 父拿子实例 | `ref` + `defineExpose` |
| 祖先 → 后代 | `provide / inject`（传 ref 保持响应） |
| 透传属性/事件 | `v-bind="$attrs"` + `inheritAttrs: false` |
| 任意组件 | Pinia |
| 简单事件 | `mitt` |
| 跨层级状态 | Pinia / provide-inject |

---

## 11. 内置组件

### 11.1 `Teleport`

把内容渲染到指定的 DOM 位置，常用于弹窗、提示框。

```vue
<template>
  <button @click="open = true">打开弹窗</button>

  <Teleport to="body">
    <div v-if="open" class="modal">
      <p>我被挂载到 body 下</p>
      <button @click="open = false">关闭</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
}
</style>
```

### 11.2 `Suspense`

配合异步组件或顶层 `await` 使用。

```vue
<!-- AsyncProfile.vue -->
<template>
  <p>异步用户信息：{{ data.name }}</p>
</template>

<script setup>
// 顶层 await 需要配合 <Suspense>，且构建目标需支持 esnext
const data = await new Promise(resolve => {
  setTimeout(() => resolve({ name: 'Alice' }), 10)
})
</script>
```

```vue
<template>
  <Suspense>
    <AsyncProfile />

    <template #fallback>
      <p>加载中...</p>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncProfile = defineAsyncComponent(
  () => import('./components/AsyncProfile.vue')
)
</script>
```

### 11.3 `KeepAlive` 搭配路由

```vue
<template>
  <router-view v-slot="{ Component }">
    <KeepAlive include="Home">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

```js
// home 组件需要设置 name 才能被 include 匹配
export default {
  name: 'Home'
}
```

`<script setup>` 中设置组件名需要额外的普通 `<script>` 块，或 Vue 3.3+ 使用 `defineOptions({ name: 'Home' })`。

---

## 12. 自定义指令

```js
// main.js
app.directive('focus', {
  // Vue3 钩子：created / beforeMount / mounted / updated / beforeUnmount / unmounted
  mounted(el) {
    el.focus()
  },
  updated(el, binding) {
    if (binding.value) el.focus()
  }
})
```

```html
<input v-focus>
<input v-focus="shouldFocus">
```

相比 Vue2，`bind → created`、`inserted → mounted`、`update → updated`、`unbind → unmounted`。

---

## 13. 路由：Vue Router 4

### 13.1 安装

```bash
npm install vue-router@4.6.5
```

### 13.2 创建路由（本文验证版本）

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const User = () => import('../views/User.vue')
const Login = () => import('../views/Login.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home, meta: { title: '首页' } },
    {
      path: '/user/:id',
      name: 'user',
      component: User,
      props: true,
      meta: { requiresAuth: true }
    },
    { path: '/login', name: 'login', component: Login },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// Vue3 守卫不再强制调用 next，直接返回结果
router.beforeEach(to => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
```

三种 history：

```js
createWebHistory()      // HTML5 history，URL 干净，需要服务端回退配置
createWebHashHistory()  // hash 模式，URL 带 #，无需服务端配置
createMemoryHistory()   // 内存模式，常用于 SSR / 测试
```

### 13.3 组件中使用

```vue
<template>
  <router-link :to="{ name: 'user', params: { id: 42 } }">User 42</router-link>
  <router-view />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const id = computed(() => route.params.id)

function go() {
  router.push({ name: 'user', params: { id: 9 } })
}

function back() {
  router.back()
}
</script>
```

### 13.4 守卫类型

```js
// 全局前置
router.beforeEach((to, from) => {
  // return true          放行
  // return false         取消导航
  // return '/'           重定向
  // return { name: 'x' } 命名路由重定向
})

// 全局解析守卫
router.beforeResolve(to => {})

// 全局后置钩子
router.afterEach((to, from, failure) => {})

// 路由独享
{
  path: '/admin',
  component: Admin,
  beforeEnter(to, from) {}
}
```

组件内守卫（Options API）：

```js
export default {
  beforeRouteEnter(to, from) {},
  beforeRouteUpdate(to, from) {},
  beforeRouteLeave(to, from) {}
}
```

组合式 API 中可使用 `onBeforeRouteLeave` / `onBeforeRouteUpdate`：

```js
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate(async to => {
  console.log('参数变化', to.params.id)
})

onBeforeRouteLeave(() => {
  return confirm('确定离开？')
})
```

### 13.5 路由懒加载与分组

```js
const User = () => import(/* webpackChunkName: "user" */ '../views/User.vue')
```

### 13.6 Vue Router 5 速览

- npm 最新主版本为 5.x（验证时 5.5.1），要求 `vue ^3.5.34 || ^4.0.0`
- 保留了 `createRouter` / `createWebHistory` / `useRoute` 等核心 API
- 增加了数据加载器（data loaders）等能力，适合 SSR / 数据预取场景
- 老项目升级前请阅读官方迁移指南，重点检查类型约束与构建工具版本

---

## 14. 状态管理：Pinia

### 14.1 安装与注册

```bash
npm install pinia@4.1.0
```

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
```

### 14.2 Options Store（接近 Vuex 的写法）

```js
// src/stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    double: state => state.count * 2
  },
  actions: {
    increment(payload = 1) {
      // Pinia 中 actions 可以直接修改 state，不需要 mutations
      this.count += payload
    }
  }
})
```

### 14.3 Setup Store（接近组合式 API）

```js
// src/stores/user.js
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const name = ref('guest')
  const upper = computed(() => name.value.toUpperCase())

  function setName(next) {
    name.value = next
  }

  // Setup Store 默认没有 $reset，需要自己实现普通方法
  function reset() {
    name.value = 'guest'
  }

  return { name, upper, setName, reset }
})
```

### 14.4 在组件中使用

```vue
<template>
  <p>count = {{ counter.count }} double = {{ counter.double }}</p>
  <button @click="counter.increment(2)">+2</button>

  <p>user = {{ userName }}</p>
  <button @click="userStore.setName('alice')">setName</button>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'

const counter = useCounterStore()
const userStore = useUserStore()

// 解构时保持响应式
const { name: userName } = storeToRefs(userStore)
</script>
```

### 14.5 `$patch` / `$subscribe`

```js
const store = useCounterStore()

// 对象形式批量修改
store.$patch({ count: 10 })

// 函数形式批量修改
store.$patch(state => {
  state.count += 5
})

// 订阅状态变化
const unsubscribe = store.$subscribe((mutation, state) => {
  console.log(mutation.type, state.count)
}, { detached: true }) // detached: true 表示组件卸载后仍保留订阅

// 手动重置
store.$reset()
```

> Options Store 自带 `$reset()`；Setup Store 需自行实现，如上面的 `reset()`。

### 14.6 持久化插件

```js
// src/stores/persist.js
export function persist({ store }) {
  const saved = localStorage.getItem('pinia-' + store.$id)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }

  store.$subscribe((mutation, state) => {
    localStorage.setItem('pinia-' + store.$id, JSON.stringify(state))
  }, { detached: true })
}
```

```js
import { createPinia } from 'pinia'
import { persist } from './stores/persist'

const pinia = createPinia()
pinia.use(persist)

app.use(pinia)
```

### 14.7 Pinia 与 Vuex 对比

| 维度 | Vuex 3 | Pinia |
|------|--------|-------|
| API | `state/getters/mutations/actions` | `state/getters/actions`，无 mutations |
| 模块 | `modules` + `namespaced` | 多个独立 store，天然隔离 |
| TypeScript | 支持较弱 | 类型推导优秀 |
| 代码量 | 模板代码多 | 简洁 |
| 动态注册 | 较繁琐 | 任意时刻可创建 store |
| Devtools | 支持 | 支持 |
| 官方推荐 | 旧版 | Vue3 官方推荐 |

---

## 15. 工具链

### 15.1 Vite 配置

```js
// vite.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    target: 'esnext' // 支持 <script setup> 顶层 await
  },
  test: {
    environment: 'jsdom'
  }
})
```

### 15.2 环境变量

```
.env
.env.development
.env.production
```

```dotenv
VITE_API_BASE=/api
VITE_TITLE=Vue3 Demo
```

```js
console.log(import.meta.env.VITE_API_BASE)
```

> Vite 中只有 `VITE_` 开头的变量会暴露给客户端代码，通过 `import.meta.env` 访问。

### 15.3 Axios 封装

```js
// src/utils/request.js
import axios from 'axios'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push({
        name: 'login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }
    return Promise.reject(error)
  }
)

export default request
```

> Vue Router 4 中 `router.currentRoute` 是 `ref`，需要 `.value`（模板中自动解包）。

### 15.4 Vue Devtools

- 查看组件树、`props`、组合式函数返回的 `ref` 状态
- 查看 Pinia store 与 mutation/action 时间线
- 查看路由记录与导航守卫

> Vue3 项目建议使用 Vue Devtools 6.2+，低版本无法正确展示 `<script setup>` 的响应式状态。

---

# 第四部分：高阶篇

## 16. 响应式原理

### 16.1 简化版 Proxy + effect

```js
let activeEffect = null
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  dep.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}

function reactive(target) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      const result = Reflect.get(obj, key, receiver)
      track(obj, key)
      return result
    },
    set(obj, key, value, receiver) {
      const oldValue = Reflect.get(obj, key, receiver)
      const result = Reflect.set(obj, key, value, receiver)
      if (oldValue !== value) {
        trigger(obj, key)
      }
      return result
    }
  })
}

function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

const state = reactive({ count: 0 })
effect(() => console.log('count =', state.count))

state.count++ // 输出 count = 1
state.count++ // 输出 count = 2
```

### 16.2 `ref` 的实现思路

```js
function ref(value) {
  const wrapper = {
    get value() {
      track(wrapper, 'value')
      return value
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue
        trigger(wrapper, 'value')
      }
    }
  }
  return wrapper
}
```

真实实现中：

- `ref` 包装对象时，内部会调用 `reactive` 转成深层响应式
- `shallowRef` 只响应 `.value` 本身，不深入内部
- `reactive` 对 `Map`/`Set` 也有专门拦截

### 16.3 响应式工具函数

```js
import {
  isReactive,
  isRef,
  markRaw,
  readonly,
  shallowReactive,
  shallowRef,
  toRaw,
  unref
} from 'vue'

const raw = { a: 1 }

const state = shallowReactive(raw)
isReactive(state) // true
isReactive(state.a) // false（浅层）

const wrapper = shallowRef(raw)
isRef(wrapper) // true
unref(wrapper) // 等价于 wrapper.value

const frozen = markRaw(raw) // 永远不会被 reactive 转换
const locked = readonly(state) // 只读代理
// locked.count = 1 // 会触发警告，不能修改
toRaw(state) // 取回原始对象
```

使用场景：

| API | 场景 |
|-----|------|
| `shallowRef` | 大对象/第三方实例，只替换整体才更新 |
| `shallowReactive` | 只响应第一层 |
| `markRaw` | 跳过响应式转换，避免不必要的代理 |
| `readonly` | 防止子组件修改传入状态 |
| `toRaw` | 临时读取原始对象，绕过代理 |

### 16.4 `effectScope`

```js
import { effectScope, ref, watch } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  watch(count, n => console.log(n))
})

// 统一停止 scope 内所有 effect / watch / computed
scope.stop()
```

---

## 17. 编译与渲染优化

### 17.1 编译优化手段

| 优化 | 说明 |
|------|------|
| 静态提升（hoistStatic） | 静态节点提到渲染函数外，不再重复创建 |
| 补丁标记（PatchFlag） | 编译阶段标记动态部分，diff 时只检查这些节点 |
| 动态属性标记 | 只比对变化的 attribute / prop |
| 事件缓存（cacheHandlers） | 内联事件处理函数缓存，避免每次渲染新建函数 |
| Block Tree | 把动态子节点收集到 block，减少遍历范围 |

示意：

```js
// 编译前
<div>
  <span>静态文本</span>
  <span>{{ count }}</span>
</div>

// 编译后大致思路（简化）
const hoisted = createVNode('span', null, '静态文本')

function render() {
  return (openBlock(), createBlock('div', null, [
    hoisted,
    createVNode('span', null, count.value, 1 /* TEXT */)
  ]))
}
```

### 17.2 diff 算法

Vue3 使用**最长递增子序列（LIS）**优化节点移动：

- 先从头、尾同步处理相同节点
- 剩余节点建立 `key → index` 映射
- 求出最长递增子序列，保持这些节点不动
- 只移动不在 LIS 中的节点

相比 Vue2 的双端比较，节点移动次数更少。

---

## 18. 性能优化清单

| 优化点 | 做法 |
|--------|------|
| 列表渲染 | 稳定唯一的 `key`，不要用 `index` |
| 大列表 | 虚拟滚动（`vue-virtual-scroller` 等） |
| 跳过更新 | `v-memo="[item.id]"` |
| 大对象 | `shallowRef` + `markRaw` |
| 组件缓存 | `<KeepAlive include="...">` |
| 异步组件 | `defineAsyncComponent` + 路由懒加载 |
| 计算缓存 | `computed` 缓存派生值 |
| 减少侦听 | 能用 `computed` 就不用 `watchEffect` |
| 事件清理 | `onBeforeUnmount` 中移除监听 |
| 构建分析 | `rollup-plugin-visualizer` |

### 18.1 `v-memo`

```html
<!-- 只有 row.id 或 selected 变化时才重新渲染该 li -->
<li v-for="row in list" :key="row.id" v-memo="[row.id, selected]">
  {{ row.name }} - {{ row.status }}
</li>
```

### 18.2 异步组件

```js
import { defineAsyncComponent } from 'vue'

const Heavy = defineAsyncComponent({
  loader: () => import('./Heavy.vue'),
  loadingComponent: Loading,
  errorComponent: ErrorComp,
  delay: 200,
  timeout: 5000
})
```

### 18.3 虚拟滚动思路

```html
<!-- 只渲染可视区内的节点，避免一次性渲染上万行 -->
<VirtualList :items="bigList" :item-height="40" />
```

---

## 19. TypeScript 支持

### 19.1 泛型 `defineProps`

```vue
<script setup lang="ts">
interface Props {
  title?: string
  count?: number
  tags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
  count: 0,
  tags: () => []
})
</script>
```

### 19.2 泛型 `defineEmits`

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', id: number): void
  (e: 'close'): void
}>()

emit('select', 1)
emit('close')
</script>
```

### 19.3 泛型 Store

```ts
// stores/user.ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLogged = computed(() => currentUser.value !== null)

  function login(user: User) {
    currentUser.value = user
  }

  function logout() {
    currentUser.value = null
  }

  return { currentUser, isLogged, login, logout }
})
```

### 19.4 `vue-tsc` 类型检查

```bash
npm install -D vue-tsc
npx vue-tsc --noEmit
```

---

## 20. 测试

### 20.1 配置 Vitest

```bash
npm install -D vitest @vue/test-utils jsdom
```

```js
// vite.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom'
  }
})
```

### 20.2 组件测试（本文实际验证通过）

```js
// src/components/__tests__/UserCard.spec.js
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import UserCard from '../UserCard.vue'

describe('UserCard', () => {
  it('renders props and emits select', async () => {
    const wrapper = mount(UserCard, {
      props: {
        title: '测试卡片',
        modelValue: 'abc'
      },
      global: {
        plugins: [createPinia()],
        provide: { appVersion: 'test' },
        directives: {
          focus: { mounted() {} }
        }
      }
    })

    expect(wrapper.text()).toContain('测试卡片')
    expect(wrapper.text()).toContain('test')

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('select')[0][0]).toEqual({
      id: 1,
      title: '测试卡片'
    })

    await wrapper.find('input').setValue('xyz')
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe('xyz')
  })
})
```

```bash
npm test
# ✓ src/components/__tests__/UserCard.spec.js (1 test)
# Test Files  1 passed (1)
# Tests       1 passed (1)
```

---

## 21. SSR 与 Nuxt 3

Vue3 的 SSR 通常通过 Nuxt 3 使用：

```bash
npx nuxi@latest init my-nuxt-app
```

Nuxt 3 特性：

- 基于 Vue3 + Vite + Nitro
- 文件路由：`pages/` 目录自动生成路由
- 自动导入：`ref`、`computed`、`useFetch` 等无需手动 import
- 服务端渲染 / 静态生成 / SPA 三种模式
- 内置 Server API（`server/api/`）

```vue
<!-- pages/users/[id].vue -->
<script setup>
const route = useRoute()
const { data: user } = await useFetch(`/api/users/${route.params.id}`)
</script>

<template>
  <h1>{{ user?.name }}</h1>
</template>
```

> 若项目需要 SEO、首屏性能或服务端数据直出，优先考虑 Nuxt 3，而不是手写 SSR 架构。

---

## 22. 常见坑与最佳实践

### 22.1 常见坑

```js
// ❌ 解构 reactive 丢响应式
const { count } = reactive({ count: 0 })

// ✅
const state = reactive({ count: 0 })
const { count } = toRefs(state)

// ❌ 模板中给 ref 写 .value
// <p>{{ count.value }}</p>  多余，模板自动解包

// ✅
// <p>{{ count }}</p>

// ❌ 修改 props（单向下行）
props.title = 'new'

// ✅ emit 让父组件修改
emit('update:title', 'new')

// ❌ Vue3 中直接导入异步组件
const Comp = () => import('./Comp.vue')

// ✅
const Comp = defineAsyncComponent(() => import('./Comp.vue'))
```

### 22.2 最佳实践

- 优先使用 `<script setup>`，逻辑按功能聚合
- 抽离可复用逻辑为 Composable，而不是全局 mixin
- 用 `Pinia` 管理跨组件共享状态，避免滥用 `provide/inject`
- 组件通信优先 `props down / events up`，复杂场景再上状态管理
- `defineProps` 声明类型与默认值，提高可维护性
- 副作用成对注册与清理
- 大项目开启 `vue-tsc` 类型检查
- 路由与组件都做懒加载，配合打包分析优化首屏

---

## 23. 自测题

1. Vue3 中 `ref` 和 `reactive` 的区别是什么？分别适合什么场景？
2. 为什么解构 `reactive` 对象会丢失响应式？如何解决？
3. `<script setup>` 中如何定义 props、emits 和暴露方法？
4. Vue3 组件 `v-model` 的默认 prop 名和事件名是什么？
5. `watch` 和 `watchEffect` 的区别是什么？
6. Vue Router 4 的全局前置守卫为什么不再需要 `next`？
7. Pinia 为什么不需要 `mutations`？
8. `Teleport` 和 `Suspense` 分别解决什么问题？
9. Vue2 的过滤器在 Vue3 中如何替代？
10. Vue3 相比 Vue2 在编译层面做了哪些优化？

<details>
<summary>参考答案</summary>

1. `ref` 可包裹任意值，通过 `.value` 访问，适合基础类型与整体替换；`reactive` 直接代理对象，适合复杂对象/数组。
2. 解构得到的是普通值拷贝，脱离代理；用 `toRefs` 或 `toRef`。
3. `defineProps`、`defineEmits`、`defineExpose`。
4. `modelValue` 与 `update:modelValue`。
5. `watch` 需显式指定监听源，可拿旧值，默认懒执行；`watchEffect` 自动收集依赖，立即执行，拿不到旧值。
6. Router 4 支持通过返回值决定放行/重定向/取消，`next` 仍可用但不再强制。
7. actions 中可直接修改 state，Devtools 依然能追踪，省掉 mutations 模板代码。
8. `Teleport` 把 DOM 渲染到指定位置；`Suspense` 统一处理异步依赖的 loading/fallback。
9. 用 `computed` 或方法，例如 `computed(() => price.value.toFixed(2))`。
10. 静态提升、PatchFlag、事件缓存、Block Tree、基于 LIS 的 diff。

</details>

---

## 24. 验证说明

本文示例在本地按以下方式验证：

| 验证项 | 结果 |
|--------|------|
| Vue 3.5.46 + Vite 8.3.8 + @vitejs/plugin-vue 6.0.11 | `vite build` 生产构建成功 |
| Vue Router 4.6.5：history 模式、动态路由、守卫返回重定向、懒加载、通配路由 | 编译通过 |
| Pinia 4.1.0：Options Store + Setup Store + `storeToRefs` 用法 | 编译通过 |
| `<script setup>`：`defineProps/defineEmits/defineExpose`、`v-model`、插槽、`inject` | 编译通过 |
| `Teleport` + `Suspense` + 顶层 `await` + `KeepAlive` | 编译通过 |
| `useMouse` 组合式函数、自定义指令 `mounted` 钩子 | 编译通过 |
| Vitest 5.1.1 + @vue/test-utils 2.6.0 + jsdom 31.0.1 | 1 个组件测试通过 |
| TypeScript 示例 | 按 Vue 3.3+ / Pinia 4 API 编写，未在本次 JS 工程中编译 |

> 构建目标设为 `esnext` 是为了支持 `<script setup>` 中的顶层 `await`；若项目不需要 `Suspense`，可使用默认构建目标。

上一篇：[Vue2 系统学习文档](./Vue2.md) 中给出了 Vue2 + Router 3 + Vuex 3 的完整示例。
