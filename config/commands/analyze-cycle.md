# Command: analyze-cycle

## Metadata
name: analyze-cycle
description: Project analysis and requirement clarification workflow
version: 1.0.0

## Skill Chain
skills:
  - pts-project-explore
  - pts-complexity-evaluate
  - pts-requirement-clarify

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - pts-complexity-evaluate
    - pts-requirement-clarify
  require: user-confirm

## Branch Conditions
branches:
  on-success:
    path: plan-cycle
    message: "Analysis complete. Run /pts:plan to proceed to planning."
  on-fail:
    path: notify-master
    message: "Analysis failed. Check project path and try again."

## Execution Notes
This command executes the complete analysis cycle:
1. Scan project and generate SPEC.md (pts-project-explore)
2. Evaluate complexity and generate COMPLEXITY.md (pts-complexity-evaluate)
3. Clarify requirements through 5W1H dialogue (pts-requirement-clarify)

Preconditions:
- User has provided project path or description

Entry: /pts:analyze [project-path]

Hook configuration:
- After pts-project-explore completes, auto-trigger pts-complexity-evaluate
- After pts-complexity-evaluate completes, notify user for confirmation
- After user confirms, trigger pts-requirement-clarify