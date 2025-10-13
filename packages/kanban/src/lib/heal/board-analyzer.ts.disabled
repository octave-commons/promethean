/**
 * Board Analysis Engine for Kanban Healing
 *
 * This module analyzes kanban boards to detect damage patterns
 * and provides detailed diagnostics for board health.
 */

import type { Board, Task, ColumnData } from '../types.js';
import type { 
  DamagePattern, 
  DamageDetectionResult, 
  DamageMatch,
  PatternCondition 
} from './damage-pattern-dsl.js';
import { EventLogManager } from '../../board/event-log.js';

export type BoardAnalysisContext = {
  board: Board;
  eventLogManager?: EventLogManager;
  tasksDir: string;
  boardFile: string;
  analysisTime: Date;
};

export type AnalysisMetrics = {
  totalTasks: number;
  totalColumns: number;
  wipViolations: number;
  duplicateGroups: number;
  staleTasks: number;
  orphanedEvents: number;
  illegalTransitions: number;
  boardHealthScore: number; // 0-100
};

export type DetailedMatch = DamageMatch & {
  task?: Task;
  column?: ColumnData;
  relatedTasks?: Task[];
  metadata?: Record<string, any>;
};

/**
 * Board Analysis Engine
 * 
 * Analyzes kanban boards to detect damage patterns and provide
 * detailed diagnostics for board health issues.
 */
export class BoardAnalyzer {
  private context: BoardAnalysisContext;
  private metrics: AnalysisMetrics;

  constructor(context: BoardAnalysisContext) {
    this.context = context;
    this.metrics = {
      totalTasks: 0,
      totalColumns: 0,
      wipViolations: 0,
      duplicateGroups: 0,
      staleTasks: 0,
      orphanedEvents: 0,
      illegalTransitions: 0,
      boardHealthScore: 100,
    };
  }

  /**
   * Analyze the board for all damage patterns
   */
  async analyzeBoard(patterns: DamagePattern[]): Promise<DamageDetectionResult[]> {
    const results: DamageDetectionResult[] = [];
    
    // Calculate base metrics
    await this.calculateBaseMetrics();
    
    // Check each pattern
    for (const pattern of patterns) {
      if (!pattern.enabled) continue;
      
      try {
        const result = await this.checkPattern(pattern);
        if (result.matches.length > 0) {
          results.push(result);
        }
      } catch (error) {
        console.warn(`Failed to check pattern ${pattern.id}:`, error);
      }
    }
    
    // Calculate final board health score
    this.calculateBoardHealthScore(results);
    
    return results.sort((a, b) => {
      // Sort by severity first, then by confidence
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Check a specific damage pattern against the board
   */
  async checkPattern(pattern: DamagePattern): Promise<DamageDetectionResult> {
    const matches: DetailedMatch[] = [];
    
    // Evaluate all conditions
    for (const condition of pattern.conditions) {
      const conditionMatches = await this.evaluateCondition(condition);
      matches.push(...conditionMatches);
    }
    
    // Calculate confidence based on how many conditions matched
    const confidence = pattern.conditions.length > 0 
      ? matches.length / pattern.conditions.length 
      : 0;

    return {
      pattern,
      matches: matches.map(m => this.sanitizeMatch(m)),
      severity: pattern.severity,
      confidence,
      suggestedFixes: pattern.fixes,
    };
  }

  /**
   * Evaluate a single condition against the board
   */
  async evaluateCondition(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    
    switch (condition.type) {
      case 'column':
        matches.push(...await this.evaluateColumnCondition(condition));
        break;
      case 'task':
        matches.push(...await this.evaluateTaskCondition(condition));
        break;
      case 'board':
        matches.push(...await this.evaluateBoardCondition(condition));
        break;
      case 'transition':
        matches.push(...await this.evaluateTransitionCondition(condition));
        break;
      case 'time':
        matches.push(...await this.evaluateTimeCondition(condition));
        break;
      case 'custom':
        matches.push(...await this.evaluateCustomCondition(condition));
        break;
    }
    
    return matches;
  }

  private async evaluateColumnCondition(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    
    for (const column of this.context.board.columns) {
      const fieldValue = this.getColumnFieldValue(column, condition.field);
      const expectedValue = this.resolveValue(condition.value, column);
      
      if (this.evaluateOperator(fieldValue, condition.operator, expectedValue)) {
        matches.push({
          columnId: column.name,
          details: {
            column: column.name,
            field: condition.field,
            actual: fieldValue,
            expected: expectedValue,
            operator: condition.operator,
          },
          context: {
            condition: condition.description,
            column,
          },
          column,
        });
      }
    }
    
    return matches;
  }

  private async evaluateTaskCondition(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    
    for (const column of this.context.board.columns) {
      for (const task of column.tasks) {
        const fieldValue = this.getTaskFieldValue(task, condition.field);
        const expectedValue = this.resolveValue(condition.value, task, column);
        
        if (this.evaluateOperator(fieldValue, condition.operator, expectedValue)) {
          matches.push({
            taskId: task.uuid,
            details: {
              task: task.title,
              field: condition.field,
              actual: fieldValue,
              expected: expectedValue,
              operator: condition.operator,
            },
            context: {
              condition: condition.description,
              task,
              column,
            },
            task,
            column,
          });
        }
      }
    }
    
    return matches;
  }

  private async evaluateBoardCondition(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    
    const fieldValue = this.getBoardFieldValue(condition.field);
    const expectedValue = this.resolveValue(condition.value);
    
    if (this.evaluateOperator(fieldValue, condition.operator, expectedValue)) {
      matches.push({
        boardId: this.context.boardFile,
        details: {
          board: this.context.boardFile,
          field: condition.field,
          actual: fieldValue,
          expected: expectedValue,
          operator: condition.operator,
        },
        context: {
          condition: condition.description,
          board: this.context.board,
        },
      });
    }
    
    return matches;
  }

  private async evaluateTransitionCondition(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    
    if (!this.context.eventLogManager) {
      return matches;
    }
    
    try {
      const allEvents = await this.context.eventLogManager.readEventLog();
      const allHistories = await this.context.eventLogManager.getAllTaskHistories();
      
      for (const [taskId, events] of allHistories) {
        for (const event of events) {
          const fieldValue = this.getTransitionFieldValue(event, condition.field);
          const expectedValue = this.resolveValue(condition.value, event);
          
          if (this.evaluateOperator(fieldValue, condition.operator, expectedValue)) {
            const task = this.findTaskById(taskId);
            matches.push({
              taskId,
              details: {
                task: task?.title || taskId,
                event: event.id,
                field: condition.field,
                actual: fieldValue,
                expected: expectedValue,
                operator: condition.operator,
                transition: `${event.fromStatus} → ${event.toStatus}`,
              },
              context: {
                condition: condition.description,
                event,
                task,
              },
              task,
            });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to evaluate transition condition:', error);
    }
    
    return matches;
  }

  private async evaluateTimeCondition(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    
    for (const column of this.context.board.columns) {
      for (const task of column.tasks) {
        const fieldValue = this.getTimeFieldValue(task, condition.field);
        const expectedValue = this.resolveValue(condition.value, task);
        
        if (this.evaluateOperator(fieldValue, condition.operator, expectedValue)) {
          matches.push({
            taskId: task.uuid,
            details: {
              task: task.title,
              field: condition.field,
              actual: fieldValue,
              expected: expectedValue,
              operator: condition.operator,
            },
            context: {
              condition: condition.description,
              task,
              column,
            },
            task,
            column,
          });
        }
      }
    }
    
    return matches;
  }

  private async evaluateCustomCondition(condition: PatternCondition): Promise<DetailedMatch[]> {
    // Handle custom conditions based on field name
    switch (condition.field) {
      case 'task.title_similarity':
        return await this.evaluateTitleSimilarity(condition);
      case 'duplicate_count':
        return await this.evaluateDuplicateCount(condition);
      case 'orphaned_event_count':
        return await this.evaluateOrphanedEvents(condition);
      default:
        console.warn(`Unknown custom condition field: ${condition.field}`);
        return [];
    }
  }

  private async evaluateTitleSimilarity(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    const taskGroups = this.groupTasksByTitleSimilarity();
    
    for (const [signature, tasks] of taskGroups) {
      if (tasks.length >= 2) {
        const similarity = this.calculateTitleSimilarity(tasks[0].title, tasks[1].title);
        
        if (this.evaluateOperator(similarity, condition.operator, condition.value)) {
          matches.push({
            taskId: tasks[0].uuid, // Primary task
            details: {
              task_group: tasks.map(t => t.title),
              similarity,
              count: tasks.length,
            },
            context: {
              condition: condition.description,
              relatedTasks: tasks,
            },
            task: tasks[0],
            relatedTasks: tasks,
          });
        }
      }
    }
    
    return matches;
  }

  private async evaluateDuplicateCount(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    const taskGroups = this.groupTasksByTitleSimilarity();
    
    for (const [signature, tasks] of taskGroups) {
      if (this.evaluateOperator(tasks.length, condition.operator, condition.value)) {
        matches.push({
          taskId: tasks[0].uuid,
          details: {
            duplicate_group: signature,
            count: tasks.length,
            tasks: tasks.map(t => t.title),
          },
          context: {
            condition: condition.description,
            relatedTasks: tasks,
          },
          task: tasks[0],
          relatedTasks: tasks,
        });
      }
    }
    
    return matches;
  }

  private async evaluateOrphanedEvents(condition: PatternCondition): Promise<DetailedMatch[]> {
    const matches: DetailedMatch[] = [];
    
    if (!this.context.eventLogManager) {
      return matches;
    }
    
    try {
      const allHistories = await this.context.eventLogManager.getAllTaskHistories();
      const boardTaskIds = new Set();
      
      // Collect all task IDs from board
      for (const column of this.context.board.columns) {
        for (const task of column.tasks) {
          boardTaskIds.add(task.uuid);
        }
      }
      
      // Find orphaned events
      let orphanedCount = 0;
      for (const [taskId, events] of allHistories) {
        if (!boardTaskIds.has(taskId) && events.length > 0) {
          orphanedCount += events.length;
        }
      }
      
      if (this.evaluateOperator(orphanedCount, condition.operator, condition.value)) {
        matches.push({
          boardId: this.context.boardFile,
          details: {
            orphaned_event_count: orphanedCount,
            total_events: Array.from(allHistories.values()).reduce((sum, events) => sum + events.length, 0),
          },
          context: {
            condition: condition.description,
          },
        });
      }
    } catch (error) {
      console.warn('Failed to evaluate orphaned events:', error);
    }
    
    return matches;
  }

  // Helper methods

  private getColumnFieldValue(column: ColumnData, field: string): any {
    switch (field) {
      case 'column.name': return column.name;
      case 'column.count': return column.tasks.length;
      case 'column.limit': return column.limit;
      case 'column.utilization': return column.limit ? column.tasks.length / column.limit : 0;
      default: return null;
    }
  }

  private getTaskFieldValue(task: Task, field: string): any {
    switch (field) {
      case 'task.title': return task.title;
      case 'task.status': return task.status;
      case 'task.priority': return task.priority;
      case 'task.labels': return task.labels;
      case 'task.created_at': return task.created_at;
      case 'task.days_since_update': return this.getDaysSinceUpdate(task);
      case 'task.estimates.complexity': return task.estimates?.complexity;
      case 'task.estimates.time_to_completion': return task.estimates?.time_to_completion;
      default: return null;
    }
  }

  private getBoardFieldValue(field: string): any {
    switch (field) {
      case 'board.total_tasks': return this.metrics.totalTasks;
      case 'board.total_columns': return this.metrics.totalColumns;
      case 'board.wip_violations': return this.metrics.wipViolations;
      default: return null;
    }
  }

  private getTransitionFieldValue(event: any, field: string): any {
    switch (field) {
      case 'transition.illegal': return event.illegal || false;
      case 'transition.from': return event.fromStatus;
      case 'transition.to': return event.toStatus;
      case 'transition.timestamp': return event.timestamp;
      default: return null;
    }
  }

  private getTimeFieldValue(task: Task, field: string): any {
    switch (field) {
      case 'task.days_since_update': return this.getDaysSinceUpdate(task);
      case 'task.days_since_created': return this.getDaysSinceCreated(task);
      default: return null;
    }
  }

  private resolveValue(value: any, context?: any): any {
    if (typeof value === 'string' && value.startsWith('column.')) {
      if (context && 'tasks' in context) {
        return this.getColumnFieldValue(context, value);
      }
    }
    
    if (typeof value === 'string' && value.startsWith('task.')) {
      if (context && 'uuid' in context) {
        return this.getTaskFieldValue(context, value);
      }
    }
    
    return value;
  }

  private evaluateOperator(actual: any, operator: PatternCondition['operator'], expected: any): boolean {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'ne': return actual !== expected;
      case 'gt': return Number(actual) > Number(expected);
      case 'gte': return Number(actual) >= Number(expected);
      case 'lt': return Number(actual) < Number(expected);
      case 'lte': return Number(actual) <= Number(expected);
      case 'contains': return String(actual).includes(String(expected));
      case 'matches': return new RegExp(String(expected)).test(String(actual));
      case 'in': return Array.isArray(expected) ? expected.includes(actual) : false;
      case 'not_in': return Array.isArray(expected) ? !expected.includes(actual) : true;
      default: return false;
    }
  }

  private getDaysSinceUpdate(task: Task): number {
    const updatedAt = task.created_at ? new Date(task.created_at) : new Date();
    const now = new Date();
    return Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getDaysSinceCreated(task: Task): number {
    const createdAt = task.created_at ? new Date(task.created_at) : new Date();
    const now = new Date();
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  private groupTasksByTitleSimilarity(): Map<string, Task[]> {
    const groups = new Map<string, Task[]>();
    
    for (const column of this.context.board.columns) {
      for (const task of column.tasks) {
        const signature = this.normalizeTitle(task.title);
        if (!groups.has(signature)) {
          groups.set(signature, []);
        }
        groups.get(signature)!.push(task);
      }
    }
    
    return groups;
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const normalized1 = this.normalizeTitle(title1);
    const normalized2 = this.normalizeTitle(title2);
    
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private findTaskById(taskId: string): Task | undefined {
    for (const column of this.context.board.columns) {
      const task = column.tasks.find(t => t.uuid === taskId);
      if (task) return task;
    }
    return undefined;
  }

  private sanitizeMatch(match: DetailedMatch): DamageMatch {
    return {
      taskId: match.taskId,
      columnId: match.columnId,
      boardId: match.boardId,
      details: match.details,
      context: match.context,
    };
  }

  private async calculateBaseMetrics(): Promise<void> {
    this.metrics.totalTasks = this.context.board.columns.reduce((sum, col) => sum + col.tasks.length, 0);
    this.metrics.totalColumns = this.context.board.columns.length;
    
    // Count WIP violations
    for (const column of this.context.board.columns) {
      if (column.limit && column.tasks.length > column.limit) {
        this.metrics.wipViolations++;
      }
    }
    
    // Count stale tasks
    for (const column of this.context.board.columns) {
      for (const task of column.tasks) {
        if (this.getDaysSinceUpdate(task) > 30) {
          this.metrics.staleTasks++;
        }
      }
    }
    
    // Count duplicate groups
    const taskGroups = this.groupTasksByTitleSimilarity();
    for (const [_, tasks] of taskGroups) {
      if (tasks.length >= 2) {
        this.metrics.duplicateGroups++;
      }
    }
  }

  private calculateBoardHealthScore(results: DamageDetectionResult[]): void {
    let totalDeduction = 0;
    
    for (const result of results) {
      const severityMultiplier = {
        critical: 25,
        high: 15,
        medium: 8,
        low: 3,
      };
      
      totalDeduction += severityMultiplier[result.severity] * result.matches.length * result.confidence;
    }
    
    this.metrics.boardHealthScore = Math.max(0, 100 - totalDeduction);
  }

  /**
   * Get analysis metrics
   */
  getMetrics(): AnalysisMetrics {
    return { ...this.metrics };
  }

  /**
   * Get detailed board health report
   */
  getHealthReport(): string {
    const lines = [
      '# 🏥 Kanban Board Health Report',
      '',
      `📊 Overall Health Score: ${this.metrics.boardHealthScore}/100`,
      '',
      '## 📈 Metrics',
      `- Total Tasks: ${this.metrics.totalTasks}`,
      `- Total Columns: ${this.metrics.totalColumns}`,
      `- WIP Violations: ${this.metrics.wipViolations}`,
      `- Duplicate Groups: ${this.metrics.duplicateGroups}`,
      `- Stale Tasks: ${this.metrics.staleTasks}`,
      `- Orphaned Events: ${this.metrics.orphanedEvents}`,
      `- Illegal Transitions: ${this.metrics.illegalTransitions}`,
      '',
    ];
    
    if (this.metrics.boardHealthScore >= 90) {
      lines.push('✅ **Excellent**: Board is in great health!');
    } else if (this.metrics.boardHealthScore >= 70) {
      lines.push('🟡 **Good**: Board is healthy with minor issues.');
    } else if (this.metrics.boardHealthScore >= 50) {
      lines.push('🟠 **Fair**: Board has some issues that need attention.');
    } else {
      lines.push('🔴 **Poor**: Board needs immediate attention and healing.');
    }
    
    return lines.join('\n');
  }
}