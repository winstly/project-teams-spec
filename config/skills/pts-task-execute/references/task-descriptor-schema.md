# TaskDescriptor Schema

## Overview

TaskDescriptor 是 Master 下发给 Sub-Agent 的任务描述格式。所有字段必须完整填写。

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["task_id", "type", "agent", "instruction", "context"],
  "properties": {
    "task_id": {
      "type": "string",
      "description": "唯一任务标识，格式: task-{N}",
      "pattern": "^task-\\d+$"
    },
    "type": {
      "type": "string",
      "enum": ["claim", "plan", "execute", "verify"],
      "description": "任务类型"
    },
    "agent": {
      "type": "string",
      "description": "目标 Agent 名称，如 java-agent, frontend-agent"
    },
    "context": {
      "type": "object",
      "required": ["project", "scope"],
      "properties": {
        "project": {
          "type": "string",
          "description": "项目根目录路径"
        },
        "scope": {
          "type": "array",
          "items": { "type": "string" },
          "description": "涉及的文件/模块路径，glob 模式支持"
        },
        "dependencies": {
          "type": "array",
          "items": { "type": "string" },
          "description": "前置任务 ID 列表"
        }
      }
    },
    "instruction": {
      "type": "string",
      "description": "具体任务描述，支持多行"
    },
    "constraints": {
      "type": "array",
      "items": { "type": "string" },
      "description": "约束条件列表"
    },
    "expected_output": {
      "type": "string",
      "description": "期望产出的描述"
    },
    "deadline": {
      "type": ["string", "null"],
      "description": "超时时限，格式: Nm 或 Nh (如 30m, 2h)"
    }
  }
}
```

## Type Definitions

### TaskType

```typescript
type TaskType = 'claim' | 'plan' | 'execute' | 'verify';
```

- `claim`: 任务领取，Agent 认领自己的任务
- `plan`: 任务规划，Agent 为自己领到的任务制定执行计划
- `execute`: 任务执行，Agent 执行具体任务
- `verify`: 任务验证，QA Agent 验证执行结果

## Examples

### Example 1: Basic Execute Task

```json
{
  "task_id": "task-001",
  "type": "execute",
  "agent": "java-agent",
  "context": {
    "project": "/home/user/project",
    "scope": ["src/api/**/*.java"],
    "dependencies": []
  },
  "instruction": "将 src/api/auth.ts 中的 JWT 验证逻辑迁移到新的 middleware 架构。保持向后兼容，不修改公开 API 签名。",
  "constraints": [
    "遵循 {{RULES_DIR}}/coding-standards.md 中的 Java 编码规范",
    "新增日志记录",
    "更新相关测试，覆盖率达到 80%",
    "保持 API 兼容性"
  ],
  "expected_output": "修改后的 Java 文件和变更摘要",
  "deadline": "30m"
}
```

### Example 2: Plan Task with Dependencies

```json
{
  "task_id": "task-003",
  "type": "plan",
  "agent": "frontend-agent",
  "context": {
    "project": "/home/user/project",
    "scope": ["src/components/**/*", "src/pages/**/*"],
    "dependencies": ["task-001", "task-002"]
  },
  "instruction": "为前端组件迁移制定详细计划。依赖后端 API 重构完成后方可执行。",
  "constraints": [
    "考虑现有的测试框架 Jest",
    "优先迁移核心业务组件",
    "确保 TypeScript 类型兼容性"
  ],
  "expected_output": "包含任务拆分和依赖关系的执行计划",
  "deadline": "15m"
}
```

### Example 3: Verify Task

```json
{
  "task_id": "task-010",
  "type": "verify",
  "agent": "qa-agent",
  "context": {
    "project": "/home/user/project",
    "scope": ["src/", "test/"],
    "dependencies": ["task-009"]
  },
  "instruction": "验证所有迁移后的代码是否满足质量标准。执行回归测试。",
  "constraints": [
    "测试覆盖率 >= 80%",
    "所有单元测试通过",
    "集成测试通过",
    "无关键级别的问题"
  ],
  "expected_output": "包含测试结果的验证报告",
  "deadline": "1h"
}
```

## Validation Rules

1. **task_id** 必须是唯一标识，不能重复
2. **scope** 支持 glob 模式，如 `**/*.ts`, `src/**`
3. **dependencies** 中的 task_id 必须先于当前任务完成
4. **deadline** 如果为 null 表示无超时限制
5. **instruction** 应该足够详细，让 Agent 知道具体要做什么

## Best Practices

### Writing Clear Instructions

```
✓ Good: "将 UserService 中的 getUserById 方法提取为独立服务，增加缓存层"

✗ Bad: "优化用户服务"
```

### Setting Realistic Deadlines

- 小任务（修改几个文件）: 15-30m
- 中任务（模块重构）: 1-2h
- 大任务（跨模块改造）: 4-8h
- 阶段任务（整个前端迁移）: 1-2d

### Defining Scope

```
✓ Good: scope: ["src/api/v1/*.ts", "src/services/*.ts"]
✗ Bad: scope: ["src/**"]  # 过于宽泛
✗ Bad: scope: []  # 过于模糊
```