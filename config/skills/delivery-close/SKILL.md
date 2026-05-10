# SKILL: delivery-close

## 元数据
name: delivery-close
version: 1.0.0
granularity: procedural
type: internal
phase: 9

## Preconditions
preconditions:
  - qa-verify has passed
  - verification_report has been produced

## Input
input:
  - name: execution_results
    type: data
    description: Execution results for each task

  - name: verification_report
    type: file
    path: .project-teams-spec/verification.yaml
    description: Verification report

  - name: project_md
    type: file
    path: ./PROJECT.md
    description: Project analysis document

## Output
output:
  - name: deliverables
    type: data
    description: Final deliverables checklist

  - name: archive_manifest
    type: file
    path: .project-teams-spec/archive-manifest.yaml
    description: Archive manifest

  - name: lessons
    type: data
    description: Lessons learned entries

## Steps
steps:
  - id: collect-artifacts
    description: Collect all deliverables
    type: internal

  - id: generate-manifest
    description: Generate archive manifest
    type: internal

  - id: collect-lessons
    description: Collect lessons learned
    type: internal

  - id: update-agent-lessons
    description: Update each Agent's LESSONS_LEARNED.md
    type: internal

  - id: confirm-delivery
    description: Confirm delivery completion
    type: internal

## Checkpoint
checkpoint:
  required: true
  message: "Delivery complete, please confirm the final deliverables."

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

```yaml
# archive-manifest.yaml

project: {{project_name}}
delivered_at: {{timestamp}}
complexity_level: {{level}}

artifacts:
  code:
    - path: src/api/**/*.ts
      files: 45
      lines_added: 3200
      lines_removed: 1200

  tests:
    - path: test/**/*.test.ts
      files: 28
      coverage: 82%

  documentation:
    - PROJECT.md
    - complexity-report.yaml
    - plan.yaml
    - verification.yaml

  scripts:
    - migration.sql
    - deploy.sh

summary: |
  This delivery includes X file changes, Y lines added,
  Z lines removed, with A% test coverage.

validation:
  - { check: "All tests passed", result: "✓" }
  - { check: "Coverage meets target", result: "✓" }
  - { check: "Documentation updated", result: "✓" }
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
