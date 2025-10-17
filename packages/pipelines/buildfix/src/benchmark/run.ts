#!/usr/bin/env node

import { BuildFixBenchmark } from './index.js';

async function main() {
  const benchmark = new BuildFixBenchmark('./benchmark-temp');

  try {
    console.log('🚀 Starting BuildFix Model Benchmark');
    console.log('=====================================');

    // Setup fixtures
    console.log('Setting up fixtures...');
    await benchmark.setup();

    // Run benchmark
    console.log('Running benchmark tests...');
    const results = await benchmark.runFullBenchmark();

    // Generate and save report
    console.log('Generating report...');
    await benchmark.saveReport(results, './buildfix-benchmark-report.md');

    // Print summary
    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.success).length;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

    console.log('\n📊 Benchmark Summary');
    console.log('===================');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Success rate: ${successRate}%`);

    // Show best performing model
    const modelStats = new Map<string, { successful: number; total: number }>();
    for (const result of results) {
      if (!modelStats.has(result.model)) {
        modelStats.set(result.model, { successful: 0, total: 0 });
      }
      const stats = modelStats.get(result.model)!;
      stats.total++;
      if (result.success) stats.successful++;
    }

    const bestModel = Array.from(modelStats.entries())
      .map(([model, stats]) => ({
        model,
        successRate: (stats.successful / stats.total) * 100,
      }))
      .sort((a, b) => b.successRate - a.successRate)[0];

    if (bestModel) {
      console.log(
        `Best model: ${bestModel.model} (${bestModel.successRate.toFixed(1)}% success rate)`,
      );
    }
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await benchmark.cleanup();
  }
}

main();
