# SKILL: task-execute

## 元数据
name: task-execute
version: 1.0.0
granularity: protocol
type: agent-subprocess
phase: 7

## Preconditions
preconditions:
  - plan-validate has passed user confirmation
  - Execution plan is finalized (Plan, TaskBreakdown, AgentAssignment)
  - All Agents have claimed their tasks (TaskDescriptor)

## Input
input:
  - name: task_breakdown
    type: data
    description: Task breakdown results with dependency topology
    required: true

  - name: agent_assignments
    type: data
    description: Agent assignment plan
    required: true

  - name: project_md
    type: file
    path: ./PROJECT.md
    description: Project analysis document (provides context)
    required: true

## Output
output:
  - name: execution_results
    type: data
    description: Execution results for each task (TaskResult[])

  - name: execution_status
    type: data
    description: Overall execution status

  - name: artifacts
    type: data
    description: List of file changes produced

## Steps
steps:
  - id: initialize-executors
    description: Initialize executors, prepare context for each Agent
    type: internal

  - id: schedule-tasks
    description: Schedule tasks based on dependency topology, execute independent tasks in parallel
    type: internal

  - id: dispatch-to-agents
    description: Dispatch tasks to corresponding Agents
    type: agent-subprocess
    delegate_to: auto  # Assigned based on agent field in task_breakdown

  - id: monitor-execution
    description: Monitor execution progress of each Agent
    type: internal

  - id: collect-results
    description: Collect TaskResult from each Agent
    type: internal

  - id: detect-conflicts
    description: Detect file change conflicts
    type: internal

  - id: report-completion
    description: Report execution completion status
    type: internal

## Checkpoint
checkpoint:
  required: false
  message: null  # task-execute is a continuous process, auto-advanced via Hook

## Hook Configuration
hooks:
  on-execute-complete:
    - trigger: on-task-execute-complete
      action: auto-trigger-next-skill  # Auto-trigger qa-verify

---
# INSTRUCTIONS

You are a task execution coordinator. When the planning phase is complete, you need to coordinate multiple Agents to execute tasks.

## Execution Protocol

### Task Scheduling Rules

```
Priority Scheduling:
1. Tasks with no dependencies are assigned immediately
2. Tasks with satisfied dependencies are assigned after dependencies complete
3. Tasks for the same Agent execute serially
4. Tasks for different Agents can execute in parallel

Conflict Detection:
- Same file, different regions: auto-merge
- Same file, same region: conflict, pause and wait for user decision
```

### TaskDescriptor Format

Each task is dispatched in the following format:

```yaml
task_id: "task-001"
type: execute
agent: java-agent
context:
  project: /path/to/project
  scope: ["src/api/**/*.java"]
  dependencies: []
instruction: |
  Migrate the JWT verification logic from src/api/auth.ts to the new middleware architecture.

  Constraints:
  - Maintain backward compatibility, do not modify public API signatures
  - Add logging
  - Update related tests

constraints:
  - Follow config/rules/coding-standards.md
  - Maintain API compatibility
  - Include test coverage

expected_output: |
  Modified files and change summary

deadline: "30m"
```

### TaskResult Format

Each Agent returns results in the following format:

```json
{
  "task_id": "task-001",
  "status": "success",
  "output": {
    "artifacts": ["src/middleware/auth.ts", "test/middleware/auth.test.ts"],
    "summary": "Refactored JWT verification into standalone middleware, added logging middleware",
    "changes": [
      {
        "path": "src/middleware/auth.ts",
        "diff": "<unified diff>",
        "lines_added": 150,
        "lines_removed": 80
      }
    ]
  },
  "issues": [
    {
      "severity": "warning",
      "message": "Test coverage is 75%, below target of 80%",
      "affected_files": ["test/middleware/auth.test.ts"]
    }
  ],
  "metrics": {
    "duration": "12m",
    "files_affected": 2,
    "tests_passed": 45,
    "tests_failed": 0
  }
}
```

### Status Values

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `success` | Task completed without issues | Collect results, continue to next task |
| `failed` | Task failed | Log error, mark task as blocked |
| `blocked` | Task blocked (dependency incomplete or conflict) | Wait for dependency resolution or user decision |
| `needs_clarification` | Clarification needed | Aggregate to issue-aggregate phase |

## Execution Flow

### 1. Initialization

```
Read task_breakdown:
├── tasks: Task[]        # Task list
├── dependencies: Map     # Task dependency relationships
└── agent_mapping: Map    # Task -> Agent mapping

Read agent_assignments:
├── agents: Agent[]      # Agent list
├── capabilities: Map    # Agent capabilities
└── availability: Map    # Agent availability status
```

### 2. Task Scheduling

```
Build dependency topology:
Task A (no deps) ─┬─→ Task D
                  │
Task B ──→ Task C┘

Scheduling Strategy:
1. Scan all tasks, identify tasks with no dependencies
2. Assign tasks by Agent
3. Launch tasks for different Agents in parallel
4. Monitor task completion, update dependency graph
5. Repeat until all tasks complete
```

### 3. Concurrency Control

```
File Lock Strategy (simplified):
- Agent declares files to modify before execution
- Master maintains file lock table
- Only one Agent can modify a file at a time
- On conflict, pause subsequent tasks and wait for user decision

Conflict Detection Timing:
- When TaskResult is submitted
- Check file paths in changes
- Compare with other in-progress/completed tasks
```

### 4. Result Aggregation

```
Collect all TaskResults:
{
  "total_tasks": 10,
  "completed": 8,
  "failed": 1,
  "blocked": 1,
  "artifacts": [...],
  "issues": [...],
  "conflicts": [...]
}
```

## Error Handling

### Agent Execution Failure

```
1. Log failure reason to TaskResult
2. Check if retryable (max 2 retries)
3. On retry failure: mark as failed, update dependency graph
4. Notify Master and user
```

### Timeout Handling

```
1. Set task deadline
2. Mark as blocked after timeout
3. Notify user: continue waiting / skip / abort
```

### Conflict Handling

```
1. File conflict detected
2. Pause related tasks
3. Notify user of conflict details
4. After user decision:
   - Accept one version
   - Merge both versions
   - Re-execute both tasks
```

## Key Constraints

1. **Tasks are indivisible**: Each TaskDescriptor is an atomic task
2. **Dependencies must be satisfied**: Subsequent tasks cannot execute until prerequisites complete
3. **Results must be structured**: All TaskResults must conform to the format
4. **Conflicts must be reported**: File conflicts must not be handled silently
