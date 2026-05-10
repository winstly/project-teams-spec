# 前端代码审查规范

本规范整合自《修改软件的艺术》《代码整洁之道》《代码的未来》以及阿里巴巴 f2e-spec 前端规范。

## 审查维度

### 🔴 阻塞性问题 (Must Fix)

- 逻辑错误或安全漏洞
- 数据丢失或损坏风险
- 破坏核心功能
- 关键路径缺少错误处理

### 🟡 建议性问题 (Should Fix)

- 可维护性问题（过长函数、重复代码）
- 性能问题（不必要的重渲染、内存泄漏）
- 类型安全问题

### 💭 优化性问题 (Nit)

- 代码风格偏差
- 可进一步简化
- 命名可更清晰

---

## 审查清单

### 1. 命名与可读性

- [ ] 变量/函数名自解释，无需注释
- [ ] 使用 `lowerCamelCase` 命名变量/函数
- [ ] 使用 `UpperCamelCase` 命名组件/类
- [ ] 使用 `UPPER_SNAKE_CASE` 命名常量
- [ ] 布尔变量使用 `is/has/can/should` 前缀
- [ ] 避免缩写（除非是公认的技术缩写）
- [ ] 一词一概念（如统一使用 `get` 或 `fetch`，不混用）

### 2. 函数设计

- [ ] 函数不超过 20 行
- [ ] 函数只做一件事
- [ ] 参数不超过 3 个（使用选项对象）
- [ ] 无隐式副作用
- [ ] 无 boolean flag 参数
- [ ] 函数名使用动词

### 3. 组件设计

- [ ] 组件不超过 200 行
- [ ] Props 使用 `interface` 定义
- [ ] Props 类型安全（无 `any`）
- [ ] 无不必要的状态提升
- [ ] 状态不可变更新
- [ ] 组件单一职责

### 4. TypeScript 类型安全

- [ ] 无 `any` 类型
- [ ] 善用 `unknown` 和类型守卫
- [ ] 使用 `interface` 定义对象类型
- [ ] 使用 `readonly` 标记只读属性
- [ ] 可选属性正确标记 `?`
- [ ] 泛型约束避免类型断言

### 5. React Hooks

- [ ] 依赖数组完整
- [ ] `useEffect` 返回清理函数
- [ ] `setState` 使用函数式更新
- [ ] 自定义 Hook 名称以 `use` 开头
- [ ] 避免在渲染中创建新函数/对象

### 6. 错误处理

- [ ] API 调用有错误处理
- [ ] 错误信息对用户友好
- [ ] 无未捕获的 Promise  rejection
- [ ] 使用 `ErrorBoundary` 包裹可能出错的组件

### 7. 性能

- [ ] 列表渲染有 `key`
- [ ] 避免在 render 中创建新对象/函数
- [ ] 适当使用 `React.memo`
- [ ] 适当使用 `useMemo`/`useCallback`
- [ ] 动态导入实现代码分割
- [ ] 图片懒加载

### 8. 安全性

- [ ] 无 XSS 风险（React 自动转义）
- [ ] 用户输入正确验证
- [ ] 敏感数据不暴露在前端
- [ ] 无硬编码的密钥

### 9. 测试

- [ ] 关键逻辑有单元测试
- [ ] 组件有基本渲染测试
- [ ] 测试描述清晰
- [ ] 测试独立性（不依赖执行顺序）

### 10. 童子军规则

- [ ] 提交时代码比检出时更干净
- [ ] 修复发现的命名问题
- [ ] 消除发现的小重复
- [ ] 添加遗漏的测试

---

## 代码气味检测

识别需要重构的问题：

### 重复代码 (DRY 违反)
```tsx
// ❌ 重复的逻辑
const Button = ({ type }) => (
  <button className={type === 'primary' ? 'btn-primary' : 'btn-secondary'}>
);
const AnotherButton = ({ type }) => (
  <button className={type === 'primary' ? 'btn-primary' : 'btn-secondary'}>
);

// ✅ 提取共享逻辑
const getButtonClass = (type) =>
  type === 'primary' ? 'btn-primary' : 'btn-secondary';
```

### 过长函数
```tsx
// ❌ 超过 20 行
async function handleSubmit(data) {
  // ... 50+ lines
}

// ✅ 拆分为多个函数
const validateData = (data) => { ... };
const saveToServer = async (data) => { ... };
const showSuccess = () => { ... };
```

### 过深嵌套
```tsx
// ❌ 超过 3 层
if (user) {
  if (user.profile) {
    if (user.profile.settings) {
      return user.profile.settings.theme;
    }
  }
}

// ✅ 可选链 + 空值合并
return user?.profile?.settings?.theme ?? 'light';
```

---

## 审查原则

1. **具体明确** — 「第 42 行可能内存泄漏」而非「性能问题」
2. **解释原因** — 不仅仅说改什么，还要说为什么
3. **建议而非命令** — 「考虑用 X，因为 Y」而非「改成 X」
4. **一次完整** — 不要分多轮评论
5. **表扬好代码** — 表扬巧妙的设计和干净的代码