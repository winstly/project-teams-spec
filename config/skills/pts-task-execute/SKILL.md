# SKILL: task-execute
---
name: task-execute
version: 1.1.0
granularity: protocol
type: agent-subprocess
phase: 7
description: Coordinate multiple Agents to execute tasks according to plan, manage task scheduling, monitor execution progress, handle conflicts, and aggregate results.
triggers:
  - "execute tasks"
  - "run tasks"
  - "start execution"
  - "dispatch tasks"
  - "task execution"
tags:
  - execution
  - agent-coordination
  - task-scheduling
  - results-aggregation
---

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
    properties:
      tasks: array
      dependencies: object
      phases: array

  - name: agent_assignments
    type: data
    description: Agent assignment plan
    required: true
    properties:
      agents: string[]
      task_count_map: object

  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document (provides context)
    required: true

## Output
output:
  - name: execution_results
    type: data[]
    description: Execution results for each task (TaskResult[])
    items:
      - task_id: string
        status: enum
        output: object
        issues: array
        metrics: object

  - name: execution_status
    type: object
    description: Overall execution status
    properties:
      total_tasks: integer
      completed: integer
      failed: integer
      blocked: integer
      in_progress: integer

  - name: artifacts
    type: data[]
    description: List of file changes produced
    items:
      - path: string
        type: enum
        lines_added: integer
        lines_removed: integer

  - name: conflicts
    type: data[]
    description: File change conflicts detected
    required: false
    items:
      - file_path: string
        conflicting_tasks: string[]
        resolution: enum

## Steps
steps:
  - id: initialize-executors
    description: Initialize executors, prepare context for each Agent
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: schedule-tasks
    description: Schedule tasks based on dependency topology, execute independent tasks in parallel
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: pre-execution-rules-load
    description: Load project rules and agent-specific rules for each task before dispatch
    type: internal
    continue_on_error: false
    timeout: 2m
    notes: |
      Before each agent dispatch:
      1. Read {{RULES_DIR}}/*.md for project-level rules
      2. Read {{AGENTS_DIR}}/{agent}/rules/*.md for agent-specific rules
      3. Read {{SPEC_DIR}}/PROJECT_WHITEPAPER.md for current ADR and validation rules
      4. Inject rules_context into agent prompt

  - id: dispatch-to-agents
    description: Dispatch tasks to corresponding Agents with rules context
    type: agent-subprocess
    delegate_to: auto
    continue_on_error: true
    timeout: 30m
    notes: |
      For each task, build prompt with:
      1. Agent config from {{AGENTS_DIR}}/{agent}/agent.md
      2. Task descriptor from {{SPEC_DIR}}/projects/{project}/tasks/{id}.md
      3. Project context from {{SPEC_DIR}}/SPEC.md
      4. **Rules context from norm-load (see pre-execution-rules-load)**

  - id: monitor-execution
    description: Monitor execution progress of each Agent
    type: internal
    continue_on_error: false
    timeout: 1m

  - id: milestone-checkpoint
    description: Milestone checkpoint - wait for user confirmation before proceeding to next milestone
    type: human-action
    continue_on_error: false
    timeout: 10m
    notes: |
      For iterative delivery, pause after each milestone:

      1. Display milestone completion summary:
         - Tasks completed: N/Total
         - Artifacts produced
         - Issues encountered

      2. Wait for user decision:
         - [Continue] Proceed to next milestone
         - [Verify] Review artifacts before proceeding
         - [Fix] Request changes to current milestone
         - [Abort] Stop execution

      3. Record user decision and proceed accordingly

  - id: collect-results
    description: Collect TaskResult from each Agent
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: detect-conflicts
    description: Detect file change conflicts
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: retrospective-analysis
    description: Conduct retrospective analysis to identify lessons learned and promote effective practices
    type: internal
    continue_on_error: true
    timeout: 5m
    notes: |
      After execution completes:
      1. Analyze execution results
      2. Evaluate norms compliance rate
      3. Identify practices to promote to norms
      4. Propose updates to agent-specific or project-level norms
      5. Prepare updates for PROJECT_WHITEPAPER.md

  - id: archive-execution
    description: Archive execution artifacts and update whitepaper
    type: internal
    continue_on_error: true
    timeout: 3m
    notes: |
      After retrospective:
      1. Create archive in {{SPEC_DIR}}/archive/{date}_{execution-id}/
      2. Save execution summary, task results, artifacts manifest
      3. Update PROJECT_WHITEPAPER.md with execution record
      4. Apply any approved norm updates

  - id: report-completion
    description: Report execution completion status with retrospective summary
    type: internal
    continue_on_error: false
    timeout: 2m

## Checkpoint
checkpoint:
  required: true
  message: "Milestone checkpoint: {milestone_name} completed with {completed_tasks}/{total_tasks} tasks. Artifacts: {artifacts}. Awaiting user confirmation before proceeding to next milestone."

## Hook Configuration
hooks:
  on-execute-complete:
    - trigger: on-task-execute-complete
      action: prompt-milestone-confirmation
      next_skill: qa-verify
  on-milestone-complete:
    - trigger: on-milestone-complete
      action: wait-for-confirmation
      options:
        - Continue to next milestone
        - Review artifacts
        - Request changes
  on-execute-failure:
    - trigger: on-task-execute-failure
      action: notify-master
      fallback: retry-task
  on-norm-load:
    - trigger: on-norm-load-complete
      action: inject-to-prompt
      target: agent-execution-prompt
  on-retrospective-complete:
    - trigger: on-retrospective-complete
      action: confirm-norm-updates
      next_skill: archive
  on-archive-complete:
    - trigger: on-archive-complete
      action: notify-master
      message: "Execution archived and whitepaper updated"

---

# INSTRUCTIONS

You are a task execution coordinator. When the planning phase is complete, you need to coordinate multiple Agents to execute tasks.

## Critical: Milestone-Based Iterative Delivery

**For large/complex projects, use milestone-based execution instead of running all tasks at once.**

### Milestone Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MILESTONE-BASED EXECUTION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ MILESTONE M1 │───▶│   QA VERIFY   │───▶│   DELIVER    │     │
│  │ Execute M1   │    │   Verify M1   │    │   Deliver M1 │     │
│  │   Tasks      │    │               │    │               │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                   │                   │              │
│         │ User Confirm      │ User Confirm      │ User Confirm │
│         ▼                   ▼                   ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ MILESTONE M2 │───▶│   QA VERIFY   │───▶│   DELIVER    │     │
│  │   ...        │    │   ...        │    │   ...        │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### How to Execute by Milestone

1. **Load milestones from plan**
   ```typescript
   // Load plan.md and extract milestone definitions
   const plan = await readFile(`{{SPEC_DIR}}/projects/${project}/plan.md`);
   const milestones = parseMilestones(plan);
   ```

2. **Execute tasks within milestone**
   ```typescript
   for (const task of milestone.tasks) {
     // Dispatch to Agent
     const result = await Agent({
       subagent_type: task.agent_type,
       prompt: buildPrompt(task),
       description: `[Milestone: ${milestone.name}] ${task.task_id}`
     });
   }
   ```

3. **Milestone checkpoint (REQUIRED)**
   ```
   ╔══════════════════════════════════════════════════╗
   ║  MILESTONE COMPLETED                            ║
   ║  ─────────────────────────────────────────────  ║
   ║  Milestone: {name}                              ║
   ║  Tasks: {completed}/{total} completed          ║
   ║  Artifacts: {list}                             ║
   ║                                                  ║
   ║  Awaiting user confirmation...                  ║
   ╚══════════════════════════════════════════════════╝
   ```

4. **Wait for user before proceeding**

## Critical: Subagent Dispatch Implementation

**The key bug to fix:** Previous implementations described the process but did NOT actually dispatch subagents using the Agent() tool.

### How to Dispatch Subagents

**MUST use the Agent() tool** for each task:

```typescript
// 1. Load agent config
const agentConfig = await readFile(`{{AGENTS_DIR}}/${task.agent}/agent.md`);

// 2. Load task details
const taskDetail = await readFile(`{{SPEC_DIR}}/projects/${project}/tasks/${task.taskId}.md`);

// 3. Load project context
const projectContext = await readFile(`{{SPEC_DIR}}/SPEC.md`);

// 4. Load rules
const rules = await readFile(`{{RULES_DIR}}/coding-standards.md`);
const agentRules = await readFile(`{{AGENTS_DIR}}/${task.agent}/rules/coding.md`);

// 5. Build prompt
const prompt = buildPrompt(agentConfig, task, projectContext, rules);

// 6. DISPATCH USING AGENT() TOOL
const result = await Agent({
  subagent_type: "general-purpose",  // or "oh-my-claude:executor"
  prompt: prompt,
  description: `Execute: ${task.task_id}`
});

// 7. Wait for completion and record result
results.push(result);
```

### Common Mistake to Avoid

❌ **WRONG**: Just describing the process without calling Agent()
```
// This does NOT execute tasks!
console.log("Would dispatch to subagent...");
return { dispatched: true };  // FAKE result!
```

✅ **CORRECT**: Actually call the Agent() tool
```
// This actually executes the task
const result = await Agent({
  subagent_type: "general-purpose",
  prompt: fullPrompt,
  description: `Execute: ${task.task_id}`
});
return result;
```

## Three-Phase Subagent Dispatch

For each TaskDescriptor, execute a three-phase review process:

### Phase 1: Implementer

1. **Load Rules Context** (NEW - Critical)
   ```typescript
   // 1.1 Load project-level rules
   const projectRules = await readFile(`{{RULES_DIR}}/coding-standards.md`);
   const architectureRules = await readFile(`{{RULES_DIR}}/architecture.md`);
   const namingRules = await readFile(`{{RULES_DIR}}/naming-conventions.md`);

   // 1.2 Load agent-specific rules
   const agentRules = await readFile(`{{AGENTS_DIR}}/${task.agent}/rules/coding.md`);
   const agentReviewRules = await readFile(`{{AGENTS_DIR}}/${task.agent}/rules/review.md`);

   // 1.3 Load whitepaper for current ADR
   const whitepaper = await readFile(`{{SPEC_DIR}}/PROJECT_WHITEPAPER.md`);

   // 1.4 Build rules context
   const rulesContext = buildRulesContext(projectRules, agentRules, whitepaper);
   ```

2. Read agent config from `{{AGENTS_DIR}}/{task.agent}/agent.md`
3. Read task descriptor from `.project-teams-spec/projects/{project}/tasks/{task-id}.md`
4. Read project context from `.project-teams-spec/SPEC.md`
5. Build prompt from agent config + task descriptor + project context + **rules context**
6. Use Agent tool to dispatch subagent:

```typescript
Agent({
  subagent_type: agentConfig.type,  // e.g., "general-purpose"
  prompt: buildPrompt(agentConfig, task, projectContext),
  description: `Execute task: ${task.task_id}`
});
```

6. Wait for subagent to complete
7. Report: DONE / BLOCKED

#### Prompt 构建流程

对于每个任务，使用以下流程构建完整 prompt：

1. **读取 Agent 配置**
   ```typescript
   const agentConfig = await readFile(`{{AGENTS_DIR}}/${task.agent}/agent.md`);
   ```

2. **读取任务详情**
   ```typescript
   const taskDetail = await readFile(`{{SPEC_DIR}}/projects/{project}/tasks/${task.task_id}.md`);
   ```

3. **读取项目上下文**
   ```typescript
   const projectContext = await readFile(`{{SPEC_DIR}}/SPEC.md`);
   ```

4. **构建完整 Prompt（包含规则上下文）**
   ```typescript
   const fullPrompt = `
   \${agentConfig}

   ---

   ## Rules Context (MUST FOLLOW)

   ### Project-Level Rules
   \${projectRules}

   ### Agent-Specific Rules
   \${agentRules}

   ### Current ADR (Architecture Decisions)
   From PROJECT_WHITEPAPER.md:
   \${currentADR}

   ### CRITICAL RULES - MUST FOLLOW
   \${criticalRules}

   ---

   ## Task Assignment

   ### Task ID
   \${task.task_id}

   ### Instruction
   \${task.instruction}

   ### Acceptance Criteria
   \${task.acceptance_criteria.map(c => `- \${c}`).join('\n')}

   ### Constraints
   \${task.constraints.map(c => `- \${c}`).join('\n')}

   ### Project Context
   \${projectContext}

   ---

   ## Execution Rules

   1. **Before writing code**: Verify against all loaded rules
   2. **During implementation**: Follow coding standards strictly
   3. **After implementation**: Self-review against review checklist
   4. **Report deviations**: Note any rules that couldn't be followed and why
   `;
   ```

5. **使用 Agent Tool 唤起 Subagent**
   ```typescript
   Agent({
     subagent_type: "general-purpose",  // 从 agent.md 的 type 字段获取
     prompt: fullPrompt,
     description: `Execute \${task.task_id} using \${task.agent}`
   });
   ```

### Phase 2: Spec Review (if Implementer succeeded)

1. Read spec reviewer config from `{{AGENTS_DIR}}/code-reviewer/agent.md`
2. Build spec review prompt

3. Use Agent tool to dispatch spec reviewer:

```typescript
const specReviewPrompt = `
## Task Description
${task.instruction}

## Acceptance Criteria
${task.acceptance_criteria}

## Implementation
[What implementer claims they built]

## Review Criteria
1. Verify implementation matches requirements
2. Check for missing requirements
3. Check for extra/unneeded work

Report:
- status: approved / issues_found
- issues: [list of issues]
`;

Agent({
  subagent_type: "general-purpose",
  prompt: specReviewPrompt,
  description: `Spec review: ${task.task_id}`
});
```

4. Wait for spec reviewer to complete
5. Report: approved / issues_found

### Phase 3: Code Quality Review (if Spec Review passed)

1. Read code reviewer config from `{{AGENTS_DIR}}/code-reviewer/agent.md`
2. Build code review prompt

3. Use Agent tool to dispatch code reviewer:

```typescript
const codeReviewPrompt = `
## Task Description
${task.instruction}

## Implementation
[What was implemented]

## Code Quality Criteria
1. Clean code structure
2. Follows coding standards
3. Proper error handling
4. Test coverage

## Your Job
1. Read the code
2. Evaluate code quality
3. Check for issues

Report:
- status: approved / issues_found
- strengths: [what was done well]
- issues: [issues found with severity]
`;

Agent({
  subagent_type: "general-purpose",
  prompt: codeReviewPrompt,
  description: `Code review: ${task.task_id}`
});
```

4. Wait for code reviewer to complete
5. Report: approved / issues_found

### Phase 4: Aggregate TaskResult

Combine all phase results into final TaskResult format.

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

## Error Handling

| Error Type | Handling Strategy | Recovery Action |
|------------|-----------------|----------------|
| Agent timeout | Retry (max 2 times) | Reassign or skip task |
| Agent crash | Log and retry | Request manual intervention |
| File conflict | Pause conflicting tasks | Request user decision |
| Dependency blocked | Block dependent tasks | Wait for resolution |
| Resource exhaustion | Pause scheduling | Request resource cleanup |

### Timeout Handling

```
1. Set task deadline (default: 30 minutes)
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

## TaskDescriptor Format

Each task is dispatched in the following format:

```yaml
task_id: "task-001"
type: execute
agent: java-agent
agent_config: "{{AGENTS_DIR}}/java-agent/agent.md"
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
  - Follow {{RULES_DIR}}/coding-standards.md
  - Maintain API compatibility
  - Include test coverage

expected_output: |
  Modified files and change summary

deadline: "30m"

# Milestone for iterative delivery
milestone: "m1-core-auth"  # Groups tasks for incremental delivery
priority: 1                # Lower = higher priority within milestone
```

## Milestone Format

Milestones group related tasks for incremental delivery:

```yaml
milestones:
  - id: "m1-core-auth"
    name: "Core Authentication"
    description: "Basic authentication infrastructure"
    tasks: ["task-001", "task-002", "task-003"]
    dependencies: []  # Other milestone IDs
    estimated_duration: "2h"

  - id: "m2-user-management"
    name: "User Management"
    description: "User CRUD operations"
    tasks: ["task-004", "task-005"]
    dependencies: ["m1-core-auth"]  # Wait for core auth
    estimated_duration: "3h"
```

## Milestone-Based Delivery Strategy

| Complexity | Milestone Count | Strategy |
|------------|-----------------|----------|
| S (<1K LOC) | 1 (all tasks) | Single delivery |
| M (1-10K) | 2-3 milestones | Core → Features → Polish |
| L (10-50K) | 4-6 milestones | Per-module delivery |
| XL (>50K) | 6+ milestones | Sprint-style iterations |

## TaskResult Format

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

## Key Constraints

1. **Tasks are indivisible**: Each TaskDescriptor is an atomic task
2. **Dependencies must be satisfied**: Subsequent tasks cannot execute until prerequisites complete
3. **Results must be structured**: All TaskResults must conform to the format
4. **Conflicts must be reported**: File conflicts must not be handled silently