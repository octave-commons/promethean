export type AIPerformanceScore = {
    score: number;
    scoreSource: 'deterministic' | 'user-feedback' | 'auto-eval';
    scoreReason?: string;
    taskCategory?: string;
    executionTime?: number;
    tokensUsed?: number;
    modelName?: string;
    timestamp?: string;
};
export type AIModelPerformance = {
    modelName: string;
    taskCategory: string;
    averageScore: number;
    totalJobs: number;
    successRate: number;
    averageExecutionTime: number;
    lastUpdated: string;
    recentScores: number[];
};
export type AIRoutingDecision = {
    taskId?: string;
    prompt: string;
    taskCategory: string;
    selectedModel: string;
    alternativeModels: string[];
    confidence: number;
    reasoning: string;
    timestamp: string;
};
export type Task = {
    uuid: string;
    title: string;
    status: string;
    priority?: string | number;
    labels?: string[];
    created_at?: string;
    estimates?: {
        complexity?: number;
        scale?: number;
        time_to_completion?: string;
    };
    content?: string;
    slug?: string;
    sourcePath?: string;
    corrections?: {
        count: number;
        history: Array<{
            timestamp: string;
            from: string;
            to: string;
            reason: string;
        }>;
    };
    storyPoints?: number;
    type?: 'task' | 'epic';
    epicId?: string;
    subtaskIds?: string[];
    epicStatus?: 'pending' | 'in_progress' | 'completed' | 'blocked';
    aiPerformance?: AIPerformanceScore[];
    aiRouting?: AIRoutingDecision;
    frontmatter?: Record<string, any>;
    lastCommitSha?: string;
    commitHistory?: Array<{
        sha: string;
        timestamp: string;
        message: string;
        author: string;
        type: 'create' | 'update' | 'status_change' | 'move';
    }>;
};
export type ColumnData = {
    name: string;
    count: number;
    limit?: number | null;
    tasks: Task[];
};
export type Board = {
    columns: ColumnData[];
};
export type EpicTask = Task & {
    type: 'epic';
    subtaskIds: string[];
    epicStatus: 'pending' | 'in_progress' | 'completed' | 'blocked';
};
export type Subtask = Task & {
    type: 'task';
    epicId: string;
};
export type EpicValidationResult = {
    allowed: boolean;
    reason?: string;
    blockedBy?: string[];
    warnings?: string[];
};
export type EpicTransitionRule = {
    fromStatus: string;
    toStatus: string;
    requiredSubtaskStatuses: string[];
    allowPartialCompletion: boolean;
};
export type { ScarContext, EventLogEntry, ScarRecord, SearchResult, LLMOperation, GitCommit, ScarContextOptions, HealingStatus, HealingResult, } from './heal/scar-context-types.js';
//# sourceMappingURL=types.d.ts.map