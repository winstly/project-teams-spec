# PTS Workflow Framework Design

> **Date**: 2026-05-15
> **Status**: APPROVED
> **Version**: 1.0.0

## 1. Overview

PTS Workflow Framework is a structured workflow for Claude Code orchestration that ensures comprehensive project analysis, transparent agent selection, and systematic change analysis before implementation.

## 2. Workflow Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│              WORKFLOW PIPELINE                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Phase 1: 工程扫描 → Phase 2: 需求分析 → Phase 3: Agent匹配         │
│  Phase 4: 金字塔分析 → Phase 5: Main汇总 → Phase 6: 执行计划         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase Details

| Phase | Skill | Input | Output | Checkpoint |
|-------|-------|-------|--------|------------|
| 1 | pts-project-explore | Project path | SPEC.md | After SPEC.md confirmation |
| 2 | pts-requirement-clarify | SPEC.md | requirement.md | After requirement confirmation |
| 3 | pts-agent-match | SPEC.md + requirement | agent-match-report.md | After agent match confirmation |
| 4 | pts-pyramid-analyze | All above | pyramid-analysis.md | After pyramid analysis confirmation |
| 5 | pts-master-summarize | All above | summary.md | After summary confirmation |
| 6 | pts-plan-develop | All above | plan.md + tasks/ | After plan confirmation |

## 3. Skill Specifications

### 3.1 pts-project-explore (Enhanced)

**Description**: Scan and analyze project structure, generate 5-dimension MECE documentation.

**Enhancements from existing**:
- Output format: 5 dimensions (Business/Technical/Code/Risk/Onboarding)
- Based on project-workflow-spec/project-analysis framework

### 3.2 pts-requirement-clarify (New/Ported)

**Description**: Deep requirement understanding through structured 5W1H dialogue.

**Key Features**:
- Complexity levels: QUICK (3-5 questions) / STANDARD (8-12) / DEEP (15+)
- HARD-GATE: No implementation until user confirmation
- Output: requirement.md with acceptance criteria

### 3.3 pts-agent-match (New)

**Description**: Transparent agent selection with reasoning chain.

**Output Format**:
```markdown
## Agent Match Report

### Selected Agents

| Agent | Role | Confidence | Reasoning |
|-------|------|------------|-----------|
| frontend-agent | UI changes | HIGH (0.9) | React project detected |
| backend-agent | API changes | HIGH (0.85) | Java/Maven detected |

### Matching Rules Applied
1. Tech stack detection → Agent mapping
2. Task type → Skill alignment
3. Complexity level → Agent capability

### Alternatives Considered
- [List of alternative agents with reasons for rejection]

### Reasoning Chain
[Full decision process visible to user]
```

### 3.4 pts-pyramid-analyze (New - Reusable)

**Description**: Systematic change analysis using Pyramid Principle.

**Pyramid Layers**:
```
├── 战略层 (Strategy): 改什么模块/服务
├── 战术层 (Tactics): 改哪些文件/函数
└── 战斗层 (Combat): 每行代码怎么改
```

**Reusable Scenarios**:
| Stage | Usage |
|-------|-------|
| agent-match | Analyze agent responsibility boundaries |
| master-summarize | Organize summary hierarchy |
| plan-develop | Task breakdown hierarchy |
| task-execute | Subagent prompt structure |

### 3.5 pts-master-summarize (New)

**Description**: Main agent aggregates all analysis results for user confirmation.

**Summary Contents**:
- Project status (from SPEC.md)
- Requirements (from requirement.md)
- Agent allocation (from agent-match)
- Change points (from pyramid-analysis)
- Open questions (items needing user confirmation)

### 3.6 pts-plan-develop (Enhanced)

**Description**: Generate execution plan with task breakdown.

**Enhancements**:
- Use pyramid-analysis for hierarchical task structure
- Agent allocation from agent-match report
- Include dependency topology

## 4. File Output Structure

```
.project-teams-spec/
├── SPEC.md                    # Phase 1: 5-dimension analysis
├── projects/{project}/
│   ├── SPEC.md               # Project-level analysis
│   ├── COMPLEXITY.md         # Complexity evaluation
│   ├── requirement.md        # Phase 2: Requirements
│   ├── agent-match-report.md # Phase 3: Agent matching
│   ├── pyramid-analysis.md   # Phase 4: Pyramid analysis
│   ├── summary.md            # Phase 5: Summary
│   ├── plan.md               # Phase 6: Execution plan
│   └── tasks/
│       ├── task-001.md
│       └── task-002.md
```

## 5. Checkpoint Strategy

```
User Confirmation Gates:
├── Checkpoint 1: SPEC.md → "Does the project analysis match your understanding?"
├── Checkpoint 2: requirement.md → "Are these requirements correct?"
├── Checkpoint 3: agent-match-report → "Is the agent selection appropriate?"
├── Checkpoint 4: pyramid-analysis → "Are the change points correct?"
├── Checkpoint 5: summary.md → "Is this summary accurate?"
└── Checkpoint 6: plan.md → "Is the execution plan acceptable?"
```

## 6. Design Principles

| Principle | Description |
|-----------|-------------|
| **Module Independence** | Each skill can be used standalone |
| **Transparent Decisions** | Agent selection process visible to user |
| **Pyramid Reusability** | pyramid-analyze is methodology, callable at multiple stages |
| **User Confirmation Gate** | Each phase requires user confirmation before proceeding |
| **Document-Driven** | Each phase produces structured documentation |

## 7. Skill Granularity Types

| Skill | Granularity | Type | Phase |
|-------|-------------|------|-------|
| pts-project-explore | intent | internal | 1 |
| pts-requirement-clarify | intent | internal | 2 |
| pts-agent-match | intent | internal | 3 |
| pts-pyramid-analyze | intent | internal | 4 |
| pts-master-summarize | intent | internal | 5 |
| pts-plan-develop | intent | internal | 6 |

## 8. Implementation Notes

### 8.1 pts-pyramid-analyze Reusability

The pyramid-analyze skill provides a reusable analysis methodology:

```markdown
## Pyramid Analysis Method

### 战略层 (Strategy)
- 分析目标: 模块级改动
- 输出: 模块列表 + 改动策略

### 战术层 (Tactics)
- 分析目标: 文件/函数级改动
- 输出: 文件列表 + 改动范围

### 战斗层 (Combat)
- 分析目标: 代码行级改动
- 输出: 具体改动内容
```

### 8.2 Agent Match Transparency

Agent matching must show:
1. **Rule**: Matching rule applied
2. **Confidence**: Score with reasoning
3. **Alternatives**: Other candidates with rejection reasons
4. **Reasoning Chain**: Full decision process

## 9. Acceptance Criteria

- [ ] pts-project-explore outputs 5-dimension MECE format
- [ ] pts-requirement-clarify enforces HARD-GATE before implementation
- [ ] pts-agent-match shows complete reasoning chain
- [ ] pts-pyramid-analyze is reusable in multiple stages
- [ ] pts-master-summarize aggregates all phase outputs
- [ ] User confirmation at each checkpoint
- [ ] All outputs are structured documents

## 10. References

- project-workflow-spec/project-analysis (5-dimension framework)
- project-workflow-spec/requirement-clarify (dialogue methodology)
- OMC agent catalog (agent types and capabilities)