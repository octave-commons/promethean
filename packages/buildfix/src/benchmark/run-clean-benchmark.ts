#!/usr/bin/env node

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { BuildFix } from '../buildfix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BenchmarkResult {
  fixture: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  errorMessage?: string;
  duration: number;
  attempts: number;
}

async function runCleanBenchmark() {
  const fixturesDir = path.join(__dirname, '../../benchmark-fixtures');

  console.log('🚀 Running Clean BuildFix Benchmark');
  console.log('==================================');

  // Check if fixtures directory exists
  try {
    await fs.access(fixturesDir);
  } catch {
    console.log('❌ Fixtures directory not found. Run generate-simple-fixtures.ts first.');
    return;
  }

  // Get all fixture files
  const files = await fs.readdir(fixturesDir);
  const tsFiles = files.filter((f) => f.endsWith('.ts'));

  console.log(`📁 Found ${tsFiles.length} TypeScript fixture files\n`);

  const results: BenchmarkResult[] = [];
  const buildFix = new BuildFix();

  for (const file of tsFiles) {
    const filePath = path.join(fixturesDir, file);
    console.log(`🔧 Processing: ${file}`);

    const startTime = Date.now();

    try {
      // Read the fixture content
      const content = await fs.readFile(filePath, 'utf-8');

      // Run buildfix on the fixture
      const result = await buildFix.fixErrors(content, {
        filePath: file,
        maxAttempts: 3,
        timeout: 30000,
      });

      const duration = Date.now() - startTime;

      const benchmarkResult: BenchmarkResult = {
        fixture: file,
        success: result.success,
        errorCountBefore: result.errorCountBefore || 0,
        errorCountAfter: result.errorCountAfter || 0,
        errorsResolved: (result.errorCountAfter || 0) < (result.errorCountBefore || 0),
        planGenerated: !!result.plan,
        duration,
        attempts: result.attempts || 1,
      };

      if (result.success) {
        console.log(
          `  ✅ Success: ${benchmarkResult.errorCountBefore} → ${benchmarkResult.errorCountAfter} errors (${duration}ms)`,
        );
      } else {
        console.log(`  ❌ Failed: ${result.error || 'Unknown error'} (${duration}ms)`);
        benchmarkResult.errorMessage = result.error;
      }

      results.push(benchmarkResult);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.log(`  ❌ Exception: ${error.message} (${duration}ms)`);

      results.push({
        fixture: file,
        success: false,
        errorCountBefore: 0,
        errorCountAfter: 0,
        errorsResolved: false,
        planGenerated: false,
        errorMessage: error.message,
        duration,
        attempts: 1,
      });
    }

    console.log('');
  }

  // Generate summary report
  console.log('📊 Benchmark Results Summary');
  console.log('===========================');

  const totalFixtures = results.length;
  const successful = results.filter((r) => r.success).length;
  const errorsResolved = results.filter((r) => r.errorsResolved).length;
  const plansGenerated = results.filter((r) => r.planGenerated).length;

  console.log(`Total fixtures: ${totalFixtures}`);
  console.log(
    `Successful fixes: ${successful} (${((successful / totalFixtures) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Errors resolved: ${errorsResolved} (${((errorsResolved / totalFixtures) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Plans generated: ${plansGenerated} (${((plansGenerated / totalFixtures) * 100).toFixed(1)}%)`,
  );

  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalFixtures;
  console.log(`Average duration: ${avgDuration.toFixed(0)}ms`);

  // Show failed fixtures
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed fixtures:');
    failed.forEach((r) => {
      console.log(`  ${r.fixture}: ${r.errorMessage || 'Unknown error'}`);
    });
  }

  // Save detailed results
  const resultsPath = path.join(__dirname, '../../benchmark-results.json');
  await fs.writeFile(
    resultsPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalFixtures,
          successful,
          errorsResolved,
          plansGenerated,
          avgDuration,
        },
        results,
      },
      null,
      2,
    ),
  );

  console.log(`\n💾 Detailed results saved to: ${resultsPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCleanBenchmark().catch(console.error);
}
