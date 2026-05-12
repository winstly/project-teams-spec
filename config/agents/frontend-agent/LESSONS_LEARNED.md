# frontend-agent 经验教训

本文档记录 frontend-agent 在项目执行中遇到的问题、解决方案和改进建议。

## 模板

```markdown
## {{date}} {{title}}

**分类**: {{category}}
**严重程度**: {{severity}}
**关联阶段**: {{phase}}

### 问题描述
{{problem}}

### 发生了什么
{{what_happened}}  <!-- 具体描述问题场景 -->

### 如何避免
{{prevention}}  <!-- 具体可操作的预防措施 -->

### 适用场景
{{applicable_scenarios}}

### 代码示例

<!-- 错误示例 -->
```{{language}}
// ❌ 错误做法
{{bad_code}}
```

<!-- 正确示例 -->
```{{language}}
// ✅ 正确做法
{{good_code}}
```
```

---

## 2026-05-10 跨平台路径处理问题

**分类**: 代码缺陷
**严重程度**: 高
**关联阶段**: Phase 7 (task-execute)

### 问题描述
使用 `path.join()` 在 Windows 环境下生成 Unix 风格的路径，导致命令文件路径不一致。

### 发生了什么
CLI 工具在 Windows 上生成的路径被解析为反斜杠，但其他工具期望正斜杠。生成的 `.claude/commands/pts/xxx.md` 文件无法被正确识别。

### 如何避免
1. CLI 工具生成路径时使用 `path.posix.join()` 确保跨平台一致
2. 配置文件的路径分隔符应统一为 `/`
3. 添加路径验证步骤确保格式正确

### 适用场景
- CLI 工具生成配置文件
- 跨平台工具开发
- Claude Code 命令生成

### 代码示例

```javascript
// ❌ 错误做法 - Windows 下生成错误路径
const filePath = path.join('.claude', 'commands', name + '.md');
// Windows: ".claude\commands\xxx.md" ❌

// ✅ 正确做法 - 统一 Unix 风格路径
const filePath = path.posix.join('.claude', 'commands', name + '.md');
// 任何平台: ".claude/commands/xxx.md" ✅
```

---

最后更新: 2026-05-12
