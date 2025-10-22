import { EventEmitter } from 'events';

export interface CoordinationIssue {
  id: string;
  type:
    | 'offline_agents'
    | 'low_security_scores'
    | 'active_threats'
    | 'communication_failure'
    | 'resource_exhaustion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedAgents: string[];
  timestamp: Date;
  resolved: boolean;
  resolutionAttempts: number;
}

export interface CoordinationTask {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

export class CoordinationManager extends EventEmitter {
  private issues: Map<string, CoordinationIssue> = new Map();
  private tasks: Map<string, CoordinationTask> = new Map();
  private active: boolean = false;

  constructor() {
    super();
  }

  async start(): Promise<void> {
    if (this.active) {
      return;
    }

    console.log('🔄 Starting Coordination Manager...');
    this.active = true;

    // Start periodic coordination checks
    setInterval(async () => {
      await this.performCoordinationCheck();
    }, 120000); // Every 2 minutes

    console.log('✅ Coordination Manager started');
    this.emit('coordinationManagerStarted');
  }

  async shutdown(): Promise<void> {
    if (!this.active) {
      return;
    }

    console.log('🛑 Shutting down Coordination Manager...');
    this.active = false;

    console.log('✅ Coordination Manager shutdown complete');
    this.emit('coordinationManagerStopped');
  }

  async handleOfflineAgents(count: number): Promise<void> {
    const issue: CoordinationIssue = {
      id: this.generateIssueId(),
      type: 'offline_agents',
      severity: count > 5 ? 'critical' : count > 2 ? 'high' : 'medium',
      description: `${count} security agents are offline`,
      affectedAgents: [], // Would be populated with actual agent IDs
      timestamp: new Date(),
      resolved: false,
      resolutionAttempts: 0,
    };

    this.issues.set(issue.id, issue);
    this.emit('coordinationIssue', issue);

    // Create coordination task
    await this.createCoordinationTask({
      type: 'agent_recovery',
      description: `Recover ${count} offline security agents`,
      priority: issue.severity,
      relatedIssueId: issue.id,
    });

    console.log(`⚠️ Coordination issue: ${issue.description}`);
  }

  async handleLowSecurityScores(count: number): Promise<void> {
    const issue: CoordinationIssue = {
      id: this.generateIssueId(),
      type: 'low_security_scores',
      severity: count > 3 ? 'critical' : count > 1 ? 'high' : 'medium',
      description: `${count} agents have low security scores (< 7.0)`,
      affectedAgents: [],
      timestamp: new Date(),
      resolved: false,
      resolutionAttempts: 0,
    };

    this.issues.set(issue.id, issue);
    this.emit('coordinationIssue', issue);

    await this.createCoordinationTask({
      type: 'security_improvement',
      description: `Improve security scores for ${count} agents`,
      priority: issue.severity,
      relatedIssueId: issue.id,
    });

    console.log(`⚠️ Coordination issue: ${issue.description}`);
  }

  async handleActiveThreats(count: number): Promise<void> {
    const issue: CoordinationIssue = {
      id: this.generateIssueId(),
      type: 'active_threats',
      severity: count > 5 ? 'critical' : count > 2 ? 'high' : 'medium',
      description: `${count} active security threats detected`,
      affectedAgents: [],
      timestamp: new Date(),
      resolved: false,
      resolutionAttempts: 0,
    };

    this.issues.set(issue.id, issue);
    this.emit('coordinationIssue', issue);

    await this.createCoordinationTask({
      type: 'threat_response',
      description: `Respond to ${count} active security threats`,
      priority: issue.severity,
      relatedIssueId: issue.id,
    });

    console.log(`🚨 Coordination issue: ${issue.description}`);
  }

  async createCoordinationTask(params: {
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    relatedIssueId?: string;
  }): Promise<string> {
    const task: CoordinationTask = {
      id: this.generateTaskId(),
      type: params.type,
      description: params.description,
      status: 'pending',
      priority: params.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    this.emit('taskCreated', task);

    console.log(`📋 Coordination task created: ${task.description}`);
    return task.id;
  }

  async updateTaskStatus(taskId: string, status: CoordinationTask['status']): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = status;
    task.updatedAt = new Date();

    this.emit('taskUpdated', task);
    console.log(`📋 Task ${taskId} updated to ${status}`);
  }

  async resolveIssue(issueId: string): Promise<void> {
    const issue = this.issues.get(issueId);
    if (!issue) {
      throw new Error(`Issue ${issueId} not found`);
    }

    issue.resolved = true;
    this.emit('issueResolved', issue);

    console.log(`✅ Coordination issue resolved: ${issue.description}`);
  }

  getActiveIssues(): CoordinationIssue[] {
    return Array.from(this.issues.values()).filter((issue) => !issue.resolved);
  }

  getActiveTasks(): string[] {
    return Array.from(this.tasks.values())
      .filter((task) => task.status === 'pending' || task.status === 'in_progress')
      .map((task) => task.id);
  }

  getTasksByPriority(priority: CoordinationTask['priority']): CoordinationTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) =>
        task.priority === priority && (task.status === 'pending' || task.status === 'in_progress'),
    );
  }

  private async performCoordinationCheck(): Promise<void> {
    try {
      // Check for stuck tasks
      const stuckTasks = Array.from(this.tasks.values()).filter((task) => {
        const timeSinceCreation = Date.now() - task.createdAt.getTime();
        return (
          (task.status === 'pending' || task.status === 'in_progress') && timeSinceCreation > 300000
        ); // 5 minutes
      });

      for (const task of stuckTasks) {
        console.log(`⚠️ Task ${task.id} appears to be stuck`);
        this.emit('taskStuck', task);
      }

      // Check for unresolved issues
      const unresolvedIssues = this.getActiveIssues();
      const criticalIssues = unresolvedIssues.filter((issue) => issue.severity === 'critical');

      if (criticalIssues.length > 0) {
        console.log(`🚨 ${criticalIssues.length} critical coordination issues unresolved`);
        this.emit('criticalIssuesUnresolved', criticalIssues);
      }

      // Auto-resolve old low-priority issues
      const oldLowPriorityIssues = unresolvedIssues.filter(
        (issue) => issue.severity === 'low' && Date.now() - issue.timestamp.getTime() > 3600000, // 1 hour
      );

      for (const issue of oldLowPriorityIssues) {
        await this.resolveIssue(issue.id);
        console.log(`🔄 Auto-resolved old low-priority issue: ${issue.description}`);
      }
    } catch (error) {
      console.error('❌ Coordination check failed:', error);
      this.emit('coordinationCheckError', error);
    }
  }

  private generateIssueId(): string {
    return `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getCoordinationStatus(): {
    totalIssues: number;
    activeIssues: number;
    criticalIssues: number;
    totalTasks: number;
    activeTasks: number;
    stuckTasks: number;
  } {
    const issues = Array.from(this.issues.values());
    const tasks = Array.from(this.tasks.values());

    const activeIssues = issues.filter((i) => !i.resolved).length;
    const criticalIssues = issues.filter((i) => !i.resolved && i.severity === 'critical').length;
    const activeTasks = tasks.filter(
      (t) => t.status === 'pending' || t.status === 'in_progress',
    ).length;
    const stuckTasks = tasks.filter((t) => {
      const timeSinceCreation = Date.now() - t.createdAt.getTime();
      return (t.status === 'pending' || t.status === 'in_progress') && timeSinceCreation > 300000;
    }).length;

    return {
      totalIssues: issues.length,
      activeIssues,
      criticalIssues,
      totalTasks: tasks.length,
      activeTasks,
      stuckTasks,
    };
  }

  async getCoordinationReport(): Promise<any> {
    const status = this.getCoordinationStatus();
    const activeIssues = this.getActiveIssues();
    const activeTasks = Array.from(this.tasks.values())
      .filter((task) => task.status === 'pending' || task.status === 'in_progress')
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    return {
      timestamp: new Date(),
      status,
      activeIssues: activeIssues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        severity: issue.severity,
        description: issue.description,
        timestamp: issue.timestamp,
        resolutionAttempts: issue.resolutionAttempts,
      })),
      activeTasks: activeTasks.map((task) => ({
        id: task.id,
        type: task.type,
        description: task.description,
        priority: task.priority,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    };
  }
}
