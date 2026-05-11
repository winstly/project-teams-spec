# Complexity Report Template

# 项目复杂度评估报告

## 基本信息

- **项目名称**: {{project_name}}
- **评估时间**: {{evaluated_at}}
- **评估依据**: PROJECT.md

## 复杂度等级

**等级**: {{level}} ({{score}}分)

| 维度 | 得分 | 权重 | 加权分 |
|------|------|------|--------|
| 代码规模 | {{dimensions.code_scale}} | 20% | {{weighted_code_scale}} |
| 技术多样性 | {{dimensions.tech_diversity}} | 20% | {{weighted_tech_diversity}} |
| 模块耦合度 | {{dimensions.coupling}} | 25% | {{weighted_coupling}} |
| 变更风险 | {{dimensions.change_risk}} | 20% | {{weighted_change_risk}} |
| 外部依赖 | {{dimensions.external_deps}} | 15% | {{weighted_external_deps}} |
| **总分** | - | 100% | **{{total_score}}** |

## 维度分析

### 代码规模 ({{dimensions.code_scale}}/25)

{{code_scale_analysis}}

### 技术多样性 ({{dimensions.tech_diversity}}/25)

{{tech_diversity_analysis}}

### 模块耦合度 ({{dimensions.coupling}}/25)

{{coupling_analysis}}

### 变更风险 ({{dimensions.change_risk}}/25)

{{change_risk_analysis}}

### 外部依赖 ({{dimensions.external_deps}}/25)

{{external_deps_analysis}}

## 建议的 Agent

{{#each recommended_agents}}
- **{{name}}**: {{reason}}
{{/each}}

## 交付目标

{{#each delivery_targets}}
### {{name}}
- **优先级**: {{priority}}
- **预计工时**: {{effort}}
- **截止时间**: {{deadline}}
{{/each}}

## 预估工时

**总计**: {{estimated_effort}}

## 风险评估

{{#each risks}}
### {{name}}
- **严重程度**: {{severity}}
- **缓解措施**: {{mitigation}}
{{/each}}

## 建议

{{suggestion}}

---

*此报告由 complexity-evaluate Skill 自动生成*
*如需调整，请修改 PROJECT.md 后重新评估*