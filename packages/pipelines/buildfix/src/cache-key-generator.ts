/**
 * Build Cache Key Generator
 *
 * Generates specific, deterministic cache keys for build dependencies.
 * Addresses the issue where cache keys were too generic and didn't properly invalidate.
 */

export class BuildCacheKeyGenerator {
  /**
   * Generate a specific cache key for pnpm dependencies
   * Includes both lockfile and package.json hashes for proper invalidation
   */
  generatePnpmKey(lockfileHash: string, packageJsonHash: string): string {
    return `pnpm-deps-${lockfileHash}-${packageJsonHash}`;
  }

  /**
   * Generate a specific cache key for Clojure dependencies
   * Includes both deps.edn and bb.edn hashes for proper invalidation
   */
  generateClojureKey(depsEdnHash: string, bbEdnHash: string): string {
    return `clojure-deps-${depsEdnHash}-${bbEdnHash}`;
  }

  /**
   * Generate a cache key that includes workflow context
   * Ensures cache isolation between different workflows and jobs
   */
  generateWorkflowKey(workflowName: string, jobName: string, baseKey: string): string {
    return `${workflowName}-${jobName}-${baseKey}`;
  }

  /**
   * Generate a cache key for build artifacts
   * Includes source hash and build configuration
   */
  generateBuildArtifactKey(sourceHash: string, buildConfigHash: string): string {
    return `build-artifacts-${sourceHash}-${buildConfigHash}`;
  }

  /**
   * Generate a cache key for test results
   * Includes source hash and test configuration
   */
  generateTestResultsKey(sourceHash: string, testConfigHash: string): string {
    return `test-results-${sourceHash}-${testConfigHash}`;
  }

  /**
   * Generate a cache key for lint results
   * Includes source hash and lint configuration
   */
  generateLintResultsKey(sourceHash: string, lintConfigHash: string): string {
    return `lint-results-${sourceHash}-${lintConfigHash}`;
  }

  /**
   * Generate a cache key for coverage reports
   * Includes source hash and coverage configuration
   */
  generateCoverageKey(sourceHash: string, coverageConfigHash: string): string {
    return `coverage-${sourceHash}-${coverageConfigHash}`;
  }
}
