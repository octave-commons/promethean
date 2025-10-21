/**
 * BuildFix integration for pipeline automation
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { BuildFixConfig, BuildFixResult, PipelineStep } from './types.js';

export class BuildFixIntegration {
  constructor(private config: BuildFixConfig) {}

  async applyBuildFix(step: PipelineStep, errorOutput: string): Promise<BuildFixResult> {
    const startTime = Date.now();

    try {
      // Parse TypeScript errors from output
      const errors = this.parseErrors(errorOutput);

      if (errors.length === 0) {
        return {
          stepId: step.id,
          success: true,
          errorsResolved: 0,
          attempts: 0,
          duration: Date.now() - startTime,
          model: this.config.model,
          patchesGenerated: 0,
        };
      }

      // Apply BuildFix for each error
      let totalResolved = 0;
      let totalPatches = 0;
      let success = true;

      for (const error of errors) {
        const fixResult = await this.fixError(error, step);
        totalResolved += fixResult.resolved;
        totalPatches += fixResult.patches;

        if (!fixResult.success) {
          success = false;
          break;
        }
      }

      return {
        stepId: step.id,
        success,
        errorsResolved: totalResolved,
        attempts: this.config.maxAttempts,
        duration: Date.now() - startTime,
        model: this.config.model,
        patchesGenerated: totalPatches,
      };
    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        errorsResolved: 0,
        attempts: this.config.maxAttempts,
        duration: Date.now() - startTime,
        model: this.config.model,
        patchesGenerated: 0,
      };
    }
  }

  private parseErrors(output: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Match TypeScript error format: file(line,column): error TScode: message
      const match = line.match(/^(.+)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/);
      if (match) {
        errors.push({
          file: match[1] || '',
          line: parseInt(match[2] || '0'),
          column: parseInt(match[3] || '0'),
          code: match[4] || '',
          message: match[5] || '',
        });
      }
    }

    return errors;
  }

  private async fixError(
    error: TypeScriptError,
    _step: PipelineStep,
  ): Promise<{ success: boolean; resolved: number; patches: number }> {
    try {
      // Create BuildFix command
      const buildFixCommand = this.createBuildFixCommand(error, _step);

      // Execute BuildFix
      const result = await this.executeBuildFix(buildFixCommand);

      return {
        success: result.exitCode === 0,
        resolved: result.errorsFixed || 0,
        patches: result.patchesGenerated || 0,
      };
    } catch (error) {
      return {
        success: false,
        resolved: 0,
        patches: 0,
      };
    }
  }

  private createBuildFixCommand(error: TypeScriptError, _step: PipelineStep): string[] {
    const args = [
      'tsx',
      'packages/buildfix/src/buildfix.ts',
      '--file',
      error.file,
      '--line',
      error.line.toString(),
      '--column',
      error.column.toString(),
      '--error-code',
      error.code,
      '--model',
      this.config.model,
      '--max-attempts',
      this.config.maxAttempts.toString(),
      '--timeout',
      this.config.timeoutMs.toString(),
    ];

    if (this.config.errorContext) {
      args.push('--error-context');
    }

    if (this.config.fixStrategy === 'aggressive') {
      args.push('--aggressive');
    }

    return args;
  }

  private async executeBuildFix(
    args: string[],
  ): Promise<{ exitCode: number; errorsFixed?: number; patchesGenerated?: number }> {
    return new Promise((resolve, reject) => {
      const child = spawn('pnpm', args, {
        stdio: 'pipe',
        env: { ...process.env, OLLAMA_URL: process.env.OLLAMA_URL },
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
        try {
          // Try to parse BuildFix output for metrics
          const metrics = this.parseBuildFixOutput(stdout);
          resolve({
            exitCode: code || 0,
            ...metrics,
          });
        } catch {
          resolve({
            exitCode: code || 0,
          });
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  private parseBuildFixOutput(output: string): { errorsFixed?: number; patchesGenerated?: number } {
    const metrics: { errorsFixed?: number; patchesGenerated?: number } = {};

    // Extract metrics from BuildFix output
    const errorsFixedMatch = output.match(/Errors fixed:\s+(\d+)/);
    if (errorsFixedMatch && errorsFixedMatch[1]) {
      metrics.errorsFixed = parseInt(errorsFixedMatch[1]);
    }

    const patchesMatch = output.match(/Patches generated:\s+(\d+)/);
    if (patchesMatch && patchesMatch[1]) {
      metrics.patchesGenerated = parseInt(patchesMatch[1]);
    }

    return metrics;
  }

  async validateBuildFixEnvironment(): Promise<boolean> {
    try {
      // Check if BuildFix package exists
      await readFile('packages/buildfix/package.json', 'utf8');

      // Check if Ollama is available
      const ollamaCheck = await this.executeCommand('ollama list');
      return ollamaCheck.exitCode === 0;
    } catch {
      return false;
    }
  }

  private async executeCommand(
    command: string,
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      if (!cmd) {
        resolve({ exitCode: 1, stdout: '', stderr: 'Empty command' });
        return;
      }

      const child = spawn(cmd, args, { stdio: 'pipe' });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data: any) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data: any) => {
        stderr += data.toString();
      });

      child.on('close', (code: any) => {
        resolve({
          exitCode: code || 0,
          stdout,
          stderr,
        });
      });
    });
  }
}

interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}
