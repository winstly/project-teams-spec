# Command: plan-cycle

## Metadata
name: plan-cycle
description: Agent matching, pyramid analysis, and execution plan workflow
version: 1.0.0

## Skill Chain
skills:
  - pts-agent-match
  - pts-pyramid-analyze
  - pts-master-summarize
  - pts-plan-develop
  - pts-plan-validate

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - pts-pyramid-analyze
    - pts-master-summarize
    - pts-plan-validate
  require: user-confirm

## Branch Conditions
branches:
  on-success:
    path: execute-cycle
    message: "Plan validated. Run /pts:execute to start implementation."
  on-fail:
    path: notify-master
    message: "Plan validation failed. Revise and re-run /pts:plan."

## Execution Notes
This command executes the complete planning cycle:
1. Match agents with transparent reasoning (pts-agent-match)
2. Analyze changes using pyramid methodology (pts-pyramid-analyze)
3. Aggregate all analysis into summary (pts-master-summarize)
4. Generate execution plan (pts-plan-develop)
5. Validate plan with user (pts-plan-validate)

Preconditions:
- pts-project-explore and pts-complexity-evaluate completed
- User has confirmed complexity assessment results
- User has confirmed requirement document

Entry: /pts:plan

Hook configuration:
- After pts-agent-match completes, auto-trigger pts-pyramid-analyze
- After pts-pyramid-analyze completes, auto-trigger pts-master-summarize
- After pts-master-summarize completes, notify user for confirmation
- After user confirms, trigger pts-plan-develop
- After pts-plan-develop completes, auto-trigger pts-plan-validate