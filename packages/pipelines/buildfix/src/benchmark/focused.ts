import { BuildFixBenchmark } from './index.js';

async function focusedBenchmark() {
  const benchmark = new BuildFixBenchmark('./benchmark-temp');

  try {
    console.log('🎯 Focused Benchmark: Testing DSL-based fixes');
    console.log('================================================');

    await benchmark.setup();

    // Test just 2 fixtures and 3 models that are most likely to work
    const { fixtures } = await import('./fixtures.js');
    const testFixtures = fixtures.slice(0, 2); // First 2 fixtures

    const testModels = [
      { name: 'qwen3:4b', model: 'qwen3:4b' },
      { name: 'qwen2.5-coder:7b', model: 'qwen2.5-coder:7b' },
      { name: 'llama3.1', model: 'llama3.1' },
    ];

    const results = [];

    for (const fixture of testFixtures) {
      console.log(`\nTesting fixture: ${fixture.name} - ${fixture.description}`);

      for (const modelConfig of testModels) {
        console.log(`  Testing model: ${modelConfig.name}...`);

        try {
          const result = await benchmark.runSingleBenchmark(fixture, modelConfig, 2);
          results.push(result);

          const status = result.success ? '✅' : '❌';
          const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
          const plan = result.planGenerated ? '📋' : '❌';
          console.log(
            `    ${status} ${modelConfig.name}: ${errors} ${plan} (${result.duration}ms)`,
          );

          if (result.errorMessage) {
            console.log(`    Error: ${result.errorMessage}`);
          }
        } catch (error) {
          console.log(`    ❌ ${modelConfig.name}: Failed - ${error}`);

          results.push({
            fixture: fixture.name,
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

    // Generate summary
    console.log('\n📊 Summary');
    console.log('==========');

    const successful = results.filter((r) => r.success).length;
    const total = results.length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log(`Overall success rate: ${successRate}% (${successful}/${total})`);

    // By model
    const modelStats = new Map<string, { successful: number; total: number }>();
    for (const result of results) {
      if (!modelStats.has(result.model)) {
        modelStats.set(result.model, { successful: 0, total: 0 });
      }
      const stats = modelStats.get(result.model)!;
      stats.total++;
      if (result.success) stats.successful++;
    }

    for (const [model, stats] of modelStats) {
      const rate = ((stats.successful / stats.total) * 100).toFixed(1);
      console.log(`${model}: ${rate}% (${stats.successful}/${stats.total})`);
    }

    // Save detailed report
    await benchmark.saveReport(results, './focused-benchmark-report.md');
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
  } finally {
    await benchmark.cleanup();
  }
}

focusedBenchmark();
