---
title: JQuery
date: 2021-09-06
categories: [前端]
tags: [jQuery, JavaScript]
description: jQuery 选择器、事件处理与 DOM 操作学习笔记。
coverImg: /images/cover-3.svg
permalink: /posts/jquery
---



# 入口函数

## 写法一

~~~javascript
$(document).ready(function(){
				
})
~~~

## 写法二

~~~javascript
$(function(){
				
})
~~~

## JQuery入口函数和window.onload入口函数的区别

> 1. window.onload入口函数不能写多个,但是JQuery的入口函数可以写多个
>
> 2. 执行时机不同:JQuery入口函数要快于window.onload.
>
>    JQuery入口函数要等待页面上dom树加载完后执行
>
>    window.onload要等待页面上所有的资源(dom树/外部css/js/图片)都加载完毕后执行

# $

> -引入一个js文件,是会执行js文件中的代码的
>
> -JQuery文件是一个自执行函数,执行这个JQuery文件中的代码,其实就是执行这个自执行函数
>
> -这个自执行文件就是给window对象添加JQuery属性和$属性
>
> -$其实和JQuery是等价的
>
> -$是一个函数,参数不同,传递效果不同
>
> ​	如果参数传递的是一个匿名函数,就是入口函数
>
> ​	如果参数传递的是一个字符串,就是选择器/会创建一个标签
>
> ​	如果参数是一个dom对象,那他就会把dom对象转换为JQuery对象
>
> ​	

## JQuery文件结构

> 其实是一个自执行函数

~~~javascript
(function(){
	window.jQuery = window.$ = jQuery;
}());
~~~

# dom对象和JQuery对象

## dom对象

> -dom对象就是原生js选择器获取到的对象
>
> -特点: 只能调用dom属性或方法,不能调用JQuery的属性或者方法.

## JQuery对象

> 利用JQuery选择器获取到的对象
>
> 特点: 只能调用JQuery的方法或属性,不能调用原生js dom对象的属性或者方法
>
> JQuery对象是一个伪数组.JQuery对象其实就是dom对象的包装集.

## dom对象转换为JQuery对象

~~~javascript
var d1 = document.getElementById("d1");
var $d1 = $(d1);
console.log($d1);
~~~

## JQuery对象转换为dom对象

### 1.使用下标来取

~~~JavaScript
var $divs = $('div');
var div = $divs[0];
console.log(div);
~~~

### 2.使用JQuery的方法get()

~~~JavaScript
var $divs = $('div');
var div = $divs.get(1);
console.log(div);
~~~

# text()

> text()获取和设置文本
>
> 1.获取文本: text()不给参数
>
> 2.设置文本:text()给参数,参数就是要设置的文本
>
> ​	会覆盖他原来的内容,如果设置的文本中包含标签,是不会把这个标签解析出来的

# css()

> 1.获取样式:css()设置参数为要获取值的样式名
>
> ​	注意:获取样式操作只会返回第一个元素对应的样式值
>
> 2.设置样式:css(样式名,样式值)
>
> 隐式迭代:
>
> ​	1.设置操作的时候,如果是多个元素,那么给所有的元素设置相同的值
>
> ​	2.获取操作的时候,如果是多个元素,那么只返回第一个元素的值

~~~javascript
//设置单样式
$("#d1").css("width",300);
$("#d1").css("height","300px");
$("#d1").css("backgroundColor","red");
$("#d1").css("border","5px solid black");
//设置多样式
//设置多样式
$("#d1").css({
    "width":"300px",
    "height":"300px",
    "backgroundColor":"blue",
    "border":"5px solid green"
})	
~~~

# 基本选择器

```JavaScript
//id选择器
$("#d1").css("border","5px solid black");
//类选择器
$(".d2").css("border","5px solid black");
//标签选择器
$("div").css("border","5px solid green");
//并集选择器 格式:$(s1,s2,s3)
$("#d1,.d2").css("border","5px solid red");
//交集选择器  格式:$(s1.s2)
$("li.p1").text("aaa");
```
# 层级选择器

## 子代选择器

> 用法: $("ul>li")
>
> 不会获取孙子级的元素

## 后代选择器

> $("ul li")
>
> 可以获取到孙子级元素

# 过滤选择器

## :eq(index)

> 用法: $("li:eq(2)")   获取到的li的元素中,选择索引号为2的元素,索引号index从0开始

## :odd

> 用法:$("li:odd")   获取到的li的元素中,选择索引号为奇数的元素

## :even

> 用法:$("li:even")   获取到的li的元素中,选择索引号为偶数的元素

# 筛选选择器

## children(selector)

> 用法:		$("ul").children("li")     相当于   ("ul>li"),子类选择器

## find(selector)

> 用法:		$("ul").find("li")       相当于后代选择器

## siblings(selector)

> 用法:		$("#first").siblings("li")    查找兄弟节点,不包括自己本身

## parent()

> 用法:		$("#first").parent()		查找父亲

## eq(index)

> 用法:		$("li").eq(1)   在li中,查找索引为1的元素

## next()

> 用法:		$("li").next()  查找下一个兄弟

## prev()

> 用法:		$("li").prev() 		查找上一个兄弟

# mouseenter事件和mouseleave事件

> mouseover		事件在鼠标移动到选取的元素及其子元素上时触发
>
> mouseenter		事件只在鼠标移动到选取元素上时触发
>
> 注意:
>
> 以后如果有鼠标移入事件,请使用mouseenter,而不是mouseover
>
> 鼠标移开事件使用mouseleave,不要使用mouseout

# 类操作

~~~javascript
//1.添加类 addClass(类名)
//添加单个类
$("#div").addClass("c1");
//添加多个类
$("#div").addClass("c1 c2");
//2.移除类 removeClass(类名)
//移除单个类
$("#div").removeClass("c1");
//移除多个类
$("#div").removeClass("c1 c2");
//3.判断类 判断一个元素有没有某个类,如果有返回true,没有返回false     hasClass(类名)
//4.切换类 如果元素有某个类就移除这个类,如果元素没有这个类就添加这个类  toggleClass(类名)
~~~

# animate()

> 参数1:必选的	对象	代表的是需要做动画的属性
>
> 参数2:可选的	代表执行动画的时长
>
> 参数3:可选的	easing	代表的是缓动还是匀速	linear(匀速)	swing(缓动)	默认是缓动
>
> 参数4:回调函数 

# stop()

> 参数1:是否清除队列
>
> 参数2:是否跳转到最终效果
>
> 如果stop()不写参数,默认stop(false,false)

~~~javascript
&lt;!DOCTYPE html>
&lt;html lang="en">
&lt;head>
    &lt;meta charset="UTF-8">
    &lt;title>Title&lt;/title>
    &lt;style>
        #div1,#div2{
            width: 200px;
            height: 200px;
            background: red;
            position: absolute;
            top: 50px;
            left: 10px;
        }
        #div2{
            width: 200px;
            height: 200px;
            background: red;
            position: absolute;
            top: 300px;
            left: 10px;
        }
    &lt;/style>
    &lt;script src="js/jquery-3.5.1.min.js">&lt;/script>
    &lt;script>
        $(function (){
            $("#btn1").click(function (){
                $("#div1").stop(true,false).animate({
                    left:500
                },2000,"linear",function (){
                    $("#div1").animate({
                        left:10
                    },2000)
                })
            });
            $("#btn2").mouseenter(function (){
                $("#div2").stop(true,false).slideDown(300);
            })
            $("#btn2").mouseleave(function (){
                $("#div2").stop(true,false).slideUp(300);
            })

        })
    &lt;/script>
&lt;/head>
&lt;body>
&lt;button id="btn1">移动&lt;/button>
&lt;button id="btn2">下拉&lt;/button>
<div id="div1"></div>
<div id="div2"></div>
&lt;/body>
&lt;/html>
~~~

# 动态创建元素

## html()

> 设置或获取内容

~~~javascript
//获取内容
console.log($("#div1").html());
//设置内容
$("#div1").html("<a href='www.baidu.com'>百度</a>")
~~~

## $()

> 确实能创建元素,但是创建的元素只存在于内容中,如果要在页面上显示,就要追加

~~~javascript
$link = $("<a href='www.baidu.com'>百度</a>");
//追加
$("#div1").append($link);
~~~

# 添加节点的几种方式

## 1.append()

> 用法:	父元素.append(子元素)		//作为最后一个子元素添加

## 2.prepend()

> 用法:	父元素.prepend(子元素)		//作为第一个子元素添加

## 3.before()

> 用法:	元素A.before(元素B)	把元素B插入到元素A的前面,作为兄弟元素添加

## 4.after()

> 用法:	元素A.after(元素B)	把元素B插入到元素A的后面,作为兄弟元素添加

## 5.appendTo()

> 用法:	子元素.appendTo(父元素)	把子元素作为父元素的最后一个子元素添加

# 清空节点empty()

> 不推荐使用html("")	有可能会造成内存泄露,不安全
>
> 推荐使用empty()

# 移除节点remove()

> $("#li3").remove()

# 克隆节点clone()

> 只存在于内存中,如果要在页面上显示,就应该追加到页面上
>
> 参数:	true表示会把事件一起克隆到
>
> ​			false不会克隆事件
>
> ​			不给参数,默认是false

# val()

> 获取或设置表单元素

# 操作属性

## attr()

~~~javascript
//设置单个属性
$("#img1").attr("src","a.jpg");
//设置多个属性
$("#img1").attr({
    "src":"b.jpg",
    "alt":"hello"
})
//获取属性
$("#img1").attr("src");
//移除属性
$("#img1").removeAttr("alt");
//移除多个属性
$("#img1").removeAttr("alt src");
~~~

## prop()

> 操作布尔类型的属性

# on

## on简单注册事件

~~~javascript
//不支持动态注册
$("div").on("click",function(){
    console.log("单击事件");
})
~~~

## on委托事件

~~~javascript
//支持动态注册
$("body").on("click","div span",function(){
    console.log("单击事件");
})
~~~

# off

> 解绑事件
>
> off()不给参数就是解绑所有事件
>
> off("click")解绑指定事件

# end()

> 回到最近的一个"破坏性"操作之前。即，将匹配的元素列表变为前一次的状态。