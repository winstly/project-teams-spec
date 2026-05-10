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
    path: ./PROJECT.md
    description: Project analysis document

  - name: complexity_report
    type: file
    path: .project-teams-spec/complexity-report.yaml
    description: Complexity assessment report

## Output
output:
  - name: execution_plan
    type: file
    path: .project-teams-spec/plan.yaml
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
    estimated_time: 2h
    dependencies: []
    scope: ["src/auth/**/*"]
    acceptance_criteria:
      - All authentication tests pass
      - API compatibility maintained
      - Documentation updated

  - id: task-002
    title: "Migrate frontend components"
    agent: frontend-agent
    estimated_time: 3h
    dependencies: ["task-001"]
    scope: ["src/components/**/*"]
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

```yaml
# plan.yaml

overview: |
  This plan involves X tasks, estimated at Y hours.

phases:
  - name: Phase 1 - Infrastructure
    tasks: [task-001, task-002]
    duration: 2h

  - name: Phase 2 - Core Features
    tasks: [task-003, task-004]
    duration: 4h

  - name: Phase 3 - Testing & Verification
    tasks: [task-005]
    duration: 2h

task_breakdown: [...]
dependency_graph: [...]
risks: [...]
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
