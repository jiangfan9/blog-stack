---
title: Vue2
date: 2022-07-28
categories: [前端]
tags: [Vue2, Vue Router, Vuex, 前端]
description: Vue2 框架学习笔记，涵盖 Options API、组件通信、Vue Router 3、Vuex 3 与 Vue CLI。
coverImg: /images/cover-1.svg
permalink: /posts/vue2
---

# Vue2 系统学习文档

> 从入门到实战：Options API + Vue Router 3 + Vuex 3 + Vue CLI 工具链
>
> 适用版本：Vue 2.7.16（Vue 2 已于 2023-12-31 EOL；本文用于维护存量项目与理解 Vue 演进）
>
> 本地验证：Node 22.22.2 / npm 10.9.7 / Vue CLI 5.0.9，生产构建通过；`<script setup>`、路由、Vuex、过滤器、指令、作用域插槽均已实际编译

---

## 写在前面

### Vue2 是什么

Vue2 是一套用于构建用户界面的**渐进式 JavaScript 框架**：

- **渐进式**：可以只用核心库，也可以逐步引入路由、状态管理、构建工具
- **响应式**：数据变化自动驱动视图更新
- **组件化**：把页面拆成可复用的 `.vue` 单文件组件（SFC）
- **双向数据绑定**：`v-model` 在表单元素上提供语法糖

### 版本现状

| 项目 | 版本 | 说明 |
|------|------|------|
| Vue | 2.7.16 | Vue 2 最终版本，2023-12-31 停止官方维护 |
| Vue Router | 3.6.5 | Vue2 配套路由 |
| Vuex | 3.6.2 | Vue2 配套状态管理 |
| Vue CLI | 5.0.9 | Vue2 主流工程化工具 |
| Vue Devtools | 6.x | 调试组件树、事件、Vuex |

> 新项目建议直接用 Vue3。本文的价值在于：维护老项目、理解 Vue3 的由来、平滑迁移。

### 学习路线

```
基础篇：实例 → 模板语法 → 响应式 → computed/watch → 组件 → 生命周期
进阶篇：组件通信 → 插槽 → 动态组件 → 指令 → mixins → 路由 → Vuex → Axios
高阶篇：响应式原理 → 虚拟 DOM/diff → 性能优化 → Vue2.7 Composition API → 迁移 Vue3
```

---

# 第一部分：基础篇

## 1. 环境搭建与第一个应用

### 1.1 CDN 快速体验

适合学习语法，不适合生产项目。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Vue2 CDN Demo</title>
  <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <p>{{ message }}</p>
    <input v-model="message">
    <button @click="reverse">反转</button>
  </div>

  <script>
    new Vue({
      el: '#app',
      data() {
        return { message: 'Hello Vue2' }
      },
      methods: {
        reverse() {
          this.message = this.message.split('').reverse().join('')
        }
      }
    })
  </script>
</body>
</html>
```

### 1.2 使用 Vue CLI 创建工程

```bash
# 安装/升级脚手架
npm install -g @vue/cli

# 创建项目（交互式选择 Vue 2）
vue create vue2-demo

# 或使用图形界面
vue ui
```

创建完成后目录结构：

```
vue2-demo/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── main.js          # 入口
│   ├── App.vue          # 根组件
│   ├── components/      # 通用组件
│   ├── views/           # 路由页面
│   ├── router/          # 路由配置
│   ├── store/           # Vuex 配置
│   └── assets/          # 静态资源
├── vue.config.js        # 构建配置
├── package.json
└── babel.config.js
```

### 1.3 入口文件 `src/main.js`

Vue2 使用 `new Vue()` 创建根实例，全局能力都挂在 `Vue` 构造器上。

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import clickTracker from './mixins/clickTracker'
import bus from './utils/bus'

Vue.config.productionTip = false

// 全局混入：所有组件都获得 this.track()
Vue.mixin(clickTracker)

// Vue2 指令钩子是 inserted（Vue3 改为 mounted）
Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})

// Vue2 过滤器（Vue3 已移除）
Vue.filter('upper', value => String(value).toUpperCase())

bus.$on('track', payload => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[track]', payload)
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

### 1.4 `package.json` 关键依赖

```json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  },
  "dependencies": {
    "vue": "2.7.16",
    "vue-router": "3.6.5",
    "vuex": "3.6.2"
  },
  "devDependencies": {
    "@vue/cli-service": "5.0.9",
    "vue-template-compiler": "2.7.16"
  }
}
```

> Vue 2.7 起，`vue-template-compiler` 对普通构建已非必需；若使用 `@vue/test-utils` v1 仍需保留。

### 1.5 Vue Devtools

浏览器安装 Vue Devtools 6.x 后，可以：

- 查看组件树与每个组件的 `data / props / computed`
- 时间旅行调试 Vuex mutation
- 查看事件触发与组件渲染性能

---

## 2. 模板语法与指令

### 2.1 文本插值

```html
<p>{{ message }}</p>
<p>{{ count + 1 }}</p>
<p>{{ ok ? 'YES' : 'NO' }}</p>
<p>{{ message.split('').reverse().join('') }}</p>

<!-- 只渲染一次，后续数据变化不再更新 -->
<span v-once>{{ staticText }}</span>

<!-- 原始 HTML，注意 XSS 风险 -->
<div v-html="rawHtml"></div>
```

### 2.2 常用指令一览

| 指令 | 作用 | 示例 |
|------|------|------|
| `v-bind` | 单向绑定属性 | `v-bind:title="title"` / `:title="title"` |
| `v-model` | 表单双向绑定 | `v-model="username"` |
| `v-if` | 条件渲染（销毁/重建） | `v-if="score > 90"` |
| `v-show` | 条件显示（切换 display） | `v-show="visible"` |
| `v-for` | 列表渲染 | `v-for="(item, i) in list" :key="item.id"` |
| `v-on` | 绑定事件 | `@click="handleClick"` |
| `v-text` | 更新 textContent | `v-text="message"` |
| `v-html` | 更新 innerHTML | `v-html="rawHtml"` |
| `v-pre` | 跳过编译 | `<span v-pre>{{ 不会被编译 }}</span>` |
| `v-cloak` | 隐藏未编译模板 | 配合 `[v-cloak]{display:none}` |

### 2.3 `v-bind` 与 `v-on` 简写

```html
<!-- v-bind -->
<img :src="avatar" :alt="user.name">
<a :href="'/user/' + user.id">用户详情</a>

<!-- v-on -->
<button @click="say('hi')">Say hi</button>
<button @click="count += 1">+1</button>
```

### 2.4 `v-if` / `v-else` / `v-else-if` / `v-show`

```html
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else>Other</div>

<div v-show="visible">v-show 只是切换 display</div>
```

| 对比 | `v-if` | `v-show` |
|------|--------|----------|
| 渲染方式 | 条件为 false 时不渲染 DOM | 始终渲染，切换 `display: none` |
| 切换开销 | 高（创建/销毁） | 低（样式切换） |
| 初始开销 | 低 | 高 |
| 适用场景 | 很少切换 | 频繁切换 |

### 2.5 `v-for` 与 `key`

```html
<ul>
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }} - {{ item.name }}
  </li>
</ul>

<!-- 遍历对象 -->
<div v-for="(value, key, index) in object" :key="key">
  {{ index }}. {{ key }} = {{ value }}
</div>

<!-- template 包裹多个节点 -->
<template v-for="item in items">
  <h3 :key="item.id + '-h'">{{ item.title }}</h3>
  <p :key="item.id + '-p'">{{ item.desc }}</p>
</template>
```

> `key` 必须是稳定且唯一的标识，不要用 `index` 作为 key 处理可排序/可增删列表，否则会导致状态错位。

---

## 3. 数据、方法与响应式

### 3.1 `data` 必须返回对象

```js
new Vue({
  el: '#app',
  data() {
    return {
      count: 0,
      user: { name: 'Tom', age: 20 },
      items: [1, 2, 3]
    }
  },
  methods: {
    add() {
      this.count++
    }
  }
})
```

> 组件里的 `data` 必须是函数，保证每个组件实例拥有独立数据副本。

### 3.2 响应式更新演示

```html
<div id="app">
  <p>{{ count }}</p>
  <button @click="count++">+1</button>
</div>
```

### 3.3 简化版响应式模型（帮助理解原理）

Vue2 通过 `Object.defineProperty` 拦截 getter/setter：

```js
function defineReactive(obj, key, val) {
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) dep.depend()
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify()
    }
  })
}

class Dep {
  constructor() {
    this.subs = []
  }
  depend() {
    if (Dep.target) this.subs.push(Dep.target)
  }
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}
Dep.target = null

class Watcher {
  constructor(updateFn) {
    this.updateFn = updateFn
    Dep.target = this
    this.updateFn()
    Dep.target = null
  }
  update() {
    this.updateFn()
  }
}

const state = { count: 0 }
defineReactive(state, 'count', state.count)
new Watcher(() => console.log('count =', state.count))

state.count++ // 输出 count = 1
```

Vue2 响应式限制：

- 初始化之后新增属性不会触发视图更新，需要 `this.$set(obj, 'newKey', value)`
- 删除属性需要 `this.$delete(obj, 'key')`
- 通过下标修改数组 `arr[0] = x` 不响应，需 `this.$set(arr, 0, x)` 或 `splice`
- 无法监听 `Symbol` 键

---

## 4. 计算属性与侦听器

### 4.1 `computed` 有缓存，`methods` 每次调用都执行

```html
<div id="app">
  <p>methods: {{ reversedMessage() }}</p>
  <p>computed: {{ reversedComputed }}</p>
  <input v-model="message">
</div>
```

```js
new Vue({
  el: '#app',
  data() {
    return { message: 'hello' }
  },
  computed: {
    reversedComputed() {
      return this.message.split('').reverse().join('')
    }
  },
  methods: {
    reversedMessage() {
      return this.message.split('').reverse().join('')
    }
  }
})
```

### 4.2 可写计算属性

```js
computed: {
  fullName: {
    get() {
      return this.firstName + ' ' + this.lastName
    },
    set(value) {
      const parts = value.split(' ')
      this.firstName = parts[0]
      this.lastName = parts[1] || ''
    }
  }
}
```

### 4.3 `watch` 深度监听与立即执行

```js
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

new Vue({
  el: '#app',
  data() {
    return {
      question: '',
      answer: '请输入问题',
      user: { name: 'Tom' }
    }
  },
  watch: {
    question(newVal) {
      this.answer = '等待输入停止...'
      this.debouncedGetAnswer(newVal)
    },
    user: {
      handler(newVal) {
        console.log('user changed', newVal.name)
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.debouncedGetAnswer = debounce(value => {
      this.answer = '答案是：' + value.length + ' 个字符'
    }, 500)
  }
})
```

> `computed` 适合“根据已有数据派生新值”；`watch` 适合“数据变化后执行异步或副作用”。

---

## 5. class 与 style 绑定

```html
<!-- 对象语法 -->
<div class="static" :class="{ active: isActive, 'text-danger': hasError }"></div>

<!-- 数组语法 -->
<div :class="[activeClass, errorClass]"></div>

<!-- 数组 + 对象 -->
<div :class="[{ active: isActive }, errorClass]"></div>

<!-- style 对象 -->
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>

<!-- style 数组 -->
<div :style="[baseStyles, overridingStyles]"></div>
```

```js
new Vue({
  el: '#app',
  data() {
    return {
      isActive: true,
      hasError: false,
      activeClass: 'active',
      errorClass: 'text-danger',
      activeColor: 'red',
      fontSize: 14,
      baseStyles: { color: 'blue' },
      overridingStyles: { fontSize: '20px' }
    }
  }
})
```

---

## 6. 事件处理

```html
<!-- 方法处理器 -->
<button @click="greet">Greet</button>

<!-- 内联语句 -->
<button @click="say('hi')">Say hi</button>
<button @click="count += 1">+1</button>

<!-- 事件修饰符 -->
<form @submit.prevent="onSubmit">
  <input @keyup.enter="onEnter">
  <div @click.stop="onClick">阻止冒泡</div>
  <div @click.capture="onCapture">捕获模式</div>
  <div @click.self="onSelf">只点自身触发</div>
  <div @click.once="onOnce">只触发一次</div>
</form>
```

事件修饰符说明：

| 修饰符 | 作用 |
|--------|------|
| `.stop` | 调用 `event.stopPropagation()` |
| `.prevent` | 调用 `event.preventDefault()` |
| `.capture` | 使用捕获模式 |
| `.self` | 只当事件从元素本身触发 |
| `.once` | 只触发一次 |
| `.passive` | 添加 `{ passive: true }`，常用于滚动性能 |

常用按键修饰符：

```html
<input @keyup.enter="submit">
<input @keyup.esc="cancel">
<input @keyup.delete="remove">
<input @keyup.ctrl.enter="save">
```

---

## 7. 表单输入绑定 `v-model`

```html
<div id="app">
  <input v-model.trim="username" placeholder="用户名">
  <input v-model.number="age" type="number" placeholder="年龄">
  <input v-model.lazy="message" placeholder="change 后才同步">

  <input type="radio" v-model="gender" value="male"> 男
  <input type="radio" v-model="gender" value="female"> 女

  <input type="checkbox" v-model="checked"> 是否同意
  <input type="checkbox" v-model="hobbies" value="reading"> 阅读
  <input type="checkbox" v-model="hobbies" value="coding"> 编码

  <select v-model="city">
    <option disabled value="">请选择</option>
    <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
  </select>

  <p>{{ username }} / {{ age }} / {{ gender }} / {{ checked }} / {{ hobbies }} / {{ city }}</p>
</div>
```

```js
new Vue({
  el: '#app',
  data() {
    return {
      username: '',
      age: 18,
      message: '',
      gender: 'male',
      checked: false,
      hobbies: [],
      city: '',
      cities: ['北京', '上海', '深圳']
    }
  }
})
```

---

## 8. 组件基础

### 8.1 全局组件与局部组件

```js
// 全局注册：在任何组件模板中都能用
Vue.component('MyButton', {
  props: ['text'],
  template: `<button @click="$emit('click')">{{ text }}</button>`
})

// 局部注册：只在当前组件可用
new Vue({
  el: '#app',
  components: {
    MyButton: {
      props: ['text'],
      template: `<button>{{ text }}</button>`
    }
  }
})
```

生产项目更推荐单文件组件（SFC）：

```vue
<template>
  <button class="btn" @click="$emit('click')">
    <slot>默认按钮</slot>
  </button>
</template>

<script>
export default {
  name: 'MyButton'
}
</script>

<style scoped>
.btn {
  padding: 6px 12px;
  cursor: pointer;
}
</style>
```

### 8.2 `props` 校验

```js
props: {
  // 基础类型校验
  title: String,
  count: Number,
  isActive: Boolean,

  // 多类型
  id: [String, Number],

  // 必填
  name: {
    type: String,
    required: true
  },

  // 默认值
  size: {
    type: String,
    default: 'normal'
  },

  // 对象/数组默认值必须是函数
  options: {
    type: Object,
    default() {
      return { label: '默认' }
    }
  },

  // 自定义校验
  score: {
    type: Number,
    validator(value) {
      return value >= 0 && value <= 100
    }
  }
}
```

### 8.3 子组件向父组件通信：`$emit`

```vue
<!-- Child.vue -->
<template>
  <div>
    <button @click="choose">选中 Alice</button>
  </div>
</template>

<script>
export default {
  methods: {
    choose() {
      this.$emit('select', { id: 1, name: 'Alice' })
    }
  }
}
</script>
```

```vue
<!-- Parent.vue -->
<template>
  <Child @select="onSelect" />
</template>

<script>
import Child from './Child.vue'

export default {
  components: { Child },
  methods: {
    onSelect(user) {
      console.log(user)
    }
  }
}
</script>
```

### 8.4 组件上的 `v-model`（Vue2 语法糖）

Vue2 中组件 `v-model` 默认等价于绑定 `value` 并监听 `input`：

```vue
<!-- 父组件 -->
<CustomInput v-model="username" />
```

```vue
<!-- CustomInput.vue -->
<template>
  <input :value="value" @input="$emit('input', $event.target.value)">
</template>

<script>
export default {
  props: {
    value: String
  }
}
</script>
```

`.sync` 修饰符用于多个双向绑定：

```html
<Dialog :visible.sync="dialogVisible" :title.sync="dialogTitle" />
```

```js
// 子组件中更新
this.$emit('update:visible', false)
this.$emit('update:title', '新标题')
```

---

## 9. 生命周期

Vue2 生命周期钩子：

| 阶段 | 钩子 | 说明 |
|------|------|------|
| 创建 | `beforeCreate` | 实例初始化后，数据观测前 |
| 创建 | `created` | 数据观测完成，DOM 未生成；常用作异步请求 |
| 挂载 | `beforeMount` | 模板编译完成，尚未挂载 DOM |
| 挂载 | `mounted` | DOM 挂载完成；可访问 `this.$el` |
| 更新 | `beforeUpdate` | 数据变化后，DOM 更新前 |
| 更新 | `updated` | DOM 更新完成 |
| 销毁 | `beforeDestroy` | 实例销毁前；清理定时器、事件监听 |
| 销毁 | `destroyed` | 实例销毁后 |
| 缓存 | `activated` | `keep-alive` 组件被激活 |
| 缓存 | `deactivated` | `keep-alive` 组件被停用 |

```js
export default {
  name: 'LifecycleDemo',
  data() {
    return { timer: null }
  },
  created() {
    console.log('created: 可以发请求')
  },
  mounted() {
    this.timer = setInterval(() => console.log('tick'), 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    console.log('beforeDestroy: 清理副作用')
  }
}
```

---

# 第二部分：进阶篇

## 10. 组件通信全景

| 场景 | 方案 |
|------|------|
| 父 → 子 | `props` |
| 子 → 父 | `$emit` |
| 父 → 后代 | `provide / inject` |
| 兄弟组件 | 事件总线 `bus` 或提升到共同父级 |
| 任意组件 | Vuex |
| 父拿子组件实例 | `ref` + `this.$refs.xxx` |
| 子拿父实例 | `this.$parent`（不推荐强耦合） |
| 透传属性/事件 | `v-bind="$attrs"` + `v-on="$listeners"` |

### 10.1 `provide / inject`

```js
// 祖先组件
export default {
  provide() {
    return {
      appVersion: '2.7.16',
      // 需要响应式时传计算属性对象，而不是原始值
      theme: this.themeObject
    }
  },
  data() {
    return {
      themeObject: { color: 'blue' }
    }
  }
}
```

```js
// 后代组件
export default {
  inject: {
    appVersion: { default: 'unknown' },
    theme: { default: () => ({ color: 'black' }) }
  },
  mounted() {
    console.log(this.appVersion, this.theme.color)
  }
}
```

> `provide/inject` 默认不是响应式的；若需响应，传入对象或计算属性包装对象。

### 10.2 事件总线（Vue2 时代常用，Vue3 已移除 `$on`）

```js
// src/utils/bus.js
import Vue from 'vue'

export default new Vue()
```

```js
// 发送方
import bus from '@/utils/bus'

bus.$emit('user-changed', { id: 1 })
```

```js
// 接收方
import bus from '@/utils/bus'

export default {
  created() {
    bus.$on('user-changed', this.onUserChanged)
  },
  beforeDestroy() {
    bus.$off('user-changed', this.onUserChanged)
  },
  methods: {
    onUserChanged(payload) {
      console.log(payload)
    }
  }
}
```

> Vue3 移除了 `$on/$off/$once`，替代方案是 `mitt`、Vuex/Pinia 或 `provide/inject`。

### 10.3 `$attrs` 与 `$listeners`

```vue
<!-- 透传所有非 props 属性和事件到内部组件 -->
<template>
  <div class="wrapper">
    <el-input v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>
```

---

## 11. 插槽

### 11.1 默认插槽 / 具名插槽 / 作用域插槽

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <header>
      <slot name="header">
        <h3>默认标题</h3>
      </slot>
    </header>

    <main>
      <slot :user="user" :count="count" />
    </main>

    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: { name: 'Alice' },
      count: 10
    }
  }
}
</script>
```

```vue
<!-- 使用方：Vue2.6+ 推荐使用 v-slot -->
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

旧语法（Vue2.5 及以前）：

```html
<template slot="header">自定义标题</template>
<template slot-scope="{ user }">{{ user.name }}</template>
```

---

## 12. 动态组件与 `keep-alive`

```html
<!-- 组件切换会销毁/重建；包裹 keep-alive 后可缓存状态 -->
<keep-alive :include="['Home', 'User']" :max="10">
  <component :is="currentComponent" />
</keep-alive>

<button @click="currentComponent = 'Home'">Home</button>
<button @click="currentComponent = 'User'">User</button>
```

```js
import Home from './Home.vue'
import User from './User.vue'

export default {
  components: { Home, User },
  data() {
    return { currentComponent: 'Home' }
  }
}
```

被缓存的组件会触发 `activated` / `deactivated` 钩子，而不是 `mounted` / `destroyed`。

---

## 13. 自定义指令

```js
// 全局指令
Vue.directive('focus', {
  // Vue2 钩子：bind / inserted / update / componentUpdated / unbind
  inserted(el) {
    el.focus()
  }
})

// 带参数的指令
Vue.directive('pin', {
  inserted(el, binding) {
    el.style.position = 'fixed'
    el.style.top = binding.value + 'px'
  },
  update(el, binding) {
    el.style.top = binding.value + 'px'
  }
})
```

```html
<input v-focus>
<div v-pin:top="200">固定在顶部 200px</div>
```

指令钩子参数：

| 参数 | 说明 |
|------|------|
| `el` | 指令绑定的 DOM 元素 |
| `binding.value` | 指令表达式的值 |
| `binding.arg` | 传给指令的参数，如 `v-pin:top` |
| `binding.modifiers` | 修饰符对象，如 `v-pin.top` |

---

## 14. 混入 `mixins`

```js
// src/mixins/clickTracker.js
import bus from '../utils/bus'

export default {
  data() {
    return { trackCount: 0 }
  },
  created() {
    console.log('mixin created')
  },
  methods: {
    track(name, payload = {}) {
      this.trackCount++
      bus.$emit('track', { name, ...payload })
    }
  }
}
```

```js
// 局部混入
import clickTracker from '@/mixins/clickTracker'

export default {
  mixins: [clickTracker],
  created() {
    console.log('组件 created')
  }
}
```

```js
// 全局混入（谨慎使用，会影响每个组件）
Vue.mixin(clickTracker)
```

混入合并规则：

- `data` 冲突时组件数据优先
- 同名生命周期钩子都会调用，混入钩子先执行
- 同名方法组件优先

> 混入的缺点：来源不清晰、命名冲突、难以复用逻辑。Vue3 推荐用组合式函数（Composable）替代。

---

## 15. 过滤器（Vue2 独有）

```js
// 全局过滤器
Vue.filter('upper', value => String(value).toUpperCase())

Vue.filter('currency', (value, symbol = '¥') => {
  return symbol + Number(value).toFixed(2)
})
```

```js
// 局部过滤器
export default {
  filters: {
    pluralize(value) {
      return value === 1 ? 'item' : 'items'
    }
  }
}
```

```html
<p>{{ name | upper }}</p>
<p>{{ price | currency('$') }}</p>
<p>{{ count }} {{ count | pluralize }}</p>
```

> Vue3 已移除过滤器，改用 `computed` 或方法。

---

## 16. 异步组件

```js
// 工厂函数 + Promise（webpack 自动分包）
const AsyncComponent = () => import('./components/AsyncComponent.vue')

// 带加载状态
const AsyncWithState = () => ({
  component: import('./components/Heavy.vue'),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 5000
})

export default {
  components: {
    AsyncComponent,
    AsyncWithState
  }
}
```

---

## 17. 路由：Vue Router 3

### 17.1 安装与注册

```bash
npm install vue-router@3.6.5
```

```js
// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Home = () => import(/* webpackChunkName: "home" */ '../views/Home.vue')
const User = () => import(/* webpackChunkName: "user" */ '../views/User.vue')

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'Home', component: Home, meta: { title: '首页' } },
    {
      path: '/user/:id',
      name: 'User',
      component: User,
      props: true,          // 把 route.params 作为 props 传入组件
      meta: { requiresAuth: true }
    },
    { path: '/about', redirect: '/' },
    { path: '*', component: Home }
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 }
  }
})

export default router
```

### 17.2 在入口挂载路由

```js
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

### 17.3 声明式导航与路由出口

```html
<router-link to="/">首页</router-link>

<!-- 对象形式 -->
<router-link :to="{ name: 'User', params: { id: 42 } }">
  User 42
</router-link>

<!-- query -->
<router-link :to="{ path: '/user/1', query: { tab: 'info' } }">
  User 1
</router-link>

<!-- 路由出口 -->
<router-view />
```

### 17.4 组件中读取路由参数

```js
export default {
  props: {
    id: { type: [String, Number], required: true }
  },
  created() {
    console.log('params.id =', this.$route.params.id)
    console.log('query.tab =', this.$route.query.tab)
  },
  methods: {
    goHome() {
      this.$router.push('/')
    }
  }
}
```

### 17.5 编程式导航

```js
// 字符串
this.$router.push('/user/1')

// 对象
this.$router.push({ name: 'User', params: { id: 1 } })

// 带 query
this.$router.push({ path: '/user/1', query: { tab: 'info' } })

// 替换（不留下历史记录）
this.$router.replace('/login')

// 前进/后退
this.$router.go(-1)
this.$router.back()
this.$router.forward()
```

### 17.6 嵌套路由

```js
const router = new Router({
  routes: [
    {
      path: '/user/:id',
      component: User,
      children: [
        { path: '', component: UserHome },
        { path: 'profile', component: UserProfile },
        { path: 'posts', component: UserPosts }
      ]
    }
  ]
})
```

```html
<!-- User.vue 中必须有 router-view -->
<template>
  <div>
    <h2>User {{ $route.params.id }}</h2>
    <router-link :to="`/user/${$route.params.id}/profile`">Profile</router-link>
    <router-view />
  </div>
</template>
```

### 17.7 命名视图

```js
routes: [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      footer: AppFooter
    }
  }
]
```

```html
<router-view />
<router-view name="sidebar" />
<router-view name="footer" />
```

### 17.8 导航守卫

```js
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next({ name: 'Home', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

// 全局后置钩子（没有 next）
router.afterEach((to, from) => {
  document.title = to.meta.title || 'Vue2 App'
})

// 路由独享守卫
{
  path: '/admin',
  component: Admin,
  beforeEnter(to, from, next) {
    next()
  }
}
```

组件内守卫：

```js
export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      console.log('组件实例', vm)
    })
  },
  beforeRouteUpdate(to, from, next) {
    console.log('路由参数变化，组件复用')
    next()
  },
  beforeRouteLeave(to, from, next) {
    if (this.unsaved) {
      confirm('有未保存内容，确定离开？') ? next() : next(false)
    } else {
      next()
    }
  }
}
```

守卫解析流程：

```
导航触发 → beforeRouteLeave → beforeEach → beforeEnter
→ 组件内 beforeRouteEnter → 解析异步路由组件
→ 激活的组件 beforeRouteUpdate → afterEach → DOM 更新 → next(vm => ...)
```

### 17.9 `history` 模式注意点

- `mode: 'hash'`：URL 带 `#`，无需服务端配置
- `mode: 'history'`：URL 干净，但刷新子路径时服务端需回退到 `index.html`

Nginx 示例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 18. 状态管理：Vuex 3

### 18.1 核心概念

```
组件 → dispatch → Actions → commit → Mutations → mutate → State → render → 组件
```

| 概念 | 作用 |
|------|------|
| `State` | 单一状态树 |
| `Getters` | 从 state 派生状态，类似 computed |
| `Mutations` | 同步修改 state 的唯一入口 |
| `Actions` | 提交 mutation，可包含异步操作 |
| `Modules` | 按业务拆分状态 |

### 18.2 完整 Store 示例

```js
// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
    todos: []
  },
  getters: {
    double: state => state.count * 2,
    doneTodos: state => state.todos.filter(t => t.done)
  },
  mutations: {
    increment(state, payload = 1) {
      state.count += payload
    },
    addTodo(state, todo) {
      state.todos.push(todo)
    }
  },
  actions: {
    asyncIncrement({ commit }, { delay = 100, payload = 1 } = {}) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('increment', payload)
          resolve()
        }, delay)
      })
    }
  },
  modules: {
    user: {
      namespaced: true,
      state: {
        name: 'guest'
      },
      mutations: {
        setName(state, name) {
          state.name = name
        }
      },
      getters: {
        upper: state => state.name.toUpperCase()
      }
    }
  },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    store => {
      store.subscribe((mutation, state) => {
        console.log('[vuex]', mutation.type, state.count)
      })
    }
  ]
})
```

### 18.3 组件中使用

```js
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['count']),
    ...mapGetters(['double', 'doneTodos']),
    ...mapState('user', ['name']),
    ...mapGetters('user', ['upper'])
  },
  methods: {
    ...mapMutations(['increment']),
    ...mapMutations('user', ['setName']),
    ...mapActions(['asyncIncrement'])
  }
}
```

```html
<p>{{ count }} / {{ double }}</p>
<button @click="increment(2)">+2</button>
<button @click="asyncIncrement({ delay: 500, payload: 10 })">异步 +10</button>
```

不借助辅助函数：

```js
this.$store.commit('increment', 1)
this.$store.dispatch('asyncIncrement', { payload: 5 })
this.$store.state.count
this.$store.getters.double
```

### 18.4 状态持久化思路

Vuex 本身不持久化，刷新后会丢失。常见方案：

```js
// 手动订阅写入 localStorage
store.subscribe((mutation, state) => {
  localStorage.setItem('vuex-state', JSON.stringify({
    count: state.count,
    user: state.user
  }))
})

// 创建 store 时读取
const saved = localStorage.getItem('vuex-state')
const initialState = saved ? JSON.parse(saved) : {}
```

也可使用 `vuex-persistedstate` 插件。

---

## 19. 工程化工具：Vue CLI

### 19.1 `vue.config.js`

```js
const path = require('path')

module.exports = {
  // 部署到子路径时设置
  publicPath: process.env.NODE_ENV === 'production' ? '/admin/' : '/',

  outputDir: 'dist',

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },

  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
}
```

### 19.2 环境变量

```
.env                # 所有环境
.env.development    # 开发环境
.env.production     # 生产环境
```

```dotenv
VUE_APP_API_BASE=/api
VUE_APP_TITLE=Vue2 Demo
```

```js
console.log(process.env.VUE_APP_API_BASE)
```

> Vue CLI 中只有 `VUE_APP_` 开头的变量会被注入客户端代码。

### 19.3 打包分析

```bash
npm install --save-dev webpack-bundle-analyzer
```

```js
// vue.config.js
module.exports = {
  chainWebpack(config) {
    config.plugin('webpack-bundle-analyzer').use(
      require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    )
  }
}
```

---

## 20. HTTP 请求：Axios 封装

```bash
npm install axios
```

```js
// src/utils/request.js
import axios from 'axios'
import router from '@/router'

const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE || '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      router.push({ name: 'Home', query: { redirect: router.currentRoute.fullPath } })
    }
    return Promise.reject(error)
  }
)

export default request
```

```js
// 使用
import request from '@/utils/request'

export function getUser(id) {
  return request.get(`/users/${id}`)
}

export function createUser(data) {
  return request.post('/users', data)
}
```

---

# 第三部分：高阶篇

## 21. 响应式原理深入

### 21.1 Vue2 响应式结构

```
Observer     观察 data，递归为属性添加 getter/setter
   ↓
Dep          每个属性一个依赖管理器，收集 Watcher
   ↓
Watcher      渲染 Watcher / 用户 Watcher，数据变化时重新求值
   ↓
Scheduler    异步批量更新，nextTick 统一刷新
```

### 21.2 数组的特殊处理

Vue2 重写了数组的 7 个变异方法：

```js
const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

methods.forEach(method => {
  const original = Array.prototype[method]
  // 调用原生方法后手动 dep.notify()
})
```

因此：

```js
this.list.push(4)      // 响应
this.list.splice(0, 1) // 响应
this.list[0] = 9       // 不响应
this.list.length = 0   // 不响应
```

修复方式：

```js
this.$set(this.list, 0, 9)
this.list.splice(0)
```

### 21.3 `$set` / `$delete`

```js
// 新增属性
this.$set(this.user, 'age', 20)

// 等价于
Vue.set(this.user, 'age', 20)

// 删除属性
this.$delete(this.user, 'age')
```

### 21.4 异步更新队列与 `nextTick`

```js
this.count = 1
this.count = 2
this.count = 3

console.log(this.$el.textContent) // 仍是旧值

this.$nextTick(() => {
  console.log(this.$el.textContent) // 已经是 3
})

// Promise 写法
await this.$nextTick()
```

`nextTick` 实现核心是微任务队列：

```js
const callbacks = []

function nextTick(cb) {
  callbacks.push(cb)
  if (!pending) {
    pending = true
    Promise.resolve().then(flushCallbacks)
  }
}

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  copies.forEach(cb => cb())
}
```

---

## 22. 虚拟 DOM 与 diff

Vue2 使用双端比较的 diff 算法：

```
oldChildren: [A, B, C, D]
newChildren: [A, D, C, B]

oldStartIdx / oldEndIdx / newStartIdx / newEndIdx 四个指针向中间靠拢
依次尝试：
1. oldStart vs newStart
2. oldEnd vs newEnd
3. oldStart vs newEnd
4. oldEnd vs newStart
5. 用 key 查找复用节点
```

要点：

- `key` 是节点身份标识，没有 key 时只能按索引就地更新，容易状态错位
- 静态节点可被标记为静态，跳过 diff
- 组件更新粒度是组件级，父组件更新默认会触发子组件重新渲染；Vue2 没有类似 React `shouldComponentUpdate` 的钩子，可用 `v-if` / 稳定 `key` / `Object.freeze` / 合理拆分组件来降低无效更新

---

## 23. 性能优化清单

| 优化点 | 做法 |
|--------|------|
| 减少响应式开销 | 不需要响应式的大对象用 `Object.freeze` |
| 避免重复计算 | 用 `computed` 缓存派生值 |
| 频繁切换显示 | 用 `v-show` 代替 `v-if` |
| 列表渲染 | 提供稳定 `key`，避免用 `index` |
| 长列表 | 虚拟滚动（如 `vue-virtual-scroller`） |
| 组件缓存 | `keep-alive` + `include` |
| 静态内容 | `v-once` |
| 事件清理 | `beforeDestroy` 中移除定时器、全局事件 |
| 路由拆分 | 路由懒加载 `() => import(...)` |
| 构建优化 | `webpack-bundle-analyzer` 定位大依赖 |

```js
export default {
  data() {
    return {
      // 大字典不需要响应式
      cityDict: Object.freeze({ 'BJ': '北京', 'SH': '上海' })
    }
  }
}
```

```html
<!-- 只渲染一次 -->
<div v-once>{{ immutableContent }}</div>
```

---

## 24. Vue 2.7 的 Composition API 兼容写法

Vue 2.7 回移植了 Composition API 和 `<script setup>`，但底层仍是 getter/setter 响应式。

### 24.1 `setup()` 写法

```vue
<template>
  <div>
    <p>count = {{ count }} double = {{ double }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)

    function increment() {
      count.value += 1
    }

    return { count, double, increment }
  }
}
</script>
```

### 24.2 `<script setup>` 写法（Vue 2.7 支持）

```vue
<template>
  <p>setup count = {{ count }} double = {{ double }}</p>
  <button @click="increment">+1</button>
</template>

<script setup>
import { computed, ref } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

function increment() {
  count.value += 1
}
</script>
```

### 24.3 与 Vue3 的重要行为差异

| 差异 | Vue 2.7 | Vue3 |
|------|---------|------|
| 响应式实现 | `Object.defineProperty`，直接转换原对象 | `Proxy`，返回代理对象 |
| `reactive(foo) === foo` | `true` | `false` |
| 新增属性 | 仍需 `$set` | 直接赋值即可响应 |
| 数组下标赋值 | 不响应 | 响应 |
| `createApp()` | 不支持 | 支持 |
| `<script setup>` 顶层 `await` | 不支持 | 支持（配合 `Suspense`） |
| `expose` 选项 | 不支持（`<script setup>` 中 `defineExpose` 可用） | 支持 |

---

## 25. 常见坑与最佳实践

### 25.1 常见坑

```js
// ❌ 初始化后直接新增属性，不响应
this.user.age = 20

// ✅
this.$set(this.user, 'age', 20)

// ❌ 数组下标赋值，不响应
this.items[0] = newItem

// ✅
this.$set(this.items, 0, newItem)
// 或
this.items.splice(0, 1, newItem)

// ❌ 在 created 中访问 DOM
created() {
  this.$el // undefined
}

// ✅ mounted 之后访问
```

### 25.2 最佳实践

- 组件名使用多单词，避免与 HTML 标签冲突
- `props` 尽量声明类型和默认值
- `data` 始终返回新对象
- 组件销毁前清理定时器、事件总线监听、第三方实例
- 路由参数变化且组件复用时，用 `beforeRouteUpdate` 或 `watch $route`
- Vuex 中异步操作放 `actions`，同步修改放 `mutations`
- 老项目逐步迁移时，可在局部组件先使用 Vue 2.7 Composition API

---

## 26. 自测题

1. `v-if` 与 `v-show` 的区别是什么？分别适合什么场景？
2. 为什么组件中的 `data` 必须是函数？
3. Vue2 中给对象新增属性为什么不响应？如何解决？
4. `computed` 与 `watch` 分别适合什么场景？
5. Vue Router 3 中 `params` 与 `query` 分别对应 URL 的哪一部分？
6. Vuex 中为什么必须在 `mutations` 中修改状态，而不能在 `actions` 中直接改？
7. `provide/inject` 是响应式的吗？如何让它具备响应性？
8. Vue2 的事件总线为什么要在 `beforeDestroy` 中 `$off`？
9. `keep-alive` 缓存的组件会触发哪些生命周期钩子？
10. Vue 2.7 相比 Vue3 响应式有哪些关键限制？

<details>
<summary>参考答案</summary>

1. `v-if` 销毁/重建 DOM，切换开销大、初始开销小；`v-show` 切换 `display`，初始渲染开销大、切换开销小。
2. 保证每个组件实例拥有独立数据对象，避免多实例共享同一对象。
3. `Object.defineProperty` 只能拦截已存在属性；用 `this.$set` / `Vue.set`。
4. `computed` 适合派生值且有缓存；`watch` 适合数据变化后执行异步/副作用。
5. `params` 对应路径段（如 `/user/1` 中的 `1`），`query` 对应 `?tab=info`。
6. 为了保持状态变更可追踪、可被 Devtools 记录，并强制同步修改。
7. 默认不是；传入对象/响应式对象或计算属性包装对象。
8. 避免组件销毁后仍持有监听导致内存泄漏与重复执行。
9. `activated` / `deactivated`。
10. 不能监听新增属性与数组下标、不支持 Proxy、`createApp`、顶层 await 等。

</details>

---

## 27. 验证说明

本文示例在本地按以下方式验证：

| 验证项 | 结果 |
|--------|------|
| Vue 2.7.16 + Vue Router 3.6.5 + Vuex 3.6.2 + Vue CLI 5.0.9 | `npm run build` 生产构建成功 |
| `new Vue()` 入口、`Vue.use`、`Vue.directive`、`Vue.filter` | 编译通过 |
| 路由：`mode: history`、动态路由、守卫、懒加载、`scrollBehavior` | 编译通过 |
| Vuex：`state/getters/mutations/actions/modules/plugins` | 编译通过 |
| 作用域插槽、`v-model`、事件总线、全局 mixin、`provide/inject` | 编译通过 |
| Vue 2.7 `<script setup>` | 编译通过 |

> 构建时 Vue CLI 5 在 Node 22 下会输出一条 `scoped style` 的非阻断性 css-loader 警告，不影响产物生成。

下一篇：[Vue3 系统学习文档](./Vue3.md) 中专门对比了 Vue3 与 Vue2 的差异。
