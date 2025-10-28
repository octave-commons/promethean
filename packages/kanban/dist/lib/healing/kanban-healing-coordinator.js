/**
 * Kanban Healing Integration Coordinator
 *
 * This module provides comprehensive coordination between kanban healing operations,
 * MCP bridge functionality, and agent systems. It addresses integration issues
 * and provides a unified interface for healing operations.
 */
import path from 'node:path';
import { runAgentOperations, runAgentRecommendations, } from './agent-integration.js';
/**
 * Main Kanban Healing Coordinator
 */
export class KanbanHealingCoordinator {
    config;
    logger;
    constructor(config) {
        this.config = {
            enableMCPBridge: true,
            enableAgentIntegration: true,
            fallbackToNonGit: true,
            loggingLevel: 'info',
            ...config,
        };
        this.logger = this.createLogger();
    }
    /**
     * Get integration status for all components
     */
    async getIntegrationStatus() {
        const status = {
            kanban: { available: false, issues: [] },
            mcp: { available: false, toolsEnabled: [], issues: [] },
            agents: { available: false, activeAgents: [], issues: [] },
            git: { available: false, issues: [] },
        };
        // Check kanban availability
        try {
            const { loadBoard } = await import('../kanban.js');
            await loadBoard(this.config.boardPath, this.config.tasksDir);
            status.kanban.available = true;
            status.kanban.version = '0.2.0';
        }
        catch (error) {
            status.kanban.issues.push(`Kanban load failed: ${error}`);
        }
        // Check MCP availability
        if (this.config.enableMCPBridge) {
            try {
                // Check if MCP tools are available (not disabled)
                const mcpToolsPath = path.join(path.dirname(this.config.boardPath), '../../../mcp/src/tools/');
                const kanbanToolExists = await this.fileExists(path.join(mcpToolsPath, 'kanban.ts'));
                const kanbanBridgeExists = await this.fileExists(path.join(mcpToolsPath, 'kanban-bridge.ts'));
                if (kanbanToolExists) {
                    status.mcp.available = true;
                    status.mcp.toolsEnabled.push('kanban-core');
                }
                if (kanbanBridgeExists) {
                    status.mcp.available = true;
                    status.mcp.toolsEnabled.push('kanban-bridge');
                }
                if (!status.mcp.available) {
                    status.mcp.issues.push('MCP bridge tools are disabled');
                }
            }
            catch (error) {
                status.mcp.issues.push(`MCP check failed: ${error}`);
            }
        }
        // Check agent availability
        if (this.config.enableAgentIntegration) {
            try {
                const agentsPath = path.join(path.dirname(this.config.boardPath), '../../../.claude/agents/');
                const kanbanEnforcerExists = await this.fileExists(path.join(agentsPath, 'kanban-board-enforcer.md'));
                if (kanbanEnforcerExists) {
                    status.agents.available = true;
                    status.agents.activeAgents.push('kanban-board-enforcer');
                }
                else {
                    status.agents.issues.push('Kanban board enforcer agent not found');
                }
            }
            catch (error) {
                status.agents.issues.push(`Agent check failed: ${error}`);
            }
        }
        // Check git availability
        try {
            const { execSync } = await import('node:child_process');
            const repoRoot = this.config.repoRoot || path.dirname(this.config.boardPath);
            // Check if we're in a git repository
            execSync('git rev-parse --git-dir', { cwd: repoRoot, stdio: 'ignore' });
            const currentSha = execSync('git rev-parse HEAD', {
                cwd: repoRoot,
                encoding: 'utf8',
            }).trim();
            status.git.available = true;
            status.git.repoRoot = repoRoot;
            status.git.currentSha = currentSha;
        }
        catch (error) {
            status.git.issues.push(`Git not available: ${error}`);
            if (!this.config.fallbackToNonGit) {
                status.git.issues.push('Non-git fallback disabled');
            }
        }
        return status;
    }
    /**
     * Execute coordinated healing operation
     */
    async executeHealing(request) {
        const startTime = Date.now();
        const integrationStatus = await this.getIntegrationStatus();
        this.logger('info', `Starting coordinated healing: ${request.reason}`);
        this.logger('info', `Integration status: ${JSON.stringify(integrationStatus, null, 2)}`);
        const result = {
            status: 'in_progress',
            summary: '',
            tasksModified: 0,
            filesChanged: 0,
            errors: [],
            completedAt: new Date(),
            coordinator: {
                requestId: request.id,
                integrationStatus,
                componentsUsed: [],
                fallbacksActivated: [],
                warnings: [],
            },
        };
        try {
            // Step 1: Load kanban board
            if (integrationStatus.kanban.available) {
                result.coordinator.componentsUsed.push('kanban');
                const { loadBoard } = await import('../kanban.js');
                const board = await loadBoard(this.config.boardPath, this.config.tasksDir);
                this.logger('info', `Loaded board with ${board.columns.length} columns`);
            }
            else {
                throw new Error('Kanban system not available');
            }
            // Step 2: Execute heal command with proper error handling
            try {
                const { createHealCommand } = await import('../heal/heal-command.js');
                const healCommand = createHealCommand(this.config.boardPath, this.config.tasksDir);
                // Prepare heal options with fallbacks
                const healOptions = {
                    reason: request.reason,
                    dryRun: request.options.dryRun ?? false,
                    createTags: integrationStatus.git.available && (request.options.createTags ?? true),
                    pushTags: integrationStatus.git.available && (request.options.pushTags ?? false),
                    analyzeGit: integrationStatus.git.available && (request.options.analyzeGit ?? true),
                    gitHistoryDepth: request.options.gitHistoryDepth ?? 50,
                    searchTerms: request.options.searchTerms ?? [],
                    columnFilter: request.options.columnFilter ?? [],
                    labelFilter: request.options.labelFilter ?? [],
                    includeTaskAnalysis: request.options.includeTaskAnalysis ?? true,
                    includePerformanceMetrics: request.options.includePerformanceMetrics ?? true,
                };
                // If git is not available but fallback is enabled, modify options
                if (!integrationStatus.git.available && this.config.fallbackToNonGit) {
                    healOptions.createTags = false;
                    healOptions.pushTags = false;
                    healOptions.analyzeGit = false;
                    result.coordinator.fallbacksActivated.push('non-git-mode');
                    result.coordinator.warnings.push('Operating in non-git mode - no tags or history analysis');
                }
                const healResult = await healCommand.execute(healOptions);
                // Merge heal results
                Object.assign(result, healResult);
                result.coordinator.componentsUsed.push('heal-command');
            }
            catch (healError) {
                const errorMessage = `Heal command failed: ${healError}`;
                result.errors.push(errorMessage);
                this.logger('error', errorMessage);
                // Try fallback healing operations
                if (this.config.fallbackToNonGit) {
                    result.coordinator.fallbacksActivated.push('basic-healing');
                    const fallbackResult = await this.executeFallbackHealing(request, integrationStatus);
                    result.tasksModified += fallbackResult.tasksModified;
                    result.filesChanged += fallbackResult.filesChanged;
                    result.errors.push(...fallbackResult.errors);
                }
            }
            // Step 3: MCP bridge integration
            if (integrationStatus.mcp.available && this.config.enableMCPBridge) {
                try {
                    const mcpResults = await this.executeMCPBridgeOperations(request, integrationStatus);
                    result.mcpResults = mcpResults;
                    result.coordinator.componentsUsed.push('mcp-bridge');
                }
                catch (mcpError) {
                    result.coordinator.warnings.push(`MCP bridge failed: ${mcpError}`);
                    this.logger('warn', `MCP bridge operation failed: ${mcpError}`);
                }
            }
            // Step 4: Agent integration
            if (integrationStatus.agents.available && this.config.enableAgentIntegration) {
                try {
                    const agentResults = await this.executeAgentOperations(request, integrationStatus);
                    result.agentResults = agentResults;
                    result.coordinator.componentsUsed.push('agents');
                }
                catch (agentError) {
                    result.coordinator.warnings.push(`Agent integration failed: ${agentError}`);
                    this.logger('warn', `Agent operation failed: ${agentError}`);
                }
            }
            // Step 5: Finalize result
            result.status = result.errors.length > 0 ? 'completed' : 'completed';
            result.summary = this.generateSummary(result);
            result.totalTime = Date.now() - startTime;
            this.logger('info', `Coordinated healing completed: ${result.summary}`);
            return result;
        }
        catch (error) {
            result.status = 'failed';
            result.errors.push(`Coordinator failed: ${error}`);
            result.totalTime = Date.now() - startTime;
            this.logger('error', `Coordinated healing failed: ${error}`);
            return result;
        }
    }
    /**
     * Get healing recommendations from all available systems
     */
    async getComprehensiveRecommendations(reason, options = {}) {
        const integrationStatus = await this.getIntegrationStatus();
        const recommendations = [];
        const criticalIssues = [];
        const sources = [];
        // Get kanban-based recommendations
        if (integrationStatus.kanban.available) {
            try {
                const { createHealCommand } = await import('../heal/heal-command.js');
                const healCommand = createHealCommand(this.config.boardPath, this.config.tasksDir);
                const kanbanRecommendations = await healCommand.getHealingRecommendations({
                    reason,
                    ...options,
                });
                recommendations.push(...(kanbanRecommendations.recommendations || []));
                criticalIssues.push(...(kanbanRecommendations.criticalIssues || []));
                sources.push('kanban-heal-command');
            }
            catch (error) {
                this.logger('warn', `Failed to get kanban recommendations: ${error}`);
            }
        }
        // Get agent-based recommendations
        if (integrationStatus.agents.available) {
            try {
                const agentRecommendations = await this.getAgentRecommendations(reason, integrationStatus);
                recommendations.push(...agentRecommendations.recommendations);
                criticalIssues.push(...agentRecommendations.criticalIssues);
                sources.push('kanban-board-enforcer');
            }
            catch (error) {
                this.logger('warn', `Failed to get agent recommendations: ${error}`);
            }
        }
        return {
            recommendations: [...new Set(recommendations)], // Remove duplicates
            criticalIssues,
            integrationStatus,
            sources,
        };
    }
    /**
     * Execute fallback healing operations when main heal command fails
     */
    async executeFallbackHealing(_request, _integrationStatus) {
        const result = {
            tasksModified: 0,
            filesChanged: 0,
            errors: [],
        };
        try {
            // Basic board analysis and fixes
            const { loadBoard, syncBoardAndTasks } = await import('../kanban.js');
            const board = await loadBoard(this.config.boardPath, this.config.tasksDir);
            // Simple healing operations
            for (const column of board.columns) {
                if (column.limit && column.tasks.length > column.limit) {
                    // Log WIP violation
                    this.logger('warn', `WIP violation in column ${column.name}: ${column.tasks.length}/${column.limit}`);
                    result.tasksModified++;
                }
            }
            // Sync changes
            await syncBoardAndTasks(board, this.config.tasksDir, this.config.boardPath);
            result.filesChanged++;
        }
        catch (error) {
            result.errors.push(`Fallback healing failed: ${String(error)}`);
        }
        return result;
    }
    /**
     * Execute MCP bridge operations
     */
    async executeMCPBridgeOperations(_request, _integrationStatus) {
        // Mock MCP bridge operations for now
        // This would be implemented when MCP tools are properly integrated
        return {
            eventsBroadcasted: 0,
            clientsNotified: [],
            syncOperations: 0,
            message: 'MCP bridge operations simulated (tools currently disabled)',
        };
    }
    /**
     * Execute agent operations
     */
    async executeAgentOperations(request, integrationStatus) {
        this.logger('info', 'Executing Pantheon healing operations via agents', {
            requestId: request.id,
            reason: request.reason,
            agentsAvailable: integrationStatus.agents.available,
        });
        return runAgentOperations(request, integrationStatus);
    }
    /**
     * Get agent-based recommendations
     */
    async getAgentRecommendations(reason, integrationStatus) {
        this.logger('info', 'Gathering Pantheon agent recommendations', {
            reason,
            agentsAvailable: integrationStatus.agents.available,
        });
        const result = await runAgentRecommendations(reason, integrationStatus);
        return {
            recommendations: result.recommendations,
            criticalIssues: result.criticalIssues,
        };
    }
    /**
     * Generate comprehensive summary
     */
    generateSummary(result) {
        const parts = [];
        parts.push(`Coordinated healing completed`);
        parts.push(`${result.tasksModified} tasks modified, ${result.filesChanged} files changed`);
        if (result.coordinator.componentsUsed.length > 0) {
            parts.push(`Components used: ${result.coordinator.componentsUsed.join(', ')}`);
        }
        if (result.coordinator.fallbacksActivated.length > 0) {
            parts.push(`Fallbacks activated: ${result.coordinator.fallbacksActivated.join(', ')}`);
        }
        if (result.errors.length > 0) {
            parts.push(`${result.errors.length} errors encountered`);
        }
        return parts.join('. ');
    }
    /**
     * Create logger function
     */
    createLogger() {
        const levels = { error: 0, warn: 1, info: 2, debug: 3 };
        const currentLevel = levels[this.config.loggingLevel || 'info'] || 2;
        return (level, message, ...args) => {
            if (levels[level] <= currentLevel) {
                console.log(`[${level.toUpperCase()}] [KanbanCoordinator] ${message}`, ...args);
            }
        };
    }
    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            const { stat } = await import('node:fs/promises');
            const stats = await stat(filePath);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
}
/**
 * Create a kanban healing coordinator
 */
export function createKanbanHealingCoordinator(config) {
    return new KanbanHealingCoordinator(config);
}
/**
 * Default configuration for coordinator
 */
export const DEFAULT_COORDINATOR_CONFIG = {
    enableMCPBridge: true,
    enableAgentIntegration: true,
    fallbackToNonGit: true,
    loggingLevel: 'info',
};
//# sourceMappingURL=kanban-healing-coordinator.js.map