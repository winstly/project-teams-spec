# backend 编码规范

本规范适用于 backend 开发场景。

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

- **强制** 使用 TypeScript 进行后端开发
- **强制** 启用 strict 模式
- **强制** 所有函数参数和返回值有类型定义

```typescript
// ❌ 错误 - 缺少类型
function processUser(user) {
  return user.name;
}

// ✅ 正确 - 类型完整
interface User {
  id: string;
  name: string;
  email: string;
}

function processUser(user: User): string {
  return user.name;
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

- **强制** 每个模块/类/函数只负责一个功能
- **强制** 函数不超过 50 行
- **推荐** 使用组合优于继承

```typescript
// ❌ 错误 - 职责过多
class UserManager {
  createUser() { ... }
  validateEmail() { ... }
  sendWelcomeEmail() { ... }
  logActivity() { ... }
}

// ✅ 正确 - 职责分离
class UserService {
  createUser(data: CreateUserDTO): User { ... }
}

class EmailService {
  sendWelcomeEmail(user: User): void { ... }
}

class ActivityLogger {
  logUserCreation(userId: string): void { ... }
}
```

### 2.2 DRY 原则

- **强制** 避免重复代码
- **强制** 提取公共逻辑到工具函数
- **强制** 配置值使用常量

```typescript
// ❌ 错误 - 魔法值重复
if (status === 1) { ... }
if (status === 1) { ... }

// ✅ 正确 - 常量定义
const Status = {
  PENDING: 1,
  ACTIVE: 2,
  INACTIVE: 3,
} as const;

if (status === Status.ACTIVE) { ... }
```

---

## 审查要点

### 3.1 代码逻辑正确性

- [ ] 边界条件处理完整
- [ ] 空值/undefined 检查
- [ ] 类型安全保证
- [ ] 异常处理得当

### 3.2 安全性检查

- [ ] 无 SQL 注入风险
- [ ] 无 XSS 风险
- [ ] 敏感数据加密存储
- [ ] 权限验证完整

### 3.3 性能考虑

- [ ] 无 N+1 查询问题
- [ ] 正确使用缓存
- [ ] 资源正确释放
- [ ] 异步操作适当处理

---

## API 开发规范

### 4.1 RESTful 设计

- **强制** 使用标准 HTTP 方法
- **强制** 资源路径使用复数名词
- **强制** 统一的错误响应格式

```typescript
// ✅ RESTful 端点示例
app.get('/api/users', userController.list);
app.get('/api/users/:id', userController.get);
app.post('/api/users', userController.create);
app.put('/api/users/:id', userController.update);
app.delete('/api/users/:id', userController.delete);
```

### 4.2 输入验证

- **强制** 所有用户输入必须验证
- **强制** 使用成熟的验证库（zod, joi）
- **强制** 错误信息明确且有帮助

---

最后更新: 2026-05-12
