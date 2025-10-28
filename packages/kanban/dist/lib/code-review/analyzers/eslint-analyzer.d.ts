/**
 * ESLint Code Analyzer
 *
 * Integrates with ESLint to perform static code analysis
 * and style checking for JavaScript/TypeScript files.
 */
import type { ESLintResult } from '../types.js';
export interface ESLintAnalyzerConfig {
    enabled: boolean;
    configPath?: string;
    extensions: string[];
    timeout: number;
}
/**
 * ESLint Analyzer for code review
 */
export declare class ESLintAnalyzer {
    private config;
    private available;
    constructor(config: ESLintAnalyzerConfig);
    /**
     * Check if ESLint is available
     */
    checkAvailability(): Promise<void>;
    /**
     * Analyze files with ESLint
     */
    analyze(files: string[]): Promise<ESLintResult[]>;
    /**
     * Analyze a single file
     */
    private analyzeFile;
    /**
     * Normalize ESLint message format
     */
    private normalizeMessage;
    /**
     * Get path to default ESLint configuration
     */
    private getDefaultConfigPath;
    /**
     * Auto-fix ESLint issues
     */
    fixFiles(files: string[]): Promise<{
        fixed: string[];
        remaining: string[];
    }>;
}
//# sourceMappingURL=eslint-analyzer.d.ts.map