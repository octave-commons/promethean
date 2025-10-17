#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark, models, type BenchmarkResult } from './index.js';
import { createAllFixtures } from './fixture-template.js';

// Test first 3 models for efficiency comparison
models.splice(3);

async function runSimpleBenchmark(): Promise<BenchmarkResult[]> {
  const tempDir = path.resolve('./simple-benchmark-temp');
  const results: BenchmarkResult[] = [];

  // Setup temp directory
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  // Create fixtures using the template system
  const fixturesDir = path.join(tempDir, 'fixtures');
  const allFixtures = await createAllFixtures(fixturesDir);

  // Test only first 2 fixtures for debugging
  const simpleFixtures = allFixtures.slice(0, 2);

  console.log(
    `🚀 Running simple benchmark with ${models.length} models and ${simpleFixtures.length} fixtures each...`,
  );

  const benchmark = new BuildFixBenchmark(tempDir);

  // Run model-by-model for efficiency
  for (let i = 0; i < models.length; i++) {
    const modelConfig = models[i];
    if (!modelConfig) {
      console.log(`  ⚠️  Model ${i + 1} is undefined, skipping...`);
      continue;
    }
    console.log(`\n🤖 Testing model ${i + 1}/${models.length}: ${modelConfig.name}`);
    console.log('==========================================');

    for (let j = 0; j < simpleFixtures.length; j++) {
      const fixture = simpleFixtures[j];
      if (!fixture) {
        console.log(`  ⚠️  Fixture ${j + 1} is undefined, skipping...`);
        continue;
      }
      console.log(`  📝 Testing fixture ${j + 1}/${simpleFixtures.length}: ${fixture.name}`);

      try {
        const result = await benchmark.runSingleBenchmark(fixture, modelConfig);
        results.push(result);

        const status = result.success ? '✅' : '❌';
        const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
        const plan = result.planGenerated ? '📋' : '❌';
        const resolved = result.errorsResolved ? '🎯' : '❌';

        console.log(
          `    ${status} ${fixture.name}: ${errors} ${plan} ${resolved} (${result.duration}ms)`,
        );

        if (result.errorMessage) {
          console.log(`    💭 ${result.errorMessage}`);
        }

        // Bail early on first success or error unless --no-bail
        if (result.success || result.errorMessage) {
          if (!process.argv.includes('--no-bail')) {
            console.log(`\n🛑 Bailing early - ${result.success ? 'SUCCESS' : 'ERROR'}`);
            return results;
          }
        }
      } catch (error) {
        console.log(`    ❌ ${fixture.name}: Failed - ${error}`);

        if (!process.argv.includes('--no-bail')) {
          console.log(`\n🛑 Bailing early due to error`);
          return results;
        }

        results.push({
          fixture: fixture!.name,
          model: modelConfig.name,
          success: false,
          errorCountBefore: 0,
          errorCountAfter: 0,
          errorsResolved: false,
          planGenerated: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          duration: 0,
          attempts: 0,
        });
      }
    }
  }

  return results;
}

async function main() {
  try {
    console.log('🚀 Starting Simple BuildFix Benchmark');
    console.log('=====================================');

    const results = await runSimpleBenchmark();

    // Generate report
    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.success).length;
    const successRate = totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : '0.0';

    console.log('\n📊 Simple Benchmark Summary');
    console.log('============================');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Success rate: ${successRate}%`);

    // Save report
    const reportContent = `# Simple BuildFix Benchmark Report

## Summary
- Total tests: ${totalTests}
- Successful: ${successfulTests}
- Success rate: ${successRate}%

## Results
${results.map((r) => `- ${r.fixture} with ${r.model}: ${r.success ? '✅' : '❌'} ${r.errorMessage || ''}`).join('\n')}
`;

    await fs.writeFile('./simple-buildfix-benchmark-report.md', reportContent);
    console.log('📄 Report saved to ./simple-buildfix-benchmark-report.md');
  } catch (error) {
    console.error('Benchmark failed:', error);
  }
}

if (process.argv[1] === import.meta.url.replace('file://', '')) {
  main().catch(console.error);
}
