# Benchmark Package

Performance benchmarking and testing utilities for Promethean components.

## Overview

The `@promethean-os/benchmark` package provides comprehensive benchmarking capabilities:

- Performance measurement
- Load testing
- Comparative analysis
- Performance regression detection

## Features

- **Automated Testing**: Scheduled performance runs
- **Comparative Analysis**: Before/after comparisons
- **Load Testing**: Stress testing capabilities
- **Reporting**: Detailed performance reports

## Usage

```typescript
import { createBenchmarkSuite } from '@promethean-os/benchmark';

const benchmark = createBenchmarkSuite({
  name: 'API Performance',
  iterations: 1000,
  warmupIterations: 100,
});

// Add benchmark tests
benchmark.add('API Response Time', async () => {
  return await apiCall();
});

benchmark.add('Database Query', async () => {
  return await db.query('SELECT * FROM users');
});

// Run benchmarks
const results = await benchmark.run();
console.log(results.summary);
```

## Configuration

```typescript
interface BenchmarkConfig {
  name: string;
  iterations: number;
  warmupIterations: number;
  timeout: number;
  memoryTracking: boolean;
  cpuProfiling: boolean;
}
```

## Reports

Benchmark results include:

- **Timing**: Min, max, mean, median, percentiles
- **Memory**: Usage patterns and leaks
- **CPU**: Utilization during tests
- **Comparisons**: Historical performance data

## 📁 Implementation

### Core Files
- **benchmark-optimized.ts**: [src/benchmark-optimized.ts](../../../packages/benchmark/src/benchmark-optimized.ts) (535 lines)
- **benchmark.ts**: [src/benchmark.ts](../../../packages/benchmark/src/benchmark.ts) (211 lines)
- **cache/advanced-cache.ts**: [src/cache/advanced-cache.ts](../../../packages/benchmark/src/cache/advanced-cache.ts) (475 lines)
- **cli.ts**: [src/cli.ts](../../../packages/benchmark/src/cli.ts) (511 lines)
- **index.ts**: [src/index.ts](../../../packages/benchmark/src/index.ts) (11 lines)
- **load-testing/load-tester.ts**: [src/load-testing/load-tester.ts](../../../packages/benchmark/src/load-testing/load-tester.ts) (458 lines)
- **metrics/index.ts**: [src/metrics/index.ts](../../../packages/benchmark/src/metrics/index.ts) (179 lines)
- **metrics/performance-monitor.ts**: [src/metrics/performance-monitor.ts](../../../packages/benchmark/src/metrics/performance-monitor.ts) (339 lines)
- **metrics/resource-manager.ts**: [src/metrics/resource-manager.ts](../../../packages/benchmark/src/metrics/resource-manager.ts) (406 lines)
- **optimization/integration.ts**: [src/optimization/integration.ts](../../../packages/benchmark/src/optimization/integration.ts) (416 lines)
- **providers/base.ts**: [src/providers/base.ts](../../../packages/benchmark/src/providers/base.ts) (109 lines)
- **providers/buildfix-enhanced.ts**: [src/providers/buildfix-enhanced.ts](../../../packages/benchmark/src/providers/buildfix-enhanced.ts) (903 lines)
- **providers/buildfix.ts**: [src/providers/buildfix.ts](../../../packages/benchmark/src/providers/buildfix.ts) (1021 lines)
- **providers/index.ts**: [src/providers/index.ts](../../../packages/benchmark/src/providers/index.ts) (32 lines)
- **providers/ollama.ts**: [src/providers/ollama.ts](../../../packages/benchmark/src/providers/ollama.ts) (91 lines)
- **providers/openai.ts**: [src/providers/openai.ts](../../../packages/benchmark/src/providers/openai.ts) (90 lines)
- **providers/path-utils.ts**: [src/providers/path-utils.ts](../../../packages/benchmark/src/providers/path-utils.ts) (35 lines)
- **providers/vllm.ts**: [src/providers/vllm.ts](../../../packages/benchmark/src/providers/vllm.ts) (107 lines)
- **types/index.ts**: [src/types/index.ts](../../../packages/benchmark/src/types/index.ts) (97 lines)

### Key Classes & Functions
- **OptimizedBenchmarkRunner**: [OptimizedBenchmarkRunner](../../../packages/benchmark/src/benchmark-optimized.ts#L36) - Main class
- **BenchmarkRunner**: [BenchmarkRunner](../../../packages/benchmark/src/benchmark.ts#L13) - Main class
- **AdvancedCache**: [AdvancedCache](../../../packages/benchmark/src/cache/advanced-cache.ts#L41) - Main class
- **CacheFactory**: [CacheFactory](../../../packages/benchmark/src/cache/advanced-cache.ts#L382) - Main class
- **MultiLevelCache**: [MultiLevelCache](../../../packages/benchmark/src/cache/advanced-cache.ts#L404) - Main class
- **globalPerformanceMonitor()**: [globalPerformanceMonitor()](../../../packages/benchmark/src/metrics/performance-monitor.ts#L338) - Key function
- **createOptimizedBuildFixSystem()**: [createOptimizedBuildFixSystem()](../../../packages/benchmark/src/optimization/integration.ts#L340) - Key function
- **exampleUsage()**: [exampleUsage()](../../../packages/benchmark/src/optimization/integration.ts#L348) - Key function
- **createProvider()**: [createProvider()](../../../packages/benchmark/src/providers/index.ts#L14) - Key function
- **getSupportedProviders()**: [getSupportedProviders()](../../../packages/benchmark/src/providers/index.ts#L29) - Key function
- _... and 30 more_

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/benchmark/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/benchmark/src)




## 📚 API Reference

### Classes

#### OptimizedBenchmarkRunner
**Location**: [OptimizedBenchmarkRunner](../../../packages/benchmark/src/benchmark-optimized.ts#L36)

**Description**: Main class for optimizedbenchmarkrunner functionality.

**File**: `src/benchmark-optimized.ts`

#### BenchmarkRunner
**Location**: [BenchmarkRunner](../../../packages/benchmark/src/benchmark.ts#L13)

**Description**: Main class for benchmarkrunner functionality.

**File**: `src/benchmark.ts`

#### AdvancedCache
**Location**: [AdvancedCache](../../../packages/benchmark/src/cache/advanced-cache.ts#L41)

**Description**: Main class for advancedcache functionality.

**File**: `src/cache/advanced-cache.ts`

#### CacheFactory
**Location**: [CacheFactory](../../../packages/benchmark/src/cache/advanced-cache.ts#L382)

**Description**: Main class for cachefactory functionality.

**File**: `src/cache/advanced-cache.ts`

#### MultiLevelCache
**Location**: [MultiLevelCache](../../../packages/benchmark/src/cache/advanced-cache.ts#L404)

**Description**: Main class for multilevelcache functionality.

**File**: `src/cache/advanced-cache.ts`

#### BenchmarkCLI
**Location**: [BenchmarkCLI](../../../packages/benchmark/src/cli.ts#L25)

**Description**: Main class for benchmarkcli functionality.

**File**: `src/cli.ts`

#### LoadTester
**Location**: [LoadTester](../../../packages/benchmark/src/load-testing/load-tester.ts#L60)

**Description**: Main class for loadtester functionality.

**File**: `src/load-testing/load-tester.ts`

#### LoadTestReporter
**Location**: [LoadTestReporter](../../../packages/benchmark/src/load-testing/load-tester.ts#L356)

**Description**: Main class for loadtestreporter functionality.

**File**: `src/load-testing/load-tester.ts`

#### MetricsCalculator
**Location**: [MetricsCalculator](../../../packages/benchmark/src/metrics/index.ts#L3)

**Description**: Main class for metricscalculator functionality.

**File**: `src/metrics/index.ts`

#### PerformanceMonitor
**Location**: [PerformanceMonitor](../../../packages/benchmark/src/metrics/performance-monitor.ts#L38)

**Description**: Main class for performancemonitor functionality.

**File**: `src/metrics/performance-monitor.ts`

#### ResourceManager
**Location**: [ResourceManager](../../../packages/benchmark/src/metrics/resource-manager.ts#L30)

**Description**: Main class for resourcemanager functionality.

**File**: `src/metrics/resource-manager.ts`

#### GenericResourcePool
**Location**: [GenericResourcePool](../../../packages/benchmark/src/metrics/resource-manager.ts#L110)

**Description**: Main class for genericresourcepool functionality.

**File**: `src/metrics/resource-manager.ts`

#### ResourceMonitor
**Location**: [ResourceMonitor](../../../packages/benchmark/src/metrics/resource-manager.ts#L291)

**Description**: Main class for resourcemonitor functionality.

**File**: `src/metrics/resource-manager.ts`

#### MemoryManager
**Location**: [MemoryManager](../../../packages/benchmark/src/metrics/resource-manager.ts#L349)

**Description**: Main class for memorymanager functionality.

**File**: `src/metrics/resource-manager.ts`

#### OptimizedBuildFixSystem
**Location**: [OptimizedBuildFixSystem](../../../packages/benchmark/src/optimization/integration.ts#L45)

**Description**: Main class for optimizedbuildfixsystem functionality.

**File**: `src/optimization/integration.ts`

#### BaseProvider
**Location**: [BaseProvider](../../../packages/benchmark/src/providers/base.ts#L9)

**Description**: Main class for baseprovider functionality.

**File**: `src/providers/base.ts`

#### EnhancedBuildFixTimeoutError
**Location**: [EnhancedBuildFixTimeoutError](../../../packages/benchmark/src/providers/buildfix-enhanced.ts#L82)

**Description**: Main class for enhancedbuildfixtimeouterror functionality.

**File**: `src/providers/buildfix-enhanced.ts`

#### EnhancedBuildFixProcessError
**Location**: [EnhancedBuildFixProcessError](../../../packages/benchmark/src/providers/buildfix-enhanced.ts#L93)

**Description**: Main class for enhancedbuildfixprocesserror functionality.

**File**: `src/providers/buildfix-enhanced.ts`

#### EnhancedBuildFixCacheError
**Location**: [EnhancedBuildFixCacheError](../../../packages/benchmark/src/providers/buildfix-enhanced.ts#L105)

**Description**: Main class for enhancedbuildfixcacheerror functionality.

**File**: `src/providers/buildfix-enhanced.ts`

#### EnhancedBuildFixProvider
**Location**: [EnhancedBuildFixProvider](../../../packages/benchmark/src/providers/buildfix-enhanced.ts#L116)

**Description**: Main class for enhancedbuildfixprovider functionality.

**File**: `src/providers/buildfix-enhanced.ts`

#### BuildFixTimeoutError
**Location**: [BuildFixTimeoutError](../../../packages/benchmark/src/providers/buildfix.ts#L25)

**Description**: Main class for buildfixtimeouterror functionality.

**File**: `src/providers/buildfix.ts`

#### BuildFixProcessError
**Location**: [BuildFixProcessError](../../../packages/benchmark/src/providers/buildfix.ts#L35)

**Description**: Main class for buildfixprocesserror functionality.

**File**: `src/providers/buildfix.ts`

#### BuildFixResourceError
**Location**: [BuildFixResourceError](../../../packages/benchmark/src/providers/buildfix.ts#L46)

**Description**: Main class for buildfixresourceerror functionality.

**File**: `src/providers/buildfix.ts`

#### BuildFixProvider
**Location**: [BuildFixProvider](../../../packages/benchmark/src/providers/buildfix.ts#L128)

**Description**: Main class for buildfixprovider functionality.

**File**: `src/providers/buildfix.ts`

#### OllamaProvider
**Location**: [OllamaProvider](../../../packages/benchmark/src/providers/ollama.ts#L5)

**Description**: Main class for ollamaprovider functionality.

**File**: `src/providers/ollama.ts`

#### OpenAIProvider
**Location**: [OpenAIProvider](../../../packages/benchmark/src/providers/openai.ts#L5)

**Description**: Main class for openaiprovider functionality.

**File**: `src/providers/openai.ts`

#### VLLMProvider
**Location**: [VLLMProvider](../../../packages/benchmark/src/providers/vllm.ts#L4)

**Description**: Main class for vllmprovider functionality.

**File**: `src/providers/vllm.ts`

### Functions

#### globalPerformanceMonitor()
**Location**: [globalPerformanceMonitor()](../../../packages/benchmark/src/metrics/performance-monitor.ts#L338)

**Description**: Key function for globalperformancemonitor operations.

**File**: `src/metrics/performance-monitor.ts`

#### createOptimizedBuildFixSystem()
**Location**: [createOptimizedBuildFixSystem()](../../../packages/benchmark/src/optimization/integration.ts#L340)

**Description**: Key function for createoptimizedbuildfixsystem operations.

**File**: `src/optimization/integration.ts`

#### exampleUsage()
**Location**: [exampleUsage()](../../../packages/benchmark/src/optimization/integration.ts#L348)

**Description**: Key function for exampleusage operations.

**File**: `src/optimization/integration.ts`

#### createProvider()
**Location**: [createProvider()](../../../packages/benchmark/src/providers/index.ts#L14)

**Description**: Key function for createprovider operations.

**File**: `src/providers/index.ts`

#### getSupportedProviders()
**Location**: [getSupportedProviders()](../../../packages/benchmark/src/providers/index.ts#L29)

**Description**: Key function for getsupportedproviders operations.

**File**: `src/providers/index.ts`

#### findRepositoryRoot()
**Location**: [findRepositoryRoot()](../../../packages/benchmark/src/providers/path-utils.ts#L9)

**Description**: Key function for findrepositoryroot operations.

**File**: `src/providers/path-utils.ts`

#### getBuildFixDirectories()
**Location**: [getBuildFixDirectories()](../../../packages/benchmark/src/providers/path-utils.ts#L23)

**Description**: Key function for getbuildfixdirectories operations.

**File**: `src/providers/path-utils.ts`

#### ProviderTypeSchema()
**Location**: [ProviderTypeSchema()](../../../packages/benchmark/src/types/index.ts#L47)

**Description**: Key function for providertypeschema operations.

**File**: `src/types/index.ts`

### Interfaces

#### CacheEntry
**Location**: [CacheEntry](../../../packages/benchmark/src/cache/advanced-cache.ts#L7)

**Description**: Type definition for cacheentry.

**File**: `src/cache/advanced-cache.ts`

#### CacheStats
**Location**: [CacheStats](../../../packages/benchmark/src/cache/advanced-cache.ts#L18)

**Description**: Type definition for cachestats.

**File**: `src/cache/advanced-cache.ts`

#### CacheConfig
**Location**: [CacheConfig](../../../packages/benchmark/src/cache/advanced-cache.ts#L30)

**Description**: Type definition for cacheconfig.

**File**: `src/cache/advanced-cache.ts`

#### LoadTestConfig
**Location**: [LoadTestConfig](../../../packages/benchmark/src/load-testing/load-tester.ts#L6)

**Description**: Type definition for loadtestconfig.

**File**: `src/load-testing/load-tester.ts`

#### LoadTestRequest
**Location**: [LoadTestRequest](../../../packages/benchmark/src/load-testing/load-tester.ts#L15)

**Description**: Type definition for loadtestrequest.

**File**: `src/load-testing/load-tester.ts`

#### LoadTestResponse
**Location**: [LoadTestResponse](../../../packages/benchmark/src/load-testing/load-tester.ts#L22)

**Description**: Type definition for loadtestresponse.

**File**: `src/load-testing/load-tester.ts`

#### LoadTestMetrics
**Location**: [LoadTestMetrics](../../../packages/benchmark/src/load-testing/load-tester.ts#L34)

**Description**: Type definition for loadtestmetrics.

**File**: `src/load-testing/load-tester.ts`

#### UserSimulation
**Location**: [UserSimulation](../../../packages/benchmark/src/load-testing/load-tester.ts#L52)

**Description**: Type definition for usersimulation.

**File**: `src/load-testing/load-tester.ts`

#### PerformanceSnapshot
**Location**: [PerformanceSnapshot](../../../packages/benchmark/src/metrics/performance-monitor.ts#L6)

**Description**: Type definition for performancesnapshot.

**File**: `src/metrics/performance-monitor.ts`

#### PerformanceAlert
**Location**: [PerformanceAlert](../../../packages/benchmark/src/metrics/performance-monitor.ts#L29)

**Description**: Type definition for performancealert.

**File**: `src/metrics/performance-monitor.ts`

#### ResourcePool
**Location**: [ResourcePool](../../../packages/benchmark/src/metrics/resource-manager.ts#L4)

**Description**: Type definition for resourcepool.

**File**: `src/metrics/resource-manager.ts`

#### PoolStats
**Location**: [PoolStats](../../../packages/benchmark/src/metrics/resource-manager.ts#L11)

**Description**: Type definition for poolstats.

**File**: `src/metrics/resource-manager.ts`

#### ResourceConfig
**Location**: [ResourceConfig](../../../packages/benchmark/src/metrics/resource-manager.ts#L20)

**Description**: Type definition for resourceconfig.

**File**: `src/metrics/resource-manager.ts`

#### OptimizationConfig
**Location**: [OptimizationConfig](../../../packages/benchmark/src/optimization/integration.ts#L8)

**Description**: Type definition for optimizationconfig.

**File**: `src/optimization/integration.ts`

#### BenchmarkRequest
**Location**: [BenchmarkRequest](../../../packages/benchmark/src/types/index.ts#L3)

**Description**: Type definition for benchmarkrequest.

**File**: `src/types/index.ts`

#### BenchmarkResponse
**Location**: [BenchmarkResponse](../../../packages/benchmark/src/types/index.ts#L10)

**Description**: Type definition for benchmarkresponse.

**File**: `src/types/index.ts`

#### BenchmarkMetrics
**Location**: [BenchmarkMetrics](../../../packages/benchmark/src/types/index.ts#L17)

**Description**: Type definition for benchmarkmetrics.

**File**: `src/types/index.ts`

#### ResourceMetrics
**Location**: [ResourceMetrics](../../../packages/benchmark/src/types/index.ts#L26)

**Description**: Type definition for resourcemetrics.

**File**: `src/types/index.ts`

#### ProviderConfig
**Location**: [ProviderConfig](../../../packages/benchmark/src/types/index.ts#L38)

**Description**: Type definition for providerconfig.

**File**: `src/types/index.ts`

#### BenchmarkResult
**Location**: [BenchmarkResult](../../../packages/benchmark/src/types/index.ts#L62)

**Description**: Type definition for benchmarkresult.

**File**: `src/types/index.ts`

#### BenchmarkSuite
**Location**: [BenchmarkSuite](../../../packages/benchmark/src/types/index.ts#L73)

**Description**: Type definition for benchmarksuite.

**File**: `src/types/index.ts`

#### BenchmarkReport
**Location**: [BenchmarkReport](../../../packages/benchmark/src/types/index.ts#L81)

**Description**: Type definition for benchmarkreport.

**File**: `src/types/index.ts`




## Development Status

🚧 **Under Development** - Core benchmarking implemented, reporting in progress.

## Dependencies

- `@promethean-os/logger` - Benchmark logging
- `@promethean-os/monitoring` - Performance metrics
- `@promethean-os/reports` - Report generation

## Related Packages

- [[monitoring]] - System monitoring
- [[test-utils]] - Testing utilities
- [[reports]] - Report generation
