/**
 * Kanban Integration
 *
 * Integration layer for connecting code review system
 * with kanban transition validation.
 */
import type { Task, Board } from '../../types.js';
import { CodeReviewRulesEngine } from '../rules-engine.js';
import type { TransitionResult } from '../../transition-rules.js';
/**
 * Kanban Code Review Integration
 */
export declare class KanbanCodeReviewIntegration {
    private codeReviewEngine;
    constructor(codeReviewEngine: CodeReviewRulesEngine);
    /**
     * Validate kanban transition with code review
     */
    validateTransition(from: string, to: string, task: Task, board: Board, actor?: 'agent' | 'human' | 'system'): Promise<TransitionResult>;
    /**
     * Get code review summary for task
     */
    getTaskReviewSummary(task: Task): Promise<{
        hasReview: boolean;
        lastReviewScore?: number;
        lastReviewDate?: string;
        violationCount?: number;
        recommendations?: string[];
    }>;
    /**
     * Update task with code review results
     */
    updateTaskWithReviewResults(task: Task, reviewResult: any, transition: string): Promise<Task>;
    /**
     * Check if task requires code review for transition
     */
    requiresCodeReview(from: string, to: string, task: Task): boolean;
    /**
     * Check if task has code changes
     */
    private taskHasCodeChanges;
    /**
     * Get code review configuration for transition
     */
    getTransitionReviewConfig(from: string, to: string): {
        enabled: boolean;
        required: boolean;
        rules: string[];
        thresholds: any;
    } | null;
    /**
     * Generate code review report for task
     */
    generateReviewReport(task: Task, reviewResult: any): Promise<string>;
}
//# sourceMappingURL=kanban-integration.d.ts.map