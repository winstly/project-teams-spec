# General Coding Standards

This document defines the general coding standards for the project-teams-spec system, applicable to all code and configuration files.

## Code Style

### Formatting
- Indentation: 2 spaces (config files), 4 spaces (code)
- Line length: Maximum 120 characters
- Line endings: Unix style (LF)

### Naming
- File names: kebab-case (e.g., `my-file.md`)
- Config keys: kebab-case (e.g., `my-key`)
- Function names: lowerCamelCase (e.g., `myFunction`)
- Class names: UpperCamelCase (e.g., `MyClass`)
- Constants: UPPER_SNAKE_CASE (e.g., `MY_CONSTANT`)

### Comments
- Use `#` as comment symbol (Markdown files)
- Use `//` as comment symbol (code files)
- Keep comments concise, explain "why" not "what"

## Markdown Standards

### Heading Levels
```
# H1 - Document Title
## H2 - Major Sections
### H3 - Subsections
#### H4 - Details
```

### Lists
- Use `-` for unordered list markers
- Use `1.` for ordered list markers (only when order matters)
- Nesting should not exceed 3 levels

### Code Blocks
- Language markers: ` ```yaml ``` ` ` ```typescript ``` `
- Include file name and line number comments

## YAML Standards

### Basic Format
```yaml
key: value
nested:
  child: value
list:
  - item1
  - item2
```

### Rules
- Use 2-space indentation
- Do not use tabs
- Key-value pairs separated by `:`
- List items start with `-`

## File Organization

### File Naming
- Config files: `kebab-case.yaml`
- Documentation files: `kebab-case.md`
- Script files: `kebab-case.ts`

### Directory Structure
```
config/
├── skills/          # One directory per Skill
├── agents/          # One directory per Agent
├── rules/           # Rule files
├── hooks/           # Hook scripts
└── commands/        # Command definitions

src/
└── *.ts            # TypeScript source files
```

## Git Standards

### Commit Messages
```
type(scope): description

feat(skills): add project-explore skill
fix(agents): correct java-agent naming
docs(rules): update coding standards
```

### Branch Naming
```
feature/<skill-name>
fix/<issue-description>
docs/<topic>
```

## Error Handling

### Exception Classification
- **Critical**: Must be fixed, cannot continue otherwise
- **High**: Recommended fix, may affect functionality
- **Medium**: Fix as needed, does not affect main flow
- **Low**: Minor issue, acceptable

### Handling Process
1. Identify error type
2. Record error details
3. Generate fix suggestions
4. Notify relevant parties

## Security Standards

### Prohibited
- Do not hardcode secrets in code
- Do not print sensitive information in logs
- Do not expose system architecture in comments

### Requirements
- All inputs must be validated
- All outputs must be sanitized
- All operations must be logged