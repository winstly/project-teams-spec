# SKILL: project-explore

## Metadata
name: project-explore
version: 1.0.0
granularity: intent
type: internal
phase: 1

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
  - name: user_description
    type: string
    description: User's description of the project (optional)
    required: false

## Output
output:
  - name: PROJECT.md
    type: file
    path: {{SPEC_DIR}}/SPEC.md
    description: Project analysis document containing tech stack, module structure, and architecture description

  - name: matched_rules
    type: data
    description: List of matched project-level rules

  - name: matched_agents
    type: data
    description: List of Agents matched by tech stack

  - name: tech_stack
    type: data
    description: Identified tech stack information

## Steps
steps:
  - id: scan-project
    description: Scan project root directory and key configuration files
    type: internal

  - id: identify-tech-stack
    description: Identify tech stack (frontend frameworks, backend languages, databases, middleware, etc.)
    type: internal

  - id: analyze-modules
    description: Analyze module structure (directory hierarchy, dependencies, module boundaries)
    type: internal

  - id: match-agents
    description: Match appropriate Agents based on tech stack
    type: internal

  - id: match-rules
    description: Match applicable rules based on project characteristics
    type: internal

  - id: generate-project-md
    description: Generate PROJECT.md project analysis document
    type: internal

## Checkpoint
checkpoint:
  required: true
  message: "Project analysis complete. Please confirm whether PROJECT.md accurately reflects the project structure and requirements. Adjustments can be made at this stage."

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-project-explore-complete
      action: notify-master

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
