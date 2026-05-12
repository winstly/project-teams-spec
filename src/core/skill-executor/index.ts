/**
 * Skill Executor
 *
 * Executes skills according to their SKILL.md definitions.
 * Handles step orchestration, subagent dispatching, and result aggregation.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

export interface SkillContext {
  projectName: string;
  projectRoot: string;
  specDir: string;
  agentsDir: string;
  rulesDir: string;
}

export interface SkillInput {
  [key: string]: unknown;
}

export interface SkillStep {
  id: string;
  description: string;
  type: 'internal' | 'agent-subprocess' | 'human-action' | 'automated';
  delegate_to?: string;
  continue_on_error?: boolean;
  timeout?: string;
  notes?: string;
}

export interface SkillResult {
  stepId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  duration?: number;
}

export interface ExecutionResult {
  success: boolean;
  results: SkillResult[];
  artifacts: Map<string, unknown>;
  errors: string[];
  duration: number;
}

/**
 * Parse skill metadata from SKILL.md frontmatter
 */
function parseSkillMetadata(content: string): Record<string, unknown> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const result: Record<string, unknown> = {};
  const lines = frontmatterMatch[1].split('\n');
  let currentKey = '';
  let currentValue: string[] = [];

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):/);
    if (keyMatch) {
      if (currentKey) {
        result[currentKey] = currentValue.join('\n').trim();
      }
      currentKey = keyMatch[1];
      const value = line.match(/:\s*(.*)/)?.[1] || '';
      currentValue = value ? [value] : [];
    } else if (line.trim() && currentKey) {
      currentValue.push(line);
    }
  }

  if (currentKey) {
    result[currentKey] = currentValue.join('\n').trim();
  }

  return result;
}

/**
 * Parse steps from SKILL.md
 */
function parseSteps(content: string): SkillStep[] {
  const steps: SkillStep[] = [];
  const stepRegex = /^\s*-\s+id:\s*(\S+)\s*\n\s*description:\s*(.+?)(?=\n\s*-\s|\n(?:[^-\s])|$)/gm;

  let match;
  while ((match = stepRegex.exec(content)) !== null) {
    const step: SkillStep = {
      id: match[1],
      description: match[2].trim(),
      type: 'internal' // default
    };

    // Extract type if present
    const typeMatch = content.slice(match.index).match(/type:\s*(\S+)/);
    if (typeMatch) {
      step.type = typeMatch[1] as SkillStep['type'];
    }

    // Extract other optional fields
    const delegateMatch = content.slice(match.index).match(/delegate_to:\s*(\S+)/);
    if (delegateMatch) {
      step.delegate_to = delegateMatch[1];
    }

    const timeoutMatch = content.slice(match.index).match(/timeout:\s*(\S+)/);
    if (timeoutMatch) {
      step.timeout = timeoutMatch[1];
    }

    const notesMatch = content.slice(match.index).match(/notes:\s*\|?\s*\n([\s\S]*?)(?=\n\s*[\w-]+:)/);
    if (notesMatch) {
      step.notes = notesMatch[1].trim();
    }

    steps.push(step);
  }

  return steps;
}

/**
 * Extract INSTRUCTIONS section from SKILL.md
 */
function extractInstructions(content: string): string {
  const match = content.match(/# INSTRUCTIONS\n([\s\S]*?)(?=\n## |\n# |---)/);
  return match ? match[1] : '';
}

/**
 * Build agent prompt from skill instructions and context
 */
function buildAgentPrompt(
  instructions: string,
  step: SkillStep,
  context: SkillContext,
  inputs: SkillInput
): string {
  // Replace template variables
  let prompt = instructions;

  // Add step context
  prompt = `
## Current Step: ${step.id}

${step.description}

${step.notes ? `### Notes\n${step.notes}\n` : ''}

---

## Execution Context

- Project Name: ${context.projectName}
- Project Root: ${context.projectRoot}
- Spec Directory: ${context.specDir}

---

${prompt}
`;

  return prompt;
}

/**
 * Dispatch subagent for a step
 * This is a placeholder - actual implementation depends on the agent dispatching mechanism
 */
async function dispatchSubagent(
  prompt: string,
  agentType: string,
  context: SkillContext
): Promise<unknown> {
  // In a real implementation, this would use the Agent() tool
  // For now, return a mock result indicating the need for Agent tool integration
  console.log(`[SkillExecutor] Would dispatch subagent with type: ${agentType}`);
  console.log(`[SkillExecutor] Prompt preview: ${prompt.slice(0, 200)}...`);

  // The actual implementation would be:
  // return await Agent({
  //   subagent_type: agentType,
  //   prompt: prompt,
  //   description: `Execute skill step`
  // });

  return {
    dispatched: true,
    agentType,
    promptLength: prompt.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Execute a skill by its SKILL.md file
 */
export async function executeSkill(
  skillPath: string,
  context: SkillContext,
  inputs: SkillInput = {}
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const results: SkillResult[] = [];
  const artifacts = new Map<string, unknown>();
  const errors: string[] = [];

  console.log(`[SkillExecutor] Loading skill from: ${skillPath}`);

  // Read skill file
  if (!existsSync(skillPath)) {
    throw new Error(`Skill file not found: ${skillPath}`);
  }

  const content = await readFile(skillPath, 'utf-8');
  const metadata = parseSkillMetadata(content);
  const steps = parseSteps(content);
  const instructions = extractInstructions(content);

  console.log(`[SkillExecutor] Skill: ${metadata.name || 'unknown'}`);
  console.log(`[SkillExecutor] Steps: ${steps.map(s => s.id).join(', ')}`);

  // Execute each step
  for (const step of steps) {
    const stepStartTime = Date.now();

    console.log(`[SkillExecutor] Executing step: ${step.id} (type: ${step.type})`);

    try {
      let output: unknown;

      if (step.type === 'agent-subprocess') {
        // Dispatch to subagent
        const agentType = step.delegate_to || 'general-purpose';
        const prompt = buildAgentPrompt(instructions, step, context, inputs);
        output = await dispatchSubagent(prompt, agentType, context);
      } else if (step.type === 'internal' || step.type === 'automated') {
        // Execute internally (placeholder - would need step-specific logic)
        console.log(`[SkillExecutor] Internal step: ${step.id}`);

        // For internal steps, we'd execute the logic described in the step
        // This would require implementing each step's logic
        output = {
          stepId: step.id,
          executed: true,
          note: 'Internal step - logic not yet implemented'
        };
      } else if (step.type === 'human-action') {
        // Wait for human input (placeholder)
        output = {
          stepId: step.id,
          awaitingInput: true,
          note: 'Human action required'
        };
      }

      results.push({
        stepId: step.id,
        success: true,
        output,
        duration: Date.now() - stepStartTime
      });

      artifacts.set(step.id, output);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Step ${step.id}: ${errorMessage}`);

      results.push({
        stepId: step.id,
        success: false,
        error: errorMessage,
        duration: Date.now() - stepStartTime
      });

      // Continue on error if allowed
      const continueOnError = content.includes(`- id: ${step.id}`) &&
        content.includes('continue_on_error: true');

      if (!continueOnError) {
        console.log(`[SkillExecutor] Step failed, stopping execution`);
        break;
      }
    }
  }

  return {
    success: errors.length === 0,
    results,
    artifacts,
    errors,
    duration: Date.now() - startTime
  };
}

/**
 * Execute task execution skill (pts-task-execute)
 * This orchestrates multiple subagents for task execution
 */
export async function executeTaskExecution(
  context: SkillContext,
  tasks: Array<{
    taskId: string;
    agent: string;
    instruction: string;
    constraints?: string[];
    acceptanceCriteria?: string[];
  }>
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const results: SkillResult[] = [];
  const errors: string[] = [];

  console.log(`[TaskExecution] Starting execution of ${tasks.length} tasks`);

  // Load agent configs and execute each task
  for (const task of tasks) {
    console.log(`[TaskExecution] Dispatching task: ${task.taskId} to ${task.agent}`);

    try {
      // In a full implementation:
      // 1. Load agent config from agentsDir
      // 2. Load project context
      // 3. Load rules context
      // 4. Build prompt
      // 5. Dispatch subagent

      const agentConfigPath = join(context.agentsDir, task.agent, 'agent.md');

      if (!existsSync(agentConfigPath)) {
        throw new Error(`Agent config not found: ${agentConfigPath}`);
      }

      const agentConfig = await readFile(agentConfigPath, 'utf-8');

      // Dispatch to subagent
      const prompt = `
# Agent Task Assignment

## Task ID
${task.taskId}

## Agent Type
${task.agent}

## Instructions
${task.instruction}

## Constraints
${task.constraints?.map(c => `- ${c}`).join('\n') || 'None'}

## Acceptance Criteria
${task.acceptanceCriteria?.map(c => `- ${c}`).join('\n') || 'None'}

## Project Context
- Project Root: ${context.projectRoot}
- Spec Directory: ${context.specDir}

---

Please execute this task following the agent's defined behavior.
`;

      // In real implementation, this would call the Agent() tool
      // For now, log what would happen
      console.log(`[TaskExecution] Would dispatch to subagent with prompt:`);
      console.log(prompt.slice(0, 500) + '...');

      results.push({
        stepId: task.taskId,
        success: true,
        output: {
          dispatched: true,
          agent: task.agent,
          taskId: task.taskId
        },
        duration: 0
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Task ${task.taskId}: ${errorMessage}`);

      results.push({
        stepId: task.taskId,
        success: false,
        error: errorMessage
      });
    }
  }

  return {
    success: errors.length === 0,
    results,
    artifacts: new Map(),
    errors,
    duration: Date.now() - startTime
  };
}

/**
 * Execute a chain of skills
 */
export async function executeSkillChain(
  skillPaths: string[],
  context: SkillContext,
  initialInputs: SkillInput = {}
): Promise<ExecutionResult[]> {
  const allResults: ExecutionResult[] = [];
  let currentInputs = initialInputs;

  for (const skillPath of skillPaths) {
    console.log(`[SkillChain] Executing skill: ${skillPath}`);

    const result = await executeSkill(skillPath, context, currentInputs);
    allResults.push(result);

    // Pass outputs from previous skill as inputs to next
    // This would need to map output names to input names based on skill definitions
    if (!result.success) {
      console.log(`[SkillChain] Skill failed, stopping chain`);
      break;
    }

    // Update inputs for next skill
    currentInputs = {
      ...currentInputs,
      ...Object.fromEntries(result.artifacts)
    };
  }

  return allResults;
}

export default {
  executeSkill,
  executeTaskExecution,
  executeSkillChain
};
