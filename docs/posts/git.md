---
title: Git
date: 2021-06-01
categories: [版本控制工具]
tags: ["Git"]
description: Git 常用命令与工作流备忘：分支、提交与协作。
coverImg: /images/cover-5.svg
permalink: /posts/git
---



# GIT

## 1.版本控制

### 常见的版本控制工具

- **Git**
-  **SVN**
- **CVS**
- **VSS**
- **TFS**
- Visul Studio Online

### 版本控制分类

#### 本地版本控制

>  其中最流行的一种叫做 RCS，现今许多计算机系统上都还看得到它的踪影。甚至在流行的 Mac OS X 系统上安装了开发者工具包之后，也可以使用 rcs 命令。它的工作原理是在硬盘上保存补丁集（补丁是指文件修订前后的变化）；通过应用所有的补丁，可以重新计算出各个版本的文件内容。
>
> 缺点:开发者不能在不同系统的上协同工作

![](https://fanaidi.gitee.io/blogimgs/git/本地版本控制.png)

#### 集中式版本控制

> 集中化的版本控制系统（Centralized Version Control Systems，简称 CVCS）.这类系统，诸如SVN、 CVS、Subversion 以及 Perforce 等，都有一个单一的集中管理的服务器，保存所有文件的修订版本，而协同工作的人们都通过客户端连到这台服务器，取出最新的文件或者提交更新。多年以来，这已成为版本控制系统的标准做法。
>
> 缺点:如果宕机一小时，那么在这一小时内，谁都无法提交更新，也就无法协同工作。如果中心数据库所在的磁盘发生损坏，又没有做恰当备份，毫无疑问你将丢失所有数据——包括项目的整个变更历史，只剩下人们在各自机器上保留的单独快照。本地版本控制系统也存在类似问题，只要整个项目的历史记录被保存在单一位置，就有丢失所有历史更新记录的风险。

![](https://fanaidi.gitee.io/blogimgs/git/分布式版本控制.png)

#### 分布式版本控制

> 分布式版本控制系统（Distributed Version Control System，简称 DVCS）.在这类系统中，像 Git、Mercurial、Bazaar 以及 Darcs 等，客户端并不只提取最新版本的文件快照，而是把代码仓库完整地镜像下来。这么一来，任何一处协同工作用的服务器发生故障，事后都可以用任何一个镜像出来的本地仓库恢复。因为每一次的克隆操作，实际上都是一次对代码仓库的完整备份。

![](https://fanaidi.gitee.io/blogimgs/git/集中版本控制.png)

### Git与SVN最主要区别

> ​	SVN是集中式版本控制系统，版本库是集中放在中央服务器的，而工作的时候，用的都是自己的电脑，所以首先要从中央服务器得到最新的版本，然后工作，完成工作后，需要把自己做完的活推送到中央服务器。集中式版本控制系统是必须联网才能工作，对网络带宽要求较高。
>
> ​	Git是分布式版本控制系统，没有中央服务器，每个人的电脑就是一个完整的版本库，工作的时候不需要联网，因为版本都在自己的电脑上。协同的方法是这样的：比如说自己在电脑上改了文件A，其他人也在电脑上改了文件A，这时，你们两之间只需把各自修改推送给对方，就可以互相看到对方的修改了。Git可以直接看到更新了哪些代码和文件！
>
> ​	Git是目前世界上最先进的分布式版本控制系统

## Git环境配置

### 下载与安装

可以使用淘宝镜像快速下载：http://npm.taobao.org/mirrors/git-for-windows/

安装：一直点下一步即可。

### 启动Git

安装成功后在开始菜单中会有Git项，菜单下有3个程序：任意文件夹下右键也可以看到对应的程序！

+ **Git Bash：**Unix与Linux风格的命令行，使用最多，推荐最多
+ **Git CMD：**Windows风格的命令行
+ **Git GUI**：图形界面的Git，不建议初学者使用，尽量先熟悉常用命令

### Git配置

所有的配置文件，其实都保存在本地！

**查看配置**

~~~shell
 git config -l
~~~

**查看系统config**

~~~shell
git config --system --list
~~~

**查看当前用户（global）配置**

~~~shell
git config --global  --list
~~~

**Git相关的配置文件**

1. Git\etc\gitconfig  ：Git 安装目录下的 gitconfig   --system 系统级
2. C:\Users\Administrator\ .gitconfig   只适用于当前登录用户的配置  --global 全局

![](https://fanaidi.gitee.io/blogimgs/git/.gitconfig.png)

这里可以直接编辑配置文件，通过命令设置后会响应到这里。

**==设置用户名与邮箱（用户标识，必要）==**

当你安装Git后首先要做的事情是设置你的用户名称和e-mail地址。这是非常重要的，因为每次Git提交都会使用该信息。它被永远的嵌入到了你的提交中：

~~~shell
git config --global user.name "kuangshen"  #名称
git config --global user.email 24736743@qq.com   #邮箱
~~~

只需要做一次这个设置，如果你传递了--global 选项，因为Git将总是会使用该信息来处理你在系统中所做的一切操作。如果你希望在一个特定的项目中使用不同的名称或e-mail地址，你可以在该项目中运行该命令而不要--global选项。总之--global为全局配置，不加为某个项目的特定配置。

## Git基本理论（核心）

### 三个区域

Git本地有三个工作区域：工作目录（Working Directory）、暂存区(Stage/Index)、资源库(Repository或Git Directory)。如果在加上远程的git仓库(Remote Directory)就可以分为四个工作区域。文件在这四个区域之间的转换关系如下：

![](https://fanaidi.gitee.io/blogimgs/git/git三个区域.png)

- Workspace：工作区，就是你平时存放项目代码的地方
- Index / Stage：暂存区，用于临时存放你的改动，事实上它只是一个文件，保存即将提交到文件列表信息
- Repository：仓库区（或本地仓库），就是安全存放数据的位置，这里面有你提交到所有版本的数据。其中HEAD指向最新放入仓库的版本
- Remote：远程仓库，托管代码的服务器，可以简单的认为是你项目组中的一台电脑用于远程数据交换

本地的三个区域确切的说应该是git仓库中HEAD指向的版本：

![](https://fanaidi.gitee.io/blogimgs/git/git核心.png)

- Directory：使用Git管理的一个目录，也就是一个仓库，包含我们的工作空间和Git的管理空间。
- WorkSpace：需要通过Git进行版本控制的目录和文件，这些目录和文件组成了工作空间。
- .git：存放Git管理信息的目录，初始化仓库的时候自动创建。
- Index/Stage：暂存区，或者叫待提交更新区，在提交进入repo之前，我们可以把所有的更新放在暂存区。
- Local Repo：本地仓库，一个存放在本地的版本库；HEAD会只是当前的开发分支（branch）。
- Stash：隐藏，是一个工作状态保存栈，用于保存/恢复WorkSpace中的临时状态。

### 工作流程

git的工作流程一般是这样的：

1. 在工作目录中添加、修改文件；
2. 将需要进行版本管理的文件放入暂存区域；
3. 将暂存区域的文件提交到git仓库。

因此，git管理的文件有三种状态：已修改（modified）,已暂存（staged）,已提交(committed)

![](https://fanaidi.gitee.io/blogimgs/git/git.png)

### Git项目搭建

#### 创建工作目录与常用指令

工作目录（WorkSpace)一般就是你希望Git帮助你管理的文件夹，可以是你项目的目录，也可以是一个空目录，建议不要有中文。

日常使用只要记住下图6个命令：

![](https://fanaidi.gitee.io/blogimgs/git/git常用6个命令.png)	

#### 本地仓库搭建

创建本地仓库的方法有两种：一种是创建全新的仓库，另一种是克隆远程仓库。

1. 创建全新的仓库，需要用GIT管理的项目的根目录执行：

   ~~~Shell
   # 在当前目录新建一个Git代码库
   $ git init
   ~~~

2. 执行后可以看到，仅仅在项目目录多出了一个.git目录，关于版本等的所有信息都在这个目录里面。

#### 克隆远程仓库

1. 另一种方式是克隆远程目录，是将远程服务器上的仓库完全镜像一份至本地！

   ~~~shell
   
   # 克隆一个项目和它的整个代码历史(版本信息)
   $ git clone [url]
   ~~~

### Git文件操作

#### 文件的四种状态

版本控制就是对文件的版本控制，要对文件进行修改、提交等操作，首先要知道文件当前在什么状态，不然可能会提交了现在还不想提交的文件，或者要提交的文件没提交上。

- Untracked: 未跟踪, 此文件在文件夹中, 但并没有加入到git库, 不参与版本控制. 通过git add 状态变为Staged.
- Unmodify: 文件已经入库, 未修改, 即版本库中的文件快照内容与文件夹中完全一致. 这种类型的文件有两种去处, 如果它被修改, 而变为Modified. 如果使用git rm移出版本库, 则成为Untracked文件
- Modified: 文件已修改, 仅仅是修改, 并没有进行其他的操作. 这个文件也有两个去处, 通过git add可进入暂存staged状态, 使用git checkout 则丢弃修改过, 返回到unmodify状态, 这个git checkout即从库中取出文件, 覆盖当前修改 !
- Staged: 暂存状态. 执行git commit则将修改同步到库中, 这时库中的文件和本地文件又变为一致, 文件为Unmodify状态. 执行git reset HEAD filename取消暂存, 文件状态为Modified

#### 查看文件状态

上面说文件有4种状态，通过如下命令可以查看到文件的状态：

~~~shell
#查看指定文件状态
git status [filename]

#查看所有文件状态
git status

# git add .                  添加所有文件到暂存区
# git commit -m "消息内容"    提交暂存区中的内容到本地仓库 -m 提交信息
~~~

#### 忽略文件

有些时候我们不想把某些文件纳入版本控制中，比如数据库文件，临时文件，设计文件等。在主目录下建立".gitignore"文件，此文件有如下规则：

1. 忽略文件中的空行或以井号（#）开始的行将会被忽略。
2. 可以使用Linux通配符。例如：星号（*）代表任意多个字符，问号（？）代表一个字符，方括号（[abc]）代表可选字符范围，大括号（{string1,string2,...}）代表可选的字符串等。
3. 如果名称的最前面有一个感叹号（!），表示例外规则，将不被忽略。
4. 如果名称的最前面是一个路径分隔符（/），表示要忽略的文件在此目录下，而子目录中的文件不忽略。
5. 如果名称的最后面是一个路径分隔符（/），表示要忽略的是此目录下该名称的子目录，而非文件（默认文件或目录都忽略）。

~~~
#为注释
*.txt        #忽略所有 .txt结尾的文件,这样的话上传就不会被选中！
!lib.txt     #但lib.txt除外
/temp        #仅忽略项目根目录下的TODO文件,不包括其它目录temp
build/       #忽略build/目录下的所有文件
doc/*.txt    #会忽略 doc/notes.txt 但不包括 doc/server/arch.txt
~~~

## IDEA提交项目到Gitee(码云)

首先需要在gitee上创建一个仓库.

IDEA提交项目到Gitee有两种操作,一种是图形化操作,一种是命令行操作

### 图形化操作

#### 1.创建本地git仓库

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee1.png)

​	**默认选择当前项目**

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee2.png)

​	**完成之后,VCS会变成Git**

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee3.png)

#### 2.添加远程仓库地址

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee4.png)

**复制在gitee上创建的仓库的地址**

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee5.png)



![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee6.png)

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee7.png)

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee8.png)

#### 3.将远端的文件pull到本地仓库

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee9.png)



![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee10.png)

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee11.png)

#### 4.刷新idea项目

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee12.png)

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee13.png)

#### 5.将项目添加到暂存区

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee14.png)

#### 6.将项目提交到本地仓库

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee15.png)

​	![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee16.png)

#### 7.将项目推送到远端

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee17.png)

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee18.png)

#### 8.刷新gitee仓库

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-gitee19.png)

然后就能看到推送到远端的文件了。

### 命令行操作

**在idea底部选择Terminal**

![](https://fanaidi.gitee.io/blogimgs/git/idea项目提交到gitee/idea-命令行.png)

**依次执行一下命令即可**

~~~Shell
#初始化Git仓库
git init
#和远端仓库建立连接
git remote add origin #远程仓库地址
#将远程仓库的文件拉到本地
git pull origin master
#将项目的文件添加到暂存区
git add .
#将添加到暂存区的文件提交到本地仓库
git commit -m "提交的信息"
#将本地仓库推送到远端仓库
git push origin master
~~~

## GIT分支

分支在GIT中相对较难，分支就是科幻电影里面的平行宇宙，如果两个平行宇宙互不干扰，那对现在的你也没啥影响。不过，在某个时间点，两个平行宇宙合并了，我们就需要处理一些问题了！

### git分支中常用指令：

~~~shell
# 列出所有本地分支
git branch

# 列出所有远程分支
git branch -r

# 新建一个分支，但依然停留在当前分支
git branch [branch-name]

# 新建一个分支，并切换到该分支
git checkout -b [branch]

# 合并指定分支到当前分支
$ git merge [branch]

# 删除分支
$ git branch -d [branch-name]

# 删除远程分支
$ git push origin --delete [branch-name]
$ git branch -dr [remote/branch]
~~~

如果同一个文件在合并分支时都被修改了则会引起冲突：解决的办法是我们可以修改冲突文件后重新提交！选择要保留他的代码还是你的代码！

master主分支应该非常稳定，用来发布新版本，一般情况下不允许在上面工作，工作一般情况下在新建的dev分支上工作，工作完后，比如上要发布，或者说dev分支代码稳定后可以合并到主分支master上来。

详细信息请看:https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%AE%80%E4%BB%8B

