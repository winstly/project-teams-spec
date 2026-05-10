# 微服务架构规范

本规范基于《微服务设计》《微服务架构实战》以及业界最佳实践，涵盖服务拆分、API 设计、服务通信、数据管理、部署运维等核心领域。

## 服务拆分

### 1.1 拆分原则

| 原则 | 说明 |
|------|------|
| **单一职责** | 每个服务只负责一个业务领域 |
| **高内聚低耦合** | 服务内部紧耦合，服务之间松耦合 |
| **独立部署** | 服务可独立部署，不依赖其他服务 |
| **团队所有权** | 团队对服务有端到端所有权 |

### 1.2 拆分粒度

- **强制** 避免微服务变成"微型单体"
- **强制** 服务应有明确的领域边界
- **强制** 服务数量与团队规模匹配（2-Pizza 规则）

```
不推荐: UserService + UserProfileService + UserAuthService + UserSettingsService
推荐:   UserService (包含用户相关所有功能)
```

### 1.3 领域驱动设计

- **强制** 按领域（Domain）划分服务边界
- **强制** 使用 Bounded Context 识别服务边界

```
DDD 分层 → 微服务映射:
Domain Model      → 领域模型（每个服务独立）
Application Layer → 应用服务（跨领域编排）
Infrastructure    → 基础设施（各服务独立实现）
```

## API 设计

### 2.1 RESTful 规范

- **强制** 使用标准 HTTP 方法：`GET/POST/PUT/PATCH/DELETE`
- **强制** 使用复数名词表示资源：`/users` 而非 `/user`
- **强制** 正确使用 HTTP 状态码

```http
GET    /users          # 获取用户列表
GET    /users/{id}      # 获取单个用户
POST   /users           # 创建用户
PUT    /users/{id}       # 全量更新
PATCH  /users/{id}       # 部分更新
DELETE /users/{id}       # 删除用户
```

### 2.2 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功（通常带响应体） |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功（无响应体） |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable | 业务校验失败 |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 服务器错误 |
| 503 | Service Unavailable | 服务不可用 |

### 2.3 响应格式

- **强制** 统一响应格式

```json
// 成功响应
{
  "data": { },
  "meta": {
    "timestamp": "2026-05-10T12:00:00Z",
    "requestId": "uuid"
  }
}

// 错误响应
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在",
    "details": { }
  },
  "meta": {
    "timestamp": "2026-05-10T12:00:00Z",
    "requestId": "uuid"
  }
}
```

### 2.4 API 版本管理

- **强制** URL 中包含版本号：`/api/v1/users`
- **强制** 向后兼容，不删除旧版本字段
- **强制** 废弃版本有明确废弃时间表

### 2.5 限流设计

- **强制** 公开 API 必须有 Rate Limiting
- **强制** 返回标准限流响应头

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1620123456
Retry-After: 3600
```

## 服务通信

### 3.1 同步通信

- **强制** 使用轻量级协议（REST、gRPC）
- **强制** 服务间调用必须有超时机制
- **强制** 服务间调用必须有限流和熔断

```java
// good - 带超时和重试的 HTTP 调用
RestTemplate template = new RestTemplate();
template.setRequestFactory(new HttpComponentsClientHttpRequestFactory(
  HttpClients.createDefault()
));

// 熔断器
@CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
public User getUser(Long id) {
  return userClient.getUser(id);
}

public User getUserFallback(Long id, Exception e) {
  return userCache.get(id).orElseThrow(() -> e);
}
```

### 3.2 异步通信

- **推荐** 跨服务事件使用消息队列
- **强制** 消息必须幂等处理
- **强制** 消息顺序处理需要谨慎设计

```java
// 发布事件
@PostMapping("/orders")
public Order createOrder(CreateOrderRequest request) {
  Order order = orderService.create(request);
  eventPublisher.publish(new OrderCreatedEvent(order));
  return order;
}

// 订阅事件
@RabbitListener(queues = "order.created")
public void handleOrderCreated(OrderCreatedEvent event) {
  inventoryService.reserve(event.getOrderId());
}
```

### 3.3 服务发现

- **强制** 服务注册与发现使用统一机制（Eureka / Consul / Nacos）
- **强制** 客户端发现优先于服务端发现

```
服务注册与发现流程:
1. 服务启动 → 注册到注册中心
2. 消费者 → 查询注册中心获取服务实例列表
3. 负载均衡选择实例 → 发起调用
4. 服务下线 → 从注册中心注销
```

## 数据管理

### 4.1 数据库per服务

- **强制** 每个服务拥有独立的数据库
- **强制** 禁止跨服务直接访问数据库
- **强制** 服务间数据共享通过 API 调用

```
反模式:
UserService → 直接访问 OrderService 的数据库表

正确做法:
UserService ← HTTP/gRPC → OrderService → 自己的数据库
```

### 4.2 事务边界

- **强制** 单服务内使用 ACID 事务
- **强制** 跨服务场景使用 Saga 模式（补偿事务）
- **强制** 不使用分布式全局事务（2PC）

```java
// Saga 补偿模式示例
public class OrderSaga {
  public void createOrder(Order order) {
    try {
      // 步骤1：创建订单
      orderService.create(order);
      // 步骤2：扣减库存
      inventoryService.reserve(order.getItems());
      // 步骤3：扣款
      paymentService.charge(order);
    } catch (Exception e) {
      // 补偿
      paymentService.refund(order);
      inventoryService.release(order.getItems());
      orderService.cancel(order);
    }
  }
}
```

### 4.3 数据一致性策略

| 策略 | 适用场景 | 实现方式 |
|------|----------|----------|
| **最终一致** | 非关键数据同步 | 消息队列、事件驱动 |
| **Saga** | 跨服务业务流程 | 补偿事务 |
| **事件溯源** | 审计需求、可追溯性 | Event Sourcing |
| **2PC** | 强一致要求 | 分布式事务（尽量避免） |

## 部署与运维

### 5.1 容器化

- **强制** 每个服务独立容器镜像
- **强制** 镜像只包含应用和运行时，不含构建工具
- **强制** 容器配置环境变量而非配置文件

```dockerfile
FROM eclipse-temurin:17-jre-alpine
COPY target/app.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### 5.2 配置管理

- **强制** 配置外部化，不写在代码中
- **强制** 使用配置中心（Apollo / Nacos / Spring Cloud Config）
- **强制** 环境隔离（dev/staging/prod）

```yaml
# 应用配置
spring:
  application:
    name: user-service
  profiles:
    active: ${ENV:dev}
  config:
    import: optional:configserver:${CONFIG_SERVER_URL}
```

### 5.3 日志规范

- **强制** 结构化日志（JSON 格式）
- **强制** 包含 traceId 用于全链路追踪
- **强制** 日志级别可动态调整

```json
{
  "timestamp": "2026-05-10T12:00:00.000Z",
  "level": "INFO",
  "service": "user-service",
  "traceId": "abc123",
  "spanId": "def456",
  "message": "User created successfully",
  "userId": 12345
}
```

## 可靠性设计

### 6.1 熔断器模式

```java
// 熔断器配置
@CircuitBreaker(
  name = "paymentService",
  fallbackMethod = "paymentFallback"
)
public PaymentResult pay(Order order) {
  return paymentClient.process(order);
}

// 降级逻辑
public PaymentResult paymentFallback(Order order, Exception e) {
  log.warn("Payment service unavailable, queuing for retry", e);
  paymentQueue.offer(new PaymentTask(order));
  return PaymentResult.QUEUED;
}
```

### 6.2 限流

- **强制** 使用令牌桶或漏桶算法
- **强制** 限流在 API Gateway 统一处理

```java
// 服务端限流
@RateLimiter(name = "userApi", fallbackMethod = "rateLimitFallback")
public User getUser(Long id) {
  return userRepository.findById(id)
    .orElseThrow(() -> new UserNotFoundException(id));
}

public User rateLimitFallback(Long id, RequestNotPermittedException e) {
  throw new RateLimitException("请求过于频繁，请稍后再试");
}
```

### 6.3 健康检查

- **强制** 每个服务提供健康检查端点
- **强制** 健康检查包含依赖服务状态

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
  @Override
  public Health health() {
    try {
      // 检查数据库
      jdbcTemplate.queryForObject("SELECT 1", Integer.class);
      // 检查 Redis
      redisTemplate.getConnectionFactory().getConnection().ping();
      return Health.up().build();
    } catch (Exception e) {
      return Health.down()
        .withDetail("error", e.getMessage())
        .build();
    }
  }
}
```

## 安全

### 7.1 认证与授权

- **强制** 统一认证中心（OAuth 2.0 / OIDC）
- **强制** 使用 JWT Token
- **强制** 服务间调用使用 Service Account

### 7.2 传输安全

- **强制** 所有通信使用 HTTPS
- **强制** 内部服务通信加密（mTLS）

## 监控与可观测性

### 8.1 黄金指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| **延迟** | 请求处理时间 | p99 > 500ms |
| **流量** | QPS/TPS | 接近容量上限 |
| **错误率** | 失败请求比例 | > 1% |
| **饱和度** | 资源利用率 | > 80% |

### 8.2 全链路追踪

- **强制** 每个请求有唯一 traceId
- **强制** traceId 在服务间传递
- **强制** 记录关键链路节点

```java
// 传递 traceId
@Service
public class UserService {
  public User getUser(Long id) {
    String traceId = MDC.get("traceId");
    return userRepository.findById(id)
      .map(user -> {
        user.setTraceId(traceId);
        return user;
      })
      .orElseThrow(() -> new UserNotFoundException(id));
  }
}
```

---

## 常见错误

| 错误模式 | 问题 | 正确做法 |
|----------|------|----------|
| 过早拆分 | 复杂度爆炸 | 先单体，识别瓶颈后再拆分 |
| 共享数据库 | 耦合 | 每个服务独立数据库 |
| 同步调用链过长 | 延迟累积 | 异步事件驱动 |
| 分布式事务 | 性能差 | Saga 补偿模式 |
| 无隔离配置 | 环境污染 | 配置中心隔离环境 |
| 服务无健康检查 | 故障蔓延 | 完善健康检查和熔断 |
| 日志无关联 | 排查困难 | 全链路 traceId |