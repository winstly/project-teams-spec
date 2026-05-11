# project-teams-spec

多代理工程规范执行系统。提供标准化的 Skill 定义、Agent 定义和规则集，可注入到各 CLI 工具目录，使工具能够以统一范式协作完成业务目标。

## 功能特性

- **标准化流程**: 9 个标准 Skill 覆盖从项目分析到交付归档的完整流程
- **多 Agent 协作**: 支持 Java、Frontend、Backend、QA、Code Reviewer 等 Agent
- **多工具支持**: 兼容 Claude Code、OpenCode、Trae 等 CLI 工具
- **命令生成**: 自动生成带命名空间的命令（如 `/pts:full-analysis`）
- **交互式安装**: 欢迎页面 + 工具多选，开箱即用
- **灵活粒度**: INSTRUCTIONS 支持 intent / procedural / protocol / conversational 四种粒度

## 架构

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
│   ├── skills/                       # 9 个标准 Skill
│   ├── agents/                       # 5 个 Agent 定义
│   ├── rules/                        # 规则文件
│   ├── hooks/                        # Claude Code Hook 脚本
│   └── commands/                     # 命令模板
├── bin/
│   └── cli.js                        # CLI 入口
└── openspec/
    └── changes/                      # OpenSpec 变更管理
```

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/your-org/project-teams-spec.git
cd project-teams-spec

# 安装依赖
npm install

# 全局链接
npm link
```

### 使用 CLI

```bash
# 交互式安装（显示欢迎页面 + 工具选择）
project-teams-spec install

# 安装到指定工具
project-teams-spec install --tools claude,opencode

# 强制覆盖
project-teams-spec install --tools claude --force

# 预览安装
project-teams-spec install --tools claude --dry-run

# 列出工具状态
project-teams-spec list

# 卸载
project-teams-spec uninstall --tools claude
```

### 调用命令

安装后，在 Claude Code 中使用斜杠命令：

```bash
/pts:full-analysis    # 完整项目分析
/pts:plan-cycle       # 规划周期
/pts:execution-cycle  # 执行周期
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
| Claude Code | `.claude/commands/pts/<id>.md` | `/pts:full-analysis` |
| OpenCode | `.opencode/commands/pts-<id>.md` | `/pts-full-analysis` |
| Trae | `.trae/commands/pts-<id>.md` | `/pts-full-analysis` |

### 可用命令

| 命令 | 说明 |
|------|------|
| `/pts:full-analysis` | 完整项目分析流程 |
| `/pts:plan-cycle` | 规划周期：任务领取 → 方案确认 |
| `/pts:execution-cycle` | 执行周期：任务执行 → 交付归档 |

## Skills 概览

| Skill | 阶段 | 粒度 | 说明 |
|-------|------|------|------|
| pts-project-explore | 1 | intent | 分析项目结构 |
| pts-complexity-evaluate | 2 | procedural | 评估复杂度 |
| pts-agent-claim | 3 | protocol | 分配任务 |
| pts-issue-aggregate | 4 | conversational | 汇总问题 |
| pts-plan-develop | 5 | intent | 制定执行计划 |
| pts-plan-validate | 6 | procedural | 评审方案 |
| pts-task-execute | 7 | protocol | 执行任务 |
| pts-qa-verify | 8 | protocol | 质量验证 |
| pts-delivery-close | 9 | procedural | 交付归档 |

## Agents

- **java-agent**: Java 后端开发专家
- **frontend-agent**: 前端开发专家
- **backend-agent**: 后端架构专家
- **qa-agent**: 质量验证专家
- **code-reviewer**: 代码审查专家

## 安装后目录结构

安装后，目标目录下会有以下内容：

```
.claude/
├── skills/                         # Skill 定义
│   ├── pts-project-explore/
│   ├── pts-complexity-evaluate/
│   ├── pts-agent-claim/
│   └── ...
├── agents/                         # Agent 定义
│   ├── java-agent/
│   ├── frontend-agent/
│   └── ...
├── rules/                     # 规则集
├── hooks/                         # Hook 脚本（仅 Claude Code）
│   ├── on-subagent-start.sh
│   ├── on-subagent-stop.sh
│   └── ...
├── commands/
│   └── pts/                       # 命令定义（带命名空间）
│       ├── full-analysis.md
│       ├── plan-cycle.md
│       └── execution-cycle.md
└── .project-teams-spec-*-version  # 版本追踪
```

## 交互式安装

运行 `project-teams-spec install`（不带参数）会启动交互式安装：

1. **欢迎页面**: 显示项目信息和功能介绍
2. **工具选择**: 使用空格键选择要安装的工具
3. **确认安装**: 按 Enter 确认

```
================================================
  project-teams-spec
  Multi-Agent Engineering Spec System
================================================

This setup will configure:
  - Skills (9 standard workflow phases)
  - Agents (Java, Frontend, Backend, QA, Reviewer)
  - Rules (architecture, coding standards, naming)
  - Hooks (Claude Code integration)

Press Enter to select tools...
```

## 故障排除

### 命令不可用

如果 `/pts:` 命令不可用：

1. 确认已运行 `project-teams-spec install`
2. 检查 `.claude/commands/pts/` 目录是否存在
3. 重启 Claude Code

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

## 相关文档

- [CLAUDE.md](CLAUDE.md) - 项目架构说明
- [openspec/changes/](openspec/changes/) - OpenSpec 变更管理

## 开源协议

MIT
