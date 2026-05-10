# JavaScript 编码规约

本规范基于 [阿里巴巴 f2e-spec](https://github.com/alibaba/f2e-spec) 制定，面向 ECMAScript 6+。

## 编码风格

### 1.1 缩进

- **强制** 使用 2 个空格缩进，不使用 4 空格或 Tab
- `eslint`: [indent](https://eslint.org/docs/rules/indent)

```js
// bad
function foo() {
    let name;
}

// good
function foo() {
  let name;
}
```

### 1.2 分号

- **强制** 使用分号结束语句
- `eslint`: [semi](https://eslint.org/docs/rules/semi)

避免 ASI（自动分号插入）的怪异行为：

```js
// bad - Uncaught ReferenceError
const luke = {}
const leia = {}
[luke, leia].forEach((jedi) => {
  jedi.father = 'vader'
})

// good
const luke = {};
const leia = {};
[luke, leia].forEach((jedi) => {
  jedi.father = 'vader';
});
```

### 1.3 逗号

- **强制** 多行结构不使用行首逗号
- **强制** 多行结构始终加上最后一个逗号（trailing comma）
- `eslint`: [comma-style](https://eslint.org/docs/rules/comma-style), [comma-dangle](https://eslint.org/docs/rules/comma-dangle)

```js
// bad
const story = [
    once,
  , upon,
  , aTime,
];

// good
const story = [
  once,
  upon,
  aTime,
];
```

### 1.4 大括号 Egyptian Brackets

- **强制** 非空代码块采用 Egyptian Brackets 风格
- `eslint`: [brace-style](https://eslint.org/docs/rules/brace-style)

```js
// bad - K&R style
if (flag == 0) {
  System.out.println(say);
}

// good - Egyptian Brackets
if (flag == 0) {
  System.out.println(say);
} else {
  System.out.println("else");
}

// good - 空代码块简洁写法
if (flag == 0) {} else {}
```

### 1.5 空格

- **强制** 左括号与内容之间有空格
- **强制** 运算符左右必须加空格
- **强制** `if / for / while / switch / do` 与括号之间加空格
- `eslint`: [space-infix-ops](https://eslint.org/docs/rules/space-infix-ops)

```js
// bad
if(flag==0){...}
a+b*c
for(let i=0;i<10;i++){}

// good
if (flag == 0) {...}
a + b * c
for (let i = 0; i < 10; i++) {...}
```

### 1.6 行宽

- **推荐** 单行字符数不超过 100
- `editorconfig`: `max_line_length = 100`

```js
// bad - 超过 100 字符
const foo = someVeryLongFunctionName(argument1, argument2, argument3, argument4);

// good - 换行缩进 2 空格
const foo = someVeryLongFunctionName(
  argument1,
  argument2,
  argument3,
  argument4,
);
```

## 语言特性

### 2.1 字符串

- **推荐** 优先使用单引号
- **推荐** 使用模板字符串处理动态字符串

```js
// good
const name = 'Alice';
const greeting = `Hello, ${name}!`;
```

### 2.2 箭头函数

- **推荐** 使用箭头函数保留 `this` 上下文
- **推荐** 箭头函数体为单表达式时使用隐式返回

```js
// good
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);

// bad - 不必要的函数体
numbers.map((n) => {
  return n * 2;
});
```

### 2.3 解构

- **推荐** 使用对象/数组解构

```js
// good
const { name, age } = person;
const [first, second] = array;

// bad
const name = person.name;
const age = person.age;
```

### 2.4 模块

- **强制** 使用 ES6 模块（import/export）
- **强制** 不使用 `require()`，除非在 CommonJS 环境

```js
// good
import { foo } from './module';
export const bar = 1;

// bad
const foo = require('./module');
```

### 2.5 var/let/const

- **强制** 不使用 `var`，使用 `let` 或 `const`
- **强制** `const` 用于不可重新赋值的变量

```js
// bad
var count = 0;
count = 1; // 可变但用 var

// good
const count = 0;       // 不可变
let count = 0;         // 可变
count = 1;
```

## 注释规范

### 3.1 注释风格

- 使用 `//` 或 `/* */`，不适用 `#`
- 注释应解释「为什么」，而非「是什么」

### 3.2 JSDoc

- **推荐** 公共函数/类使用 JSDoc 注释
- 包含 `@param`, `@returns`, `@throws` 等标签

```js
/**
 * 计算两个数的和
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两数之和
 */
function add(a, b) {
  return a + b;
}
```

### 3.3 注释规则

- **强制** 代码审查相关注释使用 `@author`, `@since`, `@deprecated`
- **推荐** TODO/FIXME 使用统一格式

```js
// TODO(username): 补充测试用例
// FIXME(@username): 处理空值情况
```

## 命名规范

### 4.1 通用规则

- **强制** 命名不以 `_` 或 `$` 开头或结尾
- **强制** 不使用拼音与英文混合，不使用纯中文

```js
// bad
const _name = 'Alice';
const $name = 'Bob';
const 名字 = 'Charlie';
const mingzi = 'David';

// good
const firstName = 'Alice';
const lastName = 'Bob';
```

### 4.2 变量/函数

- **强制** `lowerCamelCase`

```js
const userName = 'Alice';
function getUserById(id) { ... }
```

### 4.3 类/构造函数

- **强制** `UpperCamelCase`

```js
class UserService {
  constructor() {}
}
class UserModel { ... }
```

### 4.4 常量

- **强制** `UPPER_SNAKE_CASE`

```js
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

### 4.5 布尔值

- **推荐** 布尔变量使用 `is`, `has`, `can`, `should` 前缀

```js
// good
const isActive = true;
const hasPermission = false;
const canEdit = true;

// bad
const active = true;
const permission = false;
```

## 最佳实践

### 5.1 错误处理

- **强制** 使用 `try-catch` 处理可能抛出异常的代码
- **强制** 在 `catch` 中至少记录错误日志

```js
// good
try {
  await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw error;
}

// bad - 吞掉错误
try {
  await fetchData();
} catch (error) {
  // nothing
}
```

### 5.2 异步处理

- **推荐** 优先使用 `async/await`，而非回调
- **推荐** 使用 `Promise.all()` 并行处理独立异步任务

```js
// good
const [users, orders] = await Promise.all([
  fetchUsers(),
  fetchOrders(),
]);

// bad
fetchUsers((users) => {
  fetchOrders((orders) => {
    // 回调嵌套
  });
});
```

### 5.3 数组方法

- **推荐** 使用 `map`, `filter`, `reduce` 替代命令式循环

```js
// good
const doubled = numbers.map((n) => n * 2);
const evens = numbers.filter((n) => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// bad
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
```

### 5.4 不可变性

- **推荐** 避免直接修改传入参数
- **推荐** 使用展开运算符创建新对象/数组

```js
// good
const newState = { ...state, count: state.count + 1 };
const newList = [...list, newItem];

// bad
state.count += 1;
list.push(newItem);
```

## 配套工具

### ESLint 配置

```bash
# 使用阿里巴巴 ESLint 配置
npm install eslint @eslint/js eslint-config-ali --save-dev
```

```js
// .eslintrc.js
module.exports = {
  extends: ['eslint-config-ali'],
  rules: {
    // 项目自定义规则
  },
};
```

### Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### EditorConfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true
max_line_length = 100
```