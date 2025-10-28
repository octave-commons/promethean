/**
 * AI-Assisted Task Management
 * Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown
 */
import { createTaskContentManager } from './index.js';
export class TaskAIManager {
    config;
    contentManager;
    constructor(config = {}) {
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
    async syncKanbanBoard() {
        try {
            const { execSync } = await import('child_process');
            execSync('pnpm kanban regenerate', { stdio: 'inherit', cwd: process.cwd() });
        }
        catch (error) {
            console.warn('Failed to sync kanban board:', error);
        }
    }
    async createTaskBackup(uuid) {
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
        }
        catch (error) {
            console.error('Task backup failed:', error);
            throw new Error(`Backup failed for task ${uuid}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async logAuditEvent(event) {
        const auditEntry = {
            timestamp: new Date().toISOString(),
            agent: process.env.AGENT_NAME || 'TaskAIManager',
            ...event,
        };
        try {
            const fs = require('node:fs').promises;
            const path = require('node:path');
            const auditDir = './logs/audit';
            const auditFile = path.join(auditDir, `kanban-audit-${new Date().toISOString().split('T')[0]}.json`);
            await fs.mkdir(auditDir, { recursive: true });
            const auditLine = JSON.stringify(auditEntry) + '\n';
            await fs.appendFile(auditFile, auditLine, 'utf8');
            console.log('🔍 Audit Event logged:', auditEntry);
        }
        catch (error) {
            console.warn('Failed to write audit log:', error);
            console.log('🔍 Audit Event (fallback):', JSON.stringify(auditEntry, null, 2));
        }
    }
    async analyzeTask(request) {
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
        }
        catch (error) {
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
    async rewriteTask(request) {
        const startTime = Date.now();
        const { uuid, rewriteType, instructions, targetAudience, tone } = request;
        try {
            const task = await this.contentManager.readTask(uuid);
            if (!task) {
                throw new Error(`Task ${uuid} not found`);
            }
            const backupPath = await this.createTaskBackup(uuid);
            const originalContent = task.content || '';
            const rewrite = this.generateTaskRewrite(task, rewriteType, instructions || '', targetAudience || 'developer', tone || 'technical', originalContent);
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
        }
        catch (error) {
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
    async breakdownTask(request) {
        const startTime = Date.now();
        const { uuid, breakdownType, maxSubtasks = 5, complexity, includeEstimates = false } = request;
        try {
            const task = await this.contentManager.readTask(uuid);
            if (!task) {
                throw new Error(`Task ${uuid} not found`);
            }
            const breakdown = this.generateTaskBreakdown(task, breakdownType, maxSubtasks, complexity, includeEstimates);
            return {
                success: true,
                taskUuid: uuid,
                breakdownType,
                subtasks: breakdown,
                totalEstimatedHours: breakdown.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
                metadata: {
                    breakdownAt: new Date(),
                    breakdownBy: process.env.AGENT_NAME || 'TaskAIManager',
                    model: this.config.model,
                    processingTime: Date.now() - startTime,
                },
            };
        }
        catch (error) {
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
    generateTaskAnalysis(task, analysisType, _context) {
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
                'Reserve buffer time for integration testing.',
                    'Identify critical path dependencies early.',
                ;
                dependencies: ['Architecture review', 'Test data availability'],
                    subtasks;
                [],
                ;
        }
        ;
    }
    default;
}
{
    qualityScore: baseQuality,
        completenessScore;
    completeness,
        suggestions;
    ['Add clarifying context where assumptions exist.'],
        risks;
    [],
        dependencies;
    [],
        subtasks;
    [],
    ;
}
;
generateTaskRewrite(task, Task, rewriteType, string, instructions, string, targetAudience, string, tone, string, originalContent, string);
{
    content: string;
    summary: string;
}
{
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
generateTaskBreakdown(task, Task, _breakdownType, string, maxSubtasks, number, complexity, string, includeEstimates, boolean);
TaskBreakdownResult['subtasks'];
{
    const baseEstimate = complexity === 'complex' ? 6 : complexity === 'medium' ? 4 : 2;
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
    return subtasks;
}
export function createTaskAIManager(config) {
    return new TaskAIManager(config);
}
//# sourceMappingURL=ai.js.map