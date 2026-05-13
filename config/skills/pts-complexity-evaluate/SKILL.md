# SKILL: complexity-evaluate
---
name: complexity-evaluate
version: 1.1.0
granularity: procedural
type: internal
phase: 2
description: Evaluate project complexity across multiple dimensions (code scale, tech diversity, coupling, change risk, external dependencies) to determine execution strategy and agent assignments.
triggers:
  - "evaluate complexity"
  - "assess project size"
  - "determine complexity level"
  - "analyze project scale"
  - "complexity assessment"
tags:
  - evaluation
  - complexity-scoring
  - agent-planning
  - delivery-strategy
---

## Preconditions
preconditions:
  - project-explore has been completed
  - User has confirmed PROJECT.md
  - matched_agents have been identified

## Input
input:
  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/SPEC.md"
    description: Project analysis document
    required: true

  - name: matched_agents
    type: data[]
    description: List of Agents matched by tech stack
    required: true
    items:
      - agent_id: string
        agent_name: string
        confidence: float

## Output
output:
  - name: complexity_report
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/COMPLEXITY.md"
    description: Complexity evaluation report
    format: markdown
    notes: |
      Template location: {{RULES_DIR}}/COMPLEXITY.md.template
      Each project gets its own COMPLEXITY.md in the project subdirectory

  - name: complexity_level
    type: enum
    description: Complexity level (S/M/L/XL)
    enum_values:
      - S
      - M
      - L
      - XL

  - name: delivery_targets
    type: data[]
    description: List of delivery targets
    items:
      - target: string
        priority: enum
        deadline: string
        description: string

  - name: agent_assignments
    type: data
    description: Agent assignment plan
    properties:
      agents: string[]
      task_count_map: object
      estimated_hours: float

  - name: delivery_strategy
    type: data
    description: Delivery strategy based on complexity level
    properties:
      approach: enum
      milestone_count: integer
      milestones:
        - id: string
          name: string
          estimated_duration: string
          tasks_hint: string
      checkpoint_frequency: string
    notes: |
      Based on complexity level:
      - S: Single delivery (1 milestone)
      - M: 2-3 milestones (Core → Features → Polish)
      - L: 4-6 milestones (Per-module delivery)
      - XL: 6+ milestones (Sprint-style iterations)

  - name: estimated_effort
    type: object
    description: Estimated effort breakdown
    properties:
      total_hours: float
      agent_breakdown: object
      risk_factor: float

## Steps
steps:
  - id: measure-code-scale
    description: Measure code scale (file count, lines of code)
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: evaluate-tech-diversity
    description: Evaluate tech stack diversity
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: analyze-coupling
    description: Analyze module coupling
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: assess-change-risk
    description: Assess change risk
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: check-external-deps
    description: Check external dependencies
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: calculate-overall-score
    description: Calculate overall score
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: determine-complexity-level
    description: Determine complexity level (S/M/L/XL)
    type: internal
    continue_on_error: false
    timeout: 1m

  - id: generate-delivery-targets
    description: Generate delivery targets based on complexity
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: generate-delivery-strategy
    description: Generate delivery strategy based on complexity level (S/M/L/XL)
    type: internal
    continue_on_error: false
    timeout: 3m
    notes: |
      Generate appropriate delivery strategy:

      **S (Simple, <1K LOC):**
      - Approach: Single delivery
      - Milestones: 1 (all tasks in one batch)
      - Checkpoint: End only

      **M (Medium, 1-10K LOC):**
      - Approach: Incremental delivery
      - Milestones: 2-3 (Core → Features → Polish)
      - Checkpoint: After each milestone

      **L (Large, 10-50K LOC):**
      - Approach: Modular delivery
      - Milestones: 4-6 (Per module)
      - Checkpoint: After each module

      **XL (Extra Large, >50K LOC):**
      - Approach: Sprint iterations
      - Milestones: 6+ (Weekly sprints)
      - Checkpoint: After each sprint

  - id: assign-agents
    description: Assign Agents based on task distribution
    type: internal
    continue_on_error: false
    timeout: 2m

## Checkpoint
checkpoint:
  required: true
  message: "Complexity evaluation complete. Score: {total_score}/100, Level: {level}. Estimated effort: {hours}h with {agent_count} agents. Please confirm: (1) Are the scores accurate for each dimension? (2) Is the complexity level appropriate? (3) Are agent assignments reasonable?"

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-complexity-complete
      action: auto-trigger-next-skill
      next_skill: agent-claim
  on-level-determined:
    - trigger: on-level-determined
      action: notify-master
      message: "Complexity level determined: {level}"

---

# INSTRUCTIONS

You are a complexity evaluation expert. Evaluate the project across multiple dimensions based on the project analysis document.

## Evaluation Dimensions

| Dimension | Weight | Evaluation Metric | Calculation Formula |
|-----------|--------|-------------------|---------------------|
| Code Scale | 20% | File count, lines of code | file_count/100 + loc/10000 |
| Tech Diversity | 20% | Number of languages/frameworks/middleware | tech_stack_count * 10 |
| Module Coupling | 25% | Cross-module dependencies, shared data models | coupling_metric * 15 |
| Change Risk | 20% | Core module ratio, database changes | risk_metric * 20 |
| External Dependencies | 15% | Third-party services/API integrations | dependency_count * 10 |

## Scoring Criteria

### Code Scale (20%)

```
0-25 points:
- File count < 50
- Lines of code < 10000

Calculation: min(25, (file_count / 50 + loc / 5000) * 12.5)
```

### Tech Diversity (20%)

```
Scoring criteria:
- Single tech stack (frontend or backend): 10 points
- Dual tech stack (frontend-backend separation): 15 points
- Multi tech stack (frontend + backend + database + middleware): 20 points
- Hybrid architecture (microservices/multi-module): 25 points
```

### Module Coupling (25%)

```
Scoring criteria:
- Low coupling (clear module boundaries): 10 points
- Medium coupling (some cross-module dependencies): 20 points
- High coupling (extensive circular dependencies or shared data models): 30 points

Evaluation method:
1. Analyze import/export relationships
2. Identify cross-module dependencies
3. Detect circular dependencies
4. Evaluate shared data models
```

### Change Risk (20%)

```
Scoring criteria:
- No risk (new features): 5 points
- Low risk (modifying non-core modules): 10 points
- Medium risk (modifying core modules): 20 points
- High risk (database schema changes, API breaking changes): 30 points
```

### External Dependencies (15%)

```
Scoring criteria:
- No external dependencies: 5 points
- 1-3 external dependencies: 10 points
- 4-7 external dependencies: 15 points
- 8+ external dependencies: 25 points
```

## Complexity Levels

| Level | Overall Score | Execution Strategy | Delivery Approach |
|-------|---------------|-------------------|-------------------|
| **S** | 0-25 | 1 Sub-Agent + QA Agent, sequential | **Single delivery** (1 milestone) |
| **M** | 26-50 | 2-3 Sub-Agents + QA Agent, moderate parallelism | **Incremental** (2-3 milestones: Core → Features → Polish) |
| **L** | 51-75 | Multiple Sub-Agents + QA Agent, phased delivery | **Modular** (4-6 milestones: Per module) |
| **XL** | 76-100 | Recommend splitting project; otherwise careful coordination | **Sprint iterations** (6+ milestones: Weekly sprints) |

## Delivery Strategy Guidelines

When generating delivery strategy, consider:

### S (Single Delivery)
```
- Execute all tasks in one batch
- Single checkpoint at the end
- No user confirmation between tasks
- Appropriate for: small fixes, one-off tasks
```

### M (Incremental Delivery)
```
Milestones:
1. Core Infrastructure (auth, database setup)
2. Main Features (business logic)
3. Polish (UI, testing, documentation)

Each milestone:
- Execute tasks
- QA verification
- User confirmation
- Then proceed to next
```

### L (Modular Delivery)
```
Milestones by module:
1. Module A (e.g., auth)
2. Module B (e.g., user management)
3. Module C (e.g., core APIs)
4. Module D (e.g., integrations)
5. Integration & Testing
6. Deployment

Each module:
- Complete implementation
- Internal QA
- User acceptance
- Proceed to next
```

### XL (Sprint Iterations)
```
Weekly sprints:
- Sprint 1: Foundation (2-3 modules)
- Sprint 2: Core features
- Sprint 3: Advanced features
- Sprint 4: Integration
- Sprint N: Remaining work

Each sprint:
- 1 week execution
- End-of-sprint demo
- User feedback
- Retrospective
- Plan next sprint
```

## Error Handling

| Error Type | Handling Strategy | Recovery Action |
|------------|-----------------|----------------|
| Missing SPEC.md | Block execution | Return to project-explore phase |
| Insufficient data | Use conservative estimates | Document assumptions in output |
| Score calculation overflow | Cap at maximum | Set to 100 points max |
| Agent capability mismatch | Log warning, adjust assignment | Request manual clarification |

### Error Recovery Scenarios

1. **Incomplete project data**: Use conservative scoring; document unknown factors
2. **Conflicting metrics**: Prioritize higher risk interpretation; note in output
3. **Agent availability unknown**: Assume full availability; note assumption
4. **Unusual project structure**: Adjust scoring weights; document rationale

## Output Format

```markdown
# {{SPEC_DIR}}/projects/{{project_name}}/COMPLEXITY.md

## 复杂度评估报告

**复杂度等级**: M (42分)

### 维度评分

| 维度 | 得分 | 权重 |
|------|------|------|
| 代码规模 | 18 | 20% |
| 技术多样性 | 15 | 20% |
| 模块耦合度 | 20 | 25% |
| 变更风险 | 12 | 20% |
| 外部依赖 | 15 | 15% |

### 推荐 Agent

| Agent | 任务数 | 预计工作量 |
|-------|--------|-----------|
| frontend-agent | 5 | 4h |
| backend-agent | 8 | 6h |

### 交付目标

| 目标 | 优先级 | 截止时间 |
|------|--------|----------|
| 核心功能迁移 | 高 | 2d |
| 测试覆盖率提升 | 中 | 1d |

### 风险评估

| 风险 | 严重程度 | 缓解措施 |
|------|----------|----------|
| 数据库迁移风险 | 中 | 先备份，逐步发布 |

### 交付策略

**推荐方式**: 增量交付（基于复杂度等级 {{level}}）

| 里程碑 | 名称 | 任务数 | 预计时长 | 依赖 |
|--------|------|--------|----------|------|
| m1 | {{milestone-name}} | {{count}} | {{duration}} | - |
| m2 | {{milestone-name}} | {{count}} | {{duration}} | m1 |
| ... | ... | ... | ... | ... |

**里程碑执行流程**:
1. 执行当前里程碑内所有任务
2. 进行 QA 验证
3. **等待用户确认**
4. 继续下一个里程碑

### 建议

{{delivery-recommendation}}
```

## Key Constraints

1. **Scores must be evidence-based**: Each dimension's score must be based on actual data
2. **Level must be accurate**: S/M/L/XL levels directly affect execution strategy
3. **Agent assignment must be reasonable**: Assign based on task type and Agent capabilities