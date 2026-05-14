# qa-agent 经验教训

本文档记录 qa-agent 在项目执行中遇到的问题、解决方案和改进建议。

初始为空，经验教训将在项目执行过程中逐步积累。

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
void testBad() {
  // 缺少断言
}

// ✅ 测试覆盖完整
@Test
void testGood() {
  assertNotNull(result);
}
```

---

## 经验教训

（初始为空 - 将在项目执行中积累）