# SKILL: project-explore
---
name: project-explore
version: 1.1.0
granularity: intent
type: internal
phase: 1
description: Scan and analyze project structure, identify tech stack, match appropriate Agents and rules based on project characteristics.
triggers:
  - "analyze project"
  - "scan project"
  - "project exploration"
  - "explore project structure"
  - "understand the codebase"
tags:
  - analysis
  - project-scanning
  - agent-matching
  - tech-stack-identification
---

## Preconditions
preconditions:
  - User has provided a project description or project path
  - User intends to perform project analysis or structure exploration

## Input
input:
  - name: project_path
    type: string
    description: Root directory path of the project
    required: true
    example: "/path/to/project"

  - name: user_description
    type: string
    description: User's description of the project (optional)
    required: false
    example: "A React-based e-commerce platform"

## Output
output:
  - name: PROJECT.md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document containing tech stack, module structure, and architecture description
    format: markdown
    notes: |
      Template location: {{RULES_DIR}}/SPEC.md.template
      Each project gets its own SPEC.md in the project subdirectory

  - name: matched_rules
    type: data[]
    description: List of matched project-level rules
    items:
      - rule_id: string
        rule_path: string
        match_reason: string

  - name: matched_agents
    type: data[]
    description: List of Agents matched by tech stack
    items:
      - agent_id: string
        agent_name: string
        match_reason: string
        confidence: float

  - name: tech_stack
    type: object
    description: Identified tech stack information
    properties:
      frontend: string[]
      backend: string[]
      database: string[]
      middleware: string[]
      build_tools: string[]

## Steps
steps:
  - id: scan-project
    description: Scan project root directory and key configuration files
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: identify-tech-stack
    description: Identify tech stack (frontend frameworks, backend languages, databases, middleware, etc.)
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: analyze-modules
    description: Analyze module structure (directory hierarchy, dependencies, module boundaries)
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: match-agents
    description: Match appropriate Agents based on tech stack
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: match-rules
    description: Match applicable rules based on project characteristics
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: generate-project-md
    description: Generate PROJECT.md project analysis document
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: initialize-whitepaper
    description: Initialize or update PROJECT_WHITEPAPER.md for the project portfolio
    type: internal
    continue_on_error: true
    timeout: 2m
    notes: |
      Whitepaper location: {{SPEC_DIR}}/PROJECT_WHITEPAPER.md (portfolio level)

      For new projects:
      1. If {{SPEC_DIR}}/PROJECT_WHITEPAPER.md doesn't exist, create from template
      2. Add project entry to portfolio whitepaper
      3. Record project metadata, tech stack, initial ADR

      For existing projects:
      1. Update project context section
      2. Record new ADRs if any
      3. Prepare for execution record

## Checkpoint
checkpoint:
  required: true
  message: "Project analysis complete. Generated PROJECT.md contains {file_count} files, identified tech stack: {tech_stack_summary}. Please confirm whether the analysis accurately reflects your project structure and requirements. You can request adjustments for: scan depth, tech stack emphasis, or module grouping."

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-project-explore-complete
      action: notify-master
      next_skill: complexity-evaluate

---

# INSTRUCTIONS

You are a project analysis expert. Execute this Skill when the user requests project analysis, project structure exploration, or preparation for development changes.

## Execution Guide

### Phase 1: Scan Project

Read the project root directory and identify key configuration files:

```
Common configuration files (by tech stack):
├── Frontend
│   ├── package.json          → npm/Node.js project
│   ├── tsconfig.json         → TypeScript configuration
│   ├── vite.config.ts       → Vite build
│   ├── next.config.js        → Next.js project
│   └── src/                  → Source code directory
│
├── Backend (Java)
│   ├── pom.xml               → Maven project
│   ├── build.gradle          → Gradle project
│   └── src/main/java/        → Java source directory
│
├── Backend (Go)
│   ├── go.mod                → Go module
│   └── src/                  → Go source directory
│
├── Database
│   ├── schema.sql            → SQL scripts
│   └── migrations/           → Database migrations
│
└── Configuration
    ├── .env                  → Environment variables
    ├── docker-compose.yml    → Docker orchestration
    └── .gitignore            → Git configuration
```

### Phase 2: Identify Tech Stack

Based on scan results, identify the tech stack used by the project:

| Tech Stack Type | Identification Method |
|----------------|----------------------|
| Frontend Framework | dependencies in package.json (React/Vue/Angular/Svelte) |
| Backend Language | pom.xml (Java), go.mod (Go), requirements.txt (Python) |
| Database | Connection strings in config files, Docker images |
| Build Tools | webpack/vite/esbuild (Frontend), Maven/Gradle (Java) |
| Middleware | Redis, Kafka, RabbitMQ and other service dependencies |

### Phase 3: Analyze Module Structure

Analyze the project's directory structure and module organization:

```
Analysis dimensions:
├── Directory depth: Whether the hierarchy is reasonable (recommended 3-5 levels)
├── Module organization: By function/domain or by type (files/components/styles)
├── Dependencies: Whether there are circular dependencies between modules
├── Shared code: How common components/utilities/types are extracted
└── Test structure: How test code is organized
```

### Phase 4: Match Agents

Match applicable Agents based on the identified tech stack:

```
Matching rules:
├── Java project (pom.xml)         → java-agent
├── Frontend React/Vue/Angular      → frontend-agent
├── Full-stack Web project (frontend + backend)  → frontend-agent + backend-agent
├── High test coverage project         → qa-agent
└── Code review requirements               → code-reviewer
```

### Phase 5: Match Rules

Match applicable rule sets based on project characteristics:

```
Matching rules:
├── Project with architecture docs           → architecture.md
├── Project with coding standards           → coding-standards.md
├── Project with naming conventions           → naming-conventions.md
└── New project without clear standards         → Use default rules from config/default/rules/
```

### Phase 6: Generate PROJECT.md

Generate the project analysis document, referencing the format in `assets/project-md-template.md`.

## Error Handling

| Error Type | Handling Strategy | Recovery Action |
|------------|-----------------|----------------|
| Path not found | Log warning, attempt root fallback | Use provided path or request clarification |
| Empty project | Document as new/empty project | Proceed with minimal analysis |
| Permission denied | Skip inaccessible paths, log | Continue with accessible files |
| Unknown tech stack | Document as "unknown" category | Include in matched_agents as manual selection needed |
| Circular dependencies detected | Document in output | Flag for user attention in checkpoint |

### Error Recovery Scenarios

1. **Project path invalid**: Ask user to verify path; offer to scan current directory
2. **No configuration files found**: Analyze source code structure directly; mark as "minimal config"
3. **Mixed tech stacks**: Document all identified stacks; prioritize by file count
4. **Read permission denied**: Skip restricted files; note in output

## Key Constraints

1. **Comprehensive analysis**: Do not overlook important tech stacks and modules
2. **Accurate identification**: Judge based on actual file content, do not guess
3. **Structured output**: PROJECT.md should be clear, readable, and modifiable
4. **Reasonable matching**: Agent and Rule matching must be well-founded

## Autonomous Decision Space

This Skill uses `intent` granularity, allowing you to autonomously decide how to scan and analyze the project. You can adjust based on project characteristics:

- Scan depth (simple projects can use shallow scanning)
- Analysis focus (legacy systems focus on dependencies, new projects focus on architecture)
- Module organization granularity (large systems can be grouped by domain)

However, the final output must be a structured PROJECT.md file.

### Phase 7: Initialize Whitepaper

After generating PROJECT.md, initialize the portfolio whitepaper:

```
Whitepaper initialization:
├── Check if {{SPEC_DIR}}/PROJECT_WHITEPAPER.md exists
├── If not, create from template (config/PROJECT_WHITEPAPER.md)
├── Add project entry to portfolio section
├── Record project metadata (name, version, tech stack)
└── Initialize project-specific execution records
```

**Portfolio Whitepaper** (location: `{{SPEC_DIR}}/PROJECT_WHITEPAPER.md`):

```markdown
# 工程白皮书

## 项目组合概览
| 项目名称 | 技术栈 | 复杂度 | 状态 |
|----------|--------|--------|------|
| {project_name} | {tech_stack} | {complexity} | 进行中 |

## 项目登记
### {project_name}
- **技术栈**: {tech_stack}
- **复杂度等级**: {complexity}
- **开始日期**: {YYYY-MM-DD}
- **执行记录**: 见 projects/{project_name}/archive/
```

**Key Constraints**:
1. Portfolio whitepaper is created once per project set: `{{SPEC_DIR}}/PROJECT_WHITEPAPER.md`
2. Each project gets its own directory: `{{SPEC_DIR}}/projects/{project_name}/`
3. Whitepaper is the single source of truth for project portfolio decisions