# SKILL: issue-aggregate

## Metadata
name: issue-aggregate
version: 1.0.0
granularity: conversational
type: internal
phase: 4

## Preconditions
preconditions:
  - agent-claim has been completed
  - ClarificationRequests pending resolution

## Input
input:
  - name: clarifications
    type: data
    description: List of clarification requests from all Agents

  - name: project_md
    type: file
    path: {{SPEC_DIR}}/SPEC.md
    description: Project analysis document

## Output
output:
  - name: issue_list
    type: data
    description: Aggregated issue list

  - name: user_feedback_request
    type: data
    description: Feedback request form

  - name: resolved_issues
    type: data
    description: List of resolved issues (ones the Master can answer directly from context)

## Steps
steps:
  - id: collect-all-clarifications
    description: Collect clarification requests from all Agents
    type: internal

  - id: analyze-dependencies
    description: Analyze dependencies between issues
    type: internal

  - id: attempt-resolution
    description: Attempt to resolve some issues directly from existing context
    type: internal

  - id: generate-feedback-form
    description: Generate user feedback form
    type: internal

  - id: wait-for-user-feedback
    description: Wait for user feedback
    type: internal

  - id: update-issue-status
    description: Update issue status (resolved/pending)
    type: internal

## Checkpoint
checkpoint:
  required: true
  message: "Issue aggregation complete. Please confirm each issue below."

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
