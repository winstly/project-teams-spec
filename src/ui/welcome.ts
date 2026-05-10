/**
 * Welcome screen for project-teams-spec installer
 */

const BANNER = `
 ================================================
   project-teams-spec
   Multi-Agent Engineering Spec System
 ================================================
`;

function getWelcomeText(): string[] {
  return [
    'This setup will configure:',
    '  - Skills (9 standard workflow phases)',
    '  - Agents (Java, Frontend, Backend, QA, Reviewer)',
    '  - Rules (architecture, coding standards, naming)',
    '  - Hooks (Claude Code integration)',
    '',
    'Quick start after setup:',
    '  /project-teams-spec full-analysis',
    '',
    'Press Enter to select tools...',
  ];
}

export async function showWelcomeScreen(): Promise<void> {
  console.log(BANNER);

  const textLines = getWelcomeText();
  for (const line of textLines) {
    console.log(line);
  }

  // Wait for Enter key
  await new Promise<void>((resolve) => {
    const stdin = process.stdin;

    if (!stdin.isTTY) {
      resolve();
      return;
    }

    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();

    const onData = (data: Buffer): void => {
      const char = data.toString();

      if (char === '\r' || char === '\n' || char === '\u0003') {
        stdin.removeListener('data', onData);
        stdin.setRawMode(wasRaw);
        stdin.pause();

        if (char === '\u0003') {
          process.exit(0);
        }

        resolve();
      }
    };

    stdin.on('data', onData);
  });

  // Clear welcome screen
  const lineCount = 15;
  for (let i = 0; i < lineCount; i++) {
    process.stdout.write('\x1b[2K\n');
  }
  process.stdout.write(`\x1b[${lineCount}A`);
}
