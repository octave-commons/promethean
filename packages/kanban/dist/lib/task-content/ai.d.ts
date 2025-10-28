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
    private syncKanbanBoard;
    private createTaskBackup;
    private logAuditEvent;
    analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult>;
    rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult>;
    breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult>;
    private generateTaskAnalysis;
    default: return;
}
export declare function createTaskAIManager(config?: TaskAIManagerConfig): TaskAIManager;
//# sourceMappingURL=ai.d.ts.map