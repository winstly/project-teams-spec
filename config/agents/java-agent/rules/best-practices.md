# Java 最佳实践

本规范整合自《修改软件的艺术》《代码整洁之道》《阿里 Java 编码规范》，涵盖软件工艺与工程实践。

## 软件工艺原则

### 1.1 童子军规则

> 让代码比你发现时更干净。

每次修改文件时：
- 修复发现的命名问题
- 消除小重复
- 提取过长方法中的内聚段落
- 添加缺失的测试

### 1.2 整洁代码大师原则

| 大师 | 观点 |
|------|------|
| Bjarne Stroustrup | 整洁代码高效、直接、不隐藏 bug |
| Grady Booch | 整洁代码如好散文般简洁直接 |
| Dave Thomas | 必须有测试，测试是唯一真正的 spec |
| Michael Feathers | 整洁代码是关心代码的人写的 |
| Ron Jeffries | 运行所有测试 → 无重复 → 表达意图 → 最小类和方法的数量 |

### 1.3 核心原则

| 原则 | 描述 |
|------|------|
| **单一职责 (SRP)** | 类/方法只有一个改变的理由 |
| **开闭原则 (OCP)** | 对扩展开放，对修改关闭 |
| **里氏替换 (LSP)** | 子类可替换父类 |
| **接口隔离 (ISP)** | 多个专用接口优于臃肿接口 |
| **依赖反转 (DIP)** | 依赖抽象，不依赖具体 |
| **DRY** | 不要重复自己 |
| **童子军规则** | 每次离开时代码比来时更干净 |

## 方法设计

### 2.1 短小精悍

- **强制** 方法不超过 20 行，理想 5-10 行
- **强制** 方法只做一件事
- **强制** 方法名使用动词或动词短语

```java
// bad - 方法过长，做太多事
public void processOrder(Order order, Customer customer, 
    Payment payment, Inventory inventory) {
    // ... 200+ lines
}

// good - 每个方法职责单一
public void validateOrder(Order order) { ... }
public void reserveInventory(Order order, Inventory inventory) { ... }
public void chargePayment(Order order, Payment payment) { ... }
public void sendConfirmation(Order order, Customer customer) { ... }
```

### 2.2 参数规范

- **强制** 参数不超过 3 个（使用参数对象模式）
- **强制** 参数对象使用不可变类
- **强制** 避免 boolean flag 参数

```java
// bad - 太多参数
public User createUser(String name, String email, boolean isAdmin, 
    boolean isActive, LocalDateTime createdAt) { ... }

// good - 参数对象
public User createUser(CreateUserRequest request) {
    // request 是不可变对象
}
```

### 2.3 命令与查询分离

- **强制** 方法要么执行操作，要么返回答案，不同时做

```java
// bad - 既有返回值又有副作用
public boolean setUsername(String name) {
    this.name = name;
    return true; // 副作用
}

// good - 分离
public void setUsername(String name) { ... }          // 命令
public String getUsername() { return this.name; }      // 查询
```

### 2.4 异常优于错误码

- **强制** 使用异常而非错误码（避免嵌套 if-else）
- **强制** 优先使用非受检异常（RuntimeException）
- **强制** 异常类包含足够的上下文信息

```java
// bad - 错误码级联
public Result processOrder(Order order) {
    if (!validate(order)) return Result.INVALID_ORDER;
    if (!checkInventory(order)) return Result.OUT_OF_STOCK;
    if (!charge(order)) return Result.PAYMENT_FAILED;
    return Result.SUCCESS;
}

// good - 异常分离正常流程
public void processOrder(Order order) {
    validateOrder(order);
    reserveInventory(order);
    chargePayment(order);
}
```

## 类设计

### 3.1 类的组织结构

```java
public class UserService {
    // 1. 常量
    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);

    // 2. 静态变量
    private static final int MAX_RETRY = 3;

    // 3. 实例变量
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 4. 构造函数
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // 5. 公共方法（按调用顺序或重要性排列）
    public User createUser(CreateUserRequest request) { ... }
    public Optional<User> findById(Long id) { ... }

    // 6. 私有方法（被公共方法调用）
    private void validateEmail(String email) { ... }
    private String encodePassword(String raw) { ... }
}
```

### 3.2 单一职责原则

- **强制** 类只有一个改变的理由
- **强制** 类名应精确描述职责

```java
// bad - 上帝类
public class UserManager { // 负责：创建、验证、权限、通知、报表...
    public void createUser() { ... }
    public boolean validateCredentials() { ... }
    public boolean hasPermission() { ... }
    public void sendEmail() { ... }
    public UserReport generateReport() { ... }
}

// good - 职责分离
public class UserService { }      // 用户 CRUD
public class AuthService { }      // 身份验证
public class PermissionService { } // 权限管理
public class NotificationService { } // 通知发送
public class UserReportService { } // 报表生成
```

### 3.3 内聚性

- **强制** 方法应使用类的大部分实例变量
- **强制** 当类失去内聚时拆分

## 面向对象原则

### 4.1 数据与对象的非对称性

| 类型 | 特点 |
|------|------|
| **对象** | 暴露行为，隐藏数据 |
| **数据结构** | 暴露数据，无行为 |

- **强制** 避免「混杂」类（半对象半数据结构）
- **强制** Active Record 模式不做业务对象使用

### 4.2 里氏替换原则

```java
// bad - 违反 LSP，子类行为与父类期望不符
public abstract class Rectangle {
    public abstract void setWidth(double width);
    public abstract void setHeight(double height);
}

public class Square extends Rectangle {
    @Override
    public void setWidth(double width) {
        super.setWidth(width);
        super.setHeight(width); // 改变了 Square 的高！
    }
}

// good - 使用抽象或重新设计
```

### 4.3 依赖倒置

```java
// bad - 依赖具体实现
public class OrderService {
    private MySqlOrderRepository repo = new MySqlOrderRepository();
}

// good - 依赖抽象
public class OrderService {
    private final OrderRepository repo; // 接口

    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }
}
```

## 测试原则

### 5.1 测试驱动开发 (TDD)

> 先写测试，让测试驱动设计出可测的代码。

**TDD 循环**:
1. 🔴 写一个失败的测试（明确期望）
2. ⚠️ 写最小实现让测试通过
3. 🟡 重构（测试保障）

### 5.2 好的单元测试特质

- **快速** — 毫秒级
- **独立** — 彼此不依赖
- **可重复** — 每次结果一致
- **自验证** — 自动判断通过/失败
- **及时** — 与代码同步更新

### 5.3 FIRST 原则

| 原则 | 说明 |
|------|------|
| **Fast** | 快速执行 |
| **Independent** | 测试间无依赖 |
| **Repeatable** | 可重复执行 |
| **Self-Validating** | 自动验证结果 |
| **Timely** | 与代码同步编写 |

### 5.4 测试结构 (Given-When-Then)

```java
// bad - 测试与实现混在一起
@Test
public void testCreateUser() {
    UserService service = new UserService();
    // ...
}

// good - 结构清晰
@Test
public void testCreateUser_withValidData_shouldReturnCreatedUser() {
    // Given
    CreateUserRequest request = CreateUserRequest.builder()
        .name("Alice")
        .email("alice@example.com")
        .build();

    // When
    User result = userService.createUser(request);

    // Then
    assertThat(result.getId()).isNotNull();
    assertThat(result.getName()).isEqualTo("Alice");
    assertThat(result.getEmail()).isEqualTo("alice@example.com");
}
```

## 重构原则

### 6.1 小步前进

1. 每次重构只做一件事
2. 每步后运行测试确认无破坏
3. 重构前必须有测试覆盖

### 6.2 常见重构模式

| 重构 | 何时使用 |
|------|----------|
| 提取方法 | 方法超过 10 行 |
| 提取参数对象 | 参数超过 3 个 |
| 提取类 | 类有多个职责 |
| 提取接口 | 多个实现需要抽象 |
| 用策略替换条件 | 多分支条件 |
| 用模板方法替换重复 | 结构相同细节不同 |

### 6.3 代码气味

识别需要重构的信号：

- **重复代码** — DRY 违反
- **过长方法** — 超过 20 行
- **过大类** — 超过 300 行
- **过长参数列表** — 超过 3 个
- **过深嵌套** — 超过 3 层
- **霰弹式修改** — 一个变化影响多处
- **依恋情结** — 方法过多操作其他对象
- **夸夸其谈的未来** — 过早抽象

## 注释规范

### 7.1 注释是失败的表现

> 如果需要注释解释代码，首先尝试重写代码。

- **强制** 代码自解释，注释为辅
- **强制** 注释解释「为什么」，而非「是什么」
- **强制** 代码变更时同步更新注释

### 7.2 好的 Javadoc

```java
/**
 * 创建新用户
 *
 * @param request 创建用户请求
 * @return 创建的用户，不存在返回 null
 * @throws IllegalArgumentException 请求参数无效
 * @throws DuplicateEmailException 邮箱已存在
 */
public User createUser(CreateUserRequest request) { ... }
```

### 7.3 应避免的注释

```
❌ 代码注释
// 检查用户是否为空
if (user == null)

// ❌ 默认构造函数
/**
 * 默认构造函数
 */
public UserService() {}

// ❌ 已删除的代码
// oldCode();
```

## 软件工艺价值观

### 8.1 职业责任感

作为专业开发者：
- 编写代码是为了他人而非机器
- 代码需要被阅读、维护、扩展
- 「童子军规则」— 每次离开时代码更干净
- 抵制为了进度牺牲代码质量的压力

### 8.2 持续改进

- **持续重构** — 保持代码健康
- **小批次** — 每次提交一个逻辑变更
- **意图导向** — 代码如解释性文章，不是一系列指令

### 8.3 Kent Beck 简单设计四规则（按重要性排序）

1. **运行所有测试** — 验证系统工作
2. **无重复** — DRY 原则
3. **表达意图** — 代码清晰表达思想
4. **最小类和方法的数量** — 在前三条满足后追求

> 优先级：测试 > 重复 > 表达 > 精简