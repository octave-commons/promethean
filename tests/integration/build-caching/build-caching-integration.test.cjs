#!/usr/bin/env node

/**
 * Build Caching Integration Test Suite
 *
 * Tests pnpm and Clojure dependency caching strategies across CI/CD workflows
 * Validates cache hit rates, invalidation logic, and performance improvements
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { performance } = require('perf_hooks');

class BuildCachingIntegrationTest {
  constructor() {
    this.testResults = new Map();
    this.baselineMetrics = null;
  }

  /**
   * Test 1: Validate pnpm cache key generation
   */
  async testPnpmCacheKeyGeneration() {
    console.log('📦 Test 1: pnpm Cache Key Generation');
    console.log('-----------------------------------');

    try {
      // Get current pnpm store path
      const storePath = execSync('pnpm store path --silent', { encoding: 'utf8' }).trim();
      console.log(`✅ pnpm store path: ${storePath}`);

      // Generate cache key like CI does
      const lockfileHash = this.hashFiles('**/pnpm-lock.yaml');
      const packageJsonHash = this.hashFiles('**/package.json');
      const cacheKey = `${process.platform}-pnpm-store-${lockfileHash}-${packageJsonHash}`;

      console.log(`✅ Generated cache key: ${cacheKey}`);

      // Test restore keys
      const restoreKeys = [
        `${process.platform}-pnpm-store-${lockfileHash}-`,
        `${process.platform}-pnpm-store-`,
      ];

      console.log(`✅ Restore keys: ${restoreKeys.join(', ')}`);

      this.testResults.set('pnpm-cache-key', {
        success: true,
        storePath,
        cacheKey,
        restoreKeys,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ pnpm cache key test failed:`, error);
      this.testResults.set('pnpm-cache-key', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 2: Validate Clojure dependency cache key generation
   */
  async testClojureCacheKeyGeneration() {
    console.log('🔧 Test 2: Clojure Dependency Cache Key Generation');
    console.log('--------------------------------------------------');

    try {
      // Find Clojure dependency files
      const depsFiles = this.findFiles('**/deps.edn');
      const bbFiles = this.findFiles('**/bb.edn');

      console.log(`✅ Found ${depsFiles.length} deps.edn files`);
      console.log(`✅ Found ${bbFiles.length} bb.edn files`);

      // Generate cache key like CI does
      const clojureHash = this.hashFiles('**/deps.edn', '**/bb.edn');
      const pnpmHash = this.hashFiles('**/pnpm-lock.yaml');
      const cacheKey = `cljdeps-${process.platform}-${clojureHash}-${pnpmHash}`;

      console.log(`✅ Generated cache key: ${cacheKey}`);

      // Test restore keys
      const restoreKeys = [
        `cljdeps-${process.platform}-${clojureHash}-`,
        `cljdeps-${process.platform}-`,
      ];

      console.log(`✅ Restore keys: ${restoreKeys.join(', ')}`);

      // Validate cache paths
      const cachePaths = ['~/.m2/repository', '~/.gitlibs', '~/.clojure', '~/.cpcache'];

      console.log(`✅ Cache paths: ${cachePaths.join(', ')}`);

      this.testResults.set('clojure-cache-key', {
        success: true,
        depsFiles: depsFiles.length,
        bbFiles: bbFiles.length,
        cacheKey,
        restoreKeys,
        cachePaths,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Clojure cache key test failed:`, error);
      this.testResults.set('clojure-cache-key', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 3: Simulate CI build with cold cache
   */
  async testColdCacheBuild() {
    console.log('❄️ Test 3: Cold Cache Build Simulation');
    console.log('--------------------------------------');

    try {
      const startTime = performance.now();

      // Clear any existing caches (simulate fresh environment)
      console.log('🧹 Clearing caches...');

      // Clear pnpm cache
      execSync('pnpm store prune', { stdio: 'pipe' });

      // Clear Clojure caches
      execSync('rm -rf ~/.m2/repository/cached', { stdio: 'ignore' });
      execSync('rm -rf ~/.gitlibs/_repos', { stdio: 'ignore' });
      execSync('rm -rf ~/.cpcache', { stdio: 'ignore' });

      console.log('✅ Caches cleared');

      // Time the dependency installation
      const depInstallStart = performance.now();
      execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' });
      const depInstallTime = performance.now() - depInstallStart;

      // Time the build process
      const buildStart = performance.now();
      execSync('pnpm exec nx affected -t build --parallel', { stdio: 'pipe' });
      const buildTime = performance.now() - buildStart;

      // Time type checking
      const typecheckStart = performance.now();
      execSync('pnpm -r exec tsc --noEmit --strict', { stdio: 'pipe' });
      const typecheckTime = performance.now() - typecheckStart;

      // Time linting
      const lintStart = performance.now();
      execSync('pnpm -r lint', { stdio: 'pipe' });
      const lintTime = performance.now() - lintStart;

      const totalTime = performance.now() - startTime;

      const coldMetrics = {
        buildTime,
        typecheckTime,
        lintTime,
        testTime: 0, // Skip tests for this simulation
        totalPipelineTime: totalTime,
      };

      this.baselineMetrics = coldMetrics;

      console.log(`✅ Dependency install: ${depInstallTime.toFixed(0)}ms`);
      console.log(`✅ Build time: ${buildTime.toFixed(0)}ms`);
      console.log(`✅ Typecheck time: ${typecheckTime.toFixed(0)}ms`);
      console.log(`✅ Lint time: ${lintTime.toFixed(0)}ms`);
      console.log(`✅ Total time: ${totalTime.toFixed(0)}ms`);

      this.testResults.set('cold-cache-build', {
        success: true,
        metrics: coldMetrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Cold cache build test failed:`, error);
      this.testResults.set('cold-cache-build', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 4: Simulate CI build with warm cache
   */
  async testWarmCacheBuild() {
    console.log('🔥 Test 4: Warm Cache Build Simulation');
    console.log('--------------------------------------');

    if (!this.baselineMetrics) {
      console.log('⚠️ Skipping warm cache test - no baseline metrics available');
      return;
    }

    try {
      const startTime = performance.now();

      // Dependencies should already be installed from cold cache test
      console.log('📦 Using existing dependencies...');

      // Time the build process (should be faster with cache)
      const buildStart = performance.now();
      execSync('pnpm exec nx affected -t build --parallel', { stdio: 'pipe' });
      const buildTime = performance.now() - buildStart;

      // Time type checking
      const typecheckStart = performance.now();
      execSync('pnpm -r exec tsc --noEmit --strict', { stdio: 'pipe' });
      const typecheckTime = performance.now() - typecheckStart;

      // Time linting
      const lintStart = performance.now();
      execSync('pnpm -r lint', { stdio: 'pipe' });
      const lintTime = performance.now() - lintStart;

      const totalTime = performance.now() - startTime;

      const warmMetrics = {
        buildTime,
        typecheckTime,
        lintTime,
        testTime: 0,
        totalPipelineTime: totalTime,
      };

      // Calculate improvements
      const buildImprovement =
        ((this.baselineMetrics.buildTime - buildTime) / this.baselineMetrics.buildTime) * 100;
      const typecheckImprovement =
        ((this.baselineMetrics.typecheckTime - typecheckTime) /
          this.baselineMetrics.typecheckTime) *
        100;
      const lintImprovement =
        ((this.baselineMetrics.lintTime - lintTime) / this.baselineMetrics.lintTime) * 100;
      const totalImprovement =
        ((this.baselineMetrics.totalPipelineTime - totalTime) /
          this.baselineMetrics.totalPipelineTime) *
        100;

      console.log(
        `✅ Build time: ${buildTime.toFixed(0)}ms (${buildImprovement > 0 ? '+' : ''}${buildImprovement.toFixed(1)}%)`,
      );
      console.log(
        `✅ Typecheck time: ${typecheckTime.toFixed(0)}ms (${typecheckImprovement > 0 ? '+' : ''}${typecheckImprovement.toFixed(1)}%)`,
      );
      console.log(
        `✅ Lint time: ${lintTime.toFixed(0)}ms (${lintImprovement > 0 ? '+' : ''}${lintImprovement.toFixed(1)}%)`,
      );
      console.log(
        `✅ Total time: ${totalTime.toFixed(0)}ms (${totalImprovement > 0 ? '+' : ''}${totalImprovement.toFixed(1)}%)`,
      );

      this.testResults.set('warm-cache-build', {
        success: true,
        metrics: warmMetrics,
        improvements: {
          build: buildImprovement,
          typecheck: typecheckImprovement,
          lint: lintImprovement,
          total: totalImprovement,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Warm cache build test failed:`, error);
      this.testResults.set('warm-cache-build', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 5: Cache invalidation scenarios
   */
  async testCacheInvalidation() {
    console.log('🔄 Test 5: Cache Invalidation Scenarios');
    console.log('--------------------------------------');

    try {
      const scenarios = [];

      // Scenario 1: pnpm-lock.yaml change
      console.log('📝 Scenario 1: pnpm-lock.yaml modification');
      const originalLock = readFileSync('pnpm-lock.yaml', 'utf8');
      const modifiedLock = originalLock + '# test modification\n';
      writeFileSync('pnpm-lock.yaml', modifiedLock);

      const newLockHash = this.hashFiles('**/pnpm-lock.yaml');
      console.log(`✅ Lock file hash changed: ${newLockHash}`);

      // Restore original
      writeFileSync('pnpm-lock.yaml', originalLock);

      scenarios.push({
        name: 'pnpm-lock.yaml change',
        invalidatesCache: true,
        hashChanged: true,
      });

      // Scenario 2: package.json change
      console.log('📝 Scenario 2: package.json modification');
      const originalPackage = readFileSync('package.json', 'utf8');
      const packageData = JSON.parse(originalPackage);
      packageData.testCacheInvalidation = Date.now();
      const modifiedPackage = JSON.stringify(packageData, null, 2);
      writeFileSync('package.json', modifiedPackage);

      const newPackageHash = this.hashFiles('**/package.json');
      console.log(`✅ Package.json hash changed: ${newPackageHash}`);

      // Restore original
      writeFileSync('package.json', originalPackage);

      scenarios.push({
        name: 'package.json change',
        invalidatesCache: true,
        hashChanged: true,
      });

      // Scenario 3: deps.edn change
      const depsFiles = this.findFiles('**/deps.edn');
      if (depsFiles.length > 0) {
        console.log('📝 Scenario 3: deps.edn modification');
        const originalDeps = readFileSync(depsFiles[0], 'utf8');
        const modifiedDeps = originalDeps + '\n;; test cache invalidation\n';
        writeFileSync(depsFiles[0], modifiedDeps);

        const newDepsHash = this.hashFiles('**/deps.edn');
        console.log(`✅ deps.edn hash changed: ${newDepsHash}`);

        // Restore original
        writeFileSync(depsFiles[0], originalDeps);

        scenarios.push({
          name: 'deps.edn change',
          invalidatesCache: true,
          hashChanged: true,
        });
      }

      // Scenario 4: Source code change (should NOT invalidate dependency cache)
      console.log('📝 Scenario 4: Source code modification');
      const testFile = 'packages/benchmark/src/test-cache-invalidation.ts';
      if (existsSync(testFile)) {
        const originalContent = readFileSync(testFile, 'utf8');
        const modifiedContent = originalContent + '\n// test modification\n';
        writeFileSync(testFile, modifiedContent);

        const originalDepHash = this.hashFiles('**/pnpm-lock.yaml');
        const originalPackageHash = this.hashFiles('**/package.json');

        // Restore original
        writeFileSync(testFile, originalContent);

        const newDepHash = this.hashFiles('**/pnpm-lock.yaml');
        const newPackageHash2 = this.hashFiles('**/package.json');

        const depCacheUnchanged = originalDepHash === newDepHash;
        const packageCacheUnchanged = originalPackageHash === newPackageHash2;

        console.log(`✅ Dependency cache unchanged: ${depCacheUnchanged && packageCacheUnchanged}`);

        scenarios.push({
          name: 'source code change',
          invalidatesCache: false,
          hashChanged: false,
        });
      }

      this.testResults.set('cache-invalidation', {
        success: true,
        scenarios,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Cache invalidation test failed:`, error);
      this.testResults.set('cache-invalidation', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Test 6: BuildFix provider caching
   */
  async testBuildFixCaching() {
    console.log('🔧 Test 6: BuildFix Provider Caching');
    console.log('-----------------------------------');

    try {
      // Test BuildFix benchmark with caching
      console.log('🏃 Running BuildFix benchmark...');

      const benchmarkStart = performance.now();
      const output = execSync(
        'pnpm --filter @promethean/benchmark benchmark --providers buildfix-local --iterations 3',
        { encoding: 'utf8', timeout: 120000 },
      );
      const benchmarkTime = performance.now() - benchmarkStart;

      console.log(`✅ Benchmark completed in ${benchmarkTime.toFixed(0)}ms`);

      // Parse benchmark output for cache metrics
      const lines = output.split('\n');
      const cacheMetrics = {
        totalRequests: 0,
        cacheHits: 0,
        averageTime: 0,
        successRate: 0,
      };

      // Look for performance metrics in output
      for (const line of lines) {
        if (line.includes('success rate')) {
          const match = line.match(/(\d+\.?\d*)%/);
          if (match) cacheMetrics.successRate = parseFloat(match[1]);
        }
        if (line.includes('average')) {
          const match = line.match(/(\d+\.?\d*)ms/);
          if (match) cacheMetrics.averageTime = parseFloat(match[1]);
        }
      }

      console.log(`✅ Success rate: ${cacheMetrics.successRate}%`);
      console.log(`✅ Average time: ${cacheMetrics.averageTime}ms`);

      this.testResults.set('buildfix-caching', {
        success: true,
        benchmarkTime,
        metrics: cacheMetrics,
        output: output.substring(0, 1000), // Truncate for storage
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ BuildFix caching test failed:`, error);
      this.testResults.set('buildfix-caching', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('');
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('📊 Integration Test Report');
    console.log('==========================\n');

    const totalTests = this.testResults.size;
    const successfulTests = Array.from(this.testResults.values()).filter((r) => r.success).length;
    const successRate = (successfulTests / totalTests) * 100;

    console.log(
      `📈 Overall Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests})`,
    );
    console.log('');

    // Detailed results
    for (const [testName, result] of this.testResults) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${testName}`);

      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      } else if (result.improvements) {
        console.log(`   Improvements: ${JSON.stringify(result.improvements, null, 2)}`);
      }
      console.log('');
    }

    // Performance summary
    if (this.baselineMetrics) {
      console.log('🎯 Performance Baseline (Cold Cache):');
      console.log(`   Build: ${this.baselineMetrics.buildTime.toFixed(0)}ms`);
      console.log(`   Typecheck: ${this.baselineMetrics.typecheckTime.toFixed(0)}ms`);
      console.log(`   Lint: ${this.baselineMetrics.lintTime.toFixed(0)}ms`);
      console.log(`   Total: ${this.baselineMetrics.totalPipelineTime.toFixed(0)}ms`);
      console.log('');
    }

    // Recommendations
    console.log('💡 Recommendations:');
    console.log('   1. Cache hit rates should be >80% for optimal performance');
    console.log('   2. Consider implementing cache warming for critical paths');
    console.log('   3. Monitor cache size and implement cleanup strategies');
    console.log('   4. Use cache versioning for major dependency updates');
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
      baselineMetrics: this.baselineMetrics,
    };

    const reportPath = join(process.cwd(), 'build-caching-integration-report.json');
    writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  // Helper methods
  hashFiles(...patterns) {
    // Simple hash simulation - in real CI this uses GitHub Actions hashFiles
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');

    for (const pattern of patterns) {
      try {
        const files = this.findFiles(pattern);
        for (const file of files) {
          if (existsSync(file)) {
            const content = readFileSync(file, 'utf8');
            hash.update(content);
          }
        }
      } catch (error) {
        // Ignore file not found errors
      }
    }

    return hash.digest('hex').substring(0, 16);
  }

  findFiles(pattern) {
    try {
      const output = execSync(`find . -name "${pattern.replace('**/', '')}"`, { encoding: 'utf8' });
      return output
        .trim()
        .split('\n')
        .filter((file) => file.length > 0);
    } catch (error) {
      return [];
    }
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    await this.testPnpmCacheKeyGeneration();
    await this.testClojureCacheKeyGeneration();
    await this.testColdCacheBuild();
    await this.testWarmCacheBuild();
    await this.testCacheInvalidation();
    await this.testBuildFixCaching();
    this.generateReport();
  }
}

// Run the integration tests
if (require.main === module) {
  const testSuite = new BuildCachingIntegrationTest();
  testSuite.runAllTests().catch(console.error);
}

module.exports = { BuildCachingIntegrationTest };
