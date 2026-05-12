/**
 * Command Generator
 *
 * Functions for generating command files using tool adapters.
 * Enhanced with validation, filtering, and batch operations.
 */

import type {
  CommandContent,
  ToolCommandAdapter,
  GeneratedCommand,
  CommandFilter,
  GeneratorOptions,
} from './types.js';

/**
 * Generate a single command file using the provided adapter.
 */
export function generateCommand(
  content: CommandContent,
  adapter: ToolCommandAdapter
): GeneratedCommand {
  // Validate content before generation
  validateCommandContent(content);

  return {
    path: adapter.getFilePath(content.id),
    fileContent: adapter.formatFile(content),
  };
}

/**
 * Generate multiple command files using the provided adapter.
 */
export function generateCommands(
  contents: CommandContent[],
  adapter: ToolCommandAdapter
): GeneratedCommand[] {
  return contents
    .filter(content => validateCommandContent(content, false))
    .map(content => generateCommand(content, adapter));
}

/**
 * Generate commands with filtering and options.
 */
export function generateCommandsWithOptions(
  contents: CommandContent[],
  adapter: ToolCommandAdapter,
  options: GeneratorOptions
): GeneratedCommand[] {
  let filtered = contents;

  // Apply filters
  if (options.filter) {
    filtered = filterCommands(filtered, options.filter);
  }

  // Apply category filter
  if (options.categories && options.categories.length > 0) {
    filtered = filtered.filter(c => options.categories!.includes(c.category));
  }

  // Apply tag filter
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter(c =>
      options.tags!.some(tag => c.tags.includes(tag))
    );
  }

  // Apply search query
  if (options.query) {
    const query = options.query.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.body.toLowerCase().includes(query)
    );
  }

  // Sort if specified
  if (options.sortBy) {
    filtered = sortCommands(filtered, options.sortBy);
  }

  // Limit results
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered.map(content => generateCommand(content, adapter));
}

/**
 * Filter commands based on criteria.
 */
export function filterCommands(
  commands: CommandContent[],
  filter: CommandFilter
): CommandContent[] {
  return commands.filter(cmd => {
    // Filter by IDs
    if (filter.ids && filter.ids.length > 0) {
      if (!filter.ids.includes(cmd.id)) {
        return false;
      }
    }

    // Filter by category
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(cmd.category)) {
        return false;
      }
    }

    // Filter by tags (must have ALL specified tags)
    if (filter.tags && filter.tags.length > 0) {
      if (!filter.tags.every(tag => cmd.tags.includes(tag))) {
        return false;
      }
    }

    // Filter by name pattern
    if (filter.namePattern) {
      const regex = new RegExp(filter.namePattern, 'i');
      if (!regex.test(cmd.name)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort commands by specified field.
 */
export function sortCommands(
  commands: CommandContent[],
  sortBy: 'name' | 'category' | 'id'
): CommandContent[] {
  return [...commands].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'id':
        return a.id.localeCompare(b.id);
      default:
        return 0;
    }
  });
}

/**
 * Validate command content.
 */
export function validateCommandContent(
  content: CommandContent,
  throwOnError = true
): boolean {
  const errors: string[] = [];

  if (!content.id) {
    errors.push('Command ID is required');
  } else if (!/^[a-z0-9-]+$/.test(content.id)) {
    errors.push('Command ID must be lowercase alphanumeric with hyphens');
  }

  if (!content.name) {
    errors.push('Command name is required');
  }

  if (!content.description) {
    errors.push('Command description is required');
  }

  if (!content.category) {
    errors.push('Command category is required');
  }

  if (!content.tags || content.tags.length === 0) {
    errors.push('At least one tag is required');
  }

  if (!content.body) {
    errors.push('Command body is required');
  }

  if (errors.length > 0) {
    if (throwOnError) {
      throw new Error(`Invalid command content: ${errors.join(', ')}`);
    }
    return false;
  }

  return true;
}

/**
 * Get available categories from commands.
 */
export function getCategories(commands: CommandContent[]): string[] {
  const categories = new Set<string>();
  for (const cmd of commands) {
    categories.add(cmd.category);
  }
  return Array.from(categories).sort();
}

/**
 * Get all tags from commands.
 */
export function getAllTags(commands: CommandContent[]): string[] {
  const tags = new Set<string>();
  for (const cmd of commands) {
    for (const tag of cmd.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

/**
 * Group commands by category.
 */
export function groupByCategory(
  commands: CommandContent[]
): Map<string, CommandContent[]> {
  const groups = new Map<string, CommandContent[]>();

  for (const cmd of commands) {
    if (!groups.has(cmd.category)) {
      groups.set(cmd.category, []);
    }
    groups.get(cmd.category)!.push(cmd);
  }

  return groups;
}

/**
 * Preview command output without file writing.
 */
export function previewCommand(
  content: CommandContent,
  adapter: ToolCommandAdapter
): { path: string; content: string; metadata: CommandMetadata } {
  const generated = generateCommand(content, adapter);

  return {
    path: generated.path,
    content: generated.fileContent,
    metadata: {
      id: content.id,
      name: content.name,
      category: content.category,
      tags: content.tags,
      size: generated.fileContent.length,
      lines: generated.fileContent.split('\n').length,
    },
  };
}

interface CommandMetadata {
  id: string;
  name: string;
  category: string;
  tags: string[];
  size: number;
  lines: number;
}

/**
 * Batch generate with progress callback.
 */
export async function generateCommandsBatch(
  contents: CommandContent[],
  adapter: ToolCommandAdapter,
  onProgress?: (current: number, total: number, cmd: CommandContent) => void
): Promise<GeneratedCommand[]> {
  const results: GeneratedCommand[] = [];
  const total = contents.length;

  for (let i = 0; i < total; i++) {
    const content = contents[i];
    onProgress?.(i, total, content);

    try {
      const generated = generateCommand(content, adapter);
      results.push(generated);
    } catch (err) {
      console.warn(`Failed to generate command ${content.id}: ${err}`);
    }

    // Small delay to allow progress updates
    await new Promise(resolve => setImmediate(resolve));
  }

  onProgress?.(total, total, contents[contents.length - 1]);
  return results;
}