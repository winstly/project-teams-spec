# Command: execute-cycle

## Metadata
name: execute-cycle
description: Task execution, QA verification, and delivery workflow
version: 1.0.0

## Skill Chain
skills:
  - pts-norm-load
  - pts-task-execute
  - pts-qa-verify
  - pts-delivery-close

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - pts-task-execute
    - pts-qa-verify
  require: user-confirm

## Branch Conditions
branches:
  on-success:
    path: complete
    message: "Execution complete. Deliverables archived, lessons learned recorded."
  on-fail:
    path: task-execute
    message: "QA verification failed. Return to task execution for fixes."

## Execution Notes
This command executes the complete execution cycle:
1. Load rules context for executors (pts-norm-load)
2. Dispatch subagents to execute tasks (pts-task-execute)
3. QA Agent verifies execution results (pts-qa-verify)
4. Archive and deliver (pts-delivery-close)

On QA failure:
- Rollback to pts-task-execute for fixes
- Re-run QA verification after fixes

Preconditions:
- pts-plan-validate has passed user confirmation
- Execution plan is finalized

Entry: /pts:execute

Hook configuration:
- After pts-norm-load completes, auto-trigger pts-task-execute
- After pts-task-execute completes, auto-trigger pts-qa-verify
- On pts-qa-verify failure, notify Master and user
- After pts-qa-verify passes, auto-trigger pts-delivery-close