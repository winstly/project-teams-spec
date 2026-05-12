/**
 * Agent Configuration Validator
 *
 * Validates agent.md and agent configuration files.
 */

export interface AgentMetadata {
  name?: string;
  description?: string;
  color?: string;
  emoji?: string;
  vibe?: string;
}

export interface AgentRole {
  role?: string;
  personality?: string;
  memory?: string;
  experience?: string;
}

export interface AgentMission {
  'core-mission'?: string;
  mission?: string;
  objectives?: string[];
}

export interface AgentRules {
  'critical-rules'?: string;
  rules?: string[];
  guidelines?: string[];
}

export interface AgentConfig {
  metadata?: AgentMetadata;
  role?: AgentRole;
  mission?: AgentMission;
  rules?: AgentRules;
}

export interface AgentValidationResult {
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

const VALID_COLORS = ['blue', 'green', 'yellow', 'red', 'purple', 'orange', 'pink', 'gray'];
const REQUIRED_SECTIONS = ['Metadata', 'Role Definition'];

/**
 * Validates an agent configuration file.
 *
 * @param content - Raw content of an agent.md file
 * @param filePath - Optional file path for error reporting
 * @returns Validation result with errors and warnings
 */
export function validateAgentContent(content: string, filePath?: string): AgentValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for required sections
  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(`## ${section}`) && !content.includes(`## ${section.replace(' ', '-')}`)) {
      errors.push({
        field: section,
        message: `Missing required section: ## ${section}`
      });
    }
  }

  // Parse frontmatter if present
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatterErrors = validateFrontmatter(frontmatterMatch[1]);
    errors.push(...frontmatterErrors.map(e => ({ ...e, field: `Metadata.${e.field}` })));
  }

  // Validate role definition content
  const roleSection = content.match(/## Role Definition\n([\s\S]*?)(?=##|\n---|$)/);
  if (roleSection) {
    const roleWarnings = validateRoleSection(roleSection[1]);
    warnings.push(...roleWarnings.map(w => ({ ...w, field: `Role.${w.field}` })));
  }

  // Check for rules section
  if (!content.includes('## Rules') && !content.includes('## Critical Rules')) {
    warnings.push({
      field: 'rules',
      message: 'Rules section is missing',
      suggestion: 'Add ## Rules section with operational guidelines'
    });
  }

  // Check for coding standards reference
  const hasRulesRef = content.match(/\brules\/[\w-]+\.md\b/);
  if (!hasRulesRef) {
    warnings.push({
      field: 'rules.reference',
      message: 'No reference to rules/*.md files',
      suggestion: 'Reference specific rule files (e.g., rules/coding.md)'
    });
  }

  // Check for LESSONS_LEARNED.md reference
  if (!content.includes('LESSONS_LEARNED.md')) {
    warnings.push({
      field: 'lessons',
      message: 'No reference to LESSONS_LEARNED.md',
      suggestion: 'Add reference to LESSONS_LEARNED.md for learning from past issues'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates the Metadata section of an agent config.
 *
 * @param metadata - Raw metadata YAML content
 * @returns Validation errors
 */
function validateFrontmatter(metadata: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields in metadata
  const requiredFields = ['name:', 'description:'];
  for (const field of requiredFields) {
    if (!metadata.includes(field)) {
      errors.push({ field: field, message: `Required metadata field '${field.replace(':', '')}' is missing` });
    }
  }

  // Validate color if present
  const colorMatch = metadata.match(/color:\s*(\w+)/);
  if (colorMatch) {
    const color = colorMatch[1].toLowerCase();
    if (!VALID_COLORS.includes(color)) {
      errors.push({
        field: 'color',
        message: `Invalid color '${color}', expected one of: ${VALID_COLORS.join(', ')}`
      });
    }
  }

  // Validate emoji format if present
  const emojiMatch = metadata.match(/emoji:\s*(\S+)/);
  if (emojiMatch) {
    const emoji = emojiMatch[1];
    // Basic emoji validation (single emoji character or explicit emoji)
    if (emoji.length > 10 && !emoji.startsWith(':')) {
      errors.push({
        field: 'emoji',
        message: 'Invalid emoji format'
      });
    }
  }

  return errors;
}

/**
 * Validates the Role Definition section.
 *
 * @param roleContent - Content of the role section
 * @returns Validation warnings
 */
function validateRoleSection(roleContent: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Check for identity markers
  const hasIdentity = roleContent.includes('## Your Identity') || roleContent.includes('You are **');
  if (!hasIdentity) {
    warnings.push({
      field: 'identity',
      message: 'Role section lacks clear identity statement',
      suggestion: 'Use "You are **Agent Name**" format to define identity'
    });
  }

  // Check for role definition
  const hasRole = roleContent.includes('Role:') || roleContent.includes('**Role**:');
  if (!hasRole) {
    warnings.push({
      field: 'role.type',
      message: 'Role type is not explicitly defined',
      suggestion: 'Add "Role: <specialization>" to clarify agent capabilities'
    });
  }

  // Check for personality traits
  const hasPersonality = roleContent.includes('Personality:') || roleContent.includes('**Personality**:');
  if (!hasPersonality) {
    warnings.push({
      field: 'personality',
      message: 'Personality traits are not defined',
      suggestion: 'Define personality traits for consistent behavior'
    });
  }

  // Check for mission/objectives
  const hasMission = roleContent.includes('Mission') || roleContent.includes('Objectives');
  if (!hasMission) {
    warnings.push({
      field: 'mission',
      message: 'No mission or objectives defined',
      suggestion: 'Define core mission or objectives section'
    });
  }

  return warnings;
}

/**
 * Validates that an agent directory has all required files.
 *
 * @param files - List of files in the agent directory
 * @returns Validation result
 */
export function validateAgentDirectory(files: string[]): AgentValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const requiredFiles = ['agent.md'];
  const optionalFiles = ['LESSONS_LEARNED.md'];

  for (const file of requiredFiles) {
    if (!files.some(f => f.endsWith(file))) {
      errors.push({
        field: 'required_file',
        message: `Missing required file: ${file}`
      });
    }
  }

  for (const file of optionalFiles) {
    if (!files.some(f => f.endsWith(file))) {
      warnings.push({
        field: 'optional_file',
        message: `Optional file missing: ${file}`,
        suggestion: 'Consider adding LESSONS_LEARNED.md to record insights'
      });
    }
  }

  // Check for rules directory
  const hasRulesDir = files.some(f => f.includes('/rules/') || f.includes('\\rules\\'));
  if (!hasRulesDir) {
    warnings.push({
      field: 'rules_directory',
      message: 'No rules/ directory found',
      suggestion: 'Add rules/ directory with coding standards and guidelines'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  validateAgentContent,
  validateAgentDirectory
};