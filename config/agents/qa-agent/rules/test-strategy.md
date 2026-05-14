# 测试策略指南

本规范为测试策略的制定和执行提供系统性指导，适用于 TypeScript/Node.js 项目的质量保障。

## 测试策略核心要素

一个完整的测试策略必须包含：

1. **测试范围** — 明确测什么、不测什么
2. **测试方法** — 选择适当的测试级别和类型
3. **测试环境** — 环境配置和数据准备
4. **测试工具** — 框架选型和工具链
5. **度量指标** — 质量目标和衡量标准
6. **风险应对** — 已知风险的处理方案

## 测试金字塔

```
                    ▲
                   /E2E\
                  /     \
                 /-------/
                /集成测试\
               /         \
              /-----------/
             /  单元测试  \
            /             /
           /-------------/
    基础广 → 顶端少
```

### 分层测试策略

| 层级 | 比例 | 特点 | 示例 |
|------|------|------|------|
| 单元测试 | 70% | 快速、隔离、可重复 | 函数逻辑、边界计算 |
| 集成测试 | 20% | 模块交互、API 调用 | 数据库操作、第三方服务 |
| E2E 测试 | 10% | 端到端、真实场景 | 用户登录、完整下单流程 |

## 测试范围定义

### 纳入测试范围
- [ ] 业务核心逻辑
- [ ] 新增功能
- [ ] 变更影响区域
- [ ] 高风险模块
- [ ] 关键路径

### 排除测试范围
- [ ] 第三方库的内部实现（已测试）
- [ ] 配置类变更（影响分析后决策）
- [ ] 废弃功能的维护
- [ ] 已知并接受的限制

### 裁剪原则
- [ ] 技术栈成熟度高 → 减少接口测试
- [ ] 自动化程度高 → 减少手工测试
- [ ] 历史质量好 → 减少回归测试
- [ ] 风险可控 → 接受有限覆盖

## 测试类型选择

### 单元测试策略
```
目标: 验证最小可测试单元的正确性
工具: Jest, Vitest, Mocha
覆盖率基线: 行覆盖率 >= 70%, 分支 >= 60%
执行频率: 每次提交时
```

**示例场景:**
```typescript
// 待测试函数
function calculateDiscount(price: number, rate: number): number {
  if (price < 0 || rate < 0 || rate > 1) {
    throw new Error('Invalid input');
  }
  return price * rate;
}

// 单元测试
describe('calculateDiscount', () => {
  it('正常折扣计算', () => {
    expect(calculateDiscount(100, 0.2)).toBe(20);
  });

  it('零折扣返回0', () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });

  it('负数价格抛出异常', () => {
    expect(() => calculateDiscount(-100, 0.2)).toThrow('Invalid input');
  });

  it('超过100%折扣抛出异常', () => {
    expect(() => calculateDiscount(100, 1.5)).toThrow('Invalid input');
  });
});
```

### 集成测试策略
```
目标: 验证模块间的交互正确性
工具: Supertest, Puppeteer, Playwright
覆盖范围: API 路由、数据库操作、缓存交互
执行频率: 每次 PR 合并前
```

**示例场景:**
```typescript
// API 集成测试
describe('POST /api/users', () => {
  it('创建用户成功', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '张三', email: 'zhangsan@example.com' })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: '张三'
    });
  });

  it('邮箱格式错误返回400', async () => {
    await request(app)
      .post('/api/users')
      .send({ name: '张三', email: 'invalid-email' })
      .expect(400);
  });

  it('重复邮箱返回409', async () => {
    // 先创建一个用户
    await request(app).post('/api/users').send({
      name: '李四', email: 'lisi@example.com'
    });

    // 尝试重复创建
    await request(app)
      .post('/api/users')
      .send({ name: '王五', email: 'lisi@example.com' })
      .expect(409);
  });
});
```

### E2E 测试策略
```
目标: 验证关键用户路径的完整性
工具: Playwright, Cypress
覆盖范围: 核心业务流程
执行频率: 每次发布前
```

**示例场景:**
```typescript
// 用户注册流程 E2E 测试
test('完整注册流程', async ({ page }) => {
  await page.goto('/register');

  // 填写表单
  await page.fill('#username', 'newuser123');
  await page.fill('#email', 'newuser@example.com');
  await page.fill('#password', 'SecurePass123!');
  await page.fill('#confirmPassword', 'SecurePass123!');

  // 提交
  await page.click('#registerBtn');

  // 验证跳转和成功提示
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.success-message')).toContainText('注册成功');
});
```

## 测试环境策略

### 环境分层
| 环境 | 用途 | 数据 | 隔离性 |
|------|------|------|--------|
| 开发环境 | 本地开发调试 | Mock 数据 | 独立 |
| 测试环境 | CI/CD 自动化测试 | 合成数据 | 共享 |
| 预发布环境 | 发布前验证 | 生产数据副本 | 隔离 |

### 数据准备策略
- [ ] 测试数据生成器
- [ ] 数据库 Fixture
- [ ] 独立测试数据集
- [ ] 数据清理机制

**示例 - Fixture 数据:**
```typescript
const testUsers = [
  { id: 'user-001', name: '测试用户1', role: 'admin' },
  { id: 'user-002', name: '测试用户2', role: 'member' },
];

beforeEach(async () => {
  await db.reset();
  await db.seed({ users: testUsers });
});
```

## 测试工具链

### 工具选型

| 阶段 | 工具 | 用途 |
|------|------|------|
| 单元测试 | Jest/Vitest | 断言、Mock、覆盖率 |
| 集成测试 | Supertest | HTTP API 测试 |
| E2E 测试 | Playwright | 浏览器自动化 |
| API 测试 | REST Assured/Postman | REST API 验证 |
| 性能测试 | k6 | 负载测试 |
| 安全测试 | OWASP ZAP | 安全扫描 |
| 报告 | Allure/Mochawesome | 测试报告 |

### 工具配置示例
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 80,
      lines: 70,
    },
  },
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

## 质量度量指标

### 覆盖率指标
| 指标 | 目标 | 告警阈值 |
|------|------|----------|
| 行覆盖率 | >= 70% | < 60% |
| 分支覆盖率 | >= 60% | < 50% |
| 函数覆盖率 | >= 80% | < 70% |
| 关键路径覆盖率 | 100% | < 100% |

### 执行指标
| 指标 | 目标 | 说明 |
|------|------|------|
| 测试通过率 | >= 95% | PR 级别 |
| 测试执行时间 | < 10 min | CI 级别 |
| 缺陷逃逸率 | < 10% | 生产缺陷/总缺陷 |

### 质量门禁
```
┌─────────────────────────────────────────┐
│           质量门禁 (Quality Gate)         │
├─────────────────────────────────────────┤
│ 单元测试覆盖率 >= 70%       ✅           │
│ 集成测试全部通过           ✅           │
│ E2E 核心路径通过           ✅           │
│ 无 Critical/High 缺陷     ✅           │
│ 代码扫描无高危问题         ✅           │
└─────────────────────────────────────────┘
         ↓ 全部通过才能发布
```

## 风险应对策略

### 已知风险矩阵

| 风险 | 可能性 | 影响 | 应对策略 |
|------|--------|------|----------|
| 第三方服务不稳定 | 中 | 高 | 熔断降级、本地 Mock |
| 复杂业务逻辑 | 高 | 中 | 充分单元测试、边界分析 |
| 遗留代码无测试 | 高 | 中 | 增量覆盖、监控告警 |
| 测试数据不足 | 中 | 高 | 数据工厂、Fixture 复用 |

### 风险缓解措施
- [ ] 核心路径双重覆盖
- [ ] 关键场景每日回归
- [ ] 高风险变更代码审查加强
- [ ] 生产问题快速回滚机制

## 测试自动化策略

### 自动化范围
- [ ] 单元测试 (100% 自动化)
- [ ] 集成测试 (100% 自动化)
- [ ] E2E 核心路径 (100% 自动化)
- [ ] 性能测试 (定时自动化)
- [ ] 安全扫描 (定时自动化)

### 持续集成流水线
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   提交触发    │ →  │   单元测试    │ →  │   代码扫描   │
│              │    │  覆盖率检查   │    │             │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                                ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   发布审批    │ ←  │   预发布验证  │ ←  │   集成测试   │
│              │    │  E2E 测试     │    │  API 测试    │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 特殊场景测试策略

### 数据库测试
```typescript
describe('数据库操作', () => {
  it('事务回滚', async () => {
    const userId = await db.transaction(async (trx) => {
      const id = await UserModel.create({ name: '测试' }, trx);
      throw new Error('模拟失败'); // 触发回滚
    }).catch(() => null);

    // 验证数据已回滚
    expect(await UserModel.findById(userId)).toBeNull();
  });
});
```

### 并发测试
```typescript
it('并发创建用户', async () => {
  const email = 'concurrent@example.com';

  // 模拟 100 并发请求
  const promises = Array(100).fill(null).map(() =>
    request(app).post('/api/users').send({
      name: '并发用户',
      email
    })
  );

  const results = await Promise.all(promises);

  // 验证只有 1 个成功，其他返回 409
  const successCount = results.filter(r => r.status === 201).length;
  const conflictCount = results.filter(r => r.status === 409).length;

  expect(successCount).toBe(1);
  expect(conflictCount).toBe(99);
});
```

### 性能测试 (k6)
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 请求 < 500ms
  },
};

export default function () {
  const res = http.get('https://api.example.com/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

---

## 测试策略文档模板

```markdown
# [项目名称] 测试策略

## 1. 测试目标
- 质量愿景
- 成功标准

## 2. 测试范围
- 纳入范围
- 排除范围
- 裁剪原则

## 3. 测试方法
- 测试金字塔
- 测试级别
- 测试类型

## 4. 测试环境
- 环境配置
- 数据策略

## 5. 工具链
- 工具选型
- 配置说明

## 6. 度量指标
- 覆盖率目标
- 质量门禁

## 7. 风险应对
- 已知风险
- 缓解措施
```

---

## 参考资源

- 《测试金字塔》— Martin Fowler
- 《有效单元测试》— Lubos Kuzma
- Jest 官方文档
- Playwright 官方文档
- k6 性能测试指南