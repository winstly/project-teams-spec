/**
 * Tool selection prompt using @inquirer/prompts
 */

import { checkbox } from '@inquirer/prompts';

export interface ToolOption {
  name: string;
  value: string;
  description: string;
  checked?: boolean;
}

const TOOL_OPTIONS: ToolOption[] = [
  {
    name: 'Claude Code',
    value: 'claude',
    description: 'Anthropic Claude Code CLI',
    checked: true,
  },
  {
    name: 'OpenCode',
    value: 'opencode',
    description: 'OpenCode CLI tool',
  },
  {
    name: 'Trae',
    value: 'trae',
    description: 'Trae AI assistant',
  },
  {
    name: 'Continue',
    value: 'continue',
    description: 'Continue VS Code extension',
  },
  {
    name: 'Kiro',
    value: 'kiro',
    description: 'Kiro AI assistant',
  },
];

export async function selectTools(): Promise<string[]> {
  const answer = await checkbox({
    message: 'Select tools to install:',
    choices: TOOL_OPTIONS.map((tool) => ({
      name: `${tool.name} - ${tool.description}`,
      value: tool.value,
      checked: tool.checked,
    })),
    required: true,
  });

  return answer;
}
