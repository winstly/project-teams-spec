# TypeScript 编码规约

本规范基于 [阿里巴巴 f2e-spec](https://github.com/alibaba/f2e-spec) TypeScript 部分制定。

**注意**：本文未包含的编码风格说明均默认遵循《JavaScript 编码规约》。

## 类型系统

### 1.1 类型断言

- **强制** 使用 `as Type` 进行类型断言，禁止使用 `<Type>` 形式（JSX 冲突）
- `eslint`: [@typescript-eslint/consistent-type-assertions](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/consistent-type-assertions.md)

```ts
// bad
const value = <string>someValue;

// good
const value = someValue as string;
```

### 1.2 类型定义

- **推荐** 优先使用 `interface` 定义类型，`type` 用于联合类型或复杂类型别名
- `eslint`: [@typescript-eslint/consistent-type-definitions](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/consistent-type-definitions.md)

```ts
// good
interface User {
  id: number;
  name: string;
}

// good - 联合类型
type Status = 'pending' | 'active' | 'deleted';

// bad - 简单类型用 type
type Alias = string;
```

### 1.3 数组类型

- **推荐** 简单数组使用 `T[]`，复杂类型使用 `Array<T>`
- `eslint`: [@typescript-eslint/array-type](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/adjacent-overload-signatures.md)

```ts
// good
const names: string[];
const ages: Array<number>;

// bad
const names: Array<string>;
```

### 1.4 函数重载

- **强制** 重载的函数必须写在一起
- `eslint`: [@typescript-eslint/adjacent-overload-signatures](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/adjacent-overload-signatures.md)

```ts
// bad
function greet(name: string): void {}
function greet(): void {}

// good
function greet(): void;
function greet(name: string): void;
function greet(name?: string): void {
  // implementation
}
```

## 接口与类

### 2.1 成员可访问性

- **推荐** 使用 `readonly` 修饰只读属性
- **推荐** 类成员显式声明可访问性（`public`/`protected`/`private`）
- `eslint`: [@typescript-eslint/explicit-member-accessibility](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-member-accessibility.md)

```ts
// good
class UserService {
  private readonly baseUrl: string;
  public async getUser(id: number): Promise<User> {
    // ...
  }
  protected formatName(name: string): string {
    return name.toUpperCase();
  }
}
```

### 2.2 类字面量属性

- **推荐** 简单字面量属性使用 `readonly` 而非 getter
- `eslint`: [@typescript-eslint/class-literal-property-style](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/class-literal-property-style.md)

```ts
// good
class Constants {
  readonly VERSION = '1.0.0';
}

// bad
class Constants {
  get VERSION(): string {
    return '1.0.0';
  }
}
```

### 2.3 接口成员分隔符

- **强制** `interface`/`type` 成员使用 `;` 分隔
- `eslint`: [@typescript-eslint/member-delimiter-style](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-delimiter-style.md)

```ts
// good
interface User {
  id: number;
  name: string;
  email: string;
}

// bad
interface User {
  id: number
  name: string
}
```

## 类型安全

### 3.1 禁止类型操作注释

- **强制** 禁止使用 `// tslint:<rule-flag>` 等 tslint 注释
- **推荐** 使用 `// eslint-disable-next-line` 时需跟随描述说明
- `eslint`: [@typescript-eslint/ban-ts-comment](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-ts-comment.md)

```ts
// bad
// tslint:disable-next-line:no-console
console.log('debug');

// good
// eslint-disable-next-line no-console -- 用于调试
console.log('debug');
```

### 3.2 no-any

- **强制** 禁止使用 `any` 类型，使用 `unknown` 代替
- `eslint`: [@typescript-eslint/no-explicit-any](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-explicit-any.md)

```ts
// bad
function process(data: any) {
  return data.value; // 无类型检查
}

// good
function process<T extends { value: unknown }>(data: T): unknown {
  return data.value;
}
```

### 3.3 类型守卫

- **推荐** 使用类型守卫收窄类型

```ts
// good
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    // 这里的 value 被收窄为 string
    console.log(value.toUpperCase());
  }
}
```

## 泛型

### 4.1 泛型约束

- **推荐** 使用泛型约束避免类型断言

```ts
// good
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// bad
function getProperty(obj: any, key: string): any {
  return obj[key];
}
```

### 4.2 泛型命名

- **推荐** 泛型参数使用描述性名称（`T`, `K`, `V`, `U` 或具体含义）

```ts
// good
interface Map<K, V> { ... }
function toArray<T>(value: T): T[] { ... }

// bad
function process<x, y, z>(a: x, b: y): z { ... }
```

## 模块与导入

### 5.1 导入顺序

- **推荐** 导入顺序：框架 → 外部库 → 内部模块 → 相对导入 → 类型导入
- **强制** 类型导入使用 `import type`

```ts
// good
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/Button';
import type { User } from '@/types';

// bad
import type { User } from '@/types';
import { Button } from '@/components/Button';
```

### 5.2 命名导出

- **强制** 使用命名导出，便于 tree-shaking

```ts
// good
export const foo = 1;
export function bar() { ... }

// bad
export default function baz() { ... }
```

## null 和 undefined

### 6.1 空值检查

- **强制** 使用可选链 (`?.`) 和空值合并 (`??`)
- **强制** 避免使用 `== null` 检查，使用 `== null` 判断 `null/undefined`

```ts
// good
const name = user?.profile?.name ?? 'Anonymous';
if (value != null) { ... }

// bad
const name = user.profile && user.profile.name ? user.profile.name : 'Anonymous';
if (value !== null && value !== undefined) { ... }
```

## TSDoc

### 7.1 文档注释

- **推荐** 公共 API 使用 TSDoc 注释

```ts
/**
 * 计算订单总价
 *
 * @param items - 订单商品列表
 * @param taxRate - 税率，默认为 0.1
 * @returns 总价（含税）
 * @throws {ValidationError} 商品列表为空时抛出
 *
 * @example
 * ```ts
 * const total = calculateTotal([{ price: 100, quantity: 2 }], 0.08);
 * ```
 */
function calculateTotal(items: OrderItem[], taxRate = 0.1): number {
  // ...
}
```

## tsconfig 推荐配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```