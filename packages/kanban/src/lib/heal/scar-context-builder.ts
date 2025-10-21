/**
 * Scar Context Builder for Kanban Healing Operations
 * 
 * This module provides comprehensive context building capabilities for scar (healing) operations
 * in the kanban system. It gathers board state, task metadata, system information,
 * and historical data to provide structured context for intelligent healing operations.
 */

import { promises as fs } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { loadBoard, readTasksFolder, countTasks, findTaskById } from '../kanban.js';
import { loadKanbanConfig } from '../../board/config.js';
import { EventLogManager } from '../../board/event-log.js';
import type { 
  ScarContext, 
  ScarContextOptions, 
  EventLogEntry, 
  ScarRecord, 
  SearchResult, 
  LLMOperation, 
  GitCommit,
  HealingStatus 
} from './scar-context-types.js';
import { 
  createEventLogEntry, 
  createScarRecord,
  validateScarContextIntegrity 
} from './type-guards.js';
import type { Board, Task, ColumnData } from '../types.js';

/**
 * Configuration options for scar context building
 */
export interface ScarContextBuilderOptions {
  /** Maximum number of previous scars to include in context */
  maxPreviousScars?: number;
  /** Maximum number of search results to include */
  maxSearchResults?: number;
  /** Maximum git history depth to analyze */
  maxGitHistory?: number;
  /** Whether to include detailed task analysis */
  includeTaskAnalysis?: boolean;
  /** Whether to include system performance metrics */
  includePerformanceMetrics?: boolean;
  /** Custom search terms for finding relevant tasks */
  searchTerms?: string[];
  /** Filter tasks by specific columns */
  columnFilter?: string[];
  /** Filter tasks by specific labels */
  labelFilter?: string[];
}

/**
 * System performance metrics for healing context
 */
export interface SystemMetrics {
  /** Total number of tasks on the board */
  totalTasks: number;
  /** Number of tasks by status */
  tasksByStatus: Record<string, number>;
  /** WIP limit violations */
  wipViolations: Array<{
    column: string;
    current: number;
    limit: number;
    violation: number;
  }>;
  /** Tasks with missing or incomplete content */
  incompleteTasks: Array<{
    taskId: string;
    title: string;
    issues: string[];
  }>;
  /** Duplicate task detection results */
  duplicateTasks: Array<{
    title: string;
    count: number;
    taskIds: string[];
  }>;
  /** Board health score (0-100) */
  boardHealthScore: number;
  /** System performance indicators */
  performanceIndicators: {
    averageTaskAge: number; // days
    staleTaskCount: number;
    bottleneckColumns: string[];
    flowEfficiency: number; // 0-1
  };
}

/**
 * Git analysis results for healing context
 */
export interface GitAnalysis {
  /** Current git HEAD commit */
  headCommit: GitCommit | null;
  /** Recent commits relevant to kanban operations */
  recentCommits: GitCommit[];
  /** Git repository status */
  repoStatus: {
    isClean: boolean;
    modified: string[];
    untracked: string[];
    branch: string;
  };
  /** Tags found in repository */
  tags: string[];
}

/**
 * Task analysis results for healing context
 */
export interface TaskAnalysis {
  /** Tasks requiring immediate attention */
  criticalTasks: Task[];
  /** Tasks that are stuck or blocked */
  stuckTasks: Array<{
    task: Task;
    stuckReason: string;
    daysInStatus: number;
  }>;
  /** Quality issues detected */
  qualityIssues: Array<{
    taskId: string;
    title: string;
    issues: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  /** Estimate accuracy analysis */
  estimateAccuracy: {
    tasksWithEstimates: number;
    tasksWithoutEstimates: number;
    averageComplexity: number;
    estimateCoverage: number; // percentage
  };
}

/**
 * Main Scar Context Builder class
 * 
 * Provides comprehensive context building for kanban healing operations by analyzing
 * board state, tasks, git history, and system metrics.
 */
export class ScarContextBuilder {
  private readonly boardPath: string;
  private readonly tasksDir: string;
  private readonly eventLogManager: EventLogManager | null = null;

  constructor(boardPath: string, tasksDir: string, eventLogManager?: EventLogManager) {
    this.boardPath = boardPath;
    this.tasksDir = tasksDir;
    this.eventLogManager = eventLogManager || null;
  }

  /**
   * Build comprehensive scar context for healing operations
   */
  async buildContext(
    reason: string,
    options: ScarContextBuilderOptions = {}
  ): Promise<ScarContext> {
    const startTime = Date.now();

    // Initialize context with basic structure
    const context: ScarContext = {
      reason,
      eventLog: [],
      previousScars: [],
      searchResults: [],
      metadata: {
        tag: this.generateTag(),
        narrative: this.generateNarrative(reason),
      },
      llmOperations: [],
      gitHistory: [],
    };

    try {
      // Add initial event log entry
      context.eventLog.push(
        createEventLogEntry('start-context-building', {
          reason,
          options: Object.keys(options),
        }, 'info')
      );

      // Gather board and task information
      const board = await loadBoard(this.boardPath, this.tasksDir);
      const tasks = await readTasksFolder(this.tasksDir);

      // Analyze system metrics
      if (options.includePerformanceMetrics !== false) {
        const metrics = await this.analyzeSystemMetrics(board, tasks);
        context.eventLog.push(
          createEventLogEntry('system-metrics-analyzed', {
            totalTasks: metrics.totalTasks,
            healthScore: metrics.boardHealthScore,
            wipViolations: metrics.wipViolations.length,
          }, 'info')
        );
      }

      // Analyze tasks for quality and issues
      if (options.includeTaskAnalysis) {
        const taskAnalysis = await this.analyzeTasks(board, tasks, options);
        context.eventLog.push(
          createEventLogEntry('task-analysis-completed', {
            criticalTasks: taskAnalysis.criticalTasks.length,
            qualityIssues: taskAnalysis.qualityIssues.length,
            stuckTasks: taskAnalysis.stuckTasks.length,
          }, 'info')
        );
      }

      // Analyze git history
      const gitAnalysis = await this.analyzeGitHistory(options.maxGitHistory);
      context.gitHistory = gitAnalysis.recentCommits;
      
      context.eventLog.push(
        createEventLogEntry('git-analysis-completed', {
          commitsAnalyzed: gitAnalysis.recentCommits.length,
          currentBranch: gitAnalysis.repoStatus.branch,
          isClean: gitAnalysis.repoStatus.isClean,
        }, 'info')
      );

      // Search for relevant tasks based on search terms
      if (options.searchTerms && options.searchTerms.length > 0) {
        context.searchResults = await this.searchRelevantTasks(board, options.searchTerms, options.maxSearchResults);
        context.eventLog.push(
          createEventLogEntry('task-search-completed', {
            searchTerms: options.searchTerms,
            resultsFound: context.searchResults.length,
          }, 'info')
        );
      }

      // Load previous scars (healing records)
      context.previousScars = await this.loadPreviousScars(options.maxPreviousScars);
      
      context.eventLog.push(
        createEventLogEntry('previous-scars-loaded', {
          scarCount: context.previousScars.length,
        }, 'info')
      );

      // Validate context integrity
      const validation = validateScarContextIntegrity(context);
      if (!validation.isValid) {
        context.eventLog.push(
          createEventLogEntry('context-validation-failed', {
            errors: validation.errors,
            warnings: validation.warnings,
          }, 'error')
        );
        throw new Error(`Context validation failed: ${validation.errors.join(', ')}`);
      }

      // Add completion event
      const buildTime = Date.now() - startTime;
      context.eventLog.push(
        createEventLogEntry('context-building-completed', {
          buildTimeMs: buildTime,
          totalEvents: context.eventLog.length,
        }, 'info')
      );

      return context;

    } catch (error) {
      // Add error event and re-throw
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.eventLog.push(
        createEventLogEntry('context-building-failed', {
          error: errorMessage,
          buildTimeMs: Date.now() - startTime,
        }, 'error')
      );
      throw error;
    }
  }

  /**
   * Analyze system metrics for board health and performance
   */
  private async analyzeSystemMetrics(board: Board, tasks: Task[]): Promise<SystemMetrics> {
    const totalTasks = tasks.length;
    const tasksByStatus: Record<string, number> = {};
    const wipViolations: SystemMetrics['wipViolations'] = [];
    const incompleteTasks: SystemMetrics['incompleteTasks'] = [];
    const duplicateTasks: SystemMetrics['duplicateTasks'] = [];

    // Analyze tasks by status and detect issues
    for (const column of board.columns) {
      const normalizedColumnName = column.name.toLowerCase();
      tasksByStatus[normalizedColumnName] = column.tasks.length;

      // Check WIP limit violations
      if (column.limit && column.tasks.length > column.limit) {
        wipViolations.push({
          column: column.name,
          current: column.tasks.length,
          limit: column.limit,
          violation: column.tasks.length - column.limit,
        });
      }

      // Check for incomplete tasks
      for (const task of column.tasks) {
        const issues: string[] = [];
        
        if (!task.title || task.title.trim().length === 0) {
          issues.push('Missing title');
        }
        
        if (!task.content || task.content.trim().length === 0) {
          issues.push('Missing content');
        }
        
        if (!task.labels || task.labels.length === 0) {
          issues.push('No labels assigned');
        }
        
        if (!task.estimates || Object.keys(task.estimates).length === 0) {
          issues.push('No estimates provided');
        }

        if (issues.length > 0) {
          incompleteTasks.push({
            taskId: task.uuid,
            title: task.title || 'Untitled',
            issues,
          });
        }
      }
    }

    // Detect duplicate tasks
    const titleGroups = new Map<string, Task[]>();
    for (const task of tasks) {
      const normalizedTitle = task.title.toLowerCase().trim();
      if (!titleGroups.has(normalizedTitle)) {
        titleGroups.set(normalizedTitle, []);
      }
      titleGroups.get(normalizedTitle)!.push(task);
    }

    for (const [title, taskGroup] of titleGroups) {
      if (taskGroup.length > 1) {
        duplicateTasks.push({
          title,
          count: taskGroup.length,
          taskIds: taskGroup.map(t => t.uuid),
        });
      }
    }

    // Calculate board health score
    const healthDeductions = [
      wipViolations.length * 10,
      incompleteTasks.length * 5,
      duplicateTasks.length * 15,
    ];
    const totalDeductions = healthDeductions.reduce((sum, deduction) => sum + deduction, 0);
    const boardHealthScore = Math.max(0, 100 - totalDeductions);

    // Calculate performance indicators
    const now = new Date();
    const taskAges = tasks.map(task => {
      const created = new Date(task.created_at);
      return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
    });
    const averageTaskAge = taskAges.length > 0 ? taskAges.reduce((sum, age) => sum + age, 0) / taskAges.length : 0;
    const staleTaskCount = taskAges.filter(age => age > 30).length; // tasks older than 30 days

    // Detect bottleneck columns (high task count, no movement)
    const avgTasksPerColumn = totalTasks / board.columns.length;
    const bottleneckColumns = board.columns
      .filter(column => column.tasks.length > avgTasksPerColumn * 1.5)
      .map(column => column.name);

    // Simple flow efficiency calculation
    const doneTasks = tasksByStatus['done'] || 0;
    const flowEfficiency = totalTasks > 0 ? doneTasks / totalTasks : 0;

    return {
      totalTasks,
      tasksByStatus,
      wipViolations,
      incompleteTasks,
      duplicateTasks,
      boardHealthScore,
      performanceIndicators: {
        averageTaskAge,
        staleTaskCount,
        bottleneckColumns,
        flowEfficiency,
      },
    };
  }

  /**
   * Analyze tasks for quality issues and critical items
   */
  private async analyzeTasks(
    board: Board, 
    tasks: Task[], 
    options: ScarContextBuilderOptions
  ): Promise<TaskAnalysis> {
    const criticalTasks: Task[] = [];
    const stuckTasks: TaskAnalysis['stuckTasks'] = [];
    const qualityIssues: TaskAnalysis['qualityIssues'] = [];
    
    let tasksWithEstimates = 0;
    let totalComplexity = 0;

    const now = new Date();

    for (const column of board.columns) {
      // Apply column filter if specified
      if (options.columnFilter && !options.columnFilter.includes(column.name)) {
        continue;
      }

      for (const task of column.tasks) {
        // Apply label filter if specified
        if (options.labelFilter && !options.labelFilter.some(label => task.labels?.includes(label))) {
          continue;
        }

        // Detect critical tasks (high priority, old, or in critical status)
        const isHighPriority = task.priority === 'P0' || task.priority === 'critical';
        const created = new Date(task.created_at);
        const daysOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        const isOld = daysOld > 14; // older than 2 weeks
        const isInCriticalStatus = ['incoming', 'breakdown', 'blocked'].includes(column.name.toLowerCase());

        if (isHighPriority || (isOld && isInCriticalStatus)) {
          criticalTasks.push(task);
        }

        // Detect stuck tasks (long time in same status)
        const daysInStatus = daysOld; // Simplified - could be enhanced with actual status change tracking
        const isStuck = daysInStatus > 7 && ['todo', 'in_progress', 'review'].includes(column.name.toLowerCase());
        
        if (isStuck) {
          let stuckReason = `Task has been in "${column.name}" for ${Math.round(daysInStatus)} days`;
          if (column.limit && column.tasks.length > column.limit) {
            stuckReason += ` (column over WIP limit)`;
          }
          stuckTasks.push({
            task,
            stuckReason,
            daysInStatus,
          });
        }

        // Analyze quality issues
        const issues: string[] = [];
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

        if (!task.title || task.title.trim().length === 0) {
          issues.push('Missing task title');
          severity = 'critical';
        }

        if (!task.content || task.content.trim().length === 0) {
          issues.push('Missing task content');
          severity = this.maxSeverity(severity, 'high');
        }

        if (!task.labels || task.labels.length === 0) {
          issues.push('No labels assigned');
          severity = this.maxSeverity(severity, 'medium');
        }

        if (!task.estimates || Object.keys(task.estimates).length === 0) {
          issues.push('No estimates provided');
          severity = this.maxSeverity(severity, 'medium');
        }

        if (issues.length > 0) {
          qualityIssues.push({
            taskId: task.uuid,
            title: task.title || 'Untitled',
            issues,
            severity,
          });
        }

        // Collect estimate statistics
        if (task.estimates && Object.keys(task.estimates).length > 0) {
          tasksWithEstimates++;
          if (typeof task.estimates.complexity === 'number') {
            totalComplexity += task.estimates.complexity;
          }
        }
      }
    }

    const estimateAccuracy = {
      tasksWithEstimates,
      tasksWithoutEstimates: tasks.length - tasksWithEstimates,
      averageComplexity: tasksWithEstimates > 0 ? totalComplexity / tasksWithEstimates : 0,
      estimateCoverage: tasks.length > 0 ? (tasksWithEstimates / tasks.length) * 100 : 0,
    };

    return {
      criticalTasks,
      stuckTasks,
      qualityIssues,
      estimateAccuracy,
    };
  }

  /**
   * Analyze git history for relevant commits
   */
  private async analyzeGitHistory(maxDepth: number = 50): Promise<GitAnalysis> {
    const analysis: GitAnalysis = {
      headCommit: null,
      recentCommits: [],
      repoStatus: {
        isClean: true,
        modified: [],
        untracked: [],
        branch: 'main',
      },
      tags: [],
    };

    try {
      // Try to get git information (this is a simplified implementation)
      // In a real implementation, you'd use git commands or a git library
      const repoRoot = path.dirname(this.boardPath);
      
      // Get current branch
      try {
        const { execSync } = await import('node:child_process');
        const branch = execSync('git branch --show-current', { cwd: repoRoot, encoding: 'utf8' }).trim();
        analysis.repoStatus.branch = branch;
      } catch {
        // Default to 'main' if git command fails
      }

      // Get status
      try {
        const { execSync } = await import('node:child_process');
        const status = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' });
        analysis.repoStatus.isClean = status.trim().length === 0;
        
        if (status.trim().length > 0) {
          const lines = status.split('\n');
          for (const line of lines) {
            if (line.startsWith(' M') || line.startsWith(' M')) {
              const file = line.substring(3).trim();
              analysis.repoStatus.modified.push(file);
            } else if (line.startsWith('??')) {
              const file = line.substring(3).trim();
              analysis.repoStatus.untracked.push(file);
            }
          }
        }
      } catch {
        // Default to clean if git command fails
      }

      // Get recent commits
      try {
        const { execSync } = await import('node:child_process');
        const log = execSync(`git log --oneline -${maxDepth}`, { cwd: repoRoot, encoding: 'utf8' });
        const lines = log.trim().split('\n');
        
        for (const line of lines) {
          if (line.trim().length === 0) continue;
          
          const parts = line.split(' ', 2);
          if (parts.length >= 2) {
            const sha = parts[0];
            const message = parts[1];
            
            // Try to get more details for the commit
            try {
              const { execSync } = await import('node:child_process');
              const details = execSync(`git show --format="%an|%ai|%H" ${sha}`, { cwd: repoRoot, encoding: 'utf8' });
              const [author, timestamp, fullSha] = details.trim().split('|');
              
              const commit: GitCommit = {
                sha: fullSha || sha,
                message,
                author: author || 'Unknown',
                timestamp: new Date(timestamp || Date.now()),
                files: [], // Would need additional git commands to get this
              };
              
              analysis.recentCommits.push(commit);
              
              if (analysis.headCommit === null) {
                analysis.headCommit = commit;
              }
            } catch {
              // Fallback commit with minimal info
              const commit: GitCommit = {
                sha,
                message,
                author: 'Unknown',
                timestamp: new Date(),
                files: [],
              };
              analysis.recentCommits.push(commit);
              
              if (analysis.headCommit === null) {
                analysis.headCommit = commit;
              }
            }
          }
        }
      } catch {
        // Default to empty commits if git commands fail
      }

      // Get tags
      try {
        const { execSync } = await import('node:child_process');
        const tagOutput = execSync('git tag --sort=-version:refname', { cwd: repoRoot, encoding: 'utf8' });
        analysis.tags = tagOutput.trim().split('\n').filter(tag => tag.trim().length > 0);
      } catch {
        // Default to empty tags if git command fails
      }

    } catch (error) {
      // Add warning to event log if git analysis fails
      console.warn('Git analysis failed:', error);
    }

    return analysis;
  }

  /**
   * Search for relevant tasks based on search terms
   */
  private async searchRelevantTasks(
    board: Board, 
    searchTerms: string[], 
    maxResults: number = 20
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const allTasks = board.columns.flatMap(column => column.tasks);

    for (const task of allTasks) {
      let relevance = 0;
      let matchedTerms = 0;

      // Search in title, content, and labels
      const searchableText = [
        task.title,
        task.content || '',
        ...(task.labels || [])
      ].join(' ').toLowerCase();

      for (const term of searchTerms) {
        const termLower = term.toLowerCase();
        if (searchableText.includes(termLower)) {
          matchedTerms++;
          // Calculate relevance based on where the term was found
          if (task.title.toLowerCase().includes(termLower)) {
            relevance += 0.8; // Title match is most relevant
          }
          if (task.content && task.content.toLowerCase().includes(termLower)) {
            relevance += 0.5; // Content match is moderately relevant
          }
          if (task.labels?.some(label => label.toLowerCase().includes(termLower))) {
            relevance += 0.3; // Label match is less relevant
          }
        }
      }

      if (matchedTerms > 0) {
        // Normalize relevance to 0-1 range
        const normalizedRelevance = Math.min(1, relevance / searchTerms.length);
        
        // Create snippet for the match
        const snippet = this.createSearchSnippet(task, searchTerms);
        
        results.push({
          taskId: task.uuid,
          title: task.title,
          relevance: normalizedRelevance,
          snippet,
        });
      }
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  /**
   * Create a search snippet showing why a task matched
   */
  private createSearchSnippet(task: Task, searchTerms: string[]): string {
    const snippetParts: string[] = [];
    
    // Add title if it matches
    const matchingTerms = searchTerms.filter(term => 
      task.title.toLowerCase().includes(term.toLowerCase())
    );
    if (matchingTerms.length > 0) {
      snippetParts.push(`Title: ${task.title}`);
    }

    // Add matching labels
    const matchingLabels = task.labels?.filter(label => 
      searchTerms.some(term => label.toLowerCase().includes(term.toLowerCase()))
    );
    if (matchingLabels && matchingLabels.length > 0) {
      snippetParts.push(`Labels: ${matchingLabels.join(', ')}`);
    }

    // Add brief content preview if it matches
    if (task.content) {
      const matchingContent = searchTerms.filter(term => 
        task.content!.toLowerCase().includes(term.toLowerCase())
      );
      if (matchingContent.length > 0) {
        const contentPreview = task.content.substring(0, 100);
        snippetParts.push(`Content: ${contentPreview}${task.content.length > 100 ? '...' : ''}`);
      }
    }

    return snippetParts.join(' | ');
  }

  /**
   * Load previous scar records for historical context
   */
  private async loadPreviousScars(maxScars: number = 10): Promise<ScarRecord[]> {
    // In a real implementation, this would load from a persistent store
    // For now, return empty array as placeholder
    // This could be enhanced to load from event log or a dedicated scars file
    return [];
  }

  /**
   * Generate a tag for the current healing operation
   */
  private generateTag(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `heal-${date}-${time}`;
  }

  /**
   * Generate a narrative for the healing operation
   */
  private generateNarrative(reason: string): string {
    return `Automated healing operation initiated: ${reason}. ` +
      `Context includes board state analysis, task quality assessment, ` +
      `system performance metrics, and historical data for intelligent healing decisions.`;
  }

  /**
   * Helper to get maximum severity
   */
  private maxSeverity(
    current: 'low' | 'medium' | 'high' | 'critical', 
    candidate: 'low' | 'medium' | 'high' | 'critical'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    return severityLevels[current] >= severityLevels[candidate] ? current : candidate;
  }

  /**
   * Add an LLM operation to the context (for tracking AI-assisted healing)
   */
  async addLLMOperation(
    context: ScarContext,
    operation: string,
    input: any,
    output: any,
    tokensUsed?: number
  ): Promise<void> {
    const llmOp: LLMOperation = {
      id: randomUUID(),
      operation,
      input,
      output,
      timestamp: new Date(),
      tokensUsed,
    };

    context.llmOperations.push(llmOp);
    
    context.eventLog.push(
      createEventLogEntry('llm-operation-completed', {
        operationId: llmOp.id,
        operation,
        tokensUsed,
      }, 'info')
    );
  }

  /**
   * Update context with healing progress
   */
  async updateProgress(
    context: ScarContext,
    operation: string,
    details: Record<string, any>,
    severity: 'info' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    context.eventLog.push(
      createEventLogEntry(operation, details, severity)
    );
  }

  /**
   * Finalize context and prepare for healing operations
   */
  async finalizeContext(context: ScarContext): Promise<ScarContext> {
    context.eventLog.push(
      createEventLogEntry('context-finalized', {
        totalEvents: context.eventLog.length,
        llmOperations: context.llmOperations.length,
        searchResults: context.searchResults.length,
        previousScars: context.previousScars.length,
      }, 'info')
    );

    // Final validation
    const validation = validateScarContextIntegrity(context);
    if (!validation.isValid) {
      throw new Error(`Context validation failed during finalization: ${validation.errors.join(', ')}`);
    }

    return context;
  }
}

/**
 * Convenience function to create a scar context builder
 */
export function createScarContextBuilder(
  boardPath: string, 
  tasksDir: string, 
  eventLogManager?: EventLogManager
): ScarContextBuilder {
  return new ScarContextBuilder(boardPath, tasksDir, eventLogManager);
}

/**
 * Default options for scar context building
 */
export const DEFAULT_SCAR_CONTEXT_OPTIONS: ScarContextBuilderOptions = {
  maxPreviousScars: 10,
  maxSearchResults: 20,
  maxGitHistory: 50,
  includeTaskAnalysis: true,
  includePerformanceMetrics: true,
  searchTerms: [],
  columnFilter: [],
  labelFilter: [],
};