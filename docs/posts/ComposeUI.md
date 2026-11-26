---
title: ComposeUI
date: 2022-07-28
categories: [前端]
tags: [Jetpack Compose, Compose UI, Android, Kotlin, Material 3]
description: Jetpack Compose 学习笔记，涵盖声明式 UI、状态管理、布局与 Modifier、列表动画、导航、架构与性能优化。
coverImg: /images/cover/ComposeUI.png
permalink: /posts/compose-ui
---

# ComposeUI 系统学习文档

> 从入门到进阶再到高阶，覆盖 Jetpack Compose 的核心思想、常用组件、状态与副作用、列表、动画、导航、性能优化与工程化实践。
> 本文主线是 **Android 平台 Jetpack Compose**，核心 UI 代码在 **Compose Multiplatform** 中大多可以复用；跨平台差异在第 12 章单独说明。

## 阅读说明与验证环境

本文示例基于以下本机真实环境编写并验证：

| 组件 | 版本 |
|------|------|
| JDK | 17.0.13 |
| Gradle | 8.7 |
| Android Gradle Plugin | 8.5.2 |
| Kotlin | 2.0.20 |
| Compose Compiler Plugin | 2.0.20 |
| Compose BOM | 2024.09.00 |
| Compose UI / Foundation / Animation | 1.7.0 |
| Material 3 | 1.3.0 |
| activity-compose | 1.9.2 |
| navigation-compose | 2.8.0 |
| lifecycle-compose | 2.8.4 |

验证方式：

- 搭建临时 Android 工程，把本文绝大多数示例集中到一个 `MainActivity.kt`；
- 执行 `compileDebugKotlin`：**BUILD SUCCESSFUL**；
- 执行 `assembleDebug`：**BUILD SUCCESSFUL**，产出 `app-debug.apk`（约 9.6 MB）；
- 未启动模拟器或真机，因此**界面交互效果、UI 测试运行、Compose Multiplatform 片段未做运行时验证**，相关章节会明确标注。

> 版本提示：Compose 从 Kotlin 2.0 起改用 `org.jetbrains.kotlin.plugin.compose`，不再单独写 `composeOptions { kotlinCompilerExtensionVersion }`。如果你使用更老的 Kotlin 1.9 工具链，配置方式会不同。

---

# 一、基础篇

## 1. 什么是 Jetpack Compose

Jetpack Compose 是 Android 官方的**声明式 UI 工具包**。你不再写 XML 布局再在代码里 `findViewById`，而是用 Kotlin 函数描述"界面长什么样"，当状态变化时，Compose 自动更新界面。

### 1.1 命令式 UI 与声明式 UI

传统 Android 开发：

```kotlin
// 命令式：先找到 View，再手动改属性
val textView = findViewById<TextView>(R.id.title)
val button = findViewById<Button>(R.id.button)

button.setOnClickListener {
    textView.text = "点击了 ${count++} 次"
}
```

Compose：

```kotlin
@Composable
fun CounterDemo() {
    var count by remember { mutableIntStateOf(0) }

    Button(onClick = { count++ }) {
        Text("点击了 $count 次")
    }
}
```

区别：

- 命令式：你告诉系统"怎么改"；
- 声明式：你告诉系统"当前状态对应的界面是什么"；
- 状态变化时，Compose 重新执行相关可组合函数，这个过程叫**重组（Recomposition）**。

### 1.2 Compose 的核心概念

| 概念 | 说明 |
|------|------|
| `@Composable` | 标记一个函数可以生成 UI |
| 重组 | 状态变化后重新执行可组合函数并更新界面 |
| `remember` | 在重组之间保存值 |
| `mutableStateOf` | 创建可观察状态，变化时触发重组 |
| 状态提升 | 把状态放到调用方，让组件更可复用、可测试 |
| `Modifier` | 描述组件的尺寸、布局、绘制、交互等属性 |
| 副作用 | 在组合之外做事，例如弹 Snackbar、请求数据、埋点 |

---

## 2. 环境搭建

### 2.1 根工程 `build.gradle.kts`

```kotlin
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20" apply false
}
```

### 2.2 App 模块 `app/build.gradle.kts`

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.example.composeprobe"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.composeprobe"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")

    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.navigation:navigation-compose:2.8.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.4")

    debugImplementation("androidx.compose.ui:ui-tooling")
}
```

### 2.3 `gradle.properties`

```properties
android.useAndroidX=true
android.enableJetifier=false
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
kotlin.code.style=official
```

> 如果漏掉 `android.useAndroidX=true`，构建会报 `Configuration ':app:debugRuntimeClasspath' contains AndroidX dependencies...`，这是 Compose 项目最常见的起步错误之一。

---

## 3. 第一个 Compose 应用

### 3.1 Activity 入口

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ComposeTheme {
                Greeting("Compose")
            }
        }
    }
}
```

`setContent` 是连接传统 Android 世界和 Compose 世界的桥梁，它把一个可组合函数设置为 Activity 的内容视图。

### 3.2 第一个可组合函数

```kotlin
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello, $name!",
        fontSize = 24.sp,
        fontWeight = FontWeight.Bold
    )
}
```

可组合函数的规则：

1. 必须加 `@Composable`；
2. 命名首字母大写，像组件一样使用；
3. 通常返回 `Unit`，不要返回 UI 对象；
4. 可以在其他可组合函数里像普通函数一样调用；
5. 同一个函数会在初始组合和后续重组中多次执行。

### 3.3 预览

```kotlin
@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    ComposeTheme {
        Greeting("Android")
    }
}
```

预览只在 Android Studio 的 Compose Preview 中生效，不参与 APK 运行逻辑。

---

## 4. 常用基础组件

下面这些组件在 Material 3 中都有对应实现。

```kotlin
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import androidx.compose.ui.unit.dp

@Composable
fun BasicComponentsDemo() {
    var checked by remember { mutableStateOf(false) }
    var switched by remember { mutableStateOf(true) }
    var text by remember { mutableStateOf("") }

    Column {
        Text("文本组件")
        Button(onClick = { checked = !checked }) {
            Text("按钮")
        }
        Checkbox(checked = checked, onCheckedChange = { checked = it })
        Switch(checked = switched, onCheckedChange = { switched = it })
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("请输入") }
        )
    }
}
```

常用分类：

| 分类 | 组件 |
|------|------|
| 文本 | `Text` |
| 按钮 | `Button`、`TextButton`、`IconButton`、`FloatingActionButton` |
| 选择 | `Checkbox`、`RadioButton`、`Switch` |
| 输入 | `TextField`、`OutlinedTextField` |
| 容器 | `Box`、`Surface`、`Card` |
| 进度 | `LinearProgressIndicator`、`CircularProgressIndicator` |
| 弹层 | `AlertDialog`、`Snackbar`、`DropdownMenu` |
| 顶部/底部栏 | `TopAppBar`、`NavigationBar` |

---

## 5. 布局系统

Compose 的布局主要由三个基础组件完成：`Column`、`Row`、`Box`。

### 5.1 Column：纵向排列

```kotlin
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ColumnDemo() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("第一行")
        Text("第二行")
        Text("第三行")
    }
}
```

### 5.2 Row：横向排列与权重

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.background
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun RowWeightDemo() {
    Row(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .weight(1f)
                .height(40.dp)
                .background(Color(0xFFFFCDD2))
        )
        Box(
            modifier = Modifier
                .weight(2f)
                .height(40.dp)
                .background(Color(0xFFBBDEFB))
        )
    }
}
```

`weight` 只能在 `RowScope` 或 `ColumnScope` 中使用，它会先测量其他子组件，再按权重分配剩余空间。

### 5.3 Box：层叠布局

```kotlin
@Composable
fun BoxDemo() {
    Box(
        modifier = Modifier.size(120.dp),
        contentAlignment = Alignment.Center
    ) {
        Text("居中文字")
    }
}
```

`Box` 常用于：

- 在一个区域上叠加多个元素；
- 列表项右上角放角标；
- 加载态覆盖在内容之上。

### 5.4 约束与尺寸

常用尺寸 Modifier：

| Modifier | 作用 |
|----------|------|
| `size(100.dp)` | 宽高固定 |
| `width(100.dp)` / `height(60.dp)` | 单独设置宽/高 |
| `fillMaxSize()` | 占满父容器 |
| `fillMaxWidth()` / `fillMaxHeight()` | 占满某个方向 |
| `wrapContentSize()` | 按内容尺寸 |
| `padding(16.dp)` | 内边距/外边距，取决于调用位置 |
| `offset(x = 8.dp, y = 4.dp)` | 偏移绘制位置 |

---

## 6. Modifier 详解

`Modifier` 是 Compose 里最容易"看似简单、实则暗藏细节"的部分。

### 6.1 链式调用

```kotlin
Box(
    modifier = Modifier
        .size(100.dp)
        .padding(16.dp)
        .background(Color.Red)
)
```

### 6.2 顺序很重要

下面两个例子的视觉效果不同：

```kotlin
@Composable
fun ModifierOrderDemo() {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        // 先设尺寸，再 padding，再背景：红色只占外层 80dp 区域，蓝色在内部 48dp
        Box(
            modifier = Modifier
                .size(80.dp)
                .background(Color.Red)
                .padding(16.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color.Blue)
        )

        // 先 padding，再设尺寸：总尺寸是 48 + 32 = 80dp 的视觉位置不同
        Box(
            modifier = Modifier
                .padding(16.dp)
                .size(80.dp)
                .background(Color.Green)
        )
    }
}
```

经验规则：

- `padding` 在 `background` 之前：背景覆盖 padding 区域；
- `padding` 在 `background` 之后：padding 区域透明；
- `clip` 之后的绘制才会被裁剪；
- `clickable` 的顺序会影响点击区域。

### 6.3 点击与交互状态

```kotlin
@Composable
fun InteractionDemo() {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val color by animateColorAsState(
        targetValue = if (pressed) Color.Red else Color.Blue,
        label = "pressedColor"
    )

    Box(
        modifier = Modifier
            .size(80.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(color)
            .clickable(interactionSource = interactionSource, indication = null) { }
    )
}
```

`indication = null` 表示不使用系统默认 ripple。实际项目中建议保留默认 `indication`，除非你要完全自定义反馈效果。

---

## 7. 状态管理基础

### 7.1 remember 与 mutableStateOf

```kotlin
@Composable
fun CounterDemo() {
    var count by remember { mutableIntStateOf(0) }

    Button(onClick = { count++ }) {
        Text("Count = $count")
    }
}
```

- `mutableStateOf(0)` 创建可观察状态；
- `remember` 让状态在重组之间保留；
- `by` 委托让代码更简洁，需要 `getValue` / `setValue` 导入；
- 状态变化时，读取它的组件会重组。

### 7.2 remember 不等于保存一切

`remember` 只在组件留在组合中时保留值。以下情况会丢失：

- 屏幕旋转导致 Activity 重建；
- 进程被系统回收；
- 组件从界面上移除后又重新进入组合。

### 7.3 rememberSaveable

```kotlin
@Composable
fun StatefulCounter() {
    var count by rememberSaveable { mutableIntStateOf(0) }
    StatelessCounter(count = count, onIncrement = { count++ })
}

@Composable
fun StatelessCounter(count: Int, onIncrement: () -> Unit) {
    Button(onClick = onIncrement) {
        Text("Saved count = $count")
    }
}
```

`rememberSaveable` 会把值保存到 `Bundle`，适合简单类型。复杂对象需要自定义 `Saver`。

### 7.4 状态提升

上面的 `StatelessCounter` 就是状态提升的例子：

- 状态放在 `StatefulCounter`；
- 展示和回调传给 `StatelessCounter`；
- 子组件不持有状态，只依赖输入参数。

好处：

1. 组件可复用；
2. 容易预览和测试；
3. 状态来源清晰，符合单向数据流。

---

## 8. 列表基础

### 8.1 LazyColumn

`LazyColumn` 只组合并绘制可见项，适合长列表。

```kotlin
@Composable
fun SimpleList(items: List<String>) {
    LazyColumn {
        items(items) { item ->
            Text(item, modifier = Modifier.padding(16.dp))
        }
    }
}
```

### 8.2 key 与 contentType

```kotlin
@Composable
fun KeyedList(items: List<String>) {
    LazyColumn {
        items(
            items = items,
            key = { it },
            contentType = { "text" }
        ) { item ->
            Text(item, modifier = Modifier.padding(16.dp))
        }
    }
}
```

- `key` 帮助 Compose 识别"哪一项移动了"，避免错误复用；
- `contentType` 帮助 Compose 对不同类型项做复用优化。

### 8.3 stickyHeader

```kotlin
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun StickyHeaderList() {
    LazyColumn {
        stickyHeader {
            Text(
                "Sticky header",
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(12.dp)
            )
        }
        itemsIndexed(List(30) { "Item $it" }) { index, item ->
            Text("$index - $item", modifier = Modifier.padding(16.dp))
        }
    }
}
```

> 在 Compose 1.7.0 中，`stickyHeader` 与 `LazyVerticalGrid` 属于实验 API，需要 `@OptIn(ExperimentalFoundationApi::class)`。`stickyHeader` 是 `LazyListScope` 的成员，不需要单独 import。

### 8.4 LazyRow 与 LazyVerticalGrid

```kotlin
@Composable
fun LazyRowDemo() {
    LazyRow {
        items(10) { index ->
            Text("Chip $index", modifier = Modifier.padding(16.dp))
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun GridDemo() {
    LazyVerticalGrid(columns = GridCells.Fixed(2)) {
        // items(Int) 是 LazyGridScope 成员，不需要额外 import
        items(12) { index ->
            Text("Cell $index", modifier = Modifier.padding(16.dp))
        }
    }
}
```

---

## 9. 主题与 Material 3

### 9.1 定义主题

```kotlin
@Composable
fun ComposeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = MaterialTheme.colorScheme.copy(
            primary = Color(0xFF6750A4)
        ),
        content = content
    )
}
```

### 9.2 使用主题颜色与排版

```kotlin
@Composable
fun ThemedText() {
    Text(
        text = "主题文字",
        color = MaterialTheme.colorScheme.primary,
        style = MaterialTheme.typography.titleLarge
    )
}
```

Material 3 主题包含：

- `ColorScheme`：主色、次色、背景、错误色等；
- `Typography`：标题、正文、标签等文本样式；
- `Shapes`：圆角形状；
- 动态取色：Android 12+ 可根据壁纸生成配色，本文示例未启用。

### 9.3 Scaffold 页面骨架

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScaffoldDemo() {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("标题") })
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = true,
                    onClick = {},
                    icon = { Text("H") },
                    label = { Text("首页") }
                )
            }
        }
    ) { innerPadding ->
        Text("内容区", modifier = Modifier.padding(innerPadding))
    }
}
```

`Scaffold` 提供的 `innerPadding` 必须应用到内容上，否则内容会被 TopAppBar 遮挡。

---

# 二、进阶篇

## 10. 重组与 Compose 运行原理

理解重组，是写好 Compose 的关键。

### 10.1 三个阶段

| 阶段 | 说明 |
|------|------|
| 组合 Composition | Compose 执行可组合函数，生成 UI 树 |
| 重组 Recomposition | 状态变化后重新执行相关函数，更新 UI 树 |
| 销毁 Disposal | 组件离开界面，清理副作用 |

### 10.2 智能重组

Compose 会尽量只重新执行"读取了变化状态"的函数：

```kotlin
@Composable
fun Parent() {
    var count by remember { mutableIntStateOf(0) }

    Header()          // 不读取 count，通常不会因 count 变化而重组
    Counter(count)    // 读取 count，会重组
}

@Composable
fun Header() {
    Text("固定标题")
}

@Composable
fun Counter(count: Int) {
    Text("Count = $count")
}
```

### 10.3 不要依赖执行次数

可组合函数可能执行多次、乱序执行，甚至被并行执行。像这样写是危险的：

```kotlin
@Composable
fun BadSideEffect() {
    // 错误：每次重组都会 executed，可能重复上报
    analytics.log("screen_show")
    Text("页面")
}
```

正确做法是使用副作用 API：

```kotlin
@Composable
fun GoodSideEffect() {
    LaunchedEffect(Unit) {
        analytics.log("screen_show")
    }
    Text("页面")
}
```

---

## 11. 状态管理进阶

### 11.1 derivedStateOf

当你需要从多个状态中派生一个值，且希望减少重组时，可以使用 `derivedStateOf`。

```kotlin
@Composable
fun DerivedStateDemo(items: List<String>) {
    var query by remember { mutableStateOf("") }
    val filtered by remember {
        derivedStateOf { items.filter { it.contains(query, ignoreCase = true) } }
    }

    OutlinedTextField(value = query, onValueChange = { query = it }, label = { Text("Search") })
    Text("Matched: ${filtered.size}")
}
```

注意：

- `derivedStateOf` 内部必须读取状态；
- 不要用它包装普通纯函数，否则没有意义；
- 它适合"状态变化频繁，但派生结果变化不频繁"的场景。

### 11.2 rememberUpdatedState

当 Effect 的 key 不应随回调变化，但你又想拿到最新回调时使用。

```kotlin
@Composable
fun RememberUpdatedStateDemo(onDone: () -> Unit) {
    val currentOnDone by rememberUpdatedState(newValue = onDone)

    LaunchedEffect(Unit) {
        delay(1000)
        currentOnDone()
    }
}
```

如果直接在 `LaunchedEffect(Unit)` 里调用 `onDone`，它捕获的是第一次组合时的旧 lambda；`rememberUpdatedState` 可以始终拿到最新值。

### 11.3 滚动状态派生

```kotlin
@Composable
fun ScrollToTopDemo() {
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    Box {
        LazyColumn(state = listState) {
            items(50) { Text("Item $it", modifier = Modifier.padding(16.dp)) }
        }
        if (showScrollToTop) {
            Button(
                onClick = { scope.launch { listState.animateScrollToItem(0) } },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
            ) {
                Text("Top")
            }
        }
    }
}
```

---

## 12. 副作用 API

副作用用于连接 Compose 世界和外部世界。

### 12.1 LaunchedEffect

在组合内启动协程，key 变化时取消旧协程并重新启动。

```kotlin
@Composable
fun LoadData(userId: String, viewModel: UserViewModel) {
    LaunchedEffect(userId) {
        viewModel.load(userId)
    }
}
```

### 12.2 rememberCoroutineScope

在可组合函数里拿到协程作用域，用于点击事件中启动协程。

```kotlin
@Composable
fun SnackbarDemo() {
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    Button(onClick = {
        scope.launch { snackbarHostState.showSnackbar("已保存") }
    }) {
        Text("保存")
    }
    SnackbarHost(hostState = snackbarHostState)
}
```

### 12.3 DisposableEffect

需要清理资源的副作用，必须提供 `onDispose`。

```kotlin
@Composable
fun LifecycleAwareEffect() {
    DisposableEffect(Unit) {
        val listener = object : SomeListener {
            override fun onEvent() {}
        }
        register(listener)
        onDispose { unregister(listener) }
    }
}
```

### 12.4 SideEffect

每次成功重组后同步外部对象。

```kotlin
@Composable
fun SyncAnalytics(screenName: String) {
    SideEffect {
        analytics.setCurrentScreen(screenName)
    }
}
```

### 12.5 produceState

把外部数据源转换成 Compose State。

```kotlin
@Composable
fun ProduceStateDemo(): State<Int> = produceState(initialValue = 0) {
    delay(300)
    value = 42
}
```

### 12.6 snapshotFlow

把 State 变化转成 Flow。

```kotlin
@Composable
fun ScrollMonitor(listState: LazyListState) {
    LaunchedEffect(listState) {
        snapshotFlow { listState.firstVisibleItemScrollOffset }
            .collect { offset ->
                if (offset > 1000) {
                    // 埋点或触发加载更多
                }
            }
    }
}
```

---

## 13. ViewModel 与单向数据流

### 13.1 UiState 建模

```kotlin
data class CounterUiState(
    val count: Int = 0,
    val loading: Boolean = false
)
```

### 13.2 ViewModel

```kotlin
class CounterViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(CounterUiState())
    val uiState: StateFlow<CounterUiState> = _uiState.asStateFlow()

    fun increment() {
        _uiState.value = _uiState.value.copy(
            count = _uiState.value.count + 1
        )
    }

    fun toggleLoading() {
        _uiState.value = _uiState.value.copy(
            loading = !_uiState.value.loading
        )
    }
}
```

### 13.3 页面订阅状态

```kotlin
@Composable
fun ViewModelDemo(viewModel: CounterViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("ViewModel count = ${uiState.count}")
        Button(onClick = { viewModel.increment() }) { Text("Increment") }
        Button(onClick = { viewModel.toggleLoading() }) { Text("Toggle loading") }
        if (uiState.loading) {
            CircularProgressIndicator()
        }
    }
}
```

`collectAsStateWithLifecycle()` 比普通的 `collectAsState()` 更适合 Android：生命周期处于后台时会暂停收集，节省资源。

### 13.4 单向数据流

```text
用户操作 → 事件（Event）→ ViewModel 处理 → 新 UiState → Compose 重组显示
```

原则：

- 状态只从 ViewModel 流向 UI；
- UI 不直接修改状态，只发送事件；
- UiState 用不可变 `data class` 建模；
- 一个页面对应一个 UiState，比散落的多个 State 更好维护。

---

## 14. 导航 Navigation Compose

### 14.1 基本 NavHost

```kotlin
@Composable
fun NavigationDemo(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            Button(onClick = { navController.navigate("detail/42") }) {
                Text("Go detail")
            }
        }
        composable(
            route = "detail/{id}",
            arguments = listOf(navArgument("id") { type = NavType.IntType })
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getInt("id") ?: 0
            Text("Detail id = $id")
        }
    }
}
```

### 14.2 常用操作

```kotlin
navController.navigate("detail/42")          // 跳转
navController.popBackStack()                 // 返回
navController.navigate("home") {
    popUpTo("home") { inclusive = true }     // 清空中间页面
    launchSingleTop = true                   // 避免重复入栈
}
```

### 14.3 返回键

```kotlin
@Composable
fun BackHandlerDemo() {
    BackHandler(enabled = true) {
        // 弹确认框、关闭弹层或返回上一页
    }
    Text("Back press handled")
}
```

---

## 15. 动画

### 15.1 animate*AsState

值变化时自动做动画。

```kotlin
@Composable
fun AnimationDemos() {
    var expanded by remember { mutableStateOf(false) }
    val size by animateDpAsState(
        targetValue = if (expanded) 160.dp else 80.dp,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "size"
    )
    val alpha by animateFloatAsState(
        targetValue = if (expanded) 1f else 0.5f,
        label = "alpha"
    )
    val color by animateColorAsState(
        targetValue = if (expanded) Color.Red else Color.Blue,
        label = "color"
    )

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = { expanded = !expanded }) { Text("Toggle") }
        Box(
            modifier = Modifier
                .size(size)
                .graphicsLayer(alpha = alpha)
                .background(color)
        )
    }
}
```

> 包路径提示：`animateDpAsState` / `animateFloatAsState` 在 `androidx.compose.animation.core`；`animateColorAsState` 在 `androidx.compose.animation`。这是 Compose 1.7.0 实测结果。

### 15.2 AnimatedVisibility 与 Crossfade

```kotlin
AnimatedVisibility(visible = expanded) {
    Text("Visible now")
}

Crossfade(targetState = expanded, label = "state") { state ->
    Text(if (state) "ON" else "OFF")
}
```

### 15.3 animateContentSize

内容尺寸变化时平滑过渡。

```kotlin
Column(modifier = Modifier.animateContentSize()) {
    Text(
        text = if (expanded) "这是一段比较长的说明文字，用于演示内容高度平滑变化。" else "Short",
        maxLines = if (expanded) Int.MAX_VALUE else 1
    )
}
```

### 15.4 Transition 统一驱动多个动画

```kotlin
@Composable
fun TransitionDemo() {
    var selected by remember { mutableStateOf(false) }
    val transition = updateTransition(targetState = selected, label = "selection")
    val animationWidth by transition.animateDp(label = "width") { active ->
        if (active) 200.dp else 100.dp
    }
    val backgroundColor by transition.animateColor(label = "background") { active ->
        if (active) Color(0xFFEF5350) else Color.Gray
    }

    Box(
        modifier = Modifier
            .width(animationWidth)
            .height(40.dp)
            .background(backgroundColor)
    )
}
```

### 15.5 Animatable

需要手动控制动画过程时使用。

```kotlin
@Composable
fun AnimatableDemo() {
    val rotation = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        rotation.animateTo(
            targetValue = 360f,
            animationSpec = infiniteRepeatable(tween(2000), RepeatMode.Restart)
        )
    }

    Box(
        modifier = Modifier
            .size(80.dp)
            .graphicsLayer { rotationZ = rotation.value }
            .background(Color.Green)
    )
}
```

---

## 16. 手势与交互

### 16.1 点击、长按、双击

```kotlin
Box(
    modifier = Modifier
        .size(80.dp)
        .background(Color.Yellow)
        .pointerInput(Unit) {
            detectTapGestures(
                onTap = { offset -> },
                onDoubleTap = { offset -> },
                onLongPress = { offset -> }
            )
        }
)
```

### 16.2 拖拽

```kotlin
@Composable
fun GestureDemo() {
    var offsetX by remember { mutableStateOf(0f) }

    Box(
        modifier = Modifier
            .offset(x = offsetX.dp)
            .size(60.dp)
            .background(Color.Magenta)
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    offsetX += dragAmount.x
                }
            }
    )
}
```

### 16.3 滚动

```kotlin
@Composable
fun ScrollDemo() {
    val scrollState = rememberScrollState()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
    ) {
        repeat(50) { Text("Line $it", modifier = Modifier.padding(8.dp)) }
    }
}
```

> 不要在同一个方向嵌套 `verticalScroll` 和 `LazyColumn`，否则会抛出嵌套滚动冲突异常。长列表只用 `LazyColumn`。

---

## 17. 自定义布局与绘制

### 17.1 自定义 Layout

```kotlin
@Composable
fun CustomLayoutDemo() {
    Layout(
        content = {
            Text("First")
            Text("Second")
        }
    ) { measurables, constraints ->
        val placeables = measurables.map { it.measure(constraints) }
        val width = placeables.maxOfOrNull { it.width }
            ?.coerceAtMost(constraints.maxWidth) ?: 0
        val height = placeables.sumOf { it.height }

        layout(width, height) {
            var y = 0
            placeables.forEach { placeable ->
                placeable.placeRelative(0, y)
                y += placeable.height
            }
        }
    }
}
```

自定义布局分两步：

1. `measure`：测量子项；
2. `layout`：放置子项，并确定自身尺寸。

### 17.2 Canvas 绘制

```kotlin
@Composable
fun DrawDemo() {
    Canvas(modifier = Modifier.size(120.dp)) {
        drawCircle(color = Color(0xFFFF5722), radius = size.minDimension / 3)
        drawLine(
            color = Color.White,
            start = Offset(0f, 0f),
            end = Offset(size.width, size.height),
            strokeWidth = 4f
        )
    }
}
```

### 17.3 drawBehind

```kotlin
Box(
    modifier = Modifier
        .size(80.dp)
        .drawBehind { drawRect(color = Color.Cyan) }
)
```

---

## 18. 文本输入与焦点

```kotlin
@Composable
fun TextFieldDemo() {
    var text by remember { mutableStateOf(TextFieldValue("")) }
    val keyboardController = LocalSoftwareKeyboardController.current
    val focusRequester = remember { FocusRequester() }

    OutlinedTextField(
        value = text,
        onValueChange = { text = it },
        label = { Text("Email") },
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Email,
            imeAction = ImeAction.Done
        ),
        keyboardActions = KeyboardActions(
            onDone = { keyboardController?.hide() }
        ),
        modifier = Modifier.focusRequester(focusRequester)
    )

    Button(onClick = { focusRequester.requestFocus() }) {
        Text("Focus input")
    }
}
```

常用能力：

- `KeyboardOptions`：键盘类型、Ime 动作；
- `KeyboardActions`：监听 Done / Search / Next；
- `FocusRequester`：主动请求焦点；
- `TextFieldValue`：可控制光标和选区。

---

## 19. 与 View 体系互操作

### 19.1 在 Compose 中使用原生 View

```kotlin
@Composable
fun InteropDemo() {
    val context = LocalContext.current

    AndroidView(
        factory = { ctx ->
            TextView(ctx).apply { text = "Native TextView" }
        },
        update = { view ->
            view.text = "Updated by Compose"
        }
    )

    Button(onClick = {
        Toast.makeText(context, "Hello from Compose", Toast.LENGTH_SHORT).show()
    }) {
        Text("Toast")
    }
}
```

### 19.2 迁移策略

推荐渐进式迁移：

1. 在现有 Fragment 中用 `ComposeView` 嵌入小模块；
2. 把独立页面整体替换成 Compose；
3. 用 Navigation Compose 管理纯 Compose 页面；
4. 最后移除 XML 布局与旧 Fragment。

互操作时注意：

- Compose 与 View 的生命周期要对齐；
- `AndroidView` 的 `factory` 只创建一次，`update` 会随重组执行；
- 不要在 `factory` 中读取频繁变化的 State。

---

# 三、高阶篇

## 20. 稳定性与性能优化

### 20.1 为什么会发生不必要重组

Compose 会检查可组合函数的参数是否"稳定"。不稳定参数会让 Compose 无法跳过重组。

常见不稳定来源：

- 普通 `MutableList` / `ArrayList`；
- 可变类；
- 未标注稳定的自定义类；
- lambda 捕获了不稳定对象。

### 20.2 @Stable 与 @Immutable

```kotlin
@Stable
data class User(val name: String)

@Immutable
data class Config(val enableDarkMode: Boolean)
```

- `@Immutable`：属性全部不可变，且对象构造后永不变化；
- `@Stable`：对象可能变化，但变化时会通知 Compose。

### 20.3 使用不可变集合

```kotlin
@Composable
fun UserList(users: List<User>) {
    LazyColumn {
        items(users, key = { it.name }) { user ->
            Text(user.name)
        }
    }
}
```

调用方尽量传 `listOf(...)` 或 `snapshotStateListOf(...)`，避免频繁传入可变的 `ArrayList`。

### 20.4 延迟读取状态

```kotlin
@Composable
fun DeferredReadDemo(showDetail: Boolean, detail: String) {
    Button(onClick = { }) {
        Text("Button")
    }
    if (showDetail) {
        Text(detail)
    }
}
```

如果 `detail` 变化很频繁而 `showDetail == false`，把读取放到 `if` 内部可以避免整个函数因 `detail` 变化而重组。

### 20.5 性能检查手段

- Layout Inspector 查看重组次数；
- Compose Compiler Metrics 检查 skippable 比例；
- Baseline Profile 改善首次启动与滚动流畅度；
- 用 `key` / `contentType` 优化 Lazy 列表；
- 避免在组合函数里创建大量临时对象。

---

## 21. 快照状态集合

Compose 提供可观察集合，修改后会自动触发重组。

```kotlin
@Composable
fun SnapshotStateDemo() {
    val names = remember { mutableStateListOf<String>() }
    val metadata = remember { mutableStateMapOf<String, Int>() }

    Button(onClick = {
        names.add("User ${names.size}")
        metadata[names.last()] = names.size
    }) {
        Text("Add user")
    }

    Text(names.joinToString())
}
```

类似 API：

- `mutableStateListOf`
- `mutableStateMapOf`
- `mutableStateSetOf`（实验 API）
- `SnapshotStateList` / `SnapshotStateMap`

注意：快照集合只解决"可观察性"，不等于性能优化。大列表仍应使用 `LazyColumn`。

---

## 22. CompositionLocal 与设计系统

### 22.1 定义与提供

```kotlin
@Stable
data class User(val name: String)

val LocalUser = compositionLocalOf<User> {
    error("No User provided")
}

@Composable
fun CompositionLocalDemo() {
    CompositionLocalProvider(LocalUser provides User("Alice")) {
        Text("Hello, ${LocalUser.current.name}")
    }
}
```

### 22.2 适用场景

`CompositionLocal` 适合"跨多层组件传递、但变化不频繁"的值：

- 主题颜色、字体、形状；
- 当前用户；
- 语言 / 区域设置；
- 导航控制器；
- 依赖容器。

不适合：

- 高频变化状态；
- 只有一两层使用的参数；
- 业务核心状态（应显式传递或用 ViewModel）。

### 22.3 与显式参数对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| 显式参数 | 依赖清晰、易测试 | 层级深时传递繁琐 |
| CompositionLocal | 避免逐层透传 | 依赖隐式，阅读代码时不易发现 |

---

## 23. 复杂列表与分页

### 23.1 多类型列表

```kotlin
sealed interface FeedItem {
    data class Article(val title: String) : FeedItem
    data class Banner(val text: String) : FeedItem
}

@Composable
fun FeedList(items: List<FeedItem>) {
    LazyColumn {
        items(items, key = { it.hashCode() }) { item ->
            when (item) {
                is FeedItem.Article -> Text("文章：${item.title}")
                is FeedItem.Banner -> Text("横幅：${item.text}")
            }
        }
    }
}
```

### 23.2 分页加载

```kotlin
@Composable
fun PaginatedList(
    items: List<String>,
    loadMore: () -> Unit,
    isLoading: Boolean
) {
    val listState = rememberLazyListState()

    LaunchedEffect(listState) {
        snapshotFlow {
            val info = listState.layoutInfo
            val last = info.visibleItemsInfo.lastOrNull()?.index ?: 0
            last >= info.totalItemsCount - 3
        }.collect { shouldLoad ->
            if (shouldLoad && !isLoading) loadMore()
        }
    }

    LazyColumn(state = listState) {
        items(items, key = { it }) { Text(it, modifier = Modifier.padding(16.dp)) }
        if (isLoading) {
            item { CircularProgressIndicator() }
        }
    }
}
```

> 生产环境建议使用 Paging 3 的 `collectAsLazyPagingItems()`，它已经处理好加载状态、去重和刷新。

---

## 24. 架构模式：UDF 与 MVI

### 24.1 UDF 完整结构

```text
UiState  ──────→  Composable（只展示状态、发送事件）
   ↑                         │
   │                         │ 用户事件
   │                         ↓
ViewModel ←──────────── Event / Intent
```

### 24.2 事件建模

```kotlin
sealed interface CounterEvent {
    data object Increment : CounterEvent
    data object ToggleLoading : CounterEvent
}

class CounterViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(CounterUiState())
    val uiState: StateFlow<CounterUiState> = _uiState.asStateFlow()

    fun onEvent(event: CounterEvent) {
        when (event) {
            CounterEvent.Increment -> _uiState.value = _uiState.value.copy(
                count = _uiState.value.count + 1
            )
            CounterEvent.ToggleLoading -> _uiState.value = _uiState.value.copy(
                loading = !_uiState.value.loading
            )
        }
    }
}
```

### 24.3 一次性事件（Effect）

Snackbar、跳转、弹窗这类"只发生一次"的事件不要放进 UiState，建议单独用 `SharedFlow` 或 `Channel`：

```kotlin
class CounterViewModel : ViewModel() {
    private val _effect = kotlinx.coroutines.flow.MutableSharedFlow<String>()
    val effect: kotlinx.coroutines.flow.Flow<String> = _effect

    fun save() {
        viewModelScope.launch {
            _effect.emit("保存成功")
        }
    }
}

@Composable
fun EffectConsumer(viewModel: CounterViewModel) {
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        viewModel.effect.collect { message ->
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }
}
```

---

## 25. 测试

> 本章代码用于说明写法。本次验证环境没有安装 `ui-test-junit4` 与模拟器，因此**未实际执行 UI 测试**。

### 25.1 添加测试依赖

```kotlin
dependencies {
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

### 25.2 组件测试

```kotlin
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class CounterTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun counter_increments() {
        composeTestRule.setContent {
            CounterDemo()
        }

        composeTestRule.onNodeWithText("Count = 0").performClick()
        composeTestRule.onNodeWithText("Count = 1").assertIsDisplayed()
    }
}
```

### 25.3 语义（Semantics）

对于自定义绘制或无文本组件，添加 semantics 让测试和无障碍工具可识别：

```kotlin
Box(
    modifier = Modifier
        .size(48.dp)
        .semantics { contentDescription = "关闭按钮" }
        .clickable { }
)
```

---

## 26. Compose Multiplatform

> 本章片段未在本次工程验证，仅作方向性参考。

Compose Multiplatform 由 JetBrains 维护，把 Compose 扩展到 Desktop、Web 和 iOS。共享 UI 代码通常放在 `commonMain`。

### 26.1 共享代码

```kotlin
// commonMain
@Composable
expect fun platformName(): String

@Composable
fun App() {
    Text("Hello from ${platformName()}")
}
```

### 26.2 平台实现

```kotlin
// androidMain
@Composable
actual fun platformName(): String = "Android"
```

```kotlin
// desktopMain
@Composable
actual fun platformName(): String = "Desktop"
```

### 26.3 适用边界

适合共享：

- 页面结构；
- 组件与主题；
- 业务逻辑与状态管理。

通常需要平台差异处理：

- 导航返回键；
- 权限；
- 文件系统；
- 网络栈；
- 系统 UI 与通知。

---

## 27. 常见坑与最佳实践

### 27.1 常见坑

| 问题 | 原因 | 解决 |
|------|------|------|
| 状态改变但 UI 不更新 | 使用了普通变量，不是 State | 用 `mutableStateOf` / StateFlow |
| 每次重组都重置状态 | 没用 `remember` / `rememberSaveable` | 按生命周期选择保存方式 |
| 列表滚动后内容错位 | 缺少稳定 `key` | 给 `items` 传 `key` |
| 嵌套滚动崩溃 | `verticalScroll` + `LazyColumn` 同方向 | 只用 Lazy 列表 |
| AppBar 遮挡内容 | 没用 Scaffold 的 `innerPadding` | 给内容加 `Modifier.padding(innerPadding)` |
| `stickyHeader` 编译失败 | 实验 API 未 opt-in | 加 `@OptIn(ExperimentalFoundationApi::class)` |
| `animateDpAsState` 找不到 | 导包路径错误 | 使用 `androidx.compose.animation.core` |
| `LazyVerticalGrid` 的 `items(12)` 报错 | 误导入顶层 `items` 扩展 | 直接调用 `LazyGridScope` 成员 `items` |
| 构建报 AndroidX 错误 | 缺 `android.useAndroidX=true` | 在 `gradle.properties` 中开启 |

### 27.2 最佳实践

1. 状态提升，组件尽量无状态；
2. 用不可变 `data class` 描述 UiState；
3. 一次性事件用 `SharedFlow` / `Channel`，不要塞进 State；
4. 长列表用 Lazy 系列并传 `key`；
5. 副作用放在 `LaunchedEffect` / `DisposableEffect`，不要写在组合函数主体；
6. 优先使用 Material 3 组件，保持无障碍与主题一致性；
7. 大页面按区域拆函数，既利于复用也有利于智能重组；
8. 关注 Compose Compiler Metrics，不要凭感觉优化。

---

# 四、附录

## A. 常用 API 速查

| 场景 | API |
|------|-----|
| 创建状态 | `remember { mutableStateOf(...) }` |
| 配置保存状态 | `rememberSaveable` |
| 派生状态 | `derivedStateOf` |
| 更新最新回调 | `rememberUpdatedState` |
| 协程副作用 | `LaunchedEffect` |
| 需清理副作用 | `DisposableEffect` |
| 同步外部对象 | `SideEffect` |
| 外部数据转状态 | `produceState` |
| State 转 Flow | `snapshotFlow` |
| 列表 | `LazyColumn` / `LazyRow` / `LazyVerticalGrid` |
| 动画 | `animate*AsState` / `AnimatedVisibility` / `Transition` / `Animatable` |
| 导航 | `NavHost` / `composable` / `rememberNavController` |
| 主题 | `MaterialTheme` / `CompositionLocalProvider` |
| 互操作 | `AndroidView` |
| 测试 | `createComposeRule` / `onNodeWithText` |

## B. 推荐学习路线

1. 先掌握 Kotlin 基础（可参考同目录 `Kotlin.md`）；
2. 熟悉 `@Composable`、状态、`remember`；
3. 练熟 `Column` / `Row` / `Box` 与 Modifier；
4. 实现 2~3 个静态页面：登录页、设置页、详情页；
5. 引入状态提升与 ViewModel；
6. 实现列表、搜索、分页；
7. 加动画与导航；
8. 学习重组原理与性能优化；
9. 做一次老页面 Compose 迁移；
10. 了解 Compose Multiplatform。

## C. 自测题

1. `remember` 和 `rememberSaveable` 的区别是什么？分别适合什么数据？
2. 为什么不能在可组合函数主体里直接调用 `analytics.log(...)`？
3. `LaunchedEffect(key)` 的 key 变化时会发生什么？
4. `derivedStateOf` 适合解决什么问题？举一个列表滚动的例子。
5. `weight` 为什么只能在 `RowScope` / `ColumnScope` 中使用？
6. `LazyColumn` 为什么要传 `key`？
7. `collectAsStateWithLifecycle()` 比 `collectAsState()` 好在哪里？
8. `stickyHeader` 在 Compose 1.7.0 为什么需要 `@OptIn`？
9. 一次性事件为什么不应放进 UiState？
10. `@Stable` 和 `@Immutable` 有什么区别？

