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
    getFullAnalysisCommand(),
    getPlanCycleCommand(),
    getExecutionCycleCommand(),
  ];
}

function getFullAnalysisCommand(): CommandContent {
  return {
    id: 'full-analysis',
    name: 'full-analysis',
    description: 'Complete project analysis workflow - explore, evaluate complexity, and generate SPEC',
    category: 'Workflow',
    tags: ['analysis', 'complexity', 'exploration', 'spec', 'setup'],
    body: `# Full Analysis

Execute the complete project analysis workflow to understand your codebase and prepare for development.

## Skills Chain

1. **pts-project-explore** - Analyze project structure, tech stack, and module dependencies
2. **pts-complexity-evaluate** - Evaluate project complexity (S/M/L/XL) and assign agents

## Checkpoint Strategy

- Before complexity-evaluate: User confirmation required
- After completion: Review generated SPEC.md and COMPLEXITY.md

## Execution Flow

1. **Project Exploration**
   - Scan project structure and file types
   - Identify technology stack (languages, frameworks, build tools)
   - Map module dependencies and entry points
   - Generate \`.project-teams-spec/projects/[name]/exploration.md\`

2. **Complexity Evaluation**
   - Assess code volume, test coverage, and documentation
   - Determine complexity class: S (< 1K lines), M (1-10K), L (10-50K), XL (> 50K)
   - Identify potential risks and technical debt
   - Generate \`.project-teams-spec/COMPLEXITY.md\`

3. **Agent Assignment Plan**
   - Match project characteristics to available agents
   - Generate resource allocation recommendations
   - Create initial task breakdown

## Output

| File | Description |
|------|-------------|
| \`.project-teams-spec/SPEC.md\` | Project specification document |
| \`.project-teams-spec/COMPLEXITY.md\` | Complexity evaluation report |
| \`.project-teams-spec/projects/[name]/\` | Project-specific data |

## Next Steps

After completion, you can:

- **Confirm results**: Review and validate SPEC.md and COMPLEXITY.md
- **Plan cycle**: Run \`/pts:plan-cycle\` for detailed task planning
- **Direct execution**: Run \`/pts:execution-cycle\` for implementation (if plan is ready)

## Usage Examples

\`\`\`
/pts:full-analysis                    # Run full analysis
/pts:full-analysis --skip-explore    # Skip exploration if already done
/pts:full-analysis --re-evaluate     # Re-evaluate complexity
\`\`\`

## Exit Criteria

- SPEC.md exists and is validated
- COMPLEXITY.md contains accurate complexity class
- All risks are documented
`,
  };
}

function getPlanCycleCommand(): CommandContent {
  return {
    id: 'plan-cycle',
    name: 'plan-cycle',
    description: 'Planning cycle - from task claiming to plan confirmation with multi-agent coordination',
    category: 'Workflow',
    tags: ['planning', 'agents', 'tasks', 'coordination', 'estimation'],
    body: `# Plan Cycle

Execute the complete planning workflow with autonomous agent coordination.

## Skills Chain

1. **pts-agent-claim** - Agents claim tasks based on expertise
2. **pts-issue-aggregate** - Aggregate clarification questions from agents
3. **pts-plan-develop** - Generate detailed implementation plan
4. **pts-plan-validate** - Review and validate plan with user

## Checkpoint Strategy

- After agent-claim: Display task ownership matrix
- After issue-aggregate: Present consolidated questions
- Before plan-validate: User confirmation required

## Prerequisites

- project-explore and complexity-evaluate must be completed
- User has confirmed complexity evaluation results
- SPEC.md exists in \`.project-teams-spec/\`

## Execution Flow

### Phase 1: Task Claiming

1. Analyze tasks from SPEC.md and complexity evaluation
2. Each agent claims tasks matching their expertise:
   - **Java Agent**: Backend services, JVM optimization, Spring ecosystems
   - **Frontend Agent**: UI components, React/Vue, CSS, responsive design
   - **Backend Agent**: API design, database, microservices
   - **QA Agent**: Test strategy, verification criteria
   - **Code Reviewer**: Quality gates, coding standards

3. Generate task ownership matrix

### Phase 2: Issue Aggregation

1. Collect clarification questions from all agents
2. Categorize issues by type:
   - **Technical**: Architecture decisions, dependencies
   - **Scope**: Feature boundaries, out-of-scope items
   - **Resource**: Time constraints, team availability
3. Present consolidated view to user
4. Wait for user responses before proceeding

### Phase 3: Plan Development

1. Generate implementation plan based on:
   - Task breakdown from complexity evaluation
   - Agent expertise mapping
   - User clarifications
2. Define:
   - Task dependencies and critical path
   - Integration points between agents
   - Quality gates and checkpoints
3. Estimate effort and timeline

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
| Clarifications | \`.project-teams-spec/projects/[name]/clarifications.md\` |
| Execution plan | \`.project-teams-spec/projects/[name]/plan.md\` |
| Task list | \`.project-teams-spec/projects/[name]/tasks/*.md\` |

## Usage Examples

\`\`\`
/pts:plan-cycle                 # Run full planning cycle
/pts:plan-cycle --skip-claim    # Use pre-assigned tasks
/pts:plan-cycle --quick        # Minimal clarification phase
\`\`\`

## Next Steps

After plan validation:
- Run \`/pts:execution-cycle\` for implementation
- Or review plan.md before proceeding

## Success Criteria

- All tasks have assigned owners
- All clarifications are resolved
- Plan.md is user-approved
- Dependencies are clearly mapped
`,
  };
}

function getExecutionCycleCommand(): CommandContent {
  return {
    id: 'execution-cycle',
    name: 'execution-cycle',
    description: 'Execution cycle - task execution, QA verification, and delivery closure',
    category: 'Workflow',
    tags: ['execution', 'qa', 'delivery', 'verification', 'closure'],
    body: `# Execution Cycle

Execute the complete implementation workflow with continuous QA verification.

## Skills Chain

1. **pts-task-execute** - Execute assigned tasks with progress tracking
2. **pts-qa-verify** - Verify execution results against criteria
3. **pts-delivery-close** - Archive deliverables and close delivery

## Checkpoint Strategy

- After each task completion: Auto-trigger partial verification
- Before qa-verify: User confirmation required
- Before delivery-close: User confirmation required
- On QA failure: Loop back to task-execute for fixes

## Prerequisites

- plan-validate has passed user confirmation
- Execution plan (plan.md) is finalized
- All tasks have assigned owners
- Clarifications are resolved

## Execution Flow

### Phase 1: Task Execution (Milestone-Based Iterative Delivery)

**For large/complex projects, use milestone-based iterative delivery instead of executing all tasks at once.**

#### Step 1: Load Milestones from Plan

1. Load \`plan.md\` to identify milestones
2. Parse milestone definitions (each milestone contains a group of related tasks)
3. If no milestones defined, treat entire task set as single milestone

#### Step 2: Execute Tasks by Milestone

**For EACH milestone (in dependency order):**

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ MILESTONE: {milestone-name}                                 │
│ Tasks: {task-count} | Estimated: {duration}                │
│ Dependencies: {other-milestone-ids}                        │
└─────────────────────────────────────────────────────────────┘
\`\`\`

1. **Check milestone dependencies**
   - Verify all prerequisite milestones are completed
   - If not ready, skip to next eligible milestone

2. **Execute tasks in this milestone**
   For EACH task, you MUST call the Agent tool:

   \`\`\`typescript
   // 1. Load task details
   const taskDetail = await readFile(\`.project-teams-spec/projects/\<project\>/tasks/\<task-id\>.md\`);

   // 2. Load agent config
   const agentConfig = await readFile(\`.claude/agents/\<agent-name\>/agent.md\`);

   // 3. Load project context
   const projectContext = await readFile(\`.project-teams-spec/SPEC.md\`);

   // 4. Load rules
   const rules = await readFile(\`.claude/rules/coding-standards.md\`);

   // 5. Build prompt with milestone context
   const prompt = buildTaskPrompt(agentConfig, taskDetail, projectContext, rules);

   // 6. DISPATCH USING AGENT TOOL - THIS IS REQUIRED
   const result = await Agent({
     subagent_type: agentConfig.type || "general-purpose",
     prompt: prompt,
     description: "[Milestone: <milestone-name>] Execute task: <task-id>"
   });
   \`\`\`

3. **Track milestone progress**
   - Log completion status per task
   - Report to user: "Milestone X/Y completed"

#### Step 3: Milestone Checkpoint (REQUIRED)

**After completing each milestone:**

\`\`\`
╔═══════════════════════════════════════════════════════════════╗
║  MILESTONE CHECKPOINT                                        ║
║  ─────────────────────────────────────────────────────────── ║
║  Milestone: {name}                                           ║
║  Status: {completed|partial|failed}                        ║
║  Tasks completed: {n}/{total}                               ║
║  Artifacts: {list}                                          ║
║                                                               ║
║  Next:                                                       ║
║  [ ] Continue to next milestone                              ║
║  [ ] Review and verify artifacts                             ║
║  [ ] Request changes before proceeding                       ║
╚═══════════════════════════════════════════════════════════════╝
\`\`\`

**WAIT for user confirmation before proceeding to next milestone.**

4. **Handle integration points**
   - Coordinate cross-milestone tasks
   - Verify interface compatibility

### Phase 2: QA Verification (Per Milestone)

**For iterative delivery, verify each milestone after execution.**

1. **Milestone verification checklist**
   - Review artifacts produced by milestone
   - Execute acceptance criteria for each task
   - Generate verification report per milestone

2. **Run per-task verification**
   - Execute \`pts-qa-verify\` for each completed task
   - Check against task acceptance criteria
   - Log verification results

3. **Handle verification failures**
   - If QA fails: Return to task-execute for affected tasks
   - Document failure reasons
   - Plan corrective actions
   - **Re-verify after fixes before proceeding**

4. **Milestone sign-off**
   - All tasks in milestone pass QA
   - User approves milestone delivery
   - Mark milestone as "verified"

### Phase 3: Delivery Closure (Per Milestone)

**For iterative delivery, deliver each milestone separately.**

1. **Milestone delivery**
   - Generate milestone delivery summary
   - Archive artifacts to \`.project-teams-spec/deliveries/\<milestone-id\>/\`
   - Update project progress tracker

2. **Update project knowledge**
   - Write LESSONS_LEARNED.md for this milestone
   - Record successful patterns
   - Note any issues for future milestones

3. **Clean up (per milestone)**
   - Remove temporary files from milestone
   - Archive milestone work branches
   - Update milestone status

4. **Continue or Finalize**
   - If more milestones pending: return to Phase 1 for next milestone
   - If all milestones delivered: complete final closure

## Output

| Artifact | Location |
|----------|----------|
| Milestone results | \`.project-teams-spec/deliveries/\<milestone-id\>/results.json\` |
| Milestone QA report | \`.project-teams-spec/deliveries/\<milestone-id\>/qa-report.md\` |
| Milestone archive | \`.project-teams-spec/deliveries/\<milestone-id\>/\` |
| Overall delivery | \`.project-teams-spec/deliveries/final/\` |

## Hooks Configuration

| Event | Action |
|-------|--------|
| milestone-complete | Prompt user for confirmation before next milestone |
| task-execute complete | Auto-trigger qa-verify for task |
| qa-verify failure | Notify Master + user, return to execution |
| delivery-close start | Generate milestone summary |

## Usage Examples

\`\`\`
/pts:execution-cycle                    # Run milestone-based execution
/pts:execution-cycle --milestone m1    # Execute specific milestone only
/pts:execution-cycle --skip-milestone-checkpoint  # Auto-proceed (testing only)
/pts:execution-cycle --skip-qa         # Skip verification (for testing)
/pts:execution-cycle --parallel        # Enable parallel task execution
\`\`\`

## Success Criteria

- All milestones executed successfully
- QA verification passes for each milestone
- User approves each milestone delivery
- All milestones archived

## Error Handling

- **Task failure**: Return to execution for affected tasks in milestone
- **Milestone failure**: Pause and await user decision
- **QA failure**: Fix affected tasks, re-verify before proceeding
- **Integration failure**: Escalate to Master agent
`,
  };
}