/**
 * Command Generation Types
 *
 * Tool-agnostic interfaces for command generation.
 * Enhanced with filtering, options, and metadata support.
 */

/**
 * Tool-agnostic command data.
 */
export interface CommandContent {
  /** Command identifier (e.g., 'full-analysis', 'plan-cycle') */
  id: string;
  /** Human-readable name */
  name: string;
  /** Brief description */
  description: string;
  /** Grouping category */
  category: string;
  /** Array of tag strings */
  tags: string[];
  /** The command instruction content (body text) */
  body: string;
}

/**
 * Per-tool formatting strategy.
 */
export interface ToolCommandAdapter {
  /** Tool identifier */
  toolId: string;
  /**
   * Returns the file path for a command.
   * @param commandId - The command identifier
   * @returns Path from project root
   */
  getFilePath(commandId: string): string;
  /**
   * Formats the complete file content including frontmatter.
   * @param content - The tool-agnostic command content
   * @returns Complete file content ready to write
   */
  formatFile(content: CommandContent): string;
}

/**
 * Result of generating a command file.
 */
export interface GeneratedCommand {
  /** File path from project root */
  path: string;
  /** Complete file content */
  fileContent: string;
}

/**
 * Filter criteria for command selection.
 */
export interface CommandFilter {
  /** Filter by specific command IDs */
  ids?: string[];
  /** Filter by categories */
  categories?: string[];
  /** Filter by tags (must match ALL) */
  tags?: string[];
  /** Filter by name pattern (regex) */
  namePattern?: string;
}

/**
 * Generator options for advanced command generation.
 */
export interface GeneratorOptions {
  /** Filter commands before generation */
  filter?: CommandFilter;
  /** Include only specific categories */
  categories?: string[];
  /** Include only commands with these tags */
  tags?: string[];
  /** Search query (matches name, description, body) */
  query?: string;
  /** Sort results by field */
  sortBy?: 'name' | 'category' | 'id';
  /** Limit number of results */
  limit?: number;
}

/**
 * Command metadata for display and reporting.
 */
export interface CommandMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  /** Estimated complexity (1-5) */
  complexity?: number;
  /** Estimated time in minutes */
  estimatedTime?: number;
}

/**
 * Batch generation result with summary.
 */
export interface BatchResult {
  /** All generated commands */
  commands: GeneratedCommand[];
  /** Total count */
  total: number;
  /** Successfully generated count */
  succeeded: number;
  /** Failed count */
  failed: number;
  /** Generation errors */
  errors: string[];
  /** Generation time in ms */
  duration: number;
}

/**
 * Adapter registration options.
 */
export interface AdapterOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Custom file path resolver */
  pathResolver?: (commandId: string, toolId: string) => string;
  /** Custom formatter */
  formatter?: (content: CommandContent) => string;
}

/**
 * Adapter compatibility check result.
 */
export interface CompatibilityResult {
  compatible: boolean;
  version?: string;
  missingFeatures?: string[];
  warnings?: string[];
}