---
title: Git
date: 2022-07-28
categories: [工具]
tags: [Git, 版本控制, 分支管理, 协作]
description: Git 学习笔记，涵盖常用命令、分支合并、rebase、stash、reflog 与团队协作规范。
coverImg: /images/cover-1.svg
permalink: /posts/git
---

# Git 系统学习文档

> 从入门到实战：常用命令 + 分支协作 + 数据恢复 + 团队协作规范
>
> 适用版本：Git 2.x（本文示例在本机 Git 2.55.0 实际执行验证）

---

## 写在前面

### Git 是什么

Git 是一个**分布式版本控制系统**（DVCS）：

- **分布式**：每个开发者本地都有完整的代码仓库和历史记录，不依赖中央服务器也能提交、查看历史
- **快照式存储**：Git 保存的是文件的快照，而不是逐行差异，切换版本极快
- **内容寻址**：所有对象通过 SHA-1 哈希标识，内容变则哈希变，天然防篡改

### 三种状态与三个工作区域

```
工作区（Working Directory）  →  暂存区（Index/Stage）  →  本地仓库（Repository）
     git add                      git commit

本地仓库  ←→  远程仓库（Remote，如 GitHub / GitLab / Gitee）
     git push / git fetch / git pull
```

| 状态 | 含义 |
|------|------|
| 已修改（modified） | 工作区改了，还没存到暂存区 |
| 已暂存（staged） | `git add` 过，下次提交会包含它 |
| 已提交（committed） | 数据已安全存到本地仓库 |

### 学习路线

```
基础篇：配置 → 仓库 → add/commit → log/diff → 撤销
进阶篇：分支 → 合并/rebase → 远程协作 → stash/tag/cherry-pick → 工作流
高阶篇：reflog 恢复 → 交互式 rebase → submodule/worktree/hooks → 排查
```

---

# 第一部分：基础篇

## 1. 安装与配置

### 安装

```bash
# Windows：安装 Git for Windows（含 Git Bash），官网 https://git-scm.com/download/win
# macOS
brew install git

# Linux
sudo apt install git          # Debian/Ubuntu
sudo yum install git          # CentOS/RHEL

git --version                 # 验证安装
```

### 首次配置（必做）

```bash
git config --global user.name "你的名字"
git config --global user.email "your@email.com"

# 查看配置
git config --global --list
git config user.name                 # 查看单项

# 常用个性化配置
git config --global core.editor "code --wait"   # VS Code 作为编辑器
git config --global init.defaultBranch main     # 新仓库默认分支名
git config --global core.autocrlf input         # Linux/macOS：提交时转 LF
git config --global core.autocrlf true          # Windows：提交时转 LF，检出转 CRLF
git config --global pull.rebase false           # pull 默认用 merge
```

配置的三个级别（优先级从高到低）：

```bash
git config --local  ...    # 仅当前仓库，保存在 .git/config
git config --global ...    # 当前用户，保存在 ~/.gitconfig
git config --system ...    # 全系统，保存在 /etc/gitconfig

git config --list --show-origin   # 查看每项配置来自哪个文件
```

> **中文文件名乱码**：设置 `git config --global core.quotepath false`；提交信息乱码设置 `git config --global i18n.commitEncoding utf-8`。

---

## 2. 创建与克隆仓库

```bash
# 在现有目录初始化
mkdir my-project && cd my-project
git init
# => Initialized empty Git repository in .../my-project/.git/

# 指定默认分支名
git init -b main

# 克隆远程仓库
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git my-dir      # 指定本地目录名
git clone git@github.com:user/repo.git                  # SSH 方式

# 浅克隆（只取最近历史，大仓库加速）
git clone --depth 1 https://github.com/user/repo.git

# 克隆后配置本地身份（与全局不同时）
git config user.name "项目专用名字"
git config user.email "project@example.com"
```

---

## 3. 查看状态与提交

```bash
git status                 # 完整状态
git status -s              # 简洁输出：?? 未跟踪 / M 已修改 / A 已暂存

git add file.txt           # 暂存单个文件
git add .                  # 暂存当前目录全部变更（含新文件）
git add -A                 # 暂存整个仓库全部变更（等价 git add --all）
git add -u                 # 只暂存已跟踪文件的修改和删除，不含新文件
git add *.js               # 通配
git add -p                 # 交互式暂存文件的部分内容（hunk）

git commit -m "feat: 添加登录功能"        # 提交
git commit -am "fix: 修复空指针"          # 跳过 add，直接提交已跟踪文件的修改
git commit --amend -m "新的提交信息"      # 修正最后一次提交（不改历史节点以外内容）

# 查看提交历史
git log                            # 完整历史
git log --oneline                  # 单行简洁历史
git log --oneline --graph --all    # 图形化分支历史（最常用）
git log -5                         # 最近 5 条
git log --author="Alice"           # 按作者筛选
git log --since="2025-01-01" --until="2025-06-01"
git log --stat                     # 显示每次提交的文件改动统计
git log -p                         # 显示每次提交的完整 diff
git log --follow file.txt          # 跟踪文件（含重命名）的历史
git show HEAD                      # 查看最近一次提交详情
git show <commit>                  # 查看某次提交详情
git blame file.txt                 # 逐行显示是谁在哪次提交改的
```

### 提交信息规范（Conventional Commits）

```
<type>(<scope>): <subject>

feat: 新功能
fix: 修复 bug
docs: 文档变更
style: 格式调整（不影响逻辑）
refactor: 重构
test: 测试相关
chore: 构建/工具配置
```

示例：

```bash
git commit -m "feat(user): 增加手机号登录"
git commit -m "fix(order): 修复订单金额计算错误"
```

---

## 4. 比较差异

```bash
git diff                   # 工作区 vs 暂存区（未暂存的改动）
git diff --cached          # 暂存区 vs 本地仓库（已暂存待提交的改动）
git diff HEAD              # 工作区 vs 最近一次提交（全部改动）
git diff HEAD~1            # 工作区 vs 上上个提交
git diff <commit1> <commit2>           # 两次提交之间
git diff main..feature                 # 两个分支之间（比较终点树）
git diff main...feature                # 比较两个分支从共同祖先开始的差异
git diff --stat                        # 只显示统计
git diff --name-only                   # 只显示文件名
git diff --word-diff                   # 按词比较
```

---

## 5. 撤销与回退（基础）

```bash
# 场景 1：工作区改乱了，想恢复成暂存区/HEAD 的样子
git restore file.txt                   # Git 2.23+，推荐
git checkout -- file.txt               # 老写法

# 场景 2：add 错了，想从暂存区撤回（保留工作区改动）
git restore --staged file.txt
git reset HEAD file.txt                # 老写法

# 场景 3：改了提交信息 / 漏加文件
git commit --amend -m "修正后的信息"
git add forgotten.txt && git commit --amend --no-edit

# 场景 4：彻底丢弃某个提交及之后的改动（危险，会改写历史）
git reset --hard HEAD~1

# 场景 5：撤销一次提交但保留历史（推荐用于已推送的提交）
git revert HEAD

# 场景 6：删除未跟踪文件
git clean -n                    # 预览（dry run）
git clean -fd                   # 强制删除未跟踪文件和目录
git clean -fdx                  # 连 .gitignore 忽略的文件也删（小心）

# 场景 7：取消正在进行的合并/变基
git merge --abort
git rebase --abort
```

> **原则**：`reset --hard` 和 `clean -fdx` 会**不可逆地丢弃未提交内容**，执行前先用 `git status` 确认。

---

## 6. 文件操作与忽略规则

```bash
git mv old.txt new.txt        # 重命名（等价 mv + git add + git rm）
git rm file.txt               # 删除文件并暂存
git rm --cached file.txt      # 从版本库移除但保留工作区文件（如误提交的配置文件）
git rm -r dir/                # 递归删除
```

### `.gitignore`

```gitignore
# .gitignore 示例
*.log                 # 所有日志文件
node_modules/         # 整个目录
dist/                 # 构建产物
.env                  # 本地环境变量
!important.log        # 例外：不忽略该文件
build/*.tmp           # 只忽略 build 下的 tmp
**/temp/              # 任意层级的 temp 目录
```

```bash
git check-ignore -v app.log       # 查看某文件被哪条规则忽略
git status --ignored              # 显示被忽略的文件

# 已经跟踪的文件不受 .gitignore 影响，需先移除跟踪
git rm --cached config.ini
echo "config.ini" >> .gitignore
git commit -m "chore: 忽略本地配置文件"
```

---

# 第二部分：进阶篇

## 1. 分支管理

```bash
git branch                    # 列出本地分支（* 表示当前）
git branch -a                 # 列出本地 + 远程分支
git branch -v                 # 显示各分支最后一次提交
git branch feature/login      # 创建分支（不切换）
git switch feature/login      # 切换分支（Git 2.23+，推荐）
git checkout feature/login    # 老写法
git switch -c feature/pay     # 创建并切换
git checkout -b feature/pay   # 老写法

git branch -d feature/login   # 删除已合并分支
git branch -D feature/login   # 强制删除未合并分支

git branch -m old-name new-name      # 重命名当前分支
git branch --merged                  # 查看已合并到当前分支的分支
git branch --no-merged               # 查看未合并的分支
```

### 分支命名约定

```
main / master        主分支，始终可发布
develop              开发分支（Git Flow）
feature/xxx          功能分支
bugfix/xxx           修复分支
hotfix/xxx           紧急修复分支
release/xxx          发布分支
```

---

## 2. 合并与冲突解决

```bash
git switch main
git merge feature/login            # 将 feature/login 合并进 main

# 快进合并（Fast-forward）：main 没有新提交时，直接移动指针
# 非快进合并：两边都有提交时，产生一个合并提交

git merge --no-ff feature/login    # 强制产生合并提交（保留分支结构，推荐）
git merge --squash feature/login   # 把分支所有提交压成一个再合并
git merge --abort                  # 冲突时放弃合并
git merge --continue               # 解决冲突后继续
```

### 解决冲突的流程

```bash
# 1. 合并后出现冲突，git status 会显示 "both modified"
git status

# 2. 打开冲突文件，会看到：
# <<<<<<< HEAD
# 当前分支的内容
# =======
# 要合并分支的内容
# >>>>>>> feature/login

# 3. 手动编辑，保留需要的内容，删除 <<<<<<< ======= >>>>>>> 标记

# 4. 标记冲突已解决
git add conflicted-file.txt

# 5. 完成合并
git commit -m "merge: 合并 feature/login 并解决冲突"
```

> 冲突标记中的 `HEAD` 是**当前分支**，`>>>>>>>` 后面是**被合并的分支**。用 `git checkout --ours file` / `--theirs file` 可快速选边（ours 是当前分支）。

---

## 3. rebase：变基

rebase 将当前分支的提交"移植"到另一个分支之上，得到**线性历史**。

```bash
git switch feature/login
git rebase main                  # 把 feature/login 的提交接到 main 最新提交之后

# 冲突处理
git status                        # 查看冲突文件
# 手动解决后
git add .
git rebase --continue
git rebase --abort                # 放弃变基，回到操作前

# 变基到指定提交
git rebase <commit>
git rebase --onto main old-base feature/login   # 只移植 feature/login 上 old-base 之后的提交
```

### merge 与 rebase 的选择

| 维度 | merge | rebase |
|------|-------|--------|
| 历史 | 保留真实分支结构，有合并提交 | 线性、干净 |
| 安全性 | 不改写已有提交 | **改写提交哈希** |
| 适用 | 公共分支、多人协作 | 个人本地分支、提交 PR 前整理 |

> **黄金法则**：**不要对已经推送到远程并被他人使用的提交执行 rebase**，否则会导致他人历史混乱。

---

## 4. 远程仓库

```bash
git remote -v                                  # 查看远程仓库
git remote add origin https://github.com/user/repo.git   # 添加远程
git remote remove origin                       # 删除远程
git remote rename origin upstream              # 重命名
git remote show origin                         # 查看远程详细信息

git push -u origin main           # 首次推送并建立上游关联（-u = --set-upstream）
git push                          # 之后直接推送到已关联的远程分支
git push origin feature/login     # 推送指定分支
git push --all                    # 推送所有分支
git push --tags                   # 推送所有标签
git push origin --delete old-branch    # 删除远程分支
git push --force-with-lease       # 安全强制推送（比 --force 安全，推荐）

# 自建裸仓库时，若默认分支是 master 而首次推送的是 main，克隆会警告
# "remote HEAD refers to nonexistent ref"。修正裸仓库默认分支：
git --git-dir=/path/to/remote.git symbolic-ref HEAD refs/heads/main
git remote set-head origin main   # 客户端更新远程 HEAD 引用

git fetch origin                  # 只下载远程更新，不合并
git fetch --all --prune           # 拉取所有远程并清理已删除分支的本地引用
git pull                          # fetch + merge
git pull --rebase                 # fetch + rebase（保持线性历史）
git pull origin main              # 拉取指定远程分支
```

### SSH 密钥配置（免密码推送）

```bash
ssh-keygen -t ed25519 -C "your@email.com"
# 生成 ~/.ssh/id_ed25519（私钥）和 ~/.ssh/id_ed25519.pub（公钥）

# 复制公钥内容到 GitHub/GitLab 的 SSH Keys 设置页
cat ~/.ssh/id_ed25519.pub

ssh -T git@github.com             # 测试连接，成功显示 Hi username!
git remote set-url origin git@github.com:user/repo.git   # 把 HTTPS 远程改为 SSH
```

---

## 5. stash：临时保存工作现场

```bash
git stash                          # 保存当前改动（只含已跟踪文件）
git stash push -m "临时改到一半"    # 带说明保存
git stash push -u                  # 连未跟踪文件一起保存（-a 含忽略文件）
git stash list                     # 查看 stash 列表
git stash show -p stash@{0}        # 查看某个 stash 的内容

git stash pop                      # 恢复最近一次 stash 并删除记录
git stash apply stash@{1}          # 恢复指定 stash 但保留记录
git stash drop stash@{0}           # 删除某个 stash
git stash clear                    # 清空所有 stash
```

典型场景：正在开发时突然要修线上 bug —— `git stash` → 切分支修复 → 回来 `git stash pop`。

---

## 6. tag：标签（版本发布）

```bash
git tag                            # 列出标签
git tag v1.0.0                     # 创建轻量标签
git tag -a v1.0.0 -m "release 1.0"  # 创建附注标签（推荐，含作者/日期/说明）
git tag v1.0.0 <commit>            # 给指定提交打标签

git show v1.0.0                    # 查看标签信息
git push origin v1.0.0             # 推送单个标签
git push origin --tags             # 推送全部标签

git tag -d v1.0.0                  # 删除本地标签
git push origin --delete v1.0.0    # 删除远程标签

git switch v1.0.0                  # 切换到标签（会进入 detached HEAD 状态）
git switch -c release/v1.0 v1.0.0  # 基于标签创建分支（推荐）
```

### 语义化版本（SemVer）

```
主版本.次版本.修订号    如 v1.2.3
主版本：不兼容的 API 变更
次版本：向下兼容的新功能
修订号：向下兼容的 bug 修复
```

---

## 7. cherry-pick：挑拣提交

```bash
git cherry-pick <commit>              # 把某个提交应用到当前分支
git cherry-pick <commit1> <commit2>   # 挑拣多个提交
git cherry-pick -x <commit>           # 在提交信息中保留原始提交哈希（便于追溯）
git cherry-pick --no-commit <commit>  # 只应用改动不提交

# 冲突处理
git status
# 解决冲突后
git add .
git cherry-pick --continue
git cherry-pick --abort
```

典型场景：把 `hotfix` 分支的修复同步到 `main` 和 `develop`，但不想合并整个分支。

---

## 8. 团队协作工作流

### 三种主流模式

| 模式 | 流程 | 适用 |
|------|------|------|
| **Git Flow** | main ↔ develop + feature/release/hotfix 分支 | 有固定版本发布节奏的项目 |
| **GitHub Flow** | main 分支 + feature 分支 + Pull Request | 持续部署的 Web 项目 |
| **Trunk-Based** | 主干开发 + 短生命周期分支 + 特性开关 | 高频交付的成熟团队 |

### 标准协作流程（PR 模式）

```bash
# 1. 同步主分支
git switch main
git pull --rebase

# 2. 创建功能分支
git switch -c feature/user-profile

# 3. 开发并提交（多次小提交）
git add .
git commit -m "feat(user): 添加用户资料页"

# 4. 推送到远程
git push -u origin feature/user-profile

# 5. 在平台上创建 Pull Request / Merge Request，走 Code Review

# 6. Review 通过后合并，删除远程分支
git push origin --delete feature/user-profile

# 7. 回到本地，同步并清理
git switch main
git pull
git branch -d feature/user-profile
```

---

# 第三部分：高阶篇

## 1. reflog：数据恢复的救命稻草

`reflog` 记录 HEAD 和分支引用的每次移动，**即使提交被 reset 掉也能找回**（默认保留 90 天）。

```bash
git reflog                         # 查看所有 HEAD 移动记录
git reflog show main               # 查看某个分支的移动记录

# 场景：误执行 git reset --hard HEAD~2，想找回丢失的提交
git reflog
# => a1b2c3d HEAD@{0}: reset: moving to HEAD~2
# => e4f5g6h HEAD@{1}: commit: feat: 重要功能
git reset --hard e4f5g6h            # 恢复到丢失的提交

# 场景：误删分支
git branch -D feature/xxx
git reflog                         # 找到删除前的提交哈希
git branch feature/xxx <commit>    # 重建分支
```

> reflog 是**本地**记录，不会推送到远程；且 `git gc` 后过期条目会被清理。发现误操作后应尽快恢复。

---

## 2. reset / revert / restore 深度对比

| 命令 | 作用范围 | 是否改写历史 | 适用场景 |
|------|----------|--------------|----------|
| `git restore` | 工作区/暂存区文件 | 否 | 撤销未提交的改动 |
| `git reset --soft` | 移动 HEAD，保留暂存区和工作区 | 是 | 合并多个提交、重新提交 |
| `git reset --mixed`（默认） | 移动 HEAD，重置暂存区，保留工作区 | 是 | 撤销 add |
| `git reset --hard` | 全部重置 | 是 | 彻底丢弃（危险） |
| `git revert` | 创建新提交抵消旧提交 | 否 | 撤销已推送的提交 |

```bash
git reset --soft HEAD~1      # 撤销最后一次提交，改动留在暂存区
git reset --mixed HEAD~1     # 撤销提交和 add，改动留在工作区
git reset --hard HEAD~1      # 全部丢弃

git revert HEAD              # 撤销最近一次提交（生成新提交）
git revert <commit>          # 撤销指定提交
git revert --no-commit <commit>   # 只抵消改动不自动提交
git revert --abort           # 中止 revert

# 撤销合并提交必须指定保留哪个父分支（1=主分支，2=被合并分支）
git revert -m 1 <merge-commit>
git show --no-patch --pretty=raw <merge-commit>   # 查看 merge commit 的 parent 顺序
```

> **已推送到远程的提交用 `revert`，不要用 `reset` 强推**，否则会破坏其他人的本地历史。

---

## 3. 交互式 rebase：整理提交历史

```bash
git rebase -i HEAD~3         # 交互整理最近 3 次提交
git rebase -i main           # 整理相对于 main 的所有本地提交

# 编辑器中常用操作：
# pick   保留该提交
# reword 修改提交信息
# edit   停下来修改提交内容
# squash 把该提交合并到上一个提交（保留本提交信息）
# fixup  合并到上一个提交但丢弃本提交信息
# drop   删除该提交
```

典型用法：把多个零散提交合并成一个干净的提交再提交 PR。

```bash
# 示例：把最近 3 个提交压成 1 个
git rebase -i HEAD~3
# 编辑器中把后两行的 pick 改成 squash，保存退出
# 再编辑合并后的提交信息，保存退出
git push --force-with-lease    # 若已推送，需强推（确保无人基于旧提交工作）
```

---

## 4. submodule：子模块

```bash
git submodule add https://github.com/user/lib.git libs/mylib   # 添加子模块
git submodule update --init --recursive                        # 初始化并拉取
git clone --recurse-submodules <url>                           # 克隆时带子模块
git submodule status                                           # 查看子模块状态

# 更新子模块到远程最新版本
git submodule update --remote libs/mylib
git add libs/mylib && git commit -m "chore: 更新子模块"

# 在子模块内修改并提交
cd libs/mylib
git switch -c feature/xxx
git add . && git commit -m "feat: 子模块改动"
git push
cd ../..
git add libs/mylib && git commit -m "chore: 更新子模块引用"

# 删除子模块
git submodule deinit -f libs/mylib
git rm -f libs/mylib
rm -rf .git/modules/libs/mylib
```

> 子模块保存的是**指向某个提交的指针**，父仓库不会自动跟随子模块的最新提交，必须显式 `git submodule update`。

---

## 5. worktree：多工作树并行开发

`worktree` 让同一个仓库的多个分支同时存在于不同目录，避免频繁 stash/切换。

```bash
git worktree add ../project-hotfix hotfix/urgent    # 为新分支创建独立工作目录
git worktree add ../project-review main             # 已存在分支也可以检出（不能重复检出同一分支）
git worktree list                                  # 列出所有工作树
git worktree remove ../project-hotfix              # 移除工作树
git worktree prune                                 # 清理失效的工作树记录
```

典型场景：正在 feature 分支开发，突然需要修 hotfix —— 不用 stash，直接 `git worktree add` 开一个新目录修完再回来。

---

## 6. hooks：自动化脚本

钩子位于 `.git/hooks/`，在特定事件前后自动执行。

```bash
ls .git/hooks                      # 查看钩子示例（.sample 文件）
```

示例：提交前检查提交信息格式（`.git/hooks/commit-msg`）

```bash
#!/bin/bash
# 保存为 .git/hooks/commit-msg 并 chmod +x
msg_file=$1
msg=$(cat "$msg_file")
if ! echo "$msg" | grep -Eq '^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+'; then
    echo "ERROR: 提交信息不符合规范，格式应为 <type>(<scope>): <subject>"
    exit 1
fi
```

```bash
chmod +x .git/hooks/commit-msg

# 团队共享钩子：存放到版本库并通过配置启用
mkdir -p .githooks
git config core.hooksPath .githooks
```

常用钩子：`pre-commit`（提交前，如跑测试/lint）、`commit-msg`（校验提交信息）、`pre-push`（推送前）、`post-merge`（合并后）。

---

## 7. bisect：二分定位引入 bug 的提交

```bash
git bisect start                       # 开始二分
git bisect bad                         # 标记当前提交有问题
git bisect good v1.0.0                 # 标记某个历史提交是好的

# Git 自动切换到中间提交，测试后告诉它结果：
git bisect bad                         # 当前提交有问题
git bisect good                        # 当前提交没问题

# 重复直到定位到第一个坏提交
git bisect reset                       # 结束并回到原分支

# 自动化二分（有测试脚本时）
git bisect run ./test.sh               # 脚本退出码 0=good，非 0=bad
```

---

## 8. 仓库维护与性能

```bash
git gc                             # 清理无用对象、压缩仓库
git gc --aggressive                # 深度压缩（大仓库耗时）
git prune                          # 清理不可达对象
git fsck --full                    # 检查仓库完整性
git count-objects -v               # 查看对象统计与磁盘占用
git rev-list --objects --all | wc -l    # 统计对象数

# 大文件处理：Git LFS
git lfs install
git lfs track "*.psd"
git add .gitattributes

# 部分克隆（超大仓库）
git clone --filter=blob:none <url>
git clone --depth 1 --sparse <url>
git sparse-checkout set src/main      # 稀疏检出指定目录
```

---

## 9. 常见问题排查

| 问题 | 原因 | 解决 |
|------|------|------|
| `git push` 被拒绝（non-fast-forward） | 远程有你本地没有的提交 | 先 `git pull --rebase` 再 push |
| 合并冲突 | 同一文件同一行被两边修改 | 手动编辑 → `git add` → `git commit` |
| detached HEAD | 检出标签或历史提交 | `git switch -c new-branch` 创建分支留住改动 |
| 提交到了错误分支 | 分支选错 | `git cherry-pick` 到正确分支 + `git reset --hard HEAD~1` |
| 提交了敏感信息 | 密码/密钥入库 | 立即改密钥，用 `git filter-repo` 或 BFG 清洗历史并强推 |
| 中文乱码 | 编码配置缺失 | `core.quotepath false` + `i18n.commitEncoding utf-8` |
| 换行符混乱 | Windows/Linux 差异 | 统一 `core.autocrlf`（Win=true，Linux=input） |
| 误删未提交文件 | 已 tracked 文件被删 | `git restore file.txt`；未 tracked 无法恢复 |
| 仓库过大 | 历史中提交过大文件 | `git lfs migrate` 或 `filter-repo` 清理历史 |

---

# 附录

## A. 常用命令速查表

| 场景 | 命令 |
|------|------|
| 配置 | `git config --global user.name/email` `git config --list` |
| 仓库 | `git init` `git clone` `git status` |
| 提交 | `git add` `git commit -m` `git commit --amend` |
| 查看 | `git log --oneline --graph --all` `git show` `git diff` `git blame` |
| 撤销 | `git restore` `git restore --staged` `git reset` `git revert` `git clean` |
| 分支 | `git branch` `git switch -c` `git switch` `git branch -d/-D` |
| 合并 | `git merge` `git merge --no-ff` `git rebase` `git cherry-pick` |
| 远程 | `git remote -v` `git fetch` `git pull` `git push -u` `git push --force-with-lease` |
| 临时 | `git stash` `git stash pop` `git stash list` |
| 标签 | `git tag -a` `git push --tags` |
| 恢复 | `git reflog` `git bisect` `git fsck` |
| 高级 | `git worktree` `git submodule` `git rebase -i` `git gc` |

## B. 分阶段练习项目

1. **入门**：本地建仓库，完成 5 次提交，用 `git log --oneline --graph` 查看历史
2. **撤销**：练习 `restore`、`--amend`、`reset --soft/--mixed/--hard` 的区别
3. **分支**：创建两个分支各自修改同一文件，制造并解决一次合并冲突
4. **远程**：本地建 bare 仓库当远程，练习 `clone`/`push`/`pull`/`fetch`
5. **整理**：用交互式 rebase 把 3 个提交合并成 1 个
6. **恢复**：故意 reset 掉提交，用 reflog 找回
7. **协作**：模拟 PR 流程，从同步主分支到推送 feature 分支

## C. 推荐资源

- Pro Git 中文书：https://git-scm.com/book/zh/v2
- Git 官方文档：https://git-scm.com/docs
- 可视化学习：https://learngitbranching.js.org/
- GitHub Skills：https://skills.github.com/

## D. 自测题

1. Git 与 SVN 的核心区别是什么？
2. 工作区、暂存区、本地仓库分别是什么？对应哪些命令？
3. `git add -A` 与 `git add -u` 有什么区别？
4. `git commit --amend` 会生成新的提交吗？什么情况下不该用它？
5. `git diff` 与 `git diff --cached` 分别比较什么？
6. `git restore` 与 `git restore --staged` 的区别？
7. `git reset --soft`、`--mixed`、`--hard` 分别保留哪些内容？
8. 已推送到远程的提交要撤销，为什么推荐 `revert` 而不是 `reset`？
9. 什么时候用 `merge`，什么时候用 `rebase`？
10. 解决冲突时 `<<<<<<< HEAD` 和 `>>>>>>>` 分别表示什么？
11. `git pull` 等价于哪两条命令？`--rebase` 参数改变了什么？
12. `git stash pop` 与 `git stash apply` 的区别？
13. 为什么 `.gitignore` 对已跟踪文件无效？如何解除跟踪？
14. `git push --force-with-lease` 比 `--force` 安全在哪里？
15. `git reflog` 能找回误删的提交吗？有什么限制？
16. `git cherry-pick` 适合什么场景？
17. 子模块保存的是什么？为什么父仓库不会自动更新子模块？
18. `git worktree` 解决了什么问题？
19. `git bisect` 的工作原理是什么？
20. 提交信息 Conventional Commits 规范的格式是什么？

---
