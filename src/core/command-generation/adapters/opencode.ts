/**
 * OpenCode Command Adapter
 *
 * File path: .opencode/commands/pts-<id>.md
 */

import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

export const opencodeAdapter: ToolCommandAdapter = {
  toolId: 'opencode',

  getFilePath(commandId: string): string {
    return path.posix.join('commands', `pts-${commandId}.md`);
  },

  formatFile(content: CommandContent): string {
    return `---
description: ${content.description}
---

${content.body}
`;
  },
};
