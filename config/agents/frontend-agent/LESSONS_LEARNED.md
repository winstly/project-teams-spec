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

### 根因分析
{{root_cause}}

### 解决方案
{{solution}}

### 适用场景
{{applicable_scenarios}}

### 改进建议
{{improvement}}
```

---
最后更新: 2026-05-09

## 2026-05-10 跨平台路径处理问题

**分类**: 代码缺陷
**严重程度**: 高
**关联阶段**: Phase 7 (task-execute)

### 问题描述
使用 `path.join()` 在 Windows 环境下生成 Unix 风格的路径（如 `commands\pts\xxx.md` 而非 `commands/pts/xxx.md`），导致命令文件路径不一致。

### 根因分析
`path.join()` 会根据操作系统使用正确的路径分隔符，但在 CLI 工具场景中，路径分隔符应该是固定的（Unix 风格），因为生成的文件会被其他工具读取。

### 解决方案
改用 `path.posix.join()` 确保路径分隔符始终为 `/`（Unix 风格）。

### 适用场景
- CLI 工具生成配置文件时
- 需要确保路径跨平台一致时
- 生成 `.claude/` 等工具配置文件时

### 改进建议
在 `config/rules/coding-standards.md` 中添加跨平台路径处理规范。
