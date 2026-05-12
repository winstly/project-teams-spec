/**
 * Command File Validator
 *
 * Validates command definition files (*.md) for compliance with OpenSpec format.
 */

import { parseFrontmatter } from './utils.js';

export interface CommandMetadata {
  name: string;
  description?: string;
  version?: string;
  category?: string;
  tags?: string[];
}

export interface CommandSkillChain {
  skills?: string[];
  sequence?: string[];
}

export interface CommandCheckpoint {
  mode?: string;
  before?: string[];
  after?: string[];
  required?: boolean;
  message?: string;
}

export interface CommandBranch {
  'on-success'?: { path?: string; message?: string };
  'on-fail'?: { path?: string; message?: string };
  'on-error'?: { path?: string; message?: string };
}

export interface CommandValidationResult {
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

const VALID_CHECKPOINT_MODES = ['necessary-only', 'optional', 'disabled'];
const VALID_SKILL_PREFIXES = ['pts-', 'skill-'];

/**
 * Validates a command definition file.
 *
 * @param content - Raw content of a command *.md file
 * @param filePath - Optional file path for error reporting
 * @returns Validation result with errors and warnings
 */
export function validateCommandContent(content: string, filePath?: string): CommandValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for frontmatter
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

  // Validate Skill Chain section
  if (frontmatter['Skill Chain'] || frontmatter.skills) {
    const skillChainErrors = validateSkillChain(frontmatter['Skill Chain'] || frontmatter.skills);
    errors.push(...skillChainErrors.map(e => ({ ...e, field: `Skill Chain.${e.field}` })));
    warnings.push(...validateSkillReferences(frontmatter['Skill Chain'] || frontmatter.skills));
  }

  // Validate Checkpoint Strategy section
  if (frontmatter['Checkpoint Strategy'] || frontmatter.checkpoint) {
    const checkpointWarnings = validateCheckpoint(frontmatter['Checkpoint Strategy'] || frontmatter.checkpoint);
    warnings.push(...checkpointWarnings.map(w => ({ ...w, field: `Checkpoint.${w.field}` })));
  }

  // Validate Branch Conditions section
  if (frontmatter['Branch Conditions'] || frontmatter.branches) {
    const branchWarnings = validateBranches(frontmatter['Branch Conditions'] || frontmatter.branches);
    warnings.push(...branchWarnings.map(w => ({ ...w, field: `Branches.${w.field}` })));
  }

  // Validate Execution Notes section
  if (!frontmatter['Execution Notes'] && !frontmatter.execution_notes) {
    warnings.push({
      field: 'execution_notes',
      message: 'Execution Notes section is missing',
      suggestion: 'Add clear execution instructions for the command'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates command metadata.
 *
 * @param metadata - Raw metadata content
 * @returns Validation errors
 */
function validateMetadata(metadata: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof metadata !== 'string') {
    return [{ field: 'metadata', message: 'Invalid metadata format' }];
  }

  const lines = metadata.split('\n');

  // Required fields
  const requiredFields = ['name:', 'description:'];
  for (const field of requiredFields) {
    if (!lines.some(l => l.trim().startsWith(field))) {
      errors.push({ field: field, message: `Required field '${field.replace(':', '')}' is missing` });
    }
  }

  // Optional but recommended fields
  const recommendedFields = ['version:'];
  for (const field of recommendedFields) {
    if (!lines.some(l => l.trim().startsWith(field))) {
      // Not an error, just a warning would be added elsewhere
    }
  }

  // Validate version format if present
  const versionMatch = metadata.match(/version:\s*(\S+)/);
  if (versionMatch) {
    const version = versionMatch[1];
    if (!version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push({ field: 'version', message: `Invalid version format '${version}', expected semantic version` });
    }
  }

  return errors;
}

/**
 * Validates skill chain configuration.
 *
 * @param skillChain - Skill chain configuration
 * @returns Validation errors
 */
function validateSkillChain(skillChain: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof skillChain !== 'string') {
    return [{ field: 'skill_chain', message: 'Invalid skill chain format' }];
  }

  // Check for skills array
  const skillsMatch = skillChain.match(/^\s*-\s+(\S+)/gm);
  if (!skillsMatch || skillsMatch.length === 0) {
    errors.push({ field: 'skills', message: 'Skill chain must contain at least one skill reference' });
    return errors;
  }

  // Validate skill naming convention
  for (const match of skillsMatch) {
    const skillName = match.replace(/^\s*-\s+/, '');
    if (!skillName.startsWith('pts-') && !skillName.startsWith('skill-')) {
      errors.push({
        field: 'skill.naming',
        message: `Skill '${skillName}' should follow pts- or skill- naming convention`
      });
    }
  }

  return errors;
}

/**
 * Validates skill references exist (placeholder check).
 *
 * @param skillChain - Skill chain configuration
 * @returns Validation warnings
 */
function validateSkillReferences(skillChain: unknown): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (typeof skillChain !== 'string') {
    return warnings;
  }

  const skillsMatch = skillChain.match(/^\s*-\s+(\S+)/gm);
  if (skillsMatch && skillsMatch.length > 5) {
    warnings.push({
      field: 'skill_chain.length',
      message: `Skill chain contains ${skillsMatch.length} skills, which may be excessive`,
      suggestion: 'Consider breaking into smaller, reusable command sequences'
    });
  }

  return warnings;
}

/**
 * Validates checkpoint configuration.
 *
 * @param checkpoint - Checkpoint configuration
 * @returns Validation warnings
 */
function validateCheckpoint(checkpoint: unknown): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (typeof checkpoint !== 'string') {
    return warnings;
  }

  // Check mode validity
  const modeMatch = checkpoint.match(/mode:\s*(\S+)/);
  if (modeMatch) {
    const mode = modeMatch[1];
    if (!VALID_CHECKPOINT_MODES.includes(mode)) {
      warnings.push({
        field: 'mode',
        message: `Invalid checkpoint mode '${mode}'`,
        suggestion: `Valid modes: ${VALID_CHECKPOINT_MODES.join(', ')}`
      });
    }
  }

  // Check for user interaction
  const hasUserConfirm = checkpoint.includes('user-confirm') || checkpoint.includes('require: user');
  if (!hasUserConfirm && checkpoint.includes('mode: necessary-only')) {
    warnings.push({
      field: 'checkpoint.interaction',
      message: 'necessary-only mode should include user interaction',
      suggestion: 'Add require: user-confirm or includeCheckpoint with user message'
    });
  }

  return warnings;
}

/**
 * Validates branch conditions.
 *
 * @param branches - Branch configuration
 * @returns Validation warnings
 */
function validateBranches(branches: unknown): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (typeof branches !== 'string') {
    return warnings;
  }

  // Check for success branch
  if (!branches.includes('on-success')) {
    warnings.push({
      field: 'branches.success',
      message: 'on-success branch is not defined',
      suggestion: 'Define what happens on successful execution'
    });
  }

  // Check for fail branch
  if (!branches.includes('on-fail')) {
    warnings.push({
      field: 'branches.fail',
      message: 'on-fail branch is not defined',
      suggestion: 'Define what happens on execution failure'
    });
  }

  // Check for path definition
  const hasPath = branches.match(/\bpath:\s*\S+/);
  if (!hasPath) {
    warnings.push({
      field: 'branches.path',
      message: 'Branch paths are not defined',
      suggestion: 'Add path: <destination> for each branch condition'
    });
  }

  return warnings;
}

export default {
  validateCommandContent
};