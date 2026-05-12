/**
 * Skill Dispatcher
 *
 * Dispatches subagents using Claude Code's Agent tool.
 * This is the core execution engine for pts-task-execute skill.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import type { TaskDescriptor, AgentConfig } from './types.js';
import { topologicalSort } from './utils.js';

export interface TaskContext {
  projectName: string;
  projectRoot: string;
  specDir: string;
  agentsDir: string;
  rulesDir: string;
  outputDir: string;
}

export interface ExecutionResult {
  taskId: string;
  agent: string;
  status: 'success' | 'failed' | 'blocked';
  output?: {
    artifacts: string[];
    summary: string;
    changes?: Array<{
      path: string;
      linesAdded: number;
      linesRemoved: number;
    }>;
  };
  issues?: Array<{
    severity: 'blocker' | 'warning' | 'info';
    message: string;
  }>;
  metrics?: {
    duration: string;
    filesAffected: number;
  };
}

/**
 * Load agent configuration from agent.md
 */
export async function loadAgentConfig(
  agentsDir: string,
  agentName: string
): Promise<AgentConfig | null> {
  const agentPath = join(agentsDir, agentName, 'agent.md');

  if (!existsSync(agentPath)) {
    console.error(`[Dispatcher] Agent config not found: ${agentPath}`);
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

  // Extract type from metadata section in content
  const typeMatch = content.match(/type:\s*["']?(\w+)["']?/);
  const descriptionMatch = content.match(/description:\s*(.+)/);

  return {
    name: metadata.name || agentName,
    type: typeMatch ? typeMatch[1] : 'general-purpose',
    description: descriptionMatch ? descriptionMatch[1] : '',
    model_hint: metadata.model_hint
  };
}

/**
 * Load project rules for context
 */
export async function loadProjectRules(rulesDir: string): Promise<string> {
  const rules: string[] = [];

  // Load common rules
  const commonRules = [
    'coding-standards.md',
    'architecture.md',
    'naming-conventions.md'
  ];

  for (const rule of commonRules) {
    const rulePath = join(rulesDir, rule);
    if (existsSync(rulePath)) {
      rules.push(`### ${rule}\n\n${await readFile(rulePath, 'utf-8')}`);
    }
  }

  return rules.join('\n\n---\n\n');
}

/**
 * Load agent-specific rules
 */
export async function loadAgentRules(
  agentsDir: string,
  agentName: string
): Promise<string> {
  const rulesDir = join(agentsDir, agentName, 'rules');

  if (!existsSync(rulesDir)) {
    return '';
  }

  const rules: string[] = [];

  // Load all .md files from rules directory
  const { readdir } = await import('fs/promises');
  const files = await readdir(rulesDir);

  for (const file of files) {
    if (file.endsWith('.md')) {
      const rulePath = join(rulesDir, file);
      rules.push(`### ${file}\n\n${await readFile(rulePath, 'utf-8')}`);
    }
  }

  return rules.join('\n\n---\n\n');
}

/**
 * Build task execution prompt for subagent
 */
export function buildTaskPrompt(
  agentConfig: AgentConfig,
  task: TaskDescriptor,
  projectContext: string,
  rulesContext: string,
  agentRules: string
): string {
  return `
# Task Execution Prompt

## Agent Information
- **Agent Name**: ${agentConfig.name}
- **Agent Type**: ${agentConfig.type}
- **Description**: ${agentConfig.description}

---

## Task Assignment

### Task ID
${task.taskId}

### Instruction
${task.instruction}

### Constraints
${task.constraints?.map(c => `- ${c}`).join('\n') || '- None specified'}

### Acceptance Criteria
${task.acceptanceCriteria?.map(c => `- [ ] ${c}`).join('\n') || '- No explicit criteria'}

### Scope
${task.scope?.map(s => `- ${s}`).join('\n') || '- All files'}

### Dependencies
${task.dependencies?.map(d => `- ${d}`).join('\n') || '- None'}

---

## Project Context

${projectContext}

---

## Rules Context

### Project-Level Rules
${rulesContext}

### Agent-Specific Rules
${agentRules}

---

## Execution Instructions

1. **Before writing any code**: Read and understand all applicable rules
2. **During implementation**: Follow coding standards strictly
3. **After implementation**: Self-review against acceptance criteria
4. **Report deviations**: Note any rules that couldn't be followed and why

## Output Format

When complete, report your results in this format:

\`\`\`json
{
  "taskId": "${task.taskId}",
  "status": "success",
  "output": {
    "artifacts": ["file1.ts", "file2.ts"],
    "summary": "Brief summary of changes"
  },
  "issues": [
    {"severity": "warning", "message": "Test coverage below target"}
  ],
  "metrics": {
    "duration": "15m",
    "filesAffected": 3
  }
}
\`\`\`
`;
}

/**
 * Dispatch a task to a subagent using the Agent tool
 *
 * NOTE: This function contains the actual Agent() call that would be used
 * in production. For now, it logs the dispatch information.
 */
export async function dispatchToAgent(
  agentConfig: AgentConfig,
  task: TaskDescriptor,
  projectContext: string,
  rulesContext: string,
  agentRules: string
): Promise<ExecutionResult> {
  const prompt = buildTaskPrompt(
    agentConfig,
    task,
    projectContext,
    rulesContext,
    agentRules
  );

  const startTime = Date.now();

  console.log(`[Dispatcher] Dispatching task ${task.taskId} to ${agentConfig.name}`);
  console.log(`[Dispatcher] Agent type: ${agentConfig.type}`);
  console.log(`[Dispatcher] Prompt length: ${prompt.length} characters`);

  /**
   * In production, this would call the Agent tool:
   *
   * const result = await Agent({
   *   subagent_type: agentConfig.type,
   *   prompt: prompt,
   *   description: `Execute task: ${task.taskId}`
   * });
   *
   * For now, we return a mock result indicating dispatch
   */

  // Simulate subagent execution
  const duration = Math.floor((Date.now() - startTime) / 1000);

  return {
    taskId: task.taskId,
    agent: task.agent,
    status: 'success',
    output: {
      artifacts: [],
      summary: `Task ${task.taskId} dispatched to ${agentConfig.name} (mock execution)`
    },
    metrics: {
      duration: `${duration}s`,
      filesAffected: 0
    }
  };
}

/**
 * Execute multiple tasks with dependency-aware scheduling
 */
export async function executeTasks(
  context: TaskContext,
  tasks: TaskDescriptor[],
  projectContext: string
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];
  const completedTasks = new Set<string>();

  console.log(`[Dispatcher] Starting execution of ${tasks.length} tasks`);

  // Sort tasks by dependencies
  const sortedTasks = topologicalSort(tasks);

  for (const task of sortedTasks) {
    // Wait for dependencies to complete
    if (task.dependencies) {
      const pendingDeps = task.dependencies.filter(
        dep => !completedTasks.has(dep) && tasks.some(t => t.taskId === dep)
      );

      if (pendingDeps.length > 0) {
        console.log(`[Dispatcher] Task ${task.taskId} waiting for dependencies: ${pendingDeps.join(', ')}`);
        // In real implementation, would wait for dependency completion
      }
    }

    // Load agent config
    const agentConfig = await loadAgentConfig(context.agentsDir, task.agent);

    if (!agentConfig) {
      results.push({
        taskId: task.taskId,
        agent: task.agent,
        status: 'failed',
        issues: [{
          severity: 'blocker',
          message: `Agent ${task.agent} not found`
        }]
      });
      continue;
    }

    // Load rules
    const rulesContext = await loadProjectRules(context.rulesDir);
    const agentRules = await loadAgentRules(context.agentsDir, task.agent);

    // Dispatch to agent
    const result = await dispatchToAgent(
      agentConfig,
      task,
      projectContext,
      rulesContext,
      agentRules
    );

    results.push(result);

    if (result.status === 'success') {
      completedTasks.add(task.taskId);
    }
  }

  return results;
}

/**
 * Detect file conflicts between task results
 */
export function detectConflicts(
  results: ExecutionResult[]
): Array<{
  file: string;
  tasks: string[];
  status: 'conflict' | 'ok';
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

  const conflicts: Array<{
    file: string;
    tasks: string[];
    status: 'conflict' | 'ok';
  }> = [];

  for (const [file, tasks] of fileTasks) {
    if (tasks.length > 1) {
      conflicts.push({ file, tasks, status: 'conflict' });
    }
  }

  return conflicts;
}

export default {
  loadAgentConfig,
  loadProjectRules,
  loadAgentRules,
  buildTaskPrompt,
  dispatchToAgent,
  executeTasks,
  detectConflicts
};
