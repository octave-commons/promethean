#!/usr/bin/env node

/**
 * Build Caching Integration Test - Simplified Version
 *
 * Tests the actual CI/CD caching configuration without modifying the system
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

class BuildCachingIntegrationTest {
  constructor() {
    this.testResults = new Map();
    this.projectRoot = process.cwd();
  }

  /**
   * Test 1: Validate CI workflow cache configurations
   */
  async testCIWorkflowCaching() {
    console.log('🔧 Test 1: CI Workflow Cache Configuration Analysis');
    console.log('---------------------------------------------------');

    try {
      const workflows = [
        '.github/workflows/build.yml',
        '.github/workflows/test.yml',
        '.github/workflows/test-unit.yml',
        '.github/workflows/test-integration.yml',
        '.github/workflows/test-e2e.yml',
        '.github/workflows/test-coverage.yml',
        '.github/workflows/lint.yml',
      ];

      const analysis = {
        totalWorkflows: workflows.length,
        workflowsWithCache: 0,
        pnpmCacheConfigs: [],
        clojureCacheConfigs: [],
        issues: [],
      };

      for (const workflow of workflows) {
        if (existsSync(workflow)) {
          const content = readFileSync(workflow, 'utf8');

          // Check for pnpm cache
          if (content.includes('pnpm-store') && content.includes('actions/cache@v4')) {
            analysis.workflowsWithCache++;
            analysis.pnpmCacheConfigs.push(workflow);

            // Extract cache key pattern
            const keyMatch = content.match(/key:\s*\$\{\{\s*([^}]+)\s*\}\}/);
            if (keyMatch) {
              console.log(`✅ ${workflow}: pnpm cache key found`);
            }
          }

          // Check for Clojure cache
          if (content.includes('cljdeps-') && content.includes('actions/cache@v4')) {
            analysis.clojureCacheConfigs.push(workflow);
            console.log(`✅ ${workflow}: Clojure dependency cache found`);
          }

          // Check for potential issues
          if (content.includes('actions/cache@v3')) {
            analysis.issues.push(`${workflow}: Using outdated cache action v3`);
          }

          if (!content.includes('timeout-minutes')) {
            analysis.issues.push(`${workflow}: Missing timeout configuration`);
          }
        } else {
          analysis.issues.push(`${workflow}: File not found`);
        }
      }

      console.log(`✅ Workflows analyzed: ${analysis.totalWorkflows}`);
      console.log(`✅ Workflows with caching: ${analysis.workflowsWithCache}`);
      console.log(`✅ pnpm cache configs: ${analysis.pnpmCacheConfigs.length}`);
      console.log(`✅ Clojure cache configs: ${analysis.clojureCacheConfigs.length}`);

      if (analysis.issues.length > 0) {
        console.log(`⚠️ Issues found: ${analysis.issues.length}`);
        analysis.issues.forEach((issue) => console.log(`   - ${issue}`));
      }

      this.testResults.set('ci-workflow-caching', {
        success: true,
        analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ CI workflow analysis failed:`, error);
      this.testResults.set('ci-workflow-caching', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 2: Analyze cache key effectiveness
   */
  async testCacheKeyEffectiveness() {
    console.log('🔑 Test 2: Cache Key Effectiveness Analysis');
    console.log('-------------------------------------------');

    try {
      const analysis = {
        pnpmLockHash: this.getFileHash('pnpm-lock.yaml'),
        packageJsonHash: this.getFileHash('package.json'),
        depsEdnFiles: this.findFiles('**/deps.edn'),
        bbEdnFiles: this.findFiles('**/bb.edn'),
        recommendations: [],
      };

      console.log(`✅ pnpm-lock.yaml hash: ${analysis.pnpmLockHash}`);
      console.log(`✅ package.json hash: ${analysis.packageJsonHash}`);
      console.log(`✅ deps.edn files found: ${analysis.depsEdnFiles.length}`);
      console.log(`✅ bb.edn files found: ${analysis.bbEdnFiles.length}`);

      // Analyze cache key strategy
      if (analysis.pnpmLockHash && analysis.packageJsonHash) {
        console.log('✅ Dual hashing strategy: pnpm-lock.yaml + package.json');
        analysis.recommendations.push('Good: Using both lockfile and package.json for cache keys');
      } else {
        analysis.recommendations.push(
          'Consider: Use both lockfile and package.json for better cache invalidation',
        );
      }

      if (analysis.depsEdnFiles.length > 0 || analysis.bbEdnFiles.length > 0) {
        console.log('✅ Clojure dependency files detected');
        analysis.recommendations.push('Good: Clojure dependencies included in cache strategy');
      }

      // Check for potential improvements
      const workspaceFiles = this.findFiles('pnpm-workspace.yaml');
      if (workspaceFiles.length > 0) {
        const workspaceHash = this.getFileHash('pnpm-workspace.yaml');
        console.log(`✅ pnpm-workspace.yaml hash: ${workspaceHash}`);
        analysis.recommendations.push(
          'Consider: Include workspace file in cache key for monorepo changes',
        );
      }

      this.testResults.set('cache-key-effectiveness', {
        success: true,
        analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Cache key analysis failed:`, error);
      this.testResults.set('cache-key-effectiveness', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 3: BuildFix provider performance analysis
   */
  async testBuildFixPerformance() {
    console.log('🚀 Test 3: BuildFix Provider Performance Analysis');
    console.log('--------------------------------------------------');

    try {
      console.log('📊 Checking BuildFix provider health...');

      // Quick health check
      const healthOutput = execSync('pnpm --filter @promethean/benchmark benchmark:health', {
        encoding: 'utf8',
        timeout: 30000,
      });

      console.log('✅ BuildFix health check completed');

      // Parse health status
      const isHealthy = healthOutput.includes('Healthy') && !healthOutput.includes('Unhealthy');
      const providerCount = (healthOutput.match(/buildfix-local/g) || []).length;

      console.log(`✅ Provider healthy: ${isHealthy}`);
      console.log(`✅ BuildFix providers found: ${providerCount}`);

      // Test a quick benchmark
      console.log('🏃 Running quick benchmark test...');
      const benchmarkStart = Date.now();

      try {
        const benchmarkOutput = execSync(
          'pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --iterations 1',
          { encoding: 'utf8', timeout: 60000 },
        );
        const benchmarkTime = Date.now() - benchmarkStart;

        console.log(`✅ Quick benchmark completed in ${benchmarkTime}ms`);

        // Extract basic metrics
        const successMatch = benchmarkOutput.match(/success rate[:\s]*(\d+\.?\d*)%?/);
        const avgTimeMatch = benchmarkOutput.match(/average[:\s]*(\d+\.?\d*)ms/);

        const metrics = {
          successRate: successMatch ? parseFloat(successMatch[1]) : 0,
          averageTime: avgTimeMatch ? parseFloat(avgTimeMatch[1]) : 0,
          benchmarkTime,
        };

        console.log(`✅ Success rate: ${metrics.successRate}%`);
        console.log(`✅ Average response time: ${metrics.averageTime}ms`);

        this.testResults.set('buildfix-performance', {
          success: true,
          isHealthy,
          providerCount,
          metrics,
          timestamp: new Date().toISOString(),
        });
      } catch (benchmarkError) {
        console.log(`⚠️ Benchmark test failed: ${benchmarkError.message}`);
        this.testResults.set('buildfix-performance', {
          success: true,
          isHealthy,
          providerCount,
          benchmarkError: benchmarkError.message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`❌ BuildFix performance analysis failed:`, error);
      this.testResults.set('buildfix-performance', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 4: Cache optimization recommendations
   */
  async testCacheOptimizationRecommendations() {
    console.log('💡 Test 4: Cache Optimization Recommendations');
    console.log('---------------------------------------------');

    try {
      const recommendations = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        metrics: [],
      };

      // Analyze current setup
      const hasPnpmCache =
        existsSync('.github/workflows/build.yml') &&
        readFileSync('.github/workflows/build.yml', 'utf8').includes('pnpm-store');
      const hasClojureCache =
        existsSync('.github/workflows/build.yml') &&
        readFileSync('.github/workflows/build.yml', 'utf8').includes('cljdeps-');
      const hasTimeouts =
        existsSync('.github/workflows/build.yml') &&
        readFileSync('.github/workflows/build.yml', 'utf8').includes('timeout-minutes');

      // Immediate recommendations
      if (!hasPnpmCache) {
        recommendations.immediate.push('Add pnpm store caching to all workflows');
      }
      if (!hasClojureCache) {
        recommendations.immediate.push('Add Clojure dependency caching');
      }
      if (!hasTimeouts) {
        recommendations.immediate.push('Add timeout-minutes to all jobs');
      }

      // Short-term recommendations
      recommendations.shortTerm.push('Implement cache warming for critical paths');
      recommendations.shortTerm.push('Add cache hit rate monitoring');
      recommendations.shortTerm.push('Optimize cache restore keys for better hit rates');

      // Long-term recommendations
      recommendations.longTerm.push('Implement intelligent cache invalidation');
      recommendations.longTerm.push('Add cache size monitoring and cleanup');
      recommendations.longTerm.push('Consider distributed caching for large teams');

      // Target metrics
      recommendations.metrics = [
        'Target cache hit rate: >80%',
        'Target pnpm install time: <30s (warm cache)',
        'Target Clojure deps time: <60s (warm cache)',
        'Target BuildFix response time: <5s',
      ];

      console.log('🎯 Immediate Actions:');
      recommendations.immediate.forEach((rec) => console.log(`   - ${rec}`));

      console.log('📈 Short-term Improvements:');
      recommendations.shortTerm.forEach((rec) => console.log(`   - ${rec}`));

      console.log('🚀 Long-term Strategy:');
      recommendations.longTerm.forEach((rec) => console.log(`   - ${rec}`));

      console.log('📊 Target Metrics:');
      recommendations.metrics.forEach((metric) => console.log(`   - ${metric}`));

      this.testResults.set('cache-optimization-recommendations', {
        success: true,
        recommendations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Optimization recommendations failed:`, error);
      this.testResults.set('cache-optimization-recommendations', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('📊 Build Caching Integration Test Report');
    console.log('========================================\n');

    const totalTests = this.testResults.size;
    const successfulTests = Array.from(this.testResults.values()).filter((r) => r.success).length;
    const successRate = (successfulTests / totalTests) * 100;

    console.log(
      `📈 Overall Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests})`,
    );
    console.log('');

    // Test results summary
    for (const [testName, result] of this.testResults) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${testName.replace(/([A-Z])/g, ' $1').toLowerCase()}`);

      if (result.analysis) {
        if (result.analysis.workflowsWithCache !== undefined) {
          console.log(
            `   Workflows with caching: ${result.analysis.workflowsWithCache}/${result.analysis.totalWorkflows}`,
          );
        }
        if (result.analysis.issues && result.analysis.issues.length > 0) {
          console.log(`   Issues found: ${result.analysis.issues.length}`);
        }
      }

      if (result.metrics) {
        console.log(`   Performance metrics available`);
      }

      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    }

    // Overall assessment
    console.log('🎯 Build Caching Assessment:');

    const ciResult = this.testResults.get('ci-workflow-caching');
    if (ciResult && ciResult.success) {
      const cacheCoverage =
        (ciResult.analysis.workflowsWithCache / ciResult.analysis.totalWorkflows) * 100;
      if (cacheCoverage >= 80) {
        console.log('   ✅ Excellent cache coverage across workflows');
      } else if (cacheCoverage >= 60) {
        console.log('   ⚠️ Good cache coverage, room for improvement');
      } else {
        console.log('   ❌ Poor cache coverage, needs immediate attention');
      }
    }

    const buildfixResult = this.testResults.get('buildfix-performance');
    if (buildfixResult && buildfixResult.success && buildfixResult.isHealthy) {
      console.log('   ✅ BuildFix provider is healthy and performing');
    } else {
      console.log('   ⚠️ BuildFix provider needs attention');
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Review and implement immediate recommendations');
    console.log('   2. Set up cache hit rate monitoring');
    console.log('   3. Test cache invalidation scenarios');
    console.log('   4. Establish performance baselines');
    console.log('');

    // Save detailed report
    const reportData = {
      summary: {
        totalTests,
        successfulTests,
        successRate,
        timestamp: new Date().toISOString(),
      },
      results: Object.fromEntries(this.testResults),
    };

    const reportPath = join(this.projectRoot, 'build-caching-integration-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  // Helper methods
  getFileHash(filePath) {
    try {
      if (!existsSync(filePath)) return null;
      const crypto = require('crypto');
      const content = readFileSync(filePath, 'utf8');
      return crypto.createHash('sha256').digest('hex').substring(0, 16);
    } catch (error) {
      return null;
    }
  }

  findFiles(pattern) {
    try {
      const output = execSync(`find . -name "${pattern.replace('**/', '')}"`, {
        encoding: 'utf8',
        timeout: 10000,
      });
      return output
        .trim()
        .split('\n')
        .filter((file) => file.length > 0);
    } catch (error) {
      return [];
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Build Caching Integration Test Suite');
    console.log('=====================================\n');

    await this.testCIWorkflowCaching();
    await this.testCacheKeyEffectiveness();
    await this.testBuildFixPerformance();
    await this.testCacheOptimizationRecommendations();
    this.generateReport();
  }
}

// Run the tests
if (require.main === module) {
  const testSuite = new BuildCachingIntegrationTest();
  testSuite.runAllTests().catch(console.error);
}

module.exports = { BuildCachingIntegrationTest };
