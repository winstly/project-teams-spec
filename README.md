# project-teams-spec

A multi-agent engineering specification execution system. Provides standardized Skill definitions, Agent definitions, and rule sets that can be injected into CLI tool directories, enabling tools to collaborate in a unified paradigm to achieve business goals.

## Features

- **Standardized Workflow**: 9 standard Skills covering the complete flow from project analysis to delivery archival
- **Multi-Agent Collaboration**: Supports Java, Frontend, Backend, QA, Code Reviewer and other Agents
- **Multi-Tool Support**: Compatible with Claude Code, OpenCode, Trae and other CLI tools
- **Command Generation**: Auto-generates namespaced commands (e.g., `/pts:full-analysis`)
- **Interactive Installation**: Welcome screen + tool multi-select, ready to use out of the box
- **Flexible Granularity**: INSTRUCTIONS support intent/procedural/protocol/conversational granularity

## Architecture

```
project-teams-spec/
├── src/
│   ├── install.ts                    # Installation script
│   ├── __tests__/runner.js           # Unit tests
│   ├── core/
│   │   ├── command-generation/       # Command generation module
│   │   │   ├── types.ts              # Type definitions
│   │   │   ├── registry.ts           # Adapter registry
│   │   │   ├── generator.ts          # Command generator
│   │   │   └── adapters/             # Tool adapters
│   │   └── command-templates.ts      # Command content templates
│   ├── prompts/
│   │   └── tool-select.ts            # Tool selector
│   └── ui/
│       └── welcome.ts                # Welcome screen
├── config/
│   ├── skills/                       # 9 standard Skills
│   ├── agents/                      # 5 Agent definitions
│   ├── rules/                        # Rule files
│   ├── hooks/                        # Claude Code Hook scripts
│   └── commands/                     # Command templates
├── bin/
│   └── cli.js                        # CLI entry point
└── openspec/
    └── changes/                      # OpenSpec change management
```

## Quick Start

### Installation

```bash
# Clone the project
git clone https://github.com/your-org/project-teams-spec.git
cd project-teams-spec

# Install dependencies
npm install

# Link globally
npm link
```

### Use the CLI

```bash
# Interactive installation (shows welcome screen + tool selection)
project-teams-spec install

# Install to specific tools
project-teams-spec install --tools claude,opencode

# Force overwrite
project-teams-spec install --tools claude --force

# Preview installation
project-teams-spec install --tools claude --dry-run

# List tool status
project-teams-spec list

# Uninstall
project-teams-spec uninstall --tools claude
```

### Invoke Commands

After installation, use slash commands in Claude Code:

```bash
/pts:full-analysis    # Complete project analysis
/pts:plan-cycle       # Planning cycle
/pts:execution-cycle  # Execution cycle
```

## Supported Tools

| Tool | Project Directory | Command Invocation |
|------|-------------------|-------------------|
| Claude Code | `.claude/` | `/pts:<command>` |
| OpenCode | `.opencode/` | `/pts-<command>` |
| Trae | `.trae/` | `/pts-<command>` |
| Continue | `.continue/` | TBD |
| Kiro | `.kiro/` | TBD |

## Command System

### Command Generation

Commands are auto-generated via the `src/core/command-generation/` module, supporting multi-tool adapters:

| Tool | Path | Invocation |
|------|------|------------|
| Claude Code | `.claude/commands/pts/<id>.md` | `/pts:full-analysis` |
| OpenCode | `.opencode/commands/pts-<id>.md` | `/pts-full-analysis` |
| Trae | `.trae/commands/pts-<id>.md` | `/pts-full-analysis` |

### Available Commands

| Command | Description |
|----------|-------------|
| `/pts:full-analysis` | Complete project analysis workflow |
| `/pts:plan-cycle` | Planning cycle: task claiming → plan validation |
| `/pts:execution-cycle` | Execution cycle: task execution → delivery archival |

## Skills Overview

| Skill | Phase | Granularity | Description |
|-------|-------|------------|-------------|
| pts-project-explore | 1 | intent | Analyze project structure |
| pts-complexity-evaluate | 2 | procedural | Evaluate complexity |
| pts-agent-claim | 3 | protocol | Assign tasks |
| pts-issue-aggregate | 4 | conversational | Aggregate issues |
| pts-plan-develop | 5 | intent | Develop execution plan |
| pts-plan-validate | 6 | procedural | Review and validate plan |
| pts-task-execute | 7 | protocol | Execute tasks |
| pts-qa-verify | 8 | protocol | Quality verification |
| pts-delivery-close | 9 | procedural | Delivery and archival |

## Agents

- **java-agent**: Java backend development expert
- **frontend-agent**: Frontend development expert
- **backend-agent**: Backend architecture expert
- **qa-agent**: Quality verification expert
- **code-reviewer**: Code review expert

## Directory Structure After Installation

After installation, the target directory will contain:

```
.claude/
├── skills/                         # Skill definitions
│   ├── pts-project-explore/
│   ├── pts-complexity-evaluate/
│   ├── pts-agent-claim/
│   └── ...
├── agents/                         # Agent definitions
│   ├── java-agent/
│   ├── frontend-agent/
│   └── ...
├── rules/                         # Rule sets
├── hooks/                         # Hook scripts (Claude Code only)
│   ├── on-subagent-start.sh
│   ├── on-subagent-stop.sh
│   └── ...
├── commands/
│   └── pts/                       # Command definitions (with namespace)
│       ├── full-analysis.md
│       ├── plan-cycle.md
│       └── execution-cycle.md
└── .project-teams-spec-*-version  # Version tracking
```

## Interactive Installation

Running `project-teams-spec install` (without arguments) starts interactive installation:

1. **Welcome Screen**: Shows project info and feature introduction
2. **Tool Selection**: Use spacebar to select tools to install to
3. **Confirm Installation**: Press Enter to confirm

```
================================================
  project-teams-spec
  Multi-Agent Engineering Spec System
================================================

This setup will configure:
  - Skills (9 standard workflow phases)
  - Agents (Java, Frontend, Backend, QA, Reviewer)
  - Rules (architecture, coding standards, naming)
  - Hooks (Claude Code integration)

Press Enter to select tools...
```

## Troubleshooting

### Windows Environment Requirements

**Important:** Hooks scripts require a Unix-like shell environment on Windows:

- **Supported:** Git Bash, MSYS2, WSL (Windows Subsystem for Linux)
- **Not Supported:** Pure Windows CMD or PowerShell (hooks will not execute)

If you encounter hook-related errors on Windows, ensure you are using Git Bash or a compatible shell.

### Command Not Available

If `/pts:` commands are not available:

1. Verify `project-teams-spec install` has been run
2. Check if `.claude/commands/pts/` directory exists
3. Restart Claude Code

### Permission Issues

```bash
# Check directory permissions
ls -la .claude

# Fix permissions (if needed)
chmod 755 .claude
```

### Version Conflicts

If a previous version was installed:

```bash
# Force overwrite installation
project-teams-spec install --tools claude --force
```

## Documentation

- [CLAUDE.md](CLAUDE.md) - Project architecture details
- [openspec/changes/](openspec/changes/) - OpenSpec change management

## License

MIT
