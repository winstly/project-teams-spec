# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Three-Phase Workflow Commands**
  - `analyze-cycle` (`/pts:analyze`): project-explore → complexity-evaluate → requirement-clarify
  - `plan-cycle` (`/pts:plan`): agent-match → pyramid-analyze → master-summarize → plan-develop → plan-validate
  - `execute-cycle` (`/pts:execute`): norm-load → task-execute → qa-verify → delivery-close
- **New Skills**: pts-agent-match, pts-pyramid-analyze, pts-master-summarize, pts-requirement-clarify

### Changed
- **Commands reorganized**: full-analysis deprecated, execution-cycle renamed to execute-cycle
- README.md enhanced with badges, architecture diagrams, and improved structure
- README_zh.md synchronized with English version improvements
- **Skill phase numbers**: Sequential 1-12 for workflow alignment

### Deprecated
- `/pts:full-analysis` → Use `/pts:analyze`
- `/pts:execution-cycle` → Use `/pts:execute`

### Fixed
- Documentation consistency between English and Chinese versions

## [1.1.0] - 2026-05-12

### Added
- **Milestone-based Iterative Delivery**
  - TaskDescriptor with `milestone` and `priority` fields
  - Milestone and MilestoneResult types for incremental delivery
  - `pts-task-execute` skill: milestone-checkpoint step with user confirmation
  - `pts-complexity-evaluate` skill: automatic delivery strategy generation

- **Delivery Strategy by Complexity**
  - S-level: Single delivery (1 milestone)
  - M-level: 2-3 milestones (Core → Features → Polish)
  - L-level: 4-6 milestones (Per-module delivery)
  - XL-level: 6+ milestones (Sprint iterations)

### Changed
- `execution-cycle` command: milestone-based execution flow
- Phase 2 (QA Verification): Per milestone verification
- Phase 3 (Delivery Closure): Per milestone delivery
- Hooks updated for milestone events

### Fixed
- Subagent dispatch: Updated SKILL.md and command templates with explicit Agent() tool calls
- TypeScript compilation errors in skill-executor modules

## [1.0.0] - 2026-05-12

### Added
- **Core System**
  - 9 standard Skills covering project analysis to delivery archival
  - 5 specialized Agents (java-agent, frontend-agent, backend-agent, qa-agent, code-reviewer)
  - Multi-tool support (Claude Code, OpenCode, Trae)

- **Skills**
  - `pts-project-explore`: Analyze project structure
  - `pts-complexity-evaluate`: Evaluate project complexity
  - `pts-agent-claim`: Assign tasks to agents
  - `pts-issue-aggregate`: Aggregate and clarify issues
  - `pts-plan-develop`: Develop execution plans
  - `pts-plan-validate`: Validate plans
  - `pts-task-execute`: Execute tasks with sub-agents
  - `pts-qa-verify`: Quality assurance verification
  - `pts-delivery-close`: Delivery and archival

- **Agents**
  - java-agent: Java backend development
  - frontend-agent: Frontend development
  - backend-agent: Backend architecture
  - qa-agent: Quality verification
  - code-reviewer: Code review

- **Features**
  - Command generation system with multi-tool adapters
  - Interactive CLI with welcome screen
  - Hook system for Claude Code integration
  - Rule-based configuration system

- **Documentation**
  - README.md (English)
  - README_zh.md (Chinese)
  - Architecture specifications
  - Coding standards

### Technical
- Built with TypeScript 5.0
- Node.js >= 18.0.0
- MIT License

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-05-12 | Initial release |

## Migration Guides

### Upgrading from v0.x to v1.0.0

[To be added when breaking changes are introduced]

## Deprecation Notices

[To be added when features are deprecated]

## Security Advisories

[To be added if security issues are reported]

---

**Legend**:
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities