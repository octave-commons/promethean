import { analyzeCoverage } from './coverage-analyzer.js';
import { calculateQualityScore } from './quality-scorer.js';
import { mapRequirements, validateMappings } from './requirement-mapper.js';
import { analyzeWithAI } from './ai-analyzer.js';
import { generateReport } from './report-generator.js';
import { ComprehensiveScorer, defaultScorer } from './comprehensive-scorer.js';
import type {
  TestCoverageRequest,
  TestingTransitionConfig,
  AIAnalysisRequest,
  ComprehensiveScoreResult,
  PerformanceMetrics,
} from './types.js';

/**
 * Enhanced main orchestrator for testing→review transition validation with comprehensive scoring
 */
export async function runComprehensiveTestingTransition(
  reportReq: TestCoverageRequest,
  executedTests: string[],
  initialMappings: Array<{ requirementId: string; testIds: string[] }>,
  config: TestingTransitionConfig,
  testFiles: string[],
  outputDir: string,
  performanceMetrics?: PerformanceMetrics
): Promise<{ reportPath: string; scoreResult: ComprehensiveScoreResult }> {
  // Step 1: Coverage analysis
  const coverage = await analyzeCoverage(reportReq);

  // Step 2: Quality scoring
  const qualityScore = calculateQualityScore({
    complexity: computeAverageComplexity(testFiles),
    passRate: computePassRate(testFiles),
    flakiness: detectFlakiness(testFiles),
  });

  // Step 3: Requirement mapping validation
  const mapped = mapRequirements(
    initialMappings as any,
    executedTests
  );

  // Step 4: AI analysis
  const aiReq: AIAnalysisRequest = {
    tests: testFiles,
    coverageResult: coverage,
    qualityScore,
    mappings: mapped,
  };
  const aiAnalysis = await analyzeWithAI(aiReq);

  // Step 5: Comprehensive scoring
  const scorer = config.scoring?.enabled 
    ? new ComprehensiveScorer(config.scoring?.weights, config.scoring?.priorityThresholds)
    : defaultScorer;

  const scoreResult = await scorer.calculateScore({
    task: reportReq.task,
    coverage,
    quality: qualityScore,
    requirementMappings: mapped,
    aiAnalysis,
    performanceMetrics
  });

  // Step 6: Check against thresholds
  if (!scoreResult.meetsThreshold) {
    const blockMessage = generateTestBlockMessage(scoreResult);
    throw new Error(blockMessage);
  }

  // Step 7: Generate report
  const reportPath = generateReport(
    { coverage, qualityScore, mappings: mapped, aiAnalysis, scoreResult } as any,
    outputDir
  );

  return { reportPath, scoreResult };
}

/**
 * Legacy main orchestrator for backward compatibility
 */
export async function runTestingTransition(
  reportReq: TestCoverageRequest,
  executedTests: string[],
  initialMappings: Array<{ requirementId: string; testIds: string[] }>,
  config: TestingTransitionConfig,
  testFiles: string[],
  outputDir: string
) {
  // Step 1: Coverage analysis
  const coverage = await analyzeCoverage(reportReq);

  // Hard block check
  if (coverage.totalCoverage < config.hardBlockCoverageThreshold) {
    throw new Error(
      `Coverage threshold not met: ${coverage.totalCoverage}% < ${config.hardBlockCoverageThreshold}%`
    );
  }

  // Step 2: Quality scoring
  const qualityScore = calculateQualityScore({
    complexity: computeAverageComplexity(testFiles),
    passRate: computePassRate(testFiles),
    flakiness: detectFlakiness(testFiles),
  });

  if (qualityScore.score < config.softBlockQualityScoreThreshold) {
    throw new Error(
      `Quality score below threshold: ${qualityScore.score} < ${config.softBlockQualityScoreThreshold}`
    );
  }

  // Step 3: Requirement mapping validation
  const mapped = mapRequirements(
    initialMappings as any,
    executedTests
  );
  if (!validateMappings(mapped)) {
    throw new Error('Not all requirements are covered by tests');
  }

  // Step 4: AI analysis
  const aiReq: AIAnalysisRequest = {
    tests: testFiles,
    coverageResult: coverage,
    qualityScore,
    mappings: mapped,
  };
  const aiAnalysis = await analyzeWithAI(aiReq);

  // Step 5: Generate report
  const reportPath = generateReport(
    { coverage, qualityScore, mappings: mapped, aiAnalysis } as any,
    outputDir
  );

  return reportPath;
}

  // Step 2: Quality scoring
  const qualityScore = calculateQualityScore({
    complexity: computeAverageComplexity(tests),
    passRate: computePassRate(tests),
    flakiness: detectFlakiness(tests),
  });

  if (qualityScore.score < config.softBlockQualityScoreThreshold) {
    throw new Error(
      `Quality score below threshold: ${qualityScore.score} < ${config.softBlockQualityScoreThreshold}`,
    );
  }

  // Step 3: Requirement mapping validation
  const mapped = mapRequirements(initialMappings as any, executedTests);
  if (!validateMappings(mapped)) {
    throw new Error('Not all requirements are covered by tests');
  }

  // Step 4: AI analysis
  const aiReq: AIAnalysisRequest = {
    tests,
    coverageResult: coverage,
    qualityScore,
    mappings: mapped,
  };
  const aiAnalysis = await analyzeWithAI(aiReq);

  // Step 5: Generate report
  const reportPath = generateReport(
    { coverage, qualityScore, mappings: mapped, aiAnalysis } as any,
    outputDir,
  );

  return reportPath;
}

// Helper function to generate test block messages
function generateTestBlockMessage(scoreResult: ComprehensiveScoreResult): string {
  const componentEntries = Object.entries(scoreResult.componentScores);
  const gaps = componentEntries
    .filter(([, cs]) => cs.score < 80)
    .map(([name, cs]) => `${name}: ${cs.score.toFixed(1)}% (threshold: 80%)`)
    .join(', ');
  
  const message = `Testing transition blocked. Overall score: ${scoreResult.totalScore}/100 (threshold: ${scoreResult.threshold}). Gaps: ${gaps}`;
  
  if (scoreResult.actionItems.length > 0) {
    const highPriorityActions = scoreResult.actionItems
      .filter(item => item.priority === 'high')
      .map(item => item.description)
      .slice(0, 3)
      .join('; ');
    return `${message}. Priority actions: ${highPriorityActions}`;
  }
  
  return message;
}

// Placeholder implementations for complexity, pass rate, flakiness
function computeAverageComplexity(_tests: string[]): number {
  return 1; // TODO: integrate metrics
}

function computePassRate(_tests: string[]): number {
  return 100; // TODO: integrate test runner results
}

function detectFlakiness(_tests: string[]): number {
  return 0; // TODO: integrate historical test data
}
