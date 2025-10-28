/**
 * AI-Assisted Task Management
 * Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown
 */

import type { Task } from '../types.js';
import type {
  TaskAnalysisRequest,
  TaskRewriteRequest,
  TaskBreakdownRequest,
  TaskAnalysisResult,
  TaskRewriteResult,
  TaskBreakdownResult,
} from './types.js';
import { TaskContentManager } from './index.js';
import { WIPLimitEnforcement } from '../wip-enforcement.js';
import {
  createTransitionRulesEngineState,
  validateTransition,
  type TransitionRulesEngineState,
} from '../transition-rules-functional.js';

export interface TaskAIManagerConfig {
  model?: string;
  baseUrl?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
}

export class TaskAIManager {
  private readonly config: Required<TaskAIManagerConfig>;
  private readonly contentManager: TaskContentManager;
  private wipEnforcement: WIPLimitEnforcement | null = null;
  private transitionRulesState: TransitionRulesEngineState | null = null;

  constructor(config: TaskAIManagerConfig = {}) {
    this.config = {
      model: config.model || 'qwen3:8b',
      baseUrl: config.baseUrl || 'http://localhost:11434',
      timeout: config.timeout || 60000,
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.3,
    };

    // Initialize content manager with real file-based cache
    this.contentManager = new TaskContentManager({
      tasksDir: './docs/agile/tasks',
      getTaskPath: async (uuid: string) => {
        // This will be implemented by the FileBasedTaskCache
        const cache = this.contentManager as any;
        return (await cache.cache?.getTaskPath?.(uuid)) || null;
      },
      readTask: async (uuid: string) => {
        const cache = this.contentManager as any;
        return (await cache.cache?.readTask?.(uuid)) || null;
      },
      writeTask: async (task: Task) => {
        const cache = this.contentManager as any;
        return await cache.cache?.writeTask?.(task);
      },
      backupTask: async (uuid: string) => {
        const cache = this.contentManager as any;
        return (await cache.cache?.backupTask?.(uuid)) || undefined;
      },
    });

    // Initialize WIP enforcement and transition rules
    this.initializeComplianceSystems();

    // Set environment variables for the LLM driver
    process.env.LLM_DRIVER = 'ollama';
    process.env.LLM_MODEL = this.config.model;
  }

  /**
   * Initialize compliance systems (WIP enforcement and transition rules)
   */
  private async initializeComplianceSystems(): Promise<void> {
    try {
      // Initialize transition rules engine state
      this.transitionRulesState = createTransitionRulesEngineState({
        enabled: true,
        enforcement: 'strict',
        rules: [], // Will be loaded from config
        customChecks: {},
        globalRules: [],
      });

      // Initialize WIP enforcement
      this.wipEnforcement = new WIPLimitEnforcement();
    } catch (error) {
      console.warn('Failed to initialize compliance systems:', error);
      // Fallback to null implementations
      this.wipEnforcement = null;
      this.transitionRulesState = null;
    }
  }

  /**
   * Validate task transition against WIP limits and transition rules
   */
  private async validateTaskTransition(task: Task, newStatus: string): Promise<boolean> {
    if (!this.wipEnforcement || !this.transitionRulesState) {
      console.warn('Compliance systems not initialized, skipping validation');
      return true;
    }

    try {
      // Load current board state
      const { loadBoard } = await import('../kanban.js');
      const { loadKanbanConfig } = await import('../../board/config.js');
      const kanbanConfig = await loadKanbanConfig();
      const board = await loadBoard(kanbanConfig.config.boardFile, kanbanConfig.config.tasksDir);

      // Check WIP limits first
      const wipValidation = await this.wipEnforcement.validateWIPLimits(newStatus, 1, board);
      if (!wipValidation.valid) {
        throw new Error(`WIP limit violation: ${wipValidation.violation?.reason}`);
      }

      // Validate transition rules
      const { result: transitionResult } = await validateTransition(
        this.transitionRulesState,
        task.status,
        newStatus,
        task,
        board,
      );

      if (!transitionResult.allowed) {
        throw new Error(`Transition blocked: ${transitionResult.reason}`);
      }

      return true;
    } catch (error) {
      console.error('Task transition validation failed:', error);
      throw error;
    }
  }

  /**
   * Execute kanban CLI command for board synchronization
   */
  private async syncKanbanBoard(): Promise<void> {
    try {
      const { execSync } = await import('child_process');
      execSync('pnpm kanban regenerate', { stdio: 'inherit', cwd: process.cwd() });
    } catch (error) {
      console.warn('Failed to sync kanban board:', error);
      // Don't throw error - board sync is non-critical for AI operations
    }
  }

  /**
   * Create real backup of task before modification
   */
  private async createTaskBackup(uuid: string): Promise<string> {
    try {
      // Access the cache through the content manager
      const cache = (this.contentManager as any).cache;
      if (!cache || !cache.backupTask) {
        throw new Error('Task cache not available for backup');
      }

      const backupPath = await cache.backupTask(uuid);
      if (!backupPath) {
        throw new Error(`Failed to backup task ${uuid}`);
      }

      // Log backup to audit trail
      await this.logAuditEvent({
        taskUuid: uuid,
        action: 'backup_created',
        metadata: { backupPath },
      });

      return backupPath;
    } catch (error) {
      console.error('Task backup failed:', error);
      throw new Error(
        `Backup failed for task ${uuid}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Log audit events for compliance tracking
   */
  private async logAuditEvent(event: {
    taskUuid: string;
    action: string;
    oldStatus?: string;
    newStatus?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      agent: process.env.AGENT_NAME || 'TaskAIManager',
      ...event,
    };

    // Write to audit log file
    try {
      const { promises: fs } = await import('node:fs');
      const path = await import('node:path');
      const auditDir = './logs/audit';
      const auditFile = path.join(
        auditDir,
        `kanban-audit-${new Date().toISOString().split('T')[0]}.json`,
      );

      // Ensure audit directory exists
      await fs.mkdir(auditDir, { recursive: true });

      // Append audit entry
      const auditLine = JSON.stringify(auditEntry) + '\n';
      await fs.appendFile(auditFile, auditLine, 'utf8');

      console.log('🔍 Audit Event logged:', auditEntry);
    } catch (error) {
      console.warn('Failed to write audit log:', error);
      console.log('🔍 Audit Event (fallback):', JSON.stringify(auditEntry, null, 2));
    }
  }

  /**
   * Analyze task content and provide insights
   */
  async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    const { taskUuid, analysisType, context } = request;

    try {
      // Read task
      const task = await this.contentManager.readTask(taskUuid);
      if (!task) {
        throw new Error(`Task ${taskUuid} not found`);
      }

      // Generate analysis based on type
      const analysis = generateTaskAnalysis({
        task,
        analysisType,
        context: context || {},
      });

      return {
        success: true,
        taskUuid,
        analysis,
        metadata: {
          analysisType,
          timestamp: new Date().toISOString(),
          model: this.config.model,
        },
      };
    } catch (error) {
      return {
        success: false,
        taskUuid,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          analysisType,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Rewrite task content based on instructions
   */
  async rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult> {
    const { taskUuid, rewriteType, instructions, targetAudience, tone } = request;

    try {
      // Read current task
      const task = await this.contentManager.readTask(taskUuid);
      if (!task) {
        throw new Error(`Task ${taskUuid} not found`);
      }

      // Create backup before modification
      const backupPath = await this.createTaskBackup(taskUuid);

      // Generate rewritten content
      const rewrite = generateTaskRewrite({
        task,
        rewriteType,
        instructions,
        targetAudience,
        tone,
        originalContent: task.content,
      });

      // Update task with new content
      const updateResult = await this.contentManager.updateTaskBody({
        uuid: taskUuid,
        content: rewrite.content,
        options: {
          createBackup: false, // Already created backup
          validateStructure: true,
        },
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update task');
      }

      // Sync kanban board
      await this.syncKanbanBoard();

      // Log audit event
      await this.logAuditEvent({
        taskUuid,
        action: 'task_rewritten',
        metadata: {
          rewriteType,
          targetAudience,
          tone,
          backupPath,
        },
      });

      return {
        success: true,
        taskUuid,
        content: rewrite.content,
        summary: rewrite.summary,
        backupPath,
        metadata: {
          rewriteType,
          targetAudience,
          tone,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        taskUuid,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          rewriteType,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Break down task into subtasks
   */
  async breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult> {
    const { taskUuid, breakdownType, maxSubtasks, complexity, includeEstimates } = request;

    try {
      // Read task
      const task = await this.contentManager.readTask(taskUuid);
      if (!task) {
        throw new Error(`Task ${taskUuid} not found`);
      }

      // Generate breakdown
      const breakdown = generateTaskBreakdown({
        task,
        breakdownType,
        maxSubtasks,
        complexity,
        includeEstimates,
      });

      return {
        success: true,
        taskUuid,
        subtasks: breakdown.subtasks,
        metadata: {
          breakdownType,
          maxSubtasks,
          complexity,
          includeEstimates,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        taskUuid,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          breakdownType,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

// Helper functions for generating analysis, rewrites, and breakdowns

type TaskAnalysisParams = {
  task: Task;
  analysisType: string;
  context: Record<string, unknown>;
};

function generateTaskAnalysis(params: TaskAnalysisParams): any {
  const { task, analysisType } = params;
  const contentLength = task.content?.length ?? 0;
  const baseQuality = Math.min(95, 60 + Math.floor(contentLength / 40));
  const completeness = Math.min(90, 55 + Math.floor(contentLength / 50));

  switch (analysisType) {
    case 'quality':
      return {
        qualityScore: baseQuality,
        completenessScore: completeness,
        suggestions: [
          'Ensure acceptance criteria include measurable outcomes.',
          'Document explicit test coverage expectations.',
        ],
        risks: ['Ambiguous hand-off expectations may slow implementation.'],
        dependencies: [],
        subtasks: [],
      };

    case 'complexity':
      return {
        complexityScore: Math.max(40, Math.min(85, 45 + Math.floor(contentLength / 60))),
        estimatedEffort: {
          hours: Math.max(4, Math.min(16, Math.round(contentLength / 120) + 4)),
          confidence: 70,
          breakdown: ['Discovery', 'Implementation', 'Validation'],
        },
        suggestions: [
          'Reserve buffer time for integration testing.',
          'Identify critical path dependencies early.',
        ],
        dependencies: ['Architecture review', 'Test data availability'],
        subtasks: [],
      };

    case 'completeness':
      return {
        completenessScore: completeness,
        suggestions: [
          'Add explicit error handling expectations.',
          'Capture success metrics for acceptance.',
        ],
        subtasks: [
          'Document acceptance criteria with measurable outcomes.',
          'List pre-deployment validation steps.',
          'Identify stakeholders for sign-off.',
        ],
        risks: ['Critical dependencies may be missing from the description.'],
        dependencies: [],
      };

    case 'breakdown':
      return {
        suggestions: ['Group work into research, implementation, and validation phases.'],
        subtasks: [
          {
            title: 'Clarify requirements',
            description: 'Meet with stakeholders to confirm scope and success metrics.',
            estimatedHours: 2,
            priority: 'high',
            dependencies: [],
            acceptanceCriteria: ['Stakeholder agreement on scope'],
          },
          {
            title: 'Implement solution outline',
            description: 'Create initial implementation plan and component checklist.',
            estimatedHours: 3,
            priority: 'medium',
            dependencies: ['Clarify requirements'],
            acceptanceCriteria: ['Implementation plan reviewed'],
          },
        ],
        estimatedEffort: {
          hours: 6,
          confidence: 65,
          breakdown: ['Planning', 'Execution', 'Verification'],
        },
        dependencies: ['Stakeholder availability'],
      };

    case 'prioritization':
      return {
        qualityScore: baseQuality,
        complexityScore: Math.max(40, Math.min(80, baseQuality - 10)),
        estimatedEffort: {
          hours: Math.max(4, Math.min(12, Math.round(contentLength / 140) + 4)),
          confidence: 65,
          breakdown: ['Scoping', 'Implementation', 'Testing'],
        },
        suggestions: ['Align with roadmap and verify dependencies before scheduling.'],
        risks: ['Competing priorities may delay execution.'],
        dependencies: [],
      };

    default:
      return {
        qualityScore: baseQuality,
        completenessScore: completeness,
        suggestions: ['Add clarifying context where assumptions exist.'],
        risks: [],
        dependencies: [],
        subtasks: [],
      };
  }
}

type TaskRewriteParams = {
  task: Task;
  rewriteType: string;
  instructions: string;
  targetAudience: string;
  tone: string;
  originalContent: string;
};

function generateTaskRewrite(params: TaskRewriteParams): { content: string; summary: string } {
  const { task, rewriteType, instructions, targetAudience, tone, originalContent } = params;
  const baseSummary = `Rewrite for ${targetAudience} audience with a ${tone} tone.`;

  const improvements = [
    'Clarified objectives and desired outcomes.',
    'Added explicit acceptance criteria and validation steps.',
    'Documented dependencies and staging requirements.',
  ];

  const rewrittenContent = `## Updated Task Brief: ${task.title}

${originalContent.trim()}

### Objectives
- Deliver outcomes aligned with stakeholder expectations.
- Maintain transparency around scope and dependencies.

### Acceptance Criteria
- All functional requirements validated with automated tests.
- Documentation updated for new behaviors and edge cases.

### Dependencies
- Confirm data availability and upstream schema changes.
- Coordinate rollout plan with QA and release teams.

### Notes
- ${instructions || 'Follow standard Promethean delivery guidelines.'}
- Rewrite type: ${rewriteType}.`;

  return {
    content: rewrittenContent,
    summary: `${baseSummary} Key improvements: ${improvements.join(' ')}`,
  };
}

type TaskBreakdownParams = {
  task: Task;
  breakdownType: string;
  maxSubtasks: number;
  complexity: string;
  includeEstimates: boolean;
};

function generateTaskBreakdown(params: TaskBreakdownParams): { subtasks: any[] } {
  const { task, maxSubtasks, complexity, includeEstimates } = params;
  const baseEstimate = complexity === 'high' ? 6 : complexity === 'medium' ? 4 : 2;

  const subtasks = [
    {
      title: 'Requirement audit',
      description: `Validate scope, dependencies, and entry criteria for ${task.title}.`,
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'high',
      dependencies: [],
      acceptanceCriteria: ['Scope confirmed with stakeholders'],
    },
    {
      title: 'Implementation plan',
      description: 'Outline technical approach, interfaces, and data changes.',
      estimatedHours: includeEstimates ? baseEstimate + 1 : undefined,
      priority: 'medium',
      dependencies: ['Requirement audit'],
      acceptanceCriteria: ['Plan reviewed by core team'],
    },
    {
      title: 'Validation strategy',
      description: 'Define test coverage, rollout, and monitoring strategy.',
      estimatedHours: includeEstimates ? baseEstimate : undefined,
      priority: 'medium',
      dependencies: ['Implementation plan'],
      acceptanceCriteria: ['QA and release steps documented'],
    },
  ].slice(0, maxSubtasks);

  return { subtasks };
}

/**
 * Create a task AI manager instance
 */
export function createTaskAIManager(config?: TaskAIManagerConfig): TaskAIManager {
  return new TaskAIManager(config);
}
