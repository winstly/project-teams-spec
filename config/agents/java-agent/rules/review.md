# Java 代码审查规范

本规范整合自《修改软件的艺术》《代码整洁之道》《阿里 Java 编码规范》。

## 审查维度

### 🔴 阻塞性问题 (Must Fix)

- 安全漏洞（SQL 注入、XSS、权限绕过）
- 数据丢失或损坏风险
- 破坏 API 契约
- 关键路径缺少错误处理
- 线程安全问题

### 🟡 建议性问题 (Should Fix)

- 可维护性问题（过长方法、重复代码）
- 性能问题（N+1 查询、内存泄漏）
- 类型安全问题
- 违反 OOP 原则

### 💭 优化性问题 (Nit)

- 代码风格偏差
- 可进一步简化
- 命名可更清晰

---

## 审查清单

### 1. 命名与可读性

- [ ] 类名使用 `UpperCamelCase`
- [ ] 方法/变量使用 `lowerCamelCase`
- [ ] 常量使用 `UPPER_SNAKE_CASE`
- [ ] 命名自解释，无需注释
- [ ] 包名使用单数、小写
- [ ] 避免拼音或缩写
- [ ] 无 `I` 前缀的接口名

### 2. 方法设计

- [ ] 方法不超过 20 行
- [ ] 方法只做一件事
- [ ] 参数不超过 3 个（使用参数对象）
- [ ] 无隐式副作用
- [ ] 无 boolean flag 参数
- [ ] 方法名使用动词

### 3. 面向对象原则

- [ ] 类符合单一职责原则（SRP）
- [ ] 依赖抽象而非具体（针对注入的依赖）
- [ ] 避免「混杂」类（半对象半数据结构）
- [ ] 无上帝类
- [ ] 优先组合而非继承
- [ ] 实例变量在顶部声明

### 4. 异常处理

- [ ] 使用异常而非错误码
- [ ] 优先非受检异常
- [ ] 不过度捕获异常
- [ ] 异常信息包含上下文
- [ ] 正确使用 try-with-resources
- [ ] finally 中正确关闭资源

### 5. 并发安全

- [ ] 不直接使用 `Executors` 创建线程池
- [ ] `SimpleDateFormat` 不定义为 static
- [ ] 可变共享状态使用同步机制
- [ ] 多资源加锁保持一致顺序
- [ ] 使用线程安全的集合

### 6. 集合处理

- [ ] 重写 `equals` 时必须重写 `hashCode`
- [ ] `subList` 不强转为 `ArrayList`
- [ ] 集合转数组使用 `toArray(T[])`
- [ ] `Arrays.asList()` 不使用修改方法
- [ ] foreach 循环中不进行 remove/add
- [ ] 使用 `Iterator` 进行安全删除

### 7. SQL 与数据库

- [ ] 使用参数化查询（防注入）
- [ ] 避免字符串拼接 SQL
- [ ] 批量操作优化
- [ ] 正确使用事务边界

### 8. 日志规范

- [ ] 使用 SLF4J API
- [ ] 使用条件输出或占位符
- [ ] 禁止 `System.out`/`e.printStackTrace`
- [ ] 日志级别正确（error/warn/info/debug）
- [ ] 日志中无敏感信息

### 9. 测试

- [ ] 单元测试覆盖核心逻辑
- [ ] 使用 JUnit 5 / TestNG
- [ ] 测试命名描述性
- [ ] 使用 Given-When-Then 结构
- [ ] 测试独立性（不相互依赖）
- [ ] Mock 外部依赖

### 10. 童子军规则

- [ ] 提交时代码比检出时更干净
- [ ] 修复发现的命名问题
- [ ] 消除发现的小重复
- [ ] 添加遗漏的测试

---

## 代码气味检测

识别需要重构的问题：

### 重复代码 (DRY 违反)
```java
// ❌ 重复的逻辑
public double calculateDiscount(Order order) {
    if (order.getType() == OrderType.VIP) {
        return order.getAmount() * 0.2;
    }
    return order.getAmount() * 0.1;
}

public double calculatePoints(Order order) {
    if (order.getType() == OrderType.VIP) {
        return order.getAmount() * 0.2;
    }
    return order.getAmount() * 0.1;
}

// ✅ 提取为公共方法
private double getDiscountRate(OrderType type) {
    return type == OrderType.VIP ? 0.2 : 0.1;
}
```

### 过长方法
```java
// ❌ 超过 20 行
public void processOrder(Order order) {
    // ... 50+ lines
}

// ✅ 拆分为多个方法
public void processOrder(Order order) {
    validateOrder(order);
    calculatePrice(order);
    applyDiscount(order);
    saveOrder(order);
    sendNotification(order);
}
```

### 过深嵌套
```java
// ❌ 超过 3 层
if (user != null) {
    if (user.getProfile() != null) {
        if (user.getProfile().getSettings() != null) {
            return user.getProfile().getSettings().getTheme();
        }
    }
}

// ✅ 卫语句提早返回
if (user == null || user.getProfile() == null) {
    return "light";
}
return user.getProfile().getSettings().getTheme();
```

### 上帝类
```java
// ❌ 一个类做所有事
public class OrderManager {
    // CRUD + 库存 + 支付 + 通知 + 报表 + ...
}

// ✅ 职责分离
public class OrderService { }       // 订单处理
public class InventoryService { }    // 库存管理
public class PaymentService { }      // 支付处理
public class NotificationService { }  // 通知发送
```

---

## 审查原则

1. **具体明确** — 「第 42 行可能导致 NPE」而非「空指针风险」
2. **解释原因** — 不仅仅说改什么，还要说为什么
3. **建议而非命令** — 「考虑用 X，因为 Y」而非「改成 X」
4. **一次完整** — 不要分多轮评论
5. **表扬好代码** — 表扬 SOLID 设计模式和干净的代码

---

## 参考标准

- 《代码整洁之道》— Robert C. Martin
- 《修改软件的艺术》— David Scott Bernstein
- 《阿里巴巴 Java 开发手册》