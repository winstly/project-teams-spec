# 前端最佳实践

本规范整合自《修改软件的艺术》《代码整洁之道》《代码的未来》，结合阿里巴巴 f2e-spec 前端规范。

## 代码质量原则

### 1.1 童子军规则

> 离开时，让代码比你发现时更干净。

每次修改文件时：
- 修复发现的命名不清
- 消除小重复
- 提取过长函数中的内聚段落
- 添加遗漏的测试

### 1.2 整洁代码的核心原则

| 原则 | 描述 |
|------|------|
| **单一职责** | 每个函数/组件只做一件事 |
| **开闭原则** | 对扩展开放，对修改关闭 |
| **里氏替换** | 子类可以替换父类而不破坏程序 |
| **接口隔离** | 多个专用接口优于一个臃肿接口 |
| **依赖反转** | 依赖抽象而非具体实现 |
| **DRY** | 不要重复自己 |

### 1.3 代码可读性

**命名即文档** — 如果需要注释解释变量名，说明命名不够清晰：

```ts
// bad - 需要注释
const d = new Date(); // d 是创建日期

// good - 自解释
const createdAt = new Date();
```

**函数名应描述行为，不描述实现**：

```ts
// bad
function processUserData(users) { ... }

// good
function getActiveUsers(users) { ... }
```

## 函数设计

### 2.1 短小精悍

- **强制** 函数不超过 20 行，理想 2-3 行
- **强制** 每个函数只做一件事
- **强制** 函数名使用动词或动词短语

```ts
// bad - 函数太长，做太多事
function processUsers(users, config, filters) {
  const sorted = users.sort((a, b) => a.name.localeCompare(b.name));
  const filtered = sorted.filter(u => u.isActive);
  const paginated = paginate(filtered, config.page);
  // ... 100+ lines
}

// good - 每个函数职责单一
function sortUsersByName(users: User[]): User[] {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}

function filterActiveUsers(users: User[]): User[] {
  return users.filter(u => u.isActive);
}

function paginateUsers(users: User[], page: number): User[] {
  const pageSize = 20;
  return users.slice((page - 1) * pageSize, page * pageSize);
}
```

### 2.2 参数规范

- **强制** 参数不超过 3 个（使用对象选项模式）
- **推荐** 使用对象解构替代位置参数
- **强制** 避免 flag 参数（布尔参数）

```ts
// bad - 太多参数
function createButton(label, variant, size, disabled, onClick, type) { ... }

// good - 对象选项模式
interface ButtonOptions {
  label: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

function createButton(options: ButtonOptions) { ... }
```

### 2.3 副作用控制

- **强制** 避免隐式副作用
- **推荐** 命令与查询分离（CQRS）

```ts
// bad - 副作用在预期之外
function setUsername(name: string) {
  sessionStorage.setItem('username', name); // 隐式写入存储
  return name;
}

// good - 明确告知副作用
function saveUsername(name: string): void {
  sessionStorage.setItem('username', name);
}
```

## 组件设计

### 3.1 组件职责单一

```tsx
// bad - 组件做太多事
function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [theme, setTheme] = useState('light');

  useEffect(() => { fetchUsers().then(setUsers); }, []);
  // ...200+ lines handling everything
}

// good - 拆分为专用组件
function UserDashboard() {
  return (
    <div>
      <ThemeProvider>
        <UserStats />
        <UserList />
      </ThemeProvider>
    </div>
  );
}
```

### 3.2 组合优于继承

```tsx
// bad - 过度使用继承
class SpecialButton extends Button extends Icon { ... }

// good - 使用组合
function IconButton({ icon, ...buttonProps }) {
  return (
    <Button {...buttonProps}>
      <Icon name={icon} />
    </Button>
  );
}
```

### 3.3 Props 接口定义

- **强制** 使用 `interface` 定义 Props
- **强制** 命名以 `Props` 结尾
- **推荐** 使用联合类型定义枚举式 Props

```tsx
// good
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

## 状态管理

### 4.1 状态本地化

- **强制** 状态放在最近公共父组件
- **强制** 避免不必要的状态提升

```tsx
// bad - 不需要提升的状态
function Parent() {
  const [input, setInput] = useState('');
  return <Input value={input} onChange={setInput} />;
}

// good - 本地管理
function Input() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
```

### 4.2 不可变性

- **强制** 不直接修改状态
- **强制** 使用展开运算符或 `Immutable.js` 创建新对象

```ts
// bad - 直接修改
users.push(newUser);

// good - 创建新数组
setUsers([...users, newUser]);

// good - 使用 Immer
produce(state, draft => {
  draft.users.push(newUser);
});
```

## 测试原则

### 5.1 测试优先

> 测试先行不是为了覆盖率，而是为了设计出可测的代码。

1. **先写测试** — 明确期望行为
2. **实现存根** — 让测试编译通过
3. **实现行为** — 让测试通过
4. **重构** — 测试保障

### 5.2 好的测试特质

- **快速** — 毫秒级执行
- **独立** — 彼此不依赖
- **可重复** — 每次结果一致
- **自验证** — 明确通过/失败
- **及时** — 与代码同步更新

### 5.3 测试结构 (Arrange-Act-Assert)

```ts
describe('UserService', () => {
  it('should return active users', () => {
    // Arrange
    const users = [
      { id: 1, name: 'Alice', isActive: true },
      { id: 2, name: 'Bob', isActive: false },
    ];

    // Act
    const activeUsers = getActiveUsers(users);

    // Assert
    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0].name).toBe('Alice');
  });
});
```

## 重构原则

### 6.1 小步前进

- 每次重构只做一件事
- 每步后运行测试确认无破坏
- 重构前必须有测试覆盖

### 6.2 重构时机

| 时机 | 操作 |
|------|------|
| 发现重复代码 | 提取函数 |
| 函数过长 | 拆分为多个函数 |
| 命名不清晰 | 重命名 |
| 参数过多 | 使用选项对象 |
| 嵌套过深 | 使用卫语句提早返回 |

### 6.3 代码气味

识别需要重构的信号：

- **重复代码** — DRY 原则违反
- **过长函数** — 超过 20 行
- **过长类** — 超过 200 行
- **过长参数列表** — 超过 3 个参数
- **过深嵌套** — 超过 3 层
- **霰弹式修改** — 一个变化影响多个文件
- **依恋情结** — 函数过多操作其他对象的数据
- **夸夸其谈的未来** — 过早优化的代码

## 注释规范

### 7.1 注释是失败的表现

> 如果你需要注释来解释代码，首先尝试重写代码。

- **强制** 代码自解释，注释为辅
- **强制** 注释解释「为什么」而非「是什么」
- **强制** 代码变更时同步更新注释

### 7.2 好的注释

```ts
// good - 解释为什么（非显而易见的决策）
// 使用 6 位而不是 8 位，是因为后端存储空间有限
const CODE_LENGTH = 6;

// good - 法律信息
// Copyright 2024 Example Corp

// good - TODO 标记
// TODO(username): 2024-06 需要添加缓存支持
```

### 7.3 应避免的注释

```
❌ // 检查 null
if (user == null)

// ❌ // 循环遍历用户
users.forEach(u => console.log(u))

// ❌ // 默认构造函数
constructor() {}

// ❌ // 删除的代码
// const oldCode = doSomething();
// doNewThing();
```

## 持续改进

### 8.1 代码审查 (Boy Scout Rule)

每次 Code Review：
1. 修复一处命名不清
2. 消除一个小重复
3. 简化一个复杂表达式
4. 添加一个遗漏的测试

### 8.2 小批次提交

- 每次提交只包含一个逻辑变更
- 提交信息描述「做了什么」和「为什么」
- 保持代码在可发布状态

### 8.3 意图导向编程

代码应该像一篇解释性的文章，而不是一系列指令：

```ts
// bad - 指令式
let total = 0;
for (let i = 0; i < orders.length; i++) {
  if (orders[i].status === 'completed') {
    total += orders[i].amount;
  }
}

// good - 意图明确
const completedOrders = orders.filter(o => o.isCompleted);
const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
```