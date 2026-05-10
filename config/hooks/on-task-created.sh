#!/bin/bash
# on-task-created.sh
# Hook: TaskCreated
# Description: 任务创建时写入 state.yaml

# 获取环境变量
TASK_ID="${CLAUDE_TASK_ID:-unknown}"
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# 状态目录
STATE_DIR="${PROJECT_DIR}/.project-teams-spec"
mkdir -p "$STATE_DIR"

# 写入任务记录
TIMESTAMP=$(date -Iseconds)
TASK_FILE="${STATE_DIR}/tasks/${TASK_ID}.yaml"

mkdir -p "$(dirname "$TASK_FILE")"

echo "task_id: ${TASK_ID}
session: ${SESSION_ID}
created_at: ${TIMESTAMP}
status: created" > "$TASK_FILE"

# 更新 state.yaml 中的任务计数
TASKS_COUNT=$(ls -1 "${STATE_DIR}/tasks/"*.yaml 2>/dev/null | wc -l)
echo "total_tasks: ${TASKS_COUNT}" >> "${STATE_DIR}/state.yaml"

exit 0