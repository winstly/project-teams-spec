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

- **Standardized Workflow**: 12 Skills covering the complete flow from project analysis to delivery archival
- **Milestone-Based Delivery**: Iterative delivery with user checkpoints for large/complex projects
- **Multi-Agent Collaboration**: Supports Java, Frontend, Backend, QA, Code Reviewer and other Agents
- **Multi-Tool Support**: Compatible with Claude Code, OpenCode, Trae and other CLI tools
- **Command Generation**: Auto-generates namespaced commands (e.g., `/pts:analyze`)
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
/pts:analyze    # Project analysis and requirement clarification
/pts:plan        # Agent matching and execution plan
/pts:execute     # Task execution and delivery
```

### Workflow Flow

```
/pts:analyze → /pts:plan → /pts:execute
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PTS WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ ANALYZE     │───▶│  PLAN        │───▶│  EXECUTE     │     │
│  │ CYCLE       │    │  CYCLE       │    │  CYCLE       │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                   │
│     /pts:analyze          /pts:plan           /pts:execute       │
│                                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                      Core Skills (12 phases)                        │
│                                                                   │
│  Analyze Cycle (Phases 1-3)                                       │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │project-explore│complexity-eval│requirement-  │                │
│  │  (phase 1)  │  (phase 2)   │  clarify (3) │                │
│  └──────────────┴──────────────┴──────────────┘                │
│                                                                   │
│  Plan Cycle (Phases 4-8)                                         │
│  ┌──────────────┬──────────────┬──────────────┬──────────┬─────┐│
│  │agent-match  │pyramid-      │master-       │plan-     │plan-││
│  │  (phase 4) │  analyze(5)  │  summarize(6) │develop(7)│val(8)││
│  └──────────────┴──────────────┴──────────────┴──────────┴─────┘│
│                                                                   │
│  Execute Cycle (Phases 9-12)                                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐   │
│  │norm-load    │task-execute │qa-verify    │delivery-    │   │
│  │  (phase 9) │  (phase 10) │  (phase 11) │  close(12)  │   │
│  └──────────────┴──────────────┴──────────────┴──────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────────┘
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
│   ├── skills/                       # 12 Skills (sequential phases 1-12)
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
| Claude Code | `.claude/commands/pts/<id>.md` | `/pts:analyze` |
| OpenCode | `.opencode/commands/pts-<id>.md` | `/pts-analyze` |
| Trae | `.trae/commands/pts-<id>.md` | `/pts-analyze` |

### Available Commands

| Command | Description |
|----------|-------------|
| `/pts:analyze` | Project analysis and requirement clarification |
| `/pts:plan` | Agent matching and execution plan |
| `/pts:execute` | Task execution and delivery |

## Skills Overview

### Core Workflow Skills (12 phases)

| Skill | Phase | Granularity | Description |
|-------|-------|------------|-------------|
| pts-project-explore | 1 | intent | Scan and analyze project |
| pts-complexity-evaluate | 2 | procedural | Evaluate complexity |
| pts-requirement-clarify | 3 | intent | Clarify requirements (5W1H) |
| pts-agent-match | 4 | intent | Transparent agent selection |
| pts-pyramid-analyze | 5 | intent | Pyramid change analysis |
| pts-master-summarize | 6 | intent | Aggregate and summarize |
| pts-plan-develop | 7 | intent | Develop execution plan |
| pts-plan-validate | 8 | procedural | Review and validate plan |
| pts-norm-load | 9 | procedural | Load rules context |
| pts-task-execute | 10 | protocol | Execute tasks with subagents |
| pts-qa-verify | 11 | protocol | Quality verification |
| pts-delivery-close | 12 | procedural | Delivery and archival |

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
├── skills/                         # Skill definitions (12 skills)
│   ├── pts-project-explore/
│   ├── pts-complexity-evaluate/
│   ├── pts-requirement-clarify/
│   ├── pts-agent-match/
│   ├── pts-pyramid-analyze/
│   ├── pts-master-summarize/
│   ├── pts-plan-develop/
│   ├── pts-plan-validate/
│   ├── pts-norm-load/
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
│       ├── analyze-cycle.md
│       ├── plan-cycle.md
│       └── execute-cycle.md
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