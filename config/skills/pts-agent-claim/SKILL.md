# SKILL: agent-claim

## Metadata
name: agent-claim
version: 1.0.0
granularity: protocol
type: agent-subprocess
phase: 3

## Preconditions
preconditions:
  - complexity-evaluate has been completed
  - User has confirmed ComplexityReport
  - agent_assignments have been determined

## Input
input:
  - name: agent_assignments
    type: data
    description: Agent assignment plan

  - name: project_md
    type: file
    path: {{SPEC_DIR}}/SPEC.md
    description: Project analysis document

  - name: complexity_report
    type: file
    path: {{SPEC_DIR}}/COMPLEXITY.md
    description: Complexity evaluation report

## Output
output:
  - name: claimed_tasks
    type: data
    description: Tasks claimed by each Agent (TaskDescriptor[])

  - name: impact_scope
    type: data
    description: Impact scope mapping

  - name: clarifications
    type: data
    description: List of clarification requests (ClarificationRequest[])

## Steps
steps:
  - id: distribute-tasks
    description: Distribute tasks to corresponding Agents
    type: agent-subprocess
    delegate_to: auto

  - id: agent-claim-tasks
    description: Each Agent claims and confirms tasks
    type: agent-subprocess

  - id: collect-clarifications
    description: Collect clarification requests from each Agent
    type: internal

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-claim-complete
      action: auto-trigger-next-skill  # Auto-trigger issue-aggregate

---
# INSTRUCTIONS

You are a task assignment coordinator. Assign tasks to each Agent based on the complexity evaluation results.

## Task Assignment Protocol

### Assignment Rules

```
Assignment basis:
1. Agent tech stack matching (matched_agents)
2. Task complexity level (ComplexityReport.level)
3. Agent availability (agent_assignments)

Assignment strategy:
- S level: 1 Agent + QA
- M level: 2-3 Agents + QA
- L/XL level: Multiple Agents + phased delivery
```

### ClarificationRequest Format

If an Agent needs clarification, generate the following format:

```yaml
task_id: "clarification-001"
agent: "java-agent"
question: |
  Regarding database migration:
  Option A: Online migration, keep old tables
  Option B: Offline migration, drop old tables
  Please confirm which approach to use?
options:
  - "A: Online migration"
  - "B: Offline migration"
blocking: true
```

## Execution Flow

### 1. Read Agent Assignment Plan

```
agent_assignments contains:
- agents: AgentRef[]
- tasks: TaskRef[]
- capabilities: Map
```

### 2. Generate TaskDescriptor

```
Generate a TaskDescriptor for each task:
- task_id: task-{N}
- type: claim
- agent: Assigned Agent
- context: Project context and impact scope
- instruction: Task description
- constraints: Constraint conditions (from rules)
- expected_output: Expected deliverable
```

### 3. Distribute to Agents

```
Distribute to each Agent:
1. Send TaskDescriptor
2. Wait for Agent confirmation
3. If Agent raises a clarification request, record it in clarifications
4. If Agent rejects the task, record and reassign
```

### 4. Aggregate ClarificationRequests

```
All Agent clarification requests are aggregated for processing in the issue-aggregate phase:
- blocking: true issues must be resolved first
- blocking: false issues can be resolved during execution
```

## Key Constraints

1. **Tasks must be assigned to appropriate Agents**: Match based on tech stack and capabilities
2. **ClarificationRequests must be complete**: Include question, options, and blocking status
3. **Blocked tasks cannot be executed**: Until clarification issues are resolved

## Checkpoint
checkpoint:
  required: true
  message: "Task assignment complete. Please confirm the assignment plan for each Agent."
