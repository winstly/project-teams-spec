/**
 * Command Templates
 *
 * Defines the content for all project-teams-spec commands.
 */

import type { CommandContent } from './command-generation/types.js';

/**
 * Get all command contents.
 */
export function getCommandContents(): CommandContent[] {
  return [
    getFullAnalysisCommand(),
    getPlanCycleCommand(),
    getExecutionCycleCommand(),
  ];
}

function getFullAnalysisCommand(): CommandContent {
  return {
    id: 'full-analysis',
    name: 'full-analysis',
    description: 'Complete project analysis workflow',
    category: 'Workflow',
    tags: ['analysis', 'complexity', 'exploration'],
    body: `# Full Analysis

Execute the complete project analysis workflow.

## Skills Chain

1. **pts-project-explore** - Analyze project structure, tech stack, and module dependencies
2. **pts-complexity-evaluate** - Evaluate project complexity (S/M/L/XL)

## Checkpoint Strategy

- Before complexity-evaluate: User confirmation required

## Execution Flow

1. Analyze project structure and identify tech stack
2. Identify matching Agents
3. Evaluate project complexity
4. Generate delivery targets and Agent assignment plan

## Output

- \`.project-teams-spec/SPEC.md\` - Project analysis document
- \`.project-teams-spec/COMPLEXITY.md\` - Complexity evaluation report

## Next Steps

After completion, you can:
- Confirm SPEC.md and COMPLEXITY.md
- Continue with \`/pts:plan-cycle\` for planning
- Directly execute \`/pts:execution-cycle\` for implementation

## Usage

\`\`\`
/pts:full-analysis
\`\`\`
`,
  };
}

function getPlanCycleCommand(): CommandContent {
  return {
    id: 'plan-cycle',
    name: 'plan-cycle',
    description: 'Planning cycle - from task claiming to plan confirmation',
    category: 'Workflow',
    tags: ['planning', 'agents', 'tasks'],
    body: `# Plan Cycle

Execute the complete planning workflow.

## Skills Chain

1. **pts-agent-claim** - Agents claim tasks
2. **pts-issue-aggregate** - Aggregate clarification questions
3. **pts-plan-develop** - Generate implementation plan
4. **pts-plan-validate** - Review and validate plan

## Checkpoint Strategy

- Before plan-validate: User confirmation required

## Execution Flow

1. Agents claim tasks based on their expertise
2. Aggregate and clarify questions from agents
3. User provides feedback
4. Generate implementation plan
5. Review and validate plan

## Prerequisites

- project-explore and complexity-evaluate completed
- User has confirmed complexity evaluation results

## Output

- \`.project-teams-spec/projects/[name]/plan.md\` - Execution plan
- \`.project-teams-spec/projects/[name]/tasks/\` - Task list

## Next Steps

After confirmation:
- Continue with \`/pts:execution-cycle\` for implementation

## Usage

\`\`\`
/pts:plan-cycle
\`\`\`
`,
  };
}

function getExecutionCycleCommand(): CommandContent {
  return {
    id: 'execution-cycle',
    name: 'execution-cycle',
    description: 'Execution cycle - from task execution to delivery',
    category: 'Workflow',
    tags: ['execution', 'qa', 'delivery'],
    body: `# Execution Cycle

Execute the complete implementation workflow.

## Skills Chain

1. **pts-task-execute** - Execute assigned tasks
2. **pts-qa-verify** - Verify execution results
3. **pts-delivery-close** - Archive and close delivery

## Checkpoint Strategy

- Before qa-verify: User confirmation required
- Before delivery-close: User confirmation required

## Execution Flow

1. Agents execute their assigned tasks
2. QA Agent verifies execution results
3. If QA fails, loop back to task-execute for fixes
4. After QA passes, archive and close delivery

## Prerequisites

- plan-validate has passed user confirmation
- Execution plan has been finalized

## Output

- TaskResult[] - Execution results from each Agent
- VerificationReport - QA verification report
- Artifact[] - Archived deliverables

## Hook Configuration

- After task-execute: Auto-trigger qa-verify
- After qa-verify failure: Notify Master and user

## Usage

\`\`\`
/pts:execution-cycle
\`\`\`
`,
  };
}
