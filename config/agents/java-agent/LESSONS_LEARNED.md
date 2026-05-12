# java-agent 经验教训

本文档记录 java-agent 在项目执行中遇到的问题、解决方案和改进建议。

## 模板

```markdown
## {{date}} {{title}}

**分类**: {{category}}
**严重程度**: {{severity}}
**关联阶段**: {{phase}}

### 问题描述
{{problem}}

### 发生了什么
{{what_happened}}

### 如何避免
{{prevention}}

### 适用场景
{{applicable_scenarios}}

### 代码示例

```java
// ❌ 错误做法
{{bad_code}}

// ✅ 正确做法
{{good_code}}
```
```

---

## 2026-05-09 Spring Bean 循环依赖

**分类**: 配置
**严重程度**: 高
**关联阶段**: Phase 4 (implement)

### 问题描述
Spring Boot 应用启动失败，报 "Circular depends" 错误。

### 发生了什么
ServiceA 依赖 ServiceB，ServiceB 依赖 ServiceA，形成循环依赖。AOP 代理时触发问题。

### 如何避免
1. 使用构造函数注入而非字段注入
2. 通过 @Lazy 延迟加载打破循环
3. 重构为中间层解耦
4. 使用 setter 注入延迟依赖

### 适用场景
- Spring Boot 多模块项目
- 微服务依赖设计
- AOP 代理场景

### 代码示例

```java
// ❌ 错误做法 - 字段注入容易循环依赖
@Service
public class ServiceA {
  @Autowired
  private ServiceB serviceB;
}

// ✅ 正确做法 - 构造函数注入
@Service
public class ServiceA {
  private final ServiceB serviceB;

  public ServiceA(@Lazy ServiceB serviceB) {
    this.serviceB = serviceB;
  }
}
```

---

最后更新: 2026-05-12