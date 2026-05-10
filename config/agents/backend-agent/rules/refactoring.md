# 重构规范

本规范基于 Martin Fowler 的《重构》第二版，涵盖重构的核心原则、坏味道识别、具体重构技法，以及如何在代码审查中指导重构。

## 重构核心原则

### 1.1 重构的定义

> 重构：在不改变代码外在行为的前提下，对代码内部结构进行调整，提高其可理解性、降低其修改成本。

- **重构不是** 重写，不是性能优化，不是添加新功能
- **重构是** 改善现有代码结构的持续实践

### 1.2 重构的时机

| 时机 | 说明 | 举例 |
|------|------|------|
| **添加功能时** | 先理解代码，再添加功能 | 修改一个类的行为 |
| **修复 Bug 时** | 代码本身难以理解 | 定位问题根因 |
| **代码审查时** | 发现坏味道 | 审查者提出重构建议 |
| **童子军规则** | 让代码比发现时更干净 | 每次提交改进一处 |

### 1.3 重构的前提

- **必须** 有可靠的测试套件
- **必须** 小步前进，每步后运行测试
- **必须** 保持功能不变

## 坏味道识别

### 2.1 常见坏味道

| 坏味道 | 症状 | 常用重构 |
|--------|------|----------|
| **神秘命名** | 变量/方法名无法揭示意图 | 变量改名、方法改名 |
| **重复代码** | 相同或相似的代码多次出现 | 提取函数、提取超类 |
| **过长函数** | 函数超过 20 行 | 提取函数、替换算法 |
| **过大类** | 类承担过多职责 | 提取类、提取接口 |
| **过长参数列表** | 参数超过 3 个 | 提取参数对象、保持对象 |
| **发散式变化** | 一个类因不同原因在不同方向变化 | 提取类 |
| **散弹式修改** | 一个变化需要修改多个类 | 移动函数、合并类 |
| **依恋情结** | 函数过多关注其他类的数据 | 搬移函数、提取类 |
| **数据泥团** | 多个地方出现相同的几个数据项 | 提取参数对象、保持对象 |
| **基本类型偏执** | 过度使用基本类型而非对象 | 以对象取代基本类型 |
| **Switch 惊悚** | 多次出现相同的 switch | 替换为多态 |
| **平行继承体系** | 两个类层次结构平行增长 | 移动函数、提取接口 |
| **冗余类** | 类已无存在价值 | 内联类、移除死代码 |
| **夸夸其谈的未来** | 为未到来的需求编写代码 | YAGNI，删除多余代码 |
| **令人迷惑的暂时字段** | 某个变量只在特定情况下有值 | 提炼类、引入 Null 对象 |
| **纯数据类** | 类只有 getter/setter | 封装记录、移除设值函数 |
| **被遗弃的接口** | 接口已无实现者 | 内联接口 |
| **注释过多** | 注释试图解释糟糕的代码 | 删除注释，重构代码 |

### 2.2 何时不应重构

- 代码过于混乱，重写比重构更高效
- 项目即将发布，没有时间
- 重构可能导致引入新的 Bug

## 重构技法

### 3.1 提取函数 (Extract Function)

**坏味道**：过长函数  
**做法**：将一段代码提取为独立函数

```java
// 重构前
public void printOwing(Order order) {
  printBanner();
  // 打印详情
  double outstanding = order.getAmount() * 0.2;
  System.out.println("name: " + order.getCustomer());
  System.out.println("amount: " + outstanding);
}

// 重构后
public void printOwing(Order order) {
  printBanner();
  double outstanding = calculateOutstanding(order);
  printDetails(order.getCustomer(), outstanding);
}

private double calculateOutstanding(Order order) {
  return order.getAmount() * 0.2;
}

private void printDetails(String customer, double outstanding) {
  System.out.println("name: " + customer);
  System.out.println("amount: " + outstanding);
}
```

### 3.2 内联函数 (Inline Function)

**坏味道**：间接性过多，函数名不如直接表达式  
**做法**：将函数体内联到调用处

```java
// 重构前
public int getRating() {
  return moreThanFiveLateDeliveries() ? 2 : 1;
}

private boolean moreThanFiveLateDeliveries() {
  return numberOfLateDeliveries > 5;
}

// 重构后
public int getRating() {
  return numberOfLateDeliveries > 5 ? 2 : 1;
}
```

### 3.3 变量改名 (Rename Variable)

**坏味道**：神秘命名

```java
// 重构前
int d;  // 天数？
int dsl;  // 过期天数？

// 重构后
int elapsedTimeInDays;
int daysSinceOverdue;
```

### 3.4 引入参数对象 (Introduce Parameter Object)

**坏味道**：过长参数列表

```java
// 重构前
public void addWeeklyFee(Date start, Date end, double amount,
  String currency, String accountId) { ... }

// 重构后
public void addWeeklyFee(WeeklyFee fee) { ... }

class WeeklyFee {
  Date start;
  Date end;
  double amount;
  String currency;
  String accountId;
}
```

### 3.5 拆分循环 (Split Loop)

**坏味道**：循环做了两件事

```java
// 重构前
double temp = 0;
int count = 0;
for (Order order : orders) {
  temp += order.getAmount();
  count++;
}
double average = temp / count;

// 重构后
double total = sumAmounts(orders);
int count = countOrders(orders);
double average = total / count;
```

### 3.6 以卫语句替换条件表达式 (Replace Conditional with Guard Clause)

**坏味道**：深层嵌套的条件

```java
// 重构前
public void pay() {
  if (employee.isSeparated()) {
    // 支付应付部分
    ...
    if (employee.isRetired()) {
      // 退休金
      ...
    }
  }
}

// 重构后
public void pay() {
  if (employee.isSeparated()) return;  // 卫语句
  if (employee.isRetired()) return;   // 卫语句
  // 主要逻辑
}
```

### 3.7 替换算法 (Substitute Algorithm)

**坏味道**：函数实现过于复杂

```java
// 重构前
public String foundPerson(String[] people) {
  for (int i = 0; i < people.length; i++) {
    if (people[i].equals("Don")) {
      return "Don";
    }
    if (people[i].equals("John")) {
      return "John";
    }
    if (people[i].equals("Kent")) {
      return "Kent";
    }
  }
  return "";
}

// 重构后
public String foundPerson(String[] people) {
  List<String> targets = Arrays.asList("Don", "John", "Kent");
  return Arrays.stream(people)
    .filter(targets::contains)
    .findFirst()
    .orElse("");
}
```

### 3.8 搬移函数 (Move Function)

**坏味道**：类之间职责不清

```java
// 重构前 — Account 类
class Account {
  private double interestRate;
  private double daysOverdrawn;

  public double getInterest() {
    // 利率逻辑本应在 AccountType 中
    return daysOverdrawn * interestRate * 0.01;
  }
}

// 重构后
class AccountType {
  public double getInterest(int daysOverdrawn, double rate) {
    return daysOverdrawn * rate * 0.01;
  }
}

class Account {
  public double getInterest() {
    return accountType.getInterest(daysOverdrawn, interestRate);
  }
}
```

### 3.9 提取类 (Extract Class)

**坏味道**：类职责过多

```java
// 重构前 — Person 类承担了过多职责
class Person {
  private String name;
  private String officeAreaCode;  // 电话相关
  private String officeNumber;    // 电话相关

  public String getName() { return name; }
  public String getAreaCode() { return officeAreaCode; }
  public String getNumber() { return officeNumber; }
  // 办公室相关属性和方法...
}

// 重构后
class Person {
  private String name;
  private TelephoneNumber officePhone;  // 提取为新类
}

class TelephoneNumber {
  private String areaCode;
  private String number;

  public String getAreaCode() { return areaCode; }
  public String getNumber() { return number; }
}
```

### 3.10 替换条件为多态 (Replace Conditional with Polymorphism)

**坏味道**：switch 语句重复

```java
// 重构前
public double getBonus(Order order) {
  switch (order.getType()) {
    case "ENGINEER": return order.getSalary() * 2;
    case "MANAGER": return order.getSalary() * 3;
    case "DIRECTOR": return order.getSalary() * 5;
  }
  return 0;
}

// 重构后
abstract class Employee {
  abstract double getBonus(double salary);
}

class Engineer extends Employee {
  double getBonus(double salary) { return salary * 2; }
}
class Manager extends Employee {
  double getBonus(double salary) { return salary * 3; }
}
class Director extends Employee {
  double getBonus(double salary) { return salary * 5; }
}
```

### 3.11 提炼接口 (Extract Interface)

**坏味道**：类承担了多个客户端的不同需求

```java
// 重构前 — SchedulingService 暴露过多方法给不同客户端
class SchedulingService {
  public void scheduleAppointment() { ... }
  public void cancelAppointment() { ... }
  public void confirmAppointment() { ... }
  public void generateReport() { ... }
}

// 重构后 — 不同接口服务不同客户端
interface AppointmentScheduler {
  void scheduleAppointment();
  void cancelAppointment();
}

interface AppointmentReporter {
  void confirmAppointment();
  void generateReport();
}
```

### 3.12 合并分段条件 (Consolidate Conditional Expression)

**坏味道**：多个条件返回相同结果

```java
// 重构前
if (seniority < 2) return 0;
if (monthDisabled > 12) return 0;
if (isPartTime) return 0;

// 重构后
if (isNotEligible()) return 0;

private boolean isNotEligible() {
  return seniority < 2 || monthDisabled > 12 || isPartTime;
}
```

## 重构流程

### 4.1 小步重构步骤

```
1. 确认有可靠测试
2. 小步进行（每步 < 5 分钟）
3. 每步后运行测试
4. 提交前确保测试通过
```

### 4.2 重构与测试的关系

- **TDD 循环**：红 → 绿 → 重构
- 重构前必须有测试覆盖
- 重构后测试不应改变

### 4.3 代码审查中的重构建议

| 场景 | 建议话术 |
|------|----------|
| 过长函数 | 「建议将第 20-35 行提取为 `validateAndProcess` 方法，使职责更清晰」 |
| 重复代码 | 「三处相同的校验逻辑可以提取为 `validateUser` 私有方法」 |
| 深层嵌套 | 「建议使用卫语句提早返回，减少嵌套层次」 |
| 过长参数 | 「这 5 个参数可以封装为 `OrderRequest` 对象」 |
| 上帝类 | 「`UserManager` 承担了过多职责，建议拆分为 `UserService`、`AuthService`、`NotificationService`」 |

## Kent Beck 简单设计四规则

按优先级排序：

1. **运行所有测试** — 系统能工作是最基本的要求
2. **消除重复** — DRY 原则
3. **表达意图** — 代码清晰表达设计思想
4. **最小化** — 在前三者满足后追求最小化结构和代码

> 优先级：测试 > 重复 > 表达 > 精简

## 反模式

| 反模式 | 说明 | 规避方法 |
|--------|------|----------|
| **重写而非重构** | 代码太乱时直接重写 | 小步重构，持续改进 |
| **重构不做测试** | 没有安全网就重构 | 重构前先写测试 |
| **过度重构** | 为了优雅而重构 | YAGNI，保持简单 |
| **过早抽象** | 猜测未来需求而抽象 | 等到第三次出现再抽象 |
| **破坏性重构** | 重构改变了行为 | 每步后运行测试 |

---

## 重构检查清单

### 开始重构前
- [ ] 有测试套件且全部通过
- [ ] 本次重构范围明确
- [ ] 预计时间 < 5 分钟

### 重构进行中
- [ ] 每次修改后运行测试
- [ ] 保持功能不变
- [ ] 不引入新的重复
- [ ] 命名更清晰

### 重构完成后
- [ ] 所有测试通过
- [ ] 代码更简洁
- [ ] 可读性提高
- [ ] 提交信息描述重构内容