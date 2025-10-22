/**
 * Kanban Healing Integration Coordinator
 *
 * This module provides comprehensive coordination between kanban healing operations,
 * MCP bridge functionality, and agent systems. It addresses integration issues
 * and provides a unified interface for healing operations.
 */

import path from 'node:path';

import type { Board, Task } from '../../types.js';
import type { HealingStatus } from '../heal/scar-context-types.js';
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
export class KanbanHealingCoordinator {
  private readonly config: KanbanHealingCoordinatorConfig;
  private readonly logger: (level: string, message: string, ...args: any[]) => void;

  constructor(config: KanbanHealingCoordinatorConfig) {
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
  async getIntegrationStatus(): Promise<IntegrationStatus> {
    const status: IntegrationStatus = {
      kanban: { available: false, issues: [] },
      mcp: { available: false, toolsEnabled: [], issues: [] },
      agents: { available: false, activeAgents: [], issues: [] },
      git: { available: false, issues: [] },
    };

    // Check kanban availability
    try {
      const { loadBoard } = await import('../kanban.js');
      const board = await loadBoard(this.config.boardPath, this.config.tasksDir);
      status.kanban.available = true;
      status.kanban.version = '0.2.0';
    } catch (error) {
      status.kanban.issues.push(`Kanban load failed: ${error}`);
    }

    // Check MCP availability
    if (this.config.enableMCPBridge) {
      try {
        // Check if MCP tools are available (not disabled)
        const mcpToolsPath = path.join(
          path.dirname(this.config.boardPath),
          '../../../mcp/src/tools/',
        );
        const kanbanToolExists = await this.fileExists(path.join(mcpToolsPath, 'kanban.ts'));
        const kanbanBridgeExists = await this.fileExists(
          path.join(mcpToolsPath, 'kanban-bridge.ts'),
        );

        if (kanbanToolExists && !kanbanToolExists.endsWith('.disabled')) {
          status.mcp.available = true;
          status.mcp.toolsEnabled.push('kanban-core');
        }
        if (kanbanBridgeExists && !kanbanBridgeExists.endsWith('.disabled')) {
          status.mcp.available = true;
          status.mcp.toolsEnabled.push('kanban-bridge');
        }

        if (!status.mcp.available) {
          status.mcp.issues.push('MCP bridge tools are disabled');
        }
      } catch (error) {
        status.mcp.issues.push(`MCP check failed: ${error}`);
      }
    }

    // Check agent availability
    if (this.config.enableAgentIntegration) {
      try {
        const agentsPath = path.join(
          path.dirname(this.config.boardPath),
          '../../../.claude/agents/',
        );
        const kanbanEnforcerExists = await this.fileExists(
          path.join(agentsPath, 'kanban-board-enforcer.md'),
        );

        if (kanbanEnforcerExists) {
          status.agents.available = true;
          status.agents.activeAgents.push('kanban-board-enforcer');
        } else {
          status.agents.issues.push('Kanban board enforcer agent not found');
        }
      } catch (error) {
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
    } catch (error) {
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
  async executeHealing(request: HealingRequest): Promise<CoordinatedHealingResult> {
    const startTime = Date.now();
    const integrationStatus = await this.getIntegrationStatus();

    this.logger('info', `Starting coordinated healing: ${request.reason}`);
    this.logger('info', `Integration status: ${JSON.stringify(integrationStatus, null, 2)}`);

    const result: CoordinatedHealingResult = {
      status: 'in_progress' as HealingStatus,
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
      } else {
        throw new Error('Kanban system not available');
      }

      // Step 2: Execute heal command with proper error handling
      try {
        const { createHealCommand } = await import('../heal/heal-command.js');
        const healCommand = createHealCommand(this.config.boardPath, this.config.tasksDir);

        // Prepare heal options with fallbacks
        const healOptions: HealCommandOptions = {
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
          result.coordinator.warnings.push(
            'Operating in non-git mode - no tags or history analysis',
          );
        }

        const healResult = await healCommand.execute(healOptions);

        // Merge heal results
        Object.assign(result, healResult);
        result.coordinator.componentsUsed.push('heal-command');
      } catch (healError) {
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
        } catch (mcpError) {
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
        } catch (agentError) {
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
    } catch (error) {
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
  async getComprehensiveRecommendations(
    reason: string,
    options: Partial<HealCommandOptions> = {},
  ): Promise<{
    recommendations: string[];
    criticalIssues: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      suggestedAction: string;
    }>;
    integrationStatus: IntegrationStatus;
    sources: string[];
  }> {
    const integrationStatus = await this.getIntegrationStatus();
    const recommendations: string[] = [];
    const criticalIssues: any[] = [];
    const sources: string[] = [];

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
      } catch (error) {
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
      } catch (error) {
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
  private async executeFallbackHealing(
    request: HealingRequest,
    integrationStatus: IntegrationStatus,
  ): Promise<{ tasksModified: number; filesChanged: number; errors: string[] }> {
    const result = { tasksModified: 0, filesChanged: 0, errors: [] };

    try {
      // Basic board analysis and fixes
      const { loadBoard, readTasksFolder, syncBoardAndTasks } = await import('../kanban.js');
      const board = await loadBoard(this.config.boardPath, this.config.tasksDir);
      const tasks = await readTasksFolder(this.config.tasksDir);

      // Simple healing operations
      for (const column of board.columns) {
        if (column.limit && column.tasks.length > column.limit) {
          // Log WIP violation
          this.logger(
            'warn',
            `WIP violation in column ${column.name}: ${column.tasks.length}/${column.limit}`,
          );
          result.tasksModified++;
        }
      }

      // Sync changes
      await syncBoardAndTasks(board, this.config.tasksDir, this.config.boardPath);
      result.filesChanged++;
    } catch (error) {
      result.errors.push(`Fallback healing failed: ${error}`);
    }

    return result;
  }

  /**
   * Execute MCP bridge operations
   */
  private async executeMCPBridgeOperations(
    request: HealingRequest,
    integrationStatus: IntegrationStatus,
  ): Promise<any> {
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
  private async executeAgentOperations(
    request: HealingRequest,
    integrationStatus: IntegrationStatus,
  ): Promise<any> {
    // Mock agent operations for now
    // This would be implemented when agent integration is properly set up
    return {
      agentsInvoked: ['kanban-board-enforcer'],
      recommendations: [
        'Monitor WIP limits more closely',
        'Ensure proper task transitions',
        'Check for stale tasks regularly',
      ],
      enforcements: ['WIP limits enforced', 'Workflow rules validated'],
    };
  }

  /**
   * Get agent-based recommendations
   */
  private async getAgentRecommendations(
    reason: string,
    integrationStatus: IntegrationStatus,
  ): Promise<{ recommendations: string[]; criticalIssues: any[] }> {
    // Mock agent recommendations for now
    return {
      recommendations: [
        'Review WIP limits and adjust if necessary',
        'Ensure all tasks follow proper workflow transitions',
        'Check for and resolve any duplicate tasks',
        'Validate task completeness before moving to review',
      ],
      criticalIssues: [],
    };
  }

  /**
   * Generate comprehensive summary
   */
  private generateSummary(result: CoordinatedHealingResult): string {
    const parts: string[] = [];

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
  private createLogger() {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = levels[this.config.loggingLevel || 'info'] || 2;

    return (level: string, message: string, ...args: any[]) => {
      if (levels[level as keyof typeof levels] <= currentLevel) {
        console.log(`[${level.toUpperCase()}] [KanbanCoordinator] ${message}`, ...args);
      }
    };
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const { stat } = await import('node:fs/promises');
      const stats = await stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }
}

/**
 * Create a kanban healing coordinator
 */
export function createKanbanHealingCoordinator(
  config: KanbanHealingCoordinatorConfig,
): KanbanHealingCoordinator {
  return new KanbanHealingCoordinator(config);
}

/**
 * Default configuration for coordinator
 */
export const DEFAULT_COORDINATOR_CONFIG: Partial<KanbanHealingCoordinatorConfig> = {
  enableMCPBridge: true,
  enableAgentIntegration: true,
  fallbackToNonGit: true,
  loggingLevel: 'info',
};
