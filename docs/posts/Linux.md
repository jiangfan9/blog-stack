---
title: Linux
date: 2022-07-28
categories: [工具]
tags: [Linux, Shell, 命令行, 运维]
description: Linux 学习笔记，涵盖常用命令、权限、进程、Shell 脚本、cron/systemd 与 SSH。
coverImg: /images/cover/Linux.png
permalink: /posts/linux
---

# Linux 系统学习文档

> 从常用命令到 Shell 脚本，再到系统实战，覆盖 Linux 日常使用与自动化运维的核心技能。  
> 全文命令与脚本示例基于 **GNU Bash 5.3 + GNU coreutils**，多数示例已在本机 Git Bash（MSYS 环境）实际运行验证。

---

## 写在前面

### Linux 是什么

Linux 是一类 Unix 风格的开源操作系统，广泛应用于服务器、嵌入式、云计算与开发环境。学习 Linux 的核心是掌握**命令行**（CLI），因为服务器通常没有图形界面，一切操作都通过命令完成。

本文档主线：

| 篇章   | 内容                             |
| ---- | ------------------------------ |
| 第一部分 | 常用命令：文件操作、文本处理、权限、进程、网络、压缩     |
| 第二部分 | Shell 脚本：变量、条件、循环、函数、数组、调试、实战  |
| 第三部分 | 进阶实战：管道、定时任务、服务管理、SSH、包管理、最佳实践 |

### 环境说明

| 项目    | 说明                                                            |
| ----- | ------------------------------------------------------------- |
| 验证环境  | Git Bash（MSYS / GNU Bash 5.3.15），提供 GNU 核心工具                  |
| 可验证内容 | grep / sed / awk / find / xargs / tar / 管道重定向 / Shell 语法      |
| 仅理论说明 | systemctl、crontab、包管理（apt/yum）、用户管理等系统级命令（本机为 Windows，无法实际执行） |
| 适用发行版 | 命令示例适用于主流发行版（Ubuntu/CentOS/Debian），差异处会标注                     |

> **提示**：Linux 命令的大小写敏感、参数短横线（-）与长参数（--）的区别、空格分隔等细节非常重要，初学时建议逐条敲命令观察输出。

### 术语约定

```text
# 表示 root 用户提示符
$ 表示普通用户提示符
command  —— 命令
[option] —— 可选参数
<file>   —— 必填参数（文件/路径）
```

---

# 第一部分：Linux 常用命令

## 1. Linux 目录结构与基础概念

### 1.1 目录结构

```text
/                    根目录
├── bin/             基础命令（二进制）
├── etc/             系统配置文件
├── home/            普通用户家目录
├── root/            root 用户家目录
├── usr/             用户程序与资源
│   ├── bin/         用户命令
│   └── local/       本地安装软件
├── var/             可变数据（日志、缓存）
│   └── log/         日志文件
├── tmp/             临时文件
├── opt/             第三方软件
└── proc/            进程与内核信息（虚拟文件系统）
```

### 1.2 绝对路径与相对路径

```bash
pwd                    # 显示当前目录（print working directory）
cd /etc                # 绝对路径：从根目录开始
cd ../home             # 相对路径：上一级目录再进 home
cd ~                   # 进入当前用户家目录
cd -                   # 返回上一个工作目录
```

### 1.3 命令帮助

```bash
command --help         # 查看命令简要帮助
man command            # 查看命令手册（按 q 退出）
type command           # 查看命令类型（内建/外部/别名）
which command          # 查看命令所在路径
history                # 查看历史命令
```

## 2. 文件与目录操作

### 2.1 列出目录（ls）

```bash
ls                     # 列出当前目录
ls -l                  # 长格式（权限、所有者、大小、时间）
ls -a                  # 显示隐藏文件（以 . 开头）
ls -la                 # 组合：长格式 + 隐藏文件
ls -lh                 # 人类可读的大小（K/M/G）
ls -lt                 # 按修改时间排序
ls -R                  # 递归列出子目录
```

输出示例（`ls -l`）：

```text
-rw-r--r--  1 user  staff  1024 Jan 10 10:30 notes.txt
drwxr-xr-x  3 user  staff   128 Jan 11 09:15 docs
```

第一位：`-` 表示普通文件，`d` 表示目录，`l` 表示软链接。

### 2.2 切换与创建（cd / mkdir / touch）

```bash
mkdir mydir            # 创建目录
mkdir -p a/b/c         # 递归创建多级目录（父目录不存在也创建）
touch file.txt         # 创建空文件 / 更新文件时间戳
```

### 2.3 复制、移动、删除（cp / mv / rm）

```bash
cp a.txt b.txt         # 复制文件
cp -r dir1 dir2        # 递归复制目录
cp -p src dest         # 保留权限、时间戳等属性
mv a.txt b.txt         # 移动 / 重命名
mv a.txt /tmp/         # 移动到目录
rm file.txt            # 删除文件
rm -r dir              # 递归删除目录
rm -f file.txt         # 强制删除（不提示）
rm -rf dir             # 强制递归删除（危险！谨慎使用）
```

> **安全提示**：`rm -rf` 极其危险，尤其配合通配符。删除前务必确认路径，生产环境可先用 `echo rm -rf ...` 预览。

### 2.4 查找文件（find）

```bash
find . -name "*.log"                    # 按名称查找
find . -type f -name "*.txt"            # 只找普通文件
find . -type d -name "node_modules"     # 只找目录
find . -size +100M                      # 大于 100MB 的文件
find . -mtime -7                        # 7 天内修改过的文件
find . -name "*.tmp" -delete            # 查找并删除
find . -name "*.log" -exec grep -l "ERROR" {} \;  # 对结果执行命令
```

`-exec` 说明：`{}` 代表找到的文件，`\;` 是命令结束标志。

## 3. 查看文件内容

### 3.1 显示全文（cat / less / more）

```bash
cat file.txt           # 显示整个文件
cat -n file.txt        # 显示行号
less file.txt          # 分页查看（q 退出，/ 搜索）
head -n 10 file.txt    # 显示前 10 行
tail -n 20 file.txt    # 显示后 20 行
tail -f app.log        # 实时追踪日志（跟随文件末尾）
```

### 3.2 统计（wc）

```bash
wc file.txt            # 统计行数、单词数、字节数
wc -l file.txt         # 只统计行数
wc -c file.txt         # 只统计字节数
echo "hello world" | wc -w   # 只统计单词数（通过管道）
```

> 验证示例：对 `fruits.txt`（4 行）执行 `wc -l` 输出 `4 fruits.txt`。

## 4. 文本处理三剑客

### 4.1 grep：文本搜索

```bash
grep "error" app.log              # 查找包含 error 的行
grep -i "error" app.log           # 忽略大小写
grep -n "error" app.log           # 显示行号
grep -v "error" app.log           # 反向匹配（不含 error）
grep -c "error" app.log           # 统计匹配行数
grep -r "TODO" ./src              # 递归搜索目录
grep -E "error|warn" app.log      # 扩展正则（或）
grep -l "error" *.log             # 只列出匹配的文件名
```

验证示例（对 `fruits.txt` 内容 `apple 10 / banana 20 / cherry 30 / apple 15`）：

```bash
grep -n 'apple' fruits.txt
# 1:apple 10
# 4:apple 15
```

### 4.2 sed：流编辑器（替换为主）

```bash
sed 's/old/new/' file.txt          # 替换每行第一个 old
sed 's/old/new/g' file.txt         # 全局替换（g = global）
sed -i 's/old/new/g' file.txt      # 直接修改文件（in-place）
sed -n '2,5p' file.txt             # 只打印第 2~5 行
sed '/pattern/d' file.txt          # 删除匹配行
sed 's/^[ \t]*//' file.txt         # 删除行首空白
```

验证示例：

```bash
sed 's/apple/APPLE/' fruits.txt
# APPLE 10
# banana 20
# cherry 30
# APPLE 15
```

### 4.3 awk：文本分析与报表

```bash
awk '{print $1}' file.txt          # 打印第一列（默认空格分隔）
awk '{print $1, $2}' file.txt      # 打印前两列
awk -F: '{print $1}' /etc/passwd   # 指定冒号为分隔符
awk '$2 > 15 {print $1}' fruits.txt   # 条件过滤
awk '{sum+=$2} END{print sum}' fruits.txt   # 求和
```

验证示例：

```bash
awk '{sum+=$2} END{print "total="sum}' fruits.txt
# total=75

awk '{s[$1]+=$2} END{for(k in s) print k,s[k]}' fruits.txt | sort
# apple 25
# banana 20
# cherry 30
```

### 4.4 辅助工具（cut / sort / uniq / tr）

```bash
cut -d' ' -f1 fruits.txt           # 按空格分隔取第 1 列
sort fruits.txt                    # 排序
sort -n fruits.txt                 # 数值排序
sort -r fruits.txt                 # 逆序
uniq                               # 去重（通常配合 sort）
uniq -c                            # 统计重复次数
tr 'a-z' 'A-Z'                     # 大小写转换
```

验证示例：

```bash
cut -d' ' -f1 fruits.txt | sort | uniq -c
#       2 apple
#       1 banana
#       1 cherry
```

## 5. 权限管理

### 5.1 权限表示

```text
-rwxr-xr--  1 user group  size  file
│└──┬──┘└─┬──┘
│   │     └── 其他用户权限（r--）
│   └──────── 组用户权限（rwx）
└──────────── 文件类型（- 文件，d 目录，l 链接）

权限字符：r=读(4)  w=写(2)  x=执行(1)  -=无权限(0)
```

### 5.2 chmod：修改权限

```bash
chmod 755 script.sh        # 数字法：rwxr-xr-x
chmod u+x script.sh        # 符号法：给所有者加执行权限
chmod g-w file.txt         # 去掉组写权限
chmod a+r file.txt         # 所有人加读权限
chmod -R 755 dir           # 递归修改目录权限
```

常用权限值：

| 数值  | 权限        | 含义              |
| --- | --------- | --------------- |
| 644 | rw-r--r-- | 普通文件（可读写，其他人只读） |
| 755 | rwxr-xr-x | 可执行程序/脚本        |
| 600 | rw------- | 仅自己可读写（私密文件）    |
| 777 | rwxrwxrwx | 所有人可读写执行（谨慎使用）  |

### 5.3 chown：修改所有者

```bash
chown user file.txt            # 修改所有者
chown user:group file.txt      # 修改所有者和组
chown -R user:group dir        # 递归修改
```

## 6. 用户与组（理论）

> 以下命令需 root 权限，本机 Windows 环境无法实际执行，仅作语法说明。

```bash
whoami                    # 查看当前用户
id                        # 查看用户 ID 与所属组
useradd alice             # 创建用户
passwd alice              # 设置密码
usermod -aG sudo alice    # 将用户加入 sudo 组
userdel alice             # 删除用户
groupadd dev              # 创建组
su - alice                # 切换用户
sudo command              # 以管理员权限执行
```

## 7. 进程管理（部分可验证）

```bash
ps                        # 查看当前进程
ps aux                    # 查看所有进程（BSD 风格）
ps -ef                    # 查看所有进程（System V 风格）
ps aux | grep nginx       # 查找特定进程
top                       # 动态查看进程（类似任务管理器）
htop                      # top 的增强版（需安装）
kill 1234                 # 终止进程（PID）
kill -9 1234              # 强制终止
killall nginx             # 按名称终止进程
jobs                      # 查看后台任务
nohup command &           # 后台运行（退出终端不中断）
```

> 本机 Git Bash 支持 `ps`、`kill` 等命令，但输出格式与 Linux 略有差异；`top`/`systemctl` 不适用。

## 8. 磁盘与系统信息

```bash
df -h                     # 磁盘使用情况（人类可读）
du -sh dir                # 目录总大小
du -h --max-depth=1       # 各子目录大小
free -h                   # 内存使用情况（Linux）
uname -a                  # 系统信息
uptime                    # 运行时间与负载
date                      # 当前时间
```

## 9. 网络命令（部分可验证）

```bash
ping host                 # 测试连通性
curl https://example.com  # 请求 URL（本机可用）
wget url                  # 下载文件
ifconfig / ip addr        # 查看网络接口（Linux）
netstat -tuln             # 查看监听端口（Linux）
ss -tuln                  # netstat 的替代（Linux）
ssh user@host             # 远程登录
scp file user@host:/path  # 远程复制文件
```

## 10. 压缩与归档

```bash
# tar：归档（常配合 gzip）
tar -cvf archive.tar dir       # 打包（c=创建，v=详细，f=文件）
tar -xvf archive.tar           # 解包
tar -czvf archive.tar.gz dir   # 打包 + gzip 压缩
tar -xzvf archive.tar.gz       # 解压 gzip 包
tar -tzf archive.tar.gz        # 查看压缩包内容

# gzip / zip
gzip file.txt                  # 压缩为 file.txt.gz
gunzip file.txt.gz             # 解压
zip -r archive.zip dir         # 递归压缩为 zip
unzip archive.zip              # 解压 zip
```

常用参数记忆：

| 参数 | 含义           |
| -- | ------------ |
| -c | create，创建归档  |
| -x | extract，解包   |
| -z | gzip，压缩/解压   |
| -v | verbose，显示过程 |
| -f | file，指定文件名   |
| -t | list，查看内容    |

---

# 第二部分：Shell 脚本

## 1. 第一个 Shell 脚本

Shell 脚本是包含一系列命令的文本文件，由 Shell 解释器执行。

```bash
#!/bin/bash
# 第一个脚本：hello.sh
echo "Hello, Shell!"

name="World"
echo "Hello, $name!"
```

运行方式：

```bash
# 方式一：用 bash 解释执行
bash hello.sh

# 方式二：赋予执行权限后直接运行
chmod +x hello.sh
./hello.sh
```

脚本开头 `#!/bin/bash` 称为 shebang，指定解释器。

## 2. 变量

### 2.1 定义与使用

```bash
#!/bin/bash
name="Alice"          # 定义变量（等号两边不能有空格）
age=20
echo "Name: $name, Age: $age"
echo "Name: ${name}!"  # 花括号界定变量名边界

# 只读变量
readonly PI=3.14

# 环境变量导出
export MY_VAR="value"
```

### 2.2 变量作用域与特殊变量

```bash
#!/bin/bash
echo "脚本名: $0"
echo "第一个参数: $1"
echo "第二个参数: $2"
echo "参数个数: $#"
echo "所有参数: $@"
echo "上一个命令退出码: $?"
echo "当前进程 PID: $$"
```

运行 `bash script.sh a b` 输出：

```text
脚本名: script.sh
第一个参数: a
第二个参数: b
参数个数: 2
所有参数: a b
上一个命令退出码: 0
当前进程 PID: 12345
```

### 2.3 命令替换

```bash
#!/bin/bash
now=$(date)              # 命令替换（推荐 $() 语法）
files=$(ls -l)
echo "当前时间: $now"

# 旧写法（反引号，不推荐）
old_style=`date`
```

## 3. 引号的区别

```bash
#!/bin/bash
name="Alice"

echo "$name"       # 双引号：变量会展开 → Alice
echo '$name'       # 单引号：原样输出   → $name
echo \$name        # 反斜杠转义        → $name
echo "Hello, ${name}!"  # 花括号明确边界
```

## 4. 条件判断

### 4.1 if 语句

```bash
#!/bin/bash
score=85

if [ $score -ge 90 ]; then
    echo "优秀"
elif [ $score -ge 60 ]; then
    echo "及格"
else
    echo "不及格"
fi
```

> 注意：`[` 是命令，左右两边必须有空格。`then` 前用分号或换行。

### 4.2 测试条件

```bash
# 数值比较
[ $a -eq $b ]    # 等于
[ $a -ne $b ]    # 不等于
[ $a -gt $b ]    # 大于
[ $a -lt $b ]    # 小于
[ $a -ge $b ]    # 大于等于
[ $a -le $b ]    # 小于等于

# 字符串比较
[ "$a" = "$b" ]  # 相等
[ "$a" != "$b" ] # 不等
[ -z "$a" ]      # 空字符串
[ -n "$a" ]      # 非空字符串

# 文件测试
[ -f file ]      # 是普通文件
[ -d dir ]       # 是目录
[ -e path ]      # 存在
[ -r file ]      # 可读
[ -x file ]      # 可执行

# 逻辑组合
[ $a -gt 0 ] && [ $b -gt 0 ]   # 与
[ $a -gt 0 ] || [ $b -gt 0 ]   # 或
```


### 4.3 case 语句

```bash
#!/bin/bash
read -p "输入一个字母: " ch

case $ch in
    [a-z]) echo "小写字母" ;;
    [A-Z]) echo "大写字母" ;;
    [0-9]) echo "数字" ;;
    *)     echo "其它字符" ;;
esac
```

## 5. 循环

### 5.1 for 循环

```bash
#!/bin/bash
# 遍历列表
for fruit in apple banana cherry; do
    echo "水果: $fruit"
done

# 数字范围
for i in {1..5}; do
    echo "数字: $i"
done

# C 风格
for ((i=0; i<5; i++)); do
    echo "i=$i"
done
```

### 5.2 while 与 until

```bash
#!/bin/bash
count=1
while [ $count -le 3 ]; do
    echo "count=$count"
    count=$((count + 1))    # 算术运算
done

# until：条件为假时执行
n=1
until [ $n -gt 3 ]; do
    echo "n=$n"
    n=$((n+1))
done
```

### 5.3 循环控制

```bash
#!/bin/bash
for i in {1..5}; do
    if [ $i -eq 3 ]; then
        continue         # 跳过本次
    fi
    if [ $i -eq 5 ]; then
        break            # 结束循环
    fi
    echo "i=$i"
done
# 输出：i=1 i=2 i=4
```

## 6. 函数

```bash
#!/bin/bash
# 定义函数
greet() {
    local name=$1        # local：局部变量
    echo "Hello, $name!"
}

# 调用函数
greet "Alice"
greet "Bob"

# 带返回值的函数
add() {
    local sum=$(($1 + $2))
    echo $sum            # 通过 echo 返回结果
}

result=$(add 3 5)
echo "3 + 5 = $result"

# return 只能返回 0~255 的整数（退出码）
is_even() {
    return $(($1 % 2))   # 偶数返回 0，奇数返回 1
}
if is_even 4; then echo "4 是偶数"; fi
```

## 7. 数组

```bash
#!/bin/bash
# 定义数组
fruits=("apple" "banana" "cherry")

# 访问元素（下标从 0 开始）
echo ${fruits[0]}        # apple
echo ${fruits[1]}        # banana

# 所有元素
echo ${fruits[@]}        # apple banana cherry
echo ${fruits[*]}        # apple banana cherry

# 数组长度
echo ${#fruits[@]}       # 3

# 遍历
for fruit in "${fruits[@]}"; do
    echo "水果: $fruit"
done

# 修改元素
fruits[0]="APPLE"
echo ${fruits[0]}        # APPLE
```

## 8. 字符串处理

```bash
#!/bin/bash
s="Hello, World!"

echo ${#s}               # 字符串长度：13
echo ${s:0:5}            # 子串（从 0 开始取 5 个）：Hello
echo ${s:7}              # 从位置 7 到结尾：World!
echo ${s/World/Linux}    # 替换第一个：Hello, Linux!
echo ${s//l/L}           # 替换所有 l：HeLLo, WorLd!

# 默认值
echo ${name:-"default"}  # 变量为空时用默认值（不改变原变量）
echo ${name:="default"}  # 变量为空时赋值默认值（会修改原变量！）
echo $name               # 此时 name 已被赋值为 default
```

## 9. 输入、输出与重定向

### 9.1 标准输入输出

```bash
echo "hello"             # 输出到标准输出
read name                # 从标准输入读取
read -p "请输入姓名: " name   # 带提示的读取
read -s -p "密码: " pwd      # 静默读取（不回显）
```

### 9.2 重定向

```bash
command > file.txt       # 标准输出覆盖写入文件
command >> file.txt      # 标准输出追加到文件
command 2> error.log     # 标准错误写入文件
command > out.log 2>&1   # 输出和错误都写入同一文件
command &> all.log       # 同上（简写）
command < input.txt      # 从文件读取输入
```

### 9.3 管道

```bash
cat fruits.txt | grep apple | wc -l
# 统计含 apple 的行数 → 2

ps aux | grep nginx | grep -v grep
# 查找 nginx 进程（排除 grep 自身）
```

## 10. 算术运算

```bash
#!/bin/bash
a=10
b=3

echo $((a + b))          # 13
echo $((a - b))          # 7
echo $((a * b))          # 30
echo $((a / b))          # 3（整数除法）
echo $((a % b))          # 1（取余）

# 自增
((a++))
echo $a                  # 11

# 浮点运算需借助 bc
echo "scale=2; 10 / 3" | bc    # 3.33（需安装 bc）
```

## 11. 正则表达式（grep -E）

```bash
#!/bin/bash
# 常用正则元字符：^ 开头  $ 结尾  . 任意字符  * 重复  [] 字符集合

echo "apple" | grep -E '^a'        # 以 a 开头
echo "apple" | grep -E 'e$'        # 以 e 结尾
echo "color colour" | grep -E 'colou?r'   # ? 表示前一个字符可选

# 实战：校验邮箱格式（简化版）
email="user@example.com"
if echo "$email" | grep -Eq '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'; then
    echo "邮箱格式正确"
else
    echo "邮箱格式错误"
fi
```

## 12. 调试与错误处理

```bash
#!/bin/bash
# 调试模式
set -x                   # 打印每条执行的命令（调试）
set -e                   # 命令失败时立即退出
set -u                   # 使用未定义变量时报错
set -o pipefail          # 管道中任一命令失败则整体失败

# 推荐组合（脚本开头）
set -euo pipefail

# 错误处理
if ! command; then
    echo "命令执行失败" >&2
    exit 1
fi

#  trap：捕获退出信号做清理
trap 'echo "脚本退出，执行清理"' EXIT
```

## 13. 实战脚本案例

### 13.1 批量重命名

```bash
#!/bin/bash
# 将当前目录下所有 .txt 文件重命名为 .bak
for file in *.txt; do
    [ -e "$file" ] || continue    # 无匹配文件时跳过
    mv "$file" "${file%.txt}.bak"
    echo "重命名: $file → ${file%.txt}.bak"
done
```

### 13.2 日志分析

```bash
#!/bin/bash
# 统计日志中不同级别的出现次数
LOG_FILE=${1:-app.log}

if [ ! -f "$LOG_FILE" ]; then
    echo "错误: 文件 $LOG_FILE 不存在" >&2
    exit 1
fi

echo "=== 日志级别统计 ==="
grep -oE 'ERROR|WARN|INFO' "$LOG_FILE" | sort | uniq -c | sort -rn
```

### 13.3 系统健康检查

```bash
#!/bin/bash
# 系统健康检查脚本（概念示例，部分命令需 Linux）
set -euo pipefail

echo "=== 系统健康检查 ==="
echo "时间: $(date)"
echo "磁盘使用:"
df -h | head -5

echo "内存使用:"
free -h 2>/dev/null || echo "（当前环境不支持 free）"

echo "CPU 负载:"
uptime

# 检查磁盘使用率是否超过 90%
usage=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$usage" -gt 90 ]; then
    echo "警告: 磁盘使用率 ${usage}% 超过 90%!" >&2
fi
```

### 13.4 备份脚本

```bash
#!/bin/bash
# 按日期打包备份指定目录
SOURCE_DIR=${1:-./data}
BACKUP_DIR=${2:-./backups}
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/backup_${DATE}.tar.gz" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")"

if [ $? -eq 0 ]; then
    echo "备份成功: $BACKUP_DIR/backup_${DATE}.tar.gz"
else
    echo "备份失败" >&2
    exit 1
fi
```

---

# 第三部分：Linux 进阶与实战

## 1. 管道与重定向深入

### 1.1 组合命令解决复杂问题

```bash
# 统计当前目录下各扩展名的文件数量
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# 找出占用空间最大的 10 个文件
find . -type f -exec du -h {} + | sort -rh | head -10

# 统计代码行数（排除空行和注释）
find . -name "*.sh" -exec cat {} + | grep -v '^\s*#' | grep -v '^\s*$' | wc -l
```

### 1.2 tee 命令

```bash
command | tee output.txt          # 输出到屏幕同时写入文件
command | tee -a output.txt       # 追加写入
```

## 2. 环境变量

```bash
# 查看环境变量
env
printenv
echo $PATH
echo $HOME

# 临时设置（仅当前命令）
MY_VAR=value command

# 导出到子进程
export MY_VAR=value

# 配置文件（登录时加载）
# ~/.bashrc   —— 交互式 shell
# ~/.bash_profile / ~/.profile —— 登录 shell
```

添加 PATH 示例：

```bash
# 在 ~/.bashrc 末尾添加
export PATH="$PATH:/home/user/mybin"

# 使配置立即生效
source ~/.bashrc
```

## 3. 定时任务 cron（理论）

> cron 是 Linux 系统级定时任务服务，本机无法实际执行，仅作语法说明。

```bash
crontab -e              # 编辑当前用户的定时任务
crontab -l              # 列出定时任务
crontab -r              # 删除所有定时任务
```

cron 表达式格式：

```text
分 时 日 月 周  命令
*  *  *  *  *   command
```

```bash
# 每 5 分钟执行一次
*/5 * * * * /path/to/script.sh

# 每天凌晨 2 点执行
0 2 * * * /path/to/backup.sh

# 每周一上午 9 点执行
0 9 * * 1 /path/to/report.sh

# 每月 1 日凌晨执行
0 0 1 * * /path/to/monthly.sh
```

## 4. 服务管理 systemd（理论）

```bash
systemctl status nginx       # 查看服务状态
systemctl start nginx        # 启动服务
systemctl stop nginx         # 停止服务
systemctl restart nginx      # 重启服务
systemctl enable nginx       # 设置开机自启
systemctl disable nginx      # 取消开机自启
systemctl list-units --type=service  # 列出所有服务
journalctl -u nginx -f       # 查看服务日志
```

## 5. 远程操作 SSH / SCP

```bash
# SSH 登录
ssh user@192.168.1.100
ssh -p 2222 user@host        # 指定端口

# SCP 复制
scp file.txt user@host:/remote/path/          # 上传
scp user@host:/remote/file.txt ./local/       # 下载
scp -r dir user@host:/remote/path/            # 递归复制目录

# 免密登录配置
ssh-keygen -t rsa            # 生成密钥对
ssh-copy-id user@host        # 将公钥复制到远程主机
```

## 6. 软件包管理（理论）

| 发行版           | 包管理器    | 安装命令                       |
| ------------- | ------- | -------------------------- |
| Debian/Ubuntu | apt     | `sudo apt install package` |
| CentOS/RHEL   | yum/dnf | `sudo yum install package` |
| Arch          | pacman  | `sudo pacman -S package`   |
| macOS         | brew    | `brew install package`     |

```bash
# Ubuntu/Debian
sudo apt update              # 更新软件源索引
sudo apt install nginx       # 安装软件
sudo apt remove nginx        # 卸载软件
sudo apt search keyword      # 搜索软件

# CentOS/RHEL
sudo yum update
sudo yum install nginx
sudo yum remove nginx
```

## 7. Shell 进阶技巧

### 7.1 引号与通配符的坑

```bash
# 变量加双引号防止空格拆分
for file in "$@"; do echo "$file"; done

# glob 通配符
ls *.txt                     # 所有 txt 文件
ls ?.txt                     # 单字符文件名
find . -name "[ab]*.txt"     # a 或 b 开头
```

### 7.2 here-doc 与 here-string

```bash
# here-doc：多行输入
cat <<EOF > config.txt
name=Alice
age=20
EOF

# here-string：单行输入
grep "Alice" <<< "Hello Alice"
```

### 7.3 子 shell 与作用域

```bash
#!/bin/bash
count=0

# 管道会创建子 shell，变量修改不影响外部
echo "a" | while read line; do
    count=$((count+1))
done
echo $count        # 仍然是 0

# 用进程替换避免子 shell
while read line; do
    count=$((count+1))
done < <(echo "a")
echo $count        # 1
```

## 8. 性能优化与最佳实践

### 8.1 命令优化

```bash
# 避免无用 cat
cat file.txt | grep "x"     # 不推荐
grep "x" file.txt           # 推荐（少一个进程）

# 优先用内置命令
# echo、printf、test 是 shell 内置，比外部命令快

# 大量文件用 xargs 批量处理
find . -name "*.log" -print0 | xargs -0 grep -l "ERROR"
```

### 8.2 脚本最佳实践清单

- 脚本开头写 `#!/bin/bash` 和 `set -euo pipefail`，提升健壮性。
- 变量引用一律加双引号（`"$var"`），避免空格和空值问题。
- 使用 `local` 声明函数内变量，避免全局污染。
- 命令替换用 `$()` 而非反引号。
- 错误处理写入 stderr（`>&2`），并以非零码退出。
- 测试条件用 `[[ ]]`（bash 增强版）更安全，支持模式匹配。
- 复杂脚本用 `shellcheck` 做静态检查。

## 9. 常见问题排查

```text
Q: 执行脚本报 "Permission denied"？
A: 需要 chmod +x script.sh 赋予执行权限，或用 bash script.sh 运行。

Q: 报 "$'\r': command not found"？
A: 脚本含 Windows 换行符（CRLF），用 dos2unix 转换或 sed -i 's/\r$//' 处理。

Q: 变量在管道中修改后不生效？
A: 管道创建子 shell，用进程替换 `< <(...)` 或 here-string 避免。

Q: grep 匹配到二进制文件乱码？
A: 加 -I 参数忽略二进制文件，或用 -a 强制当文本处理。

Q: 中文文件名乱码？
A: 检查 locale 设置，确保 UTF-8 编码（export LANG=zh_CN.UTF-8）。
```

---

# 附录

## 学习路线建议

| 阶段    | 内容                    | 目标               |
| ----- | --------------------- | ---------------- |
| 第 1 周 | 常用命令篇 1~10            | 熟练文件操作、文本处理、权限管理 |
| 第 2 周 | Shell 脚本篇 1~10        | 能编写中等复杂度的自动化脚本   |
| 第 3 周 | Shell 脚本篇 11~13 + 进阶篇 | 掌握调试、实战脚本、系统管理   |

## 练习项目

1. 写一个脚本统计指定目录下不同类型文件的数量。
2. 写一个日志分析脚本，统计 HTTP 状态码分布（200/404/500）。
3. 写一个批量重命名脚本，将文件名中的空格替换为下划线。
4. 写一个备份脚本，按日期归档并保留最近 7 天的备份。
5. 写一个系统监控脚本，当磁盘使用率超过阈值时发邮件告警。
6. 用 awk 写一个报表脚本，统计 CSV 文件中各分类的销售额。

## 推荐资源

- GNU Bash 手册：<https://www.gnu.org/software/bash/manual/>
- Linux 命令大全：<https://www.runoob.com/linux/linux-command-manual.html>
- ShellCheck（脚本静态检查）：<https://www.shellcheck.net/>
- ExplainShell（命令解析）：<https://explainshell.com/>

## 自测题

1. `ls -la` 输出中第一列的 `-` 和 `d` 分别表示什么？
2. `rm -rf` 为什么危险？使用前应如何确认？
3. `grep -v`、`grep -n`、`grep -c`、`grep -E` 分别有什么作用？
4. `sed 's/old/new/g'` 中 `g` 的作用是什么？`-i` 参数有什么风险？
5. awk 中 `$1`、`$2`、`$0` 分别表示什么？`END` 块何时执行？
6. 权限 `755` 和 `644` 分别代表什么？
7. Shell 中单引号和双引号的区别是什么？
8. `$?`、`$#`、`$@`、`$0` 分别代表什么？
9. `[` 条件测试时为什么左右要有空格？
10. `for i in {1..5}` 和 `for ((i=0;i<5;i++))` 有什么区别？
11. Shell 函数中如何用 `return` 和 `echo` 返回结果？各自适用场景是什么？
12. `${var:-default}` 与 `${var:=default}` 的区别是什么？
13. `>` 与 `>>` 的区别是什么？如何将错误输出也重定向到文件？
14. 为什么管道中的变量修改不影响外部？如何避免？
15. `set -euo pipefail` 三个选项分别有什么作用？
