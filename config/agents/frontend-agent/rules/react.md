# React 编码规约

本规范基于 [阿里巴巴 f2e-spec](https://github.com/alibaba/f2e-spec) React 部分制定。

## JSX 编码风格

### 1.1 缩进

- **强制** JSX 语法使用 2 个空格缩进
- `eslint`: [react/jsx-indent](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-indent.md)

```jsx
// bad
<MyComponent
    superLongProp="bar"
    anotherSuperLongProp="baz"
>
    <Child />
</MyComponent>

// good
<MyComponent
  superLongProp="bar"
  anotherSuperLongProp="baz"
>
  <Child />
</MyComponent>
```

### 1.2 空格

- **强制** 自闭合标签的 `/` 前有且仅有一个空格
- **强制** JSX 行内属性之间只有一个空格
- **强制** JSX 属性大括号内两侧无空格
- **强制** JSX 属性等号两边不加空格
- `eslint`: [react/jsx-tag-spacing](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-tag-spacing.md)

```jsx
// bad
<Component/>
<Component prop = {value} />
<Component style={{ left: "20px" }} />

// good
<Component />
<Component prop={value} />
<Component style={{ left: '20px' }} />
```

### 1.3 引号

- **强制** JSX 属性使用双引号，JS 使用单引号
- `eslint`: [jsx-quotes](https://eslint.org/docs/rules/jsx-quotes)

```jsx
// bad
<Component style={{ left: '20px' }} />
<div className='container' />

// good
<Component style={{ left: "20px" }} />
<div className="container" />
```

### 1.4 标签

- **强制** 无子元素的标签使用自闭合标签
- **强制** 多行 JSX 标签需用小括号包裹
- `eslint`: [react/self-closing-comp](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md), [react/jsx-wrap-multilines](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-wrap-multilines.md)

```jsx
// bad
<Component variant="stuff"></Component>
return <MyComponent variant="long body" foo="bar">
  <MyChild />
</MyComponent>;

// good
<Component variant="stuff" />
return (
  <MyComponent variant="long body" foo="bar">
    <MyChild />
  </MyComponent>
);
```

### 1.5 Props 换行

- **强制** 多 props 换行时每个属性独占一行
- `eslint`: [react/jsx-max-props-per-line](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-max-props-per-line.md)

```jsx
// bad
<Foo superLongParam="bar"
     anotherSuperLongParam="baz" />

// good
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
/>
```

### 1.6 禁止的危险属性

- **强制** 禁止 `dangerouslySetInnerHTML` 与子元素同时使用
- **强制** HTML 自闭标签不能有子节点
- `eslint`: [react/no-danger-with-children](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-danger-with-children.md)

```jsx
// bad - HTML 自闭标签有子节点
<input><span>text</span></input>

// bad - dangerouslySetInnerHTML 与 children 冲突
<div dangerouslySetInnerHTML={{ __html: '...' }}>content</div>
```

## 组件设计

### 2.1 组件定义

- **强制** 使用函数组件，而非类组件（除非需要生命周期/状态）
- **强制** Props 使用 `interface` 定义

```tsx
// good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### 2.2 Props 命名

- **强制** Event handlers 使用 `on` 前缀 + 驼峰
- **强制** Boolean props 使用 `is`, `has`, `can` 前缀或描述性名称

```tsx
// good
<Modal
  isOpen={true}
  onClose={handleClose}
  hasBackdrop={true}
/>

// bad
<Modal
  open={true}
  close={handleClose}
  backdrop={true}
/>
```

### 2.3 组件文件结构

- **推荐** 组件文件按以下顺序组织：
  1. imports
  2. 类型定义
  3. 组件定义
  4. 样式（如果内联）

```tsx
// good
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
}

export function Button({ children }: ButtonProps) {
  return <button className={styles.button}>{children}</button>;
}
```

## Hooks 规范

### 3.1 useState

- **强制** State 更新函数使用 `set` 前缀
- **推荐** 复杂状态使用 `useReducer`

```tsx
// good
const [count, setCount] = useState(0);
const [state, dispatch] = useReducer(reducer, initialState);

// bad
const [count, updateCount] = useState(0);
```

### 3.2 useEffect

- **强制** 依赖数组必须包含所有外部依赖
- **强制** 清理函数返回 cleanup 函数
- **强制** 禁用相关的 lint 规则时必须添加注释说明

```tsx
// good
useEffect(() => {
  const subscription = subscribe(handleChange);
  return () => subscription.unsubscribe();
}, [handleChange]);

// bad - 没有依赖数组
useEffect(() => {
  subscribe(handleChange);
});
```

### 3.3 自定义 Hooks

- **推荐** 自定义 Hook 以 `use` 开头
- **推荐** 自定义 Hook 内部处理所有逻辑，暴露简洁 API

```tsx
// good
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

## 性能优化

### 4.1 Memoization

- **推荐** 使用 `React.memo` 避免不必要的重渲染
- **推荐** 使用 `useMemo` 缓存计算结果
- **推荐** 使用 `useCallback` 缓存回调函数

```tsx
// good
const MemoizedComponent = React.memo(ExpensiveComponent);

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

const memoizedCallback = useCallback(
  () => doSomething(a, b),
  [a, b],
);
```

### 4.2 列表渲染

- **强制** 列表渲染必须提供 `key` prop
- **推荐** 避免使用数组索引作为 `key`

```tsx
// good
{items.map((item) => (
  <ListItem key={item.id} {...item} />
))}

// bad
{items.map((item, index) => (
  <ListItem key={index} {...item} />
))}
```

## 状态管理

### 5.1 状态提升

- **强制** 状态放在最近公共父组件
- **强制** 避免不必要的状态提升

```tsx
// good - 状态在需要的地方
function Parent() {
  const [count, setCount] = useState(0);
  return <CountDisplay count={count} />;
}

// bad - 不需要提升的状态也提升
function Parent() {
  const [temp, setTemp] = useState('');
  return <Input value={temp} onChange={e => setTemp(e.target.value)} />;
}
```

### 5.2 Context 使用

- **推荐** Context 拆分到最小职责
- **推荐** 明确区分 Provider 和 Consumer

```tsx
// good - 最小职责 Context
const UserContext = createContext<User | null>(null);
const ThemeContext = createContext<Theme>(defaultTheme);

// bad - 一个大 Context 包所有
const AppContext = createContext({ user, theme, config, ... });
```

## 样式

### 6.1 CSS 方案优先级

1. **CSS Modules** - 组件作用域样式
2. **CSS-in-JS** (styled-components/emotion) - 需要动态样式时
3. **Tailwind CSS** - 快速原型和 Utility 类

### 6.2 样式规范

- **强制** 不使用行内样式（除动态计算值）
- **强制** 类名使用语义化命名

```tsx
// bad
<div style={{ color: 'red', marginTop: '10px' }} />

// good
<div className="user-card user-card--highlighted" />
```