# Contributing to project-teams-spec

Thank you for your interest in contributing to project-teams-spec!

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [issues](https://github.com/your-org/project-teams-spec/issues) to see if the issue already exists
2. Use the bug report template when creating a new issue

### Suggesting Features

We welcome feature suggestions! Please:
1. Search existing issues to avoid duplicates
2. Use the feature request template
3. Explain the use case and expected behavior

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following our coding standards
4. Add tests if applicable
5. Ensure all tests pass: `npm test`
6. Commit your changes using conventional commits:
   - `feat(skills): add new skill definition`
   - `fix(agents): correct agent configuration`
   - `docs(readme): update installation instructions`
   - `refactor(cli): improve command generation`
7. Push to your fork and create a Pull Request

### Coding Standards

Follow the standards defined in `config/rules/`:

- **Formatting**: 2 spaces for config files, 4 spaces for code
- **Naming**:
  - Files: kebab-case (e.g., `my-file.md`)
  - Functions: lowerCamelCase (e.g., `myFunction`)
  - Classes: UpperCamelCase (e.g., `MyClass`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MY_CONSTANT`)

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, no code change
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(skills): add complexity-evaluate skill
fix(agents): correct java-agent type definition
docs(readme): add troubleshooting section
refactor(cli): simplify command generation logic
```

### Branch Naming

```
feature/<skill-name>
fix/<issue-description>
docs/<topic>
hotfix/<urgent-fix>
```

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/project-teams-spec.git
cd project-teams-spec

# Add upstream remote
git remote add upstream https://github.com/your-org/project-teams-spec.git

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat(scope): description"

# Fetch and merge upstream changes
git fetch upstream
git merge upstream/main

# Push and create PR
git push origin feature/my-feature
```

## Testing

Run tests before submitting:

```bash
# Run all tests
npm test

# Run in watch mode
npm run test -- --watch

# Build before testing
npm run build
```

## Review Process

1. Maintainers will review your PR
2. Address any feedback promptly
3. Once approved, your PR will be merged

## Questions?

Feel free to:
- Open an issue for questions
- Join our community discussions
- Contact the maintainers

Thank you for contributing!