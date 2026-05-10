#!/bin/bash
# on-subagent-start.sh
# Hook: SubagentStart
# Description: Sub-Agent 启动时记录日志

# 获取环境变量
AGENT_NAME="${CLAUDE_AGENT_NAME:-unknown}"
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# 日志目录
LOG_DIR="${PROJECT_DIR}/.project-teams-spec/logs"
mkdir -p "$LOG_DIR"

# 写入日志
TIMESTAMP=$(date -Iseconds)
echo "[${TIMESTAMP}] SUBAGENT_START agent=${AGENT_NAME} session=${SESSION_ID}" >> "${LOG_DIR}/subagent.log"

# 可选：写入状态文件
STATE_FILE="${PROJECT_DIR}/.project-teams-spec/state.yaml"
if [ -f "$STATE_FILE" ]; then
  # 在 state.yaml 中记录活跃的 Sub-Agent
  # 注意：这是一个简单的追加，实际实现可能需要更复杂的 YAML 处理
  echo "- agent: ${AGENT_NAME}
    status: starting
    started_at: ${TIMESTAMP}" >> "${LOG_DIR}/active-agents.tmp"
fi

exit 0