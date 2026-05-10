# Java 编码规约

本规范基于《阿里巴巴 Java 开发手册》制定。

## 命名规约

### 1.1 基本规则

- **强制** 命名不以 `_` 或 `$` 开头或结尾
- **强制** 禁止使用拼音与英文混合，禁止使用纯中文

```java
// bad
String _name;
String $name;
String 名字 = "Alice";
String mingzi = "Bob";

// good
String firstName = "Alice";
String lastName = "Bob";
```

### 1.2 大小写规范

- **强制** 类名使用 `UpperCamelCase`（驼峰），以下情形例外：
  - 领域模型命名：`DO` / `BO` / `DTO` / `VO`
- **强制** 方法名、参数名、成员变量、局部变量使用 `lowerCamelCase`
- **强制** 常量命名全大写，单词间用下划线

```java
// good
class UserDO { ... }
class UserService { ... }
class XmlParser { ... }

void getUserById(Long id) { ... }
String userName;
static final int MAX_RETRY_COUNT = 3;
```

### 1.3 抽象类与异常类

- **强制** 抽象类命名使用 `Abstract` 或 `Base` 开头
- **强制** 异常类命名使用 `Exception` 结尾
- **强制** 测试类命名以要测试的类名开头，以 `Test` 结尾

### 1.4 包名

- **强制** 包名统一使用小写，单数形式

```java
// good
package com.alibaba.open.util;
package com.example.service;
```

### 1.5 接口实现

- **强制** Service/DAO 类暴露的接口名不加 `I` 前缀，实现类用 `Impl` 后缀

```java
// good
interface CacheService { ... }
class CacheServiceImpl implements CacheService { ... }
```

### 1.6 枚举类

- **参考** 枚举类名带上 `Enum` 后缀，成员名称全大写

```java
// good
enum DealStatusEnum {
  SUCCESS,
  UNKNOWN_REASON
}
```

### 1.7 Service/DAO 层方法命名

| 操作 | 命名 |
|------|------|
| 获取单个对象 | `get` 前缀 |
| 获取多个对象 | `list` 前缀 |
| 获取统计值 | `count` 前缀 |
| 插入 | `save` / `insert` 前缀 |
| 删除 | `remove` / `delete` 前缀 |
| 修改 | `update` 前缀 |

### 1.8 领域模型命名

| 类型 | 命名 | 说明 |
|------|------|------|
| 数据对象 | `xxxDO` | 即数据表名 |
| 数据传输对象 | `xxxDTO` | 业务领域相关 |
| 展示对象 | `xxxVO` | 网页名称 |
| 统一对象 | `POJO` | DO/DTO/BO/VO 统称 |

## 常量定义

### 2.1 魔法值

- **强制** 禁止魔法值（未经定义的常量）直接出现在代码中

```java
// bad
String key = "Id#taobao_" + tradeId;
cache.put(key, value);

// good
private static final String CACHE_KEY_PREFIX = "Id#taobao_";
String key = CACHE_KEY_PREFIX + tradeId;
```

### 2.2 Long 类型赋值

- **强制** Long 初始赋值使用大写 `L`，避免与数字 1 混淆

```java
// bad
Long a = 2l;

// good
Long a = 2L;
```

### 2.3 常量分类

- **推荐** 按常量功能分类维护，不要用一个大而全的常量类

```java
// good
class CacheConsts {
  public static final String KEY_PREFIX = "cache:";
}
class ConfigConsts {
  public static final int MAX_RETRY = 3;
}
```

## 格式规约

### 3.1 缩进与空格

- **强制** 缩进采用 4 个空格，禁止使用 Tab
- **强制** 左括号与内容之间有空格，右括号与前一个字符之间有空格
- **强制** `if / for / while / switch / do` 与括号之间加空格
- **强制** 运算符左右必须加空格

```java
// good
if (flag == 0) {
  System.out.println(say);
} else {
  System.out.println("world");
}

// bad
if(flag==0){
  System.out.println(say);
}
```

### 3.2 大括号风格

- **强制** Egyptian Brackets 风格
  - 左大括号前不换行
  - 左大括号后换行
  - 右大括号前换行
  - 右大括号后有 `else` 等代码不换行，否则必须换行

```java
// good
if (condition) {
  doSomething();
} else {
  doOther();
}
```

### 3.3 行宽

- **强制** 单行字符数不超过 120，超出换行

```java
// good - 第二行缩进 4 空格，第三行不再缩进
StringBuffer sb = new StringBuffer();
sb.append("zi").append("xin")...
  .append("huang")...
  .append("huang");
```

### 3.4 文件编码

- **强制** IDE text file encoding 设为 UTF-8
- **强制** 文件换行符使用 Unix 格式

## OOP 规约

### 4.1 静态访问

- **强制** 使用类名访问静态变量/方法，不通过对象

```java
// good
int count = Math.max(a, b);

// bad
SomeClass obj = new SomeClass();
int count = obj.max(a, b);
```

### 4.2 Override

- **强制** 所有覆写方法必须加 `@Override` 注解

### 4.3 可变参数

- **强制** 可变参数必须放在参数列表最后
- **推荐** 尽量避免使用可变参数

### 4.4 接口兼容性

- **强制** 外部调用或二方库依赖的接口不允许修改方法签名
- **强制** 接口过时必须加 `@Deprecated` 并说明新接口

### 4.5 equals 调用

- **强制** Object equals 调用使用常量或确定有值的对象

```java
// good
"test".equals(object);

// bad
object.equals("test");
```

### 4.6 包装类比较

- **强制** 包装类之间值比较使用 `equals`

```java
// good
Integer a = 127;
Integer b = 127;
a.equals(b); // true (缓存范围内)

Integer c = 128;
Integer d = 128;
c.equals(d); // true
```

### 4.7 基本类型与包装类型

- **强制** POJO 类属性必须使用包装类型
- **强制** RPC 方法返回值和参数必须使用包装类型
- **推荐** 局部变量使用基本类型

```java
// good
public class UserDTO {
  private Long id;           // 包装类型
  private Integer age;        // 包装类型
  private String name;
}

public void process(int count) { ... }  // 局部变量用基本类型
```

### 4.8 POJO 规范

- **强制** POJO 类不设定属性默认值
- **强制** 构造方法禁止加业务逻辑
- **强制** POJO 类必须写 `toString` 方法
- **强制** 序列化类新增属性时不要修改 `serialVersionUID`

## 集合处理

### 5.1 hashCode 与 equals

- **强制** 重写 `equals` 必须重写 `hashCode`
- **强制** Set 存储的对象必须重写两个方法
- **强制** 自定义对象作为 Map 键时必须重写两个方法

### 5.2 subList

- **强制** `ArrayList.subList()` 结果不可强转成 `ArrayList`
- **强制** subList 场景中修改原集合元素会导致 `ConcurrentModificationException`

### 5.3 集合转数组

- **强制** 使用 `toArray(T[] array)` 传入类型完全一致的数组

```java
// good
String[] array = new String[list.size()];
array = list.toArray(array);

// bad
Object[] array = list.toArray();
```

### 5.4 Arrays.asList

- **强制** 使用 `Arrays.asList()` 得到的集合不能使用 `add/remove/clear`

### 5.5 foreach 循环

- **强制** foreach 循环中不能进行 `remove/add` 操作
- **强制** 使用 Iterator 并发时加锁

```java
// good
Iterator<String> it = list.iterator();
while (it.hasNext()) {
  if (shouldRemove(it.next())) {
    it.remove();
  }
}

// bad
for (String item : list) {
  if (shouldRemove(item)) {
    list.remove(item);  // ConcurrentModificationException
  }
}
```

### 5.6 Comparator

- **强制** Comparator 要满足自反性、对称性、传递性

```java
// bad - 未处理相等情况
return o1.getId() > o2.getId() ? 1 : -1;

// good
return Integer.compare(o1.getId(), o2.getId());
```

## 并发处理

### 6.1 线程池

- **强制** 线程资源必须通过线程池提供，不允许在应用中显式创建线程
- **强制** 不允许使用 `Executors` 创建线程池，使用 `ThreadPoolExecutor`

```java
// bad - OOM 风险
ExecutorService executor = Executors.newFixedThreadPool(n);

// good
ThreadPoolExecutor executor = new ThreadPoolExecutor(
  corePoolSize, maxPoolSize, keepAliveTime,
  TimeUnit.MILLISECONDS, workQueue,
  new ThreadFactory("custom-pool")
);
```

### 6.2 线程命名

- **强制** 创建线程或线程池时指定有意义的线程名称

### 6.3 SimpleDateFormat

- **强制** `SimpleDateFormat` 不是线程安全，禁止定义为 static
- **推荐** JDK 8+ 使用 `LocalDateTime` / `DateTimeFormatter`

### 6.4 锁优化

- **强制** 能用无锁数据结构就不用锁
- **强制** 高并发时同步调用考虑锁性能损耗

### 6.5 资源加锁

- **强制** 多资源同时加锁时保持一致的加锁顺序

## 控制语句

### 7.1 Switch

- **强制** 每个 case 要么 `break/return`，要么注释说明继续执行到哪个 case
- **强制** 必须包含 `default` 且放在最后

### 7.2 if 语句

- **强制** if/else/for/while/do 必须使用大括号，即使只有一行

```java
// bad
if (condition) doSomething();

// good
if (condition) {
  doSomething();
}
```

### 7.3 卫语句

- **推荐** 超过 3 层的 if-else 使用卫语句或状态模式

## 异常处理

### 8.1 基本原则

- **强制** 优先通过预检查规避异常，而非 catch 处理
- **强制** 异常不用来做流程控制
- **强制** 不要捕获异常却什么都不处理

```java
// bad
try {
  obj.method();
} catch (NullPointerException e) {
  // nothing
}

// good
if (obj != null) {
  obj.method();
}
```

### 8.2 try-with-resources

- **强制** JDK 7+ 使用 try-with-resources 关闭资源

```java
// good
try (BufferedReader reader = new BufferedReader(
      new FileReader(path))) {
  // ...
}
```

### 8.3 finally

- **强制** finally 必须关闭资源，有异常也要 try-catch
- **强制** finally 中不能使用 return

### 8.4 异常匹配

- **强制** 捕获异常与抛异常必须完全匹配或捕获父类

## 日志规约

### 9.1 日志框架

- **强制** 使用 SLF4J API，不直接使用 Log4j/Logback

```java
// good
private static final Logger logger = LoggerFactory.getLogger(Abc.class);
```

### 9.2 日志保留

- **强制** 日志文件至少保存 15 天

### 9.3 日志命名

- **强制** 命名格式：`appName_logType_logName.log`

```java
// good
mppserver_monitor_timeZoneConvert.log
```

### 9.4 日志级别

- **强制** 使用条件输出或占位符方式

```java
// good
if (logger.isDebugEnabled()) {
  logger.debug("Processing trade with id: {} symbol: {}", id, symbol);
}

// bad
logger.debug("Processing trade with id: " + id + " symbol: " + symbol);
```

## 注释规约

### 10.1 Javadoc

- **强制** 类、类属性、类方法必须使用 Javadoc：`/** 内容 */`
- **强制** 抽象方法必须用 Javadoc 说明功能
- **强制** 所有类必须添加创建者信息

```java
/**
 * 用户服务类
 *
 * @author zhangsan
 * @since 1.0.0
 */
public class UserService {
  /**
   * 根据ID获取用户
   *
   * @param id 用户ID
   * @return 用户信息，不存在返回null
   */
  public UserDO getById(Long id) { ... }
}
```

### 10.2 方法内注释

- **强制** 方法内单行注释在被注释语句上方
- **强制** 多行注释使用 `/* */` 并与代码对齐

### 10.3 TODO/FIXME

- **参考** 使用标准注释标记：`TODO(标记人,时间): 内容` / `FIXME(标记人,时间): 内容`