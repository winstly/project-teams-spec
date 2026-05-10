# Java 并发编程规范

本规范基于《Java并发编程的艺术》，涵盖线程安全、同步机制、并发工具、线程池等核心实践。

## 核心概念

### 1.1 并发三要素

| 概念 | 说明 | 问题 |
|------|------|------|
| **原子性** | 一个操作或多个操作要么全部执行要么全部不执行 | 竞态条件 |
| **可见性** | 一个线程对共享变量的修改能及时被其他线程看到 | 过期数据 |
| **有序性** | 程序执行顺序按代码先后顺序执行 | 指令重排序 |

### 1.2 线程安全策略

- 尽可能使用不可变对象
- 将变量限制在线程内部（局部变量、ThreadLocal）
- 同步机制保护共享状态
- 原子类替代锁

## 线程安全实现

### 2.1 synchronized

- **强制** 优先使用 synchronized 同步方法或同步块
- **强制** 锁对象应避免逃逸（不要返回可变对象）
- **强制** 同步块应尽量缩小范围

```java
// bad - 锁范围过大
public synchronized void process() {
  // ... 大量无关代码
}

// good - 缩小锁范围
public void process() {
  synchronized (this.lock) {
    // 仅保护临界区
  }
}

// good - 保护逃逸风险
private StringBuilder buffer;
public StringBuilder getBuffer() {  // 危险！
  return buffer;  // 逃逸
}
public String getBufferCopy() {    // 安全
  synchronized (this.lock) {
    return buffer.toString();
  }
}
```

### 2.2 volatile

- **强制** 仅用于一个线程写、多线程读的场景
- **强制** 使用 volatile 代替简单锁以提升性能
- **强制** volatile + 原子操作可实现轻量级同步

```java
// good - 可见性保证
volatile boolean shutdownRequested;

public void shutdown() {
  shutdownRequested = true;
}

public void doWork() {
  while (!shutdownRequested) {
    // ...
  }
}

// bad - 不适用于复合操作
volatile int count = 0;
count++;  // 非原子！需要 synchronized 或 AtomicInteger
```

### 2.3 原子类

- **强制** 使用 `AtomicInteger / AtomicLong / AtomicReference` 替代对应类型的 synchronized 包装
- **推荐** 优先使用原子类而非锁（性能更好）

```java
// bad
private int count = 0;
public synchronized void increment() { count++; }
public synchronized int get() { return count; }

// good
private AtomicInteger count = new AtomicInteger(0);
public void increment() { count.incrementAndGet(); }
public int get() { return count.get(); }
```

### 2.4 CAS 与 Unsafe

- **禁止** 应用代码直接使用 `Unsafe` 类
- **推荐** 使用 JDK 提供的原子操作类

## 锁优化

### 3.1 减少锁持有时间

```java
// bad - 持有锁时调用外部方法
public synchronized void process(Order order) {
  validate(order);          // 耗时长且无需同步
  calculate(order);         // 耗时长且无需同步
  synchronized (this) {
    save(order);            // 仅此操作需要同步
  }
}

// good
public void process(Order order) {
  validate(order);
  calculate(order);
  synchronized (this) {
    save(order);
  }
}
```

### 3.2 锁分段

```java
// bad - 单一锁成为瓶颈
class ConcurrentCache<K, V> {
  private final Map<K, V> cache = new ConcurrentHashMap<>();
  private final Object lock = new Object();

  V get(K key) {
    synchronized (lock) { return cache.get(key); }
  }
  void put(K key, V value) {
    synchronized (lock) { cache.put(key, value); }
  }
}

// good - 分段锁
class ConcurrentCache2<K, V> {
  private final Map<K, V> cache = new ConcurrentHashMap<>();

  V get(K key) { return cache.get(key); }
  void put(K key, V value) { cache.put(key, value); }
}
```

### 3.3 读写锁

- **推荐** 读多写少场景使用 `ReadWriteLock`

```java
private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
private volatile Map<String, String> cache = new HashMap<>();

public String get(String key) {
  rwLock.readLock().lock();
  try {
    return cache.get(key);
  } finally {
    rwLock.readLock().unlock();
  }
}

public void put(String key, String value) {
  rwLock.writeLock().lock();
  try {
    cache.put(key, value);
  } finally {
    rwLock.writeLock().unlock();
  }
}
```

## 线程池

### 4.1 线程池创建

- **强制** 禁止使用 `Executors.newFixedThreadPool(n)` 等快捷方法（队列无限大导致 OOM）
- **强制** 使用 `ThreadPoolExecutor` 显式配置参数
- **强制** 拒绝策略必须有明确含义

```java
// bad - 队列无限大
ExecutorService exec = Executors.newFixedThreadPool(10);

// good
ThreadPoolExecutor executor = new ThreadPoolExecutor(
  corePoolSize,           // 核心线程数
  maxPoolSize,            // 最大线程数
  keepAliveTime,          // 空闲线程存活时间
  TimeUnit.SECONDS,
  new LinkedBlockingQueue<>(queueCapacity),  // 有界队列
  new ThreadFactoryBuilder()
    .setNameFormat("biz-pool-%d")
    .build(),
  new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);
```

### 4.2 参数配置原则

| 参数 | 配置建议 |
|------|----------|
| **corePoolSize** | CPU 密集型：CPU + 1；IO 密集型：CPU × 2 |
| **maxPoolSize** | 根据峰值负载设置，通常为核心数的 2 倍 |
| **queueCapacity** | 根据内存和任务特性设置，拒绝策略兜底 |
| **keepAliveTime** | 60 秒以上，allowCoreThreadTimeOut=true 时生效 |

### 4.3 线程工厂

- **强制** 为线程池设置有意义的线程名称（方便排查）

```java
ThreadFactory factory = r -> {
  Thread t = new Thread(r);
  t.setName("order-processor-" + t.getId());
  t.setDaemon(false);
  return t;
};
```

## 并发容器

### 5.1 ConcurrentHashMap

- **强制** 高并发场景优先使用 `ConcurrentHashMap` 而非 `Hashtable` 或 `Collections.synchronizedMap`
- **强制** 遍历时删除使用 `removeIf` 或 `compute` 原子操作

```java
// bad - 迭代期间不允许并发修改
for (Map.Entry<String, String> entry : map.entrySet()) {
  if (entry.getKey().equals("obsolete")) {
    map.remove(entry.getKey());  // ConcurrentModificationException
  }
}

// good - 使用原子操作
map.entrySet().removeIf(e -> e.getKey().equals("obsolete"));

// good - 使用 compute
map.compute(key, (k, v) -> v == null ? null : newValue);
```

### 5.2 阻塞队列

- **强制** 生产者-消费者模式使用 `BlockingQueue`
- **强制** 必须处理队列满/空场景

```java
// good - 有界队列
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(1000);

// 生产者
queue.offer(task, 5, TimeUnit.SECONDS);  // 超时等待

// 消费者
Task task = queue.poll(1, TimeUnit.SECONDS);
if (task == null) {
  // 处理超时
}
```

### 5.3 CopyOnWriteArrayList

- **适用** 读多写少的并发列表
- **禁止** 写操作频繁时使用（每次写入复制整个数组）

```java
private final CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();

public void addListener(Listener l) { listeners.add(l); }
public void removeListener(Listener l) { listeners.remove(l); }
public void notifyListeners(Event e) {
  for (Listener l : listeners) {
    l.onEvent(e);  // 遍历开销小
  }
}
```

## 同步工具

### 6.1 CountDownLatch

用于等待多个任务完成：

```java
CountDownLatch latch = new CountDownLatch(N);

for (int i = 0; i < N; i++) {
  final int index = i;
  executor.submit(() -> {
    try {
      doTask(index);
    } finally {
      latch.countDown();
    }
  });
}

latch.await(10, TimeUnit.MINUTES);  // 等待最多10分钟
```

### 6.2 CyclicBarrier

用于多线程协调到同一点：

```java
CyclicBarrier barrier = new CyclicBarrier(N, () -> {
  // 所有线程到达后执行汇总
  summarize();
});

for (int i = 0; i < N; i++) {
  executor.submit(() -> {
    doTask(i);
    barrier.await();  // 等待其他线程
  });
}
```

### 6.3 Semaphore

用于限流：

```java
Semaphore semaphore = new Semaphore(maxConcurrency);

for (Task task : tasks) {
  semaphore.acquire();
  executor.submit(() -> {
    try {
      process(task);
    } finally {
      semaphore.release();
    }
  });
}
```

## 并发设计模式

### 7.1 避免死锁

- **强制** 多锁场景保持一致的加锁顺序
- **强制** 优先使用 ReentrantLock 的 tryLock 超时

```java
// bad - 容易死锁
synchronized (resourceA) {
  synchronized (resourceB) {
    doSomething();
  }
}
synchronized (resourceB) {  // 其他线程可能先锁B
  synchronized (resourceA) {  // 死锁！
    doSomethingElse();
  }
}

// good - 固定顺序并带超时
private final Lock lockA = new ReentrantLock();
private final Lock lockB = new ReentrantLock();

public void doSomething() {
  lockA.lock();
  try {
    lockB.lock();
    try {
      doSomething();
    } finally {
      lockB.unlock();
    }
  } finally {
    lockA.unlock();
  }
}

public void doSomethingElse() {
  lockB.lock();
  try {
    lockA.lock();
    try {
      doSomethingElse();
    } finally {
      lockA.unlock();
    }
  } finally {
    lockB.unlock();
  }
}

// better - tryLock 超时
if (lockA.tryLock(5, TimeUnit.SECONDS)) {
  try {
    if (lockB.tryLock(5, TimeUnit.SECONDS)) {
      try {
        doSomething();
      } finally {
        lockB.unlock();
      }
    }
  } finally {
    lockA.unlock();
  }
}
```

### 7.2 ThreadLocal 正确使用

- **强制** ThreadLocal 在使用完毕后调用 `remove()` 防止内存泄漏
- **强制** 框架使用后及时清理

```java
// bad - 线程池复用导致内存泄漏
static ThreadLocal<User> currentUser = new ThreadLocal<>();

public void process() {
  currentUser.set(user);
  // ... 使用 currentUser
  // 不调用 remove()，线程归还池后仍持有引用
}

// good
public void process() {
  try {
    currentUser.set(user);
    // ... 使用 currentUser
  } finally {
    currentUser.remove();  // 显式清理
  }
}
```

## Future 与异步

### 8.1 Future 使用

```java
ExecutorService executor = Executors.newFixedThreadPool(10);

Future<Result> future = executor.submit(() -> {
  return doHeavyWork();
});

try {
  Result result = future.get(30, TimeUnit.SECONDS);  // 带超时
} catch (TimeoutException e) {
  future.cancel(true);
  // 处理超时
} catch (ExecutionException e) {
  // 处理异常
}
```

### 8.2 CompletableFuture

- **推荐** 多异步任务组合使用 `CompletableFuture`

```java
// 异步执行多个任务后组合结果
CompletableFuture<List<Order>> cf = CompletableFuture
  .supplyAsync(() -> fetchOrders(), executor)
  .thenApply(orders -> orders.stream()
    .filter(o -> o.getStatus() == OrderStatus.PENDING)
    .collect(Collectors.toList()))
  .exceptionally(ex -> {
    log.error("Failed to fetch orders", ex);
    return Collections.emptyList();
  });

List<Order> orders = cf.join();
```

## 线程安全设计原则

1. **最小化共享** — 能不共享就不共享
2. **不可变优先** — 优先使用不可变对象
3. **领域驱动** — 在领域层解决并发问题，而非基础设施层
4. **防御性复制** — 传入传出对象时进行防御性复制
5. **并发测试** — 核心并发逻辑必须有并发测试覆盖

## 常见并发错误

| 错误模式 | 问题 | 正确做法 |
|----------|------|----------|
| 错误假设原子性 | `count++` 不是原子的 | 使用 `AtomicInteger` |
| 逸出对象 | `getter` 返回可变域 | 返回副本或不可变对象 |
| 隐式共享 | `SimpleDateFormat` 作为 static | 使用 `ThreadLocal` 或 `LocalDateTime` |
| 双重检查锁定 | 指令重排序导致对象未构造完成就赋值 | 使用 `volatile` 或类的静态初始化 |
| 活跃性问题 | 死锁、活锁、饥饿 | 按序加锁、tryLock、限流 |