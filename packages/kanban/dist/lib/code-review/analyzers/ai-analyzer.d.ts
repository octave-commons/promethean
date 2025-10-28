/**
 * AI Code Analyzer
 *
 * Integrates with AI models to provide intelligent code analysis,
 * suggestions, and quality assessments.
 */
import type { AIAnalysisResult, CodeReviewSuggestion, Task } from '../types.js';
export interface AIAnalyzerConfig {
    enabled: boolean;
    model: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
}
/**
 * AI Analyzer for code review
 */
export declare class AIAnalyzer {
    private config;
    private available;
    constructor(config: AIAnalyzerConfig);
    /**
     * Check if AI analyzer is available
     */
    checkAvailability(): Promise<void>;
    /**
     * Analyze code with AI
     */
    analyze(task: Task, files: string[]): Promise<AIAnalysisResult>;
    /**
     * Read contents of files for analysis
     */
    private readFileContents;
    /**
     * Generate analysis prompt for AI
     */
    private generateAnalysisPrompt;
    /**
     * Call AI model
     */
    private callAI;
    /**
     * Parse AI response
     */
    private parseAIResponse;
    /**
     * Clamp value between min and max
     */
    private clamp;
    /**
     * Calculate confidence in AI response
     */
    private calculateConfidence;
    /**
     * Get code quality summary
     */
    getCodeQualitySummary(quality: AIAnalysisResult['codeQuality']): string;
    /**
     * Get priority suggestions
     */
    getPrioritySuggestions(suggestions: CodeReviewSuggestion[]): CodeReviewSuggestion[];
}
//# sourceMappingURL=ai-analyzer.d.ts.map