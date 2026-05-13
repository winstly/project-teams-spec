/**
 * Welcome screen for project-teams-spec installer
 */

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';

const BANNER = `
${CYAN}╔═══════════════════════════════════════════════════════╗
║${RESET}  ${BOLD}${MAGENTA}██╗     ██╗██╗   ██╗██╗  ██╗██╗██████╗ ███████╗${RESET}       ${CYAN}║
║${RESET}  ${BOLD}${MAGENTA}██║     ██║██║   ██║██║ ██╔╝██║██╔══██╗██╔════╝${RESET}       ${CYAN}║
║${RESET}  ${BOLD}${MAGENTA}██║     ██║██║   ██║█████╔╝ ██║██████╔╝███████╗${RESET}       ${CYAN}║
║${RESET}  ${BOLD}${MAGENTA}██║     ██║██║   ██║██╔═██╗ ██║██╔══██╗╚════██║${RESET}       ${CYAN}║
║${RESET}  ${BOLD}${MAGENTA}███████╗██║╚██████╔╝██║  ██╗██║██║  ██║███████║${RESET}       ${CYAN}║
║${RESET}  ${BOLD}${MAGENTA}╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝${RESET}       ${CYAN}║
╚═══════════════════════════════════════════════════════╝${RESET}

${BOLD}Multi-Agent Engineering Spec System${RESET}
${DIM}Version 1.1.0 | Streamline your development workflow${RESET}
`;

const FEATURES = [
  { icon: '⚡', text: '12 Skills (9 Core + 3 Utility)', color: CYAN },
  { icon: '🤖', text: '5 Specialized Agents', color: GREEN },
  { icon: '📋', text: 'Milestone-Based Iterative Delivery', color: YELLOW },
  { icon: '🪝', text: 'Claude Code Hook Integration', color: MAGENTA },
];

function getWelcomeText(): string[] {
  return [
    '',
    `${BOLD}This setup will configure:${RESET}`,
    '',
    ...FEATURES.map(f => `  ${f.icon} ${f.color}${f.text}${RESET}`),
    '',
    `${BOLD}Quick start after setup:${RESET}`,
    `  ${GREEN}→${RESET} Run ${BOLD}/pts:full-analysis${RESET} to analyze your project`,
    '',
    `${DIM}Press ${BOLD}Enter${RESET}${DIM} or ${BOLD}Space${RESET}${DIM} to continue...${RESET}`,
  ];
}

export interface ProgressStep {
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

export class ProgressTracker {
  private steps: ProgressStep[] = [];
  private currentIndex = 0;

  constructor(steps: string[]) {
    this.steps = steps.map(label => ({ label, status: 'pending' }));
  }

  start(stepIndex?: number): void {
    const idx = stepIndex ?? this.currentIndex;
    if (idx < this.steps.length) {
      this.steps[idx].status = 'running';
      this.render();
    }
  }

  done(stepIndex?: number): void {
    const idx = stepIndex ?? this.currentIndex;
    if (idx < this.steps.length) {
      this.steps[idx].status = 'done';
      this.currentIndex = idx + 1;
      this.render();
    }
  }

  error(stepIndex?: number): void {
    const idx = stepIndex ?? this.currentIndex;
    if (idx < this.steps.length) {
      this.steps[idx].status = 'error';
      this.render();
    }
  }

  private render(): void {
    const lines: string[] = [];
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const prefix = i === this.currentIndex ? '→' : ' ';
      const statusIcon =
        step.status === 'done' ? `${GREEN}✓` :
        step.status === 'running' ? `${YELLOW}⋯` :
        step.status === 'error' ? `${MAGENTA}✗` :
        `${DIM}○`;
      const text = step.status === 'pending' ? `${DIM}${step.label}${RESET}` : step.label;
      lines.push(`  ${prefix} ${statusIcon}${RESET} ${text}`);
    }
    process.stdout.write(`\x1b[${this.steps.length}A`);
    console.log(lines.join('\n'));
  }

  clear(): void {
    process.stdout.write(`\x1b[${this.steps.length}A`);
    for (let i = 0; i < this.steps.length + 2; i++) {
      process.stdout.write('\x1b[2K\r\x1b[1B');
    }
    process.stdout.write(`\x1b[${this.steps.length + 2}A`);
  }
}

export async function showWelcomeScreen(): Promise<void> {
  console.log(BANNER);

  const textLines = getWelcomeText();
  for (const line of textLines) {
    console.log(line);
  }

  // Wait for Enter or Space key
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

      if (char === '\r' || char === '\n' || char === ' ') {
        stdin.removeListener('data', onData);
        stdin.setRawMode(wasRaw);
        stdin.pause();


        resolve();
      }
    };

    stdin.on('data', onData);
  });

  // Clear welcome screen
  const lineCount = 18;
  for (let i = 0; i < lineCount; i++) {
    process.stdout.write('\x1b[2K\r\n');
  }
  process.stdout.write(`\x1b[${lineCount}A`);
}

export function logStep(message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info'): void {
  const icons = {
    info: `${CYAN}ℹ`,
    success: `${GREEN}✓`,
    warn: `${YELLOW}⚠`,
    error: `${MAGENTA}✗`,
  };
  console.log(`  ${icons[type]} ${message}${RESET}`);
}

export function logHeader(message: string): void {
  console.log(`\n${BOLD}${CYAN}━━━ ${message} ━━━${RESET}\n`);
}