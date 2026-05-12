# Agent 配置模板

本文件提供 Agent 配置的标准格式和最佳实践。

---

## Agent Metadata 配置

### 基础元数据

```yaml
name: {{agent-name}}
description: 简短的描述，说明 Agent 的职责和专长
color: {{hex-color}}  # UI 显示颜色
emoji: {{emoji}}       # 视觉标识
vibe: {{一句话描述 Agent 的风格和态度}}
```

### 增强配置

```yaml
triggers:
  - "keyword1"
  - "keyword2"
  - "keyword3"

model_hint: "opus" | "sonnet" | "haiku"

collaboration_patterns:
  with_other_agent:
    description: "协作描述"
    handoff_format: "format-name"
    communication: "sync" | "async"
```

---

## Trigger Patterns 配置

### 触发关键词

| 关键词 | 说明 | 示例 |
|--------|------|------|
| 角色关键词 | Agent 职责相关 | "backend", "frontend" |
| 技术关键词 | 具体技术栈 | "react", "spring" |
| 任务关键词 | 任务类型 | "api", "database" |
| 质量关键词 | 质量相关 | "review", "test" |

### 配置示例

```yaml
triggers:
  # 角色相关
  - "backend"
  - "api"
  - "database"
  # 技术相关
  - "postgresql"
  - "redis"
  - "microservice"
  # 任务相关
  - "performance"
  - "scalability"
  - "security"
```

---

## Model Hint 配置

| 模型 | 适用场景 | 说明 |
|------|----------|------|
| `opus` | 架构设计、复杂分析、安全审查 | 最强推理能力 |
| `sonnet` | 标准实现、代码编写 | 平衡速度和质量 |
| `haiku` | 快速查询、简单任务 | 极低延迟 |

```yaml
model_hint: "opus"  # 默认值
```

---

## Collaboration Patterns

### 协作配置

```yaml
collaboration_patterns:
  with_frontend:
    description: "与前端 Agent 的协作方式"
    handoff_format: "api-spec"  # 交接格式
    communication: "async"        # 通信方式

  with_backend:
    description: "与后端 Agent 的协作方式"
    handoff_format: "data-schema"
    communication: "async"

  with_code_reviewer:
    description: "与审查 Agent 的协作方式"
    handoff_format: "review-context"
    communication: "sync"
```

### Handoff Formats

| 格式 | 适用场景 | 内容 |
|------|----------|------|
| `api-spec` | 前后端协作 | 接口定义、数据结构 |
| `data-schema` | 数据交换 | 实体定义、关系 |
| `architecture-doc` | 架构决策 | 设计文档、理由 |
| `test-results` | QA 协作 | 测试报告、覆盖率 |
| `review-comments` | 代码审查 | 评论、建议 |

---

## 协作通信模板

### API 规范交接

```markdown
## API Specification

- **Endpoint**: GET /api/users/{id}
- **Auth**: Bearer token required
- **Request**: N/A
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string"
  }
  ```
- **Errors**: 401, 403, 404, 500
- **Rate Limit**: 100 req/min
```

### 测试场景交接

```markdown
## Test Scenarios

### Happy Path
- Valid token + existing user → 200 OK

### Edge Cases
- Expired token → 401 Unauthorized
- Non-existent user → 404 Not Found

### Performance
- Response time < 200ms
- Concurrent users: 1000
```

### 缺陷报告交接

```markdown
## Defect Report

**Title**: Login fails with special characters
**Severity**: High
**Priority**: P1

### Steps to Reproduce
1. Enter email with ' in name (e.g., o'brien@test.com)
2. Click submit
3. Observe 500 error

### Expected Behavior
Login should succeed

### Actual Behavior
500 Internal Server Error

### Root Cause
Input not properly escaped
```

---

## Rules 文件结构

### 标准目录结构

```
config/agents/{{agent-name}}/
├── agent.md           # Agent 定义（主文件）
├── LESSONS_LEARNED.md # 经验教训记录
└── rules/
    ├── coding.md      # 编码规范
    ├── review.md      # 审查清单
    ├── best-practices.md  # 最佳实践
    └── {{specific}}.md    # 特定领域规范
```

### Rules 文件标准格式

```markdown
# {{规范标题}}

本规范适用于 {{场景}}。

---

## 规范结构

每个章节应包含：
1. **规则标题**
2. **规则级别** (强制/推荐/参考)
3. **代码示例**
4. **适用场景**

---

## 内容章节

### 1.1 {{子标题}}

- **强制** 规则描述
- **推荐** 规则描述

```typescript
// ✅ 正确示例
code example

// ❌ 错误示例
code example
```

---

最后更新: {{YYYY-MM-DD}}
```

---

## 质量检查清单

创建新的 Agent 配置时，确保：

- [ ] metadata 字段完整
- [ ] triggers 包含所有触发关键词
- [ ] model_hint 选择适当
- [ ] collaboration_patterns 定义完整
- [ ] rules 文件结构正确
- [ ] LESSONS_LEARNED 模板存在
- [ ] rules/ 目录包含 `coding.md` 和 `review.md`

---

## 规范遵循要求

### 规范层级体系

```
┌─────────────────────────────────────────────────────────────┐
│                     工程白皮书                                │
│  PROJECT_WHITEPAPER.md - 架构决策记录                        │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ 沉淀升级
                              │
        ┌─────────────────────┴─────────────────────┐
        │           项目级规范 (.claude/rules/)           │
        │  coding-standards.md, architecture.md           │
        └─────────────────────────────────────────────┘
                              ▲
                              │ 沉淀升级
                              │
        ┌─────────────────────┴─────────────────────┐
        │         Agent 规范 (per-agent rules/)         │
        │  .claude/agents/{agent}/rules/*.md           │
        └─────────────────────────────────────────────┘
```

### 执行前规范加载

每个 Agent 在执行任务前必须加载以下规范：

1. **项目级规范** (`{{RULES_DIR}}/`)
   - `coding-standards.md` - 通用编码规范
   - `architecture.md` - 架构原则
   - `naming-conventions.md` - 命名规范

2. **Agent 专属规范** (`{{AGENTS_DIR}}/{agent}/rules/`)
   - `coding.md` - 编码规范
   - `review.md` - 审查清单
   - `{domain}.md` - 领域特定规范

3. **白皮书当前决策** (`{{SPEC_DIR}}/PROJECT_WHITEPAPER.md`)
   - 当前 ADR (Architecture Decision Records)
   - 正在验证的规则
   - 关键决策

### 规范遵循检查清单

Agent 执行任务时，必须检查：

- [ ] 代码遵循 `coding-standards.md` 中的规范
- [ ] 架构遵循 `architecture.md` 中的原则
- [ ] 命名遵循 `naming-conventions.md` 中的约定
- [ ] Agent 专属规范被正确应用
- [ ] 当前 ADR 被遵守

### 规范偏差报告

如果遇到无法遵循的规范，必须报告：

```markdown
## 规范偏差报告

**任务**: {task-id}
**偏差规范**: {规范名称}
**原因**: {为什么无法遵循}
**替代方案**: {采取了什么替代方案}
**建议**: {是否需要更新规范}
```

---

最后更新: 2026-05-12