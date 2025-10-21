import * as path from 'path';
import { promises as fs } from 'fs';

import { requestPlan } from '../iter/plan.js';
import { materializeSnippet } from '../iter/dsl.js';
import { buildAndJudge } from '../iter/eval.js';
import { applySnippetToProject } from '../utils.js';
import { globalTimeoutManager } from '../timeout/timeout-manager.js';

import { createFixtures, fixtures } from './fixtures.js';
import type { Fixture } from './fixtures.js';

export type BenchmarkResult = {
  fixture: string;
  model: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  planTitle?: string;
  errorMessage?: string;
  duration: number;
  attempts: number;
};

export type ModelConfig = {
  name: string;
  model: string;
  options?: Record<string, unknown>;
};

export const models: ModelConfig[] = [
  { name: 'qwen3:8b', model: 'qwen3:8b' },
  { name: 'qwen3:14b', model: 'qwen3:14b' },
  { name: 'qwen2.5-coder:7b', model: 'qwen2.5-coder:7b' },
  { name: 'promethean-planner', model: 'promethean-planner:latest' },
  { name: 'qwen3:4b', model: 'qwen3:4b' },
  { name: 'llama3:8b', model: 'llama3:8b' },
];

export class BuildFixBenchmark {
  private tempDir: string;
  private fixturesDir: string;

  constructor(tempDir = './benchmark-temp') {
    this.tempDir = path.resolve(tempDir);
    this.fixturesDir = path.join(this.tempDir, 'fixtures');
  }

  async setup(): Promise<void> {
    await fs.rm(this.tempDir, { recursive: true, force: true });
    await fs.mkdir(this.tempDir, { recursive: true });
    await createFixtures(this.fixturesDir);
  }

  async cleanup(): Promise<void> {
    await fs.rm(this.tempDir, { recursive: true, force: true });
  }

  // eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity
  async runSingleBenchmark(
    fixture: Fixture,
    modelConfig: ModelConfig,
    maxAttempts = 3,
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const fixtureDir = path.join(this.fixturesDir, fixture.name);
    const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');

    // Backup original source files before making changes
    const originalFiles = new Map<string, string>();
    for (const filename of Object.keys(fixture.files)) {
      const filePath = path.join(fixtureDir, filename);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        originalFiles.set(filename, content);
      } catch {
        // File might not exist yet, that's ok
      }
    }

    const result: BenchmarkResult = {
      fixture: fixture.name,
      model: modelConfig.name,
      success: false,
      errorCountBefore: 0,
      errorCountAfter: 0,
      errorsResolved: false,
      planGenerated: false,
      duration: 0,
      attempts: 0,
    };

    try {
      // Get initial error count
      const { r: beforeBuild } = await buildAndJudge(tsconfigPath, '', { timeout: globalTimeoutManager.getTimeout('tsc') });
      result.errorCountBefore = beforeBuild.diags.length;

      if (result.errorCountBefore === 0) {
        result.errorMessage = 'No errors found in fixture';
        result.duration = Date.now() - startTime;
        return result;
      }

      // Try to fix with multiple attempts
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        result.attempts = attempt;

        // Create a mock error object for the first error
        const firstError = beforeBuild.diags[0];
        if (!firstError) {
          result.errorMessage = 'No error details found';
          result.duration = Date.now() - startTime;
          return result;
        }

        const mockError = {
          file: path.join(fixtureDir, 'src.ts'),
          line: firstError.line,
          col: firstError.col,
          code: firstError.code,
          message: firstError.message,
          frame: firstError.message || '',
          key: `${firstError.code}|${path.join(fixtureDir, 'src.ts')}|${firstError.line}`,
        };

        // Create mock history
        const mockHistory = {
          key: mockError.key,
          file: mockError.file,
          code: mockError.code,
          attempts: [],
        };

        try {
          // Generate plan
          const plan = await requestPlan(modelConfig.model, mockError, mockHistory);
          result.planGenerated = true;
          result.planTitle = plan.title;

          // Materialize and apply snippet
          const snippetPath = path.join(fixtureDir, `attempt-${attempt}.mjs`);
          await materializeSnippet(plan, snippetPath);
          await applySnippetToProject(tsconfigPath, snippetPath);

          // Check if fixed
          const { r: afterBuild, present } = await buildAndJudge(tsconfigPath, mockError.key, { timeout: globalTimeoutManager.getTimeout('tsc') });
          result.errorCountAfter = afterBuild.diags.length;
          result.errorsResolved = !present;

          if (result.errorsResolved) {
            result.success = true;
            break;
          }
        } catch (planError) {
          result.errorMessage = planError instanceof Error ? planError.message : String(planError);
          break;
        }
      }
    } catch (error) {
      result.errorMessage = error instanceof Error ? error.message : String(error);
    }

    result.duration = Date.now() - startTime;

    // Restore original files before returning
    for (const [filename, content] of originalFiles) {
      const filePath = path.join(fixtureDir, filename);
      await fs.writeFile(filePath, content, 'utf8');
    }

    return result;
  }

  // eslint-disable-next-line max-lines-per-function
  async runFullBenchmark(options: { order?: 'model-first' | 'fixture-first' } = {}): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    console.log(
      `Running benchmark with ${fixtures.length} fixtures and ${models.length} models...`,
    );

    const order = options.order ?? 'model-first';
    const runPair = async (fixture: Fixture, modelConfig: ModelConfig, indent = '  ') => {
      try {
        const result = await this.runSingleBenchmark(fixture, modelConfig);
        results.push(result);

        const status = result.success ? '✅' : '❌';
        const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
        console.log(`${indent}${status} ${fixture.name} @ ${modelConfig.name}: ${errors} (${result.duration}ms)`);

        if (result.planTitle) {
          console.log(`${indent}  Plan: ${result.planTitle}`);
        }
        if (result.errorMessage) {
          console.log(`${indent}  Error: ${result.errorMessage}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`${indent}❌ ${fixture.name} @ ${modelConfig.name}: Failed - ${message}`);

        results.push({
          fixture: fixture.name,
          model: modelConfig.name,
          success: false,
          errorCountBefore: 0,
          errorCountAfter: 0,
          errorsResolved: false,
          planGenerated: false,
          errorMessage: message,
          duration: 0,
          attempts: 0,
        });
      }
    };

    if (order === 'model-first') {
      for (const modelConfig of models) {
        console.log(`\nTesting model: ${modelConfig.name}`);
        for (const fixture of fixtures) {
          console.log(`  Fixture: ${fixture.name} - ${fixture.description}`);
          await runPair(fixture, modelConfig, '    ');
        }
      }
    } else {
      for (const fixture of fixtures) {
        console.log(`\nTesting fixture: ${fixture.name} - ${fixture.description}`);
        for (const modelConfig of models) {
          console.log(`  Testing model: ${modelConfig.name}...`);
          await runPair(fixture, modelConfig, '    ');
        }
      }
    }

    return results;
  }

  // eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity
  generateReport(results: BenchmarkResult[]): string {
    const report = [
      '# BuildFix Model Benchmark Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      '',
    ];

    // Model performance summary
    const modelStats = new Map<
      string,
      {
        total: number;
        successful: number;
        avgDuration: number;
        totalErrorsBefore: number;
        totalErrorsAfter: number;
      }
    >();

    for (const result of results) {
      if (!modelStats.has(result.model)) {
        modelStats.set(result.model, {
          total: 0,
          successful: 0,
          avgDuration: 0,
          totalErrorsBefore: 0,
          totalErrorsAfter: 0,
        });
      }

      const stats = modelStats.get(result.model)!;
      stats.total++;
      stats.totalErrorsBefore += result.errorCountBefore;
      stats.totalErrorsAfter += result.errorCountAfter;

      if (result.success) {
        stats.successful++;
      }
    }

    // Calculate averages and sort by success rate
    const sortedModels = Array.from(modelStats.entries())
      .map(([model, stats]) => ({
        model,
        ...stats,
        successRate: (stats.successful / stats.total) * 100,
        avgDuration:
          results.filter((r) => r.model === model).reduce((sum, r) => sum + r.duration, 0) /
          stats.total,
      }))
      .sort((a, b) => b.successRate - a.successRate);

    report.push('| Model | Success Rate | Avg Duration | Errors Fixed |');
    report.push('|-------|--------------|--------------|--------------|');

    for (const model of sortedModels) {
      const errorsFixed = model.totalErrorsBefore - model.totalErrorsAfter;
      report.push(
        `| ${model.model} | ${model.successRate.toFixed(1)}% | ${model.avgDuration.toFixed(0)}ms | ${errorsFixed} |`,
      );
    }

    // Detailed results
    report.push('', '## Detailed Results', '');
    report.push('| Fixture | Model | Success | Before→After | Plan | Duration | Attempts |');
    report.push('|---------|-------|---------|--------------|------|----------|----------|');

    for (const result of results) {
      const success = result.success ? '✅' : '❌';
      const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
      const plan = result.planGenerated ? '✅' : '❌';

      report.push(
        `| ${result.fixture} | ${result.model} | ${success} | ${errors} | ${plan} | ${result.duration}ms | ${result.attempts} |`,
      );
    }

    // Failure analysis
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      report.push('', '## Failure Analysis', '');

      const failuresByModel = new Map<string, typeof failures>();
      for (const failure of failures) {
        if (!failuresByModel.has(failure.model)) {
          failuresByModel.set(failure.model, []);
        }
        failuresByModel.get(failure.model)!.push(failure);
      }

      for (const [model, modelFailures] of failuresByModel) {
        report.push(`### ${model}`, '');
        for (const failure of modelFailures) {
          report.push(`- **${failure.fixture}**: ${failure.errorMessage || 'Unknown error'}`);
        }
        report.push('');
      }
    }

    return report.join('\n');
  }

  async saveReport(
    results: BenchmarkResult[],
    outputPath = './benchmark-report.md',
  ): Promise<void> {
    const report = this.generateReport(results);
    await fs.writeFile(outputPath, report, 'utf8');
    console.log(`\nBenchmark report saved to: ${outputPath}`);
  }
}

// CLI interface
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const benchmark = new BuildFixBenchmark();

  benchmark
    .setup()
    .then(() => benchmark.runFullBenchmark())
    .then((results) => benchmark.saveReport(results))
    .then(() => benchmark.cleanup())
    .catch(console.error);
}
