# SKILL: agent-match
---
name: agent-match
version: 1.0.0
granularity: intent
type: internal
phase: 4
description: >
  Transparent agent selection with complete reasoning chain.
  Matches appropriate agents to tasks based on tech stack, task type,
  complexity, and capability analysis. Shows confidence scores,
  alternatives, and full decision process to user.
triggers:
  - "match agents"
  - "select agents"
  - "agent allocation"
  - "agent selection"
tags:
  - agent-selection
  - transparent-matching
  - reasoning-chain
  - confidence-scoring
---

## Preconditions
preconditions:
  - project-explore has completed
  - requirement-clarify has completed

## Input
input:
  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document with tech stack
    required: true

  - name: requirement_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/requirement.md"
    description: Confirmed requirement document with task types
    required: true

## Output
output:
  - name: agent_match_report_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/agent-match-report.md"
    description: Agent match report with transparency
    format: markdown

  - name: matched_agents
    type: data[]
    description: List of matched agents with confidence
    items:
      - agent_id: string
        agent_name: string
        confidence: float
        reasoning: string
        alternatives: string[]

## Steps
steps:
  - id: analyze-tech-stack
    description: Analyze tech stack from project analysis
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: analyze-task-types
    description: Analyze task types from requirements
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: match-agents
    description: Match agents based on criteria
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: calculate-confidence
    description: Calculate confidence scores
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: identify-alternatives
    description: Identify alternative agents
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: generate-report
    description: Generate agent-match-report.md
    type: internal
    continue_on_error: false
    timeout: 5m

## Checkpoint
checkpoint:
  required: true
  message: "Agent matching complete. Matched {agent_count} agents with confidence scores. Please confirm: (1) Are the selected agents appropriate? (2) Are the confidence scores reasonable? (3) Are the alternatives acceptable?"

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-agent-match-complete
      action: notify-master
      next_skill: pyramid-analyze

---

# INSTRUCTIONS

You are an agent matching expert. Select appropriate agents with full transparency.

## Matching Criteria (Weighted)

| Criteria | Weight | Description |
|----------|--------|-------------|
| Tech Stack Match | 30% | Language/framework alignment |
| Task Type Match | 25% | Feature/fix/refactor alignment |
| Complexity Match | 20% | Scale/coupling alignment |
| Domain Match | 15% | Business domain alignment |
| Capability Match | 10% | Tool/API coverage |

## Transparency Requirements

The agent-match report MUST show:

### 1. Matching Rules Applied
```markdown
## Matching Rules Applied

| Rule | Weight | Applied To |
|------|--------|------------|
| Tech Stack Match | 30% | Java → java-agent |
| Task Type Match | 25% | API → backend-agent |
```

### 2. Confidence Scoring with Reasoning
```markdown
## Selected Agents

| Agent | Confidence | Reasoning |
|-------|------------|-----------|
| java-agent | HIGH (0.9) | Java/Maven detected, API task type |
| frontend-agent | MEDIUM (0.7) | React detected, but UI scope is small |
```

### 3. Alternatives Considered
```markdown
## Alternatives Considered

| Agent | Rejected Reason |
|-------|------------------|
| backend-agent | Too generic, less Java-specific knowledge |
| qa-agent | Testing focus not aligned with implementation task |
```

### 4. Full Reasoning Chain
```markdown
## Reasoning Chain

1. Project uses Java/Maven (from SPEC.md)
2. Requirement is API implementation (from requirement.md)
3. Task scale is M (medium complexity)
4. → java-agent best fit (Java expertise + API capability)
5. → backend-agent as fallback (generic backend knowledge)
```

## Error Handling

| Error Type | Handling |
|------------|----------|
| No matching agent found | Use generic agent with LOW confidence |
| Multiple agents tie | Show all candidates, let user decide |
| Confidence below threshold | Flag for manual review |