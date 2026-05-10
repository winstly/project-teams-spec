/**
 * Command Generation Module
 *
 * Generic command generation system with tool-specific adapters.
 */

// Types
export type {
  CommandContent,
  ToolCommandAdapter,
  GeneratedCommand,
} from './types.js';

// Registry
export { CommandAdapterRegistry } from './registry.js';

// Generator functions
export { generateCommand, generateCommands } from './generator.js';

// Adapters
export { claudeAdapter, opencodeAdapter, traeAdapter } from './adapters/index.js';
