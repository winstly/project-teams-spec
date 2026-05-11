/**
 * Complexity Evaluation Helper Script
 *
 * Provides structured complexity scoring for projects.
 * Run: npx ts-node scripts/evaluate.ts <project-path>
 */

interface ComplexityDimensions {
  codeScale: number;
  techDiversity: number;
  coupling: number;
  changeRisk: number;
  externalDeps: number;
}

interface ComplexityReport {
  level: 'S' | 'M' | 'L' | 'XL';
  score: number;
  dimensions: ComplexityDimensions;
  recommendedAgents: string[];
  deliveryTargets: string[];
  estimatedEffort: string;
  risks: Array<{ name: string; severity: string; mitigation: string }>;
}

const WEIGHTS = {
  codeScale: 0.20,
  techDiversity: 0.20,
  coupling: 0.25,
  changeRisk: 0.20,
  externalDeps: 0.15,
};

function calculateCodeScale(fileCount: number, lineCount: number): number {
  // 0-25 scale based on file count and line count
  const fileScore = Math.min(15, fileCount / 50 * 12.5);
  const lineScore = Math.min(10, lineCount / 10000 * 10);
  return Math.min(25, fileScore + lineScore);
}

function calculateTechDiversity(techs: string[]): number {
  // 0-25 scale based on number of distinct technologies
  return Math.min(25, techs.length * 8);
}

function calculateCoupling(moduleCount: number, crossModuleImports: number): number {
  // 0-30 scale based on coupling metrics
  const baseScore = crossModuleImports * 2;
  return Math.min(30, baseScore);
}

function calculateChangeRisk(coreModuleRatio: number, hasSchemaChanges: boolean): number {
  // 0-30 scale
  let score = coreModuleRatio * 20;
  if (hasSchemaChanges) score += 10;
  return Math.min(30, score);
}

function calculateExternalDeps(depCount: number): number {
  // 0-25 scale
  return Math.min(25, depCount * 5);
}

function determineLevel(score: number): 'S' | 'M' | 'L' | 'XL' {
  if (score <= 25) return 'S';
  if (score <= 50) return 'M';
  if (score <= 75) return 'L';
  return 'XL';
}

export function evaluateComplexity(
  fileCount: number,
  lineCount: number,
  techs: string[],
  crossModuleImports: number,
  coreModuleRatio: number,
  hasSchemaChanges: boolean,
  depCount: number
): ComplexityReport {
  const codeScale = calculateCodeScale(fileCount, lineCount);
  const techDiversity = calculateTechDiversity(techs);
  const coupling = calculateCoupling(techs.length, crossModuleImports);
  const changeRisk = calculateChangeRisk(coreModuleRatio, hasSchemaChanges);
  const externalDeps = calculateExternalDeps(depCount);

  const totalScore =
    codeScale * WEIGHTS.codeScale +
    techDiversity * WEIGHTS.techDiversity +
    coupling * WEIGHTS.coupling +
    changeRisk * WEIGHTS.changeRisk +
    externalDeps * WEIGHTS.externalDeps;

  const level = determineLevel(totalScore);

  return {
    level,
    score: Math.round(totalScore),
    dimensions: {
      codeScale: Math.round(codeScale),
      techDiversity: Math.round(techDiversity),
      coupling: Math.round(coupling),
      changeRisk: Math.round(changeRisk),
      externalDeps: Math.round(externalDeps),
    },
    recommendedAgents: getRecommendedAgents(level, techs),
    deliveryTargets: getDeliveryTargets(level),
    estimatedEffort: estimateEffort(totalScore),
    risks: getRisks(level, hasSchemaChanges),
  };
}

function getRecommendedAgents(level: string, techs: string[]): string[] {
  const agents: string[] = ['qa-agent'];
  if (techs.some(t => ['react', 'vue', 'angular', 'svelte'].includes(t))) {
    agents.push('frontend-agent');
  }
  if (techs.some(t => ['java', 'node', 'go', 'python'].includes(t))) {
    agents.push('backend-agent');
  }
  if (level === 'L' || level === 'XL') {
    agents.push('code-reviewer');
  }
  return agents;
}

function getDeliveryTargets(level: string): string[] {
  const targets = ['代码改造', '测试覆盖'];
  if (level === 'L' || level === 'XL') {
    targets.push('分阶段交付', '回归测试');
  }
  return targets;
}

function estimateEffort(score: number): string {
  if (score <= 25) return '1-2 天';
  if (score <= 50) return '3-5 天';
  if (score <= 75) return '1-2 周';
  return '2-4 周（建议拆分）';
}

function getRisks(level: string, hasSchemaChanges: boolean): Array<{ name: string; severity: string; mitigation: string }> {
  const risks: Array<{ name: string; severity: string; mitigation: string }> = [];

  if (level === 'L' || level === 'XL') {
    risks.push({
      name: '高复杂度项目协调风险',
      severity: 'high',
      mitigation: '分阶段交付，每个阶段有明确的交付目标',
    });
  }

  if (hasSchemaChanges) {
    risks.push({
      name: '数据库迁移风险',
      severity: 'high',
      mitigation: '先备份，制定回滚方案，灰度发布',
    });
  }

  return risks;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || '.';
  console.log(`Evaluating complexity for: ${projectPath}`);
  console.log('Note: This script requires manual input of metrics.');
  console.log('Use the complexity-evaluate SKILL.md for AI-driven evaluation.');
}