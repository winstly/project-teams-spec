#!/bin/bash
# on-task-completed.sh
# Hook: TaskCompleted
# Description: 任务完成时触发后续处理

# 获取环境变量
TASK_ID="${CLAUDE_TASK_ID:-unknown}"
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# 状态目录
STATE_DIR="${PROJECT_DIR}/.project-teams-spec"
LOG_DIR="${STATE_DIR}/logs"

# 写入日志
TIMESTAMP=$(date -Iseconds)
echo "[${TIMESTAMP}] TASK_COMPLETED task=${TASK_ID}" >> "${LOG_DIR}/tasks.log"

# 更新任务状态
TASK_FILE="${STATE_DIR}/tasks/${TASK_ID}.yaml"
if [ -f "$TASK_FILE" ]; then
  echo "status: completed
completed_at: ${TIMESTAMP}" >> "$TASK_FILE"
fi

# 可选：触发冲突检测
# 检查是否有其他任务也在修改相同的文件
# 如果有冲突，创建 .conflict 文件等待用户决策

exit 0