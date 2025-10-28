/**
 * TypeScript Code Analyzer
 *
 * Integrates with TypeScript compiler to perform type checking
 * and static analysis for TypeScript files.
 */
import type { TypeScriptResult } from '../types.js';
export interface TypeScriptAnalyzerConfig {
    enabled: boolean;
    configPath?: string;
    strict: boolean;
    timeout: number;
}
/**
 * TypeScript Analyzer for code review
 */
export declare class TypeScriptAnalyzer {
    private config;
    private available;
    constructor(config: TypeScriptAnalyzerConfig);
    /**
     * Check if TypeScript compiler is available
     */
    checkAvailability(): Promise<void>;
    /**
     * Analyze files with TypeScript compiler
     */
    analyze(files: string[]): Promise<TypeScriptResult[]>;
    /**
     * Analyze a single TypeScript file
     */
    private analyzeFile;
    /**
     * Parse TypeScript compiler output
     */
    private parseTypeScriptOutput;
    /**
     * Convert severity string to TypeScript category number
     */
    private getCategoryNumber;
    /**
     * Get TypeScript configuration for code review
     */
    getCodeReviewConfig(): Promise<string>;
    /**
     * Check if a file has TypeScript errors
     */
    hasErrors(filePath: string): Promise<boolean>;
    /**
     * Get type coverage information
     */
    getTypeCoverage(files: string[]): Promise<{
        totalFiles: number;
        typedFiles: number;
        coverage: number;
        untypedFiles: string[];
    }>;
}
//# sourceMappingURL=typescript-analyzer.d.ts.map