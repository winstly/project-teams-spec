# PTS Workflow Commands Redesign

> **Date**: 2026-05-15
> **Status**: APPROVED
> **Version**: 1.0.0

## Overview

Redesign PTS workflow commands to create a unified, clear workflow that connects all 12 skills through three distinct phases.

## Problem Statement

| Issue | Description |
|-------|-------------|
| **Scattered commands** | 3 independent commands (full-analysis, plan-cycle, execution-cycle) with no unified entry |
| **Skills not integrated** | New skills (requirement-clarify, agent-match, pyramid-analyze, master-summarize) not referenced by any command |
| **Phase numbering chaos** | Old skills (phase 1-9) overlap with new skills (phase 2-5) |
| **Unclear workflow** | User cannot easily understand how to go from scan to execution |

## Solution: Three-Phase Commands

```
┌─────────────────────────────────────────────────────────────────┐
│                    PTS WORKFLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ ANALYZE      │───▶│  PLAN        │───▶│  EXECUTE     │     │
│  │ CYCLE        │    │  CYCLE       │    │  CYCLE       │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                   │
│     /pts:analyze          /pts:plan           /pts:execute       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Command 1: analyze-cycle

**Entry**: `/pts:analyze [project-path]`

```yaml
name: analyze-cycle
description: Project analysis and requirement clarification
version: 1.0.0

skill_chain:
  - pts-project-explore      # Phase 1: Scan project, generate SPEC.md
  - pts-complexity-evaluate  # Phase 2: Evaluate complexity, generate COMPLEXITY.md
  - pts-requirement-clarify # Phase 3: 5W1H dialogue, generate requirement.md

checkpoint:
  mode: necessary-only
  before:
    - pts-complexity-evaluate
    - pts-requirement-clarify
  require: user-confirm

on-success:
  path: plan-cycle
  message: "Analysis complete. Run /pts:plan to proceed to planning."

on-fail:
  path: notify-master
  message: "Analysis failed. Check project path and try again."
```

### Skills in analyze-cycle:

| Skill | Phase | Output | Checkpoint |
|-------|-------|--------|------------|
| pts-project-explore | 1 | SPEC.md (5维MECE) | After user confirmation |
| pts-complexity-evaluate | 2 | COMPLEXITY.md | After user confirmation |
| pts-requirement-clarify | 3 | requirement.md | After user confirmation |

---

## Command 2: plan-cycle

**Entry**: `/pts:plan`

**Precondition**: analyze-cycle must complete first

```yaml
name: plan-cycle
description: Agent matching, pyramid analysis, and execution plan
version: 1.0.0

skill_chain:
  - pts-agent-match         # Phase 4: Transparent agent selection
  - pts-pyramid-analyze     # Phase 5: Strategy/Tactics/Combat analysis
  - pts-master-summarize     # Phase 6: Aggregate and confirm
  - pts-plan-develop         # Phase 7: Generate plan.md
  - pts-plan-validate       # Phase 8: Validate plan

checkpoint:
  mode: necessary-only
  before:
    - pts-pyramid-analyze
    - pts-master-summarize
    - pts-plan-validate
  require: user-confirm

on-success:
  path: execute-cycle
  message: "Plan validated. Run /pts:execute to start implementation."

on-fail:
  path: notify-master
  message: "Plan validation failed. Revise and re-run /pts:plan."
```

### Skills in plan-cycle:

| Skill | Phase | Output | Checkpoint |
|-------|-------|--------|------------|
| pts-agent-match | 4 | agent-match-report.md | After user confirmation |
| pts-pyramid-analyze | 5 | pyramid-analysis.md | After user confirmation |
| pts-master-summarize | 6 | summary.md | After user confirmation |
| pts-plan-develop | 7 | plan.md + tasks/ | Before validate |
| pts-plan-validate | 8 | validated plan | After user confirmation |

---

## Command 3: execute-cycle

**Entry**: `/pts:execute`

**Precondition**: plan-cycle must complete first

```yaml
name: execute-cycle
description: Task execution, QA verification, and delivery
version: 1.0.0

skill_chain:
  - pts-norm-load             # Phase 9: Load rules context for executors
  - pts-task-execute         # Phase 10: Dispatch subagents, coordinate tasks
  - pts-qa-verify           # Phase 11: Quality verification
  - pts-delivery-close       # Phase 12: Archive and deliver

checkpoint:
  mode: necessary-only
  before:
    - pts-task-execute
    - pts-qa-verify
  require: user-confirm

on-success:
  path: complete
  message: "Execution complete. Deliverables archived."

on-fail:
  path: task-execute
  message: "QA failed. Returning to task execution for fixes."
```

### Skills in execute-cycle:

| Skill | Phase | Output | Checkpoint |
|-------|-------|--------|------------|
| pts-norm-load | 9 | rules context | Auto (before each task) |
| pts-task-execute | 10 | execution results | After each milestone |
| pts-qa-verify | 11 | QA report | After user confirmation |
| pts-delivery-close | 12 | archive | After QA pass |

---

## Complete Skill Phase Numbering

| Skill | Phase | Command | Entry Point |
|-------|-------|---------|------------|
| pts-project-explore | 1 | analyze-cycle | /pts:analyze |
| pts-complexity-evaluate | 2 | analyze-cycle | /pts:analyze |
| pts-requirement-clarify | 3 | analyze-cycle | /pts:analyze |
| pts-agent-match | 4 | plan-cycle | /pts:plan |
| pts-pyramid-analyze | 5 | plan-cycle | /pts:plan |
| pts-master-summarize | 6 | plan-cycle | /pts:plan |
| pts-plan-develop | 7 | plan-cycle | /pts:plan |
| pts-plan-validate | 8 | plan-cycle | /pts:plan |
| pts-norm-load | 9 | execute-cycle | /pts:execute |
| pts-task-execute | 10 | execute-cycle | /pts:execute |
| pts-qa-verify | 11 | execute-cycle | /pts:execute |
| pts-delivery-close | 12 | execute-cycle | /pts:execute |

---

## Workflow Flow Diagram

```
/pts:analyze
  │
  ├─→ pts-project-explore [Checkpoint: User confirm SPEC.md]
  │
  ├─→ pts-complexity-evaluate [Checkpoint: User confirm COMPLEXITY.md]
  │
  └─→ pts-requirement-clarify [Checkpoint: User confirm requirement.md]
          │
          ▼
/pts:plan
  │
  ├─→ pts-agent-match [Checkpoint: User confirm agents]
  │
  ├─→ pts-pyramid-analyze [Checkpoint: User confirm changes]
  │
  ├─→ pts-master-summarize [Checkpoint: User confirm summary]
  │
  ├─→ pts-plan-develop [Auto]
  │
  └─→ pts-plan-validate [Checkpoint: User confirm plan]
          │
          ▼
/pts:execute
  │
  ├─→ pts-norm-load [Auto]
  │
  ├─→ pts-task-execute [Checkpoint: After each milestone]
  │
  ├─→ pts-qa-verify [Checkpoint: User confirm QA]
  │
  └─→ pts-delivery-close [Complete]
```

---

## Files to Update

| File | Action |
|------|--------|
| `config/commands/analyze-cycle.md` | CREATE |
| `config/commands/plan-cycle.md` | REWRITE |
| `config/commands/execution-cycle.md` | REWRITE (rename to execute-cycle.md) |
| `config/commands/full-analysis.md` | DELETE |
| `config/skills/*/SKILL.md` | UPDATE phase numbers (1-12) |

---

## Deprecations

| Old Command | Status | Replacement |
|-------------|--------|-------------|
| full-analysis | DEPRECATED | analyze-cycle |
| plan-cycle | REDESIGNED | New plan-cycle with reordered skills |
| execution-cycle | REDESIGNED | execute-cycle |

---

## Acceptance Criteria

- [ ] Three commands clearly defined: analyze-cycle, plan-cycle, execute-cycle
- [ ] All 12 skills properly mapped to commands
- [ ] Phase numbers sequential 1-12
- [ ] Checkpoints at appropriate positions
- [ ] Entry commands: /pts:analyze, /pts:plan, /pts:execute
- [ ] Old commands deprecated or deleted
- [ ] README updated with new workflow

---

## References

- PTS Workflow Framework Design (2026-05-15-pts-workflow-design.md)