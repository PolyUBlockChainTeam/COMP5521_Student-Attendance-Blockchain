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



**操作说明**
**克隆仓库**：
首次使用时，将远程仓库克隆到本地：


```bash
git clone https://github.com/liu-qingyuan/COMP5521_Student-Attendance-Blockchain.git
```

**多人协作开发**
**1. 获取最新代码**：
在开始任何修改前，确保本地代码是最新的：


```bash
git fetch origin
git pull origin main
```

**2. 提交本地更改**：
```bash
git add .
git commit -m "Your commit message"
```


**3. 推送更改到远程仓库**：
```bash
git push origin main
```

**4. 处理冲突**：
如果远程仓库有其他人的修改，而你未同步就进行了提交，可能会出现冲突。解决冲突步骤如下：

拉取远程更新并尝试自动合并：
```bash
git pull origin main
```

如果有冲突，Git 会提示冲突文件，打开冲突文件，你会看到类似以下标记：
```diff
<<<<<<< HEAD
你的代码
=======
对方的代码
>>>>>>> 对方提交的commit-id
```

手动修改冲突部分，保留需要的代码。
**标记冲突已解决**：
```bash
git add <conflict_file>
```

**再次提交**：
```bash
git commit -m "Resolve merge conflict"
推送解决后的代码：
```bash
git push origin main
```
**5. 分支管理（推荐）**：
为了降低冲突风险，建议每个开发者在自己的分支开发：

```bash
git checkout -b feature/your-feature
```
开发完成后，先将主分支的更新合并到自己的分支：

```bash
git checkout feature/your-feature
git merge main
```
解决冲突后推送分支代码：

```bash
git push origin feature/your-feature
```
通过 Pull Request 提交分支合并到主分支，确保审核后再合并。

**忽略 data 文件夹**
如果不希望 data 文件夹被推送到 GitHub，请按照以下步骤操作：

**创建或编辑 .gitignore 文件，添加以下内容**：

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
从此，data 文件夹将不再被 Git 跟踪，并不会推送到 GitHub。

小贴士
随时同步远程仓库：避免提交较大修改后才同步，这样会增加冲突概率。
小步提交：更频繁地提交修改，减少冲突范围。
定期代码审查：通过 Pull Request 进行代码合并时，便于团队发现潜在问题。






















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



1. 从远程仓库同步最新代码
在提交你自己的代码之前，先确保你的本地仓库与远程仓库一致。执行以下命令：

```bash
git fetch origin
git pull origin main
```
git fetch 会更新本地对远程仓库的了解。
git pull 会将远程仓库的最新代码合并到你的本地分支。

2. 解决可能的冲突
如果你和另一位开发者修改了相同的文件，git pull 过程中可能会出现冲突。这时 Git 会提示哪些文件冲突。解决冲突的步骤如下：

* 打开冲突文件，查看冲突标记，例如：
```diff
<<<<<<< HEAD
你的代码
=======
对方的代码
>>>>>>> 对方提交的commit-id
```

* 手动修改冲突部分，保留需要的代码。
修改完成后，标记冲突已解决：
```bash
git add <conflict_file>
```

3. 提交你的修改
解决冲突后，可以正常提交你的代码：

```bash
git commit -m "说明你的修改内容"
```

4. 推送到远程仓库
将你的修改推送到远程仓库：

```bash
git push origin main
```

如果远程分支在你 git pull 后又有新的更新，推送时 Git 会拒绝。此时可以重复第1步（git pull 和解决冲突）再推送。

请确保所有成员将代码推送到该仓库，便于协作开发与更新。