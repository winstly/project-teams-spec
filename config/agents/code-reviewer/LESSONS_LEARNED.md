# code-reviewer 经验教训

本文档记录 code-reviewer 在项目执行中遇到的问题、解决方案和改进建议。

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

## 2026-05-09 遗漏的安全漏洞

**分类**: 安全
**严重程度**: 高
**关联阶段**: Phase 6 (review)

### 问题描述
代码审查未发现 SQL 注入漏洞，导致上线后被安全扫描发现。

### 发生了什么
开发者使用字符串拼接构建 SQL 查询，审查时未注意到这个安全风险。安全扫描工具在 CI 中检测到了问题。

### 如何避免
1. 审查时强制检查所有 SQL 构建代码
2. 要求使用参数化查询
3. 添加 SQL 注入检测规则到 CI
4. 建立安全审查清单

### 适用场景
- 数据库操作代码
- 用户输入处理
- 动态查询构建

### 代码示例

```java
// ❌ 错误做法 - SQL 注入风险
String sql = "SELECT * FROM users WHERE name = '" + userName + "'";

// ✅ 正确做法 - 参数化查询
String sql = "SELECT * FROM users WHERE name = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, userName);
```

---

最后更新: 2026-05-12
