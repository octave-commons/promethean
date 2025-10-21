import { BuildFixBenchmark, models } from './index.js';

async function testLargeModels() {
  const benchmark = new BuildFixBenchmark('./benchmark-temp');

  try {
    console.log('🚀 Testing Large Cloud Models for BuildFix');
    console.log('==========================================');

    await benchmark.setup();

    // Test all fixtures with the large models
    const { fixtures } = await import('./fixtures.js');

    const results = [];

    for (const fixture of fixtures) {
      console.log(`\n📝 Testing fixture: ${fixture.name} - ${fixture.description}`);

      for (const modelConfig of models) {
        console.log(`  🤖 Testing model: ${modelConfig.name}...`);

        try {
          const result = await benchmark.runSingleBenchmark(fixture, modelConfig, 2);
          results.push(result);

          const status = result.success ? '✅' : '❌';
          const errors = `${result.errorCountBefore}→${result.errorCountAfter}`;
          const plan = result.planGenerated ? '📋' : '❌';
          const resolved = result.errorsResolved ? '🎯' : '❌';

          console.log(
            `    ${status} ${modelConfig.name}: ${errors} ${plan} ${resolved} (${result.duration}ms)`,
          );

          if (result.planTitle) {
            console.log(`      Plan: ${result.planTitle}`);
          }

          if (result.errorMessage) {
            console.log(`      Error: ${result.errorMessage}`);
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

    // Generate comprehensive summary
    console.log('\n📊 Large Model Performance Summary');
    console.log('===================================');

    const successful = results.filter((r) => r.success).length;
    const total = results.length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log(`Overall success rate: ${successRate}% (${successful}/${total})`);

    // By model performance
    const modelStats = new Map<
      string,
      {
        successful: number;
        total: number;
        avgDuration: number;
        errorsFixed: number;
        plansGenerated: number;
      }
    >();

    for (const result of results) {
      if (!modelStats.has(result.model)) {
        modelStats.set(result.model, {
          successful: 0,
          total: 0,
          avgDuration: 0,
          errorsFixed: 0,
          plansGenerated: 0,
        });
      }
      const stats = modelStats.get(result.model)!;
      stats.total++;
      stats.errorsFixed += result.errorCountBefore - result.errorCountAfter;
      if (result.success) stats.successful++;
      if (result.planGenerated) stats.plansGenerated++;
    }

    // Calculate averages and sort by success rate
    const sortedModels = Array.from(modelStats.entries())
      .map(([model, stats]) => {
        const modelResults = results.filter((r) => r.model === model);
        const avgDuration = modelResults.reduce((sum, r) => sum + r.duration, 0) / stats.total;
        return {
          model,
          ...stats,
          successRate: (stats.successful / stats.total) * 100,
          planRate: (stats.plansGenerated / stats.total) * 100,
          avgDuration,
        };
      })
      .sort((a, b) => b.successRate - a.successRate);

    console.log('\nModel Rankings (by success rate):');
    console.log('==================================');

    for (let i = 0; i < sortedModels.length; i++) {
      const model = sortedModels[i];
      console.log(`${i + 1}. ${model.model}`);
      console.log(
        `   Success Rate: ${model.successRate.toFixed(1)}% (${model.successful}/${model.total})`,
      );
      console.log(`   Plan Generation: ${model.planRate.toFixed(1)}%`);
      console.log(`   Errors Fixed: ${model.errorsFixed}`);
      console.log(`   Avg Duration: ${model.avgDuration.toFixed(0)}ms`);
      console.log('');
    }

    // Find best performing model
    const bestModel = sortedModels[0];
    if (bestModel && bestModel.successRate > 0) {
      console.log(`🏆 RECOMMENDED MODEL: ${bestModel.model}`);
      console.log(`   Success Rate: ${bestModel.successRate.toFixed(1)}%`);
      console.log(`   Plan Generation: ${bestModel.planRate.toFixed(1)}%`);
      console.log(`   Avg Duration: ${bestModel.avgDuration.toFixed(0)}ms`);
    } else {
      console.log(
        '⚠️  No model achieved successful fixes. Consider prompt engineering or fallback strategies.',
      );
    }

    // Save detailed report
    await benchmark.saveReport(results, './large-models-benchmark-report.md');

    return {
      results,
      bestModel: sortedModels[0] || null,
      summary: {
        totalTests: total,
        successful,
        successRate: parseFloat(successRate),
      },
    };
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    return null;
  } finally {
    await benchmark.cleanup();
  }
}

// Run the test
testLargeModels()
  .then((result) => {
    if (result) {
      console.log('\n✅ Large model testing completed successfully!');
      if (result.bestModel) {
        console.log(`🎯 Ready to update pipeline with: ${result.bestModel.model}`);
      }
    }
  })
  .catch(console.error);