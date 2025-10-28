/**
 * Kanban Healing Integration Coordinator
 *
 * This module provides comprehensive coordination between kanban healing operations,
 * MCP bridge functionality, and agent systems. It addresses integration issues
 * and provides a unified interface for healing operations.
 */
import type { HealCommandOptions, ExtendedHealingResult } from '../heal/heal-command.js';
/**
 * Integration coordinator configuration
 */
export interface KanbanHealingCoordinatorConfig {
    boardPath: string;
    tasksDir: string;
    repoRoot?: string;
    enableMCPBridge?: boolean;
    enableAgentIntegration?: boolean;
    fallbackToNonGit?: boolean;
    loggingLevel?: 'error' | 'warn' | 'info' | 'debug';
}
/**
 * Healing operation request
 */
export interface HealingRequest {
    id: string;
    reason: string;
    options: Partial<HealCommandOptions>;
    requestedAt: Date;
    requestedBy?: string;
}
/**
 * Integration status for different components
 */
export interface IntegrationStatus {
    kanban: {
        available: boolean;
        version?: string;
        issues: string[];
    };
    mcp: {
        available: boolean;
        toolsEnabled: string[];
        issues: string[];
    };
    agents: {
        available: boolean;
        activeAgents: string[];
        issues: string[];
    };
    git: {
        available: boolean;
        repoRoot?: string;
        currentSha?: string;
        issues: string[];
    };
}
/**
 * Coordinated healing result
 */
export interface CoordinatedHealingResult extends ExtendedHealingResult {
    coordinator: {
        requestId: string;
        integrationStatus: IntegrationStatus;
        componentsUsed: string[];
        fallbacksActivated: string[];
        warnings: string[];
    };
    mcpResults?: {
        eventsBroadcasted: number;
        clientsNotified: string[];
        syncOperations: number;
    };
    agentResults?: {
        agentsInvoked: string[];
        recommendations: string[];
        enforcements: string[];
    };
}
/**
 * Main Kanban Healing Coordinator
 */
export declare class KanbanHealingCoordinator {
    private readonly config;
    private readonly logger;
    constructor(config: KanbanHealingCoordinatorConfig);
    /**
     * Get integration status for all components
     */
    getIntegrationStatus(): Promise<IntegrationStatus>;
    /**
     * Execute coordinated healing operation
     */
    executeHealing(request: HealingRequest): Promise<CoordinatedHealingResult>;
    /**
     * Get healing recommendations from all available systems
     */
    getComprehensiveRecommendations(reason: string, options?: Partial<HealCommandOptions>): Promise<{
        recommendations: string[];
        criticalIssues: Array<{
            type: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            suggestedAction: string;
        }>;
        integrationStatus: IntegrationStatus;
        sources: string[];
    }>;
    /**
     * Execute fallback healing operations when main heal command fails
     */
    private executeFallbackHealing;
    /**
     * Execute MCP bridge operations
     */
    private executeMCPBridgeOperations;
    /**
     * Execute agent operations
     */
    private executeAgentOperations;
    /**
     * Get agent-based recommendations
     */
    private getAgentRecommendations;
    /**
     * Generate comprehensive summary
     */
    private generateSummary;
    /**
     * Create logger function
     */
    private createLogger;
    /**
     * Check if file exists
     */
    private fileExists;
}
/**
 * Create a kanban healing coordinator
 */
export declare function createKanbanHealingCoordinator(config: KanbanHealingCoordinatorConfig): KanbanHealingCoordinator;
/**
 * Default configuration for coordinator
 */
export declare const DEFAULT_COORDINATOR_CONFIG: Partial<KanbanHealingCoordinatorConfig>;
//# sourceMappingURL=kanban-healing-coordinator.d.ts.map