/**
 * Command Templates
 *
 * Defines the content for all project-teams-spec commands.
 * Enhanced with better descriptions and usage examples.
 */

import type { CommandContent } from './command-generation/types.js';

/**
 * Get all command contents.
 */
export function getCommandContents(): CommandContent[] {
  return [
    getAnalyzeCycleCommand(),
    getPlanCycleCommand(),
    getExecuteCycleCommand(),
  ];
}

function getAnalyzeCycleCommand(): CommandContent {
  return {
    id: 'analyze-cycle',
    name: 'analyze-cycle',
    description: 'Project analysis workflow - explore structure, evaluate complexity, clarify requirements',
    category: 'Workflow',
    tags: ['analysis', 'complexity', 'exploration', 'requirements'],
    body: `# Analyze Cycle

Execute the complete project analysis workflow to understand your codebase and prepare for development.

## Skills Chain

1. **pts-project-explore** - Analyze project structure, tech stack, and module dependencies
2. **pts-complexity-evaluate** - Evaluate project complexity (S/M/L/XL) and delivery strategy
3. **pts-requirement-clarify** - Clarify ambiguous requirements and gather user input

## Checkpoint Strategy

- After project-explore: Display project summary
- After complexity-evaluate: User confirmation required
- After requirement-clarify: Present consolidated requirements

## Execution Flow

1. **Project Exploration**
   - Scan project structure and file types
   - Identify technology stack (languages, frameworks, build tools)
   - Map module dependencies and entry points
   - Generate \`.project-teams-spec/projects/[name]/exploration.md\`

2. **Complexity Evaluation**
   - Assess code volume, test coverage, and documentation
   - Determine complexity class: S (< 1K), M (1-10K), L (10-50K), XL (> 50K)
   - Generate delivery strategy based on complexity
   - Generate \`.project-teams-spec/COMPLEXITY.md\`

3. **Requirement Clarification**
   - Analyze SPEC.md and identify ambiguous requirements
   - Generate clarification questions
   - Present to user and collect answers
   - Update requirements with clarifications

## Output

| File | Description |
|------|-------------|
| \`.project-teams-spec/SPEC.md\` | Project specification document |
| \`.project-teams-spec/COMPLEXITY.md\` | Complexity evaluation report |
| \`.project-teams-spec/projects/[name]/exploration.md\` | Project structure |

## Usage

\`\`\`
/pts:analyze                    # Run full analysis cycle
/pts:analyze --skip-explore     # Skip exploration if already done
/pts:analyze --re-evaluate      # Re-evaluate complexity
\`\`\`

## Next Steps

After completion:
- Run \`/pts:plan\` for task planning
`,
  };
}

function getPlanCycleCommand(): CommandContent {
  return {
    id: 'plan-cycle',
    name: 'plan-cycle',
    description: 'Planning cycle - from agent matching to plan validation with multi-agent coordination',
    category: 'Workflow',
    tags: ['planning', 'agents', 'tasks', 'coordination', 'estimation'],
    body: `# Plan Cycle

Execute the complete planning workflow with autonomous agent coordination.

## Skills Chain

1. **pts-agent-match** - Match agents to tasks based on expertise and availability
2. **pts-pyramid-analyze** - Analyze strategy and tactics layer by layer
3. **pts-master-summarize** - Synthesize master perspective with resource allocation
4. **pts-plan-develop** - Generate detailed implementation plan
5. **pts-plan-validate** - Review and validate plan with user

## Checkpoint Strategy

- After agent-match: Display task ownership matrix
- After pyramid-analyze: Present strategic layers
- Before plan-validate: User confirmation required

## Prerequisites

- project-explore and complexity-evaluate must be completed
- User has confirmed complexity evaluation results
- SPEC.md exists in \`.project-teams-spec/\`

## Execution Flow

### Phase 1: Agent Matching

1. Analyze tasks from SPEC.md and complexity evaluation
2. Match each task to best-fit agent:
   - **Java Agent**: Backend services, JVM optimization, Spring ecosystems
   - **Frontend Agent**: UI components, React/Vue, CSS, responsive design
   - **Backend Agent**: API design, database, microservices
   - **QA Agent**: Test strategy, verification criteria
   - **Code Reviewer**: Quality gates, coding standards

3. Generate task ownership matrix with confidence scores

### Phase 2: Pyramid Analysis

1. **Strategy Layer** (Why): Business goals and success criteria
2. **Tactics Layer** (What): Feature breakdown and task priorities
3. **Combat Layer** (How): Implementation details and technical approach

4. Present pyramid summary to user

### Phase 3: Master Summarize

1. Synthesize all agent inputs into unified plan
2. Define:
   - Task dependencies and critical path
   - Integration points between agents
   - Quality gates and checkpoints
3. Generate resource allocation recommendations

### Phase 4: Plan Validation

1. Review plan for:
   - Completeness (all tasks covered)
   - Feasibility (realistic timelines)
   - Risk coverage (mitigation strategies)
2. Present to user for confirmation
3. Iterate based on feedback

## Output

| Artifact | Location |
|----------|----------|
| Task ownership | \`.project-teams-spec/projects/[name]/tasks/ownership.json\` |
| Pyramid analysis | \`.project-teams-spec/projects/[name]/pyramid.md\` |
| Execution plan | \`.project-teams-spec/projects/[name]/plan.md\` |
| Task list | \`.project-teams-spec/projects/[name]/tasks/*.md\` |

## Usage

\`\`\`
/pts:plan                 # Run full planning cycle
/pts:plan --skip-match    # Use pre-assigned tasks
/pts:plan --quick         # Minimal analysis
\`\`\`

## Next Steps

After plan validation:
- Run \`/pts:execute\` for implementation
- Or review plan.md before proceeding

## Success Criteria

- All tasks have assigned owners with confidence scores
- Pyramid analysis covers all three layers
- Plan.md is user-approved
- Dependencies are clearly mapped
`,
  };
}

function getExecuteCycleCommand(): CommandContent {
  return {
    id: 'execute-cycle',
    name: 'execute-cycle',
    description: 'Execution cycle - task execution, QA verification, and delivery closure with iterative milestones',
    category: 'Workflow',
    tags: ['execution', 'qa', 'delivery', 'verification', 'milestone'],
    body: `# Execute Cycle

Execute the complete implementation workflow with continuous QA verification and milestone-based iterative delivery.

## Skills Chain

1. **pts-norm-load** - Load project norms and context
2. **pts-task-execute** - Execute assigned tasks with sub-agent dispatch
3. **pts-qa-verify** - Verify execution results against acceptance criteria
4. **pts-delivery-close** - Archive deliverables and close delivery

## Checkpoint Strategy

- After each task completion: Auto-trigger partial verification
- Before qa-verify: User confirmation required
- Before delivery-close: User confirmation required
- On QA failure: Loop back to task-execute for fixes

## Prerequisites

- plan-validate has passed user confirmation
- Execution plan (plan.md) is finalized
- All tasks have assigned owners
- Pyramid analysis is complete

## Execution Flow

### Phase 1: Task Execution (Milestone-Based Iterative Delivery)

**For large/complex projects, use milestone-based iterative delivery.**

#### Step 1: Load Milestones from Plan

1. Load \`plan.md\` to identify milestones
2. Parse milestone definitions
3. If no milestones, treat entire task set as single milestone

#### Step 2: Execute Tasks by Milestone

**For EACH milestone:**

1. **Check milestone dependencies**
2. **Execute tasks in this milestone** (use Agent tool)
3. **Track milestone progress**

#### Step 3: Milestone Checkpoint (REQUIRED)

**After each milestone, WAIT for user confirmation.**

### Phase 2: QA Verification (Per Milestone)

1. **Run verification for each completed task**
2. **Handle failures**: Return to task-execute for fixes
3. **Milestone sign-off**: User approves after all tasks pass

### Phase 3: Delivery Closure (Per Milestone)

1. **Generate delivery summary**
2. **Update LESSONS_LEARNED.md** from experience
3. **Archive artifacts**

## Output

| Artifact | Location |
|----------|----------|
| Milestone results | \`.project-teams-spec/deliveries/<milestone-id>/results.json\` |
| QA report | \`.project-teams-spec/deliveries/<milestone-id>/qa-report.md\` |
| Archive | \`.project-teams-spec/deliveries/<milestone-id>/\` |

## Usage

\`\`\`
/pts:execute                    # Run milestone-based execution
/pts:execute --milestone m1     # Execute specific milestone
/pts:execute --skip-qa          # Skip verification (testing)
\`\`\`

## Success Criteria

- All milestones executed successfully
- QA verification passes for each milestone
- User approves each milestone delivery
`,
  };
}