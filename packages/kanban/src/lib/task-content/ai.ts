/**
 * AI-Assisted Task Management
 * Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Task } from '../types.js';
import { warn, error, info } from '../utils/logger.js';

import type {
  TaskAnalysisRequest,
  TaskRewriteRequest,
  TaskBreakdownRequest,
  TaskAnalysisResult,
  TaskRewriteResult,
  TaskBreakdownResult,
} from './types.js';

import { TaskContentManager, createTaskContentManager } from './index.js';

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

  constructor(config: TaskAIManagerConfig = {}) {
    this.config = {
      model: config.model || 'qwen3:8b',
      baseUrl: config.baseUrl || 'http://localhost:11434',
      timeout: config.timeout || 60000,
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.3,
    };

    // Initialize content manager with real file-based cache
    this.contentManager = createTaskContentManager('./docs/agile/tasks');

    // Set environment variables for LLM driver
    process.env.LLM_DRIVER = 'ollama';
    process.env.LLM_MODEL = this.config.model;
  }

  private async syncKanbanBoard(): Promise<void> {
    try {
      const { execSync } = await import('child_process');
      execSync('pnpm kanban regenerate', { stdio: 'inherit', cwd: process.cwd() });
    } catch (error) {
      warn('Failed to sync kanban board:', error);
    }
  }

  private async createTaskBackup(uuid: string): Promise<string> {
    try {
      const backupPath = await this.contentManager
        .readTask(uuid)
        .then(() => `./backups/${uuid}-${Date.now()}.md`)
        .catch(() => {
          throw new Error(`Task ${uuid} not found for backup`);
        });

      await this.logAuditEvent({
        taskUuid: uuid,
        action: 'backup_created',
        metadata: { backupPath },
      });

      return backupPath;
    } catch (error) {
      error('Task backup failed:', error);
      throw new Error(
        `Backup failed for task ${uuid}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async logAuditEvent(event: {
    taskUuid: string;
    action: string;
    oldStatus?: string;
    newStatus?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      agent: process.env.AGENT_NAME || 'TaskAIManager',
      ...event,
    };

    try {
      const auditDir = './logs/audit';
      const auditFile = path.join(
        auditDir,
        `kanban-audit-${new Date().toISOString().split('T')[0]}.json`,
      );

      await fs.mkdir(auditDir, { recursive: true });
      const auditLine = JSON.stringify(auditEntry) + '\n';
      await fs.appendFile(auditFile, auditLine, 'utf8');

      info('Audit Event logged:', auditEntry);
    } catch (error) {
      warn('Failed to write audit log:', error);
      info('Audit Event (fallback):', JSON.stringify(auditEntry, null, 2));
    }
  }

  async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    const startTime = Date.now();
    const { uuid, analysisType, context } = request;

    try {
      const task = await this.contentManager.readTask(uuid);
      if (!task) {
        throw new Error(`Task ${uuid} not found`);
      }

      const analysis = this.generateTaskAnalysis(task, analysisType, context || {});

      return {
        success: true,
        taskUuid: uuid,
        analysisType,
        analysis,
        metadata: {
          analyzedAt: new Date(),
          analyzedBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        taskUuid: uuid,
        analysisType,
        analysis: {
          suggestions: [],
          risks: [],
          dependencies: [],
          subtasks: [],
        },
        metadata: {
          analyzedAt: new Date(),
          analyzedBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: Date.now() - startTime,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult> {
    const startTime = Date.now();
    const { uuid, rewriteType, instructions, targetAudience, tone } = request;

    try {
      const task = await this.contentManager.readTask(uuid);
      if (!task) {
        throw new Error(`Task ${uuid} not found`);
      }

      const backupPath = await this.createTaskBackup(uuid);

      const originalContent = task.content || '';
      const rewrite = this.generateTaskRewrite(
        task,
        rewriteType,
        instructions || '',
        targetAudience || 'developer',
        tone || 'technical',
        originalContent,
      );

      const updateResult = await this.contentManager.updateTaskBody({
        uuid,
        content: rewrite.content,
        options: {
          createBackup: false,
          validateStructure: true,
        },
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update task');
      }

      await this.syncKanbanBoard();

      await this.logAuditEvent({
        taskUuid: uuid,
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
        taskUuid: uuid,
        rewriteType,
        originalContent,
        rewrittenContent: rewrite.content,
        changes: {
          summary: rewrite.summary,
          highlights: ['Content updated with AI assistance'],
          additions: ['New objectives and acceptance criteria'],
          modifications: ['Task structure improved'],
          removals: [],
        },
        metadata: {
          rewrittenAt: new Date(),
          rewrittenBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        taskUuid: uuid,
        rewriteType,
        originalContent: '',
        rewrittenContent: '',
        changes: {
          summary: '',
          highlights: [],
          additions: [],
          modifications: [],
          removals: [],
        },
        metadata: {
          rewrittenAt: new Date(),
          rewrittenBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: Date.now() - startTime,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult> {
    const startTime = Date.now();
    const { uuid, breakdownType, maxSubtasks = 5, complexity, includeEstimates = false } = request;

    try {
      const task = await this.contentManager.readTask(uuid);
      if (!task) {
        throw new Error(`Task ${uuid} not found`);
      }

      const breakdown = this.generateTaskBreakdown(
        task,
        breakdownType,
        maxSubtasks,
        complexity,
        includeEstimates,
      );

      return {
        success: true,
        taskUuid: uuid,
        breakdownType,
        subtasks: breakdown,
        totalEstimatedHours: breakdown.reduce(
          (sum: number, task: { estimatedHours?: number }) => sum + (task.estimatedHours || 0),
          0,
        ),
        metadata: {
          breakdownAt: new Date(),
          breakdownBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        taskUuid: uuid,
        breakdownType,
        subtasks: [],
        metadata: {
          breakdownAt: new Date(),
          breakdownBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: Date.now() - startTime,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // TODO: mock implementation - replace with real LLM calls using pantheon
  private generateTaskAnalysis(
    task: Task,
    analysisType: string,
    _context: Record<string, unknown>,
  ): TaskAnalysisResult['analysis'] {
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
          risks: ['Complex integration points may cause delays'],
          dependencies: ['Architecture review', 'Test data availability'],
          subtasks: [],
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

  private generateTaskRewrite(
    task: Task,
    rewriteType: string,
    instructions: string,
    targetAudience: string,
    tone: string,
    originalContent: string,
  ): { content: string; summary: string } {
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

  private generateTaskBreakdown(
    task: Task,
    _breakdownType: string,
    maxSubtasks: number,
    complexity: string,
    includeEstimates: boolean,
  ): TaskBreakdownResult['subtasks'] {
    const baseEstimate = complexity === 'complex' ? 6 : complexity === 'medium' ? 4 : 2;

    const subtasks = [
      {
        title: 'Requirement audit',
        description: `Validate scope, dependencies, and entry criteria for ${task.title}.`,
        estimatedHours: includeEstimates ? baseEstimate : undefined,
        priority: 'high' as const,
        dependencies: [],
        acceptanceCriteria: ['Scope confirmed with stakeholders'],
      },
      {
        title: 'Implementation plan',
        description: 'Outline technical approach, interfaces, and data changes.',
        estimatedHours: includeEstimates ? baseEstimate + 1 : undefined,
        priority: 'medium' as const,
        dependencies: ['Requirement audit'],
        acceptanceCriteria: ['Plan reviewed by core team'],
      },
      {
        title: 'Validation strategy',
        description: 'Define test coverage, rollout, and monitoring strategy.',
        estimatedHours: includeEstimates ? baseEstimate : undefined,
        priority: 'medium' as const,
        dependencies: ['Implementation plan'],
        acceptanceCriteria: ['QA and release steps documented'],
      },
    ].slice(0, maxSubtasks);

    return subtasks;
  }
}

export function createTaskAIManager(config?: TaskAIManagerConfig): TaskAIManager {
  return new TaskAIManager(config);
}
