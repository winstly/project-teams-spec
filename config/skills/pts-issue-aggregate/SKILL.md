# SKILL: issue-aggregate
---
name: issue-aggregate
version: 1.1.0
granularity: conversational
type: internal
phase: 4
description: Aggregate clarification requests from all Agents, analyze dependencies between issues, attempt auto-resolution, generate feedback form, and collect user responses.
triggers:
  - "aggregate issues"
  - "collect clarifications"
  - "user feedback"
  - "resolve questions"
  - "issue resolution"
tags:
  - issue-management
  - clarification
  - user-feedback
  - decision-aggregation
---

## Preconditions
preconditions:
  - agent-claim has been completed
  - ClarificationRequests pending resolution

## Input
input:
  - name: clarifications
    type: data[]
    description: List of clarification requests from all Agents
    items:
      - task_id: string
        agent: string
        question: string
        options: array
        blocking: boolean

  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/SPEC.md"
    description: Project analysis document

  - name: complexity_report
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/COMPLEXITY.md"
    description: Complexity assessment report

## Output
output:
  - name: issue_list
    type: data[]
    description: Aggregated issue list with status
    items:
      - issue_id: string
        task_id: string
        agent: string
        question: string
        status: enum
        resolution: string

  - name: user_feedback_request
    type: data
    description: Feedback request form for user
    properties:
      blocking_issues: array
      non_blocking_issues: array
      auto_resolved: array

  - name: resolved_issues
    type: data[]
    description: List of resolved issues (ones the Master can answer directly from context)

## Steps
steps:
  - id: collect-all-clarifications
    description: Collect clarification requests from all Agents
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: analyze-dependencies
    description: Analyze dependencies between issues
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: attempt-resolution
    description: Attempt to resolve some issues directly from existing context
    type: internal
    continue_on_error: false
    timeout: 10m

  - id: generate-feedback-form
    description: Generate user feedback form
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: wait-for-user-feedback
    description: Wait for user feedback
    type: internal
    continue_on_error: true
    timeout: 30m

  - id: update-issue-status
    description: Update issue status (resolved/pending)
    type: internal
    continue_on_error: false
    timeout: 3m

## Checkpoint
checkpoint:
  required: true
  message: "Issue aggregation complete. Total issues: {total_count}. Auto-resolved: {auto_count} (no user input needed). Pending user decision: {pending_count}. Please review and respond to the feedback form."

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-issue-aggregate-complete
      action: auto-trigger-next-skill
      next_skill: plan-develop
  on-auto-resolved:
    - trigger: on-auto-resolved
      action: notify-master
      message: "Auto-resolved {count} issues without user input"
  on-blocking-issues:
    - trigger: on-blocking-issues-detected
      action: pause-execution
      message: "{count} blocking issues require user decision"

---

# INSTRUCTIONS

You are an issue aggregation coordinator. Aggregate all clarification requests from Agents, generate a feedback form, and wait for user confirmation.

## Execution Guide

### 1. Collect All ClarificationRequests

```
Read all Agent clarification requests:
├── blocking: true issues are prioritized
├── Group by Agent
└── Sort by priority
```

### 2. Analyze Issue Dependencies

```
Dependency graph:
Question A (blocked by Answer to B)
    ↑
Question B (user must answer first)

Resolution order:
1. Process issues without dependencies first
2. Process dependent issues later
```

### 3. Attempt Auto-Resolution

```
Some issues can be answered directly by the Master based on existing context:

Auto-resolvable:
✓ Tech selection already documented → reference the document
✓ Naming conventions already defined → apply the rules
✓ Code style already agreed upon → apply the conventions

Not auto-resolvable:
✗ Issues requiring user decisions
✗ Issues requiring external information
✗ Issues involving business logic
```

## Error Handling

| Error Type | Handling Strategy | Recovery Action |
|------------|-----------------|----------------|
| Circular dependency in issues | Break cycle | Ask user to prioritize |
| Unresolvable conflict | Escalate | Request user arbitration |
| User timeout | Proceed with default | Note as assumed answer |

### Error Recovery Scenarios

1. **Conflicting answers required**: Present both options; ask user to choose
2. **Missing project context**: Request clarification; cannot auto-resolve
3. **User provides partial answers**: Process available; track pending
4. **Auto-resolution fails**: Move to user feedback; log attempt

### 4. Generate Feedback Form

```
Format:
## Issue Summary

### 1. [Agent: java-agent] Database Migration Strategy
**Question**: Online migration vs. downtime migration?
**Options**:
- A: Online migration (keep old tables)
- B: Downtime migration (drop old tables)

### 2. [Agent: frontend-agent] API Version Compatibility
**Question**: Maintain v1 compatibility or migrate directly to v2?
**Options**:
- A: Maintain v1 compatibility
- B: Migrate directly to v2

...
```

### 5. Process User Feedback

```
User feedback format:
{
  "answers": [
    { "question_id": "clarification-001", "answer": "A" },
    { "question_id": "clarification-002", "answer": "B" }
  ]
}

Update each Agent's TaskDescriptor:
- Answered questions: remove from clarifications
- Answer content: append to each Agent's context
```

## Issue Classification

| Type | Description | Handling |
|------|-------------|----------|
| Technical Decision | Architecture, tech selection | User decision |
| Business Logic | Business rules, workflows | User decision |
| Resource Constraint | Time, manpower limits | User decision |
| Technical Spec | Coding standards, naming | Auto-applicable |
| Tool Usage | CLI tool usage | Auto-answerable |

## Key Constraints

1. **Blocking issues must be prioritized**: They affect subsequent task execution
2. **Feedback form must be clear**: Each issue listed separately
3. **User decisions must be recorded**: For future reference