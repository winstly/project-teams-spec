# code-review 代码审查规范

本规范定义代码审查的标准、流程和清单。

---

## 规范结构

每个审查类别应包含：
1. **检查项** - 具体可验证的条目
2. **严重程度** - Blocker/Suggestion/Nit
3. **代码示例** - 错误和正确对比
4. **审查要点** - 具体验证方法

---

## 审查流程

### 1.1 审查前准备

1. **理解需求** - 明确 PR 的目标和范围
2. **阅读描述** - 理解变更的背景和动机
3. **检查分支** - 确保基于最新 main 分支

### 1.2 审查优先级

| 优先级 | 标记 | 说明 |
|--------|------|------|
| Blocker | 🔴 | 必须修复才能合并 |
| Suggestion | 🟡 | 建议修复提升质量 |
| Nit | 💭 | 可选改进，风格偏好 |

---

## 审查清单

### 2.1 功能性检查

- [ ] 代码实现符合需求描述
- [ ] 边界条件处理完整
- [ ] 错误处理得当
- [ ] 单元测试覆盖核心逻辑

```typescript
// ❌ 功能缺陷示例
function getUserById(id: string): User {
  return users.find(u => u.id === id); // 未处理 undefined
}

// ✅ 功能完整
function getUserById(id: string): User | null {
  return users.find(u => u.id === id) ?? null;
}
```

### 2.2 安全性检查

- [ ] 无 SQL/NoSQL 注入风险
- [ ] 用户输入正确验证和转义
- [ ] 权限检查完整（认证+授权）
- [ ] 敏感数据不暴露在日志/响应中

```java
// ❌ 安全漏洞 - SQL 注入
String sql = "SELECT * FROM users WHERE name = '" + name + "'";

// ✅ 安全 - 参数化查询
String sql = "SELECT * FROM users WHERE name = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, name);
```

### 2.3 性能检查

- [ ] 无 N+1 查询问题
- [ ] 正确使用索引和缓存
- [ ] 资源正确释放（连接/流/文件）
- [ ] 异步操作适当处理

```typescript
// ❌ 性能问题 - N+1 查询
const users = await getUsers();
for (const user of users) {
  user.orders = await getOrdersByUserId(user.id); // N 次查询
}

// ✅ 性能优化 - 批量查询
const users = await getUsersWithOrders(); // 1 次查询
```

### 2.4 可维护性检查

- [ ] 命名清晰，自解释
- [ ] 注释适量（解释为什么，不是什么）
- [ ] 无重复代码（DRY）
- [ ] 函数/类职责单一

```typescript
// ❌ 可维护性差 - 魔法值
if (status === 1) { ... }

// ✅ 可维护性好 - 常量定义
const OrderStatus = {
  PENDING: 1,
  COMPLETED: 2,
} as const;

if (status === OrderStatus.COMPLETED) { ... }
```

---

## 审查注释格式

### 3.1 标准格式

```markdown
🔴 **{{类型}}: {{问题描述}}**
行 {{n}}: {{具体位置和问题}}
**影响**: {{问题后果}}
**建议**:
- {{修复方案1}}
- {{修复方案2}}
```

### 3.2 示例

```markdown
🔴 **Security: SQL Injection Risk**
行 42: 用户输入直接拼接到 SQL 语句中

**影响**: 攻击者可注入恶意 SQL 窃取数据

**建议**:
- 使用参数化查询
- 使用 ORM 框架的查询构建器

🟡 **Performance: N+1 Query**
行 15-25: 循环内调用数据库

**影响**: 100 条数据会产生 101 次查询

**建议**:
- 使用 JOIN 或批量查询
- 考虑缓存频繁访问的数据

💭 **Style: Magic Number**
行 5: 硬编码的超时值 5000

**建议**: 提取为常量 DEFAULT_TIMEOUT = 5000
```

---

## 审查原则

### 4.1 建设性反馈

- 使用"考虑..."而非"必须..."
- 解释**为什么**需要修改
- 提供具体的修复建议
- 认可好的设计和实现

### 4.2 避免事项

- 不要评论代码风格（lint 处理）
- 不要要求重构可工作但非最佳的代码
- 不要在 PR 中进行大幅度功能变更
- 不要忽略性能和安全性问题

---

最后更新: 2026-05-12
