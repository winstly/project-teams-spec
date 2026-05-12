# SKILL: retrospective
---
name: retrospective
version: 1.1.0
granularity: protocol
type: internal
phase: post-execution
description: Conduct retrospective analysis after task execution to identify lessons learned, promote effective practices to project norms, and update the project whitepaper.
triggers:
  - "retrospective"
  - "lessons learned"
  - "post-mortem"
  - "review and learn"
  - "沉淀复盘"
tags:
  - retrospective
  - lessons-learned
  - knowledge-management
  - norms-evolution
  - post-execution
---

## Preconditions
preconditions:
  - Task execution has completed (success or failure)
  - Execution results are available
  - All task artifacts are collected

## Input
input:
  - name: execution_results
    type: array
    description: Array of TaskResult from execution
    required: true

  - name: execution_summary
    type: object
    description: Summary of the execution run
    required: true
    properties:
      total_tasks: integer
      completed: integer
      failed: integer
      duration: string

  - name: artifacts
    type: array
    description: List of file changes produced
    required: false

  - name: issues_encountered
    type: array
    description: Issues encountered during execution
    required: false

  - name: effective_practices
    type: array
    description: Practices that worked well
    required: false

## Output
output:
  - name: retrospective_report
    type: object
    description: Comprehensive retrospective report
    properties:
      summary: string
      lessons_learned: array
      norms_to_promote: array
      norms_to_validate: array
      norms_to_consider: array
      action_items: array

  - name: norms_updates
    type: array
    description: Proposed updates to norms (agent-specific or project)
    items:
      - norm_type: enum
        values:
          - agent-specific
          - project-level
        target: string
        content: string
        reason: string
        priority: enum

  - name: whitepaper_updates
    type: array
    description: Proposed updates to PROJECT_WHITEPAPER.md
    items:
      - section: string
        content: string
        reason: string

  - name: retention_rate
    type: number
    description: Norm compliance rate (0-100)
    format: percentage

## Steps
steps:
  - id: collect-execution-data
    description: Collect all execution data for retrospective
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: analyze-successes
    description: Analyze what worked well and why
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: analyze-failures
    description: Analyze failures and issues encountered
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: identify-lessons
    description: Extract lessons learned from execution
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: evaluate-norms-compliance
    description: Evaluate how well norms were followed
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: identify-norms-to-promote
    description: Identify practices to promote to norms
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: propose-norms-updates
    description: Propose specific updates to norms
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: prepare-whitepaper-updates
    description: Prepare updates to PROJECT_WHITEPAPER.md
    type: internal
    continue_on_error: false
    timeout: 2m

## Checkpoint
checkpoint:
  required: true
  message: "Review retrospective findings before applying updates?"

## Hook Configuration
hooks:
  on-retrospective-complete:
    - trigger: on-retrospective-complete
      action: confirm-norm-updates
      next_skill: archive
  on-norm-promotion:
    - trigger: on-norm-promotion
      action: update-norm-file
      target: auto

---

# INSTRUCTIONS

You are a retrospective analyst. After task execution completes, you must conduct a thorough retrospective analysis.

## Retrospective Protocol

### Step 1: Collect Execution Data

Gather all relevant data:
- Task execution results (success/failure)
- Issues encountered
- Effective practices observed
- Norm compliance observations
- Time and resource metrics

### Step 2: Analyze Successes

For each successful task:
1. What norms were followed well?
2. What practices contributed to success?
3. Are there patterns worth promoting?

### Step 3: Analyze Failures

For each failed task or issue:
1. What norm was violated or missing?
2. Was the issue due to implementation or norm quality?
3. What can be learned to prevent recurrence?

### Step 4: Identify Lessons Learned

Extract lessons in these categories:

| Category | Description | Example |
|----------|-------------|---------|
| Success | Effective practices | "Parallel execution reduced total time by 40%" |
| Improvement | Areas to improve | "Need clearer acceptance criteria" |
| New Practice | Worth documenting | "Use feature branches for complex changes" |
| Norm Gap | Missing or unclear norm | "No guidance on error handling approach" |

### Step 5: Evaluate Norms Compliance

Calculate compliance rate:

```
Compliance Rate = (Norms Followed / Total Applicable Norms) × 100%
```

Categorize compliance:
- **Excellent (90-100%)**: Current norms are effective
- **Good (70-89%)**: Minor improvements needed
- **Fair (50-69%)**: Significant norm review needed
- **Poor (<50%)**: Norm overhaul required

### Step 6: Identify Norms to Promote

Evaluate practices against promotion criteria:

| Criteria | Weight | Description |
|----------|--------|-------------|
| Repeatability | High | Works consistently across tasks |
| Generalizability | High | Applicable to multiple contexts |
| Validation Count | Medium | How many times was it validated? |
| Impact | High | Significant positive effect when applied |

**Promotion Path:**
1. **Agent-Specific** (1-2 validations) → `.claude/agents/{agent}/rules/`
2. **Project-Level** (3+ validations) → `.claude/rules/`
3. **Whitepaper** (all) → `PROJECT_WHITEPAPER.md`

### Step 7: Generate Norms Updates

For each norm to update:

```json
{
  "norm_type": "agent-specific",
  "target": ".claude/agents/backend-agent/rules/coding.md",
  "content": "New rule content to add",
  "reason": "Validated 2 times during execution, effective pattern",
  "priority": "medium"
}
```

## Output Format

```json
{
  "retrospective_report": {
    "summary": "Overall retrospective summary",
    "lessons_learned": [
      {
        "category": "success",
        "content": "Parallel task execution improved efficiency",
        "evidence": "40% time reduction"
      }
    ],
    "norms_to_promote": [
      {
        "practice": "Use feature branches",
        "promote_to": "project-level",
        "reason": "Validated 3 times, reduced conflicts"
      }
    ],
    "action_items": [
      "Update coding-standards.md with new rule"
    ]
  },
  "norms_updates": [...],
  "whitepaper_updates": [...],
  "retention_rate": 95
}
```

## Norm Promotion Template

When promoting to agent or project norms, use this template:

```markdown
## Promoted Rule: [Title]

**Source**: Retrospective from [date] execution
**Validated**: [N] times
**Priority**: [high/medium/low]

### Description
[Clear description of the rule]

### Rationale
[Why this rule should be followed]

### Examples

**Correct:**
\`\`\`
[Correct code example]
\`\`\`

**Incorrect:**
\`\`\`
[Incorrect code example]
\`\`\`

### Applicability
[When to apply this rule]
```

## Integration with Archive

The retrospective report is input to the archive skill:

```
├── archive/
│   └── {YYYY-MM-DD}/
│       ├── retrospective.md  # This report
│       └── norms-updates.md   # Proposed norm updates
```
