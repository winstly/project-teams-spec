#!/bin/bash
# on-subagent-stop.sh
# Hook: SubagentStop
# Description: Sub-Agent 结束时汇总结果到 task-results/

# 获取环境变量
AGENT_NAME="${CLAUDE_AGENT_NAME:-unknown}"
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# 日志目录
LOG_DIR="${PROJECT_DIR}/.project-teams-spec/logs"
mkdir -p "$LOG_DIR"

# 写入日志
TIMESTAMP=$(date -Iseconds)
echo "[${TIMESTAMP}] SUBAGENT_STOP agent=${AGENT_NAME} session=${SESSION_ID}" >> "${LOG_DIR}/subagent.log"

# 可选：检查是否有 TaskResult 输出需要汇总
RESULTS_DIR="${PROJECT_DIR}/.project-teams-spec/task-results"
mkdir -p "$RESULTS_DIR"

# 写入汇总记录
SUMMARY_FILE="${RESULTS_DIR}/agent-${AGENT_NAME}-${SESSION_ID}.yaml"
echo "agent: ${AGENT_NAME}
session: ${SESSION_ID}
stopped_at: ${TIMESTAMP}
status: completed" > "$SUMMARY_FILE"

exit 0