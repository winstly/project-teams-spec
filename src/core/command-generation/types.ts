/**
 * Command Generation Types
 *
 * Tool-agnostic interfaces for command generation.
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
