# qa-agent 经验教训

本文档记录 qa-agent 在项目执行中遇到的问题、解决方案和改进建议。

## 模板

```markdown
## {{date}} {{title}}

**分类**: {{category}}
**严重程度**: {{severity}}
**关联阶段**: {{phase}}

### 问题描述
{{problem}}

### 发生了什么
{{what_happened}}

### 如何避免
{{prevention}}

### 适用场景
{{applicable_scenarios}}

### 测试示例

```{{language}}
// ❌ 测试覆盖不足
@Test
void testUserCreation() {
  userService.create(new User());
  // 缺少断言
}

// ✅ 测试覆盖完整
@Test
void testUserCreation() {
  User created = userService.create(new User("Alice", "alice@test.com"));
  assertNotNull(created.getId());
  assertEquals("Alice", created.getName());
}
~~~
```

---

## 2026-05-09 边界条件测试遗漏

**分类**: 测试覆盖
**严重程度**: 中
**关联阶段**: Phase 5 (test)

### 问题描述
生产环境出现空指针异常，测试全部通过但遗漏了 null 检查。

### 发生了什么
测试只覆盖了正常路径，未测试 null 输入、边界值、空集合等场景。

### 如何避免
1. 建立边界条件检查清单
2. 使用 parameterized test 覆盖多个边界值
3. 添加 mutation testing 验证测试质量
4. 建立测试覆盖率门禁

### 适用场景
- API 参数验证测试
- 数据处理逻辑测试
- 集合操作测试

### 测试示例

```java
// ❌ 测试覆盖不足
@Test
void testUserCreation() {
  userService.create(new User());
  // 缺少断言
}

// ✅ 测试覆盖完整
@Test
void testUserCreation() {
  User created = userService.create(new User("Alice", "alice@test.com"));
  assertNotNull(created.getId());
  assertEquals("Alice", created.getName());
}
```

---

最后更新: 2026-05-12