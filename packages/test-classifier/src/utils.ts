import pkg from 'fast-glob';
const { globSync } = pkg;
import { resolve } from 'node:path';
import { TestType, ClassificationResult, ClassificationSummary } from './types.js';
import { TestClassifier } from './classifier.js';

/**
 * Find all test files in a workspace
 */
export function findTestFiles(workspaceRoot = process.cwd(), patterns: string[] = []): string[] {
  const defaultPatterns = [
    'packages/**/src/tests/**/*.test.ts',
    'packages/**/src/tests/**/*.test.js',
    'packages/**/tests/**/*.test.ts',
    'packages/**/tests/**/*.test.js',
    'packages/**/src/test/**/*.test.ts',
    'packages/**/src/test/**/*.test.js',
    'packages/**/test/**/*.test.ts',
    'packages/**/test/**/*.test.js',
    'services/**/src/tests/**/*.test.ts',
    'services/**/src/tests/**/*.test.js',
    'services/**/tests/**/*.test.ts',
    'services/**/tests/**/*.test.js',
    'tests/**/*.test.ts',
    'tests/**/*.test.js',
    '**/*.unit.test.ts',
    '**/*.unit.test.js',
    '**/*.integration.test.ts',
    '**/*.integration.test.js',
    '**/*.e2e.test.ts',
    '**/*.e2e.test.js',
    '**/*.unit.spec.ts',
    '**/*.unit.spec.js',
    '**/*.integration.spec.ts',
    '**/*.integration.spec.js',
    '**/*.e2e.spec.ts',
    '**/*.e2e.spec.js',
  ];

  const searchPatterns = patterns.length > 0 ? patterns : defaultPatterns;
  const files = globSync(searchPatterns, {
    cwd: workspaceRoot,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**'],
  });

  return files.map((file: string) => resolve(workspaceRoot, file));
}

/**
 * Classify all test files in a workspace
 */
export function classifyWorkspaceTests(
  workspaceRoot = process.cwd(),
  patterns?: string[],
  classifier?: TestClassifier,
): ClassificationSummary {
  const testClassifier = classifier || new TestClassifier();
  const testFiles = findTestFiles(workspaceRoot, patterns);
  const results = testClassifier.classifyFiles(testFiles, workspaceRoot);

  return summarizeClassification(results);
}

/**
 * Summarize classification results
 */
export function summarizeClassification(results: ClassificationResult[]): ClassificationSummary {
  const byType: Record<TestType, number> = {
    [TestType.UNIT]: 0,
    [TestType.INTEGRATION]: 0,
    [TestType.E2E]: 0,
    [TestType.UNKNOWN]: 0,
  };

  let totalConfidence = 0;

  for (const result of results) {
    byType[result.testType]++;
    totalConfidence += result.confidence;
  }

  return {
    totalFiles: results.length,
    byType,
    unclassified: byType[TestType.UNKNOWN],
    averageConfidence: results.length > 0 ? totalConfidence / results.length : 0,
    results,
  };
}

/**
 * Filter classification results by test type
 */
export function filterByType(
  results: ClassificationResult[],
  testType: TestType,
): ClassificationResult[] {
  return results.filter((result) => result.testType === testType);
}

/**
 * Get files with low confidence classifications
 */
export function getLowConfidenceFiles(
  results: ClassificationResult[],
  threshold = 0.6,
): ClassificationResult[] {
  return results.filter((result) => result.confidence < threshold);
}

/**
 * Generate a classification report
 */
export function generateReport(summary: ClassificationSummary): string {
  const lines: string[] = [];

  lines.push('# Test Classification Report');
  lines.push('');
  lines.push(`Total files processed: ${summary.totalFiles}`);
  lines.push(`Average confidence: ${(summary.averageConfidence * 100).toFixed(1)}%`);
  lines.push('');

  lines.push('## Classification by Type');
  lines.push('');
  for (const [testType, count] of Object.entries(summary.byType)) {
    const percentage =
      summary.totalFiles > 0 ? ((count / summary.totalFiles) * 100).toFixed(1) : '0.0';
    lines.push(`- ${testType}: ${count} files (${percentage}%)`);
  }
  lines.push('');

  if (summary.unclassified > 0) {
    lines.push(`## Unclassified Files (${summary.unclassified})`);
    lines.push('');
    const unclassifiedResults = filterByType(summary.results, TestType.UNKNOWN);
    for (const result of unclassifiedResults) {
      lines.push(`- ${result.filePath} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
      lines.push(`  Reasoning: ${result.reasoning.join(', ')}`);
    }
    lines.push('');
  }

  const lowConfidenceFiles = getLowConfidenceFiles(summary.results);
  if (lowConfidenceFiles.length > 0) {
    lines.push(`## Low Confidence Files (<60%)`);
    lines.push('');
    for (const result of lowConfidenceFiles) {
      lines.push(
        `- ${result.filePath} (${result.testType}, confidence: ${(result.confidence * 100).toFixed(1)}%)`,
      );
      lines.push(`  Reasoning: ${result.reasoning.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate test file lists for CI/CD pipelines
 */
export function generateTestFileLists(summary: ClassificationSummary): Record<string, string[]> {
  const lists: Record<string, string[]> = {
    unit: [],
    integration: [],
    e2e: [],
    all: [],
  };

  for (const result of summary.results) {
    if (result.testType !== TestType.UNKNOWN) {
      const typeList = lists[result.testType];
      if (typeList) {
        typeList.push(result.filePath);
      }
    }
    const allList = lists.all;
    if (allList) {
      allList.push(result.filePath);
    }
  }

  return lists;
}
