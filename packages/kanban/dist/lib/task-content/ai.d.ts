/**
 * AI-Assisted Task Management
 * Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown
 */
import type { TaskAnalysisRequest, TaskRewriteRequest, TaskBreakdownRequest, TaskAnalysisResult, TaskRewriteResult, TaskBreakdownResult } from './types.js';
export interface TaskAIManagerConfig {
    model?: string;
    baseUrl?: string;
    timeout?: number;
    maxTokens?: number;
    temperature?: number;
}
export declare class TaskAIManager {
    private readonly config;
    private readonly contentManager;
    constructor(config?: TaskAIManagerConfig);
    /**
     * Analyze a task using AI to provide insights into quality, complexity, completeness, etc.
     */
    analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult>;
    /**
     * Rewrite task content using AI based on specified requirements
     */
    rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult>;
    /**
     * Break down a task into subtasks, steps, or phases using AI
     */
    breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult>;
    private validateAnalysisResult;
    private validateBreakdownResult;
    private analyzeChanges;
}
/**
 * Create a task AI manager instance
 */
export declare function createTaskAIManager(config?: TaskAIManagerConfig): TaskAIManager;
//# sourceMappingURL=ai.d.ts.map