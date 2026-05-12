/**
 * Tool selection prompt using @inquirer/prompts
 * Simple checkbox-based selection without complex keyboard handling
 */

import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';

export interface ToolOption {
  name: string;
  value: string;
  description: string;
  checked?: boolean;
  shortcut?: string;
  category?: string;
}

const TOOL_OPTIONS: ToolOption[] = [
  {
    name: 'Claude Code',
    value: 'claude',
    description: 'Anthropic Claude Code CLI - Full agent orchestration',
    checked: true,
    shortcut: 'c',
    category: 'Agentic',
  },
  {
    name: 'OpenCode',
    value: 'opencode',
    description: 'OpenCode CLI tool - Lightweight coding assistant',
    shortcut: 'o',
    category: 'Agentic',
  },
  {
    name: 'Trae',
    value: 'trae',
    description: 'Trae AI assistant - Chinese-first AI coding',
    shortcut: 't',
    category: 'Agentic',
  },
  {
    name: 'Continue',
    value: 'continue',
    description: 'Continue VS Code extension - Context-aware completion',
    shortcut: 'C',
    category: 'Extension',
  },
  {
    name: 'Kiro',
    value: 'kiro',
    description: 'Kiro AI assistant - Developer productivity tool',
    shortcut: 'k',
    category: 'Agentic',
  },
];

export interface SelectionResult {
  tools: string[];
  all: boolean;
}

/**
 * Group tools by category for display
 */
function groupToolsByCategory(tools: ToolOption[]): Map<string, ToolOption[]> {
  const groups = new Map<string, ToolOption[]>();
  for (const tool of tools) {
    const category = tool.category || 'Other';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(tool);
  }
  return groups;
}

/**
 * Show available tools and let user select via checkbox
 */
export async function selectTools(): Promise<string[]> {
  console.log(chalk.bold('\n📦 Select Tools to Configure\n'));

  // Show categorized options
  const groups = groupToolsByCategory(TOOL_OPTIONS);
  console.log(chalk.dim('Available tools:\n'));

  for (const [category, tools] of groups) {
    console.log(chalk.cyan.bold(`  ${category}`));
    for (const tool of tools) {
      const shortcut = tool.shortcut ? chalk.yellow(`[${tool.shortcut}]`) : '   ';
      console.log(
        `    ${shortcut} ${chalk.bold(tool.name.padEnd(12))} - ${tool.description}`
      );
    }
    console.log();
  }

  // Use checkbox for selection
  const answer = await checkbox({
    message: 'Select tools to install:',
    choices: TOOL_OPTIONS.map((tool) => ({
      name: `${chalk.bold(tool.name)} - ${tool.description} ${chalk.yellow(`[${tool.shortcut}]`)}`,
      value: tool.value,
      checked: tool.checked ?? false,
    })),
    required: true,
  });

  return answer;
}

/**
 * Select tools by category (grouped interaction)
 */
export async function selectToolsWithCategories(): Promise<{ category: string; tools: string[] }[]> {
  console.log(chalk.bold('\n📦 Select Tools by Category\n'));

  const groups = groupToolsByCategory(TOOL_OPTIONS);
  const results: { category: string; tools: string[] }[] = [];

  for (const [category, tools] of groups) {
    console.log(chalk.cyan(`\n  ${category}:`));
    const selected = await checkbox({
      message: `Select ${category} tools:`,
      choices: tools.map((tool) => ({
        name: `${chalk.bold(tool.name)} - ${chalk.dim(tool.description)}`,
        value: tool.value,
        checked: tool.checked,
      })),
      required: false,
    });

    if (selected.length > 0) {
      results.push({ category, tools: selected });
    }
  }

  return results;
}

/**
 * Get tool info by ID
 */
export function getToolInfo(toolId: string): ToolOption | undefined {
  return TOOL_OPTIONS.find(t => t.value === toolId);
}

/**
 * Get all tool IDs
 */
export function getAllToolIds(): string[] {
  return TOOL_OPTIONS.map(t => t.value);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string): ToolOption[] {
  return TOOL_OPTIONS.filter(t => t.category === category);
}
