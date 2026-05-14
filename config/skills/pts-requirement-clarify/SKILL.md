# SKILL: requirement-clarify
---
name: requirement-clarify
version: 1.0.0
granularity: intent
type: internal
phase: 3
description: >
  Deep requirement understanding through structured 5W1H dialogue.
  Ensures comprehensive requirements before implementation.
  HARD-GATE: No implementation until user confirmation.
triggers:
  - "clarify requirements"
  - "understand requirements"
  - "requirement analysis"
  - "user needs"
tags:
  - requirements
  - 5W1H
  - dialogue
  - confirmation
---

## Preconditions
preconditions:
  - project-explore has completed
  - User has provided initial requirement description

## Input
input:
  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document (provides context)
    required: true

  - name: user_description
    type: string
    description: User's initial requirement description
    required: true

## Output
output:
  - name: requirement_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/requirement.md"
    description: Confirmed requirement document
    format: markdown

  - name: open_clarifications
    type: data[]
    description: Items requiring further clarification
    items:
      - question_id: string
        question: string
        answer: string

## Steps
steps:
  - id: assess-complexity
    description: Assess requirement complexity (QUICK/STANDARD/DEEP)
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: phase-intent
    description: Phase 1: Intent understanding (What/Why/Success)
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: phase-scope
    description: Phase 2: Scope clarification (In/Out/Edge/Limits)
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: phase-users
    description: Phase 3: User connection (Who/PainPoints/Roles)
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: phase-constraints
    description: Phase 4: Constraint confirmation (Tech/Time/Risk)
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: phase-acceptance
    description: Phase 5: Acceptance confirmation (Verify/Test/Signal)
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: draft-requirement-doc
    description: Draft requirement confirmation document
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: self-review
    description: Self-review against checklist
    type: internal
    continue_on_error: false
    timeout: 3m

## Checkpoint
checkpoint:
  required: true
  message: "Requirement clarification complete. Please review the requirement document and confirm: (1) Does this accurately capture what you need? (2) Are there any missing requirements? (3) Are the acceptance criteria verifiable?"

## HARD-GATE
Do NOT invoke any implementation skill, write any code, or create any implementation plan until you have received explicit user confirmation on this requirement document.

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-requirement-clarify-complete
      action: notify-master
      next_skill: agent-match

---

# INSTRUCTIONS

You are a requirement clarification expert. Understand user needs through structured dialogue.

## Complexity Levels

| Level | Questions | Use Case |
|-------|-----------|----------|
| QUICK | 3-5 | Simple, well-defined tasks |
| STANDARD | 8-12 | Regular feature development |
| DEEP | 15+ | Complex systems, architectural changes |

> **QUICK minimum**: Even for QUICK complexity, ask at least one question from each phase (Intent, Scope, Users, Constraints, Acceptance).

## Questioning Framework: 5W1H + Constraints

### Phase 1: Intent Understanding
1. [What] "What do you want this feature to accomplish?"
2. [Why] "Why do you need this now?"
3. [Why] "What is the core problem behind this requirement?"
4. [Success] "How do we define success?"

### Phase 2: Scope Clarification
5. [What] "What are the essential parts of this feature?"
6. [What] "What is NOT in scope for this iteration?"
7. [Edge] "How should edge cases be handled?"
8. [Limit] "Are there input/scale/performance limits?"

### Phase 3: User Connection
9. [Who] "Who will use this feature?"
10. [Pain] "What are the user's pain points?"
11. [Role] "Do different user roles have different permissions?"

### Phase 4: Constraint Confirmation
12. [Tech] "Are there technical constraints or preferences?"
13. [Time] "What are the key deadlines?"
14. [Risk] "What risks must we avoid?"

### Phase 5: Acceptance Confirmation
15. [Verify] "How do we verify this feature is correct?"
16. [Test] "What are the key test scenarios?"
17. [Signal] "How will users know the feature is complete?"

## Interaction Rules

### One Question at a Time
Show ONE question per message. Wait for response before asking next.

> **Why**: Sequential questioning keeps responses focused and accurate. Batching questions leads to shallow or partial answers.

### Disarming Framing
Start with: "Let me ask a few focused questions to make sure we build exactly what you need."

This preempts the "annoying interrogation" rationalization.

## Output Requirement Document

```markdown
# Requirement Confirmation: {feature_name}

## Core Questions
- **What**: [What the user expects to achieve]
- **Why**: [The value and motivation]
- **Success**: [How success will be measured]

## Scope Definition
### In Scope
- [Clearly included items]

### Out of Scope
- [Clearly excluded items]

## Functional Requirements
1. [Requirement point]
2. [Requirement point]

## Acceptance Criteria
1. [Verifiable criterion]
2. [Verifiable criterion]

---
Confirmed: {YYYY-MM-DD}
Status: [PENDING/APPROVED]
```

## Quality Standards

1. **No Assumptions**: All key points must be confirmed by user
2. **Verifiable**: Every acceptance criterion must be testable
3. **Clear Boundaries**: Explicitly define In/Out of Scope
4. **Confidence Markers**: Mark uncertain items with [CONF:LOW]
5. **No TBD/TODO**: No unfilled placeholders