# project-teams-spec

[![npm 版本](https://img.shields.io/npm/v/project-teams-spec?style=flat-square)](https://www.npmjs.com/package/project-teams-spec)
[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js 版本](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)

多代理工程规范执行系统。提供标准化的 Skill 定义、Agent 定义和规则集，可注入到各 CLI 工具目录，使工具能够以统一范式协作完成业务目标。

## 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [架构](#架构)
- [支持的工具](#支持的工具)
- [命令系统](#命令系统)
- [Skills 概览](#skills-概览)
- [Agents](#agents)
- [目录结构](#目录结构)
- [故障排除](#故障排除)
- [贡献指南](#贡献指南)
- [更新日志](#更新日志)
- [许可证](#许可证)

## 功能特性

- **标准化流程**: 12 个 Skill 覆盖从项目分析到交付归档的完整流程
- **里程碑驱动交付**: 大型/复杂项目支持用户检查点迭代交付
- **多 Agent 协作**: 支持 Java、Frontend、Backend、QA、Code Reviewer 等 Agent
- **多工具支持**: 兼容 Claude Code、OpenCode、Trae 等 CLI 工具
- **命令生成**: 自动生成带命名空间的命令（如 `/pts:analyze`）
- **交互式安装**: 欢迎页面 + 工具多选，开箱即用
- **灵活粒度**: INSTRUCTIONS 支持 intent / procedural / protocol / conversational 四种粒度

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn

### 安装

```bash
# 通过 npm 全局安装
npm install -g project-teams-spec

# 或直接使用 npx
npx project-teams-spec install
```

### 交互式安装

```bash
# 不带参数运行进入交互模式
project-teams-spec install
```

将显示欢迎页面并让你选择要安装到的工具（Claude Code、OpenCode、Trae 等）。

### 安装到指定工具

```bash
# 安装到 Claude Code
project-teams-spec install --tools claude

# 安装到多个工具
project-teams-spec install --tools claude,opencode,trae

# 强制覆盖现有安装
project-teams-spec install --tools claude --force

# 预览将要安装的内容
project-teams-spec install --tools claude --dry-run
```

### 其他命令

```bash
# 列出已安装的工具和状态
project-teams-spec list

# 从指定工具卸载
project-teams-spec uninstall --tools claude
```

### 调用命令

安装后，在 CLI 工具中使用斜杠命令：

```bash
/pts:analyze    # 项目分析和需求澄清
/pts:plan        # Agent 匹配和执行计划
/pts:execute     # 任务执行和交付
```

### 工作流流向

```
/pts:analyze → /pts:plan → /pts:execute
```

## 架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PTS 工作流                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ 分析循环     │───▶│  规划循环    │───▶│  执行循环     │     │
│  │ ANALYZE     │    │  PLAN       │    │  EXECUTE     │     │
│  │ CYCLE       │    │  CYCLE      │    │  CYCLE       │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                   │
│     /pts:analyze          /pts:plan           /pts:execute       │
│                                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                      核心 Skills (12 个阶段)                        │
│                                                                   │
│  分析循环 (阶段 1-3)                                              │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │project-     │complexity-   │requirement-  │                │
│  │explore (1) │evaluate (2)  │clarify (3)  │                │
│  └──────────────┴──────────────┴──────────────┘                │
│                                                                   │
│  规划循环 (阶段 4-8)                                              │
│  ┌──────────────┬──────────────┬──────────────┬─────────┬──────┐│
│  │agent-match │pyramid-      │master-      │plan-   │plan- ││
│  │  (4)      │analyze (5)   │summarize(6) │develop(7)│valid(8)││
│  └──────────────┴──────────────┴──────────────┴─────────┴──────┘│
│                                                                   │
│  执行循环 (阶段 9-12)                                             │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐   │
│  │norm-load   │task-        │qa-verify   │delivery-    │   │
│  │  (9)      │execute (10) │  (11)     │close (12)   │   │
│  └──────────────┴──────────────┴──────────────┴──────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 项目源码结构

```
project-teams-spec/
├── src/
│   ├── install.ts                    # 安装脚本
│   ├── __tests__/runner.js           # 单元测试
│   ├── core/
│   │   ├── command-generation/       # 命令生成模块
│   │   │   ├── types.ts              # 类型定义
│   │   │   ├── registry.ts           # 适配器注册表
│   │   │   ├── generator.ts          # 命令生成器
│   │   │   └── adapters/             # 工具适配器
│   │   └── command-templates.ts      # 命令内容模板
│   ├── prompts/
│   │   └── tool-select.ts            # 工具选择器
│   └── ui/
│       └── welcome.ts                # 欢迎页面
├── config/
│   ├── skills/                       # 12 个 Skill（按阶段 1-12 顺序）
│   ├── agents/                       # 5 个 Agent 定义
│   ├── rules/                        # 规则文件
│   ├── hooks/                        # Claude Code Hook 脚本
│   └── commands/                     # 命令模板
├── bin/
│   └── cli.js                        # CLI 入口
└── openspec/
    └── changes/                     # OpenSpec 变更管理
```

## 支持的工具

| 工具 | 项目目录 | 命令调用 |
|------|---------|---------|
| Claude Code | `.claude/` | `/pts:<command>` |
| OpenCode | `.opencode/` | `/pts-<command>` |
| Trae | `.trae/` | `/pts-<command>` |
| Continue | `.continue/` | 待定 |
| Kiro | `.kiro/` | 待定 |

## 命令系统

### 命令生成

命令通过 `src/core/command-generation/` 模块自动生成，支持多工具适配：

| 工具 | 路径 | 调用方式 |
|------|------|---------|
| Claude Code | `.claude/commands/pts/<id>.md` | `/pts:analyze` |
| OpenCode | `.opencode/commands/pts-<id>.md` | `/pts-analyze` |
| Trae | `.trae/commands/pts-<id>.md` | `/pts-analyze` |

### 可用命令

| 命令 | 说明 |
|------|------|
| `/pts:analyze` | 项目分析和需求澄清 |
| `/pts:plan` | Agent 匹配和执行计划 |
| `/pts:execute` | 任务执行和交付 |

## Skills 概览

### 核心流程 Skills（12 个阶段）

| Skill | 阶段 | 粒度 | 说明 |
|-------|------|------|------|
| pts-project-explore | 1 | intent | 扫描分析项目 |
| pts-complexity-evaluate | 2 | procedural | 评估复杂度 |
| pts-requirement-clarify | 3 | intent | 需求澄清 (5W1H) |
| pts-agent-match | 4 | intent | 透明化 Agent 选择 |
| pts-pyramid-analyze | 5 | intent | 金字塔改动分析 |
| pts-master-summarize | 6 | intent | 汇总并确认 |
| pts-plan-develop | 7 | intent | 制定执行计划 |
| pts-plan-validate | 8 | procedural | 评审方案 |
| pts-norm-load | 9 | procedural | 加载规则上下文 |
| pts-task-execute | 10 | protocol | 使用 subagent 执行任务 |
| pts-qa-verify | 11 | protocol | 质量验证 |
| pts-delivery-close | 12 | procedural | 交付归档 |

### 粒度类型

| 粒度 | 说明 |
|------|------|
| `intent` | 基于目标的自主决策 |
| `procedural` | 带明确步骤的逐步执行 |
| `protocol` | 严格基于协议的协调 |
| `conversational` | 交互式对话和澄清 |

## Agents

| Agent | 角色 | 专业领域 |
|-------|------|----------|
| java-agent | Java 后端开发专家 | Java、Spring、Maven/Gradle |
| frontend-agent | 前端开发专家 | React、Vue、Angular、TypeScript |
| backend-agent | 后端架构专家 | 微服务、API、架构设计 |
| qa-agent | 质量验证专家 | 测试、QA、验证 |
| code-reviewer | 代码审查专家 | 代码质量、最佳实践 |

## 目录结构

### 安装后目录结构

安装后，目标目录下会有以下内容：

```
.claude/
├── skills/                         # Skill 定义（12 个）
│   ├── pts-project-explore/
│   ├── pts-complexity-evaluate/
│   ├── pts-requirement-clarify/
│   ├── pts-agent-match/
│   ├── pts-pyramid-analyze/
│   ├── pts-master-summarize/
│   ├── pts-plan-develop/
│   ├── pts-plan-validate/
│   ├── pts-norm-load/
│   ├── pts-task-execute/
│   ├── pts-qa-verify/
│   └── pts-delivery-close/
├── agents/                         # Agent 定义
│   ├── java-agent/
│   ├── frontend-agent/
│   ├── backend-agent/
│   ├── qa-agent/
│   └── code-reviewer/
├── rules/                         # 规则集
│   ├── architecture.md
│   ├── coding-standards.md
│   └── naming-conventions.md
├── hooks/                         # Hook 脚本（仅 Claude Code）
│   ├── on-subagent-start.sh
│   ├── on-subagent-stop.sh
│   ├── on-session-end.sh
│   ├── on-task-created.sh
│   └── on-task-completed.sh
├── commands/
│   └── pts/                       # 命令定义（带命名空间）
│       ├── analyze-cycle.md
│       ├── plan-cycle.md
│       └── execute-cycle.md
└── .project-teams-spec-*-version  # 版本追踪文件
```

## 故障排除

### Windows 环境要求

**重要提示:** Hook 脚本在 Windows 上需要类 Unix shell 环境：

- **支持的环境:** Git Bash、MSYS2、WSL (Windows Subsystem for Linux)
- **不支持:** 纯 Windows CMD 或 PowerShell（hooks 将无法执行）

如果在 Windows 上遇到 hook 相关错误，请确保使用 Git Bash 或兼容的 shell。

### 命令不可用

如果 `/pts:` 命令不可用：

1. 确认已运行 `project-teams-spec install`
2. 检查 `.claude/commands/pts/` 目录是否存在
3. 重启 CLI 工具

### 权限问题

```bash
# 检查目录权限
ls -la .claude

# 修复权限（如需要）
chmod 755 .claude
```

### 版本冲突

如果之前安装过旧版本：

```bash
# 强制覆盖安装
project-teams-spec install --tools claude --force
```

### 安装失败

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 清理 npm 缓存
npm cache clean --force

# 使用详细输出尝试
npm install -g project-teams-spec --verbose
```

## 贡献指南

欢迎贡献！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/your-org/project-teams-spec.git
cd project-teams-spec

# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 运行测试
npm test

# 本地开发链接
npm link
```

### 代码风格

本项目遵循 `config/rules/` 中定义的编码规范：

- 配置文件使用 2 空格缩进，代码使用 4 空格
- 文件名使用 kebab-case
- 类名使用 UpperCamelCase
- 函数名使用 lowerCamelCase

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md) 获取详细版本历史。

## 相关文档

- [CLAUDE.md](CLAUDE.md) - 项目架构说明
- [openspec/changes/](openspec/changes/) - OpenSpec 变更管理

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)。