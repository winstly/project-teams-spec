# project-teams-spec

[![npm version](https://img.shields.io/npm/v/project-teams-spec?style=flat-square)](https://www.npmjs.com/package/project-teams-spec)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)

A multi-agent engineering specification execution system. Provides standardized Skill definitions, Agent definitions, and rule sets that can be injected into CLI tool directories, enabling tools to collaborate in a unified paradigm to achieve business goals.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Supported Tools](#supported-tools)
- [Command System](#command-system)
- [Skills Overview](#skills-overview)
- [Agents](#agents)
- [Directory Structure](#directory-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Features

- **Standardized Workflow**: 9 standard Skills covering the complete flow from project analysis to delivery archival
- **Multi-Agent Collaboration**: Supports Java, Frontend, Backend, QA, Code Reviewer and other Agents
- **Multi-Tool Support**: Compatible with Claude Code, OpenCode, Trae and other CLI tools
- **Command Generation**: Auto-generates namespaced commands (e.g., `/pts:full-analysis`)
- **Interactive Installation**: Welcome screen + tool multi-select, ready to use out of the box
- **Flexible Granularity**: INSTRUCTIONS support intent/procedural/protocol/conversational granularity

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install globally via npm
npm install -g project-teams-spec

# Or use npx directly
npx project-teams-spec install
```

### Interactive Installation

```bash
# Run without arguments for interactive mode
project-teams-spec install
```

This will show a welcome screen and let you select which tools to install to (Claude Code, OpenCode, Trae, etc.).

### Install to Specific Tools

```bash
# Install to Claude Code
project-teams-spec install --tools claude

# Install to multiple tools
project-teams-spec install --tools claude,opencode,trae

# Force overwrite existing installation
project-teams-spec install --tools claude --force

# Preview what would be installed
project-teams-spec install --tools claude --dry-run
```

### Other Commands

```bash
# List installed tools and status
project-teams-spec list

# Uninstall from specific tools
project-teams-spec uninstall --tools claude
```

### Invoke Commands

After installation, use slash commands in your CLI tool:

```bash
/pts:full-analysis    # Complete project analysis
/pts:plan-cycle       # Planning cycle
/pts:execution-cycle  # Execution cycle
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Master (CLI Tool)                          │
│                     project-teams-spec system                      │
├─────────────────────────────────────────────────────────────────────┤
│                           Skills (9 phases)                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐          │
│  │explore  │complexity │ claim    │aggregate │plan-dev  │          │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤          │
│  │plan-val │execute   │qa-verify │delivery  │          │          │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘          │
├─────────────────────────────────────────────────────────────────────┤
│              Agents (5 specialized agents)                         │
│  ┌─────────┬──────────┬──────────┬─────────┬──────────┐            │
│  │  java   │ frontend  │ backend  │   qa    │ reviewer │            │
│  │ agent   │  agent    │  agent   │ agent   │          │            │
│  └─────────┴──────────┴──────────┴─────────┴──────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│                        Rules / Hooks / Commands                     │
└─────────────────────────────────────────────────────────────────────┘

Workflow:
  ┌────────────┐     ┌────────────┐     ┌────────────┐
  │   Phase    │────▶│   Phase    │────▶│   Phase    │
  │   N-1      │     │     N      │     │   N+1      │
  └────────────┘     └────────────┘     └────────────┘
```

### Project Source Structure

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
│   ├── agents/                       # 5 Agent definitions
│   ├── rules/                        # Rule files
│   ├── hooks/                        # Claude Code Hook scripts
│   └── commands/                     # Command templates
├── bin/
│   └── cli.js                        # CLI entry point
└── openspec/
    └── changes/                     # OpenSpec change management
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
| `/pts:plan-cycle` | Planning cycle: task claiming, plan validation |
| `/pts:execution-cycle` | Execution cycle: task execution, delivery archival |

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

### Granularity Types

| Granularity | Description |
|-------------|-------------|
| `intent` | Autonomous decision-making based on goals |
| `procedural` | Step-by-step execution with clear procedures |
| `protocol` | Strict protocol-based coordination |
| `conversational` | Interactive dialogue and clarification |

## Agents

| Agent | Role | Expertise |
|-------|------|----------|
| java-agent | Java backend development expert | Java, Spring, Maven/Gradle |
| frontend-agent | Frontend development expert | React, Vue, Angular, TypeScript |
| backend-agent | Backend architecture expert | Microservices, APIs, Architecture |
| qa-agent | Quality verification expert | Testing, QA, Verification |
| code-reviewer | Code review expert | Code quality, Best practices |

## Directory Structure

### Installation Output

After installation, the target directory will contain:

```
.claude/
├── skills/                         # Skill definitions
│   ├── pts-project-explore/
│   ├── pts-complexity-evaluate/
│   ├── pts-agent-claim/
│   ├── pts-issue-aggregate/
│   ├── pts-plan-develop/
│   ├── pts-plan-validate/
│   ├── pts-task-execute/
│   ├── pts-qa-verify/
│   └── pts-delivery-close/
├── agents/                         # Agent definitions
│   ├── java-agent/
│   ├── frontend-agent/
│   ├── backend-agent/
│   ├── qa-agent/
│   └── code-reviewer/
├── rules/                         # Rule sets
│   ├── architecture.md
│   ├── coding-standards.md
│   └── naming-conventions.md
├── hooks/                         # Hook scripts (Claude Code only)
│   ├── on-subagent-start.sh
│   ├── on-subagent-stop.sh
│   ├── on-session-end.sh
│   ├── on-task-created.sh
│   └── on-task-completed.sh
├── commands/
│   └── pts/                       # Command definitions (with namespace)
│       ├── full-analysis.md
│       ├── plan-cycle.md
│       └── execution-cycle.md
└── .project-teams-spec-*-version  # Version tracking file
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
3. Restart your CLI tool

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

### Installation Fails

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Clean npm cache
npm cache clean --force

# Try with verbose output
npm install -g project-teams-spec --verbose
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/project-teams-spec.git
cd project-teams-spec

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Link for local development
npm link
```

### Code Style

This project follows the coding standards defined in `config/rules/`:

- 2 spaces for config files, 4 spaces for code
- kebab-case for file names
- UpperCamelCase for class names
- lowerCamelCase for function names

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## Documentation

- [CLAUDE.md](CLAUDE.md) - Project architecture details
- [openspec/changes/](openspec/changes/) - OpenSpec change management

## License

MIT License - see [LICENSE](LICENSE) for details.