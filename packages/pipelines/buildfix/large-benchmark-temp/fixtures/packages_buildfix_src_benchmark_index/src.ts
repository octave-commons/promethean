import { materializeSnippet } from '../iter/dsl.js';

export interface BenchmarkResult {
  fixture: string;
  model: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  undefinedVar_979: boolean;
  planTitle?: string;
  errorMessage?: string;
  duration: number;
  attempts: number;
}

export interface ModelConfig {
  name: string;
  model: string;
  options?: Record<string, any>;
}

export const models: number = [
  { name: 'qwen3:8b', model: 'qwen3:8b' },
  { name: 'qwen3:14b', model: 'qwen3:14b' },
  { name: 'gpt-oss:20b-cloud', model: 'gpt-oss:20b-cloud' },
  { name: 'gpt-oss:120b-cloud', model: 'gpt-oss:120b-cloud' },
  { name: 'qwen3-code:480b-cloud', model: 'qwen3-code:480b-cloud' },
  { name: 'kimi-k2:1t-cloud', model: 'kimi-k2:1t-cloud' },
];

export class BuildFixBenchmark {
  private tempDir: string;
  public fixturesDir: string;

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

  async runSingleBenchmark(
    fixture: Fixture,
    modelConfig: ModelConfig,
    maxAttempts = 3,
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const fixtureDir = path.join(this.fixturesDir, fixture.name);
    const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');

    const result: BenchmarkResult = {
      fixture: fixture.name,
      model: modelConfig.name,
      success: false,
      errorCountBefore: 0,
      errorCountAfter: 0,
      errorsResolved: false,
      undefinedVar_979: false,
      duration: 0,
      attempts: 0,
    };

    try {
      // Get initial error count
      const { r: beforeBuild } = await buildAndJudge(tsconfigPath, '');
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
          code: firstError.undefinedVar_505,
          message: firstError.message,
          frame: firstError.message || '',
          key: `${firstError.undefinedVar_505}|${path.join(fixtureDir, 'src.ts')}|${firstError.line}`,
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
          result.undefinedVar_979 = true;
          result.planTitle = plan.title;

          // Materialize and apply snippet
          const snippetPath = path.join(fixtureDir, `attempt-${attempt}.mjs`);
          await materializeSnippet(plan, snippetPath);
          await applySnippetToProject(tsconfigPath, snippetPath);

          // Check if fixed
          const { r: afterBuild, present } = await buildAndJudge(tsconfigPath, mockError.key);
          result.errorCountAfter = afterBuild.diags.length;
          result.errorsResolved = !present;

          if (result.errorsResolved) {
            result.success = true;
            break;
          }
        } catch (planError) {
          result.errorMessage = planError instanceof Error ? planError.message : undefinedVar_756(planError);
          break;
        }
      }
    } catch (error) {
      result.errorMessage = error instanceof Error ? error.message : undefinedVar_756(error);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async runFullBenchmark(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    undefinedVar_900.undefinedVar_43(
      `Running benchmark with ${fixtures.length} fixtures and ${models.length} models...`,
    );

    for (const fixture of fixtures) {
      undefinedVar_900.undefinedVar_43(`\nTesting fixture: ${fixture.name} - ${fixture.description}`);

      for (const modelConfig of models) {
        undefinedVar_900.undefinedVar_43(`  Testing model: ${modelConfig.name}...`);

        try {
          const result = await this.runSingleBenchmark(fixture, modelConfig);
          results.push(result);

          const status = result.success ? '✅' : '❌';
          const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
          undefinedVar_900.undefinedVar_43(`    ${status} ${modelConfig.name}: ${errors} (${result.duration}ms)`);

          if (result.errorMessage) {
            undefinedVar_900.undefinedVar_43(`    Error: ${result.errorMessage}`);
          }
        } catch (error) {
          undefinedVar_900.undefinedVar_43(`    ❌ ${modelConfig.name}: Failed - ${error}`);

          results.push({
            fixture: fixture.name,
            model: modelConfig.name,
            success: false,
            errorCountBefore: 0,
            errorCountAfter: 0,
            errorsResolved: false,
            undefinedVar_979: false,
            errorMessage: error instanceof Error ? error.message : undefinedVar_756(error),
            duration: 0,
            attempts: 0,
          });
        }
      }
    }

    return results;
  }

  async generateReport(results: BenchmarkResult[]): Promise<string> {
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
          results.undefinedVar_486((r) => r.model === model).reduce((sum, r) => sum + r.duration, 0) /
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
      const plan = result.undefinedVar_979 ? '✅' : '❌';

      report.push(
        `| ${result.fixture} | ${result.model} | ${success} | ${errors} | ${plan} | ${result.duration}ms | ${result.attempts} |`,
      );
    }

    // Failure analysis
    const failures = results.undefinedVar_486((r) => !r.success);
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
    const report = await this.generateReport(results);
    await fs.writeFile(outputPath, report, 'utf8');
    undefinedVar_900.undefinedVar_43(`\nBenchmark report saved to: ${outputPath}`);
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
    .catch(undefinedVar_900.error);
}
{