/**
 * AI-Assisted Task Management
 * Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown
 */
import type { TaskAnalysisRequest, TaskRewriteRequest, TaskBreakdownRequest, TaskAnalysisResult, TaskRewriteResult, TaskBreakdownResult } from './types.js';
export type TaskAIManagerConfig = {
    model?: string;
    baseUrl?: string;
    timeout?: number;
    maxTokens?: number;
    temperature?: number;
};
export declare class TaskAIManager {
    private readonly config;
    private readonly contentManager;
    private wipEnforcement;
    private transitionRulesState;
    constructor(config?: TaskAIManagerConfig);
    private createContentManager;
    private initializeComplianceSystems;
    private validateTaskTransition;
    private syncKanbanBoard;
    private createTaskBackup;
    private logAuditEvent;
    analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult>;
    rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult>;
    breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult>;
    private generateTaskAnalysis;
    private generateTaskRewrite;
    private generateTaskBreakdown;
}
export declare function createTaskAIManager(config?: TaskAIManagerConfig): TaskAIManager;
//# sourceMappingURL=ai.d.ts.map