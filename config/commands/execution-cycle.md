# Command: execution-cycle

## Metadata
name: execution-cycle
description: Execution cycle - complete workflow from task execution to delivery archival
version: 1.0.0

## Skill Chain
skills:
  - pts-task-execute
  - pts-qa-verify
  - pts-delivery-close

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - pts-qa-verify
    - pts-delivery-close
  require: user-confirm

## Branch Conditions
branches:
  on-success:
    path: complete
    message: "Execution cycle complete. Deliverables archived, lessons learned recorded."
  on-fail:
    path: notify-master
    message: "QA verification failed. Fix and re-execute pts-task-execute."

## Execution Notes
This command executes the complete execution cycle:
1. Agents execute assigned tasks (pts-task-execute)
2. QA Agent verifies execution results (pts-qa-verify)
3. On QA failure, rollback to pts-task-execute for fixes
4. After QA passes, archive and deliver (pts-delivery-close)

Preconditions:
- pts-plan-validate has passed user confirmation
- Execution plan is finalized

Hook configuration:
- After pts-task-execute completes, auto-trigger pts-qa-verify (on-execute-complete)
- On pts-qa-verify failure, notify Master and user (on-qa-fail)
