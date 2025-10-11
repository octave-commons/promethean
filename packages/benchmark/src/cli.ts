#!/usr/bin/env node

import { BenchmarkRunner } from './benchmark.js';
import { ProviderConfig, BenchmarkSuite, BenchmarkRequest } from './types/index.js';
import { createProvider } from './providers/index.js';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CLIOptions {
  providers?: string[];
  models?: string[];
  iterations?: number;
  warmup?: number;
  prompt?: string;
  list?: boolean;
  health?: boolean;
  compare?: boolean;
  report?: string;
  allModels?: boolean;
}

class BenchmarkCLI {
  private runner = new BenchmarkRunner();

  async run(options: CLIOptions): Promise<void> {
    try {
      if (options.list) {
        await this.listModels();
        return;
      }

      if (options.health) {
        await this.checkHealth();
        return;
      }

      if (options.compare) {
        await this.compareProviders(options);
        return;
      }

      if (options.allModels) {
        await this.benchmarkAllModels(options);
        return;
      }

      // Default: run single benchmark
      await this.runSingleBenchmark(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  }

  private async listModels(): Promise<void> {
    console.log(chalk.blue('Available models by provider:'));

    const providers = this.getDefaultProviders();
    const table = new Table({
      head: ['Provider', 'Models'],
      colWidths: [20, 50],
    });

    for (const config of providers) {
      try {
        const provider = createProvider(config);
        await provider.connect();
        const models = await (provider as any).listModels();

        if (models.length > 0) {
          for (const model of models) {
            table.push([config.name, model]);
          }
        } else {
          table.push([config.name, chalk.yellow('No models found')]);
        }

        await provider.disconnect();
      } catch (error) {
        table.push([config.name, chalk.red('Connection failed')]);
      }
    }

    console.log(table.toString());
  }

  private async checkHealth(): Promise<void> {
    console.log(chalk.blue('Checking provider health...'));

    const providers = this.getDefaultProviders();
    const table = new Table({
      head: ['Provider', 'Status', 'Model'],
      colWidths: [20, 15, 30],
    });

    for (const config of providers) {
      try {
        const provider = createProvider(config);
        const isHealthy = await provider.isHealthy();
        const status = isHealthy ? chalk.green('Healthy') : chalk.red('Unhealthy');
        table.push([config.name, status, config.model]);
        await provider.disconnect();
      } catch (error) {
        table.push([config.name, chalk.red('Error'), config.model]);
      }
    }

    console.log(table.toString());
  }

  private async compareProviders(options: CLIOptions): Promise<void> {
    const spinner = ora('Running comparison benchmark...').start();

    try {
      let providers = this.getDefaultProviders();

      // Filter providers if specified
      if (options.providers && options.providers.length > 0) {
        providers = providers.filter((p) => options.providers!.includes(p.name));
      }

      const prompt = options.prompt || 'Write a Python function to calculate fibonacci numbers';

      const suite: BenchmarkSuite = {
        name: 'Provider Comparison',
        requests: [
          {
            prompt,
            maxTokens: 500,
            temperature: 0.7,
          },
        ],
        providers,
        iterations: options.iterations || 3,
        warmupIterations: options.warmup || 1,
      };

      const report = await this.runner.runBenchmarkSuite(suite);
      spinner.stop();

      this.displayComparisonReport(report);

      // Write report to file if requested
      if (options.report) {
        this.writeReport(report, options.report);
      }
    } catch (error) {
      spinner.stop();
      throw error;
    }
  }

  private async benchmarkAllModels(options: CLIOptions): Promise<void> {
    const spinner = ora('Discovering available models...').start();

    try {
      // Get all available models from Ollama
      const ollamaProvider = createProvider({
        name: 'ollama-local',
        type: 'ollama',
        endpoint: 'http://127.0.0.1:11434',
        model: 'temp',
      });

      await ollamaProvider.connect();
      const models = await (ollamaProvider as any).listModels();
      await ollamaProvider.disconnect();

      spinner.succeed(`Found ${models.length} models`);

      const results: any[] = [];
      const prompt = options.prompt || 'Write a Python function to calculate fibonacci numbers';

      // Benchmark each model
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const modelSpinner = ora(`Benchmarking ${model} (${i + 1}/${models.length})`).start();

        try {
          const providerConfig = {
            name: 'ollama-local',
            type: 'ollama' as const,
            endpoint: 'http://127.0.0.1:11434',
            model,
          };

          await this.runner.addProvider(providerConfig);

          const request: BenchmarkRequest = {
            prompt,
            maxTokens: 500,
            temperature: 0.7,
          };

          const result = await this.runner.runSingleBenchmark('ollama-local', request);
          results.push(result);

          modelSpinner.succeed(
            `${model}: ${result.metrics.tps.toFixed(1)} TPS, ${result.metrics.latency}ms`,
          );

          await this.runner.removeProvider('ollama-local');
        } catch (error) {
          modelSpinner.fail(
            `${model}: Failed - ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      // Generate summary report
      const report = this.generateAllModelsReport(results, models);

      // Display results
      this.displayAllModelsReport(report);

      // Write report to file
      const filename = options.report || 'ollama-all-models';
      this.writeReport(report, filename);
    } catch (error) {
      spinner.fail('Failed to benchmark models');
      throw error;
    }
  }

  private generateAllModelsReport(results: any[], models: string[]): any {
    const successful = results.filter((r) => r.success);
    const failed = results.length - successful.length;

    const rankings = successful
      .map((r) => ({
        model: r.provider.model,
        tps: r.metrics.tps,
        latency: r.metrics.latency,
        effectiveness: r.metrics.effectiveness || 0,
        memory: r.resources.memoryUsage,
      }))
      .sort((a, b) => b.tps - a.tps);

    return {
      metadata: {
        totalModels: models.length,
        successful: successful.length,
        failed,
        timestamp: new Date().toISOString(),
      },
      results,
      rankings,
      summary: {
        averageTPS: successful.reduce((sum, r) => sum + r.metrics.tps, 0) / successful.length,
        averageLatency:
          successful.reduce((sum, r) => sum + r.metrics.latency, 0) / successful.length,
        averageMemory:
          successful.reduce((sum, r) => sum + r.resources.memoryUsage, 0) / successful.length,
      },
    };
  }

  private displayAllModelsReport(report: any): void {
    console.log(chalk.blue('\n🏆 All Models Benchmark Results'));
    console.log(chalk.gray(`Generated: ${new Date().toLocaleString()}`));
    console.log(
      chalk.gray(`Models: ${report.metadata.successful}/${report.metadata.totalModels} successful`),
    );

    // Rankings table
    const rankingsTable = new Table({
      head: ['Rank', 'Model', 'TPS', 'Latency', 'Memory (MB)'],
      colWidths: [6, 30, 10, 12, 15],
    });

    report.rankings.forEach((ranking: any, index: number) => {
      rankingsTable.push([
        (index + 1).toString(),
        ranking.model,
        ranking.tps.toFixed(1),
        `${ranking.latency}ms`,
        ranking.memory.toFixed(1),
      ]);
    });

    console.log(chalk.blue('\n📊 Performance Rankings:'));
    console.log(rankingsTable.toString());

    console.log(chalk.blue('\n📈 Summary:'));
    console.log(`Average TPS: ${report.summary.averageTPS.toFixed(1)}`);
    console.log(`Average Latency: ${report.summary.averageLatency.toFixed(0)}ms`);
    console.log(`Average Memory: ${report.summary.averageMemory.toFixed(1)}MB`);
  }

  private async runSingleBenchmark(options: CLIOptions): Promise<void> {
    let providers = this.getDefaultProviders();

    // Filter providers if specified
    if (options.providers && options.providers.length > 0) {
      providers = providers.filter((p) => options.providers!.includes(p.name));
    }

    const prompt = options.prompt || 'Hello, how are you?';

    for (const config of providers) {
      const spinner = ora(`Testing ${config.name}...`).start();

      try {
        await this.runner.addProvider(config);
        const request: BenchmarkRequest = {
          prompt,
          maxTokens: 100,
        };

        const result = await this.runner.runSingleBenchmark(config.name, request);
        spinner.stop();

        console.log(chalk.green(`\n${config.name} Results:`));
        console.log(`  Content: ${result.response.content.substring(0, 100)}...`);
        console.log(`  Tokens: ${result.response.tokens}`);
        console.log(`  TPS: ${result.metrics.tps.toFixed(2)}`);
        console.log(`  Latency: ${result.metrics.latency}ms`);
        console.log(`  Memory: ${result.resources.memoryUsage.toFixed(2)}MB`);
      } catch (error) {
        spinner.stop();
        console.log(chalk.red(`${config.name} failed:`, error));
      }
    }
  }

  private displayComparisonReport(report: any): void {
    console.log(chalk.blue.bold('\n🏆 Benchmark Comparison Results'));
    console.log(chalk.gray(`Generated: ${report.generatedAt.toLocaleString()}`));

    // Rankings table
    const rankingsTable = new Table({
      head: ['Rank', 'Provider', 'Score', 'TPS', 'Latency', 'Effectiveness'],
      colWidths: [6, 20, 10, 10, 12, 15],
    });

    report.summary.rankings.forEach((ranking: any, index: number) => {
      rankingsTable.push([
        index + 1,
        ranking.provider,
        ranking.score.toFixed(3),
        ranking.metrics.tps.toFixed(1),
        `${ranking.metrics.latency}ms`,
        (ranking.metrics.effectiveness || 0).toFixed(3),
      ]);
    });

    console.log(chalk.blue('\n📊 Provider Rankings:'));
    console.log(rankingsTable.toString());

    // Resource usage table
    const resourceTable = new Table({
      head: ['Provider', 'Memory (MB)', 'CPU (%)', 'GPU (%)', 'Power (W)'],
      colWidths: [20, 15, 12, 12, 12],
    });

    Object.entries(report.summary.resourceUsage).forEach(([provider, resources]: [string, any]) => {
      resourceTable.push([
        provider,
        resources.memoryUsage.toFixed(2),
        resources.cpuUsage.toFixed(1),
        (resources.gpuUsage || 0).toFixed(1),
        resources.powerConsumption || 'N/A',
      ]);
    });

    console.log(chalk.blue('\n💻 Resource Usage:'));
    console.log(resourceTable.toString());

    console.log(chalk.green(`\n✅ Success Rate: ${report.summary.successRate.toFixed(1)}%`));
    console.log(chalk.gray(`Total Tests: ${report.summary.totalTests}`));
  }

  private getDefaultProviders(): ProviderConfig[] {
    return [
      {
        name: 'ollama-local',
        type: 'ollama',
        endpoint: 'http://127.0.0.1:11434',
        model: 'qwen2.5-coder:7b-instruct',
      },
      {
        name: 'vllm-local',
        type: 'vllm',
        endpoint: 'http://localhost:8000',
        model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
      },
    ];
  }

  private writeReport(report: any, filename: string): void {
    try {
      const reportsDir = join(process.cwd(), 'docs', 'reports');
      mkdirSync(reportsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = join(reportsDir, `${filename}-${timestamp}.json`);

      const reportData = {
        metadata: {
          generated: new Date().toISOString(),
          totalTests: report.summary.totalTests,
          successRate: report.summary.successRate,
        },
        results: report.results,
        summary: report.summary,
      };

      writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      console.log(chalk.green(`\n📄 Report written to: ${reportPath}`));
    } catch (error) {
      console.error(chalk.red(`Failed to write report: ${error}`));
    }
  }

  async cleanup(): Promise<void> {
    await this.runner.disconnectAll();
  }
}

// CLI argument parsing
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--list':
        options.list = true;
        break;
      case '--health':
        options.health = true;
        break;
      case '--compare':
        options.compare = true;
        break;
      case '--iterations':
        const iterArg = args[++i];
        options.iterations = iterArg ? parseInt(iterArg) : 3;
        break;
      case '--warmup':
        const warmupArg = args[++i];
        options.warmup = warmupArg ? parseInt(warmupArg) : 1;
        break;
      case '--prompt':
        options.prompt = args[++i];
        break;
      case '--providers':
        const providersArg = args[++i];
        if (providersArg) {
          options.providers = providersArg.split(',');
        }
        break;
      case '--report':
        options.report = args[++i];
        break;
      case '--all-models':
        options.allModels = true;
        break;
      case '--help':
        console.log(`
Benchmark CLI Usage:
  --list              List available models
  --health            Check provider health
  --compare           Compare providers
  --iterations N      Number of iterations (default: 3)
  --warmup N          Number of warmup iterations (default: 1)
  --prompt "text"     Custom prompt for benchmarking
  --providers list    Comma-separated list of providers (e.g., ollama-local,vllm-local)
  --report filename   Write report to docs/reports/filename-TIMESTAMP.json
  --all-models        Benchmark against all available models
  --help              Show this help

Examples:
  benchmark --list
  benchmark --health
  benchmark --compare --iterations 5
  benchmark --prompt "Write hello world in Python"
        `);
        process.exit(0);
    }
  }

  return options;
}

// Main execution
async function main() {
  const cli = new BenchmarkCLI();
  const options = parseArgs();

  try {
    await cli.run(options);
  } finally {
    await cli.cleanup();
  }
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
