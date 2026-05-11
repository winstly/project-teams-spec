# SKILL: plan-develop

## Metadata
name: plan-develop
version: 1.0.0
granularity: intent
type: internal
phase: 5

## Preconditions
preconditions:
  - issue-aggregate has been completed
  - User has responded to all clarification issues

## Input
input:
  - name: claimed_tasks
    type: data
    description: Tasks claimed by each Agent

  - name: user_feedback
    type: data
    description: User's answers to clarification issues

  - name: project_md
    type: file
    path: {{SPEC_DIR}}/SPEC.md
    description: Project analysis document

  - name: complexity_report
    type: file
    path: {{SPEC_DIR}}/COMPLEXITY.md
    description: Complexity assessment report

## Output
output:
  - name: execution_plan
    type: file
    path: {{SPEC_DIR}}/projects/{{project_name}}/plan.md
    description: Execution plan

  - name: task_breakdown
    type: data
    description: Task breakdown (with dependencies)

  - name: risk_assessment
    type: data
    description: Risk assessment

## Steps
steps:
  - id: analyze-tasks
    description: Analyze task characteristics and dependencies
    type: internal

  - id: design-architecture
    description: Design the execution plan architecture
    type: internal

  - id: break-down-tasks
    description: Break down tasks into executable units
    type: internal

  - id: build-dependency-graph
    description: Build dependency topology graph
    type: internal

  - id: assess-risks
    description: Assess risks and define mitigation measures
    type: internal

  - id: generate-plan
    description: Generate execution plan document
    type: internal

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-plan-complete
      action: auto-trigger-next-skill  # Auto-trigger plan-validate

---
# INSTRUCTIONS

You are a planning expert. Design the execution plan and break down tasks based on task assignments and user feedback.

## Execution Guide

### 1. Analyze Task Characteristics

```
Analysis dimensions:
├── Task type: new / refactor / migrate / fix
├── Task scale: simple / medium / complex
├── Dependencies: strong / weak / none
└── Risk level: low / medium / high
```

### 2. Design Execution Plan

```
Architecture design principles:
1. Minimize scope of changes
2. Maintain backward compatibility
3. Enable easy rollback
4. Allow incremental delivery

Plan contents:
├── Overall architecture diagram
├── Module modification sequence
├── Data migration strategy
├── Risk mitigation measures
└── Acceptance criteria
```

### 3. Task Breakdown

```
Breakdown principles:
1. Each task can be executed independently
2. Tasks have clear inputs and outputs
3. Tasks have clear completion criteria
4. Task duration controlled within 2-4 hours

Breakdown structure:
task_breakdown:
  - id: task-001
    title: "Refactor authentication module"
    agent: java-agent
    agent_config: "{{AGENTS_DIR}}/java-agent/agent.md"
    estimated_time: 2h
    dependencies: []
    scope: ["{{SPEC_DIR}}/SPEC.md", "src/auth/**/*"]
    acceptance_criteria:
      - All authentication tests pass
      - API compatibility maintained
      - Documentation updated

  - id: task-002
    title: "Migrate frontend components"
    agent: frontend-agent
    agent_config: "{{AGENTS_DIR}}/frontend-agent/agent.md"
    estimated_time: 3h
    dependencies: ["task-001"]
    scope: ["{{SPEC_DIR}}/SPEC.md", "src/components/**/*"]
    acceptance_criteria:
      - Components function correctly
      - Test coverage >= 80%
```

### 4. Build Dependency Topology Graph

```
Dependency graph format:
Task A ─┬─→ Task C ─→ Task E
         │
Task B ─┘

Topological sort:
1. Tasks without dependencies first (Task A, Task B)
2. Dependent tasks execute later (Task C after A, B)
3. Final tasks execute last (Task E after C)
```

### 5. Risk Assessment

```
Risk types:
├── Technical risk: new technologies, complex algorithms
├── Business risk: critical features, sensitive data
├── Schedule risk: tight deadlines, insufficient resources
└── Quality risk: test coverage, performance requirements

Risk assessment format:
risks:
  - name: "Database migration risk"
    severity: high
    probability: medium
    impact: "May cause data loss"
    mitigation: |
      1. Back up data in advance
      2. Define rollback plan
      3. Gradual rollout
```

## Output Format

```markdown
# {{SPEC_DIR}}/projects/{{project_name}}/plan.md

## 项目执行计划

**概述**: 本计划包含 X 个任务，预计 Y 小时。

### 执行阶段

#### Phase 1 - 基础设施
| 任务 | Agent | 预计时长 |
|------|-------|----------|
| task-001 | java-agent | 2h |
| task-002 | frontend-agent | 2h |

#### Phase 2 - 核心功能
| 任务 | Agent | 预计时长 | 依赖 |
|------|-------|----------|------|
| task-003 | backend-agent | 3h | task-001 |

### 任务详情

详见 `{{SPEC_DIR}}/projects/{{project_name}}/tasks/` 目录。

### 依赖关系图

```
Task A ─┬─→ Task C ─→ Task E
         │
Task B ─┘
```

### 风险评估

| 风险 | 严重程度 | 缓解措施 |
|------|----------|----------|
| 数据库迁移风险 | 中 | 先备份，逐步发布 |
```

### Tasks 目录结构

每个任务拆分为单独文件：

```
{{SPEC_DIR}}/projects/{{project_name}}/tasks/
├── task-001.md
├── task-002.md
└── ...
```

每个任务文件格式：

```markdown
# Task: task-001

## 基本信息
- **Task ID**: task-001
- **Agent**: java-agent
- **agent_config**: {{AGENTS_DIR}}/java-agent/agent.md
- **状态**: pending

## 任务描述
[具体任务描述]

## 验收标准
- [ ] 标准 1
- [ ] 标准 2

## 约束条件
- 遵循 {{RULES_DIR}}/coding-standards.md

## 时间
- **预计时长**: 2h
- **截止时间**: [deadline]

## 依赖关系
- 前置任务: [无] / [task-xxx]

## 涉及文件
- {{SPEC_DIR}}/SPEC.md
- src/auth/**/*
```

## Key Constraints

1. **Plan must be feasible**: Based on actual project conditions
2. **Tasks must be executable**: With clear inputs, outputs, and acceptance criteria
3. **Dependencies must be correct**: Circular dependencies will be rejected during plan-validate
4. **Risks must be assessed**: High-risk tasks require extra attention

## Checkpoint
checkpoint:
  required: true
  message: "Execution plan generation complete. Please confirm the plan."
