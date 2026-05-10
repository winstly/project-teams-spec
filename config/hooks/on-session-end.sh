#!/bin/bash
# on-session-end.sh
# Hook: SessionEnd
# Description: 会话结束时保存最终状态

# 获取环境变量
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# 状态目录
STATE_DIR="${PROJECT_DIR}/.project-teams-spec"
LOG_DIR="${STATE_DIR}/logs"
HISTORY_DIR="${STATE_DIR}/history"

mkdir -p "$LOG_DIR"
mkdir -p "$HISTORY_DIR"

# 写入会话结束日志
TIMESTAMP=$(date -Iseconds)
echo "[${TIMESTAMP}] SESSION_END session=${SESSION_ID}" >> "${LOG_DIR}/session.log"

# 汇总本次会话的任务完成情况
COMPLETED_TASKS=$(grep -l "status: completed" "${STATE_DIR}/tasks/"*.yaml 2>/dev/null | wc -l)
echo "session_completed_tasks: ${COMPLETED_TASKS}" >> "${LOG_DIR}/session.log"

# 保存会话历史
SESSION_HISTORY="${HISTORY_DIR}/${SESSION_ID}.yaml"
echo "session_id: ${SESSION_ID}
ended_at: ${TIMESTAMP}
completed_tasks: ${COMPLETED_TASKS}" > "$SESSION_HISTORY"

# 清理临时文件
rm -f "${STATE_DIR}/active-agents.tmp" 2>/dev/null

exit 0