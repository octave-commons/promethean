/**
 * Crisis Coordinator
 * Emergency system coordination for agent crisis management
 */

import { CrisisMessage, CrisisResolution, CrisisAction, CrisisMessageType } from '../core/types';
import { EmergencyCrisisSystem } from '../adapters/protocol-adapter';

// ============================================================================
// Crisis Coordinator
// ============================================================================

export class CrisisCoordinator {
  private activeCrises = new Map<string, CrisisResolution>();
  private agentRegistry = new Map<string, AgentInfo>();
  private emergencySystem = new EmergencyCrisisSystem();
  private eventListeners = new Map<string, Function[]>();

  constructor() {
    this.initializeDefaultAgents();
  }

  // ============================================================================
  // Crisis Management
  // ============================================================================

  async handleCrisisMessage(crisis: CrisisMessage): Promise<CrisisResolution> {
    console.log(`[CRISIS COORDINATOR] Handling crisis: ${crisis.type} (${crisis.level})`);

    const resolution: CrisisResolution = {
      crisisId: crisis.id,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      actions: [],
    };

    this.activeCrises.set(crisis.id, resolution);
    this.emitEvent('crisis_started', { crisis, resolution });

    try {
      resolution.status = 'in_progress';

      // Handle different crisis types
      switch (crisis.type) {
        case CrisisMessageType.DUPLICATE_TASKS:
          await this.handleDuplicateTasksCrisis(crisis, resolution);
          break;
        case CrisisMessageType.SECURITY_VALIDATION:
          await this.handleSecurityValidationCrisis(crisis, resolution);
          break;
        case CrisisMessageType.DEPLOYMENT_SYNC:
          await this.handleDeploymentSyncCrisis(crisis, resolution);
          break;
        case CrisisMessageType.BOARD_MANAGEMENT:
          await this.handleBoardManagementCrisis(crisis, resolution);
          break;
        case CrisisMessageType.TASK_PRIORITIZATION:
          await this.handleTaskPrioritizationCrisis(crisis, resolution);
          break;
        case CrisisMessageType.AGENT_OVERLOAD:
          await this.handleAgentOverloadCrisis(crisis, resolution);
          break;
        case CrisisMessageType.RESOURCE_CONTENTION:
          await this.handleResourceContentionCrisis(crisis, resolution);
          break;
        default:
          await this.handleGenericCrisis(crisis, resolution);
      }

      resolution.status = 'resolved';
      resolution.endTime = new Date().toISOString();
      resolution.progress = 100;

      console.log(`[CRISIS COORDINATOR] Crisis resolved: ${crisis.id}`);
      this.emitEvent('crisis_resolved', { crisis, resolution });
    } catch (error) {
      resolution.status = 'failed';
      resolution.endTime = new Date().toISOString();
      console.error(`[CRISIS COORDINATOR] Crisis failed: ${crisis.id}`, error);
      this.emitEvent('crisis_failed', { crisis, resolution, error });
    }

    return resolution;
  }

  // ============================================================================
  // Specific Crisis Handlers
  // ============================================================================

  private async handleDuplicateTasksCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling duplicate tasks crisis`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'consolidate_duplicates',
      agentId: 'task-consolidator',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate duplicate task consolidation
      const result = await this.emergencySystem.consolidateDuplicateTasks(crisis.coordinationId);

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = result;

      resolution.results = {
        tasksConsolidated: result.reduction,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: result.timeSavings,
        resourcesAllocated: 0,
        issuesResolved: result.reduction,
      };

      console.log(`[CRISIS] Consolidated ${result.reduction} duplicate tasks`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async handleSecurityValidationCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling security validation crisis`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'security_validation',
      agentId: 'security-specialist',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate security validation
      await this.simulateSecurityValidation();

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = { securityValidated: true, vulnerabilitiesFixed: 5 };

      resolution.results = {
        tasksConsolidated: 0,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: 30,
        resourcesAllocated: 2,
        issuesResolved: 5,
      };

      console.log(`[CRISIS] Security validation completed`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async handleDeploymentSyncCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling deployment sync crisis`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'deployment_sync',
      agentId: 'devops-orchestrator',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate deployment synchronization
      await this.simulateDeploymentSync();

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = { deploymentsSynced: 3, rollbackPrepared: true };

      resolution.results = {
        tasksConsolidated: 0,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: 45,
        resourcesAllocated: 4,
        issuesResolved: 3,
      };

      console.log(`[CRISIS] Deployment sync completed`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async handleBoardManagementCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling board management crisis`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'board_management',
      agentId: 'kanban-process-enforcer',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate board management
      await this.simulateBoardManagement();

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = { boardCleaned: true, columnsUpdated: 5 };

      resolution.results = {
        tasksConsolidated: 0,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: 60,
        resourcesAllocated: 1,
        issuesResolved: 1,
      };

      console.log(`[CRISIS] Board management completed`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async handleTaskPrioritizationCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling task prioritization crisis`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'task_prioritization',
      agentId: 'work-prioritizer',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate task prioritization
      await this.simulateTaskPrioritization();

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = { tasksReprioritized: 25, backlogUpdated: true };

      resolution.results = {
        tasksConsolidated: 0,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: 90,
        resourcesAllocated: 2,
        issuesResolved: 25,
      };

      console.log(`[CRISIS] Task prioritization completed`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async handleAgentOverloadCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling agent overload crisis`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'workload_redistribution',
      agentId: 'async-process-manager',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate workload redistribution
      const tasks = this.getOverloadedAgentTasks();
      const result = await this.emergencySystem.distributeWorkload(crisis.coordinationId, tasks);

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = result;

      resolution.results = {
        tasksConsolidated: 0,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: result.assignedTasks * 2,
        resourcesAllocated: 3,
        issuesResolved: result.assignedTasks,
      };

      console.log(`[CRISIS] Workload redistributed: ${result.assignedTasks}/${result.totalTasks}`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async handleResourceContentionCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling resource contention crisis`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'resource_allocation',
      agentId: 'resource-manager',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate resource allocation
      await this.simulateResourceAllocation();

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = { resourcesAllocated: 8, contentionResolved: true };

      resolution.results = {
        tasksConsolidated: 0,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: 15,
        resourcesAllocated: 8,
        issuesResolved: 1,
      };

      console.log(`[CRISIS] Resource contention resolved`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async handleGenericCrisis(
    crisis: CrisisMessage,
    resolution: CrisisResolution,
  ): Promise<void> {
    console.log(`[CRISIS] Handling generic crisis: ${crisis.type}`);

    const action: CrisisAction = {
      id: this.generateActionId(),
      type: 'generic_handling',
      agentId: 'crisis-handler',
      status: 'in_progress',
      startTime: new Date().toISOString(),
    };

    resolution.actions.push(action);

    try {
      // Simulate generic crisis handling
      await this.simulateGenericHandling(crisis);

      action.status = 'completed';
      action.endTime = new Date().toISOString();
      action.result = { crisisHandled: true };

      resolution.results = {
        tasksConsolidated: 0,
        agentsCoordinated: crisis.affectedAgents.length,
        timeSavings: 30,
        resourcesAllocated: 2,
        issuesResolved: 1,
      };

      console.log(`[CRISIS] Generic crisis handling completed`);
    } catch (error) {
      action.status = 'failed';
      action.endTime = new Date().toISOString();
      action.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  // ============================================================================
  // Agent Management
  // ============================================================================

  private initializeDefaultAgents(): void {
    const defaultAgents = [
      'security-specialist',
      'code-reviewer',
      'task-architect',
      'work-prioritizer',
      'devops-orchestrator',
      'process-debugger',
      'kanban-process-enforcer',
      'task-consolidator',
      'frontend-specialist',
      'fullstack-developer',
      'typescript-build-fixer',
      'performance-engineer',
      'integration-tester',
      'tdd-cycle-implementer',
      'ux-specialist',
      'code-documenter',
      'async-process-manager',
      'llm-stack-optimizer',
    ];

    for (const agentId of defaultAgents) {
      this.agentRegistry.set(agentId, {
        id: agentId,
        type: this.getAgentType(agentId),
        namespace: 'system',
        domain: this.getAgentDomain(agentId),
        status: 'available',
        lastSeen: new Date().toISOString(),
        capabilities: this.getAgentCapabilities(agentId),
      });
    }
  }

  private getAgentType(agentId: string): string {
    if (agentId.includes('specialist')) return 'specialist';
    if (agentId.includes('orchestrator')) return 'orchestrator';
    if (agentId.includes('manager')) return 'manager';
    if (agentId.includes('coordinator')) return 'coordinator';
    return 'agent';
  }

  private getAgentDomain(agentId: string): string {
    if (agentId.includes('security')) return 'security';
    if (agentId.includes('devops')) return 'deployment';
    if (agentId.includes('task')) return 'tasks';
    if (agentId.includes('board')) return 'board';
    if (agentId.includes('frontend')) return 'frontend';
    if (agentId.includes('performance')) return 'performance';
    if (agentId.includes('test')) return 'testing';
    if (agentId.includes('ux')) return 'design';
    if (agentId.includes('doc')) return 'documentation';
    return 'general';
  }

  private getAgentCapabilities(agentId: string): string[] {
    const capabilities: string[] = ['basic_communication'];

    if (agentId.includes('security'))
      capabilities.push('security_validation', 'vulnerability_scanning');
    if (agentId.includes('code')) capabilities.push('code_review', 'static_analysis');
    if (agentId.includes('task')) capabilities.push('task_management', 'prioritization');
    if (agentId.includes('devops')) capabilities.push('deployment', 'infrastructure');
    if (agentId.includes('board')) capabilities.push('board_management', 'process_enforcement');
    if (agentId.includes('frontend')) capabilities.push('ui_development', 'user_experience');
    if (agentId.includes('performance')) capabilities.push('optimization', 'monitoring');
    if (agentId.includes('test')) capabilities.push('testing', 'quality_assurance');
    if (agentId.includes('doc')) capabilities.push('documentation', 'knowledge_management');

    return capabilities;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private getOverloadedAgentTasks(): any[] {
    // Simulate getting tasks from overloaded agents
    return Array.from({ length: 20 }, (_, i) => ({
      id: `task_${i}`,
      agentId: 'overloaded_agent',
      priority: i < 5 ? 'high' : 'normal',
      estimatedTime: Math.floor(Math.random() * 60) + 10,
    }));
  }

  private async simulateSecurityValidation(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  private async simulateDeploymentSync(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  private async simulateBoardManagement(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async simulateTaskPrioritization(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  private async simulateResourceAllocation(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  private async simulateGenericHandling(_crisis: CrisisMessage): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  // ============================================================================
  // Event Management
  // ============================================================================

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[CRISIS COORDINATOR] Event listener error:`, error);
        }
      });
    }
  }

  // Public method for testing
  emit(event: string, data: any): void {
    this.emitEvent(event, data);
  }

  // ============================================================================
  // Status and Monitoring
  // ============================================================================

  getActiveCrises(): CrisisResolution[] {
    return Array.from(this.activeCrises.values());
  }

  getCrisis(crisisId: string): CrisisResolution | undefined {
    return this.activeCrises.get(crisisId);
  }

  getAgentInfo(agentId: string): AgentInfo | undefined {
    return this.agentRegistry.get(agentId);
  }

  getAllAgents(): AgentInfo[] {
    return Array.from(this.agentRegistry.values());
  }

  getSystemStatus(): SystemStatus {
    const activeCrises = this.getActiveCrises();
    const totalAgents = this.agentRegistry.size;
    const availableAgents = Array.from(this.agentRegistry.values()).filter(
      (agent) => agent.status === 'available',
    ).length;

    return {
      totalAgents,
      availableAgents,
      activeCrises: activeCrises.length,
      resolvedCrises: activeCrises.filter((c) => c.status === 'resolved').length,
      failedCrises: activeCrises.filter((c) => c.status === 'failed').length,
      systemHealth: availableAgents > totalAgents * 0.8 ? 'healthy' : 'degraded',
    };
  }
}

// ============================================================================
// Supporting Types
// ============================================================================

interface AgentInfo {
  id: string;
  type: string;
  namespace: string;
  domain: string;
  status: 'available' | 'busy' | 'offline';
  lastSeen: string;
  capabilities: string[];
}

interface SystemStatus {
  totalAgents: number;
  availableAgents: number;
  activeCrises: number;
  resolvedCrises: number;
  failedCrises: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}
