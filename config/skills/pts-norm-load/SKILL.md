# SKILL: norm-load
---
name: norm-load
version: 1.1.0
granularity: protocol
type: internal
phase: pre-execution
description: Load project rules and agent-specific rules to build a comprehensive context for agent execution. Ensures strict adherence to project and agent-specific coding standards.
triggers:
  - "load rules"
  - "load norms"
  - "load standards"
  - "pre-execution rules"
tags:
  - rules
  - norms
  - standards
  - context-building
  - pre-execution
---

## Preconditions
preconditions:
  - Agent task is being prepared for execution
  - TaskDescriptor is available
  - Target agent type is identified

## Input
input:
  - name: agent_type
    type: string
    description: The type of agent that will execute the task
    required: true
    example: "backend-agent"

  - name: task_id
    type: string
    description: The task identifier
    required: true

  - name: project_root
    type: string
    description: The root directory of the project
    required: true

## Output
output:
  - name: rules_context
    type: object
    description: Comprehensive rules context for agent execution
    properties:
      project_rules:
        type: string
        description: Combined project-level rules content
      agent_rules:
        type: string
        description: Agent-specific rules content
      whitelisted_rules:
        type: string
        description: Critical rules that must be followed
      rules_summary:
        type: string
        description: Brief summary of key rules for quick reference

  - name: rules_applied
    type: array
    description: List of rule files that were loaded
    items:
      - path: string
        source: enum
        priority: integer

  - name: loading_status
    type: enum
    description: Status of rules loading
    values:
      - success
      - partial
      - failed

  - name: loading_errors
    type: array
    description: Any errors encountered during loading
    required: false

## Steps
steps:
  - id: load-project-rules
    description: Load project-level rules from .claude/rules/
    type: internal
    continue_on_error: true
    timeout: 1m

  - id: load-agent-rules
    description: Load agent-specific rules from .claude/agents/{agent}/rules/
    type: internal
    continue_on_error: true
    timeout: 1m

  - id: check-whitepaper
    description: Load current ADR and validation rules from PROJECT_WHITEPAPER.md
    type: internal
    continue_on_error: true
    timeout: 30s

  - id: identify-critical-rules
    description: Identify critical rules that must be strictly followed
    type: internal
    continue_on_error: false
    timeout: 30s

  - id: build-rules-context
    description: Combine all rules into comprehensive rules_context
    type: internal
    continue_on_error: false
    timeout: 30s

  - id: generate-rules-summary
    description: Generate brief summary of key rules for quick reference
    type: internal
    continue_on_error: false
    timeout: 30s

## Checkpoint
checkpoint:
  required: false
  message: null  # norm-load is a utility skill, auto-advanced

## Hook Configuration
hooks:
  on-load-complete:
    - trigger: on-norm-load-complete
      action: inject-to-prompt
      target: agent-execution-prompt
  on-load-failure:
    - trigger: on-norm-load-failure
      action: log-warning
      fallback: proceed-without-rules

---

# INSTRUCTIONS

You are a rules loading coordinator. Before any agent executes a task, you must load and prepare all relevant rules.

## Rules Loading Protocol

### Step 1: Load Project-Level Rules

Project rules are in `{{RULES_DIR}}/` (typically `.claude/rules/`):

```
{{RULES_DIR}}/
├── coding-standards.md    # Universal coding standards
├── architecture.md        # Architecture principles
└── naming-conventions.md  # Naming conventions
```

Read each file and combine into `project_rules` context.

### Step 2: Load Agent-Specific Rules

Agent rules are in `{{AGENTS_DIR}}/{agent_type}/rules/`:

```
{{AGENTS_DIR}}/backend-agent/rules/
├── coding.md              # Backend coding standards
├── review.md              # Code review checklist
├── microservices.md       # Microservices specific rules
└── refactoring.md         # Refactoring guidelines
```

Read agent-specific rules based on `agent_type` and combine into `agent_rules` context.

### Step 3: Check Whitepaper for Current Decisions

Read `{{SPEC_DIR}}/PROJECT_WHITEPAPER.md` for:
- Current ADR (Architecture Decision Records)
- Rules currently under validation
- Critical rules that must be followed

### Step 4: Identify Critical Rules

From all loaded rules, identify rules marked as:
- **MUST** / **强制** - Must strictly follow
- **REQUIRED** - Required for this agent type
- **CRITICAL** - Critical for task success

These go into `whitelisted_rules`.

### Step 5: Build Comprehensive Context

Combine all rules into the following structure:

```typescript
const rulesContext = {
  project_rules: `
# Project-Level Rules

## Coding Standards
${codingStandardsContent}

## Architecture Principles
${architectureContent}

## Naming Conventions
${namingContent}
`,

  agent_rules: `
# Agent-Specific Rules: ${agentType}

${agentRulesContent}
`,

  whitelisted_rules: `
# CRITICAL RULES - MUST FOLLOW

1. [Rule 1 - reason]
2. [Rule 2 - reason]
`,

  rules_summary: `
# Quick Rules Summary

**Project Standards:**
- [Key point 1]
- [Key point 2]

**Agent Standards:**
- [Key point 1]
- [Key point 2]
`
};
```

## Error Handling

| Error Type | Handling | Fallback |
|------------|----------|----------|
| Rule file not found | Log warning, continue | Use other available rules |
| Invalid markdown | Log error, skip file | Use other available rules |
| All rules failed | Log critical error | Proceed with minimal context |

## Output Format

Return the following structure:

```json
{
  "rules_context": { ... },
  "rules_applied": [
    {
      "path": ".claude/rules/coding-standards.md",
      "source": "project",
      "priority": 1
    },
    {
      "path": ".claude/agents/backend-agent/rules/coding.md",
      "source": "agent",
      "priority": 2
    }
  ],
  "loading_status": "success",
  "loading_errors": []
}
```

## Integration with Agent Execution

The `rules_context` must be injected into the agent's execution prompt:

```
## Rules Context

${rules_context.project_rules}

---

${rules_context.agent_rules}

---

## CRITICAL RULES - MUST FOLLOW

${rules_context.whitelisted_rules}

---

## Quick Reference

${rules_context.rules_summary}

---

Now execute the following task following these rules:
[Task Description]
```
