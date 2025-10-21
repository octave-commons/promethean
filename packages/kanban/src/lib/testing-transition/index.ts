import { analyzeCoverage } from './coverage-analyzer.js';
import { calculateQualityScore } from './quality-scorer.js';
import { mapRequirements, validateMappings } from './requirement-mapper.js';
import { analyzeWithAI } from './ai-analyzer.js';
import { generateReport } from './report-generator.js';
import type {
  TestCoverageRequest,
  TestingTransitionConfig,
  AIAnalysisRequest,
} from './types.js';

/**
 * Main orchestrator for testing→review transition validation
 */
export async function runTestingTransition(
  reportReq: TestCoverageRequest,
  executedTests: string[],
  initialMappings: Array<{ requirementId: string; testIds: string[] }>,
  config: TestingTransitionConfig,
  tests: string[],
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
    complexity: computeAverageComplexity(tests),
    passRate: computePassRate(tests),
    flakiness: detectFlakiness(tests),
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
    tests,
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