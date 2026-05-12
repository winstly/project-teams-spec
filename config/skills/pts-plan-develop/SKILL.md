# SKILL: plan-develop
---
name: plan-develop
version: 1.1.0
granularity: intent
type: internal
phase: 5
description: Design execution plan architecture, break down tasks into executable units, build dependency topology, and assess risks based on task assignments and user feedback.
triggers:
  - "create execution plan"
  - "plan tasks"
  - "break down work"
  - "design plan"
  - "task planning"
tags:
  - planning
  - task-breakdown
  - dependency-management
  - risk-assessment
---

## Preconditions
preconditions:
  - issue-aggregate has been completed
  - User has responded to all clarification issues

## Input
input:
  - name: claimed_tasks
    type: data[]
    description: Tasks claimed by each Agent
    items:
      - task_id: string
        agent: string
        context: object

  - name: user_feedback
    type: data[]
    description: User's answers to clarification issues
    items:
      - question_id: string
        answer: string

  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document

  - name: complexity_report
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/COMPLEXITY.md"
    description: Complexity assessment report

## Output
output:
  - name: execution_plan
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/plan.md"
    description: Execution plan document
    format: markdown
    notes: |
      Each project has its own plan.md in the project subdirectory

  - name: task_breakdown
    type: data
    description: Task breakdown with dependencies
    properties:
      tasks: array
      dependencies: object
      phases: array

  - name: risk_assessment
    type: data[]
    description: Risk assessment with mitigation measures
    items:
      - name: string
        severity: enum
        probability: enum
        impact: string
        mitigation: string

## Steps
steps:
  - id: analyze-tasks
    description: Analyze task characteristics and dependencies
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: design-architecture
    description: Design the execution plan architecture
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: break-down-tasks
    description: Break down tasks into executable units
    type: internal
    continue_on_error: false
    timeout: 10m

  - id: build-dependency-graph
    description: Build dependency topology graph
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: assess-risks
    description: Assess risks and define mitigation measures
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: generate-plan
    description: Generate execution plan document
    type: internal
    continue_on_error: false
    timeout: 5m

## Checkpoint
checkpoint:
  required: true
  message: "Execution plan complete with {task_count} tasks across {phase_count} phases. Total estimated time: {total_hours}h. Identified {risk_count} risks ({high_risk_count} high). Please confirm: (1) Is the task breakdown appropriate? (2) Are dependencies correct? (3) Are delivery targets acceptable?"

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-plan-complete
      action: auto-trigger-next-skill
      next_skill: plan-validate

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

## Error Handling

| Error Type | Handling Strategy | Recovery Action |
|------------|-----------------|----------------|
| Circular dependency detected | Reject plan | Restructure dependencies |
| Task too large (> 4h) | Split task | Break into smaller units |
| Missing agent capability | Request clarification | Add to clarifications |
| Conflicting tasks | Prioritize | Use complexity level to decide |

### Error Recovery Scenarios

1. **Circular dependency found**: Identify source tasks; ask user to clarify intended order
2. **Task scope too broad**: Split into subtasks; ensure each < 4 hours
3. **Missing task dependency info**: Use conservative assumption; note in plan
4. **Agent conflict**: Sequence same-agent tasks; allow parallel for different agents

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

Each task is split into individual files:

```
{{SPEC_DIR}}/projects/{{project_name}}/tasks/
├── task-001.md
├── task-002.md
└── ...
```

Each task file format:

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