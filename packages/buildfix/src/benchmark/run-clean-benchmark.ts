#!/usr/bin/env node

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { BuildFix } from '../buildfix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type BenchmarkResult = {
  fixture: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  errorMessage?: string;
  duration: number;
  attempts: number;
};

type FixSummary = {
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  attempts: number;
  plan?: unknown;
  error?: string;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function normalizeFixResult(raw: unknown): FixSummary {
  const base: FixSummary = {
    success: false,
    errorCountBefore: 0,
    errorCountAfter: 0,
    errorsResolved: false,
    planGenerated: false,
    attempts: 0,
  };
  if (typeof raw === 'object' && raw !== null) {
    const value = raw as Record<string, unknown>;
    return {
      success: typeof value.success === 'boolean' ? value.success : base.success,
      errorCountBefore:
        typeof value.errorCountBefore === 'number' ? value.errorCountBefore : base.errorCountBefore,
      errorCountAfter:
        typeof value.errorCountAfter === 'number' ? value.errorCountAfter : base.errorCountAfter,
      errorsResolved:
        typeof value.errorsResolved === 'boolean' ? value.errorsResolved : base.errorsResolved,
      planGenerated:
        typeof value.planGenerated === 'boolean' ? value.planGenerated : base.planGenerated,
      attempts: typeof value.attempts === 'number' ? value.attempts : base.attempts,
      plan: value.plan,
      error: typeof value.error === 'string' ? value.error : undefined,
    };
  }
  return base;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity, complexity
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
      const tsconfigCandidate = path.join(path.dirname(filePath), 'tsconfig.json');
      const planDir = path.join(
        __dirname,
        '../../.cache/clean-benchmark',
        path.basename(file, path.extname(file)),
      );
      const result = normalizeFixResult(
        await buildFix.fixErrors(content, {
          filePath,
          tsconfig: (await fileExists(tsconfigCandidate)) ? tsconfigCandidate : undefined,
          maxAttempts: 3,
          planDir,
        }),
      );

      const duration = Date.now() - startTime;

      const benchmarkResult: BenchmarkResult = {
        fixture: file,
        success: result.success,
        errorCountBefore: result.errorCountBefore || 0,
        errorCountAfter: result.errorCountAfter || 0,
        errorsResolved: (result.errorCountAfter || 0) < (result.errorCountBefore || 0),
        planGenerated: result.planGenerated || !!result.plan,
        duration,
        attempts: result.attempts || 1,
      };

      const outputResult: BenchmarkResult = result.success
        ? benchmarkResult
        : {
            ...benchmarkResult,
            errorMessage: typeof result.error === 'string' ? result.error : 'Unknown error',
          };
      if (result.success) {
        console.log(
          `  ✅ Success: ${benchmarkResult.errorCountBefore} → ${benchmarkResult.errorCountAfter} errors (${duration}ms)`,
        );
      } else {
        const errorMessage = outputResult.errorMessage ?? 'Unknown error';
        console.log(`  ❌ Failed: ${errorMessage} (${duration}ms)`);
      }

      results.push(outputResult);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : typeof error === 'number' || typeof error === 'boolean'
              ? String(error)
              : 'Unknown error';
      console.log(`  ❌ Exception: ${message} (${duration}ms)`);

      results.push({
        fixture: file,
        success: false,
        errorCountBefore: 0,
        errorCountAfter: 0,
        errorsResolved: false,
        planGenerated: false,
        errorMessage: message,
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
      const failureMessage =
        typeof r.errorMessage === 'string' && r.errorMessage.length > 0
          ? r.errorMessage
          : 'Unknown error';
      console.log(`  ${r.fixture}: ${failureMessage}`);
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
  runCleanBenchmark().catch((error: unknown) => {
    console.error(error);
  });
}
