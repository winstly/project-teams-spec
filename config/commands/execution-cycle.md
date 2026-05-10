# Command: execution-cycle

## Metadata
name: execution-cycle
description: Execution cycle - complete workflow from task execution to delivery archival
version: 1.0.0

## Skill Chain
skills:
  - task-execute
  - qa-verify
  - delivery-close

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - qa-verify
    - delivery-close
  require: user-confirm

## Branch Conditions
branches:
  on-success:
    path: complete
    message: "Execution cycle complete. Deliverables archived, lessons learned recorded."
  on-fail:
    path: notify-master
    message: "QA verification failed. Fix and re-execute task-execute."

## Execution Notes
This command executes the complete execution cycle:
1. Agents execute assigned tasks (task-execute)
2. QA Agent verifies execution results (qa-verify)
3. On QA failure, rollback to task-execute for fixes
4. After QA passes, archive and deliver (delivery-close)

Preconditions:
- plan-validate has passed user confirmation
- Execution plan is finalized

Hook configuration:
- After task-execute completes, auto-trigger qa-verify (on-execute-complete)
- On qa-verify failure, notify Master and user (on-qa-fail)
