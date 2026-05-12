/**
 * Trae Command Adapter
 *
 * File path: .trae/commands/pts-<id>.md
 * Enhanced with better metadata formatting for Chinese-first AI assistant
 */

import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

function formatTagsArray(tags: string[]): string {
  const escapedTags = tags.map((tag) => escapeYamlValue(tag));
  return `[${escapedTags.join(', ')}]`;
}

export const traeAdapter: ToolCommandAdapter = {
  toolId: 'trae',

  getFilePath(commandId: string): string {
    return path.posix.join('commands', `pts-${commandId}.md`);
  },

  formatFile(content: CommandContent): string {
    return `---
name: ${escapeYamlValue(content.name)}
description: ${escapeYamlValue(content.description)}
category: ${escapeYamlValue(content.category)}
tags: ${formatTagsArray(content.tags)}
version: "1.0"
---

${content.body}
`;
  },
};