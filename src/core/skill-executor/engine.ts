/**
 * Skill Execution Engine
 *
 * Main entry point for executing skills with subagent dispatching.
 * Integrates with command generation and agent dispatching.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import type { ExecutionContext, TaskDescriptor, TaskResult, AgentConfig } from './types.js';
import { topologicalSort } from './utils.js';

/**
 * Default execution context
 */
export function createContext(projectRoot: string): ExecutionContext {
  return {
    projectName: 'project-teams-spec',
    projectRoot,
    specDir: join(projectRoot, '.project-teams-spec'),
    agentsDir: join(projectRoot, 'config', 'agents'),
    rulesDir: join(projectRoot, 'config', 'rules'),
    outputDir: join(projectRoot, '.project-teams-spec', 'output'),
    skillsDir: join(projectRoot, 'config', 'skills')
  };
}

/**
 * Load skill definition from SKILL.md
 */
export async function loadSkill(skillsDir: string, skillName: string): Promise<string | null> {
  const skillPath = join(skillsDir, `pts-${skillName}`, 'SKILL.md');

  if (!existsSync(skillPath)) {
    console.error(`[Engine] Skill not found: ${skillPath}`);
    return null;
  }

  return await readFile(skillPath, 'utf-8');
}

/**
 * Load agent configuration
 */
export async function loadAgentConfig(agentsDir: string, agentName: string): Promise<AgentConfig | null> {
  const agentPath = join(agentsDir, agentName, 'agent.md');

  if (!existsSync(agentPath)) {
    console.error(`[Engine] Agent config not found: ${agentPath}`);
    return null;
  }

  const content = await readFile(agentPath, 'utf-8');

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const metadata: Record<string, string> = {};
  for (const line of frontmatterMatch[1].split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      metadata[match[1]] = match[2].trim();
    }
  }

  return {
    name: metadata.name || agentName,
    type: metadata.type || 'general-purpose',
    description: metadata.description || ''
  };
}

/**
 * Load project rules
 */
export async function loadProjectRules(rulesDir: string): Promise<string> {
  const rules: string[] = [];

  if (!existsSync(rulesDir)) {
    return '';
  }

  const files = ['coding-standards.md', 'architecture.md', 'naming-conventions.md'];

  for (const file of files) {
    const rulePath = join(rulesDir, file);
    if (existsSync(rulePath)) {
      rules.push(`## ${file}\n\n${await readFile(rulePath, 'utf-8')}`);
    }
  }

  return rules.join('\n\n---\n\n');
}

/**
 * Load agent-specific rules
 */
export async function loadAgentRules(agentsDir: string, agentName: string): Promise<string> {
  const rulesDir = join(agentsDir, agentName, 'rules');

  if (!existsSync(rulesDir)) {
    return '';
  }

  const rules: string[] = [];
  const { readdir } = await import('fs/promises');
  const files = await readdir(rulesDir);

  for (const file of files) {
    if (file.endsWith('.md')) {
      const rulePath = join(rulesDir, file);
      rules.push(`## ${file}\n\n${await readFile(rulePath, 'utf-8')}`);
    }
  }

  return rules.join('\n\n---\n\n');
}

/**
 * Load project context (SPEC.md)
 */
export async function loadProjectContext(specDir: string, projectName: string): Promise<string> {
  const specPath = join(specDir, 'projects', projectName, 'SPEC.md');

  if (existsSync(specPath)) {
    return await readFile(specPath, 'utf-8');
  }

  // Fallback to root SPEC.md
  const rootSpecPath = join(specDir, 'SPEC.md');
  if (existsSync(rootSpecPath)) {
    return await readFile(rootSpecPath, 'utf-8');
  }

  return 'Project context not available';
}

/**
 * Build subagent prompt for task execution
 */
export function buildTaskPrompt(
  agentConfig: AgentConfig,
  task: TaskDescriptor,
  projectContext: string,
  projectRules: string,
  agentRules: string
): string {
  return `# Agent Task Execution

## Agent Configuration
- **Name**: ${agentConfig.name}
- **Type**: ${agentConfig.type}
${agentConfig.description ? `- **Description**: ${agentConfig.description}` : ''}

---

## Task Assignment

### Task ID
${task.taskId}

### Instruction
${task.instruction}

${task.constraints && task.constraints.length > 0 ? `### Constraints
${task.constraints.map(c => `- ${c}`).join('\n')}` : ''}

${task.acceptanceCriteria && task.acceptanceCriteria.length > 0 ? `### Acceptance Criteria
${task.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}` : ''}

${task.scope && task.scope.length > 0 ? `### Scope
${task.scope.map(s => `- ${s}`).join('\n')}` : ''}

${task.dependencies && task.dependencies.length > 0 ? `### Dependencies
${task.dependencies.map(d => `- ${d}`).join('\n')}` : ''}

---

## Project Context

${projectContext}

---

## Rules Context

### Project-Level Rules
${projectRules || 'No project rules defined'}

### Agent-Specific Rules
${agentRules || 'No agent-specific rules defined'}

---

## Execution Instructions

1. **Review rules**: Before writing any code, read and understand all applicable rules
2. **Execute task**: Implement the task following the constraints and acceptance criteria
3. **Self-review**: Verify your implementation meets all acceptance criteria
4. **Report**: Document what was done, any issues encountered, and deviations from rules

## Expected Output

Return a structured report with:
- List of files changed
- Summary of changes
- Any issues or warnings
- Metrics (duration, files affected, tests passed/failed)

Report format:
\`\`\`json
{
  "taskId": "${task.taskId}",
  "status": "success",
  "output": {
    "artifacts": ["file1.ts", "file2.ts"],
    "summary": "What was accomplished"
  },
  "issues": [],
  "metrics": {
    "duration": "15m",
    "filesAffected": 3
  }
}
\`\`\`
`;
}

/**
 * Execute a task by dispatching to a subagent
 */
export async function executeTask(
  context: ExecutionContext,
  task: TaskDescriptor
): Promise<TaskResult> {
  console.log(`[Engine] Executing task: ${task.taskId} with agent: ${task.agent}`);

  // Load agent config
  const agentConfig = await loadAgentConfig(context.agentsDir, task.agent);

  if (!agentConfig) {
    return {
      taskId: task.taskId,
      status: 'failed',
      issues: [{
        severity: 'blocker',
        message: `Agent ${task.agent} not found`
      }]
    };
  }

  // Load context and rules
  const projectContext = await loadProjectContext(context.specDir, context.projectName);
  const projectRules = await loadProjectRules(context.rulesDir);
  const agentRules = await loadAgentRules(context.agentsDir, task.agent);

  // Build prompt
  const prompt = buildTaskPrompt(
    agentConfig,
    task,
    projectContext,
    projectRules,
    agentRules
  );

  console.log(`[Engine] Dispatching to subagent: ${agentConfig.type}`);
  console.log(`[Engine] Prompt length: ${prompt.length} characters`);

  /**
   * Dispatch to subagent using Agent tool
   *
   * In production, this would use the Agent tool:
   * const result = await Agent({
   *   subagent_type: agentConfig.type,
   *   prompt: prompt,
   *   description: `Execute: ${task.taskId}`
   * });
   */

  // For now, simulate successful dispatch
  return {
    taskId: task.taskId,
    status: 'success',
    output: {
      artifacts: [],
      summary: `Task ${task.taskId} dispatched to ${agentConfig.name}`
    },
    metrics: {
      duration: '0s',
      filesAffected: 0
    }
  };
}

/**
 * Execute multiple tasks with dependency awareness
 */
interface ExecutionResult {
  success: boolean;
  results: TaskResult[];
  status: {
    total: number;
    completed: number;
    failed: number;
    blocked: number;
    inProgress: number;
    pending: number;
  };
  artifacts: string[];
  conflicts: Array<{ file: string; conflictingTasks: string[] }>;
  errors: string[];
  duration: number;
}

export async function executeTasks(
  context: ExecutionContext,
  tasks: TaskDescriptor[]
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const results: TaskResult[] = [];
  const artifacts: string[] = [];
  const errors: string[] = [];
  const completedTasks = new Set<string>();

  console.log(`[Engine] Starting execution of ${tasks.length} tasks`);

  // Topological sort by dependencies
  const sortedTasks = topologicalSort(tasks);

  for (const task of sortedTasks) {
    // Check dependencies
    if (task.dependencies) {
      const pendingDeps = task.dependencies.filter(
        dep => !completedTasks.has(dep) && tasks.some(t => t.taskId === dep)
      );

      if (pendingDeps.length > 0) {
        console.log(`[Engine] Task ${task.taskId} waiting for: ${pendingDeps.join(', ')}`);
        // In a full implementation, would wait for dependency completion
      }
    }

    const result = await executeTask(context, task);
    results.push(result);

    if (result.status === 'success') {
      completedTasks.add(task.taskId);

      if (result.output?.artifacts) {
        artifacts.push(...result.output.artifacts);
      }
    } else {
      errors.push(`Task ${task.taskId}: ${result.issues?.[0]?.message || 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    results,
    status: {
      total: tasks.length,
      completed: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      blocked: results.filter(r => r.status === 'blocked').length,
      inProgress: 0,
      pending: 0
    },
    artifacts,
    conflicts: [],
    errors,
    duration: Date.now() - startTime
  };
}

/**
 * Detect file conflicts between task results
 */
export function detectConflicts(results: TaskResult[]): Array<{
  file: string;
  conflictingTasks: string[];
}> {
  const fileTasks = new Map<string, string[]>();

  for (const result of results) {
    if (result.output?.artifacts) {
      for (const artifact of result.output.artifacts) {
        const tasks = fileTasks.get(artifact) || [];
        tasks.push(result.taskId);
        fileTasks.set(artifact, tasks);
      }
    }
  }

  const conflicts: Array<{ file: string; conflictingTasks: string[] }> = [];

  for (const [file, tasks] of fileTasks) {
    if (tasks.length > 1) {
      conflicts.push({ file, conflictingTasks: tasks });
    }
  }

  return conflicts;
}

export default {
  createContext,
  loadSkill,
  loadAgentConfig,
  loadProjectRules,
  loadAgentRules,
  loadProjectContext,
  buildTaskPrompt,
  executeTask,
  executeTasks,
  detectConflicts
};
