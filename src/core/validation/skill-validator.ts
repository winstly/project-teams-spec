/**
 * Skill Schema Validator
 *
 * Validates SKILL.md files for compliance with OpenSpec skill definition format.
 */

import { parseFrontmatter } from './utils.js';

export interface SkillMetadata {
  name: string;
  version: string;
  granularity?: string;
  type?: string;
  phase?: string;
}

export interface SkillPrecondition {
  preconditions?: string[];
}

export interface SkillInput {
  name: string;
  type: string;
  description?: string;
  path?: string;
}

export interface SkillOutput {
  name: string;
  type: string;
  description?: string;
}

export interface SkillStep {
  id: string;
  description: string;
  type: string;
  delegate_to?: string;
}

export interface SkillValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  line?: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Required frontmatter fields for SKILL.md
 */
const REQUIRED_METADATA_FIELDS = ['name', 'version'];
const REQUIRED_SECTIONS = ['Metadata', 'Steps'];
const VALID_TYPES = ['agent-subprocess', 'internal', 'human-action', 'automated'];
const VALID_INPUT_TYPES = ['data', 'file', 'reference', 'env'];
const VALID_OUTPUT_TYPES = ['data', 'file', 'reference'];

/**
 * Validates a skill definition file content.
 *
 * @param content - Raw content of a SKILL.md file
 * @param filePath - Optional file path for error reporting
 * @returns Validation result with errors and warnings
 */
export function validateSkillContent(content: string, filePath?: string): SkillValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push({ field: 'frontmatter', message: 'Missing frontmatter section (---...---)' });
    return { valid: false, errors, warnings };
  }

  const frontmatter = parseFrontmatter(frontmatterMatch[1]);

  // Validate Metadata section
  if (!frontmatter.Metadata) {
    errors.push({ field: 'Metadata', message: 'Missing Metadata section' });
  } else {
    const metadataErrors = validateMetadata(frontmatter.Metadata);
    errors.push(...metadataErrors.map(e => ({ ...e, field: `Metadata.${e.field}` })));
  }

  // Validate Steps section
  if (!frontmatter.Steps) {
    errors.push({ field: 'Steps', message: 'Missing Steps section' });
  } else {
    const stepsErrors = validateSteps(frontmatter.Steps as string | unknown[]);
    errors.push(...stepsErrors.map(e => ({ ...e, field: `Steps.${e.field}` })));
  }

  // Validate Preconditions section (optional but recommended)
  if (frontmatter.Preconditions) {
    const preconditionWarnings = validatePreconditions(frontmatter.Preconditions);
    warnings.push(...preconditionWarnings.map(w => ({ ...w, field: `Preconditions.${w.field}` })));
  } else {
    warnings.push({
      field: 'Preconditions',
      message: 'Preconditions section is missing',
      suggestion: 'Add Preconditions to document when this skill should be invoked'
    });
  }

  // Validate Input section (optional)
  if (frontmatter.Input) {
    const inputWarnings = validateInput(frontmatter.Input);
    warnings.push(...inputWarnings.map(w => ({ ...w, field: `Input.${w.field}` })));
  }

  // Validate Output section (optional)
  if (frontmatter.Output) {
    const outputWarnings = validateOutput(frontmatter.Output);
    warnings.push(...outputWarnings.map(w => ({ ...w, field: `Output.${w.field}` })));
  }

  // Validate INSTRUCTIONS section exists
  if (!content.includes('# INSTRUCTIONS')) {
    warnings.push({
      field: 'INSTRUCTIONS',
      message: 'INSTRUCTIONS section is missing or empty',
      suggestion: 'Add detailed instructions for execution'
    });
  }

  // Validate Checkpoint section (optional but recommended)
  if (!frontmatter.Checkpoint && !frontmatter.checkpoint) {
    warnings.push({
      field: 'checkpoint',
      message: 'Checkpoint configuration is missing',
      suggestion: 'Add checkpoint for user interaction points'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates INSTRUCTIONS section format.
 *
 * @param content - The full content or INSTRUCTIONS section content
 * @returns Validation warnings
 */
export function validateInstructionsFormat(content: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  const instructionsMatch = content.match(/# INSTRUCTIONS\n([\s\S]*?)(?=\n## |\n# |---|\n*$)/);
  if (!instructionsMatch) {
    return warnings;
  }

  const instructions = instructionsMatch[1];

  // Check for common format issues
  if (!instructions.includes('###') && !instructions.includes('##')) {
    warnings.push({
      field: 'INSTRUCTIONS.format',
      message: 'INSTRUCTIONS appear to lack structured sections (### headers)',
      suggestion: 'Use ### headers to organize instructions (e.g., ### Setup, ### Execution)'
    });
  }

  // Check for code blocks (good practice)
  if (!instructions.includes('```') && !instructions.includes('`')) {
    warnings.push({
      field: 'INSTRUCTIONS.examples',
      message: 'INSTRUCTIONS lack code examples',
      suggestion: 'Add code examples or command templates in fenced code blocks'
    });
  }

  return warnings;
}

/**
 * Validates step definitions.
 *
 * @param steps - Steps definition (string or array)
 * @returns Validation errors
 */
function validateSteps(steps: string | unknown[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof steps === 'string') {
    // Parse steps from YAML format
    const stepMatches = steps.matchAll(/^\s*-\s+id:\s*(\S+)/gm);
    const stepIds: string[] = [];
    for (const match of stepMatches) {
      stepIds.push(match[1]);
    }

    if (stepIds.length === 0) {
      errors.push({ field: 'steps', message: 'Steps section contains no step definitions' });
      return errors;
    }

    // Check for duplicate step IDs
    const duplicates = stepIds.filter((id, idx) => stepIds.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      errors.push({ field: 'steps.duplicate_ids', message: `Duplicate step IDs found: ${duplicates.join(', ')}` });
    }
  }

  return errors;
}

/**
 * Validates output path references in instructions.
 *
 * @param content - Full content or INSTRUCTIONS section
 * @returns Validation warnings for invalid paths
 */
export function validateOutputPaths(content: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Find path references like {{SPEC_DIR}} or $PATH
  const pathPattern = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = pathPattern.exec(content)) !== null) {
    const pathVar = match[1];
    const validVars = ['SPEC_DIR', 'PROJECT_ROOT', 'OUTPUT_DIR', 'WORK_DIR', 'AGENT_DIR'];

    if (!validVars.some(v => pathVar.startsWith(v))) {
      warnings.push({
        field: 'INSTRUCTIONS.path_reference',
        message: `Non-standard path variable: {{${pathVar}}}`,
        suggestion: `Use standard variables: ${validVars.join(', ')}`
      });
    }
  }

  return warnings;
}

function validateMetadata(metadata: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof metadata !== 'string') {
    return [{ field: 'metadata', message: 'Invalid metadata format' }];
  }

  const lines = metadata.split('\n');
  const requiredFields = ['name:', 'version:'];

  for (const field of requiredFields) {
    if (!lines.some(l => l.trim().startsWith(field))) {
      errors.push({ field: field, message: `Required metadata field '${field.replace(':', '')}' is missing` });
    }
  }

  // Check version format
  const versionMatch = metadata.match(/version:\s*(\S+)/);
  if (versionMatch) {
    const version = versionMatch[1];
    if (!version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push({ field: 'version', message: `Invalid version format '${version}', expected semantic version (e.g., 1.0.0)` });
    }
  }

  return errors;
}

function validatePreconditions(preconditions: unknown): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (typeof preconditions !== 'string') {
    return warnings;
  }

  // Check for empty preconditions
  if (!preconditions.trim()) {
    warnings.push({ field: 'preconditions', message: 'Preconditions section is empty' });
  }

  return warnings;
}

function validateInput(input: unknown): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (typeof input !== 'string') {
    return warnings;
  }

  // Check for complete input definitions
  const hasType = input.includes('type:');
  const hasDescription = input.includes('description:');

  if (!hasType) {
    warnings.push({
      field: 'input.type',
      message: 'Input definition missing type field',
      suggestion: 'Specify input type (data, file, reference, env)'
    });
  }

  return warnings;
}

function validateOutput(output: unknown): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (typeof output !== 'string') {
    return warnings;
  }

  // Check for complete output definitions
  const hasType = output.includes('type:');
  const hasDescription = output.includes('description:');

  if (!hasType) {
    warnings.push({
      field: 'output.type',
      message: 'Output definition missing type field',
      suggestion: 'Specify output type (data, file, reference)'
    });
  }

  return warnings;
}

export default {
  validateSkillContent,
  validateInstructionsFormat,
  validateOutputPaths
};