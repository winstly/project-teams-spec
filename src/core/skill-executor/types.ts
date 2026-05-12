/**
 * Skill Executor Types
 *
 * Type definitions for skill execution system.
 */

export interface SkillMetadata {
  name: string;
  version: string;
  description?: string;
  granularity?: 'protocol' | 'procedural' | 'intent' | 'conversational';
  type?: 'agent-subprocess' | 'internal' | 'human-action' | 'automated';
  phase?: string | number;
  triggers?: string[];
  tags?: string[];
}

export interface SkillInput {
  name: string;
  type: 'data' | 'data[]' | 'file' | 'reference' | 'env';
  description?: string;
  path?: string;
  required?: boolean;
}

export interface SkillOutput {
  name: string;
  type: 'data' | 'data[]' | 'file' | 'reference';
  description?: string;
  format?: string;
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

export interface SkillCheckpoint {
  required: boolean;
  message?: string;
}

export interface SkillHook {
  trigger: string;
  action: string;
  next_skill?: string;
  target?: string;
  message?: string;
  fallback?: string;
}

export interface SkillDefinition {
  metadata: SkillMetadata;
  preconditions?: string[];
  input: SkillInput[];
  output: SkillOutput[];
  steps: SkillStep[];
  checkpoint?: SkillCheckpoint;
  hooks?: SkillHook[];
  instructions?: string;
}

export interface ExecutionContext {
  projectName: string;
  projectRoot: string;
  specDir: string;
  agentsDir: string;
  rulesDir: string;
  outputDir: string;
  skillsDir: string;
}

export interface TaskDescriptor {
  taskId: string;
  agent: string;
  agentConfig?: string;
  type?: string;
  instruction: string;
  constraints?: string[];
  acceptanceCriteria?: string[];
  dependencies?: string[];
  scope?: string[];
  expectedOutput?: string;
  deadline?: string;
  context?: Record<string, unknown>;
  /** Milestone identifier for incremental delivery. Tasks in the same milestone can be delivered together. */
  milestone?: string;
  /** Priority within milestone (lower = higher priority). Default: 0 */
  priority?: number;
}

export interface TaskResult {
  taskId: string;
  status: 'success' | 'failed' | 'blocked' | 'pending';
  output?: {
    artifacts?: string[];
    summary?: string;
    changes?: Array<{
      path: string;
      diff?: string;
      linesAdded?: number;
      linesRemoved?: number;
    }>;
  };
  issues?: Array<{
    severity: 'blocker' | 'warning' | 'info';
    message: string;
    affected_files?: string[];
  }>;
  metrics?: {
    duration?: string;
    filesAffected?: number;
    testsPassed?: number;
    testsFailed?: number;
  };
}

export interface ExecutionStatus {
  total: number;
  completed: number;
  failed: number;
  blocked: number;
  inProgress: number;
  pending: number;
}

/**
 * Milestone for incremental delivery
 */
export interface Milestone {
  id: string;
  name: string;
  description: string;
  tasks: string[];  // Task IDs in this milestone
  status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'delivered';
  dependencies?: string[];  // Other milestone IDs this depends on
  estimatedDuration?: string;
  artifacts?: string[];
}

/**
 * Milestone execution result
 */
export interface MilestoneResult {
  milestoneId: string;
  status: 'success' | 'failed' | 'partial';
  completedTasks: string[];
  failedTasks: string[];
  artifacts: string[];
  issues: Array<{
    severity: 'blocker' | 'warning' | 'info';
    message: string;
    taskId?: string;
  }>;
  duration: string;
}

export interface FileConflict {
  file: string;
  conflictingTasks: string[];
  resolution?: 'auto-merge' | 'manual' | 'wait';
}

export interface AgentConfig {
  name: string;
  type: string;
  description: string;
  model_hint?: string;
  color?: string;
  emoji?: string;
  vibe?: string;
  triggers?: string[];
  collaboration_patterns?: Record<string, {
    description: string;
    handoff_format?: string;
    communication?: 'sync' | 'async';
  }>;
}

export interface RulesContext {
  projectRules: string;
  agentRules: string;
  whitelistedRules: string;
  rulesSummary: string;
}

export interface ExecutionResult {
  success: boolean;
  results: TaskResult[];
  status: ExecutionStatus;
  artifacts: string[];
  conflicts: FileConflict[];
  errors: string[];
  duration: number;
}

export type StepResult = {
  stepId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  duration?: number;
};

export type SkillExecutionResult = {
  success: boolean;
  results: StepResult[];
  artifacts: Map<string, unknown>;
  errors: string[];
  duration: number;
};
