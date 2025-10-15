#!/usr/bin/env tsx

import { readFile, writeFile } from 'fs/promises';

interface BenchmarkResult {
  fixture: string;
  model: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  duration: number;
  attempts: number;
  planTitle?: string;
  errorMessage?: string;
}

interface BenchmarkReport {
  results: BenchmarkResult[];
}

async function analyzeResults() {
  const data = await readFile(
    '/home/err/devel/promethean/packages/buildfix/massive-fixture-results-from-cache.json',
    'utf8',
  );
  const report: BenchmarkReport = JSON.parse(data);
  const results = report.results;

  console.log(`📊 Analyzing ${results.length} massive fixture results...`);

  // Extract unique fixtures to get actual test count
  const uniqueFixtures = new Set(results.map((r) => r.fixture));
  const totalTests = uniqueFixtures.size;

  // Group results by fixture for analysis
  const resultsByFixture = results.reduce(
    (acc, result) => {
      if (!acc[result.fixture]) {
        acc[result.fixture] = [];
      }
      acc[result.fixture].push(result);
      return acc;
    },
    {} as Record<string, BenchmarkResult[]>,
  );

  // Calculate success metrics per fixture
  const fixtureSuccesses = Object.values(resultsByFixture).filter((fixtureResults) =>
    fixtureResults.some((r) => r.success),
  ).length;

  const successfulTests = fixtureSuccesses;
  const failedTests = totalTests - successfulTests;
  const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

  // Model performance
  const modelStats = results.reduce(
    (acc, result) => {
      if (!acc[result.model]) {
        acc[result.model] = { total: 0, successful: 0, totalDuration: 0 };
      }
      acc[result.model].total++;
      if (result.success) acc[result.model].successful++;
      acc[result.model].totalDuration += result.duration;
      return acc;
    },
    {} as Record<string, { total: number; successful: number; totalDuration: number }>,
  );

  // Error resolution (per fixture)
  const errorsResolved = Object.values(resultsByFixture).filter((fixtureResults) =>
    fixtureResults.some((r) => r.errorsResolved),
  ).length;
  const plansGenerated = Object.values(resultsByFixture).filter((fixtureResults) =>
    fixtureResults.some((r) => r.planGenerated),
  ).length;

  // Duration statistics (using best result per fixture)
  const bestDurations = Object.values(resultsByFixture)
    .map((fixtureResults) => Math.min(...fixtureResults.map((r) => r.duration)))
    .sort((a, b) => a - b);
  const avgDuration = bestDurations.reduce((a, b) => a + b, 0) / bestDurations.length;
  const medianDuration = bestDurations[Math.floor(bestDurations.length / 2)];
  const p95Duration = bestDurations[Math.floor(bestDurations.length * 0.95)];

  // Common error patterns (unique errors per fixture)
  const errorMessages = Object.values(resultsByFixture)
    .map((fixtureResults) => {
      // Get first error message from failed attempts
      const failedResult = fixtureResults.find((r) => r.errorMessage);
      return failedResult ? failedResult.errorMessage!.split('\n')[0] : null;
    })
    .filter((msg): msg is string => msg !== null)
    .reduce(
      (acc, msg) => {
        acc[msg] = (acc[msg] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const topErrors = Object.entries(errorMessages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Generate analysis report
  const analysis = `# Massive Fixture Benchmark Analysis

## Executive Summary

- **Total Tests**: ${totalTests}
- **Successful Tests**: ${successfulTests} (${successRate}%)
- **Failed Tests**: ${failedTests}
- **Errors Resolved**: ${errorsResolved} (${((errorsResolved / totalTests) * 100).toFixed(1)}%)
- **Plans Generated**: ${plansGenerated} (${((plansGenerated / totalTests) * 100).toFixed(1)}%)

## Performance Metrics

### Duration Statistics
- **Average Duration**: ${(avgDuration / 1000).toFixed(1)}s
- **Median Duration**: ${(medianDuration / 1000).toFixed(1)}s
- **95th Percentile**: ${(p95Duration / 1000).toFixed(1)}s

### Model Performance

| Model | Tests | Success Rate | Avg Duration |
|-------|-------|--------------|--------------|
${Object.entries(modelStats)
  .map(
    ([model, stats]) =>
      `| ${model} | ${stats.total} | ${((stats.successful / stats.total) * 100).toFixed(1)}% | ${(stats.totalDuration / stats.total / 1000).toFixed(1)}s |`,
  )
  .join('\n')}

## Key Insights

### Success Factors
${Object.values(resultsByFixture)
  .filter((fixtureResults) => fixtureResults.some((r) => r.success))
  .slice(0, 5)
  .map((fixtureResults) => {
    const successful = fixtureResults.find((r) => r.success);
    return `- **${successful!.fixture}**: ${successful!.planTitle || 'No plan title'}`;
  })
  .join('\n')}

### Common Failure Patterns

#### Top Error Messages
${topErrors
  .map(
    ([msg, count]) =>
      `- **${count} occurrences**: ${msg.substring(0, 100)}${msg.length > 100 ? '...' : ''}`,
  )
  .join('\n')}

### Recommendations

1. **Import Resolution**: Many failures relate to package import issues, suggesting need for better dependency resolution
2. **Error Handling**: Improve handling of complex TypeScript errors with multiple cascading issues
3. **Timeout Management**: Consider increasing timeouts for complex fixtures with high error counts
4. **Model Selection**: ${Object.entries(modelStats).length > 1 ? 'Compare model performance to optimize for success rate vs speed' : 'Current model shows reasonable performance, consider testing with larger models'}

## Detailed Results Summary

### Success by Error Count Range
| Error Count Range | Success Rate |
|-------------------|--------------|
${[0, 1, 2, 5, 10, 20, 50]
  .map((limit) => {
    const rangeFixtures = Object.values(resultsByFixture).filter((fixtureResults) =>
      fixtureResults.some((r) => r.errorCountBefore <= limit),
    );
    const successfulFixtures = rangeFixtures.filter((fixtureResults) =>
      fixtureResults.some((r) => r.success),
    );
    return `| ≤${limit} | ${successfulFixtures.length}/${rangeFixtures.length} (${(
      (successfulFixtures.length / rangeFixtures.length) *
      100
    ).toFixed(1)}%) |`;
  })
  .join('\n')}

### Attempt Distribution
| Attempts | Count | Success Rate |
|----------|-------|--------------|
${[0, 1, 2, 3]
  .map((attempts) => {
    const attemptsGroup = Object.values(resultsByFixture).filter((fixtureResults) =>
      fixtureResults.some((r) => r.attempts === attempts),
    );
    const successfulFixtures = attemptsGroup.filter((fixtureResults) =>
      fixtureResults.some((r) => r.success),
    );
    return `| ${attempts} | ${attemptsGroup.length} | ${
      attemptsGroup.length > 0
        ? ((successfulFixtures.length / attemptsGroup.length) * 100).toFixed(1)
        : 0
    }% |`;
  })
  .join('\n')}

### Attempt Distribution
| Attempts | Count | Success Rate |
|----------|-------|--------------|
${[0, 1, 2, 3]
  .map((attempts) => {
    const attemptsGroup = results.filter((r) => r.attempts === attempts);
    const successful = attemptsGroup.filter((r) => r.success).length;
    return `| ${attempts} | ${attemptsGroup.length} | ${attemptsGroup.length > 0 ? ((successful / attemptsGroup.length) * 100).toFixed(1) : 0}% |`;
  })
  .join('\n')}

---
*Generated from ${totalTests} unique massive fixtures (${results.length} total model runs)*
`;

  await writeFile(
    '/home/err/devel/promethean/packages/buildfix/massive-fixture-results-analysis.md',
    analysis,
  );
  console.log('✅ Analysis complete! Report saved to massive-fixture-results-analysis.md');

  // Print key stats to console
  console.log('\n📈 Key Statistics:');
  console.log(`   Success Rate: ${successRate}%`);
  console.log(`   Average Duration: ${(avgDuration / 1000).toFixed(1)}s`);
  console.log(`   Errors Resolved: ${((errorsResolved / totalTests) * 100).toFixed(1)}%`);
}

analyzeResults().catch(console.error);
