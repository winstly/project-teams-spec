# Java 8 函数式编程规范

本规范基于《Java 8 函数式编程》，涵盖 Lambda 表达式、Stream API、Optional、函数式接口等核心实践。

## Lambda 表达式

### 1.1 何时使用 Lambda

- **强制** 仅用于函数式接口（只有一个抽象方法的接口）
- **推荐** 短小代码使用 Lambda，长逻辑抽取为方法引用

```java
// good - 简洁表达
list.forEach(item -> System.out.println(item));

// good - 逻辑复杂时使用方法引用
list.forEach(this::processItem);

private void processItem(Item item) {
  // 多行逻辑
  validate(item);
  transform(item);
  save(item);
}
```

### 1.2 Lambda 作用域

- Lambda 可以访问**静态变量、实例变量、局部变量**
- **强制** 局部变量必须是 final 或 effectively final

```java
// bad - 局部变量被修改
int count = 0;
list.forEach(item -> {
  count++;  // 编译错误
});

// good - 使用 AtomicInteger
AtomicInteger count = new AtomicInteger(0);
list.forEach(item -> count.incrementAndGet());

// good - 收集到列表
List<Item> filtered = new ArrayList<>();
list.forEach(item -> {
  if (item.isActive()) filtered.add(item);
});
```

## 函数式接口

### 2.1 常用函数式接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `Predicate<T>` | `test(T)` | 布尔判断 |
| `Function<T,R>` | `apply(T)` | 转换 |
| `Consumer<T>` | `accept(T)` | 消费 |
| `Supplier<T>` | `get()` | 生产 |
| `UnaryOperator<T>` | `apply(T)` | 一元操作 |
| `BinaryOperator<T>` | `apply(T,T)` | 二元操作 |

### 2.2 方法引用

- **推荐** 优先使用方法引用而非 Lambda 表达式

```java
// 构造函数引用
List<String> ids = users.stream()
  .map(User::getId)
  .collect(Collectors.toList());

// 静态方法引用
list.stream()
  .map(String::trim)
  .map(String::toLowerCase)
  .collect(Collectors.toList());

// 实例方法引用
list.forEach(System.out::println);
```

## Stream API

### 3.1 基本原则

- **强制** Stream 仅使用一次，遍历后不能重用
- **强制** 链式操作不超过 5 个，超过则拆分为多个中间变量
- **强制** 大集合优先使用 parallelStream（但需确保无状态问题）

```java
// bad - 超过5个操作，链过长难读
return users.stream()
  .filter(u -> u.isActive())
  .map(u -> u.getName())
  .map(String::trim)
  .map(String::toLowerCase)
  .sorted()
  .map(String::toUpperCase)
  .collect(Collectors.toList());

// good - 拆分中间步骤
Stream<String> activeUserNames = users.stream()
  .filter(User::isActive)
  .map(User::getName);

List<String> result = activeUserNames
  .map(String::trim)
  .map(String::toLowerCase)
  .sorted()
  .collect(Collectors.toList());
```

### 3.2 惰性求值

- **强制** 理解中间操作（惰性）和终端操作（及早）的区别
- **强制** 没有终端操作的 Stream 不会执行

```java
// bad - 没有终端操作，什么都不会执行
users.stream()
  .filter(u -> {
    System.out.println("Filtering " + u.getName());  // 不会输出
    return u.isActive();
  });

// good - 有终端操作
users.stream()
  .filter(u -> u.isActive())
  .forEach(u -> System.out.println(u.getName()));  // 执行
```

### 3.3 collect 收集器

```java
// 收集为 List
List<String> names = users.stream()
  .map(User::getName)
  .collect(Collectors.toList());

// 收集为 Set
Set<String> uniqueNames = users.stream()
  .map(User::getName)
  .collect(Collectors.toSet());

// 收集为 Map
Map<String, User> nameMap = users.stream()
  .collect(Collectors.toMap(User::getName, Function.identity()));

// 分组
Map<String, List<User>> byRole = users.stream()
  .collect(Collectors.groupingBy(User::getRole));

// 分区
Map<Boolean, List<User>> partitioned = users.stream()
  .collect(Collectors.partitioningBy(User::isActive));

// 拼接
String csv = users.stream()
  .map(User::getName)
  .collect(Collectors.joining(", "));
```

### 3.4 常用操作

```java
// filter - 过滤
users.stream()
  .filter(u -> u.getAge() >= 18)
  .filter(User::isActive)
  .collect(toList());

// map - 转换
List<String> emails = users.stream()
  .map(User::getEmail)
  .filter(Objects::nonNull)
  .collect(toList());

// flatMap - 扁平化
List<String> allTags = posts.stream()
  .flatMap(post -> post.getTags().stream())  // 每个post的多个tag展平
  .distinct()
  .collect(toList());

// reduce - 聚合
int totalAge = users.stream()
  .map(User::getAge)
  .reduce(0, Integer::sum);

// findFirst / findAny
Optional<User> admin = users.stream()
  .filter(User::isAdmin)
  .findFirst();

// anyMatch / allMatch / noneMatch
boolean hasInactive = users.stream().anyMatch(u -> !u.isActive());
boolean allAdult = users.stream().allMatch(u -> u.getAge() >= 18);
```

### 3.5 并行流

- **强制** 并行流仅用于无状态、非阻塞、顺序无关的操作
- **强制** 避免使用并行流处理大数据量 I/O
- **强制** parallelStream 默认使用 ForkJoinPool.commonPool

```java
// good - 无状态，适合并行
long count = largeList.parallelStream()
  .filter(item -> item.isValid())
  .count();

// bad - 有状态，不适合并行
Set<Integer> seen = ConcurrentHashMap.newKeySet();
list.parallelStream().forEach(item -> seen.add(item.getId()));  // 有竞争

// good - 使用 reduce
int sum = list.parallelStream()
  .mapToInt(Item::getValue)
  .sum();
```

## Optional

### 4.1 核心原则

- **强制** 不要用 Optional 作为方法参数类型，使用重载
- **强制** 不要用 `Optional.get()` 而不使用 `isPresent()` 检查
- **强制** 不要用 Optional 包装基本类型，用 `OptionalInt` / `OptionalLong`

```java
// bad - 过度使用
public User findById(Optional<Long> id) { ... }

// good - 使用重载
public Optional<User> findById(Long id) { ... }

// bad - 不检查
User user = getUser().get();  // NoSuchElementException

// good
Optional<User> optUser = getUser();
if (optUser.isPresent()) {
  User user = optUser.get();
}

// good - orElse / orElseGet / orElseThrow
String name = getUser()
  .map(User::getName)
  .orElse("Anonymous");

String name = getUser()
  .map(User::getName)
  .orElseGet(() -> fetchDefaultName());  // 延迟计算

String name = getUser()
  .map(User::getName)
  .orElseThrow(() -> new UserNotFoundException());
```

### 4.2 链式操作

```java
// bad - 嵌套 if
if (user != null) {
  if (user.getProfile() != null) {
    if (user.getProfile().getAddress() != null) {
      return user.getProfile().getAddress().getCity();
    }
  }
}
return "Unknown";

// good - Optional 链
return Optional.ofNullable(user)
  .map(User::getProfile)
  .map(Profile::getAddress)
  .map(Address::getCity)
  .orElse("Unknown");
```

## 接口默认方法

### 5.1 使用场景

- **强制** 默认方法仅用于向后兼容，不用于核心业务逻辑
- **强制** 多个接口有相同签名的默认方法时，实现类必须重写

```java
// good - 向后兼容
interface UserRepository {
  List<User> findAll();

  default List<User> findActive() {
    return findAll().stream()
      .filter(User::isActive)
      .collect(toList());
  }
}

// bad - 默认方法过多导致上帝接口
interface MegaService {
  default void processOrder() { ... }
  default void validatePayment() { ... }
  default void sendNotification() { ... }  // 违反 SRP
}
```

## 函数式设计模式

### 6.1 命令者模式

```java
// 传统命令模式
interface Command {
  void execute();
}

// Lambda 实现
Runnable command = () -> processOrder(order);
executor.execute(command);

// 方法引用
executor.execute(this::processOrder);
```

### 6.2 策略模式

```java
// 传统策略
interface DiscountStrategy {
  BigDecimal apply(Order order);
}

// Lambda 实现
Function<Order, BigDecimal> vipDiscount = o -> o.getAmount().multiply(Rate.VIP);
Function<Order, BigDecimal> regularDiscount = o -> o.getAmount().multiply(Rate.REGULAR);

// 动态选择策略
BigDecimal discount = switch (order.getType()) {
  case VIP -> vipDiscount.apply(order);
  case REGULAR -> regularDiscount.apply(order);
  default -> BigDecimal.ZERO;
};
```

## 常见错误

| 错误模式 | 问题 | 正确做法 |
|----------|------|----------|
| 链过长 | 可读性差 | 拆分为多个变量 |
| 重复遍历 | 性能浪费 | 一次遍历，多个操作 |
| 副作用 | 难推理 | 链式操作尽量无副作用 |
| 滥用并行 | 线程竞争 | 仅无状态操作用并行 |
| forEach 中的副作用 | 违反函数式 | forEach 仅用于终端消费 |
| Optional 过度封装 | 性能差 | 直接返回 null 即可 |
| 装箱开销 | 性能差 | 使用 `mapToInt`、`sum` |