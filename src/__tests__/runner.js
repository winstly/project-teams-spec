/**
 * Test Runner for project-teams-spec
 *
 * Runs validation tests on the installed configuration.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Use process.cwd() as the reliable way to get project root when running via npm
const PROJECT_ROOT = resolve(process.cwd());
const CONFIG_PATH = join(PROJECT_ROOT, 'config');

// ── Test Framework (minimal) ──────────────────────────────────────────────────

let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`  [OK] ${name}`);
  } catch (err) {
    failCount++;
    console.log(`  [FAIL] ${name}`);
    console.log(`     ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertContains(str, substr, message) {
  if (!str.includes(substr)) {
    throw new Error(`${message} (expected "${substr}")`);
  }
}

function assertMatch(str, regex, message) {
  if (!regex.test(str)) {
    throw new Error(`${message} (expected match ${regex})`);
  }
}

function assertFile(path) {
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
}

function describe(name, fn) {
  console.log(`\n[TEST] ${name}`);
  fn();
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SKILLS = [
  'project-explore', 'complexity-evaluate', 'agent-claim', 'issue-aggregate',
  'plan-develop', 'plan-validate', 'task-execute', 'qa-verify', 'delivery-close'
];

const AGENTS = ['java-agent', 'frontend-agent', 'backend-agent', 'qa-agent', 'code-reviewer'];

const GRANULARITY_MAP = {
  'project-explore': 'intent',
  'complexity-evaluate': 'procedural',
  'agent-claim': 'protocol',
  'issue-aggregate': 'conversational',
  'plan-develop': 'intent',
  'plan-validate': 'procedural',
  'task-execute': 'protocol',
  'qa-verify': 'protocol',
  'delivery-close': 'procedural',
};

const TYPE_MAP = {
  'project-explore': 'internal',
  'complexity-evaluate': 'internal',
  'agent-claim': 'agent-subprocess',
  'issue-aggregate': 'internal',
  'plan-develop': 'internal',
  'plan-validate': 'internal',
  'task-execute': 'agent-subprocess',
  'qa-verify': 'agent-subprocess',
  'delivery-close': 'internal',
};

// ── Tests ────────────────────────────────────────────────────────────────────────

describe('Install Script', () => {
  const installSrc = readFileSync(join(PROJECT_ROOT, 'src/install.ts'), 'utf-8');

  test('Has ESM __dirname fix (fileURLToPath)', () => {
    assert(installSrc.includes('fileURLToPath'), 'Must use fileURLToPath for ESM');
    assert(installSrc.includes('import.meta.url'), 'Must use import.meta.url');
  });

  test('TOOL_DIRECTORIES has claude', () => {
    assertMatch(installSrc, /claude.*['"]\.claude['"]/, 'Must have claude tool');
  });

  test('TOOL_DIRECTORIES has opencode', () => {
    assertMatch(installSrc, /opencode.*['"]\.opencode['"]/, 'Must have opencode tool');
  });

  test('TOOL_DIRECTORIES has trae', () => {
    assertMatch(installSrc, /trae.*['"]\.trae['"]/, 'Must have trae tool');
  });

  test('Claude Code hooksSupported = true', () => {
    assertMatch(installSrc, /hooksSupported:\s*true/, 'Claude should support hooks');
  });

  test('Handles uninstall command', () => {
    assertMatch(installSrc, /uninstall/, 'Must handle uninstall');
  });

  test('Handles install command', () => {
    assertMatch(installSrc, /\.command\s*\(\s*['"]install['"]/, 'Must handle install command');
  });

  test('Handles list command', () => {
    assertMatch(installSrc, /\.command\s*\(\s*['"]list['"]/, 'Must handle list command');
  });

  test('Updates settings.json hooks', () => {
    assertMatch(installSrc, /settings\.json|updateSettingsJson/, 'Must update settings.json');
  });

  test('Has version file write/read', () => {
    assertMatch(installSrc, /readVersionFile/, 'Must track version');
  });

  test('Has dry-run mode', () => {
    assertMatch(installSrc, /dry.?run|dryRun/, 'Must support dry run');
  });

  test('PROJECT_ROOT resolves from src/ parent', () => {
    assertMatch(installSrc, /path\.resolve\(__dirname,\s*['"]\.\.['"]\)/, 'PROJECT_ROOT must resolve to project root');
  });

  test('Copies skills to tool directory', () => {
    assertMatch(installSrc, /copyDirectory.*skills/, 'Must copy skills');
  });

  test('Copies agents to tool directory', () => {
    assertMatch(installSrc, /copyDirectory.*agents/, 'Must copy agents');
  });

  test('Copies rules to tool config/', () => {
    assertMatch(installSrc, /config\/rules|rulesDest/, 'Must copy rules to config/rules');
  });

  test('Copies commands to tool directory', () => {
    assertMatch(installSrc, /generateCommands|commandsDest/, 'Must generate/install commands');
  });

  test('Copies hooks only for Claude Code', () => {
    const hooksCheck = /hooksSupported\s*&&\s*!/;
    assertMatch(installSrc, hooksCheck, 'Must only copy hooks for supported tools');
  });
});

// ── Skill Definitions ────────────────────────────────────────────────────────

describe('Skill Definitions', () => {
  for (const name of SKILLS) {
    const SKILL_PATH = join(CONFIG_PATH, 'skills', name);

    test(`${name}/SKILL.md exists and non-empty`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assert(c.length > 100, 'SKILL.md must not be empty');
    });

    test(`${name} has ## 元数据 or ## Metadata`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assert(c.includes('## 元数据') || c.includes('## Metadata'), 'Must have 元数据 or Metadata section');
    });

    test(`${name} has INSTRUCTIONS (H1 or H2)`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assert(c.includes('# INSTRUCTIONS') || c.includes('## INSTRUCTIONS'), 'Must have INSTRUCTIONS section');
    });

    test(`${name} has all required metadata fields`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      for (const f of ['name:', 'version:', 'granularity:', 'type:', 'phase:']) {
        assertContains(c, f, `Must have ${f}`);
      }
    });

    test(`${name} granularity = ${GRANULARITY_MAP[name]}`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assertContains(c, `granularity: ${GRANULARITY_MAP[name]}`, 'Must match expected granularity');
    });

    test(`${name} type = ${TYPE_MAP[name]}`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assertContains(c, `type: ${TYPE_MAP[name]}`, 'Must match expected type');
    });

    test(`${name} has no duplicate ## Checkpoint sections`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      const checkpointCount = (c.match(/^## Checkpoint/gm) || []).length;
      assert(checkpointCount <= 1, `Found ${checkpointCount} ## Checkpoint sections (expected 0 or 1)`);
    });

    test(`${name} Checkpoint has message`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      if (c.includes('## Checkpoint')) {
        assertMatch(c, /checkpoint:[\s\S]*message:/, 'Checkpoint must have message field');
      }
    });

    test(`${name} has preconditions`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assert(c.includes('## 前置条件') || c.includes('## Preconditions'), 'Must have preconditions');
    });

    test(`${name} has input definition`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assert(c.includes('## Input') || c.includes('## 输入'), 'Must have input definition');
    });

    test(`${name} has output definition`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assert(c.includes('## Output') || c.includes('## 输出'), 'Must have output definition');
    });

    test(`${name} has steps or评审标准 section`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assert(c.includes('## Steps') || c.includes('## 步骤') || c.includes('评审标准') || c.includes('## Review Criteria'), 'Must have steps or review criteria');
    });

    // For agent-subprocess types, must have delegate_to
  if (TYPE_MAP[name] === 'agent-subprocess') {
    test(`${name} agent-subprocess step has delegate_to`, () => {
      const c = readFileSync(join(SKILL_PATH, 'SKILL.md'), 'utf-8');
      assertMatch(c, /delegate_to:\s*\w+/, 'Must have delegate_to');
    });
  }
  }

  // Verify skill phases are sequential
  test('Skill phases are sequential (1-9)', () => {
    const phases = SKILLS.map(skill => {
      const c = readFileSync(join(CONFIG_PATH, 'skills', skill, 'SKILL.md'), 'utf-8');
      const match = c.match(/phase:\s*(\d+)/);
      return match ? parseInt(match[1]) : null;
    });
    assert(phases.length === 9, 'Must have 9 skills');
    for (let i = 0; i < 9; i++) {
      assert(phases[i] === i + 1, `Skill ${i + 1} must have phase ${i + 1}`);
    }
  });
});

// ── Agent Definitions ────────────────────────────────────────────────────────

describe('Agent Definitions', () => {
  for (const agent of AGENTS) {
    const AGENT_PATH = join(CONFIG_PATH, 'agents', agent);

    test(`${agent}/agent.md exists and non-empty`, () => {
      const c = readFileSync(join(AGENT_PATH, 'agent.md'), 'utf-8');
      assert(c.length > 50, 'agent.md must not be empty');
    });

    test(`${agent} has ## 元数据 or ## Metadata`, () => {
      const c = readFileSync(join(AGENT_PATH, 'agent.md'), 'utf-8');
      assert(c.includes('## 元数据') || c.includes('## Metadata'), 'Must have 元数据 or Metadata section');
    });

    test(`${agent} has role definition`, () => {
      const c = readFileSync(join(AGENT_PATH, 'agent.md'), 'utf-8');
      assert(c.includes('## 角色') || c.includes('## Role'), 'Must have role definition');
    });

    test(`${agent} has rules/ or 验证规则 section`, () => {
      const hasRules = existsSync(join(AGENT_PATH, 'rules'));
      const c = readFileSync(join(AGENT_PATH, 'agent.md'), 'utf-8');
      const hasValidationRules = c.includes('## 验证规则') || c.includes('## Validation Rules');
      assert(hasRules || hasValidationRules, 'Must have rules/ directory or validation rules section');
    });

    if (existsSync(join(AGENT_PATH, 'rules'))) {
      test(`${agent}/rules/ has rule files`, () => {
        const rules = readdirSync(join(AGENT_PATH, 'rules')).filter(f => f.endsWith('.md'));
        assert(rules.length > 0, 'Must have at least one rule file');
      });
    }

    test(`${agent} has LESSONS_LEARNED.md`, () => {
      assertFile(join(AGENT_PATH, 'LESSONS_LEARNED.md'));
    });
  }

  // Test specific rule files
  test('java-agent has concurrency.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'java-agent', 'rules', 'concurrency.md')));
  test('java-agent has java8.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'java-agent', 'rules', 'java8.md')));
  test('frontend-agent has javascript.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'frontend-agent', 'rules', 'javascript.md')));
  test('frontend-agent has typescript.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'frontend-agent', 'rules', 'typescript.md')));
  test('frontend-agent has react.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'frontend-agent', 'rules', 'react.md')));
  test('frontend-agent has git.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'frontend-agent', 'rules', 'git.md')));
  test('backend-agent has microservices.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'backend-agent', 'rules', 'microservices.md')));
  test('backend-agent has refactoring.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'backend-agent', 'rules', 'refactoring.md')));
  test('code-reviewer has checklist.md rule', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'code-reviewer', 'rules', 'checklist.md')));
  test('qa-agent has rules/verification.md', () => assertFile(join(PROJECT_ROOT, 'config', 'agents', 'qa-agent', 'rules', 'verification.md')));
});

// ── Global Rules ─────────────────────────────────────────────────────────────

describe('Global Rules', () => {
  const RULES_PATH = join(CONFIG_PATH, 'rules');

  test('architecture.md exists and has content', () => {
    const c = readFileSync(join(RULES_PATH, 'architecture.md'), 'utf-8');
    assert(c.length > 100, 'architecture.md must have content');
  });

  test('coding-standards.md exists and has content', () => {
    const c = readFileSync(join(RULES_PATH, 'coding-standards.md'), 'utf-8');
    assert(c.length > 100, 'coding-standards.md must have content');
  });

  test('naming-conventions.md exists and has content', () => {
    const c = readFileSync(join(RULES_PATH, 'naming-conventions.md'), 'utf-8');
    assert(c.length > 100, 'naming-conventions.md must have content');
  });

  test('architecture.md has architecture principles', () => {
    const c = readFileSync(join(RULES_PATH, 'architecture.md'), 'utf-8');
    assert(c.includes('## Architecture') || c.includes('## 架构'), 'Must have architecture section');
  });

  test('coding-standards.md has style section', () => {
    const c = readFileSync(join(RULES_PATH, 'coding-standards.md'), 'utf-8');
    assert(c.includes('## Style') || c.includes('## 代码风格') || c.includes('## Code Style'), 'Must have style section');
  });

  test('naming-conventions.md has naming sections', () => {
    const c = readFileSync(join(RULES_PATH, 'naming-conventions.md'), 'utf-8');
    assert(c.includes('## Skill Naming') || c.includes('## Agent 命名') || c.includes('## Skill 命名') || c.includes('## Agent Naming'), 'Must have naming conventions');
  });
});

// ── Commands Tests ──────────────────────────────────────────────────────────

describe('Commands', () => {
  const COMMANDS_PATH = join(CONFIG_PATH, 'commands');

  for (const cmd of ['full-analysis', 'plan-cycle', 'execution-cycle']) {
    const cmdFile = join(COMMANDS_PATH, `${cmd}.md`);
    const c = readFileSync(cmdFile, 'utf-8');

    test(`${cmd}.md exists`, () => {
      assertFile(cmdFile);
    });

    test(`${cmd}.md has name: ${cmd}`, () => {
      assertMatch(c, new RegExp(`name:\\s*${cmd}`), `Must have name: ${cmd}`);
    });

    test(`${cmd}.md contains "skills:"`, () => {
      assertContains(c, 'skills:', 'Must reference skills');
    });

    // Command-specific skill references
    if (cmd === 'full-analysis') {
      test(`${cmd}.md contains "project-explore"`, () => assertContains(c, 'project-explore', 'Must reference project-explore'));
      test(`${cmd}.md contains "complexity-evaluate"`, () => assertContains(c, 'complexity-evaluate', 'Must reference complexity-evaluate'));
    } else if (cmd === 'plan-cycle') {
      test(`${cmd}.md contains "agent-claim"`, () => assertContains(c, 'agent-claim', 'Must reference agent-claim'));
      test(`${cmd}.md contains "issue-aggregate"`, () => assertContains(c, 'issue-aggregate', 'Must reference issue-aggregate'));
      test(`${cmd}.md contains "plan-develop"`, () => assertContains(c, 'plan-develop', 'Must reference plan-develop'));
      test(`${cmd}.md contains "plan-validate"`, () => assertContains(c, 'plan-validate', 'Must reference plan-validate'));
    } else if (cmd === 'execution-cycle') {
      test(`${cmd}.md contains "task-execute"`, () => assertContains(c, 'task-execute', 'Must reference task-execute'));
      test(`${cmd}.md contains "qa-verify"`, () => assertContains(c, 'qa-verify', 'Must reference qa-verify'));
      test(`${cmd}.md contains "delivery-close"`, () => assertContains(c, 'delivery-close', 'Must reference delivery-close'));
    }

    test(`${cmd}.md has branches config`, () => {
      assert(c.includes('branches:') || c.includes('命令') || c.includes('Commands'), 'Must have command config');
    });
  }
});

// ── Hooks ──────────────────────────────────────────────────────────────────────

describe('Hooks', () => {
  const HOOKS_PATH = join(CONFIG_PATH, 'hooks');
  const hooks = [
    'on-subagent-start.sh',
    'on-subagent-stop.sh',
    'on-task-created.sh',
    'on-task-completed.sh',
    'on-session-end.sh'
  ];

  for (const hook of hooks) {
    test(`${hook} exists`, () => {
      assertFile(join(HOOKS_PATH, hook));
    });

    test(`${hook} is executable (bash shebang)`, () => {
      const c = readFileSync(join(HOOKS_PATH, hook), 'utf-8');
      assert(c.startsWith('#!/bin/bash'), 'Must have bash shebang');
    });
  }
});

// ── Skill Subdirectories ─────────────────────────────────────────────────────

describe('Skill Subdirectories', () => {
  test('project-explore has assets/ with project-md-template.md', () => {
    assertFile(join(PROJECT_ROOT, 'config', 'skills', 'project-explore', 'assets', 'project-md-template.md'));
  });

  test('project-explore has references/ with tech-stack-identify.md', () => {
    assertFile(join(PROJECT_ROOT, 'config', 'skills', 'project-explore', 'references', 'tech-stack-identify.md'));
  });

  test('complexity-evaluate has assets/ with complexity-report-template.md', () => {
    assertFile(join(PROJECT_ROOT, 'config', 'skills', 'complexity-evaluate', 'assets', 'complexity-report-template.md'));
  });

  test('complexity-evaluate has scripts/ with evaluate.ts', () => {
    assertFile(join(PROJECT_ROOT, 'config', 'skills', 'complexity-evaluate', 'scripts', 'evaluate.ts'));
  });

  test('task-execute has references/ with task-descriptor-schema.md', () => {
    assertFile(join(PROJECT_ROOT, 'config', 'skills', 'task-execute', 'references', 'task-descriptor-schema.md'));
  });

  test('task-execute has assets/ with task-result-template.json', () => {
    assertFile(join(PROJECT_ROOT, 'config', 'skills', 'task-execute', 'assets', 'task-result-template.json'));
  });
});

// ── Documentation ─────────────────────────────────────────────────────────────

describe('Documentation', () => {
  test('README.md exists and has Quick Start or 快速开始 section', () => {
    const c = readFileSync(join(PROJECT_ROOT, 'README.md'), 'utf-8');
    assert(c.includes('## Quick Start') || c.includes('## 快速开始'), 'Must have quick start section');
  });

  // CLAUDE.md and INSTALL.md are optional - project structure decisions
  test('CLAUDE.md (optional) has Core Concepts section', () => {
    const claudePath = join(PROJECT_ROOT, 'CLAUDE.md');
    if (existsSync(claudePath)) {
      const c = readFileSync(claudePath, 'utf-8');
      assert(c.includes('## Core Concepts') || c.includes('## 核心概念') || c.includes('Phase'), 'CLAUDE.md should have core concepts or phase section');
    }
  });

  test('INSTALL.md (optional) has Installation section', () => {
    const installPath = join(PROJECT_ROOT, 'INSTALL.md');
    if (existsSync(installPath)) {
      const c = readFileSync(installPath, 'utf-8');
      assert(c.includes('## Installation') || c.includes('## 安装步骤') || c.includes('## Quick Start'), 'INSTALL.md should have installation section');
    }
  });
});

// ── OpenSpec Integration ─────────────────────────────────────────────────────

describe('OpenSpec Integration', () => {
  test('openspec/config.yaml exists', () => {
    assertFile(join(PROJECT_ROOT, 'openspec', 'config.yaml'));
  });

  // OpenSpec changes directory exists with at least one change
  test('openspec/changes/ exists', () => {
    assertFile(join(PROJECT_ROOT, 'openspec', 'changes'));
  });
});

// ── Summary ────────────────────────────────────────────────────────────────────

console.log('\n==================================================');
console.log(`Results: ${passCount} passed, ${failCount} failed, total ${testCount}`);
if (failCount > 0) {
  console.log('Some tests failed!');
  process.exit(1);
}
