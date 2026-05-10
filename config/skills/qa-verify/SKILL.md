# SKILL: qa-verify

## 元数据
name: qa-verify
version: 1.0.0
granularity: protocol
type: agent-subprocess
phase: 8

## Preconditions
preconditions:
  - task-execute has completed
  - execution_results have been produced

## Input
input:
  - name: execution_results
    type: data
    description: Execution results for each task (TaskResult[])

  - name: project_md
    type: file
    path: ./PROJECT.md
    description: Project analysis document

  - name: qa_rules
    type: data
    description: QA Agent verification rules

## Output
output:
  - name: verification_report
    type: file
    path: .project-teams-spec/verification.yaml
    description: Verification report

  - name: passed
    type: boolean
    description: Whether verification passed

  - name: remaining_issues
    type: data
    description: List of remaining issues

## Steps
steps:
  - id: collect-results
    description: Collect all TaskResults
    type: internal

  - id: verify-quality
    description: Verify code quality
    type: agent-subprocess
    delegate_to: qa-agent

  - id: run-tests
    description: Run test verification
    type: agent-subprocess
    delegate_to: qa-agent

  - id: check-coverage
    description: Check test coverage
    type: agent-subprocess
    delegate_to: qa-agent

  - id: generate-report
    description: Generate verification report
    type: internal

  - id: handle-failures
    description: Handle verification failures
    type: internal

## Checkpoint
checkpoint:
  required: true
  message: "QA verification complete, please confirm the results."

## Hook Configuration
hooks:
  on-qa-fail:
    - trigger: on-qa-fail
      action: notify-master  # Notify Master and user
      fallback: auto-retry-task-execute

---
# INSTRUCTIONS

You are a quality verification expert. Verify whether the execution results of task-execute meet quality standards.

## Verification Criteria

### 1. Code Quality

| Check Item | Standard | Severity |
|------------|----------|----------|
| Syntax correctness | No compilation/runtime errors | critical |
| Type safety | TypeScript compilation passes | critical |
| Code style | Follows coding standards in rules/ | warning |
| Naming conventions | Follows naming-conventions.md | warning |

### 2. Functional Completeness

| Check Item | Standard | Severity |
|------------|----------|----------|
| Feature implementation | All acceptance_criteria met | critical |
| API compatibility | No breaking changes to existing APIs | critical |
| Regression testing | Existing functionality unaffected | critical |

### 3. Test Coverage

| Coverage | Level | Requirement |
|----------|-------|-------------|
| < 50% | Fail | Must supplement |
| 50-70% | Pass | Recommended to supplement |
| 70-85% | Good | Acceptable |
| > 85% | Excellent | Meets target |

### 4. Performance

| Check Item | Standard | Severity |
|------------|----------|----------|
| Startup time | No more than 120% of original | warning |
| Response time | No more than 120% of original | warning |
| Memory usage | No more than 150% of original | warning |

## Verification Report Format

```yaml
# verification.yaml

passed: false  # true or false
summary: |
  Total tasks: 10
  Passed: 8
  Failed: 2

quality_checks:
  - name: Code Syntax
    status: passed
    details: No compilation errors
  - name: Type Safety
    status: passed
    details: TypeScript compilation passes
  - name: Test Coverage
    status: failed
    details: Coverage is 65%, below target of 80%

test_results:
  total: 150
  passed: 130
  failed: 5
  skipped: 15

coverage:
  statements: 72%
  branches: 68%
  functions: 78%
  lines: 65%

remaining_issues:
  - severity: high
    title: "Insufficient test coverage"
    description: "test/user.service.test.ts coverage is only 45%"
    affected_files: ["src/services/user.service.ts"]
    suggestion: "Add edge case tests"

  - severity: medium
    title: "Code style deviation"
    description: "Variable naming in src/api/user.ts does not follow conventions"
    affected_files: ["src/api/user.ts"]
    suggestion: "Use camelCase for variable naming"
```

## Failure Handling

### On QA Failure

```
When passed: false:

1. Log failure reason
2. Generate fix suggestions
3. Notify Master and user

Failure types:
├── critical: Must fix, cannot deliver otherwise
└── warning: Recommended to fix, can deliver with risk
```

### Fix Flow

```
critical failure → Return to task-execute → Re-verify after fix
warning failure → User decision (fix / accept risk / skip)

After fix:
1. Re-run qa-verify
2. If passed: Continue to delivery-close
3. If failed: Repeat fix flow
```

## Key Constraints

1. **Critical issues must be fixed**: Otherwise cannot deliver
2. **Verification must be comprehensive**: Cover all acceptance_criteria
3. **Reports must be detailed**: Include all issues and suggestions
4. **Failures must be closed-loop**: Clear fix process required
