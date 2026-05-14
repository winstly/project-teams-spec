# Skill Specification Conventions

This document defines the standard values for enum fields used across all Skill specifications in `config/skills/`.

---

## `version`

All skills must use semantic versioning `MAJOR.MINOR.PATCH` (e.g., `1.1.0`). Bump rules:

- `PATCH` for documentation or formatting fixes
- `MINOR` for additive changes (new steps, new output fields)
- `MAJOR` for breaking changes (renamed fields, removed fields, changed semantics)

Current minimum standard: **1.1.0** for all skills.

---

## `granularity`

Describes how much autonomous decision-making the skill is allowed.

| Value | Meaning |
|-------|---------|
| `intent` | Skill interprets user intent and decides the approach. May deviate from documented steps based on context. |
| `protocol` | Skill follows a strict sequence of steps but may skip or adapt non-critical steps. |
| `procedural` | Skill follows documented steps strictly. Skips or reorders only on documented error conditions. |
| `conversational` | Skill's primary mode is multi-turn dialogue with the user or other agents. Steps are guidelines for turn structure. |

---

## `type`

Describes the nature of the skill's work.

| Value | Meaning |
|-------|---------|
| `internal` | Skill performs analysis, coordination, or data transformation within the orchestrating agent. No external agents are spawned. |
| `agent-subprocess` | Skill coordinates one or more sub-agents (e.g., QA agents, executor agents). The orchestrating agent dispatches work and aggregates results. |

**Rule**: All steps within a skill share the same `type` as the skill itself. Mixed `type` values within a single skill's steps are not allowed. If a skill has both internal logic and agent subprocess calls, use `agent-subprocess` for the skill type and document subprocess calls in the step `notes` field.

---

## `phase`

Execution phase number in the overall pipeline (1-12).

| Value | Phase | Command |
|-------|-------|---------|
| `1` | Project exploration | analyze |
| `2` | Complexity evaluation | analyze |
| `3` | Requirement clarification | analyze |
| `4` | Agent matching | plan |
| `5` | Pyramid analysis | plan |
| `6` | Master summarization | plan |
| `7` | Execution plan development | plan |
| `8` | Plan validation | plan |
| `9` | Norm/rule loading | execute |
| `10` | Task execution | execute |
| `11` | QA verification | execute |
| `12` | Delivery close | execute |

---

## Step `type`

Step-level `type` is reserved. All steps must use `internal`. Subprocess calls are described in the step `notes` field, not as separate steps with a different `type`.

---

## YAML Frontmatter

Every `SKILL.md` must begin with:

```markdown
# SKILL: <skill-name>
---
<key>: <value>
...
---
```

The frontmatter block is delimited by `---` on both sides and contains all metadata fields (name, version, granularity, type, phase, description, triggers, tags). The `## Metadata` markdown heading is replaced by the YAML frontmatter.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique skill identifier (kebab-case) |
| `version` | Yes | Semantic version string |
| `granularity` | Yes | One of: intent, protocol, procedural, conversational |
| `type` | Yes | One of: internal, agent-subprocess |
| `phase` | Yes | Phase identifier (number or keyword) |
| `description` | Yes | One-line description of the skill's purpose |
| `triggers` | Yes | List of phrase patterns that activate this skill |
| `tags` | Yes | List of categorical tags |

---

## File Structure

```
config/skills/
├── CONVENTIONS.md          # This file
├── pts-agent-match/
│   └── SKILL.md
├── pts-complexity-evaluate/
│   └── SKILL.md
├── pts-delivery-close/
│   └── SKILL.md
├── pts-master-summarize/
│   └── SKILL.md
├── pts-norm-load/
│   └── SKILL.md
├── pts-plan-develop/
│   └── SKILL.md
├── pts-plan-validate/
│   └── SKILL.md
├── pts-project-explore/
│   └── SKILL.md
├── pts-pyramid-analyze/
│   └── SKILL.md
├── pts-qa-verify/
│   └── SKILL.md
├── pts-requirement-clarify/
│   └── SKILL.md
├── pts-retrospective/
├── pts-task-execute/
│   └── SKILL.md
├── pts-retrospective/
│   └── SKILL.md
└── pts-task-execute/
    └── SKILL.md
```
