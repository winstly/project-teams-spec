# SKILL: delivery-close
---
name: delivery-close
version: 1.1.0
granularity: procedural
type: internal
phase: 9
description: Finalize project delivery by collecting deliverables, generating archive manifest, documenting lessons learned, and confirming delivery completion.
triggers:
  - "close delivery"
  - "finalize delivery"
  - "complete project"
  - "close project"
  - "archive delivery"
tags:
  - delivery
  - archival
  - lessons-learned
  - finalization
---

## Preconditions
preconditions:
  - qa-verify has passed
  - verification_report has been produced

## Input
input:
  - name: execution_results
    type: data[]
    description: Execution results for each task

  - name: verification_report
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/verification.md"
    description: Verification report

  - name: project_md
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/SPEC.md"
    description: Project analysis document

  - name: complexity_report
    type: file
    path: "{{SPEC_DIR}}/projects/{{project_name}}/COMPLEXITY.md"
    description: Complexity assessment report

## Output
output:
  - name: deliverables
    type: data[]
    description: Final deliverables checklist
    items:
      - category: string
        files: string[]
        line_stats: object

  - name: archive_manifest
    type: file
    path: "{{SPEC_DIR}}/archive-manifest.md"
    description: Archive manifest
    format: markdown

  - name: lessons
    type: data[]
    description: Lessons learned entries
    items:
      - date: string
        category: string
        severity: string
        phase: string
        title: string
        problem: string
        solution: string

  - name: delivery_summary
    type: object
    description: Summary of delivery statistics
    properties:
      total_files_changed: integer
      lines_added: integer
      lines_removed: integer
      test_coverage: float
      duration_hours: float

## Steps
steps:
  - id: collect-artifacts
    description: Collect all deliverables
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: generate-manifest
    description: Generate archive manifest
    type: internal
    continue_on_error: false
    timeout: 3m

  - id: collect-lessons
    description: Collect lessons learned
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: update-agent-lessons
    description: Update each Agent's LESSONS_LEARNED.md
    type: internal
    continue_on_error: false
    timeout: 5m

  - id: update-whitepaper
    description: Update PROJECT_WHITEPAPER.md with execution record and lessons
    type: internal
    continue_on_error: false
    timeout: 3m
    notes: |
      Update portfolio whitepaper at {{SPEC_DIR}}/PROJECT_WHITEPAPER.md:
      1. Append to execution records: date, summary, compliance rate, artifacts
      2. Add to lessons learned: effective practices, issues, solutions
      3. Update project status
      4. Update norms compliance if applicable

  - id: confirm-delivery
    description: Confirm delivery completion
    type: internal
    continue_on_error: false
    timeout: 2m

## Checkpoint
checkpoint:
  required: true
  message: "Delivery complete. Summary: {file_count} files changed, {lines_added} lines added, {lines_removed} removed, {coverage_percent}% test coverage. Archive manifest generated. Lessons learned: {lesson_count} entries. Please confirm final delivery."

## Hook Configuration
hooks:
  on-complete:
    - trigger: on-delivery-complete
      action: notify-master
      message: "Delivery completed successfully. Archive: {archive_path}"
  on-lessons-updated:
    - trigger: on-lessons-updated
      action: update-whitepaper
      target: PROJECT_WHITEPAPER.md
  on-archive-ready:
    - trigger: on-archive-ready
      action: notify-master
      message: "Archive manifest generated: {manifest_path}"

---

# INSTRUCTIONS

You are a delivery archival expert. Collect all deliverables, generate archive manifest, and document lessons learned.

## Execution Guide

### 1. Collect Deliverables

```
Deliverable Types:
├── Code Changes: List of modified files
├── Test Reports: Test results and coverage
├── Documentation Updates: Updated documentation
├── Migration Scripts: Database migration, configuration migration
└── Other Artifacts: Build artifacts, deployment configurations
```

### 2. Generate Archive Manifest

```markdown
# {{SPEC_DIR}}/archive-manifest.md

## 项目交付清单

**项目名称**: {{project_name}}
**交付时间**: {{timestamp}}
**复杂度等级**: {{level}}

### 交付物

#### 代码变更
| 路径 | 文件数 | 新增行数 | 删除行数 |
|------|--------|----------|----------|
| src/api/**/*.ts | 45 | 3200 | 1200 |

#### 测试报告
| 路径 | 文件数 | 覆盖率 |
|------|--------|--------|
| test/**/*.test.ts | 28 | 82% |

#### 文档
- {{SPEC_DIR}}/SPEC.md
- {{SPEC_DIR}}/COMPLEXITY.md
- {{SPEC_DIR}}/projects/{{project_name}}/plan.md
- {{SPEC_DIR}}/verification.md

#### 脚本
- migration.sql
- deploy.sh

### 总结

本次交付包含：
- X 个文件变更
- Y 行新增
- Z 行删除
- A% 测试覆盖率

### 验证结果

| 检查项 | 结果 |
|--------|------|
| 所有测试通过 | ✓ |
| 覆盖率达标 | ✓ |
| 文档已更新 | ✓ |
```

### 3. Collect Lessons Learned

```
Collection Sources:
├── Issues during execution
├── Feedback from each Agent
├── Suggestions from user
└── Issues found during review

Collection Dimensions:
├── Spec Applicability: Are the rules reasonable?
├── Process Efficiency: Can the process be optimized?
├── Tool Usage: Do tools meet requirements?
└── Technical Decisions: Are technical choices correct?
```

## Error Handling

| Error Type | Handling Strategy | Recovery Action |
|------------|-----------------|----------------|
| Missing artifact | Log warning | Document missing item |
| Incomplete execution results | Proceed with available data | Note gaps in manifest |
| Agent lesson file not found | Create new file | Initialize LESSONS_LEARNED.md |
| Archive manifest generation fail | Generate minimal manifest | Document error reason |

### Error Recovery Scenarios

1. **Missing delivery file**: Document as "not delivered"; exclude from manifest
2. **Incomplete statistics**: Use available metrics; note approximations
3. **Lesson file corruption**: Create fresh file; lose history (document loss)
4. **User requests partial delivery**: Support phased archiving

### 4. Update LESSONS_LEARNED.md

Add entries to each Agent's LESSONS_LEARNED.md:

```markdown
## {{date}} {{title}}

**Category**: {{category}}
**Severity**: {{severity}}
**Related Phase**: {{phase}} ({{skill}})

### Problem Description
{{problem}}

### Root Cause Analysis
{{root_cause}}

### Solution
{{solution}}

### Applicable Scenarios
{{applicable_scenarios}}

### Improvement Suggestions
{{improvement}}
```

### 5. Confirm Delivery

```
Delivery Confirmation Items:
├── All TaskResults collected
├── All QA checks passed
├── Documentation updated
├── Lessons learned documented
└── Archive manifest generated

After delivery completion:
- Notify user of delivery completion
- Provide archive manifest
- Provide next steps suggestions
```

## Deliverables Checklist

```
Code Delivery:
□ All code changes committed
□ All tests passed
□ Documentation updated

Test Delivery:
□ Unit test coverage >= 80%
□ Integration tests passed
□ Regression tests passed

Documentation Delivery:
□ PROJECT.md updated
□ Complexity report archived
□ Execution plan archived
□ Verification report archived

Lessons Delivery:
□ Each Agent's LESSONS_LEARNED.md updated
□ Global lessons summary generated
```

## Key Constraints

1. **Deliverables must be complete**: All outputs must be archived
2. **Lessons must be documented**: Every issue must have a lesson recorded
3. **Manifest must be accurate**: Archive manifest must be reproducible
4. **Archives must be traceable**: Easy to trace back later