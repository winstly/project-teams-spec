# backend-agent 经验教训

本文档记录 backend-agent 在项目执行中遇到的问题、解决方案和改进建议。

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

## 2026-05-09 数据库连接池耗尽问题

**分类**: 性能
**严重程度**: 高
**关联阶段**: Phase 5 (implement)

### 问题描述
高并发场景下数据库连接池耗尽，导致请求超时。

### 发生了什么
服务在高峰期出现大量连接超时错误，日志显示 "Connection pool exhausted"。根因是连接池配置过小（max=10），且存在连接泄漏（未关闭PreparedStatement）。

### 如何避免
1. 根据预估并发量合理配置连接池大小
2. 使用 try-with-resources 确保资源释放
3. 添加连接池监控和告警
4. 实现连接池的健康检查

### 适用场景
- 高并发API服务
- 数据库密集型应用
- 微服务架构

### 代码示例

```java
// ❌ 错误做法 - 连接泄漏
Connection conn = dataSource.getConnection();
PreparedStatement ps = conn.prepareStatement(sql);
ResultSet rs = ps.executeQuery();
// 未关闭任何资源

// ✅ 正确做法 - try-with-resources
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql);
     ResultSet rs = ps.executeQuery()) {
    // 处理结果
} // 自动关闭
```

---

最后更新: 2026-05-12
