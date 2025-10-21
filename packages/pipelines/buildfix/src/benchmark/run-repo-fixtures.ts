#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { BuildFixBenchmark, models, type BenchmarkResult } from './index.js';

// Test first 3 models for efficiency
models.splice(3);

interface RepoFixture {
  name: string;
  description: string;
  originalPath: string;
  errorPattern: string[];
  files: string[];
}

async function loadRepoFixtures(fixturesDir: string): Promise<RepoFixture[]> {
  const fixtures: RepoFixture[] = [];

  try {
    const entries = await fs.readdir(fixturesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fixtureDir = path.join(fixturesDir, entry.name);
        const metadataPath = path.join(fixtureDir, 'metadata.json');

        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          fixtures.push({
            name: metadata.name,
            description: metadata.description,
            originalPath: metadata.originalPath,
            errorPattern: metadata.errorPattern || [],
            files: metadata.files || ['src.ts'],
          });
        } catch (error) {
          console.warn(`⚠️  Could not load metadata for ${entry.name}: ${error}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Could not load fixtures from ${fixturesDir}: ${error}`);
  }

  return fixtures;
}

async function runRepoBenchmark(): Promise<BenchmarkResult[]> {
  const fixturesDir = path.resolve('./repo-fixtures');
  const tempDir = path.resolve('./repo-benchmark-temp');
  const results: BenchmarkResult[] = [];

  // Load repo fixtures
  const repoFixtures = await loadRepoFixtures(fixturesDir);

  if (repoFixtures.length === 0) {
    console.log('❌ No repo fixtures found. Run the repo fixture generator first:');
    console.log('   pnpm tsx src/benchmark/repo-fixture-generator.ts');
    return [];
  }

  console.log(
    `🚀 Running repo benchmark with ${models.length} models and ${repoFixtures.length} fixtures...`,
  );
  console.log(`📁 Fixtures directory: ${fixturesDir}`);

  // Setup temp directory
  await fs.rm(tempDir, { recursive: true, force: true });
  await fs.mkdir(tempDir, { recursive: true });

  // Copy repo fixtures to temp directory for benchmarking
  const benchmarkFixturesDir = path.join(tempDir, 'fixtures');
  await fs.mkdir(benchmarkFixturesDir, { recursive: true });

  for (const fixture of repoFixtures) {
    const sourceDir = path.join(fixturesDir, fixture.name);
    const targetDir = path.join(benchmarkFixturesDir, fixture.name);

    // Copy fixture directory
    await fs.cp(sourceDir, targetDir, { recursive: true });

    // Inject errors into the fixture for testing
    const srcFile = path.join(targetDir, 'src.ts');
    try {
      const content = await fs.readFile(srcFile, 'utf8');

      // Add some common errors to test the buildfix system
      const modifiedContent = content
        // Add an undefined variable error
        .replace(
          /export const (\w+) =/,
          '// export const $1 = // Commented out to create error\nexport const undefinedVar = someUndefinedFunction();\n// export const $1 =',
        )
        // Add a missing export error
        .replace(/export function (\w+)/, 'function $1')
        // Add a type error
        .replace(/: string/g, ': wrongType');

      await fs.writeFile(srcFile, modifiedContent);
    } catch (error) {
      console.warn(`⚠️  Could not modify fixture ${fixture.name}: ${error}`);
    }
  }

  const benchmark = new BuildFixBenchmark(tempDir);

  // Convert repo fixtures to benchmark fixture format
  const benchmarkFixtures = repoFixtures.map((fixture) => ({
    name: fixture.name,
    description: fixture.description,
    files: { 'src.ts': 'modified content' }, // Will be read from disk
    expectedFixes: {},
    errorPattern: fixture.errorPattern,
  }));

  // Run model-by-model for efficiency
  for (let i = 0; i < models.length; i++) {
    const modelConfig = models[i];
    if (!modelConfig) {
      console.log(`  ⚠️  Model ${i + 1} is undefined, skipping...`);
      continue;
    }
    console.log(`\n🤖 Testing model ${i + 1}/${models.length}: ${modelConfig.name}`);
    console.log('==========================================');

    for (let j = 0; j < benchmarkFixtures.length; j++) {
      const fixture = benchmarkFixtures[j];
      if (!fixture) {
        console.log(`  ⚠️  Fixture ${j + 1} is undefined, skipping...`);
        continue;
      }
      console.log(`  📝 Testing fixture ${j + 1}/${benchmarkFixtures.length}: ${fixture.name}`);

      try {
        const result = await benchmark.runSingleBenchmark(fixture, modelConfig);
        results.push(result);

        const status = result.success ? '✅' : '❌';
        const errorsBefore = result.errorCountBefore;
        const errorsAfter = result.errorCountAfter;
        const resolved = result.errorsResolved ? 'RESOLVED' : 'NOT RESOLVED';

        console.log(`    ${status} ${errorsBefore}→${errorsAfter} errors (${resolved})`);
      } catch (error) {
        console.log(`    ❌ Error: ${error}`);
      }
    }
  }

  // Cleanup
  await benchmark.cleanup();

  return results;
}

async function main() {
  console.log('🔧 Running Repo Fixture Benchmark');
  console.log('================================');

  const results = await runRepoBenchmark();

  if (results.length === 0) {
    console.log('\n❌ No results generated');
    return;
  }

  // Print summary
  console.log('\n📊 Benchmark Results Summary');
  console.log('===========================');

  const resultsByModel = new Map<string, BenchmarkResult[]>();
  for (const result of results) {
    if (!resultsByModel.has(result.model)) {
      resultsByModel.set(result.model, []);
    }
    resultsByModel.get(result.model)!.push(result);
  }

  for (const [model, modelResultList] of resultsByModel.entries()) {
    const successCount = modelResultList.filter((r: BenchmarkResult) => r.success).length;
    const resolvedCount = modelResultList.filter((r: BenchmarkResult) => r.errorsResolved).length;
    const totalErrorsBefore = modelResultList.reduce(
      (sum: number, r: BenchmarkResult) => sum + r.errorCountBefore,
      0,
    );
    const totalErrorsAfter = modelResultList.reduce(
      (sum: number, r: BenchmarkResult) => sum + r.errorCountAfter,
      0,
    );
    const avgDuration =
      modelResultList.reduce((sum: number, r: BenchmarkResult) => sum + r.duration, 0) /
      modelResultList.length;

    console.log(`\n🤖 ${model}`);
    console.log(
      `   Success Rate: ${successCount}/${modelResultList.length} (${((successCount / modelResultList.length) * 100).toFixed(1)}%)`,
    );
    console.log(
      `   Error Resolution: ${resolvedCount}/${modelResultList.length} (${((resolvedCount / modelResultList.length) * 100).toFixed(1)}%)`,
    );
    console.log(`   Errors Fixed: ${totalErrorsBefore - totalErrorsAfter}/${totalErrorsBefore}`);
    console.log(`   Avg Duration: ${(avgDuration / 1000).toFixed(1)}s`);
  }

  console.log(`\n✅ Completed ${results.length} tests`);
}

if (process.argv[1]?.endsWith('run-repo-fixtures.ts')) {
  main().catch(console.error);
}
