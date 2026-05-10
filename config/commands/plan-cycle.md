# Command: plan-cycle

## Metadata
name: plan-cycle
description: Planning cycle - complete workflow from task claiming to plan validation
version: 1.0.0

## Skill Chain
skills:
  - agent-claim
  - issue-aggregate
  - plan-develop
  - plan-validate

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - plan-validate
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
1. Agents claim tasks (agent-claim)
2. Aggregate clarification issues (issue-aggregate)
3. After user feedback, generate implementation plan (plan-develop)
4. Review plan (plan-validate)

Preconditions:
- project-explore and complexity-evaluate completed
- User has confirmed complexity assessment results

After completion, user can:
- Confirm execution plan
- Proceed to execution-cycle for implementation
