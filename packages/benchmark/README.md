# @promethean/benchmark

A comprehensive benchmarking tool for comparing AI model providers including local (Ollama, vLLM, OpenVINO) and cloud (OpenAI, Anthropic, Mistral) services.

## Features

- **Multi-Provider Support**: Compare Ollama, vLLM, OpenAI, and more
- **Comprehensive Metrics**: TPS, latency, effectiveness, resource usage
- **Resource Monitoring**: Memory, CPU, GPU, power consumption
- **CLI Interface**: Easy-to-use command-line tool
- **Programmatic API**: Use in your own applications

## Installation

```bash
pnpm add @promethean/benchmark
```

## Quick Start

### CLI Usage

```bash
# Check provider health
pnpm benchmark:health

# List available models
pnpm benchmark:list

# Compare providers
pnpm benchmark:compare --iterations 5

# Custom benchmark
pnpm benchmark --prompt "Write a fibonacci function" --compare
```

### Programmatic Usage

```typescript
import { BenchmarkRunner, ProviderConfig } from '@promethean/benchmark';

const runner = new BenchmarkRunner();

// Add providers
await runner.addProvider({
  name: 'ollama-local',
  type: 'ollama',
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen2.5-coder:7b-instruct',
});

await runner.addProvider({
  name: 'vllm-local',
  type: 'vllm',
  endpoint: 'http://localhost:8000',
  model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
});

// Run benchmark suite
const report = await runner.runBenchmarkSuite({
  name: 'Coding Comparison',
  requests: [
    { prompt: 'def fibonacci(n):', maxTokens: 200 },
    { prompt: 'Write a REST API in Express.js', maxTokens: 500 },
  ],
  providers: [], // Added above
  iterations: 3,
  warmupIterations: 1,
});

console.log(report.summary.rankings);
```

## Supported Providers

### Local Providers

- **Ollama**: Local model serving
- **vLLM**: High-performance inference with PagedAttention
- **OpenVINO**: Intel CPU/iGPU optimization (planned)

### Cloud Providers

- **OpenAI**: GPT models
- **Anthropic**: Claude models (planned)
- **Mistral**: Mistral AI models (planned)
- **OpenRouter**: Model routing service (planned)

## Metrics

### Performance Metrics

- **TPS** (Tokens Per Second): Generation speed
- **Latency**: Total response time
- **Time to First Token**: Initial response delay
- **Effectiveness**: Response quality scoring

### Resource Metrics

- **Memory Usage**: RAM consumption
- **CPU Usage**: Processor utilization
- **GPU Usage**: Graphics processor utilization
- **Power Consumption**: Energy usage (where available)

## Configuration

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=your_key_here

# Optional: Custom endpoints
VLLM_ENDPOINT=http://localhost:8000
OLLAMA_ENDPOINT=http://127.0.0.1:11434
```

### Provider Configuration

```typescript
const config: ProviderConfig = {
  name: 'my-provider',
  type: 'ollama', // 'vllm', 'openai', etc.
  endpoint: 'http://localhost:11434',
  model: 'qwen2.5-coder:7b-instruct',
  apiKey: 'optional-api-key',
  options: {
    // Provider-specific options
  },
};
```

## CLI Reference

```bash
# Basic commands
benchmark --list                    # List available models
benchmark --health                  # Check provider health
benchmark --compare                 # Compare all providers

# Options
--iterations N                      # Number of test iterations (default: 3)
--warmup N                         # Warmup iterations (default: 1)
--prompt "text"                    # Custom prompt
--providers provider1,provider2    # Specific providers to test
--models model1,model2             # Specific models to test

# Examples
benchmark --compare --iterations 10 --prompt "Explain quantum computing"
benchmark --providers ollama-local --models llama2
```

## API Reference

### BenchmarkRunner

Main class for running benchmarks.

```typescript
class BenchmarkRunner {
  async addProvider(config: ProviderConfig): Promise<void>;
  async removeProvider(name: string): Promise<void>;
  async runSingleBenchmark(
    providerName: string,
    request: BenchmarkRequest,
  ): Promise<BenchmarkResult>;
  async runBenchmarkSuite(suite: BenchmarkSuite): Promise<BenchmarkReport>;
  async listProviderModels(providerName: string): Promise<string[]>;
  async checkProviderHealth(providerName: string): Promise<boolean>;
  async checkAllProvidersHealth(): Promise<Record<string, boolean>>;
  getProviders(): BaseProvider[];
  async disconnectAll(): Promise<void>;
}
```

### Types

```typescript
interface BenchmarkRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

interface BenchmarkResult {
  provider: ProviderConfig;
  request: BenchmarkRequest;
  response: BenchmarkResponse;
  metrics: BenchmarkMetrics;
  resources: ResourceMetrics;
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface BenchmarkMetrics {
  tps: number; // tokens per second
  latency: number; // milliseconds
  timeToFirstToken: number;
  timeToCompletion: number;
  effectiveness?: number; // 0-1 score
  errorRate?: number;
}

interface ResourceMetrics {
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  gpuUsage?: number; // percentage
  gpuMemoryUsage?: number; // MB
  powerConsumption?: number; // watts
}
```

## Examples

### Comparing Local vs Cloud

```typescript
import { BenchmarkRunner } from '@promethean/benchmark';

const runner = new BenchmarkRunner();

// Add local Ollama
await runner.addProvider({
  name: 'local-ollama',
  type: 'ollama',
  model: 'qwen2.5-coder:7b-instruct',
});

// Add cloud OpenAI
await runner.addProvider({
  name: 'openai-gpt4',
  type: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
});

const report = await runner.runBenchmarkSuite({
  name: 'Local vs Cloud',
  requests: [{ prompt: 'Write a binary search algorithm', maxTokens: 300 }],
  providers: [], // Use added providers
  iterations: 5,
  warmupIterations: 2,
});

console.log('Winner:', report.summary.rankings[0].provider);
```

### Resource Usage Analysis

```typescript
const report = await runner.runBenchmarkSuite(suite);

// Analyze memory efficiency
const memoryUsage = report.summary.resourceUsage;
Object.entries(memoryUsage).forEach(([provider, resources]) => {
  console.log(`${provider}: ${resources.memoryUsage.toFixed(2)} MB average`);
});

// Find most efficient provider
const mostEfficient = report.summary.rankings
  .filter((r) => r.metrics.tps > 0)
  .sort(
    (a, b) => b.metrics.tps / b.resources.memoryUsage - a.metrics.tps / a.resources.memoryUsage,
  )[0];

console.log('Most efficient:', mostEfficient.provider);
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your provider or metrics
4. Include tests
5. Submit a pull request

## License

GPL-3 or later
