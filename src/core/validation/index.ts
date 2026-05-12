/**
 * Validation Module
 *
 * Central export for all validation utilities.
 */

export { validateSkillContent, validateInstructionsFormat, validateOutputPaths } from './skill-validator.js';
export type {
  SkillMetadata,
  SkillPrecondition,
  SkillInput,
  SkillOutput,
  SkillStep,
  SkillValidationResult,
  ValidationError,
  ValidationWarning
} from './skill-validator.js';

export { validateAgentContent, validateAgentDirectory } from './agent-validator.js';
export type {
  AgentMetadata,
  AgentRole,
  AgentMission,
  AgentRules,
  AgentConfig,
  AgentValidationResult
} from './agent-validator.js';

export { validateCommandContent } from './command-validator.js';
export type {
  CommandMetadata,
  CommandSkillChain,
  CommandCheckpoint,
  CommandBranch,
  CommandValidationResult
} from './command-validator.js';

// Validation utility functions

import { validateSkillContent, validateAgentContent, validateCommandContent } from './index.js';
import { readFileSync, readdirSync, statSync, type PathLike } from 'fs';
import { join, extname, relative } from 'path';

export interface ValidationReport {
  timestamp: string;
  basePath: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  files: FileValidationResult[];
}

export interface FileValidationResult {
  path: string;
  type: 'skill' | 'agent' | 'command';
  result: {
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string; suggestion?: string }>;
  };
}

/**
 * Validates all project files recursively.
 *
 * @param basePath - Base directory to scan
 * @param options - Validation options
 * @returns Complete validation report
 */
export function validateProject(
  basePath: PathLike,
  options: {
    skipPatterns?: string[];
    includeTypes?: ('skill' | 'agent' | 'command')[];
  } = {}
): ValidationReport {
  const { skipPatterns = [], includeTypes = ['skill', 'agent', 'command'] } = options;
  const results: FileValidationResult[] = [];

  // Define file patterns
  const patterns = {
    skill: '**/SKILL.md',
    agent: '**/agent.md',
    command: '**/config/commands/*.md'
  };

  // Collect files to validate
  const filesToValidate: Array<{ path: string; type: 'skill' | 'agent' | 'command' }> = [];

  for (const [type, pattern] of Object.entries(patterns)) {
    if (!includeTypes.includes(type as 'skill' | 'agent' | 'command')) continue;

    try {
      const fullPattern = join(String(basePath), pattern);
      const matches = globSync(fullPattern);

      for (const file of matches) {
        // Check skip patterns
        const relativePath = relative(String(basePath), file);
        if (skipPatterns.some(p => relativePath.match(new RegExp(p)))) {
          continue;
        }

        filesToValidate.push({ path: file, type: type as 'skill' | 'agent' | 'command' });
      }
    } catch {
      // Ignore errors for patterns that don't match
    }
  }

  // Validate each file
  for (const { path, type } of filesToValidate) {
    try {
      const content = readFileSync(path, 'utf-8');
      let result;

      switch (type) {
        case 'skill':
          result = validateSkillContent(content, path);
          break;
        case 'agent':
          result = validateAgentContent(content, path);
          break;
        case 'command':
          result = validateCommandContent(content, path);
          break;
      }

      results.push({ path, type, result });
    } catch (error) {
      results.push({
        path,
        type,
        result: {
          valid: false,
          errors: [{ field: 'file', message: `Failed to read file: ${error}` }],
          warnings: []
        }
      });
    }
  }

  // Generate summary
  const summary = {
    total: results.length,
    passed: results.filter(r => r.result.valid).length,
    failed: results.filter(r => !r.result.valid).length,
    warnings: results.reduce((acc, r) => acc + r.result.warnings.length, 0)
  };

  return {
    timestamp: new Date().toISOString(),
    basePath: String(basePath),
    summary,
    files: results
  };
}

/**
 * Validates a single file by path.
 *
 * @param filePath - Path to the file
 * @returns Validation result
 */
export function validateFile(filePath: PathLike): FileValidationResult {
  const path = String(filePath);
  const ext = extname(path).toLowerCase();
  const fileName = path.split(/[/\\]/).pop() || '';

  let type: 'skill' | 'agent' | 'command' | null = null;

  if (fileName === 'SKILL.md') {
    type = 'skill';
  } else if (fileName === 'agent.md') {
    type = 'agent';
  } else if (path.includes('/commands/') && ext === '.md') {
    type = 'command';
  }

  if (!type) {
    return {
      path,
      type: 'skill', // default
      result: {
        valid: false,
        errors: [{ field: 'file_type', message: 'Unknown file type for validation' }],
        warnings: []
      }
    };
  }

  try {
    const content = readFileSync(path, 'utf-8');
    let result;

    switch (type) {
      case 'skill':
        result = validateSkillContent(content, path);
        break;
      case 'agent':
        result = validateAgentContent(content, path);
        break;
      case 'command':
        result = validateCommandContent(content, path);
        break;
    }

    return { path, type, result };
  } catch (error) {
    return {
      path,
      type,
      result: {
        valid: false,
        errors: [{ field: 'file', message: `Failed to read file: ${error}` }],
        warnings: []
      }
    };
  }
}

// Simple glob implementation for Node.js
function globSync(pattern: string): string[] {
  const results: string[] = [];
  const { dirname, basename } = getPathParts(pattern);

  try {
    const dir = dirname === '.' ? process.cwd() : dirname;
    const regex = patternToRegex(basename);

    const files = readdirSync(dir);
    for (const file of files) {
      if (regex.test(file)) {
        results.push(join(dir, file));
      }
    }
  } catch {
    // Ignore errors
  }

  return results;
}

function getPathParts(pattern: string) {
  const parts = pattern.split(/[/\\]/);
  const fileName = parts.pop() || '';
  const dir = parts.join('/') || '.';
  return { dirname: dir, basename: fileName };
}

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '{{GLOB}}')
    .replace(/\*/g, '[^/\\\\]*')
    .replace(/\{\{GLOB\}\}/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

export default {
  validateProject,
  validateFile,
  validateSkillContent,
  validateAgentContent,
  validateCommandContent
};