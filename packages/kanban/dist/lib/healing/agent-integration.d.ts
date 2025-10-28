import type { HealingRequest, IntegrationStatus } from './kanban-healing-coordinator.js';
export type AgentOperationResult = {
    agentsInvoked: string[];
    recommendations: string[];
    enforcements: string[];
};
export type AgentRecommendationResult = {
    recommendations: string[];
    criticalIssues: Array<{
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        suggestedAction: string;
    }>;
};
export declare function runAgentOperations(request: HealingRequest, status: IntegrationStatus): Promise<AgentOperationResult>;
export declare function runAgentRecommendations(reason: string, status: IntegrationStatus): Promise<AgentRecommendationResult>;
//# sourceMappingURL=agent-integration.d.ts.map