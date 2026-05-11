# Command: plan-cycle

## Metadata
name: plan-cycle
description: Planning cycle - complete workflow from task claiming to plan validation
version: 1.0.0

## Skill Chain
skills:
  - pts-agent-claim
  - pts-issue-aggregate
  - pts-plan-develop
  - pts-plan-validate

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - pts-plan-validate
  require: user-confirm

## Branch Conditions
branches:
  on-success:
    path: next-phase
    message: "Plan review passed. Proceed to execution-cycle."
  on-fail:
    path: notify-master
    message: "Plan review failed. Revise and re-review."

## Execution Notes
This command executes the complete planning cycle:
1. Agents claim tasks (pts-agent-claim)
2. Aggregate clarification issues (pts-issue-aggregate)
3. After user feedback, generate implementation plan (pts-plan-develop)
4. Review plan (pts-plan-validate)

Preconditions:
- pts-project-explore and pts-complexity-evaluate completed
- User has confirmed complexity assessment results

After completion, user can:
- Confirm execution plan
- Proceed to execution-cycle for implementation
