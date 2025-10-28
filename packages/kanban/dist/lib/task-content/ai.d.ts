/**
 * AI-Assisted Task Management
 * Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown
 */
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
    if(: any, this: any, wipEnforcement: any): any;
}
export declare function createTaskAIManager(config?: TaskAIManagerConfig): TaskAIManager;
//# sourceMappingURL=ai.d.ts.map