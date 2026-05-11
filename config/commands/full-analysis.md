# Command: full-analysis

## Metadata
name: full-analysis
description: Complete project analysis workflow - analyzes project structure and evaluates complexity
version: 1.0.0

## Skill Chain
skills:
  - pts-project-explore
  - pts-complexity-evaluate

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  before:
    - pts-complexity-evaluate
  require: user-confirm

## Branch Conditions
branches:
  on-success:
    path: next-phase
    message: "Project analysis complete. Proceed to plan-cycle or manually trigger pts-task-execute."
  on-fail:
    path: notify-master
    message: "Project analysis failed. Check project path and configuration files."

## Execution Notes
This command executes complete project analysis, including:
1. Analyze project structure, tech stack, module dependencies
2. Identify matching Agents
3. Evaluate project complexity (S/M/L/XL)
4. Generate delivery targets and Agent allocation plan

After completion, user can:
- Confirm {{SPEC_DIR}}/SPEC.md and {{SPEC_DIR}}/COMPLEXITY.md
- Proceed to plan-cycle for planning
- Directly execute execution-cycle for implementation
