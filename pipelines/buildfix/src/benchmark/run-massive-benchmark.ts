#!/usr/bin/env tsx

import { writeFile } from 'fs/promises';
import { models } from './index.js';
import { MemoizedBuildFixBenchmark } from './memoized-benchmark.js';
import { parseArgs } from 'util';
import * as path from 'path';
import { promises as fs } from 'fs';

interface MassiveBenchmarkConfig {
  models?: string;
  fixtureDir?: string;
  forceRefresh?: boolean;
  clearCache?: boolean;
  batchSize?: number;
  help?: boolean;
}

class MassiveBenchmarkRunner {
  private benchmark: MemoizedBuildFixBenchmark;

  constructor() {
    this.benchmark = new MemoizedBuildFixBenchmark(
      './massive-benchmark-temp',
      './massive-benchmark-cache',
    );
  }

  async discoverFixtures(fixtureDir: string): Promise<string[]> {
    const fixtures: string[] = [];

    async function scanDirectory(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Check if this directory contains tsconfig.json (indicating a fixture)
          const tsconfigPath = path.join(fullPath, 'tsconfig.json');
          try {
            await fs.access(tsconfigPath);
            fixtures.push(fullPath);
          } catch {
            // Not a fixture, scan subdirectories
            await scanDirectory(fullPath);
          }
        }
      }
    }

    await scanDirectory(fixtureDir);
    return fixtures.sort();
  }

  async runMassiveBenchmark(config: MassiveBenchmarkConfig): Promise<void> {
    console.log('🚀 Massive BuildFix Benchmark Runner');
    console.log('===================================');

    try {
      // Setup
      await this.benchmark.setup();

      // Discover fixtures
      const fixtureDir = config.fixtureDir || './massive-fixture-generation-2';
      console.log(`\n🔍 Discovering fixtures in: ${fixtureDir}`);

      const fixturePaths = await this.discoverFixtures(fixtureDir);
      console.log(`📁 Found ${fixturePaths.length} fixtures`);

      if (fixturePaths.length === 0) {
        console.error('❌ No fixtures found!');
        return;
      }

      // Determine models to test
      let selectedModels = models;
      if (config.models) {
        const modelNames = config.models.split(',').map((m: string) => m.trim());
        selectedModels = models.filter((m) => modelNames.includes(m.name));

        if (selectedModels.length === 0) {
          console.error('❌ No matching models found. Available models:');
          models.forEach((m) => console.log(`  - ${m.name}`));
          return;
        }
      }

      const batchSize = config.batchSize || 50;
      console.log(`\n🎯 Configuration:`);
      console.log(`  Models: ${selectedModels.map((m) => m.name).join(', ')}`);
      console.log(`  Fixtures: ${fixturePaths.length}`);
      console.log(`  Batch size: ${batchSize}`);
      console.log(`  Force refresh: ${config.forceRefresh || false}`);
      console.log(`  Total batches: ${Math.ceil(fixturePaths.length / batchSize)}`);

      // Process in batches
      const allResults: any[] = [];

      for (let batchNum = 0; batchNum < Math.ceil(fixturePaths.length / batchSize); batchNum++) {
        const startIdx = batchNum * batchSize;
        const endIdx = Math.min(startIdx + batchSize, fixturePaths.length);
        const batchFixtures = fixturePaths.slice(startIdx, endIdx);

        console.log(
          `\n📦 Batch ${batchNum + 1}/${Math.ceil(fixturePaths.length / batchSize)}: ${batchFixtures.length} fixtures`,
        );

        // Create custom fixture list for this batch
        const batchResults = await this.runBatch(
          batchFixtures,
          selectedModels,
          config.forceRefresh || false,
        );
        allResults.push(...batchResults);

        // Show batch summary
        const batchSuccess = batchResults.filter((r: any) => r.success).length;
        const batchResolved = batchResults.filter((r: any) => r.errorsResolved).length;
        console.log(
          `  ✅ Batch ${batchNum + 1} complete: ${batchSuccess}/${batchFixtures.length} successful, ${batchResolved} errors resolved`,
        );
      }

      // Generate final report
      await this.generateMassiveReport(allResults, selectedModels);
    } finally {
      await this.benchmark.cleanup();
    }
  }

  private async runBatch(
    fixturePaths: string[],
    selectedModels: any[],
    forceRefresh: boolean,
  ): Promise<any[]> {
    const results: any[] = [];

    // Process each model separately (optimal batching)
    for (const modelConfig of selectedModels) {
      console.log(`\n🤖 Processing batch with ${modelConfig.name}...`);

      const modelResults: any[] = [];

      for (let i = 0; i < fixturePaths.length; i++) {
        const fixturePath = fixturePaths[i];
        const progress = Math.round(((i + 1) / fixturePaths.length) * 100);

        process.stdout.write(
          `\r⚡ ${modelConfig.name}: ${i + 1}/${fixturePaths.length} (${progress}%)`,
        );

        // Create fixture object from path
        const fixture = await this.createFixtureFromPath(fixturePath!);
        const result = await this.benchmark.runSingleBenchmark(
          fixture,
          modelConfig,
          3,
          forceRefresh,
        );
        modelResults.push(result);
      }

      console.log(
        `\n✅ ${modelConfig.name} batch complete: ${modelResults.filter((r) => r.success).length}/${modelResults.length} successful`,
      );
      results.push(...modelResults);
    }

    return results;
  }

  private async createFixtureFromPath(fixturePath: string): Promise<any> {
    const fixtureName = path.basename(fixturePath);

    // Read fixture files
    const files: Record<string, string> = {};
    const entries = await fs.readdir(fixturePath, { withFileTypes: true });

    for (const entry of entries) {
      if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.json'))
      ) {
        const filePath = path.join(fixturePath, entry.name);
        const content = await fs.readFile(filePath, 'utf-8');
        files[entry.name] = content;
      }
    }

    return {
      name: fixtureName,
      files,
      path: fixturePath,
    };
  }

  private async generateMassiveReport(results: any[], selectedModels: any[]): Promise<void> {
    console.log('\n📊 Generating massive benchmark report...');

    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.success).length;
    const errorsResolved = results.filter((r) => r.errorsResolved).length;
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests / 1000;

    // Model-specific stats
    const modelStats: Record<string, any> = {};
    for (const modelConfig of selectedModels) {
      const modelResults = results.filter((r) => r.model === modelConfig.name);
      const modelSuccess = modelResults.filter((r) => r.success).length;
      const modelResolved = modelResults.filter((r) => r.errorsResolved).length;
      const modelAvgDuration =
        modelResults.reduce((sum, r) => sum + r.duration, 0) / modelResults.length / 1000;

      modelStats[modelConfig.name] = {
        total: modelResults.length,
        successful: modelSuccess,
        resolved: modelResolved,
        successRate: (modelSuccess / modelResults.length) * 100,
        resolutionRate: (modelResolved / modelResults.length) * 100,
        avgDuration: modelAvgDuration,
      };
    }

    const timestamp = new Date().toISOString();
    const reportData = {
      results,
      summary: {
        totalTests,
        successfulTests,
        errorsResolved,
        averageDuration,
        modelStats,
      },
      timestamp,
      config: {
        models: selectedModels.map((m) => m.name),
        totalFixtures: totalTests / selectedModels.length,
      },
    };

    // Save JSON report
    const resultsFile = `massive-benchmark-results-${timestamp.slice(0, 19).replace(/:/g, '-')}.json`;
    await writeFile(resultsFile, JSON.stringify(reportData, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(reportData);
    const markdownFile = resultsFile.replace('.json', '.md');
    await writeFile(markdownFile, markdownReport);

    console.log(`\n💾 Massive benchmark results saved to: ${resultsFile}`);
    console.log(`📝 Markdown report saved to: ${markdownFile}`);

    // Print summary
    console.log('\n📊 Massive Benchmark Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`  Error Resolution: ${((errorsResolved / totalTests) * 100).toFixed(1)}%`);
    console.log(`  Average Duration: ${averageDuration.toFixed(2)}s`);

    for (const [modelName, stats] of Object.entries(modelStats)) {
      console.log(`\n🤖 ${modelName}:`);
      console.log(`  Success Rate: ${stats.successRate.toFixed(1)}%`);
      console.log(`  Resolution Rate: ${stats.resolutionRate.toFixed(1)}%`);
      console.log(`  Avg Duration: ${stats.avgDuration.toFixed(2)}s`);
    }
  }

  private generateMarkdownReport(data: any): string {
    const { summary, timestamp, config } = data;

    const lines = [
      '# Massive BuildFix Benchmark Report',
      '',
      '## 📊 Executive Summary',
      '',
      `- **Total Tests**: ${summary.totalTests}`,
      `- **Success Rate**: ${((summary.successfulTests / summary.totalTests) * 100).toFixed(1)}%`,
      `- **Error Resolution**: ${((summary.errorsResolved / summary.totalTests) * 100).toFixed(1)}%`,
      `- **Average Duration**: ${summary.averageDuration.toFixed(2)} seconds`,
      `- **Models Tested**: ${config.models.join(', ')}`,
      `- **Fixtures Tested**: ${config.totalFixtures}`,
      `- **Generated**: ${timestamp}`,
      '',
      '## 🎯 Model Performance Analysis',
      '',
    ];

    for (const [modelName, stats] of Object.entries(summary.modelStats)) {
      const typedStats = stats as any;
      lines.push(`### ${modelName}`);
      lines.push(`- **Tests**: ${typedStats.total}`);
      lines.push(`- **Success Rate**: ${typedStats.successRate.toFixed(1)}%`);
      lines.push(`- **Error Resolution Rate**: ${typedStats.resolutionRate.toFixed(1)}%`);
      lines.push(`- **Average Duration**: ${typedStats.avgDuration.toFixed(2)} seconds`);
      lines.push('');
    }

    lines.push('## 📈 Performance Insights');
    lines.push('');

    // Find best performing model
    const bestModel = Object.entries(summary.modelStats).reduce(
      (best: any, [name, stats]: [string, any]) => {
        const typedStats = stats as any;
        if (!best || typedStats.resolutionRate > best.resolutionRate) {
          return { name, ...typedStats };
        }
        return best;
      },
      null,
    );

    if (bestModel) {
      lines.push(`### 🏆 Best Performing Model: ${bestModel.name}`);
      lines.push(`- **Error Resolution Rate**: ${bestModel.resolutionRate.toFixed(1)}%`);
      lines.push(`- **Success Rate**: ${bestModel.successRate.toFixed(1)}%`);
      lines.push(`- **Average Duration**: ${bestModel.avgDuration.toFixed(2)}s`);
      lines.push('');
    }

    lines.push('## 🔍 Technical Details');
    lines.push('');
    lines.push(`- **Benchmark Framework**: Promethean BuildFix Massive Benchmark`);
    lines.push(`- **Caching**: Enabled with intelligent memoization`);
    lines.push(`- **Batch Processing**: Optimized model batching for maximum GPU utilization`);
    lines.push(`- **Report Generated**: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('---');
    lines.push('*Generated by Promethean Massive BuildFix Benchmark System*');

    return lines.join('\n');
  }
}

async function main() {
  try {
    const args = parseArgs({
      args: process.argv.slice(2),
      options: {
        models: { type: 'string' },
        'fixture-dir': { type: 'string' },
        'force-refresh': { type: 'boolean' },
        'clear-cache': { type: 'boolean' },
        'batch-size': { type: 'string' },
        help: { type: 'boolean' },
      },
    });

    if (args.values.help) {
      console.log(`
Massive BuildFix Benchmark Runner

Usage: tsx run-massive-benchmark.ts [options]

Options:
  --models <models>           Comma-separated list of models to test (default: all)
  --fixture-dir <path>        Directory containing fixtures (default: ./massive-fixture-generation-2)
  --force-refresh             Ignore cache and re-run all benchmarks
  --clear-cache               Clear the benchmark cache before running
  --batch-size <size>         Number of fixtures per batch (default: 50)
  --help                      Show this help message

Examples:
  tsx run-massive-benchmark.ts                                    # Run all models on all fixtures
  tsx run-massive-benchmark.ts --models "qwen3:8b"                 # Test specific model
  tsx run-massive-benchmark.ts --batch-size 100                    # Larger batches
  tsx run-massive-benchmark.ts --force-refresh                     # Ignore cache
  tsx run-massive-benchmark.ts --fixture-dir ./my-fixtures         # Custom fixture directory
      `);
      process.exit(0);
    }

    const config: MassiveBenchmarkConfig = {
      models: args.values.models,
      fixtureDir: args.values['fixture-dir'],
      forceRefresh: args.values['force-refresh'],
      clearCache: args.values['clear-cache'],
      batchSize: args.values['batch-size'] ? parseInt(args.values['batch-size']) : undefined,
    };

    const runner = new MassiveBenchmarkRunner();
    await runner.runMassiveBenchmark(config);
  } catch (error) {
    console.error('❌ Massive benchmark failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
