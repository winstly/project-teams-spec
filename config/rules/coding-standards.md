# Architecture Specification

This document defines the architecture specification for the project-teams-spec system, ensuring consistency and maintainability of the multi-Agent system.

## Architecture Principles

### 1. Clear Layering
```
┌─────────────────────────────────────┐
│           Master (CLI Tool)          │
├─────────────────────────────────────┤
│              Skills                  │
├─────────────────────────────────────┤
│              Agents                  │
├─────────────────────────────────────┤
│        Rules / Hooks / Commands       │
└─────────────────────────────────────┘
```

### 2. Separation of Concerns
- **Master**: Coordinates workflow, manages overall progress
- **Skills**: Define standardized processes, describe task steps
- **Agents**: Execute specific tasks, provide domain knowledge
- **Rules**: Constrain behavior, ensure quality

### 3. Loose Coupling
- Skills communicate through file state
- Agents pass results through TaskResult
- Rely on tool native capabilities, avoid hardcoding

## Directory Structure

```
project-teams-spec/
├── config/
│   ├── skills/          # 9 standard Skills
│   ├── agents/          # 5 Agent definitions
│   │   ├── java-agent/
│   │   ├── frontend-agent/
│   │   ├── backend-agent/
│   │   ├── qa-agent/
│   │   └── code-reviewer/
│   ├── rules/           # Common rule sets
│   ├── hooks/           # Claude Code hooks
│   └── commands/        # Command definitions
├── src/
│   └── install.ts       # Installation script
└── docs/
    └── 2026-05-09-multi-agent-spec-design.md
```

## Agent Collaboration Pattern

```
Master (CLI)
    │
    ├── project-explore ──→ Analyze project structure
    │
    ├── complexity-evaluate ──→ Evaluate complexity
    │
    ├── agent-claim ──→ Assign tasks to Sub-Agents
    │
    ├── task-execute ──→ Sub-Agents execute tasks
    │       │
    │       ├── java-agent
    │       ├── frontend-agent
    │       └── qa-agent
    │
    ├── qa-verify ──→ Verify quality
    │
    └── delivery-close ──→ Archive and deliver
```

## File State Management

### State File Location
```
.project-teams-spec/
├── SPEC.md                 # Project specification
├── COMPLEXITY.md           # Complexity report
├── projects/
│   └── <project>/
│       ├── plan.md         # Execution plan
│       ├── plan-revised.md # Revised plan
│       └── tasks/          # Task files
├── verification.md          # Verification report
└── archive-manifest.md     # Archive manifest
```

### State Transition
```
pre-planning → planning → executing → verifying → closed
```

## Skill Types

### internal
- Master executes directly
- No Sub-Agent participation required
- Examples: project-explore, complexity-evaluate

### agent-subprocess
- Master delegates to Sub-Agent
- Sub-Agent returns results after completion
- Examples: task-execute, qa-verify

## Key Design Decisions

### Decision 1: Master = CLI Tool
No independent Master process is implemented. Instead, it is injected into the CLI tool.

### Decision 2: Sub-Agent Communication Relies on Tool Native Capabilities
No RPC is implemented. Coordination is done through the tool's TUI, configuration, or SDK.

### Decision 3: File State as Inter-Agent Communication Medium
State is passed through YAML files in the `.project-teams-spec/` directory.

### Decision 4: Hooks Only Support Claude Code (Phase 1)
Hook mechanisms for other tools will be implemented after research in Phase 2.