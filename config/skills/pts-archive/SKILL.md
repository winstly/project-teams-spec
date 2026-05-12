# SKILL: archive
---
name: archive
version: 1.1.0
granularity: protocol
type: internal
phase: post-execution
description: Archive execution artifacts, update the project whitepaper with execution records, and generate execution summaries for future reference.
triggers:
  - "archive"
  - "archive execution"
  - "save artifacts"
  - "归档"
tags:
  - archive
  - documentation
  - knowledge-retention
  - post-execution
---

## Preconditions
preconditions:
  - Task execution has completed
  - Retrospective analysis is available
  - All artifacts are collected

## Input
input:
  - name: execution_summary
    type: object
    description: Summary of the execution run
    required: true
    properties:
      date: string
      project: string
      total_tasks: integer
      completed: integer
      failed: integer
      duration: string
      status: enum

  - name: task_results
    type: array
    description: Array of task results
    required: true

  - name: artifacts
    type: array
    description: List of file changes produced
    required: false

  - name: retrospective_report
    type: object
    description: Retrospective analysis results
    required: false

  - name: whitepaper_updates
    type: array
    description: Proposed updates to whitepaper
    required: false

## Output
output:
  - name: archive_location
    type: string
    description: Path to the created archive

  - name: archive_manifest
    type: object
    description: Contents of the archive
    properties:
      path: string
      files: array
      size: string
      created_at: string

  - name: whitepaper_updated
    type: boolean
    description: Whether whitepaper was updated

  - name: execution_record
    type: object
    description: Record added to whitepaper

## Steps
steps:
  - id: create-archive-structure
    description: Create archive directory structure
    type: internal
    continue_on_error: false
    timeout: 1m

  - id: save-execution-summary
    description: Save execution summary to archive
    type: internal
    continue_on_error: false
    timeout: 1m

  - id: save-task-results
    description: Save task results to archive
    type: internal
    continue_on_error: false
    timeout: 2m

  - id: save-artifacts-manifest
    description: Save artifacts manifest to archive
    type: internal
    continue_on_error: false
    timeout: 1m

  - id: save-retrospective
    description: Save retrospective report to archive
    type: internal
    continue_on_error: true
    timeout: 1m

  - id: update-whitepaper
    description: Update PROJECT_WHITEPAPER.md with execution record
    type: internal
    continue_on_error: true
    timeout: 2m

  - id: generate-summary
    description: Generate execution summary document
    type: internal
    continue_on_error: false
    timeout: 1m

## Checkpoint
checkpoint:
  required: true
  message: "Archive structure created. Continue with archiving?"

## Hook Configuration
hooks:
  on-archive-complete:
    - trigger: on-archive-complete
      action: notify-master
      message: "Execution archived successfully"

# INSTRUCTIONS

You are an archivist. After task execution and retrospective analysis, you must archive all relevant data and update the project whitepaper.

## Archive Protocol

### Archive Structure

```
{{SPEC_DIR}}/archive/
└── {YYYY-MM-DD}_{execution-id}/
    ├── archive-manifest.json      # This file - lists all contents
    ├── execution-summary.md       # Execution overview
    ├── task-results/             # Individual task results
    │   ├── task-001.md
    │   ├── task-002.md
    │   └── ...
    ├── artifacts-manifest.md     # List of changed files
    ├── retrospective.md           # Retrospective analysis
    ├── norms-updates/            # Proposed norm updates
    │   ├── agent-level/
    │   └── project-level/
    └── execution-summary.md       # Quick reference summary
```

### Step 1: Create Archive Structure

```bash
# Create directory
mkdir -p {{SPEC_DIR}}/archive/{YYYY-MM-DD}_{execution-id}

# Create subdirectories
mkdir -p {{SPEC_DIR}}/archive/{id}/task-results
mkdir -p {{SPEC_DIR}}/archive/{id}/norms-updates/agent-level
mkdir -p {{SPEC_DIR}}/archive/{id}/norms-updates/project-level
```

### Step 2: Save Execution Summary

Create `execution-summary.md`:

```markdown
# Execution Summary

**Date**: {YYYY-MM-DD}
**Project**: {project-name}
**Execution ID**: {execution-id}

## Statistics

| Metric | Value |
|--------|-------|
| Total Tasks | {n} |
| Completed | {n} |
| Failed | {n} |
| Duration | {duration} |
| Status | {success/partial/failed} |

## Norms Compliance

- **Compliance Rate**: {rate}%
- **Critical Rules Followed**: {list}
- **Rules Violated**: {list}

## Key Outcomes

### Successes
- {list of successful outcomes}

### Issues
- {list of issues encountered}

## Next Steps

- {any follow-up items}
```

### Step 3: Save Task Results

For each task, create a file in `task-results/`:

```markdown
# Task: {task-id}

**Agent**: {agent-type}
**Status**: {success/failed/blocked}
**Duration**: {duration}

## Task Description
{task instruction}

## Result

{summary of what was done}

## Issues (if any)

{issues encountered}

## Metrics

| Metric | Value |
|--------|-------|
| Files Changed | {n} |
| Lines Added | {n} |
| Lines Removed | {n} |
```

### Step 4: Save Artifacts Manifest

Create `artifacts-manifest.md`:

```markdown
# Artifacts Manifest

**Total Files Changed**: {n}
**Total Lines Added**: {n}
**Total Lines Removed**: {n}

## Changed Files

| File | Type | Lines + | Lines - |
|------|------|---------|---------|
| {file} | {new/modified/deleted} | {n} | {n} |
```

### Step 5: Save Retrospective Report

Copy the retrospective report to `retrospective.md`.

If retrospective hasn't been done yet, create a placeholder:

```markdown
# Retrospective

*Retrospective analysis pending - run pts-retrospective skill first.*
```

### Step 6: Update PROJECT_WHITEPAPER.md

Append to the execution record section:

```markdown
| {date} | {brief summary} | {compliance rate}% | {沉淀内容} | {status} |
```

Also update Lessons Learned section if applicable.

### Step 7: Create Archive Manifest

Create `archive-manifest.json`:

```json
{
  "archive_id": "{execution-id}",
  "created_at": "{ISO timestamp}",
  "execution_summary": {
    "date": "{date}",
    "project": "{project}",
    "total_tasks": {n},
    "completed": {n},
    "failed": {n},
    "duration": "{duration}",
    "status": "{status}"
  },
  "contents": [
    "execution-summary.md",
    "task-results/",
    "artifacts-manifest.md",
    "retrospective.md",
    "norms-updates/"
  ],
  "whitepaper_updated": true,
  "version": "1.0.0"
}
```

## Output Format

```json
{
  "archive_location": "{{SPEC_DIR}}/archive/{YYYY-MM-DD}_{execution-id}/",
  "archive_manifest": {
    "path": "...",
    "files": ["..."],
    "size": "{estimated}",
    "created_at": "{ISO}"
  },
  "whitepaper_updated": true,
  "execution_record": {
    "date": "{date}",
    "summary": "{brief}",
    "compliance_rate": {rate},
    "沉淀": "{list}"
  }
}
```

## Retention Policy

| Archive Type | Retention | Location |
|-------------|-----------|----------|
| Execution Archives | 90 days | `{{SPEC_DIR}}/archive/` |
| Norm Updates | Permanent | Respective norm files |
| Whitepaper | Permanent | `PROJECT_WHITEPAPER.md` |

## Cleanup

After 90 days, old archives can be compressed:

```bash
cd {{SPEC_DIR}}/archive/
tar -czf {archive-id}.tar.gz {archive-id}/
rm -rf {archive-id}/
```
