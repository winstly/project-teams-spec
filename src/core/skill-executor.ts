/**
 * Skill Executor
 *
 * Core module for executing skills with subagent dispatching.
 * This module provides the infrastructure for skill execution.
 */

// Re-export types
export type {
  SkillMetadata,
  SkillInput,
  SkillOutput,
  SkillStep,
  SkillCheckpoint,
  SkillHook,
  SkillDefinition,
  ExecutionContext,
  TaskDescriptor,
  TaskResult,
  ExecutionStatus,
  FileConflict,
  AgentConfig,
  RulesContext,
  ExecutionResult as SkillExecutionResult,
  StepResult
} from './skill-executor/types.js';

// Re-export dispatcher functions
export {
  loadAgentConfig,
  loadProjectRules,
  loadAgentRules,
  buildTaskPrompt,
  dispatchToAgent,
  executeTasks as runTasks,
  detectConflicts
} from './skill-executor/dispatcher.js';

// Re-export engine functions
export {
  createContext,
  loadSkill,
  loadProjectContext,
  executeTask,
  executeTasks,
  detectConflicts as findConflicts
} from './skill-executor/engine.js';
