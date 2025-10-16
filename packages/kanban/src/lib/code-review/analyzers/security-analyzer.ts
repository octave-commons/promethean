/**
 * Security Code Analyzer
 *
 * Integrates with security scanning tools to detect
 * vulnerabilities and security issues in code.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { access } from 'fs/promises';
import path from 'path';
import type { SecurityResult, SecurityFinding } from '../types.js';

const execAsync = promisify(exec);

export interface SecurityAnalyzerConfig {
  enabled: boolean;
  tools: string[];
  timeout: number;
}

/**
 * Security Analyzer for code review
 */
export class SecurityAnalyzer {
  private config: SecurityAnalyzerConfig;
  private availableTools: Map<string, boolean> = new Map();

  constructor(config: SecurityAnalyzerConfig) {
    this.config = config;
  }

  /**
   * Check if security tools are available
   */
  async checkAvailability(): Promise<void> {
    const availableTools: string[] = [];

    for (const tool of this.config.tools) {
      try {
        await this.checkToolAvailability(tool);
        this.availableTools.set(tool, true);
        availableTools.push(tool);
      } catch (error) {
        console.warn(`Security tool ${tool} not available:`, error);
        this.availableTools.set(tool, false);
      }
    }

    if (availableTools.length === 0) {
      throw new Error('No security tools are available');
    }

    console.log(`Available security tools: ${availableTools.join(', ')}`);
  }

  /**
   * Analyze files with security tools
   */
  async analyze(files: string[]): Promise<SecurityResult[]> {
    const results: SecurityResult[] = [];

    for (const tool of this.config.tools) {
      if (!this.availableTools.get(tool)) {
        continue;
      }

      try {
        const result = await this.runSecurityTool(tool, files);
        results.push(result);
      } catch (error) {
        console.warn(`Security analysis with ${tool} failed:`, error);
        // Continue with other tools
      }
    }

    return results;
  }

  /**
   * Run a specific security tool
   */
  private async runSecurityTool(tool: string, files: string[]): Promise<SecurityResult> {
    switch (tool.toLowerCase()) {
      case 'semgrep':
        return await this.runSemgrep(files);
      case 'snyk':
        return await this.runSnyk(files);
      case 'eslint-security':
        return await this.runESLintSecurity(files);
      default:
        throw new Error(`Unsupported security tool: ${tool}`);
    }
  }

  /**
   * Run Semgrep security analysis
   */
  private async runSemgrep(files: string[]): Promise<SecurityResult> {
    const args = [
      '--config=auto', // Use auto configuration for security rules
      '--json',
      '--no-rewrite-rule-ids',
      '--severity=INFO', // Include all severity levels
    ];

    // Filter relevant files
    const relevantFiles = files.filter(file => 
      file.endsWith('.ts') || 
      file.endsWith('.tsx') || 
      file.endsWith('.js') || 
      file.endsWith('.jsx')
    );

    if (relevantFiles.length === 0) {
      return {
        tool: 'semgrep',
        findings: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      };
    }

    args.push(...relevantFiles);

    try {
      const { stdout, stderr } = await execAsync(`semgrep ${args.join(' ')}`, {
        timeout: this.config.timeout,
        cwd: process.cwd(),
      });

      if (stderr) {
        console.warn(`Semgrep stderr:`, stderr);
      }

      const output = stdout.trim();
      if (!output) {
        return {
          tool: 'semgrep',
          findings: [],
          summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        };
      }

      const semgrepResult = JSON.parse(output);
      const findings = this.parseSemgrepFindings(semgrepResult.results || []);
      const summary = this.calculateSummary(findings);

      return {
        tool: 'semgrep',
        findings,
        summary,
      };

    } catch (error) {
      if (error instanceof Error && 'stdout' in error) {
        const stdout = (error as any).stdout;
        if (stdout) {
          try {
            const semgrepResult = JSON.parse(stdout);
            const findings = this.parseSemgrepFindings(semgrepResult.results || []);
            const summary = this.calculateSummary(findings);

            return {
              tool: 'semgrep',
              findings,
              summary,
            };
          } catch (parseError) {
            throw new Error(`Failed to parse Semgrep output: ${parseError}`);
          }
        }
      }
      throw error;
    }
  }

  /**
   * Run Snyk security analysis
   */
  private async runSnyk(files: string[]): Promise<SecurityResult> {
    try {
      const { stdout, stderr } = await execAsync('snyk test --json', {
        timeout: this.config.timeout,
        cwd: process.cwd(),
      });

      if (stderr) {
        console.warn(`Snyk stderr:`, stderr);
      }

      const output = stdout.trim();
      if (!output) {
        return {
          tool: 'snyk',
          findings: [],
          summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        };
      }

      const snykResult = JSON.parse(output);
      const findings = this.parseSnykFindings(snykResult.vulnerabilities || []);
      const summary = this.calculateSummary(findings);

      return {
        tool: 'snyk',
        findings,
        summary,
      };

    } catch (error) {
      // Snyk returns non-zero exit code on vulnerabilities
      if (error instanceof Error && 'stdout' in error) {
        const stdout = (error as any).stdout;
        if (stdout) {
          try {
            const snykResult = JSON.parse(stdout);
            const findings = this.parseSnykFindings(snykResult.vulnerabilities || []);
            const summary = this.calculateSummary(findings);

            return {
              tool: 'snyk',
              findings,
              summary,
            };
          } catch (parseError) {
            throw new Error(`Failed to parse Snyk output: ${parseError}`);
          }
        }
      }
      throw error;
    }
  }

  /**
   * Run ESLint security rules
   */
  private async runESLintSecurity(files: string[]): Promise<SecurityResult> {
    const args = [
      '--format', 'json',
      '--config', this.getESLintSecurityConfigPath(),
    ];

    const relevantFiles = files.filter(file => 
      file.endsWith('.ts') || 
      file.endsWith('.tsx') || 
      file.endsWith('.js') || 
      file.endsWith('.jsx')
    );

    if (relevantFiles.length === 0) {
      return {
        tool: 'eslint-security',
        findings: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      };
    }

    args.push(...relevantFiles);

    try {
      const { stdout, stderr } = await execAsync(`npx eslint ${args.join(' ')}`, {
        timeout: this.config.timeout,
        cwd: process.cwd(),
      });

      if (stderr && !stderr.includes('warning')) {
        console.warn(`ESLint security stderr:`, stderr);
      }

      const output = stdout.trim();
      if (!output) {
        return {
          tool: 'eslint-security',
          findings: [],
          summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        };
      }

      const eslintResults = JSON.parse(output);
      const findings = this.parseESLintSecurityFindings(eslintResults);
      const summary = this.calculateSummary(findings);

      return {
        tool: 'eslint-security',
        findings,
        summary,
      };

    } catch (error) {
      if (error instanceof Error && 'stdout' in error) {
        const stdout = (error as any).stdout;
        if (stdout) {
          try {
            const eslintResults = JSON.parse(stdout);
            const findings = this.parseESLintSecurityFindings(eslintResults);
            const summary = this.calculateSummary(findings);

            return {
              tool: 'eslint-security',
              findings,
              summary,
            };
          } catch (parseError) {
            throw new Error(`Failed to parse ESLint security output: ${parseError}`);
          }
        }
      }
      throw error;
    }
  }

  /**
   * Check if a specific tool is available
   */
  private async checkToolAvailability(tool: string): Promise<void> {
    switch (tool.toLowerCase()) {
      case 'semgrep':
        await execAsync('semgrep --version', { timeout: 5000 });
        break;
      case 'snyk':
        await execAsync('snyk --version', { timeout: 5000 });
        break;
      case 'eslint-security':
        await execAsync('npx eslint --version', { timeout: 5000 });
        break;
      default:
        throw new Error(`Unknown security tool: ${tool}`);
    }
  }

  /**
   * Parse Semgrep findings
   */
  private parseSemgrepFindings(results: any[]): SecurityFinding[] {
    return results.map(result => ({
      id: result.check_id || 'unknown',
      ruleId: result.metadata?.name || result.check_id,
      severity: this.mapSemgrepSeverity(result.metadata?.severity || 'INFO'),
      confidence: this.mapSemgrepConfidence(result.metadata?.confidence || 'MEDIUM'),
      message: result.message || 'Security issue detected',
      file: result.path,
      line: result.start?.line,
      endLine: result.end?.line,
      column: result.start?.col,
      endColumn: result.end?.col,
      cwe: result.metadata?.cwe?.join(', '),
      owasp: result.metadata?.owasp?.join(', '),
      references: result.metadata?.references || [],
    }));
  }

  /**
   * Parse Snyk findings
   */
  private parseSnykFindings(vulnerabilities: any[]): SecurityFinding[] {
    return vulnerabilities.map(vuln => ({
      id: vuln.id || 'unknown',
      ruleId: vuln.title || vuln.name,
      severity: this.mapSnykSeverity(vuln.severity || 'medium'),
      confidence: 'high',
      message: vuln.description || 'Security vulnerability detected',
      file: vuln.from?.[0] || 'unknown',
      cwe: vuln.cwe,
      references: vuln.references || [],
    }));
  }

  /**
   * Parse ESLint security findings
   */
  private parseESLintSecurityFindings(results: any[]): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    for (const fileResult of results) {
      for (const message of fileResult.messages || []) {
        if (message.ruleId && message.ruleId.startsWith('security/')) {
          findings.push({
            id: `eslint-${message.ruleId}`,
            ruleId: message.ruleId,
            severity: message.severity === 2 ? 'high' : 'medium',
            confidence: 'medium',
            message: message.message,
            file: fileResult.filePath,
            line: message.line,
            endLine: message.endLine,
            column: message.column,
            endColumn: message.endColumn,
          });
        }
      }
    }

    return findings;
  }

  /**
   * Map Semgrep severity to our format
   */
  private mapSemgrepSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    switch (severity.toUpperCase()) {
      case 'ERROR':
        return 'critical';
      case 'WARNING':
        return 'high';
      case 'INFO':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Map Semgrep confidence to our format
   */
  private mapSemgrepConfidence(confidence: string): 'high' | 'medium' | 'low' {
    switch (confidence.toUpperCase()) {
      case 'HIGH':
        return 'high';
      case 'MEDIUM':
        return 'medium';
      case 'LOW':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Map Snyk severity to our format
   */
  private mapSnykSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'info';
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(findings: SecurityFinding[]): {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  } {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const finding of findings) {
      summary[finding.severity]++;
    }

    return summary;
  }

  /**
   * Get path to ESLint security configuration
   */
  private getESLintSecurityConfigPath(): string {
    return path.join(__dirname, '../../../config/eslint.security.json');
  }
}