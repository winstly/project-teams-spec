/**
 * Trae Command Adapter
 *
 * File path: .trae/commands/pts-<id>.md
 */

import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

export const traeAdapter: ToolCommandAdapter = {
  toolId: 'trae',

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
