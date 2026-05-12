# frontend 编码规范

本规范适用于 frontend 开发场景。

---

## 规范结构

每个规则章节应包含：
1. **规则标题** - 明确的行为要求
2. **规则级别** - 强制/推荐/参考
3. **代码示例** - 展示正确和错误做法
4. **适用场景** - 何时应用此规则

---

## 代码风格

### 1.1 TypeScript/JavaScript 开发

- **强制** 使用 TypeScript 进行前端开发
- **强制** 启用 strict 模式
- **强制** 所有组件 Props 有类型定义

```typescript
// ❌ 错误 - 缺少类型
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

// ✅ 正确 - Props 类型完整
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return <button className={`btn-${variant}`} onClick={onClick}>{label}</button>;
}
```

### 1.2 代码格式化

- **强制** 遵循项目级 ESLint 规则
- **强制** 使用 Prettier 格式化代码
- **强制** 提交前运行 lint 检查

```bash
# 格式化命令
npm run lint
npm run format
```

---

## 最佳实践

### 2.1 单一职责原则

- **强制** 每个组件只负责一个功能
- **强制** 组件不超过 150 行
- **强制** 提取公共逻辑到 Hooks/工具函数

```typescript
// ❌ 错误 - 组件职责过多
function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [theme, setTheme] = useState('light');
  const [filters, setFilters] = useState({});
  // ... 200+ lines
}

// ✅ 正确 - 职责分离
function UserDashboard() {
  return (
    <ThemeProvider>
      <UserStats />
      <UserList />
    </ThemeProvider>
  );
}
```

### 2.2 DRY 原则

- **强制** 避免重复代码
- **强制** 提取重复样式到 CSS 类
- **强制** 提取公共逻辑到自定义 Hook

```typescript
// ❌ 错误 - 重复逻辑
function UserCard({ user }) {
  const formatted = new Date(user.createdAt).toLocaleDateString();
  return <div>{formatted}</div>;
}

function AdminCard({ admin }) {
  const formatted = new Date(admin.createdAt).toLocaleDateString();
  return <div>{formatted}</div>;
}

// ✅ 正确 - 提取 Hook
function useFormattedDate(date: string): string {
  return new Date(date).toLocaleDateString();
}
```

---

## 审查要点

### 3.1 代码逻辑正确性

- [ ] 状态管理清晰
- [ ] 生命周期处理正确
- [ ] 依赖数组完整
- [ ] 异常边界处理

### 3.2 性能检查

- [ ] 列表渲染有 key
- [ ] 正确使用 memo/useMemo/useCallback
- [ ] 无不必要的重渲染
- [ ] 图片/资源优化

### 3.3 Accessibility 检查

- [ ] 有意义的 alt 文本
- [ ] 键盘导航支持
- [ ] ARIA 属性正确使用
- [ ] 颜色对比度符合标准

---

## 组件开发规范

### 4.1 Props 定义

- **强制** 使用 interface 定义 Props
- **强制** 事件处理函数使用 on 前缀
- **强制** 布尔 prop 使用 is/has/can 前缀

```typescript
// ✅ Props 命名规范
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  hasBackdrop?: boolean;
}
```

### 4.2 状态管理

- **强制** 状态放在最近公共父组件
- **强制** 使用不可变方式更新状态
- **强制** 复杂状态使用 useReducer

---

最后更新: 2026-05-12
