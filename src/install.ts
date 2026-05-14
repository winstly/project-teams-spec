/**
 * Installation Script
 *
 * Installs project-teams-spec norms to target CLI tool directories.
 * Enhanced with validation, rollback, and detailed logging.
 *
 * Usage:
 *   project-teams-spec install
 *   project-teams-spec install --tools claude,opencode
 *   project-teams-spec install --tools claude --force
 *   project-teams-spec uninstall --tools claude
 *   project-teams-spec list
 *   project-teams-spec list --verbose
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import {
  CommandAdapterRegistry,
  generateCommands,
  claudeAdapter,
  opencodeAdapter,
  traeAdapter,
} from './core/command-generation/index.js';
import { getCommandContents } from './core/command-templates.js';
import { showWelcomeScreen } from './ui/welcome.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
const VERSION = packageJson.version;

// Log levels
enum LogLevel {
  QUIET = 0,
  NORMAL = 1,
  VERBOSE = 2,
  DEBUG = 3,
}

let currentLogLevel = LogLevel.NORMAL;

function setLogLevel(level: string): void {
  switch (level.toLowerCase()) {
    case 'quiet':
    case 'q':
      currentLogLevel = LogLevel.QUIET;
      break;
    case 'verbose':
    case 'v':
      currentLogLevel = LogLevel.VERBOSE;
      break;
    case 'debug':
    case 'd':
      currentLogLevel = LogLevel.DEBUG;
      break;
    default:
      currentLogLevel = LogLevel.NORMAL;
  }
}

function log(level: LogLevel, message: string): void {
  if (level <= currentLogLevel) {
    console.log(message);
  }
}

function debug(message: string): void {
  log(LogLevel.DEBUG, chalk.dim(`[DEBUG] ${message}`));
}

function verbose(message: string): void {
  log(LogLevel.VERBOSE, chalk.dim(`[VERBOSE] ${message}`));
}

function info(message: string): void {
  log(LogLevel.NORMAL, chalk.cyan(`  ℹ ${message}`));
}

function success(message: string): void {
  log(LogLevel.NORMAL, chalk.green(`  ✓ ${message}`));
}

function warn(message: string): void {
  log(LogLevel.NORMAL, chalk.yellow(`  ⚠ ${message}`));
}

function error(message: string): void {
  log(LogLevel.NORMAL, chalk.red(`  ✗ ${message}`));
}

// Register command adapters
CommandAdapterRegistry.register(claudeAdapter);
CommandAdapterRegistry.register(opencodeAdapter);
CommandAdapterRegistry.register(traeAdapter);

// Tool directory mappings
const TOOL_DIRECTORIES: Record<string, { dir: string; name: string; hooksSupported: boolean; adapter: string }> = {
  claude: { dir: '.claude', name: 'Claude Code', hooksSupported: true, adapter: 'claude' },
  opencode: { dir: '.opencode', name: 'OpenCode', hooksSupported: false, adapter: 'opencode' },
  trae: { dir: '.trae', name: 'Trae', hooksSupported: false, adapter: 'trae' },
  continue: { dir: '.continue', name: 'Continue', hooksSupported: false, adapter: 'opencode' },
  kiro: { dir: '.kiro', name: 'Kiro', hooksSupported: false, adapter: 'opencode' },
};

interface InstallOptions {
  tools: string[];
  diff: boolean;
  uninstall: boolean;
  force: boolean;
  dryRun: boolean;
  logLevel: string;
  retry: number;
  preValidate: boolean;
}

// Hook configuration types (Claude Code format)
interface HookConfig {
  type: 'command';
  command: string;
}

interface HookDefinition {
  hooks: HookConfig[];
}

type HookEvent = 'SubagentStart' | 'SubagentStop' | 'TaskCreated' | 'TaskCompleted' | 'SessionEnd';

const HOOK_EVENTS: HookEvent[] = ['SubagentStart', 'SubagentStop', 'TaskCreated', 'TaskCompleted', 'SessionEnd'];

const HOOK_SCRIPTS: Record<HookEvent, string> = {
  SubagentStart: 'on-subagent-start.sh',
  SubagentStop: 'on-subagent-stop.sh',
  TaskCreated: 'on-task-created.sh',
  TaskCompleted: 'on-task-completed.sh',
  SessionEnd: 'on-session-end.sh',
};

// Placeholder definitions for dynamic path replacement
const PLACEHOLDER_REPLACEMENTS: Record<string, (toolId: string) => string> = {
  '{{TOOL_DIR}}': (toolId) => '.' + toolId,
  '{{AGENTS_DIR}}': (toolId) => '.' + toolId + '/agents',
  '{{SKILLS_DIR}}': (toolId) => '.' + toolId + '/skills',
  '{{RULES_DIR}}': (toolId) => '.' + toolId + '/rules',
  '{{SPEC_DIR}}': () => '.project-teams-spec',
};

// Files that should have placeholders replaced
const PLACEHOLDER_PATTERNS = [
  'config/skills/**/*.md',
  'config/commands/**/*.md',
  'config/rules/**/*.md',
];

// Precompiled regex patterns for performance
const PLACEHOLDER_REGEXES = PLACEHOLDER_PATTERNS.map(p =>
  new RegExp(p.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
);

// Check if file should have placeholder replacement
function shouldReplacePlaceholders(filePath: string): boolean {
  return PLACEHOLDER_REGEXES.some(regex => regex.test(filePath));
}

// Replace placeholders in file content based on toolId
function replacePlaceholders(content: string, toolId: string): string {
  let result = content;
  for (const [placeholder, replacer] of Object.entries(PLACEHOLDER_REPLACEMENTS)) {
    result = result.split(placeholder).join(replacer(toolId));
  }
  return result;
}

// Get tool path - prefer project directory
async function getToolPath(toolId: string, useProjectDir: boolean = true): Promise<string | null> {
  const config = TOOL_DIRECTORIES[toolId];
  if (!config) return null;

  // Prefer project directory
  if (useProjectDir) {
    const projectPath = path.join(process.cwd(), config.dir);
    return projectPath;
  }

  // Fallback to home directory
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const homePath = path.join(homeDir, config.dir);
  return existsSync(homePath) ? homePath : null;
}

// Check if tool is installed (in home directory)
function isToolInstalled(toolId: string): boolean {
  const config = TOOL_DIRECTORIES[toolId];
  if (!config) return false;

  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const homePath = path.join(homeDir, config.dir);
  return existsSync(homePath);
}

// Validation result type
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Pre-installation validation
async function preValidate(toolId: string): Promise<ValidationResult> {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const config = TOOL_DIRECTORIES[toolId];

  if (!config) {
    result.valid = false;
    result.errors.push(`Unknown tool: ${toolId}`);
    return result;
  }

  // Check if source files exist
  const skillsSrc = path.join(PROJECT_ROOT, 'config', 'skills');
  const agentsSrc = path.join(PROJECT_ROOT, 'config', 'agents');
  const rulesSrc = path.join(PROJECT_ROOT, 'config', 'rules');

  if (!existsSync(skillsSrc)) {
    result.valid = false;
    result.errors.push(`Skills source not found: ${skillsSrc}`);
  }

  if (!existsSync(agentsSrc)) {
    result.valid = false;
    result.errors.push(`Agents source not found: ${agentsSrc}`);
  }

  if (!existsSync(rulesSrc)) {
    result.valid = false;
    result.errors.push(`Rules source not found: ${rulesSrc}`);
  }

  // Check if command adapter exists
  if (!CommandAdapterRegistry.has(config.adapter)) {
    result.warnings.push(`No command adapter for ${config.name} - commands will not be generated`);
  }

  // Check disk space (rough estimate)
  try {
    const diskSpace = await fs.statfs(path.join(PROJECT_ROOT, 'config')).catch(() => null);
    // Could add disk space check here if needed
  } catch {
    result.warnings.push('Could not check disk space');
  }

  return result;
}

// Backup files before installation
interface BackupEntry {
  path: string;
  content: string;
}

async function backupFiles(toolPath: string): Promise<BackupEntry[]> {
  const backups: BackupEntry[] = [];
  const dirs = ['skills', 'agents', 'commands', 'rules'];

  for (const dir of dirs) {
    const dirPath = path.join(toolPath, dir);
    if (existsSync(dirPath)) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile()) {
            const filePath = path.join(dirPath, entry.name);
            const content = await fs.readFile(filePath, 'utf-8');
            backups.push({ path: filePath, content });
          }
        }
      } catch {
        // Directory might not exist yet
      }
    }
  }

  return backups;
}

// Rollback installation
async function rollback(backups: BackupEntry[]): Promise<void> {
  console.log(chalk.yellow('\nRolling back changes...'));

  for (const backup of backups) {
    try {
      await fs.writeFile(backup.path, backup.content, 'utf-8');
    } catch {
      console.log(chalk.red(`  Failed to restore: ${backup.path}`));
    }
  }

  console.log(chalk.green(`  Rolled back ${backups.length} files`));
}

// Count top-level directories in source
async function countDirectories(src: string): Promise<number> {
  try {
    const entries = await fs.readdir(src, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).length;
  } catch {
    return 0;
  }
}

// Count top-level items with stats
async function countSourceItems(src: string): Promise<{ dirs: number; files: number }> {
  try {
    const entries = await fs.readdir(src, { withFileTypes: true });
    return {
      dirs: entries.filter(e => e.isDirectory()).length,
      files: entries.filter(e => e.isFile()).length
    };
  } catch {
    return { dirs: 0, files: 0 };
  }
}

// Copy directory with progress callback
async function copyDirectory(
  src: string,
  dest: string,
  options?: {
    overwrite?: boolean;
    toolId?: string;
    onProgress?: (current: number, total: number, file: string) => void;
  }
): Promise<{ copied: string[]; errors: string[] }> {
  const copied: string[] = [];
  const errors: string[] = [];
  const { overwrite = true, toolId, onProgress } = options || {};

  try {
    await fs.mkdir(dest, { recursive: true });
  } catch (err: any) {
    if (err.code !== 'EEXIST') {
      errors.push(`Failed to create directory ${dest}: ${err.message}`);
      return { copied, errors };
    }
  }

  const entries = await fs.readdir(src, { withFileTypes: true });
  let processed = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const subResult = await copyDirectory(srcPath, destPath, { overwrite, toolId, onProgress });
      copied.push(...subResult.copied);
      errors.push(...subResult.errors);
    } else {
      try {
        const destExists = existsSync(destPath);
        if (destExists && !overwrite) continue;

        // Read file content
        let content = await fs.readFile(srcPath, 'utf-8');

        // Replace placeholders if applicable
        if (toolId && shouldReplacePlaceholders(srcPath)) {
          content = replacePlaceholders(content, toolId);
        }

        // Write file
        await fs.writeFile(destPath, content, 'utf-8');
        const relPath = path.relative(src, srcPath);
        copied.push(relPath);

        if (onProgress) {
          processed++;
          onProgress(processed, entries.length, relPath);
        }
      } catch (err: any) {
        errors.push(`Failed to copy ${srcPath}: ${err.message}`);
      }
    }
  }

  return { copied, errors };
}

async function readVersionFile(toolPath: string, toolId: string): Promise<Record<string, string>> {
  const versionFile = path.join(toolPath, '.project-teams-spec-' + toolId + '-version');

  try {
    const content = await fs.readFile(versionFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeVersionFile(toolPath: string, toolId: string, versions: Record<string, string>): Promise<void> {
  const versionFile = path.join(toolPath, '.project-teams-spec-' + toolId + '-version');
  await fs.writeFile(versionFile, JSON.stringify(versions, null, 2), 'utf-8');
}

async function updateSettingsJsonHooks(toolPath: string, addHooks: boolean): Promise<void> {
  const settingsPath = path.join(toolPath, 'settings.json');

  let settings: Record<string, unknown> = {};
  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    settings = JSON.parse(content);
  } catch {
    settings = {};
  }

  if (addHooks) {
    const hooksDir = path.join(toolPath, 'hooks');
    settings.hooks = settings.hooks || {};

    for (const event of HOOK_EVENTS) {
      const scriptPath = `${hooksDir}/${HOOK_SCRIPTS[event]}`;
      const hookDef: HookDefinition = {
        hooks: [
          {
            type: 'command',
            command: scriptPath,
          },
        ],
      };
      (settings.hooks as Record<HookEvent, HookDefinition[]>)[event] = [hookDef];
    }
  } else {
    if (settings.hooks) {
      for (const event of HOOK_EVENTS) {
        delete (settings.hooks as Record<HookEvent, unknown>)[event];
      }
    }
  }

  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

// Check if target directory already has files
async function hasExistingFiles(toolPath: string): Promise<boolean> {
  const dirs = ['skills', 'agents', 'commands'];
  for (const dir of dirs) {
    const dirPath = path.join(toolPath, dir);
    if (existsSync(dirPath)) {
      const entries = await fs.readdir(dirPath);
      if (entries.length > 0) return true;
    }
  }
  return false;
}

async function installToTool(toolId: string, options: InstallOptions): Promise<boolean> {
  const config = TOOL_DIRECTORIES[toolId];
  if (!config) {
    error(`Unknown tool: ${toolId}`);
    return false;
  }

  console.log(chalk.bold(`\n${options.uninstall ? 'Uninstalling from' : 'Installing to'} ${config.name}...`));

  // Set log level
  setLogLevel(options.logLevel);

  // Pre-validation
  if (options.preValidate && !options.uninstall) {
    info(`Validating ${config.name}...`);
    const validation = await preValidate(toolId);

    if (!validation.valid) {
      error(`Validation failed for ${config.name}:`);
      for (const err of validation.errors) {
        console.log(chalk.red(`    - ${err}`));
      }
      return false;
    }

    if (validation.warnings.length > 0) {
      warn(`Validation warnings for ${config.name}:`);
      for (const warnMsg of validation.warnings) {
        console.log(chalk.yellow(`    - ${warnMsg}`));
      }
    }

    success('Validation passed');
  }

  const toolPath = await getToolPath(toolId);
  if (!toolPath) {
    warn(`${config.name} path could not be determined`);
    return false;
  }

  info(`Target: ${toolPath}`);

  // Track for potential rollback
  let backups: BackupEntry[] = [];
  let installSucceeded = false;

  if (options.dryRun) {
    console.log(chalk.dim('  [DRY RUN] Would copy:'));
    console.log(chalk.dim('    - config/skills/ -> skills/'));
    console.log(chalk.dim('    - config/agents/ -> agents/'));
    console.log(chalk.dim('    - config/rules/ -> rules/'));
    if (config.hooksSupported && !options.uninstall) {
      console.log(chalk.dim('    - config/hooks/ -> hooks/'));
      console.log(chalk.dim('    - Update settings.json hooks'));
    }
    console.log(chalk.dim('  [DRY RUN] Would generate commands'));
    console.log(chalk.dim('  [DRY RUN] Would update version file'));
    return true;
  }

  // Backup existing files
  if (!options.uninstall) {
    verbose('Backing up existing files...');
    backups = await backupFiles(toolPath);
    debug(`Found ${backups.length} files to backup`);
  }

  // Check if files already exist and prompt for overwrite
  let overwrite = options.force;
  if (!overwrite && !options.uninstall) {
    const exists = await hasExistingFiles(toolPath);
    if (exists) {
      const { confirm } = await import('@inquirer/prompts');
      const shouldOverwrite = await confirm({
        message: `${config.name} already has files. Overwrite?`,
        default: false,
      });
      if (!shouldOverwrite) {
        console.log(chalk.dim('  Skipped.'));
        return false;
      }
      overwrite = true;
    }
  }

  try {
    // Install skills
    console.log(chalk.dim('  Copying skills...'));
    const skillsSrc = path.join(PROJECT_ROOT, 'config', 'skills');
    const skillsDest = path.join(toolPath, 'skills');
    const skillsDirs = await countDirectories(skillsSrc);
    const skillsResult = await copyDirectory(skillsSrc, skillsDest, { overwrite, toolId });

    if (skillsResult.errors.length > 0) {
      warn(`Some skills files failed to copy:`);
      for (const err of skillsResult.errors) {
        console.log(chalk.dim(`    ${err}`));
      }
    }

    console.log(`  ✓ ${skillsDirs} skills copied`);

    // Install agents
    console.log(chalk.dim('  Copying agents...'));
    const agentsSrc = path.join(PROJECT_ROOT, 'config', 'agents');
    const agentsDest = path.join(toolPath, 'agents');
    const agentsDirs = await countDirectories(agentsSrc);
    const agentsResult = await copyDirectory(agentsSrc, agentsDest, { overwrite });

    if (agentsResult.errors.length > 0) {
      warn(`Some agent files failed to copy:`);
      for (const err of agentsResult.errors) {
        console.log(chalk.dim(`    ${err}`));
      }
    }

    console.log(`  ✓ ${agentsDirs} agents copied`);

    // Install rules
    console.log(chalk.dim('  Copying rules...'));
    const rulesSrc = path.join(PROJECT_ROOT, 'config', 'rules');
    const rulesDest = path.join(toolPath, 'rules');
    const rulesDirs = await countDirectories(rulesSrc);
    const rulesResult = await copyDirectory(rulesSrc, rulesDest, { overwrite, toolId });

    if (rulesResult.errors.length > 0) {
      warn(`Some rules files failed to copy:`);
      for (const err of rulesResult.errors) {
        console.log(chalk.dim(`    ${err}`));
      }
    }

    console.log(`  ✓ ${rulesDirs} rules copied`);

    // Install commands using command generation
    console.log(chalk.dim('  Generating commands...'));
    const adapter = CommandAdapterRegistry.get(config.adapter);
    if (adapter) {
      const commandContents = getCommandContents();
      const generatedCommands = generateCommands(commandContents, adapter);
      let commandsInstalled = 0;
      for (const cmd of generatedCommands) {
        const cmdPath = path.join(toolPath, cmd.path);
        await fs.mkdir(path.dirname(cmdPath), { recursive: true });
        await fs.writeFile(cmdPath, cmd.fileContent, 'utf-8');
        commandsInstalled++;
      }
      console.log(`  ✓ ${commandsInstalled} commands generated`);
    } else {
      warn('No command adapter for this tool');
    }

    // Install hooks (Claude Code only)
    if (config.hooksSupported) {
      if (options.uninstall) {
        console.log(chalk.dim('  Removing hooks...'));
        try {
          await fs.rm(path.join(toolPath, 'hooks'), { recursive: true });
          await updateSettingsJsonHooks(toolPath, false);
          console.log(`  ✓ Hooks removed`);
        } catch {
          warn('Could not remove hooks directory');
        }
      } else {
        console.log(chalk.dim('  Installing hooks...'));
        const hooksSrc = path.join(PROJECT_ROOT, 'config', 'hooks');
        const hooksDest = path.join(toolPath, 'hooks');
        const hooksDirs = await countDirectories(hooksSrc);
        const hooksResult = await copyDirectory(hooksSrc, hooksDest, { overwrite, toolId });

        if (hooksResult.errors.length > 0) {
          warn(`Some hook files failed to copy:`);
          for (const err of hooksResult.errors) {
            console.log(chalk.dim(`    ${err}`));
          }
        }

        await updateSettingsJsonHooks(toolPath, true);
        console.log(`  ✓ ${hooksDirs} hooks copied`);
      }
    }

    // Update version file
    const versions = await readVersionFile(toolPath, toolId);
    versions['project-teams-spec'] = VERSION;
    versions['installed-at'] = new Date().toISOString();
    versions['installed-by'] = 'project-teams-spec CLI';
    await writeVersionFile(toolPath, toolId, versions);

    installSucceeded = true;
    console.log(chalk.green(`\n✓ ${config.name} ${options.uninstall ? 'uninstalled' : 'configured'} successfully!`));
  } catch (err: any) {
    error(`Installation failed: ${err.message}`);
    debug(`Error details: ${err.stack}`);

    // Rollback on failure
    if (backups.length > 0) {
      console.log(chalk.dim('\nRolling back changes...'));
      for (const backup of backups) {
        try {
          await fs.writeFile(backup.path, backup.content, 'utf-8');
        } catch {
          // Ignore rollback errors
        }
      }
    }

    return false;
  }

  return installSucceeded;
}

interface InstallStats {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

async function main() {
  const program = new Command();

  program
    .name('project-teams-spec')
    .description('Multi-Agent Engineering Spec - Install standardized norms to CLI tool directories')
    .version(VERSION);

  program
    .command('install')
    .description('Install project-teams-spec to target tools')
    .option('--tools <tools>', 'Comma-separated list of tools (claude,opencode,trae,continue,kiro)')
    .option('--diff', 'Only copy changed files')
    .option('--force', 'Overwrite existing files')
    .option('--dry-run', 'Show what would be done without making changes')
    .option('--log-level <level>', 'Set log level (quiet, normal, verbose, debug)', 'normal')
    .option('--retry <n>', 'Number of retry attempts on failure', '2')
    .option('--validate', 'Run pre-installation validation', false)
    .action(async (options) => {
      const stats: InstallStats = { total: 0, succeeded: 0, failed: 0, skipped: 0 };
      let toolList: string[];

      if (options.tools) {
        // Use specified tools
        toolList = options.tools.split(',').map((t: string) => t.trim().toLowerCase());
      } else {
        // Interactive mode - show welcome and tool selection
        await showWelcomeScreen();

        const { selectTools } = await import('./prompts/tool-select.js');
        toolList = await selectTools();

        if (toolList.length === 0) {
          console.log(chalk.dim('No tools selected. Exiting.'));
          return;
        }
      }

      stats.total = toolList.length;

      console.log(chalk.bold('═'.repeat(50)));
      console.log(chalk.bold('  project-teams-spec installer'));
      console.log(chalk.bold('═'.repeat(50)));
      console.log(chalk.dim(`Project root: ${process.cwd()}`));
      console.log(chalk.dim(`Tools: ${toolList.join(', ')}`));
      console.log(chalk.dim(`Mode: ${options.dryRun ? chalk.yellow('DRY RUN') : options.diff ? chalk.cyan('DIFF') : chalk.green('FULL')}`));
      console.log(chalk.dim(`Log level: ${options.logLevel}`));
      console.log(chalk.bold('═'.repeat(50)));

      for (const toolId of toolList) {
        let attempts = 0;
        const maxRetries = parseInt(options.retry) || 2;
        let success = false;

        while (attempts < maxRetries && !success) {
          attempts++;
          if (attempts > 1) {
            info(`Retry attempt ${attempts}/${maxRetries}...`);
          }

          success = await installToTool(toolId, {
            tools: toolList,
            diff: options.diff || false,
            uninstall: false,
            force: options.force || false,
            dryRun: options.dryRun || false,
            logLevel: options.logLevel || 'normal',
            retry: maxRetries,
            preValidate: options.validate || false,
          });

          if (success) {
            stats.succeeded++;
          } else if (attempts < maxRetries) {
            warn(`Retrying after failure...`);
          }
        }

        if (!success) {
          stats.failed++;
        }
      }

      // Print summary
      console.log(chalk.bold('\n' + '═'.repeat(50)));
      console.log(chalk.bold('  Installation Summary'));
      console.log(chalk.bold('═'.repeat(50)));
      console.log(chalk.green(`  Succeeded: ${stats.succeeded}/${stats.total}`));
      if (stats.failed > 0) {
        console.log(chalk.red(`  Failed: ${stats.failed}/${stats.total}`));
      }
      console.log(chalk.bold('═'.repeat(50)));

      if (stats.failed > 0) {
        process.exit(1);
      }
    });

  program
    .command('uninstall')
    .description('Uninstall project-teams-spec from target tools')
    .option('--tools <tools>', 'Comma-separated list of tools (claude,opencode,trae,continue,kiro)')
    .option('--dry-run', 'Show what would be done without making changes')
    .option('--force', 'Skip confirmation prompt')
    .action(async (options) => {
      const toolList = (options.tools || 'claude').split(',').map((t: string) => t.trim().toLowerCase());

      if (!options.force) {
        const { confirm } = await import('@inquirer/prompts');
        const confirmed = await confirm({
          message: `Uninstall from ${toolList.join(', ')}? This will remove all project-teams-spec files.`,
          default: false,
        });
        if (!confirmed) {
          console.log(chalk.dim('Cancelled.'));
          return;
        }
      }

      console.log(chalk.bold('═'.repeat(50)));
      console.log(chalk.bold('  project-teams-spec uninstaller'));
      console.log(chalk.bold('═'.repeat(50)));

      for (const toolId of toolList) {
        await installToTool(toolId, {
          tools: toolList,
          diff: false,
          uninstall: true,
          force: true,
          dryRun: options.dryRun || false,
          logLevel: 'normal',
          retry: 1,
          preValidate: false,
        });
      }
    });

  program
    .command('list')
    .description('List available and installed tools')
    .option('--verbose', 'Show detailed information')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const tools = Object.entries(TOOL_DIRECTORIES).map(([id, config]) => ({
        id,
        name: config.name,
        directory: config.dir,
        hooksSupported: config.hooksSupported,
        installed: isToolInstalled(id),
        adapter: config.adapter,
      }));

      if (options.json) {
        console.log(JSON.stringify(tools, null, 2));
        return;
      }

      console.log(chalk.bold('\nAvailable Tools:\n'));
      console.log(chalk.dim('─'.repeat(70)));
      console.log(`${chalk.bold('Name'.padEnd(15))} ${chalk.bold('Directory'.padEnd(15))} ${chalk.bold('Status'.padEnd(12))} ${chalk.bold('Adapter')}`);
      console.log(chalk.dim('─'.repeat(70)));

      for (const tool of tools) {
        const status = tool.installed
          ? chalk.green('● INSTALLED')
          : chalk.dim('○ NOT INSTALLED');
        const hooks = tool.hooksSupported ? chalk.yellow('[hooks]') : '';
        console.log(
          `${tool.name.padEnd(15)} ${tool.directory.padEnd(15)} ${status.padEnd(12)} ${tool.adapter} ${hooks}`
        );

        if (options.verbose && tool.installed) {
          try {
            const toolPath = await getToolPath(tool.id);
            if (toolPath) {
              const versions = await readVersionFile(toolPath, tool.id);
              console.log(chalk.dim(`    Version: ${versions['project-teams-spec'] || 'unknown'}`));
              console.log(chalk.dim(`    Installed: ${versions['installed-at'] || 'unknown'}`));
            }
          } catch {
            // Ignore verbose errors
          }
        }
      }

      console.log(chalk.dim('─'.repeat(70)));
      console.log(chalk.dim('\nTip: Run "project-teams-spec install" to configure tools in current project'));
    });

  program
    .command('validate')
    .description('Validate installation for target tools')
    .option('--tools <tools>', 'Comma-separated list of tools to validate')
    .action(async (options) => {
      const toolList = (options.tools || 'claude').split(',').map((t: string) => t.trim().toLowerCase());

      console.log(chalk.bold('\nValidating installations...\n'));

      for (const toolId of toolList) {
        const validation = await preValidate(toolId);
        const config = TOOL_DIRECTORIES[toolId];

        if (config) {
          console.log(chalk.bold(`${config.name}:`));
          if (validation.valid) {
            console.log(chalk.green('  ✓ Validation passed'));
          } else {
            console.log(chalk.red('  ✗ Validation failed:'));
            for (const err of validation.errors) {
              console.log(chalk.red(`    - ${err}`));
            }
          }

          if (validation.warnings.length > 0) {
            for (const warnMsg of validation.warnings) {
              console.log(chalk.yellow(`    ⚠ ${warnMsg}`));
            }
          }
        } else {
          console.log(chalk.red(`Unknown tool: ${toolId}`));
        }
        console.log();
      }
    });

  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error(chalk.red('Error:'), err.message);
  debug(`Stack trace: ${err.stack}`);
  process.exit(1);
});