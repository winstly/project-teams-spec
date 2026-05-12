# 工程白皮书

> 本文档是工程规范的权威来源，记录架构决策、规范演进和执行历史。

---

## 层级结构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        工程级 (Project-Team-Spec)                     │
│  config/                                                            │
│  ├── PROJECT_WHITEPAPER.md  ← 本工程白皮书                          │
│  ├── SPEC.md                   ← 项目分析模板                         │
│  ├── COMPLEXITY.md             ← 复杂度评估模板                      │
│  ├── skills/                   ← Skills 定义                        │
│  ├── agents/                   ← Agent 定义                         │
│  └── rules/                    ← 规范规则                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ 项目集级
┌─────────────────────────────────────────────────────────────────────┐
│                       项目集级 ({{SPEC_DIR}}/)                       │
│  PROJECT_WHITEPAPER.md            ← 项目集白皮书                    │
│  └── projects/{project}/          ← 各项目独立目录                   │
│      ├── SPEC.md                 ← 项目级分析                       │
│      ├── COMPLEXITY.md           ← 项目级复杂度                     │
│      ├── plan.md                 ← 执行计划                          │
│      └── tasks/                  ← 任务分解                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 工程概述

| 字段 | 内容 |
|------|------|
| 工程名称 | project-teams-spec |
| 目标 | Multi-Agent Engineering Spec System - 多Agent团队协作框架 |
| 版本 | 1.0.0 |
| 创建日期 | 2026-05-09 |
| 技术栈 | TypeScript, Node.js, Claude Code |

### 核心能力

- 12 个标准 Skills（规划、执行、验证、归档）
- 5 个专业 Agent（Java、Frontend、Backend、QA、Code Reviewer）
- 规范分层体系（Agent规范 → 项目规范 → 白皮书归档）
- Claude Code Hook 集成

---

## 架构决策记录 (ADR)

| 日期 | 决策 ID | 决策 | 原因 | 状态 |
|------|---------|------|------|------|
| 2026-05-09 | ADR-001 | 使用文件状态作为 Agent 间通信介质 | 避免 RPC 复杂度，利用工具原生能力 | 生效 |
| 2026-05-09 | ADR-002 | Master = CLI Tool | 无需独立 Master 进程，注入到 CLI 工具中 | 生效 |
| 2026-05-09 | ADR-003 | Phase 1 仅支持 Claude Code Hooks | 其他工具的 Hook 机制需要 Phase 2 研究 | 计划中 |
| 2026-05-12 | ADR-004 | 规范分层体系 | Agent规范 → 项目规范 → 白皮书归档 | 生效 |
| 2026-05-12 | ADR-005 | 文档层级分离 | 工程模板 vs 项目实例分离 | 生效 |

---

## 规范演进

### 规范层级

```
┌─────────────────────────────────────────────────────────────┐
│                     工程白皮书 (本文件)                       │
│  - 架构决策记录                                            │
│  - 规范演进历史                                            │
│  - 执行归档沉淀                                            │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ 沉淀升级
                              │
        ┌─────────────────────┴─────────────────────┐
        │           公共规范 (.claude/rules/)           │
        │  多次验证有效的规范 → 项目级别采用              │
        └─────────────────────────────────────────────┘
                              ▲
                              │ 沉淀升级
                              │
        ┌─────────────────────┴─────────────────────┐
        │         Agent 规范 (per-agent rules/)        │
        │  .claude/agents/{agent}/rules/               │
        └─────────────────────────────────────────────┘
```

### 已提升为项目规范的规则

| 规范名称 | 来源 | 提升日期 | 描述 |
|----------|------|----------|------|
| 编码标准 | coding-standards.md | 2026-05-09 | 缩进、命名、文件规范 |
| 架构原则 | architecture.md | 2026-05-09 | 分层、职责分离、松耦合 |

### 正在验证的规则

| 规范名称 | 来源 | 验证日期 | 状态 |
|----------|------|----------|------|
| 规范加载机制 | pts-norm-load | 2026-05-12 | 验证中 |

### 待评估的规则

| 规范名称 | 来源 | 提出日期 | 待验证场景 |
|----------|------|----------|------------|

---

## 执行记录归档

### 项目组合概览

| 项目名称 | 技术栈 | 复杂度 | 状态 |
|----------|--------|--------|------|
| project-teams-spec | TypeScript, Node.js | - | 进行中 |

### 执行记录

| 日期 | 项目 | 执行摘要 | 规范遵守率 | 沉淀内容 | 状态 |
|------|------|---------|-----------|----------|------|
| 2026-05-12 | project-teams-spec | 全量代码审查 | 95% | 修复2个编译错误 | 完成 |

### 归档结构

```
{{SPEC_DIR}}/
└── projects/{project_name}/
    └── archive/
        └── {YYYY-MM-DD}_{execution-id}/
            ├── execution-summary.md    # 执行摘要
            ├── task-results/         # 任务结果
            ├── artifacts/             # 产物清单
            └── retrospective.md       # 复盘报告
```

---

## Lessons Learned

### 已沉淀

| 日期 | 分类 | 内容 | 沉淀位置 |
|------|------|------|----------|
| 2026-05-12 | 编译错误 | skill-validator.ts 类型断言问题 | 已修复 |
| 2026-05-12 | 编译错误 | welcome.ts 无效代码删除 | 已修复 |
| 2026-05-12 | 代码质量 | opencode/trae 重复函数可提取 | 待处理 |
| 2026-05-12 | 交互优化 | 安装输出信息简化 | 已完成 |

### 待复盘

| 日期 | 分类 | 问题描述 | 状态 |
|------|------|----------|------|
| 2026-05-12 | 规范缺失 | Agent执行前需加载工程规范 | 实施中 |

---

## 规范加载优先级

当 Agent 执行任务时，必须按以下顺序加载规范：

1. **项目规范** (`.claude/rules/`)
   - `coding-standards.md` - 通用编码规范
   - `architecture.md` - 架构原则
   - `naming-conventions.md` - 命名规范

2. **Agent 专属规范** (`.claude/agents/{agent}/rules/`)
   - `coding.md` - 编码规范
   - `review.md` - 审查清单
   - `{domain}.md` - 领域特定规范

3. **白皮书当前决策**
   - ADR 记录
   - 当前验证中的规范

---

## 复盘流程

每次执行结束后，执行以下复盘流程：

```
1. 收集执行数据
   └── 任务完成率、规范遵守情况、问题记录

2. 识别可沉淀内容
   └── 有效实践 → 候选规范
   └── 问题解决 → 候选规则

3. 评估沉淀价值
   └── 适用性：是否可跨项目复用？
   └── 稳定性：是否经过多次验证？
   └── 优先级：紧急程度如何？

4. 执行沉淀
   └── 写入 Agent 规范 或 项目规范
   └── 更新本白皮书

5. 归档
   └── 生成执行摘要
   └── 保存产物清单
   └── 更新执行记录
```

---

## 附录

### 工程级目录结构

```
project-teams-spec/
├── config/                          # 工程配置
│   ├── PROJECT_WHITEPAPER.md       # 工程白皮书（模板）
│   ├── SPEC.md                     # 项目分析模板
│   ├── COMPLEXITY.md               # 复杂度评估模板
│   ├── skills/                     # 12 标准 Skills
│   ├── agents/                     # 5 Agent 定义
│   │   ├── java-agent/
│   │   ├── frontend-agent/
│   │   ├── backend-agent/
│   │   ├── qa-agent/
│   │   └── code-reviewer/
│   ├── rules/                      # 规范规则
│   └── hooks/                      # Claude Code Hooks
└── src/
    └── install.ts                   # 安装脚本
```

### 项目集级目录结构

```
{{SPEC_DIR}}/                        # 项目集目录（运行时生成）
├── PROJECT_WHITEPAPER.md            # 项目集白皮书
└── projects/                        # 各项目目录
    └── {project-name}/
        ├── SPEC.md                  # 项目分析
        ├── COMPLEXITY.md            # 复杂度评估
        ├── plan.md                  # 执行计划
        ├── tasks/                   # 任务分解
        │   ├── task-001.md
        │   └── task-002.md
        └── archive/                 # 执行归档
            └── {YYYY-MM-DD}/
```

### Skill 列表

| Skill | 功能 | 阶段 |
|-------|------|------|
| pts-project-explore | 项目探索 | Planning |
| pts-complexity-evaluate | 复杂度评估 | Planning |
| pts-plan-develop | 计划开发 | Planning |
| pts-plan-validate | 计划验证 | Planning |
| pts-agent-claim | Agent 认领 | Execution |
| pts-task-execute | 任务执行 | Execution |
| pts-qa-verify | QA 验证 | Verification |
| pts-delivery-close | 交付关闭 | Delivery |
| pts-issue-aggregate | 问题聚合 | Post-Execution |
| pts-norm-load | 规范加载 | Pre-Execution |
| pts-retrospective | 复盘沉淀 | Post-Execution |
| pts-archive | 归档 | Post-Execution |

---

*最后更新: 2026-05-12*
*文档版本: 1.0.0*
