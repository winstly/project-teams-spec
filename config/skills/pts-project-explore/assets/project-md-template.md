# {{project_name}}

## 项目概览

- **项目路径**: {{project_path}}
- **分析时间**: {{analyzed_at}}
- **复杂度等级**: {{complexity_level}}（待 complexity-evaluate 阶段确定）

## 技术栈

### 前端技术
{{#if frontend}}
- **框架**: {{frontend.framework}}
- **UI 库**: {{frontend.ui_library}}
- **构建工具**: {{frontend.build_tool}}
- **包管理器**: {{frontend.package_manager}}
{{/if}}

### 后端技术
{{#if backend}}
- **语言**: {{backend.language}}
- **框架**: {{backend.framework}}
- **构建工具**: {{backend.build_tool}}
{{/if}}

### 数据库与存储
{{#if database}}
- **数据库**: {{database.type}} ({{database.product}})
- **ORM**: {{database.orm}}
{{/if}}

### 基础设施
{{#if infrastructure}}
- **容器**: {{infrastructure.container}}
- **云服务**: {{infrastructure.cloud}}
- **CI/CD**: {{infrastructure.cicd}}
{{/if}}

## 项目结构

```
{{project_structure}}
```

### 目录说明

| 目录 | 说明 | 重要度 |
|------|------|--------|
{{#each directories}}
| {{path}} | {{description}} | {{importance}} |
{{/each}}

## 模块依赖

```
{{module_dependency_graph}}
```

### 核心模块

{{#each core_modules}}
#### {{name}}
- **路径**: {{path}}
- **职责**: {{responsibility}}
- **依赖**: {{dependencies}}
{{/each}}

## 架构风格

{{architecture_style}}

### 架构特点

{{architecture_characteristics}}

## 匹配的工具与规则

### 匹配的 Agent

| Agent | 匹配原因 |
|-------|---------|
{{#each matched_agents}}
| {{name}} | {{reason}} |
{{/each}}

### 适用的规则

| 规则 | 适用原因 |
|------|---------|
{{#each matched_rules}}
| {{name}} | {{reason}} |
{{/each}}

## 已知约束

{{#if constraints}}
{{constraints}}
{{else}}
暂无特定约束。
{{/if}}

## 待澄清问题

{{#if questions}}
- {{questions}}
{{else}}
暂无待澄清问题。
{{/if}}

## 建议

{{recommendations}}