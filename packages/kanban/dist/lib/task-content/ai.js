/**
 * AI-Assisted Task Management
 * Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown
 */
import { TaskContentManager } from './index.js';
import { runPantheonComputation } from '../pantheon/runtime.js';
export class TaskAIManager {
    config;
    contentManager;
    constructor(config = {}) {
        this.config = {
            model: config.model || 'qwen3:8b',
            baseUrl: config.baseUrl || 'http://localhost:11434',
            timeout: config.timeout || 60000,
            maxTokens: config.maxTokens || 4096,
            temperature: config.temperature || 0.3
        };
        // Initialize content manager with a mock cache for testing
        const mockCache = {
            tasksDir: './docs/agile/tasks',
            getTaskPath: async (uuid) => {
                // Mock implementation - in real usage this would find the task file
                return `./docs/agile/tasks/${uuid}.md`;
            },
            readTask: async (uuid) => {
                // Mock task for testing
                return {
                    uuid,
                    title: `Test Task ${uuid}`,
                    status: 'todo',
                    priority: 'medium',
                    labels: [],
                    created_at: new Date().toISOString(),
                    estimates: {},
                    content: 'This is a test task for AI analysis.',
                    slug: `test-task-${uuid}`,
                    sourcePath: `./docs/agile/tasks/${uuid}.md`
                };
            },
            writeTask: async (task) => {
                console.log('Mock writing task:', task.uuid);
            },
            backupTask: async (uuid) => {
                return `./backups/${uuid}.md`;
            }
        };
        this.contentManager = new TaskContentManager(mockCache);
        // Set environment variables for the LLM driver
        process.env.LLM_DRIVER = 'ollama';
        process.env.LLM_MODEL = this.config.model;
    }
    /**
     * Analyze a task using AI to provide insights into quality, complexity, completeness, etc.
     */
    async analyzeTask(request) {
        const startTime = Date.now();
        const { uuid, analysisType, context = {}, options = {} } = request;
        try {
            // Read the current task
            const task = await this.contentManager.readTask(uuid);
            if (!task) {
                return {
                    success: false,
                    taskUuid: uuid,
                    analysisType,
                    analysis: {
                        suggestions: [],
                        risks: [],
                        dependencies: [],
                        subtasks: []
                    },
                    metadata: {
                        analyzedAt: new Date(),
                        analyzedBy: process.env.AGENT_NAME || 'unknown',
                        model: this.config.model,
                        processingTime: Date.now() - startTime
                    },
                    error: `Task ${uuid} not found`
                };
            }
            // Create backup if requested
            if (options.createBackup) {
                // Note: In real implementation, you would backup the task here
                console.log('Mock backup task:', uuid);
            }
            const analysis = await runPantheonComputation({
                actorName: 'kanban-task-analysis',
                goal: `analyze task ${task.title}`,
                compute: async () => generateTaskAnalysis({
                    task,
                    analysisType,
                    context,
                }),
            });
            // Validate and structure the analysis result
            const validatedAnalysis = this.validateAnalysisResult(analysis);
            return {
                success: true,
                taskUuid: uuid,
                analysisType,
                analysis: validatedAnalysis,
                metadata: {
                    analyzedAt: new Date(),
                    analyzedBy: process.env.AGENT_NAME || 'unknown',
                    model: this.config.model,
                    processingTime: Date.now() - startTime
                }
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
                    subtasks: []
                },
                metadata: {
                    analyzedAt: new Date(),
                    analyzedBy: process.env.AGENT_NAME || 'unknown',
                    model: this.config.model,
                    processingTime: Date.now() - startTime
                },
                error: error instanceof Error ? error.message : 'Unknown error during analysis'
            };
        }
    }
    /**
     * Rewrite task content using AI based on specified requirements
     */
    async rewriteTask(request) {
        const startTime = Date.now();
        const { uuid, rewriteType, instructions = '', targetAudience = 'developer', tone = 'technical', options = {} } = request;
        try {
            // Read the current task
            const task = await this.contentManager.readTask(uuid);
            if (!task) {
                return {
                    success: false,
                    taskUuid: uuid,
                    rewriteType,
                    originalContent: '',
                    rewrittenContent: '',
                    changes: { summary: '', highlights: [], additions: [], modifications: [], removals: [] },
                    metadata: {
                        rewrittenAt: new Date(),
                        rewrittenBy: process.env.AGENT_NAME || 'unknown',
                        model: this.config.model,
                        processingTime: Date.now() - startTime
                    },
                    error: `Task ${uuid} not found`
                };
            }
            const originalContent = task.content || '';
            // Create backup if requested
            if (options.createBackup) {
                // Note: In real implementation, you would backup the task here
                console.log('Mock backup task:', uuid);
            }
            const rewrite = await runPantheonComputation({
                actorName: 'kanban-task-rewriter',
                goal: `rewrite task ${task.title}`,
                compute: async () => generateTaskRewrite({
                    task,
                    rewriteType,
                    instructions,
                    targetAudience,
                    tone,
                    originalContent,
                }),
            });
            const content = rewrite.content;
            const changes = this.analyzeChanges(originalContent, content);
            // Dry run mode - just return what would happen
            if (options.dryRun) {
                return {
                    success: true,
                    taskUuid: uuid,
                    rewriteType,
                    originalContent,
                    rewrittenContent: content,
                    changes,
                    metadata: {
                        rewrittenAt: new Date(),
                        rewrittenBy: process.env.AGENT_NAME || 'unknown',
                        model: this.config.model,
                        processingTime: Date.now() - startTime
                    }
                };
            }
            // Update the task with new content
            await this.contentManager.updateTaskBody({
                uuid,
                content,
                options: {
                    validateStructure: true,
                    updateTimestamp: true
                }
            });
            return {
                success: true,
                taskUuid: uuid,
                rewriteType,
                originalContent,
                rewrittenContent: content,
                changes,
                metadata: {
                    rewrittenAt: new Date(),
                    rewrittenBy: process.env.AGENT_NAME || 'unknown',
                    model: this.config.model,
                    processingTime: Date.now() - startTime
                }
            };
        }
        catch (error) {
            return {
                success: false,
                taskUuid: uuid,
                rewriteType,
                originalContent: '',
                rewrittenContent: '',
                changes: { summary: '', highlights: [], additions: [], modifications: [], removals: [] },
                metadata: {
                    rewrittenAt: new Date(),
                    rewrittenBy: process.env.AGENT_NAME || 'unknown',
                    model: this.config.model,
                    processingTime: Date.now() - startTime
                },
                error: error instanceof Error ? error.message : 'Unknown error during rewrite'
            };
        }
    }
    /**
     * Break down a task into subtasks, steps, or phases using AI
     */
    async breakdownTask(request) {
        const startTime = Date.now();
        const { uuid, breakdownType, maxSubtasks = 8, complexity = 'medium', includeEstimates = true, options = {} } = request;
        try {
            // Read the current task
            const task = await this.contentManager.readTask(uuid);
            if (!task) {
                return {
                    success: false,
                    taskUuid: uuid,
                    breakdownType,
                    subtasks: [],
                    metadata: {
                        breakdownAt: new Date(),
                        breakdownBy: process.env.AGENT_NAME || 'unknown',
                        model: this.config.model,
                        processingTime: Date.now() - startTime
                    },
                    error: `Task ${uuid} not found`
                };
            }
            // Create backup if requested
            if (options.createBackup) {
                // Note: In real implementation, you would backup the task here
                console.log('Mock backup task:', uuid);
            }
            const breakdown = await runPantheonComputation({
                actorName: 'kanban-task-breakdown',
                goal: `create ${breakdownType} breakdown for ${task.title}`,
                compute: async () => generateTaskBreakdown({
                    task,
                    breakdownType,
                    maxSubtasks,
                    complexity,
                    includeEstimates,
                }),
            });
            // Validate and structure the breakdown
            const subtasks = this.validateBreakdownResult(breakdown, includeEstimates);
            const totalEstimatedHours = includeEstimates
                ? subtasks.reduce((sum, st) => sum + (st.estimatedHours || 0), 0)
                : undefined;
            return {
                success: true,
                taskUuid: uuid,
                breakdownType,
                subtasks,
                totalEstimatedHours,
                metadata: {
                    breakdownAt: new Date(),
                    breakdownBy: process.env.AGENT_NAME || 'unknown',
                    model: this.config.model,
                    processingTime: Date.now() - startTime
                }
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
                    breakdownBy: process.env.AGENT_NAME || 'unknown',
                    model: this.config.model,
                    processingTime: Date.now() - startTime
                },
                error: error instanceof Error ? error.message : 'Unknown error during breakdown'
            };
        }
    }
    validateAnalysisResult(analysis) {
        // Ensure the analysis has the expected structure
        const result = {};
        // Add scores if present
        if (typeof analysis.qualityScore === 'number') {
            result.qualityScore = Math.min(100, Math.max(0, analysis.qualityScore));
        }
        if (typeof analysis.complexityScore === 'number') {
            result.complexityScore = Math.min(100, Math.max(0, analysis.complexityScore));
        }
        if (typeof analysis.completenessScore === 'number') {
            result.completenessScore = Math.min(100, Math.max(0, analysis.completenessScore));
        }
        // Ensure arrays are properly formatted
        result.suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions : [];
        result.risks = Array.isArray(analysis.risks) ? analysis.risks : [];
        result.dependencies = Array.isArray(analysis.dependencies) ? analysis.dependencies : [];
        result.subtasks = Array.isArray(analysis.subtasks) ? analysis.subtasks : [];
        // Handle estimated effort if present
        if (analysis.estimatedEffort && typeof analysis.estimatedEffort === 'object') {
            result.estimatedEffort = {
                hours: typeof analysis.estimatedEffort.hours === 'number' ? analysis.estimatedEffort.hours : 0,
                confidence: typeof analysis.estimatedEffort.confidence === 'number' ?
                    Math.min(100, Math.max(0, analysis.estimatedEffort.confidence)) : 50,
                breakdown: Array.isArray(analysis.estimatedEffort.breakdown) ? analysis.estimatedEffort.breakdown : []
            };
        }
        return result;
    }
    validateBreakdownResult(breakdown, includeEstimates) {
        if (!Array.isArray(breakdown.subtasks)) {
            return [];
        }
        return breakdown.subtasks.map((subtask) => ({
            title: typeof subtask.title === 'string' ? subtask.title : 'Untitled Subtask',
            description: typeof subtask.description === 'string' ? subtask.description : '',
            estimatedHours: includeEstimates && typeof subtask.estimatedHours === 'number' ? subtask.estimatedHours : undefined,
            priority: ['low', 'medium', 'high'].includes(subtask.priority) ? subtask.priority : 'medium',
            dependencies: Array.isArray(subtask.dependencies) ? subtask.dependencies : [],
            acceptanceCriteria: Array.isArray(subtask.acceptanceCriteria) ? subtask.acceptanceCriteria : []
        }));
    }
    analyzeChanges(original, rewritten) {
        // Simple change analysis - in a real implementation, you might use more sophisticated diff algorithms
        const originalLines = original.split('\n').filter(line => line.trim());
        const rewrittenLines = rewritten.split('\n').filter(line => line.trim());
        const additions = [];
        const removals = [];
        const modifications = [];
        // Simple line-by-line comparison
        rewrittenLines.forEach(line => {
            if (!originalLines.includes(line)) {
                additions.push(line);
            }
        });
        originalLines.forEach(line => {
            if (!rewrittenLines.includes(line)) {
                removals.push(line);
            }
        });
        // Find modifications (lines that exist but were changed)
        originalLines.forEach(origLine => {
            const rewrittenMatch = rewrittenLines.find(rewLine => rewLine.substring(0, Math.min(origLine.length, rewLine.length) / 2) ===
                origLine.substring(0, Math.min(origLine.length, rewLine.length) / 2));
            if (rewrittenMatch && rewrittenMatch !== origLine) {
                modifications.push(`"${origLine}" → "${rewrittenMatch}"`);
            }
        });
        const summary = `Content rewritten with ${additions.length} additions, ${removals.length} removals, and ${modifications.length} modifications.`;
        return {
            summary,
            highlights: [`Content length changed from ${original.length} to ${rewritten.length} characters`],
            additions,
            modifications,
            removals
        };
    }
}
function generateTaskAnalysis(params) {
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
function generateTaskRewrite(params) {
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
function generateTaskBreakdown(params) {
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
export function createTaskAIManager(config) {
    return new TaskAIManager(config);
}
//# sourceMappingURL=ai.js.map