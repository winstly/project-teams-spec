# SKILL: master-summarize
---
name: master-summarize
version: 1.0.0
granularity: intent
type: internal
phase: 6
description: >
  Main agent aggregates all analysis results (SPEC, requirements, agent match,
  pyramid analysis) into a comprehensive summary for user confirmation.
  Organizes information using pyramid hierarchy for clear presentation.
triggers:
  - "summarize analysis"
  - "aggregate results"
  - "confirm changes"
  - "master summary"
tags:
  - aggregation
  - summary
  - pyramid-hierarchy
  - confirmation
---

## Preconditions
preconditions:
  - project-explore completed
  - requirement-clarify completed
  - agent-match completed
  - pyramid-analyze completed

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

  - name: agent_match_report_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/agent-match-report.md"
    description: Agent match report
    required: true

  - name: pyramid_analysis_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/pyramid-analysis.md"
    description: Pyramid analysis document
    required: true

## Output
output:
  - name: summary_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/summary.md"
    description: Master summary document
    format: markdown

  - name: open_questions
    type: data[]
    description: Items needing user confirmation
    items:
      - question: string
        context: string
        options: string[]

## Steps
steps:
  - id: aggregate-spec
    description: Aggregate project status from SPEC.md
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: aggregate-requirements
    description: Aggregate confirmed requirements
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: aggregate-agent-match
    description: Aggregate agent allocation plan
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: aggregate-pyramid
    description: Aggregate change points from pyramid analysis
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: identify-open-questions
    description: Identify items needing user confirmation
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: generate-summary
    description: Generate summary.md with pyramid hierarchy
    type: internal
    continue_on_error: false
    timeout: 5m

## Checkpoint
checkpoint:
  required: true
  message: "Master summary complete. Please review the aggregated information and confirm: (1) Does the project status match your understanding? (2) Are the requirements correctly captured? (3) Is the agent allocation appropriate? (4) Are the change points complete? (5) Any open questions to address?"

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-master-summary-complete
      action: notify-master
      next_skill: plan-develop

---

# INSTRUCTIONS

You are a master summarizer. Aggregate all phase outputs into a comprehensive summary using pyramid hierarchy.

## Pyramid Hierarchy in Summary

### 战略层 (Key Points)
- What is being built/changed
- Which agents are assigned
- High-level risk assessment

### 战术层 (Details)
- Affected modules
- Key change points
- Dependencies

### 战斗层 (Specifics)
- File-level changes
- Specific requirements
- Test scenarios

## Summary Document Structure

```markdown
# Master Summary: {project_name}

## Executive Summary
[2-3 sentences: what we're doing and why]

## Project Status
[From SPEC.md - tech stack, complexity, structure]

## Requirements Confirmed
[From requirement.md - core requirements, acceptance criteria]

## Agent Allocation
[From agent-match-report.md - selected agents with confidence]

## Change Points
[From pyramid-analysis.md - organized by layer]

## Open Questions
[Items needing user confirmation before proceeding]

## Confirmation Checklist
- [ ] Project status accurate
- [ ] Requirements correctly captured
- [ ] Agent allocation appropriate
- [ ] Change points complete
- [ ] No blocking questions
```

## Open Questions Format

For each open question:
```markdown
### Question {n}: {question}

**Context**: {why this needs confirmation}
**Options**:
- Option A: {description}
- Option B: {description}

**Recommendation**: {suggested option with reasoning}
```

## Key Constraints

1. **Completeness**: All phase outputs must be represented
2. **Pyramid Hierarchy**: Organize by Strategy/Tactics/Combat
3. **Actionable**: Open questions must have clear options
4. **Confirmation Gate**: User must approve before plan-develop