# Benchmark Migration Guide

## Overview

This guide helps you migrate from the `@promethean/buildfix` benchmark system to the new dedicated `@promethean/benchmark` package. The migration provides better architecture, enhanced features, and broader use cases.

## 🎯 Migration Goals

### What We're Achieving

- **Separation of Concerns**: Benchmark functionality moved to dedicated package
- **Enhanced Architecture**: Multi-provider support with extensible design
- **Better Developer Experience**: Improved CLI and programmatic API
- **Broader Applicability**: General-purpose benchmarking beyond buildfix
- **Future-Proof Design**: Easier to add new providers and metrics

### Migration Benefits

| Feature          | BuildFix (Old)    | Benchmark (New)                     |
| ---------------- | ----------------- | ----------------------------------- |
| **Scope**        | BuildFix-specific | General-purpose                     |
| **Providers**    | Ollama only       | Ollama, vLLM, OpenAI, BuildFix      |
| **Metrics**      | Basic performance | Comprehensive + resource monitoring |
| **CLI**          | Multiple scripts  | Unified interface                   |
| **Architecture** | Monolithic        | Modular, extensible                 |
| **Testing**      | Fixture-based     | Multiple test types                 |

## 📋 Migration Checklist

### Phase 1: Assessment (Current)

- [ ] Review current benchmark usage in your projects
- [ ] Identify custom benchmark scripts
- [ ] Document specific requirements and metrics
- [ ] Test new benchmark package in parallel

### Phase 2: Migration (Next)

- [ ] Install `@promethean/benchmark` package
- [ ] Update package.json scripts
- [ ] Migrate custom benchmark configurations
- [ ] Update CI/CD pipelines
- [ ] Train team on new CLI

### Phase 3: Cleanup (Future)

- [ ] Remove deprecated buildfix benchmark scripts
- [ ] Archive old benchmark results
- [ ] Update documentation
- [ ] Monitor for any issues

## 🔄 Migration Examples

### CLI Commands

#### Before (BuildFix)

```bash
# Simple benchmark
cd packages/buildfix
pnpm tsx src/benchmark/run-simple.ts --no-bail

# Full benchmark
pnpm tsx src/benchmark/run.ts

# Model testing
pnpm tsx src/benchmark/test-models.ts
```

#### After (Benchmark)

```bash
# Health check
pnpm benchmark:health

# List models
pnpm benchmark:list

# Simple comparison
pnpm benchmark:compare --iterations 3

# Custom benchmark
pnpm benchmark --prompt "Write a fibonacci function" --compare
```

### Programmatic API

#### Before (BuildFix)

```typescript
import { BuildFixBenchmark, models } from '@promethean/buildfix/src/benchmark';

const benchmark = new BuildFixBenchmark();
const results = await benchmark.runFixtures({
  fixtures: simpleFixtures,
  models: models.slice(0, 2), // Limit models
  iterations: 3,
});
```

#### After (Benchmark)

```typescript
import { BenchmarkRunner } from '@promethean/benchmark';

const runner = new BenchmarkRunner();

// Add BuildFix provider
await runner.addProvider({
  name: 'buildfix-local',
  type: 'buildfix',
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen3:8b',
});

// Run benchmark
const report = await runner.runBenchmarkSuite({
  name: 'BuildFix Comparison',
  requests: [
    { prompt: 'Fix TypeScript error TS2304', maxTokens: 200 },
    { prompt: 'Add missing import statement', maxTokens: 150 },
  ],
  providers: [], // Use added providers
  iterations: 3,
});
```

### Configuration

#### Before (BuildFix)

```typescript
// src/benchmark/index.ts
export const models = [
  { name: 'qwen3:8b', type: 'ollama' },
  { name: 'qwen3:14b', type: 'ollama' },
  { name: 'gpt-oss:20b-cloud', type: 'ollama' },
];

export const simpleFixtures = [
  {
    name: 'missing-import',
    description: 'Missing import statement',
    files: {
      /* fixture files */
    },
    errors: [
      /* expected errors */
    ],
  },
];
```

#### After (Benchmark)

```typescript
// benchmark.config.js
export default {
  providers: [
    {
      name: 'ollama-local',
      type: 'ollama',
      endpoint: 'http://127.0.0.1:11434',
      model: 'qwen3:8b',
    },
    {
      name: 'buildfix-provider',
      type: 'buildfix',
      endpoint: 'http://127.0.0.1:11434',
      model: 'qwen3:8b',
    },
  ],
  suites: [
    {
      name: 'buildfix-tests',
      requests: [
        { prompt: 'Fix TypeScript error TS2304', maxTokens: 200 },
        { prompt: 'Add missing import statement', maxTokens: 150 },
      ],
    },
  ],
};
```

## 🏗️ Architecture Comparison

### BuildFix Benchmark (Old)

```
packages/buildfix/src/benchmark/
├── index.ts           # Main benchmark class
├── fixtures.ts        # Test fixtures
├── run-simple.ts      # Simple benchmark script
├── run.ts            # Full benchmark script
├── test-models.ts    # Model testing
└── report-analyzer.ts # Analysis tools
```

**Characteristics:**

- Monolithic design
- BuildFix-specific functionality
- Limited to Ollama providers
- Fixture-based testing only

### New Benchmark Package (New)

```
packages/benchmark/src/
├── benchmark.ts       # Core BenchmarkRunner
├── types/
│   └── index.ts      # Type definitions
├── providers/
│   ├── index.ts      # Provider registry
│   ├── base.ts       # Base provider class
│   ├── ollama.ts     # Ollama provider
│   ├── vllm.ts       # vLLM provider
│   ├── openai.ts     # OpenAI provider
│   └── buildfix.ts   # BuildFix provider
├── metrics/
│   ├── collector.ts  # Resource metrics
│   └── analyzer.ts   # Performance analysis
├── cli.ts            # CLI interface
└── utils/
    ├── reporting.ts  # Report generation
    └── validation.ts # Input validation
```

**Characteristics:**

- Modular, extensible design
- Multi-provider support
- Comprehensive metrics
- Multiple testing approaches

## 📊 Feature Mapping

### Core Features

| BuildFix Feature     | Benchmark Equivalent     | Notes                                |
| -------------------- | ------------------------ | ------------------------------------ |
| `BuildFixBenchmark`  | `BenchmarkRunner`        | Enhanced with multi-provider support |
| `models` array       | `ProviderConfig` objects | More flexible configuration          |
| `fixtures`           | `BenchmarkRequest` array | Broader request types                |
| `runFixtures()`      | `runBenchmarkSuite()`    | Improved reporting and metrics       |
| `test-models.ts`     | `benchmark:compare` CLI  | Unified interface                    |
| `report-analyzer.ts` | Built-in reporting       | Enhanced analysis capabilities       |

### Metrics Comparison

| Metric             | BuildFix | Benchmark | Improvement                     |
| ------------------ | -------- | --------- | ------------------------------- |
| **Success Rate**   | ✅       | ✅        | Same                            |
| **Duration**       | ✅       | ✅        | Enhanced with latency breakdown |
| **TPS**            | ❌       | ✅        | New tokens-per-second metric    |
| **Resource Usage** | ❌       | ✅        | Memory, CPU, GPU monitoring     |
| **Error Analysis** | ✅       | ✅        | Enhanced categorization         |
| **Trend Analysis** | ❌       | ✅        | Historical comparison           |

### Provider Support

| Provider      | BuildFix      | Benchmark | Status            |
| ------------- | ------------- | --------- | ----------------- |
| **Ollama**    | ✅            | ✅        | Enhanced          |
| **vLLM**      | ❌            | ✅        | New               |
| **OpenAI**    | ❌            | ✅        | New               |
| **BuildFix**  | ✅ (implicit) | ✅        | Explicit provider |
| **Anthropic** | ❌            | 🚧        | Planned           |
| **Mistral**   | ❌            | 🚧        | Planned           |

## 🛠️ Step-by-Step Migration

### Step 1: Install New Package

```bash
# Install the benchmark package
pnpm add @promethean/benchmark

# Or add to workspace
pnpm -w add @promethean/benchmark
```

### Step 2: Update Package Scripts

```json
{
  "scripts": {
    "benchmark:health": "benchmark --health",
    "benchmark:list": "benchmark --list",
    "benchmark:compare": "benchmark --compare --iterations 3",
    "benchmark:custom": "benchmark --prompt 'Write a fibonacci function' --compare"
  }
}
```

### Step 3: Migrate Configuration

Create a `benchmark.config.js`:

```javascript
export default {
  providers: [
    {
      name: 'ollama-local',
      type: 'ollama',
      endpoint: 'http://127.0.0.1:11434',
      model: 'qwen3:8b',
    },
  ],
  suites: [
    {
      name: 'buildfix-migration',
      requests: [
        { prompt: 'Fix TypeScript error TS2304: Cannot find name', maxTokens: 200 },
        { prompt: 'Add missing import for React component', maxTokens: 150 },
        { prompt: 'Fix type mismatch in function parameter', maxTokens: 180 },
      ],
    },
  ],
  defaults: {
    iterations: 3,
    warmupIterations: 1,
    timeout: 30000,
  },
};
```

### Step 4: Update Code

```typescript
// Old approach
import { BuildFixBenchmark } from '@promethean/buildfix/src/benchmark';

const benchmark = new BuildFixBenchmark();
const results = await benchmark.runFixtures({
  fixtures: myFixtures,
  models: myModels,
});

// New approach
import { BenchmarkRunner } from '@promethean/benchmark';

const runner = new BenchmarkRunner();
await runner.addProvider({
  name: 'buildfix-provider',
  type: 'buildfix',
  model: 'qwen3:8b',
});

const report = await runner.runBenchmarkSuite({
  name: 'My Benchmark',
  requests: myRequests,
  providers: [],
});
```

### Step 5: Update CI/CD

```yaml
# .github/workflows/benchmark.yml
name: Benchmark Tests

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run benchmark health check
        run: pnpm benchmark:health

      - name: Run benchmark comparison
        run: pnpm benchmark:compare --iterations 3

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-results/
```

## 🧪 Testing the Migration

### Parallel Testing

Run both systems in parallel to validate results:

```bash
# Terminal 1: Old system
cd packages/buildfix
pnpm tsx src/benchmark/run-simple.ts --no-bail

# Terminal 2: New system
cd packages/benchmark
pnpm benchmark:compare --iterations 3
```

### Validation Checklist

- [ ] Results are comparable between systems
- [ ] Performance metrics are consistent
- [ ] All required providers are working
- [ ] CLI commands function correctly
- [ ] Programmatic API works as expected
- [ ] Resource monitoring is functional
- [ ] Reports generate correctly

### Known Differences

1. **Metric Names**: Some metrics have different names but same meaning
2. **Report Format**: New system provides more detailed reports
3. **Provider Configuration**: More flexible but requires migration
4. **Error Handling**: Enhanced error reporting in new system

## 🚨 Common Migration Issues

### Issue 1: Provider Configuration

**Problem**: Old model array doesn't map directly to new provider config

**Solution**:

```typescript
// Old
const models = ['qwen3:8b', 'qwen3:14b'];

// New
const providers = [
  { name: 'qwen3-8b', type: 'ollama', model: 'qwen3:8b' },
  { name: 'qwen3-14b', type: 'ollama', model: 'qwen3:14b' },
];
```

### Issue 2: Fixture Migration

**Problem**: Fixtures don't directly map to requests

**Solution**:

```typescript
// Old fixture
{
  name: 'missing-import',
  files: { 'index.ts': 'React.useState(0);' },
  errors: [{ code: 'TS2304', message: 'Cannot find name React' }],
}

// New request
{
  prompt: 'Fix the error in this code: React.useState(0);',
  maxTokens: 200,
  metadata: {
    errorCode: 'TS2304',
    originalCode: 'React.useState(0);',
  },
}
```

### Issue 3: Missing Metrics

**Problem**: Some old metrics aren't available in new system

**Solution**: Use the enhanced metrics available:

```typescript
// Old
result.duration;
result.success;

// New (enhanced)
result.metrics.latency;
result.metrics.tps;
result.resources.memoryUsage;
result.resources.cpuUsage;
```

## 📚 Additional Resources

### Documentation

- [New Benchmark Package Documentation](../packages/benchmark/README.md)
- [BuildFix Package Documentation](../packages/buildfix/README.md)
- [API Reference](../packages/benchmark/docs/api.md)
- [CLI Reference](../packages/benchmark/docs/cli.md)

### Examples

- [Basic Usage Examples](../packages/benchmark/examples/basic/)
- [Provider Configuration](../packages/benchmark/examples/providers/)
- [Custom Metrics](../packages/benchmark/examples/metrics/)
- [CI/CD Integration](../packages/benchmark/examples/cicd/)

### Support

- **Issues**: [GitHub Issues](https://github.com/your-org/promethean/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/promethean/discussions)
- **Documentation**: [Docs Site](https://promethean.dev/docs)

## 🎉 Conclusion

The migration to `@promethean/benchmark` provides significant benefits:

1. **Better Architecture**: Modular, extensible design
2. **Enhanced Features**: Multi-provider support, resource monitoring
3. **Improved Developer Experience**: Unified CLI, better documentation
4. **Future-Proof**: Easy to add new providers and metrics

While the migration requires some upfront work, the long-term benefits make it worthwhile. Take advantage of the parallel testing period to ensure a smooth transition.

---

**Need Help?** If you encounter any issues during migration, please open an issue or start a discussion in the repository.
