# Git 规约

本规范基于 [阿里巴巴 f2e-spec](https://github.com/alibaba/f2e-spec) 制定。

## 提交消息格式

### 1.1 Conventional Commits

**推荐** 使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)格式：

```
<类型>[范围]: <描述>

[正文]

[脚注]
```

### 1.2 类型定义

| 类型 | 说明 |
|------|------|
| `feat` | 新增功能 |
| `fix` | 修复 bug |
| `docs` | 文档相关 |
| `style` | 代码格式（逻辑不变） |
| `test` | 测试用例 |
| `refactor` | 重构/优化 |
| `chore` | 工程方面（逻辑不变） |
| `revert` | 恢复之前的提交 |

### 1.3 描述规则

1. **时态**：使用一般现在时，不用过去时
2. **句式**：祈使句，不加主语
3. **格式**：句首无需大写，句尾无需标点

```bash
# good
docs: delete redundant docs
fix: handle null pointer exception
feat: add user authentication

# bad
Deleted redundant docs.            # 过去时 + 句号
I added user authentication         # 主语
docs: Added user authentication     # 过去时
```

### 1.4 正文与脚注

**正文** (body) 描述详细提交内容，使用一般现在时。

**脚注** (footer) 用于：
- 代码评审记录：`Reviewed-by: Name <email>`
- 签名：`Signed-off-by: Author <email>`
- 关闭 Issues：`Closes #123`
- 破坏性变更：`BREAKING CHANGE: ...`

```bash
# 示例
feat(auth): add JWT token refresh

Implement token refresh mechanism with 24h expiry.
Refresh token stored in httpOnly cookie.

Closes #456
Reviewed-by: Alice <alice@example.com>
```

## 分支命名

### 2.1 常驻分支

单分支模式：`main`
多分支模式：`main`, `feature`, `next`, `x.x`

### 2.2 临时分支

```
<类型>/[问题编号]<描述>
```

```bash
# good
feat/shopping-cart
feat/1023-crash-on-search
fix/3012-memory-leak
refactor/user-service

# bad
new_feature              # 中文或下划线
my-change                # 不描述性
```

## 工作流选择

### 3.1 No Flow

单人维护项目 → 直接在 `main` 分支提交

### 3.2 GitHub Flow / One Flow

敏捷开发 → 单一 `main` 分支
从主分支创建 `feature`/`hotfix`，开发完成后合并回主分支

### 3.3 Git Flow

有固定发布周期 → 多维护分支
`main`（发布）、`develop`（开发）、`feature/*`（功能）、`release/*`（发布分支）、`hotfix/*`（热修复）

## 标签命名

### 4.1 版本号

版本号必须符合[语义化版本](https://semver.org/lang/zh-CN/)：`vMAJOR.MINOR.PATCH`

```bash
# good
v1.0.0
v1.0.0-rc.1
v1.0.0-beta.2

# bad
v1              # 缺少 minor 和 patch
v1.02.0         # 前导零
```

### 4.2 Tag 规则

- 正式版本 Tag 必须位于主分支
- 推荐以 `v` 开头
- Monorepo 独立版本：`@foo/bar@1.2.2`

## Git 配置

### 5.1 用户信息

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 5.2 提交模板

创建 `.gitcommitmsg` 文件：

```
[类型][范围]: 简要描述

详细说明（可选）

Closes #Issue号
Reviewed-by: 评审人
```

### 5.3 常用别名

```bash
# .gitconfig
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --graph --oneline --all
```

## 常用命令速查

```bash
# 创建并切换分支
git switch -c feat/new-feature

# 暂存特定文件
git add src/components/Button.tsx

# 修改最后一次提交
git commit --amend

# 变基（整理提交历史）
git rebase -i HEAD~3

# 查看提交历史
git log --oneline --graph --all

# 储藏工作区
git stash push -m "WIP: work in progress"

# 清理已合并的分支
git branch --merged main | grep -v 'main' | xargs git branch -d
```