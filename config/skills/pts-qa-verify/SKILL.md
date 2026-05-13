# SKILL: qa-verify
---
name: qa-verify
version: 1.1.0
granularity: protocol
type: agent-subprocess
phase: 8
description: Verify execution results against quality standards, run tests, check coverage, and generate verification reports. Handle failures and guide fixes.
triggers:
  - "verify quality"
  - "qa check"
  - "run verification"
  - "quality assurance"
  - "test verification"
tags:
  - quality-assurance
  - verification
  - testing
  - coverage-check
---

## Preconditions
preconditions:
  - task-execute has completed
  - execution_results have been produced

## Input
input:
  - name: execution_results
    type: data[]
    description: Execution results for each task (TaskResult[])
    items:
      - task_id: string
        status: enum
        output: object
        issues: array

  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document

  - name: qa_rules
    type: data
    description: QA Agent verification rules
    required: false

## Output
output:
  - name: verification_report
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/verification.md"
    description: Verification report
    format: markdown

  - name: passed
    type: boolean
    description: Whether verification passed

  - name: remaining_issues
    type: data[]
    description: List of remaining issues
    items:
      - severity: enum
        title: string
        description: string
        affected_files: string[]
        suggestion: string

  - name: metrics_summary
    type: object
    description: Summary of verification metrics
    properties:
      total_tests: integer
      passed_tests: integer
      failed_tests: integer
      coverage_percent: float
      quality_score: float

## Steps
steps:
  - id: collect-results
    description: Collect all TaskResults
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: verify-quality
    description: Verify code quality
    type: agent-subprocess
    delegate_to: qa-agent
    continue_on_error: false
    timeout: 10m

  - id: run-tests
    description: Run test verification
    type: agent-subprocess
    delegate_to: qa-agent
    continue_on_error: false
    timeout: 15m

  - id: check-coverage
    description: Check test coverage
    type: agent-subprocess
    delegate_to: qa-agent
    continue_on_error: false
    timeout: 5m

  - id: generate-report
    description: Generate verification report
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: handle-failures
    description: Handle verification failures
    type: internal
    continue_on_error: false
    timeout: 5m

## Checkpoint
checkpoint:
  required: true
  message: "QA verification complete. Status: {passed ? 'PASSED' : 'FAILED'}. Tests: {passed_tests}/{total_tests} passed. Coverage: {coverage_percent}%. Found {issue_count} remaining issues ({critical_count} critical). Please confirm: proceed to delivery or request fixes."

## Hook Configuration
hooks:
  on-qa-fail:
    - trigger: on-qa-fail
      action: notify-master
      fallback: auto-retry-task-execute
  on-qa-pass:
    - trigger: on-qa-pass
      action: auto-trigger-next-skill
      next_skill: delivery-close

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

## Error Handling

| Error Type | Handling Strategy | Recovery Action |
|------------|-----------------|----------------|
| Test failure | Log failure, mark critical | Block delivery |
| Coverage below target | Log warning | Allow delivery with risk |
| Compilation error | Block delivery | Return to task-execute |
| Timeout during tests | Retry once | Skip if persistent |
| No tests found | Log warning | Document as coverage 0% |

### Fix Flow

```
critical failure → Return to task-execute → Re-verify after fix
warning failure → User decision (fix / accept risk / skip)

After fix:
1. Re-run qa-verify
2. If passed: Continue to delivery-close
3. If failed: Repeat fix flow
```

## Verification Report Format

```markdown
# {{SPEC_DIR}}/projects/{{project_name}}/verification.md

## 验证报告

**状态**: ❌ 未通过 (或 ✓ 已通过)
**总任务数**: 10
**通过**: 8
**失败**: 2

### 质量检查

| 检查项 | 状态 | 详情 |
|--------|------|------|
| 代码语法 | ✓ 通过 | 无编译错误 |
| 类型安全 | ✓ 通过 | TypeScript 编译通过 |
| 测试覆盖率 | ❌ 失败 | 覆盖率 65%，低于目标 80% |

### 测试结果

| 指标 | 值 |
|------|------|
| 总数 | 150 |
| 通过 | 130 |
| 失败 | 5 |
| 跳过 | 15 |

### 覆盖率

| 指标 | 覆盖率 |
|------|--------|
| 语句 | 72% |
| 分支 | 68% |
| 函数 | 78% |
| 行 | 65% |

### 遗留问题

#### 高优先级
| 项目 | 详情 |
|------|------|
| 标题 | 测试覆盖率不足 |
| 描述 | test/user.service.test.ts 覆盖率仅 45% |
| 影响文件 | src/services/user.service.ts |
| 建议 | 添加边界情况测试 |

#### 中优先级
| 项目 | 详情 |
|------|------|
| 标题 | 代码风格偏差 |
| 描述 | src/api/user.ts 中的变量命名不符合规范 |
| 影响文件 | src/api/user.ts |
| 建议 | 使用 camelCase 命名变量 |
```

## Key Constraints

1. **Critical issues must be fixed**: Otherwise cannot deliver
2. **Verification must be comprehensive**: Cover all acceptance_criteria
3. **Reports must be detailed**: Include all issues and suggestions
4. **Failures must be closed-loop**: Clear fix process required