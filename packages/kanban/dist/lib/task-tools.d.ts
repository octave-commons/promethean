export interface TaskComparison {
    uuid: string;
    title: string;
    status: string;
    priority: string;
    similarity: number;
    sharedLabels: string[];
    reasons: string[];
}
export interface TaskBreakdown {
    originalTask: {
        uuid: string;
        title: string;
        priority: string;
    };
    subtasks: Array<{
        title: string;
        description: string;
        estimatedComplexity: 'low' | 'medium' | 'high';
        suggestedPriority: string;
        dependencies: string[];
    }>;
    breakdownStrategy: string;
    estimatedTotalTime: string;
}
export interface TaskPriority {
    uuid: string;
    title: string;
    currentPriority: string;
    suggestedPriority: string;
    priorityScore: number;
    factors: {
        businessValue: number;
        complexity: number;
        dependencies: number;
        risk: number;
        strategicAlignment: number;
    };
    reasoning: string;
}
export declare function compareTasks(taskUuids: string[], boardPath?: string, tasksPath?: string): Promise<TaskComparison[]>;
export declare function suggestTaskBreakdown(taskUuid: string, tasksPath?: string): Promise<TaskBreakdown>;
export declare function prioritizeTasks(taskUuids: string[], criteria?: {
    businessValueWeight?: number;
    complexityWeight?: number;
    dependenciesWeight?: number;
    riskWeight?: number;
    strategicWeight?: number;
}): Promise<TaskPriority[]>;
//# sourceMappingURL=task-tools.d.ts.map