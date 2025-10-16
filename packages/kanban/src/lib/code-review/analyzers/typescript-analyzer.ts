/**
 * TypeScript Code Analyzer
 *
 * Integrates with TypeScript compiler to perform type checking
 * and static analysis for TypeScript files.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { access, readFile } from 'fs/promises';
import path from 'path';
import type { TypeScriptResult, TypeScriptDiagnostic } from '../types.js';

const execAsync = promisify(exec);

export interface TypeScriptAnalyzerConfig {
  enabled: boolean;
  configPath?: string;
  strict: boolean;
  timeout: number;
}

/**
 * TypeScript Analyzer for code review
 */
export class TypeScriptAnalyzer {
  private config: TypeScriptAnalyzerConfig;
  private available: boolean = false;

  constructor(config: TypeScriptAnalyzerConfig) {
    this.config = config;
  }

  /**
   * Check if TypeScript compiler is available
   */
  async checkAvailability(): Promise<void> {
    try {
      // Check if tsc command is available
      await execAsync('npx tsc --version', { timeout: 5000 });
      this.available = true;
    } catch (error) {
      throw new Error(`TypeScript compiler not available: ${error}`);
    }
  }

  /**
   * Analyze files with TypeScript compiler
   */
  async analyze(files: string[]): Promise<TypeScriptResult[]> {
    if (!this.available) {
      throw new Error('TypeScript analyzer is not available');
    }

    // Filter TypeScript files
    const tsFiles = files.filter(file => 
      file.endsWith('.ts') || file.endsWith('.tsx')
    );

    if (tsFiles.length === 0) {
      return [];
    }

    const results: TypeScriptResult[] = [];

    for (const file of tsFiles) {
      try {
        const result = await this.analyzeFile(file);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to analyze ${file} with TypeScript:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  /**
   * Analyze a single TypeScript file
   */
  private async analyzeFile(filePath: string): Promise<TypeScriptResult> {
    const args = [
      '--noEmit', // Don't generate output files
      '--pretty', 'false', // Don't use colors and formatting
    ];

    // Add strict mode if enabled
    if (this.config.strict) {
      args.push('--strict');
    }

    // Add config file if specified
    if (this.config.configPath) {
      args.push('--project', this.config.configPath);
    }

    args.push(filePath);

    try {
      const { stdout, stderr } = await execAsync(`npx tsc ${args.join(' ')}`, {
        timeout: this.config.timeout,
        cwd: process.cwd(),
      });

      // TypeScript outputs errors to stderr
      const output = stderr.trim();
      if (!output) {
        return {
          filePath,
          diagnostics: [],
          errorCount: 0,
          warningCount: 0,
          suggestionCount: 0,
        };
      }

      const diagnostics = this.parseTypeScriptOutput(output, filePath);
      const errorCount = diagnostics.filter(d => d.category === 1).length;
      const warningCount = diagnostics.filter(d => d.category === 2).length;
      const suggestionCount = diagnostics.filter(d => d.category === 3).length;

      return {
        filePath,
        diagnostics,
        errorCount,
        warningCount,
        suggestionCount,
      };

    } catch (error) {
      // TypeScript returns non-zero exit code on type errors
      if (error instanceof Error && 'stderr' in error) {
        const stderr = (error as any).stderr;
        if (stderr) {
          const diagnostics = this.parseTypeScriptOutput(stderr, filePath);
          const errorCount = diagnostics.filter(d => d.category === 1).length;
          const warningCount = diagnostics.filter(d => d.category === 2).length;
          const suggestionCount = diagnostics.filter(d => d.category === 3).length;

          return {
            filePath,
            diagnostics,
            errorCount,
            warningCount,
            suggestionCount,
          };
        }
      }
      throw error;
    }
  }

  /**
   * Parse TypeScript compiler output
   */
  private parseTypeScriptOutput(output: string, filePath: string): TypeScriptDiagnostic[] {
    const diagnostics: TypeScriptDiagnostic[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      // Parse TypeScript error format:
      // filename(line,column): error TScode: message
      const match = line.match(/^(.+)\((\d+),(\d+)\):\s+(error|warning|suggestion)\s+TS(\d+):\s+(.+)$/);
      
      if (match) {
        const [, file, lineStr, columnStr, severity, code, message] = match;
        
        const diagnostic: TypeScriptDiagnostic = {
          category: this.getCategoryNumber(severity),
          code: parseInt(code, 10),
          file: file.trim(),
          start: 0, // TypeScript doesn't provide exact position
          length: 0,
          messageText: message.trim(),
          categoryText: severity,
        };

        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }

  /**
   * Convert severity string to TypeScript category number
   */
  private getCategoryNumber(severity: string): number {
    switch (severity.toLowerCase()) {
      case 'error':
        return 1;
      case 'warning':
        return 2;
      case 'suggestion':
        return 3;
      default:
        return 1; // Default to error
    }
  }

  /**
   * Get TypeScript configuration for code review
   */
  async getCodeReviewConfig(): Promise<string> {
    const config = {
      compilerOptions: {
        strict: this.config.strict,
        noImplicitAny: true,
        strictNullChecks: true,
        strictFunctionTypes: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedIndexedAccess: true,
        exactOptionalPropertyTypes: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: false,
        allowUnusedLabels: false,
        allowUnreachableCode: false,
      },
      include: ['**/*.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'coverage', '**/*.test.ts', '**/*.spec.ts'],
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Check if a file has TypeScript errors
   */
  async hasErrors(filePath: string): Promise<boolean> {
    try {
      const result = await this.analyzeFile(filePath);
      return result.errorCount > 0;
    } catch {
      return true; // Assume errors on analysis failure
    }
  }

  /**
   * Get type coverage information
   */
  async getTypeCoverage(files: string[]): Promise<{
    totalFiles: number;
    typedFiles: number;
    coverage: number;
    untypedFiles: string[];
  }> {
    const tsFiles = files.filter(file => 
      file.endsWith('.ts') || file.endsWith('.tsx')
    );

    if (tsFiles.length === 0) {
      return {
        totalFiles: 0,
        typedFiles: 0,
        coverage: 0,
        untypedFiles: [],
      };
    }

    let typedFiles = 0;
    const untypedFiles: string[] = [];

    for (const file of tsFiles) {
      try {
        const content = await readFile(file, 'utf-8');
        
        // Simple heuristic: check for explicit type annotations
        const hasTypeAnnotations = /:\s*(string|number|boolean|void|any|unknown|never|[A-Z]\w*|Array<[^>]+>|{[^}]+})/.test(content);
        
        if (hasTypeAnnotations) {
          typedFiles++;
        } else {
          untypedFiles.push(file);
        }
      } catch (error) {
        console.warn(`Failed to read ${file} for type coverage:`, error);
        untypedFiles.push(file);
      }
    }

    const coverage = tsFiles.length > 0 ? (typedFiles / tsFiles.length) * 100 : 0;

    return {
      totalFiles: tsFiles.length,
      typedFiles,
      coverage,
      untypedFiles,
    };
  }
}