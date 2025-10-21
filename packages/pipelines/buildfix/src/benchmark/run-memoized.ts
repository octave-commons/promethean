#!/usr/bin/env tsx

import { writeFile } from 'fs/promises';
import { models } from './index.js';
import { MemoizedBuildFixBenchmark } from './memoized-benchmark.js';
import { parseArgs } from 'util';

interface BenchmarkSummary {
  totalTests: number;
  successfulTests: number;
  errorsResolved: number;
  averageDuration: number;
  modelResults: Record<
    string,
    {
      successRate: number;
      errorResolution: number;
      avgDuration: number;
      totalErrors: number;
      errorsFixed: number;
    }
  >;
}

function printSummary(_results: any[], summary: BenchmarkSummary): void {
  console.log('\n📊 Benchmark Results Summary');
  console.log('=============================');

  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(
    `Successful Tests: ${summary.successfulTests} (${((summary.successfulTests / summary.totalTests) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Errors Resolved: ${summary.errorsResolved} (${((summary.errorsResolved / summary.totalTests) * 100).toFixed(1)}%)`,
  );
  console.log(`Average Duration: ${summary.averageDuration.toFixed(1)}s`);

  console.log('\n🤖 Model Performance:');
  for (const [modelName, stats] of Object.entries(summary.modelResults)) {
    console.log(`\n${modelName}:`);
    console.log(`  Success Rate: ${stats.successRate.toFixed(1)}%`);
    console.log(`  Error Resolution: ${stats.errorResolution.toFixed(1)}%`);
    console.log(`  Avg Duration: ${stats.avgDuration.toFixed(1)}s`);
    console.log(`  Errors Fixed: ${stats.errorsFixed}/${stats.totalErrors}`);
  }
}

function generateMarkdownReport(
  results: any[],
  summary: BenchmarkSummary,
  timestamp: string,
): string {
  const lines: string[] = [];

  lines.push('# TypeScript BuildFix Benchmark Report');
  lines.push('');
  lines.push('## 📊 Executive Summary');
  lines.push('');
  lines.push(`- **Total Tests**: ${summary.totalTests}`);
  lines.push(
    `- **Success Rate**: ${((summary.successfulTests / summary.totalTests) * 100).toFixed(1)}%`,
  );
  lines.push(
    `- **Errors Resolved**: ${summary.errorsResolved}/${Object.values(summary.modelResults).reduce((sum: number, stats: any) => sum + stats.totalErrors, 0)} (${((summary.errorsResolved / Object.values(summary.modelResults).reduce((sum: number, stats: any) => sum + stats.totalErrors, 0)) * 100).toFixed(1)}%)`,
  );
  lines.push(`- **Average Duration**: ${summary.averageDuration.toFixed(2)} seconds`);
  lines.push(`- **Generated**: ${timestamp}`);
  lines.push('');

  lines.push('## 🎯 Performance Metrics');
  lines.push('');
  lines.push('### Success Rate by Category');
  lines.push('');
  lines.push('| Category | Result | Duration | Attempts | Plan |');
  lines.push('|----------|--------|----------|----------|------|');

  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const duration = (result.duration / 1000).toFixed(2) + 's';
    const attempts = result.attempts.toString();
    const plan = result.planGenerated ? '✅' : '❌';
    lines.push(`| ${result.fixture} | ${status} | ${duration} | ${attempts} | ${plan} |`);
  }

  lines.push('');
  lines.push('### Model Performance Analysis');
  lines.push('');

  for (const [modelName, stats] of Object.entries(summary.modelResults)) {
    lines.push(`#### ${modelName}`);
    lines.push(`- **Success Rate**: ${stats.successRate.toFixed(1)}%`);
    lines.push(`- **Error Resolution Rate**: ${stats.errorResolution.toFixed(1)}%`);
    lines.push(`- **Average Duration**: ${stats.avgDuration.toFixed(2)} seconds`);
    lines.push(`- **Total Errors Encountered**: ${stats.totalErrors}`);
    lines.push(`- **Errors Successfully Fixed**: ${stats.errorsFixed}`);
    lines.push('');
  }

  lines.push('## 🔍 Detailed Test Results');
  lines.push('');

  for (const result of results) {
    lines.push(`### ${result.fixture}`);
    lines.push(`- **Status**: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    lines.push(`- **Errors**: ${result.errorCountBefore} → ${result.errorCountAfter}`);
    lines.push(`- **Resolved**: ${result.errorsResolved ? 'Yes' : 'No'}`);
    lines.push(`- **Plan Generated**: ${result.planGenerated ? 'Yes' : 'No'}`);
    lines.push(`- **Duration**: ${(result.duration / 1000).toFixed(2)}s`);
    lines.push(`- **Attempts**: ${result.attempts}`);
    if (result.planTitle) {
      lines.push(`- **Plan**: ${result.planTitle}`);
    }
    if (result.errorMessage) {
      lines.push(`- **Error**: ${result.errorMessage}`);
    }
    lines.push('');
  }

  // Key Insights section
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success && r.errorCountBefore > 0);
  const noErrors = results.filter((r) => r.errorCountBefore === 0);

  lines.push('## 📈 Key Insights');
  lines.push('');

  if (successful.length > 0) {
    lines.push('### ✅ Successful Fixes');
    for (const result of successful) {
      lines.push(
        `- **${result.fixture}**: Resolved in ${result.attempts} attempt${result.attempts > 1 ? 's' : ''} (${(result.duration / 1000).toFixed(2)}s)`,
      );
    }
    lines.push('');
  }

  if (failed.length > 0) {
    lines.push('### ❌ Failed Fixes');
    for (const result of failed) {
      lines.push(
        `- **${result.fixture}**: Failed after ${result.attempts} attempt${result.attempts > 1 ? 's' : ''} (${(result.duration / 1000).toFixed(2)}s)`,
      );
    }
    lines.push('');
  }

  if (noErrors.length > 0) {
    lines.push('### ⚠️ No Errors Found');
    for (const result of noErrors) {
      lines.push(`- **${result.fixture}**: No errors detected in fixture`);
    }
    lines.push('');
  }

  lines.push('## 🚀 Recommendations');
  lines.push('');
  lines.push('### Immediate Actions');

  if (noErrors.length > 0) {
    lines.push(
      `1. **Fixtures with No Errors**: Review and update ${noErrors.map((r) => r.fixture).join(', ')} fixtures`,
    );
  }

  if (failed.length > 0) {
    lines.push(
      `2. **Failed Error Types**: Investigate why ${failed.map((r) => r.fixture).join(', ')} failed resolution`,
    );
  }

  lines.push(
    `3. **Performance Optimization**: Average duration of ${summary.averageDuration.toFixed(2)}s is ${summary.averageDuration < 10 ? 'good' : 'could be improved'}`,
  );
  lines.push('');

  lines.push('### Next Steps');
  lines.push('1. **Scale Testing**: Run benchmarks with 1000+ errors for statistical significance');
  lines.push('2. **Multi-Model Comparison**: Test different model performance');
  lines.push('3. **Error Pattern Analysis**: Identify common failure patterns across error types');
  lines.push('');

  lines.push('## 📋 Technical Details');
  lines.push('');
  lines.push(`- **Report Generated**: ${new Date().toISOString()}`);
  lines.push(
    `- **Total Benchmark Time**: ${(summary.averageDuration * summary.totalTests).toFixed(2)} seconds`,
  );
  lines.push('- **Cache System**: Enabled with intelligent caching');
  lines.push('- **Environment**: Promethean BuildFix TypeScript');
  lines.push('');
  lines.push('---');
  lines.push('*Generated by Promethean BuildFix Benchmark System*');

  return lines.join('\n');
}

function calculateSummary(results: any[]): BenchmarkSummary {
  const totalTests = results.length;
  const successfulTests = results.filter((r) => r.success).length;
  const errorsResolved = results.filter((r) => r.errorsResolved).length;
  const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests / 1000;

  const modelResults: Record<string, any> = {};

  for (const result of results) {
    if (!modelResults[result.model]) {
      modelResults[result.model] = {
        successCount: 0,
        resolvedCount: 0,
        totalDuration: 0,
        totalErrors: 0,
        errorsFixed: 0,
        count: 0,
      };
    }

    const stats = modelResults[result.model];
    stats.count++;
    stats.totalDuration += result.duration;
    stats.totalErrors += result.errorCountBefore;
    stats.errorsFixed += result.errorCountBefore - result.errorCountAfter;

    if (result.success) stats.successCount++;
    if (result.errorsResolved) stats.resolvedCount++;
  }

  // Convert to final format
  for (const [modelName, stats] of Object.entries(modelResults)) {
    modelResults[modelName] = {
      successRate: (stats.successCount / stats.count) * 100,
      errorResolution: (stats.resolvedCount / stats.count) * 100,
      avgDuration: stats.totalDuration / stats.count / 1000,
      totalErrors: stats.totalErrors,
      errorsFixed: stats.errorsFixed,
    };
  }

  return {
    totalTests,
    successfulTests,
    errorsResolved,
    averageDuration,
    modelResults,
  };
}

async function main() {
  try {
    const args = parseArgs({
      args: process.argv.slice(2),
      options: {
        models: { type: 'string' },
        'force-refresh': { type: 'boolean' },
        'clear-cache': { type: 'boolean' },
        'cache-info': { type: 'boolean' },
        'export-cache': { type: 'string' },
        'import-cache': { type: 'string' },
        'small-fixtures': { type: 'boolean' },
        help: { type: 'boolean' },
      },
    });

    if (args.values.help) {
      console.log(`
Memoized BuildFix Benchmark Runner

Usage: tsx run-memoized.ts [options]

Options:
  --models <models>           Comma-separated list of models to test (default: all)
  --force-refresh             Ignore cache and re-run all benchmarks
  --clear-cache               Clear the benchmark cache
  --cache-info                Show cache information and statistics
  --export-cache <path>       Export cache to specified file
  --import-cache <path>       Import cache from specified file
  --small-fixtures             Use the small 6 fixture set instead of massive fixtures
  --help                      Show this help message

Examples:
  tsx run-memoized.ts                           # Run all models with massive fixtures
  tsx run-memoized.ts --models "qwen3:8b,qwen3:14b"  # Test specific models
  tsx run-memoized.ts --force-refresh           # Ignore cache and re-run
  tsx run-memoized.ts --clear-cache             # Clear cache first
  tsx run-memoized.ts --cache-info              # Show cache statistics
  tsx run-memoized.ts --export-cache backup.json  # Export cache
  tsx run-memoized.ts --small-fixtures           # Use small fixture set
      `);
      process.exit(0);
    }

    const useMassiveFixtures = !args.values['small-fixtures']; // Default to massive fixtures unless small-fixtures is specified
    const benchmark = new MemoizedBuildFixBenchmark(
      './benchmark-temp',
      './benchmark-cache',
      useMassiveFixtures,
    );

    // Handle cache operations
    if (args.values['clear-cache']) {
      await benchmark.clearCache();
      console.log('Cache cleared. Exiting...');
      process.exit(0);
    }

    if (args.values['cache-info']) {
      await benchmark.getCacheInfo();
      process.exit(0);
    }

    if (args.values['export-cache']) {
      await benchmark.exportCache(args.values['export-cache']);
      process.exit(0);
    }

    if (args.values['import-cache']) {
      await benchmark.importCache(args.values['import-cache']);
      console.log('Cache imported. You can now run the benchmark.');
      process.exit(0);
    }

    // Determine which models to test
    let selectedModels = models;
    if (args.values.models) {
      const modelNames = args.values.models.split(',').map((m: string) => m.trim());
      selectedModels = models.filter((m) => modelNames.includes(m.name));

      if (selectedModels.length === 0) {
        console.error('❌ No matching models found. Available models:');
        models.forEach((m) => console.log(`  - ${m.name}`));
        process.exit(1);
      }
    }

    const forceRefresh = args.values['force-refresh'] || false;

    console.log('🚀 Starting Memoized BuildFix Benchmark');
    console.log('=======================================');
    console.log(`🤖 Models to test: ${selectedModels.map((m) => m.name).join(', ')}`);
    console.log(`🔄 Force refresh: ${forceRefresh}`);
    console.log(`📊 Cache enabled: Yes`);
    console.log(
      `📁 Fixture set: ${useMassiveFixtures ? 'Massive (700+ fixtures)' : 'Small (6 fixtures)'}`,
    );

    // Setup benchmark
    await benchmark.setup();

    try {
      // Run the benchmark
      const results = await benchmark.runBenchmark(selectedModels, forceRefresh);

      // Calculate and display summary
      const summary = calculateSummary(results);
      printSummary(results, summary);

      // Save results
      const timestamp = new Date().toISOString();
      const resultsFile = `memoized-benchmark-results-${timestamp.slice(0, 19).replace(/:/g, '-')}.json`;
      await writeFile(resultsFile, JSON.stringify({ results, summary, timestamp }, null, 2));

      // Generate and save markdown report
      const markdownReport = generateMarkdownReport(results, summary, timestamp);
      const markdownFile = resultsFile.replace('.json', '.md');
      await writeFile(markdownFile, markdownReport);

      console.log(`\n💾 Results saved to: ${resultsFile}`);
      console.log(`📝 Markdown report saved to: ${markdownFile}`);
    } finally {
      await benchmark.cleanup();
    }
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
