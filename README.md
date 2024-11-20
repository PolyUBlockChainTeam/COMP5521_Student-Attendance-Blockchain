# COMP5521 Student Attendance Blockchain

该项目实现了一个学生考勤系统，结合区块链技术和 Node.js 前后端。

## 1. naivecoin-master

**描述**：  
此部分包含 `naivecoin` 区块链的核心代码，用于运行区块链服务器。

**使用方式**：
```bash
node naivecoin-master/bin/naivecoin.js
```

**访问地址**：
http://localhost:3001

**功能**：
提供区块链服务器的功能，用于存储考勤记录等信息。

## 2. student_sign
**描述**：  
此部分包含基于 Node.js 的前端和后端代码，用于用户登录、注册以及考勤操作。

**使用方式**：

```bash
node student_sign/server.js
```

**访问地址**：
http://localhost:4000

**功能**：

1. 提供用户界面
2. 管理用户账号的后端逻辑
3. 与区块链服务器交互

## 3. 代码管理与协作

**Git 仓库地址**：
https://github.com/PolyUBlockChainTeam/COMP5521_Student-Attendance-Blockchain.git

**操作说明**：

**克隆仓库**：
```bash
git clone https://github.com/liu-qingyuan/COMP5521_Student-Attendance-Blockchain.git
```

**推送更改**：
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**更新代码**：
```bash
git pull origin main
```

**忽略 data 文件夹**：
如果不希望 data 文件夹被推送到 GitHub，请按照以下步骤操作：

**创建或编辑 .gitignore 文件，添加 data/ 到文件中**：

```bash
data/
```
**移除已被 Git 跟踪的 data 文件夹**：

```bash
git rm -r --cached data
```
**提交更改并推送**：

```bash
git add .gitignore
git commit -m "Ignore data folder and remove from Git tracking"
git push origin main
```
这样，data 文件夹将不再被 Git 跟踪，并且不会被推送到 GitHub。

请确保所有成员将代码推送到该仓库，便于协作开发与更新。