# SKILL: pyramid-analyze
---
name: pyramid-analyze
version: 1.0.0
granularity: intent
type: internal
phase: 5
description: >
  Systematic change analysis using Pyramid Principle (Strategy/Tactics/Combat layers).
  Reusable methodology that can be called at multiple workflow stages for hierarchical
  analysis of what needs to change, from module level down to line level.
triggers:
  - "analyze changes"
  - "pyramid analysis"
  - "break down changes"
  - "hierarchical analysis"
tags:
  - analysis
  - pyramid-principle
  - change-analysis
  - hierarchical
---

## Preconditions
preconditions:
  - project-explore has completed
  - matched_agents identified

## Input
input:
  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document
    required: true

  - name: requirement_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/requirement.md"
    description: Confirmed requirement document
    required: true

  - name: matched_agents
    type: data[]
    description: List of matched agents from agent-match phase
    required: true

## Output
output:
  - name: pyramid_analysis_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/pyramid-analysis.md"
    description: Pyramid analysis document with three-layer structure
    format: markdown

  - name: change_points
    type: data[]
    description: Structured change points list
    items:
      - layer: enum
      - module: string
      - scope: string
      - details: string

## Steps
steps:
  - id: strategy-analysis
    description: Analyze at strategy layer - what modules need change
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: tactics-analysis
    description: Analyze at tactics layer - what files/functions need modification
    type: internal
    continue_on_error: false
    timeout: 10m

  - id: combat-analysis
    description: Analyze at combat layer - how exactly to change each line
    type: internal
    continue_on_error: false
    timeout: 10m

  - id: generate-pyramid-doc
    description: Generate pyramid-analysis.md document
    type: internal
    continue_on_error: false
    timeout: 5m

## Checkpoint
checkpoint:
  required: true
  message: "Pyramid analysis complete. Identified {module_count} modules, {file_count} files, {change_count} specific changes. Please confirm the change points are accurate."

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-pyramid-analysis-complete
      action: notify-master
      next_skill: master-summarize

---

# INSTRUCTIONS

You are a pyramid analysis expert. Analyze changes using the Strategy/Tactics/Combat framework.

## Pyramid Framework

| Layer | Focus | Question | Output |
|-------|-------|-----------|--------|
| Strategy | Module level | "What modules?" | Module list + strategy |
| Tactics | File/function level | "What files?" | File list + scope |
| Combat | Line level | "How to change?" | Specific changes |

## Step-by-Step Analysis

### 1. Strategy Analysis

Read SPEC.md and requirement.md to identify affected modules:

1. Parse module structure from SPEC.md
2. Map requirement to affected modules
3. Assess module coupling
4. Determine change strategy (parallel/sequential)
5. Estimate module-level risk

### 2. Tactics Analysis

For each module identified:

1. List all files in the module
2. Identify files that need changes based on requirements
3. Identify shared utilities and cross-module dependencies
4. Map the change sequence

### 3. Combat Analysis

For each file identified:

1. Read the file content
2. Identify specific functions/components to modify
3. Document the exact changes needed
4. Verify backward compatibility

## Output Format

```markdown
# Pyramid Analysis: {project_name}

## 战略层 (Strategy Layer)

### 受影响模块

| 模块 | 改动类型 | 策略 | 风险 |
|------|----------|------|------|
| auth | 修改 | 增量 | 低 |
| users | 新增 | 热插拔 | 中 |

### 模块依赖关系

## 战术层 (Tactics Layer)

### 文件改动清单

| 模块 | 文件路径 | 改动类型 | 改动范围 |
|------|----------|----------|----------|
| module-a | src/a.ts | 修改 | 30% |

### 共享工具识别

## 战斗层 (Combat Layer)

### 具体改动

#### src/a.ts
- [ ] 删除函数: `deprecatedFunction()`
- [ ] 修改函数: `updateConfig()` → 添加参数验证
```

## Key Constraints

1. **MECE**: Each layer covers unique territory
2. **Completeness**: All change points must be identified
3. **Specificity**: Combat layer must be actionable
4. **Traceability**: Changes traceable back to requirements