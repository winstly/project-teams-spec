/**
 * Validation Module Tests
 *
 * Tests for the validation system.
 */

import { validateSkillContent } from '../validation/skill-validator.js';
import { validateAgentContent } from '../validation/agent-validator.js';
import { validateCommandContent } from '../validation/command-validator.js';

// Mock file system for testing
const mockSkillContent = `---
## Metadata
name: test-skill
version: 1.0.0
type: agent-subprocess
phase: 1

## Preconditions
preconditions:
  - previous-skill completed

## Input
input:
  - name: test_input
    type: data
    description: Test input data

## Output
output:
  - name: test_output
    type: data
    description: Test output data

## Steps
steps:
  - id: step-1
    description: First step
    type: agent-subprocess
  - id: step-2
    description: Second step
    type: internal

## Checkpoint
checkpoint:
  required: true
  message: "Confirm before proceeding"

---
# INSTRUCTIONS

You are a test skill for validation testing.

## Setup

Initialize test environment:
\`\`\`bash
npm install
\`\`\`

## Execution

1. Run test command
2. Verify results

### Example

\`\`\`javascript
const result = validateSkillContent(content);
console.log(result);
\`\`\`
`;

const mockAgentContent = `---
## Metadata
name: Test Agent
description: Agent for testing validation
color: blue
emoji: 🔧
vibe: Testing agent for validation

---

## Role Definition

# Test Agent Role

You are **Test Agent**, a specialized agent for testing validation systems.

## Your Identity & Memory
- **Role**: Validation testing specialist
- **Personality**: Precise, thorough, methodical
- **Memory**: Remembers validation patterns and test cases

## Your Core Mission
- Test validation logic
- Verify compliance with standards
- Report issues accurately

## Critical Rules

### Validation Rules
- Always validate input before processing
- Check all required fields
- Report detailed errors

### Testing Rules
- Write comprehensive tests
- Cover edge cases
- Document expected behavior

## Rules Reference

Follow these rule sets:
- rules/test-rules.md - Testing standards
- rules/validation.md - Validation guidelines

## Lessons Learned

See LESSONS_LEARNED.md for recorded issues and solutions.
`;

const mockCommandContent = `---
## Metadata
name: test-command
description: Test command for validation
version: 1.0.0
category: testing

## Skill Chain
skills:
  - pts-test-skill-1
  - pts-test-skill-2

## Checkpoint Strategy
checkpoint:
  mode: necessary-only
  require: user-confirm
  before:
    - pts-test-skill-2

## Branch Conditions
branches:
  on-success:
    path: next-command
    message: "Test passed successfully"
  on-fail:
    path: error-handler
    message: "Test failed, retry"

## Execution Notes
This command validates test execution:
1. Run first skill
2. Validate results
3. Run second skill
4. Report outcome
`;

describe('Skill Validation', () => {
  test('validates valid skill content', () => {
    const result = validateSkillContent(mockSkillContent);
    expect(result.valid).toBe(true);
  });

  test('detects missing frontmatter', () => {
    const result = validateSkillContent('No frontmatter here');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'frontmatter')).toBe(true);
  });

  test('detects missing required metadata fields', () => {
    const invalidContent = `---
## Metadata
name: test
---`;
    const result = validateSkillContent(invalidContent);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field.includes('version'))).toBe(true);
  });
});

describe('Agent Validation', () => {
  test('validates valid agent content', () => {
    const result = validateAgentContent(mockAgentContent);
    expect(result.valid).toBe(true);
  });

  test('detects missing required sections', () => {
    const invalidContent = '# Just a title';
    const result = validateAgentContent(invalidContent);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field.includes('Metadata'))).toBe(true);
  });

  test('warns about missing rules reference', () => {
    const contentWithoutRules = `---
## Metadata
name: Test
description: Test agent
---

## Role Definition
# Test Agent
`;
    const result = validateAgentContent(contentWithoutRules);
    expect(result.warnings.some(w => w.field.includes('rules'))).toBe(true);
  });
});

describe('Command Validation', () => {
  test('validates valid command content', () => {
    const result = validateCommandContent(mockCommandContent);
    expect(result.valid).toBe(true);
  });

  test('detects missing frontmatter', () => {
    const result = validateCommandContent('No frontmatter');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'frontmatter')).toBe(true);
  });

  test('warns about missing skill chain', () => {
    const contentWithoutSkills = `---
## Metadata
name: test
description: Test
---`;
    const result = validateCommandContent(contentWithoutSkills);
    expect(result.valid).toBe(false);
  });
});

// Run tests if executed directly
if (typeof window === 'undefined' && process.argv[1]?.includes('validation.test.ts')) {
  console.log('Running validation tests...');
}