/**
 * Command Adapter Registry
 *
 * Registry for tool-specific command adapters.
 */

import type { ToolCommandAdapter } from './types.js';

const adapters = new Map<string, ToolCommandAdapter>();

export const CommandAdapterRegistry = {
  register(adapter: ToolCommandAdapter): void {
    adapters.set(adapter.toolId, adapter);
  },

  get(toolId: string): ToolCommandAdapter | undefined {
    return adapters.get(toolId);
  },

  has(toolId: string): boolean {
    return adapters.has(toolId);
  },

  getAll(): ToolCommandAdapter[] {
    return Array.from(adapters.values());
  },
};
