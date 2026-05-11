# Naming Conventions

This document defines the standard naming conventions for all named elements in the project-teams-spec system.

## Skill Naming

### Directory Naming
```
{{SKILLS_DIR}}/<skill-name>/
```
- Use kebab-case
- Examples: `project-explore`, `complexity-evaluate`, `task-execute`

### File Naming
- SKILL.md: Capitalized
- Other files: kebab-case

### Skill ID
```yaml
id: <verb>-<noun>
```
- Use kebab-case
- Examples: `collect-artifacts`, `verify-quality`, `generate-manifest`

## Agent Naming

### Directory Naming
```
{{AGENTS_DIR}}/<agent-name>/
```
- Use kebab-case
- Examples: `java-agent`, `frontend-agent`, `qa-agent`

### File Naming
- agent.md: lowercase, `.md` extension
- rules/: lowercase
- LESSONS_LEARNED.md: Uppercase, `.md` extension

### Metadata Fields
```yaml
name: <type>-<role>
description: <short description>
color: <color name>
emoji: <emoji>
vibe: <one-line description>
```

## Task Naming

### Task ID
```
task-<number>
```
- Examples: `task-001`, `task-002`, `task-010`

### Task Title
```
<verb> <object>
```
- Examples: "Refactor authentication module", "Migrate frontend components", "Verify test coverage"

## Variable Naming

### General Rules
| Type | Convention | Example |
|------|------------|---------|
| Variable | lowerCamelCase | `userName`, `orderList` |
| Function | lowerCamelCase | `getUserById()` |
| Class | UpperCamelCase | `UserService` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Config | kebab-case | `max-retry-count` |

### TypeScript Naming
```typescript
// Interfaces
interface UserProfile { ... }
interface OrderItem { ... }

// Types
type UserStatus = 'active' | 'inactive';

// Enums
enum TaskStatus { Pending, InProgress, Done }
```

### YAML Naming
```yaml
# Keys
key: value
nested_key: value

# List items
items:
  - item_name: value
    item_id: abc123

# References
$ref: skill-path/SKILL.md
```

## Phase Naming

### Phase Number
```
Phase <number> - <name>
```
- Examples: "Phase 1 - Project Analysis", "Phase 2 - Complexity Evaluation"

### Phase Description
Start with a verb, describing the main activity.
- Analyze → Execute → Verify → Deliver

## File Path Conventions

### Relative Paths
```yaml
# Relative to .project-teams-spec/
path: .project-teams-spec/plan.md

# Relative to project root
path: ./PROJECT.md
```

### Absolute Paths
Avoid using absolute paths in configuration files to maintain portability.

## Checkpoint Naming

### Message Format
```
<Action> completed, please <confirm/check> <content>
```
- Examples: "Project analysis completed, please confirm results"
- Examples: "Plan review completed, please confirm approval"

## Hook Naming

### Event Names
Use Claude Code native event names.
- `SubagentStart`
- `SubagentStop`
- `TaskCreated`
- `TaskCompleted`
- `SessionEnd`

### Script Naming
```
<event-name>.<tool>.sh
```
- Examples: `SubagentStart.claude.sh`, `TaskCompleted.claude.sh`

## Naming Checklist

- [ ] All names use correct casing
- [ ] Consistent naming for the same concept
- [ ] No abbreviations or reserved words as names
- [ ] Names reflect actual functionality
- [ ] Avoid generic or ambiguous names
