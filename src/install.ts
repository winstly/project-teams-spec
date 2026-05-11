/**
 * Installation Script
 *
 * Installs project-teams-spec norms to target CLI tool directories.
 *
 * Usage:
 *   project-teams-spec install
 *   project-teams-spec install --tools claude,opencode
 *   project-teams-spec install --tools claude --force
 *   project-teams-spec uninstall --tools claude
 *   project-teams-spec list
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import {
  CommandAdapterRegistry,
  generateCommands,
  claudeAdapter,
  opencodeAdapter,
  traeAdapter,
} from './core/command-generation/index.js';
import { getCommandContents } from './core/command-templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
const VERSION = packageJson.version;

// Register command adapters
CommandAdapterRegistry.register(claudeAdapter);
CommandAdapterRegistry.register(opencodeAdapter);
CommandAdapterRegistry.register(traeAdapter);

// Tool directory mappings
const TOOL_DIRECTORIES: Record<string, { dir: string; name: string; hooksSupported: boolean }> = {
  claude: { dir: '.claude', name: 'Claude Code', hooksSupported: true },
  opencode: { dir: '.opencode', name: 'OpenCode', hooksSupported: false },
  trae: { dir: '.trae', name: 'Trae', hooksSupported: false },
  continue: { dir: '.continue', name: 'Continue', hooksSupported: false },
  kiro: { dir: '.kiro', name: 'Kiro', hooksSupported: false },
};

interface InstallOptions {
  tools: string[];
  diff: boolean;
  uninstall: boolean;
  force: boolean;
  dryRun: boolean;
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

async function copyDirectory(src: string, dest: string, options?: { overwrite?: boolean; toolId?: string }): Promise<string[]> {
  const copied: string[] = [];
  const { overwrite = true, toolId } = options || {};

  try {
    await fs.mkdir(dest, { recursive: true });
  } catch (err: any) {
    if (err.code !== 'EEXIST') throw err;
  }

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const subCopied = await copyDirectory(srcPath, destPath, options);
      copied.push(...subCopied);
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
        copied.push(path.relative(src, srcPath));
      } catch (err) {
        console.warn(`  Warning: Could not copy ${srcPath} -> ${destPath}: ${err}`);
      }
    }
  }

  return copied;
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

async function installToTool(toolId: string, options: InstallOptions): Promise<void> {
  const config = TOOL_DIRECTORIES[toolId];
  if (!config) {
    console.error(`Unknown tool: ${toolId}`);
    return;
  }

  console.log(`\n${options.uninstall ? 'Uninstalling from' : 'Installing to'} ${config.name}...`);

  const toolPath = await getToolPath(toolId);
  if (!toolPath) {
    console.warn(`  [WARN] ${config.name} path could not be determined`);
    return;
  }

  console.log(`  Target: ${toolPath}`);

  if (options.dryRun) {
    console.log('  [DRY RUN] Would copy:');
    console.log('    - config/skills/ -> skills/');
    console.log('    - config/agents/ -> agents/');
    console.log('    - config/rules/ -> rules/');
    if (config.hooksSupported && !options.uninstall) {
      console.log('    - config/hooks/ -> hooks/');
      console.log('    - Update settings.json hooks');
    }
    console.log('  [DRY RUN] Would generate commands');
    console.log('  [DRY RUN] Would update version file');
    return;
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
        console.log('  Skipped.');
        return;
      }
      overwrite = true;
    }
  }

  // Install skills
  console.log('  Copying skills...');
  const skillsSrc = path.join(PROJECT_ROOT, 'config', 'skills');
  const skillsDest = path.join(toolPath, 'skills');
  const skillsCopied = await copyDirectory(skillsSrc, skillsDest, { overwrite, toolId });
  console.log(`    [OK] ${skillsCopied.length} skill files copied`);

  // Install agents
  console.log('  Copying agents...');
  const agentsSrc = path.join(PROJECT_ROOT, 'config', 'agents');
  const agentsDest = path.join(toolPath, 'agents');
  const agentsCopied = await copyDirectory(agentsSrc, agentsDest, { overwrite });
  console.log(`    [OK] ${agentsCopied.length} agent files copied`);

  // Install rules
  console.log('  Copying rules...');
  const rulesSrc = path.join(PROJECT_ROOT, 'config', 'rules');
  const rulesDest = path.join(toolPath, 'rules');
  const rulesCopied = await copyDirectory(rulesSrc, rulesDest, { overwrite, toolId });
  console.log(`    [OK] ${rulesCopied.length} rule files copied`);

  // Install commands using command generation
  console.log('  Generating commands...');
  const adapter = CommandAdapterRegistry.get(toolId);
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
    console.log(`    [OK] ${commandsInstalled} commands generated`);
  } else {
    console.log('    [SKIP] No command adapter for this tool');
  }

  // Install hooks (Claude Code only in Phase 1)
  if (config.hooksSupported) {
    if (options.uninstall) {
      console.log('  Removing hooks...');
      try {
        await fs.rm(path.join(toolPath, 'hooks'), { recursive: true });
        await updateSettingsJsonHooks(toolPath, false);
        console.log('    [OK] Hooks removed');
      } catch {
        console.warn('    [WARN] Could not remove hooks directory');
      }
    } else {
      console.log('  Installing hooks...');
      const hooksSrc = path.join(PROJECT_ROOT, 'config', 'hooks');
      const hooksDest = path.join(toolPath, 'hooks');
      const hooksCopied = await copyDirectory(hooksSrc, hooksDest, { overwrite, toolId });
      console.log(`    [OK] ${hooksCopied.length} hook files copied`);

      await updateSettingsJsonHooks(toolPath, true);
      console.log('    [OK] settings.json updated');
    }
  }

  // Update version file
  const versions = await readVersionFile(toolPath, toolId);
  versions['project-teams-spec'] = VERSION;
  versions['installed-at'] = new Date().toISOString();
  await writeVersionFile(toolPath, toolId, versions);
  console.log('  [OK] Version file updated');

  console.log(`\n${config.name} ${options.uninstall ? 'uninstalled' : 'configured'} successfully!`);
}

async function main() {
  const program = new Command();

  program
    .name('project-teams-spec')
    .description('Multi-Agent Engineering Spec - Install standardized norms to CLI tool directories')
    .version('1.0.0');

  program
    .command('install')
    .description('Install project-teams-spec to target tools')
    .option('--tools <tools>', 'Comma-separated list of tools (claude,opencode,trae,continue,kiro)')
    .option('--diff', 'Only copy changed files')
    .option('--force', 'Overwrite existing files')
    .option('--dry-run', 'Show what would be done without making changes')
    .action(async (options) => {
      let toolList: string[];

      if (options.tools) {
        // Use specified tools
        toolList = options.tools.split(',').map((t: string) => t.trim().toLowerCase());
      } else {
        // Interactive mode - show welcome and tool selection
        const { showWelcomeScreen } = await import('./ui/welcome.js');
        await showWelcomeScreen();

        const { selectTools } = await import('./prompts/tool-select.js');
        toolList = await selectTools();
      }

      console.log('='.repeat(50));
      console.log('  project-teams-spec installer');
      console.log('='.repeat(50));
      console.log(`Project root: ${process.cwd()}`);
      console.log(`Tools: ${toolList.join(', ')}`);
      console.log(`Mode: ${options.dryRun ? 'DRY RUN' : options.diff ? 'DIFF' : 'FULL'}`);
      console.log('='.repeat(50));

      for (const toolId of toolList) {
        await installToTool(toolId, {
          tools: toolList,
          diff: options.diff || false,
          uninstall: false,
          force: options.force || false,
          dryRun: options.dryRun || false,
        });
      }
    });

  program
    .command('uninstall')
    .description('Uninstall project-teams-spec from target tools')
    .option('--tools <tools>', 'Comma-separated list of tools (claude,opencode,trae,continue,kiro)')
    .option('--dry-run', 'Show what would be done without making changes')
    .action(async (options) => {
      const toolList = (options.tools || 'claude').split(',').map((t: string) => t.trim().toLowerCase());

      console.log('='.repeat(50));
      console.log('  project-teams-spec uninstaller');
      console.log('='.repeat(50));

      for (const toolId of toolList) {
        await installToTool(toolId, {
          tools: toolList,
          diff: false,
          uninstall: true,
          force: true,
          dryRun: options.dryRun || false,
        });
      }
    });

  program
    .command('list')
    .description('List available and installed tools')
    .action(async () => {
      console.log('Available tools:');
      console.log('');
      for (const [id, config] of Object.entries(TOOL_DIRECTORIES)) {
        const installed = isToolInstalled(id);
        const status = installed ? '[INSTALLED]' : '[--]      ';
        console.log(`  ${id.padEnd(12)} ${config.name.padEnd(15)} ${status}`);
      }
      console.log('');
      console.log('Tip: Run "project-teams-spec install" to set up tools in current project');
    });

  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
