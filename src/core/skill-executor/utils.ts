/**
 * Skill Executor Utilities
 *
 * Shared algorithmic utilities for skill execution modules.
 */

import type { TaskDescriptor } from './types.js';

/**
 * Topological sort of tasks by their dependency graph.
 * Tasks with unresolved dependencies are sorted after their dependencies.
 *
 * @param tasks - Array of task descriptors
 * @returns Tasks ordered such that dependencies appear before dependents
 */
export function topologicalSort(tasks: TaskDescriptor[]): TaskDescriptor[] {
  const taskMap = new Map(tasks.map(t => [t.taskId, t]));
  const visited = new Set<string>();
  const result: TaskDescriptor[] = [];

  function visit(taskId: string): void {
    if (visited.has(taskId)) return;

    const task = taskMap.get(taskId);
    if (!task) return;

    visited.add(taskId);

    if (task.dependencies) {
      for (const dep of task.dependencies) {
        visit(dep);
      }
    }

    result.push(task);
  }

  for (const task of tasks) {
    visit(task.taskId);
  }

  return result;
}
