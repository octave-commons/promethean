/**
 * Security Code Analyzer
 *
 * Integrates with security scanning tools to detect
 * vulnerabilities and security issues in code.
 */
import type { SecurityResult } from '../types.js';
export interface SecurityAnalyzerConfig {
    enabled: boolean;
    tools: string[];
    timeout: number;
}
/**
 * Security Analyzer for code review
 */
export declare class SecurityAnalyzer {
    private config;
    private availableTools;
    constructor(config: SecurityAnalyzerConfig);
    /**
     * Check if security tools are available
     */
    checkAvailability(): Promise<void>;
    /**
     * Analyze files with security tools
     */
    analyze(files: string[]): Promise<SecurityResult[]>;
    /**
     * Run a specific security tool
     */
    private runSecurityTool;
    /**
     * Run Semgrep security analysis
     */
    private runSemgrep;
    /**
     * Run Snyk security analysis
     */
    private runSnyk;
    /**
     * Run ESLint security rules
     */
    private runESLintSecurity;
    /**
     * Check if a specific tool is available
     */
    private checkToolAvailability;
    /**
     * Parse Semgrep findings
     */
    private parseSemgrepFindings;
    /**
     * Parse Snyk findings
     */
    private parseSnykFindings;
    /**
     * Parse ESLint security findings
     */
    private parseESLintSecurityFindings;
    /**
     * Map Semgrep severity to our format
     */
    private mapSemgrepSeverity;
    /**
     * Map Semgrep confidence to our format
     */
    private mapSemgrepConfidence;
    /**
     * Map Snyk severity to our format
     */
    private mapSnykSeverity;
    /**
     * Calculate summary statistics
     */
    private calculateSummary;
    /**
     * Get path to ESLint security configuration
     */
    private getESLintSecurityConfigPath;
}
//# sourceMappingURL=security-analyzer.d.ts.map