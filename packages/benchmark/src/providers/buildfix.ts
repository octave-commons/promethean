import { BaseProvider } from './base.js';
import { ProviderConfig, BenchmarkRequest, BenchmarkResponse } from '../types/index.js';
import { spawn } from 'child_process';
import { mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { performance } from 'perf_hooks';

interface BuildFixResult {
  fixture: string;
  model: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  duration: number;
  attempts: number;
  planTitle?: string;
  errorMessage?: string;
}

export class BuildFixProvider extends BaseProvider {
  private buildFixPath: string;
  private tempDir: string;

  constructor(config: ProviderConfig) {
    super(config);
    // Find repo root by going up from current directory
    let currentDir = process.cwd();
    while (currentDir !== '/' && !existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
      currentDir = dirname(currentDir);
    }
    this.buildFixPath = join(currentDir, 'packages/buildfix');
    this.tempDir = join(currentDir, '.benchmark-temp');
  }

  async connect(): Promise<void> {
    // Verify BuildFix package exists
    try {
      await readFile(join(this.buildFixPath, 'package.json'), 'utf8');
    } catch (error) {
      throw new Error(`BuildFix package not found at ${this.buildFixPath}`);
    }

    // Create temp directory
    await mkdir(this.tempDir, { recursive: true });
  }

  async disconnect(): Promise<void> {
    // Cleanup temp files if needed
  }

  async execute(request: BenchmarkRequest): Promise<BenchmarkResponse> {
    const startTime = performance.now();

    try {
      // Parse fixture type from metadata
      const fixtureType = request.metadata?.fixtureType || 'small';
      const useMassive = fixtureType === 'massive';

      // Build the BuildFix benchmark command
      const args: string[] = [
        'tsx',
        'packages/buildfix/src/benchmark/run-memoized.ts',
        '--models',
        this.config.model,
        ...(useMassive ? [] : ['--small-fixtures']),
        '--force-refresh',
      ];

      // Execute BuildFix benchmark
      const result = await this.executeBuildFix(args);

      // Parse BuildFix results
      const buildFixResults = await this.parseBuildFixResults(result);

      return {
        content: this.formatResponse(buildFixResults),
        tokens: this.estimateTokens(buildFixResults),
        time: Date.now() - startTime,
        metadata: {
          buildFixResults,
          fixtureType,
          totalTests: buildFixResults.length,
          successfulTests: buildFixResults.filter((r) => r.success).length,
        },
      };
    } catch (error) {
      return {
        content: `BuildFix benchmark failed: ${error instanceof Error ? error.message : String(error)}`,
        tokens: 0,
        time: Date.now() - startTime,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Check if BuildFix package exists and has required files
      const { statSync } = await import('fs');
      const testFile = join(this.buildFixPath, 'src/benchmark/run-memoized.ts');
      statSync(testFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    // BuildFix uses Ollama models, return available Ollama models
    try {
      const { execSync } = await import('child_process');
      const output = execSync('ollama list', { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1); // Skip header
      return lines
        .map((line) => line.split(/\s+/)[0])
        .filter((model): model is string => Boolean(model));
    } catch {
      return [this.config.model || 'qwen3:8b'];
    }
  }

  private async executeBuildFix(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      // Find repo root and run from there
      let currentDir = process.cwd();
      while (currentDir !== '/' && !existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
        currentDir = dirname(currentDir);
      }

      const child = spawn('pnpm', args, {
        cwd: currentDir,
        stdio: 'pipe',
        env: { ...process.env },
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`BuildFix failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async parseBuildFixResults(output: string): Promise<BuildFixResult[]> {
    try {
      // Extract JSON result file path from output
      const jsonMatch = output.match(/Results saved to: (.+\.json)/);
      if (!jsonMatch) {
        throw new Error('Could not find BuildFix results file');
      }

      const resultsPath = jsonMatch[1];
      if (!resultsPath) {
        throw new Error('Invalid results file path');
      }

      const resultsData = JSON.parse(await readFile(resultsPath, 'utf8'));

      return resultsData.results || [];
    } catch (error) {
      // Fallback: try to parse from output directly
      const results: BuildFixResult[] = [];

      // Look for success rate in output
      const successMatch = output.match(/Successful Tests: (\d+)/);
      const totalMatch = output.match(/Total Tests: (\d+)/);

      if (successMatch && totalMatch && successMatch[1] && totalMatch[1]) {
        const successful = parseInt(successMatch[1]);
        const total = parseInt(totalMatch[1]);

        // Create a synthetic result
        results.push({
          fixture: 'benchmark-suite',
          model: this.config.model ?? 'unknown',
          success: successful > 0,
          errorCountBefore: total,
          errorCountAfter: total - successful,
          errorsResolved: successful > 0,
          planGenerated: true,
          duration: 0,
          attempts: 3,
        });
      }

      return results;
    }
  }

  private formatResponse(results: BuildFixResult[]): string {
    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.success).length;
    const errorsResolved = results.filter((r) => r.errorsResolved).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    return `
BuildFix Benchmark Results:
- Total Tests: ${totalTests}
- Successful Tests: ${successfulTests} (${((successfulTests / totalTests) * 100).toFixed(1)}%)
- Errors Resolved: ${errorsResolved} (${((errorsResolved / totalTests) * 100).toFixed(1)}%)
- Average Duration: ${(avgDuration / 1000).toFixed(1)}s

Top Issues:
${results
  .filter((r) => r.errorMessage)
  .slice(0, 3)
  .map((r) => `- ${r.errorMessage}`)
  .join('\n')}
    `.trim();
  }

  private estimateTokens(results: BuildFixResult[]): number {
    // Rough estimation based on result content
    return results.length * 100; // ~100 tokens per result on average
  }
}
