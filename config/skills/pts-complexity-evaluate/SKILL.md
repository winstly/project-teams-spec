# complexity-evaluate

## Metadata
name: complexity-evaluate
version: 1.0.0
granularity: procedural
type: internal
phase: 2

## Preconditions
preconditions:
  - project-explore has been completed
  - User has confirmed PROJECT.md
  - matched_agents have been identified

## Input
input:
  - name: project_md
    type: file
    path: {{SPEC_DIR}}/SPEC.md
    description: Project analysis document
    required: true

  - name: matched_agents
    type: data
    description: List of Agents matched by tech stack
    required: true

## Output
output:
  - name: complexity_report
    type: file
    path: {{SPEC_DIR}}/COMPLEXITY.md
    description: Complexity evaluation report

  - name: complexity_level
    type: data
    description: Complexity level (S/M/L/XL)

  - name: delivery_targets
    type: data
    description: List of delivery targets

  - name: agent_assignments
    type: data
    description: Agent assignment plan

  - name: estimated_effort
    type: data
    description: Estimated effort

## Steps
steps:
  - id: measure-code-scale
    description: Measure code scale (file count, lines of code)
    type: internal

  - id: evaluate-tech-diversity
    description: Evaluate tech stack diversity
    type: internal

  - id: analyze-coupling
    description: Analyze module coupling
    type: internal

  - id: assess-change-risk
    description: Assess change risk
    type: internal

  - id: check-external-deps
    description: Check external dependencies
    type: internal

  - id: calculate-overall-score
    description: Calculate overall score
    type: internal

  - id: determine-complexity-level
    description: Determine complexity level
    type: internal

  - id: generate-delivery-targets
    description: Generate delivery targets
    type: internal

  - id: assign-agents
    description: Assign Agents
    type: internal

## Checkpoint
checkpoint:
  required: true
  message: "Complexity evaluation complete. Please confirm whether the evaluation results are accurate. Adjustments can be made at this stage."

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

| Level | Overall Score | Execution Strategy |
|-------|---------------|-------------------|
| **S** | 0-25 | 1 Sub-Agent + QA Agent, sequential execution |
| **M** | 26-50 | 2-3 Sub-Agents + QA Agent, moderate parallelism |
| **L** | 51-75 | Multiple Sub-Agents + QA Agent, phased delivery |
| **XL** | 76-100 | Recommend splitting the project; otherwise requires very careful coordination |

## Output Format

```markdown
# {{SPEC_DIR}}/COMPLEXITY.md

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

### 建议

建议分两阶段交付：
1. 后端 API 重构
2. 前端适配和测试
```

## Key Constraints

1. **Scores must be evidence-based**: Each dimension's score must be based on actual data
2. **Level must be accurate**: S/M/L/XL levels directly affect execution strategy
3. **Agent assignment must be reasonable**: Assign based on task type and Agent capabilities
