import { loadKanbanConfig } from '../board/config.js';
import type { Board, ColumnData, Task } from './types.js';
import { columnKey, getColumn } from './kanban.js';
import { EventLogManager } from '../board/event-log.js';

/**
 * WIP limit validation result
 */
export interface WIPValidationResult {
  readonly valid: boolean;
  readonly current: number;
  readonly limit: number | null;
  readonly projected: number;
  readonly utilization: number;
  readonly violation?: {
    readonly reason: string;
    readonly severity: 'warning' | 'error' | 'critical';
    readonly suggestions: CapacitySuggestion[];
  };
}

/**
 * Capacity balancing suggestion
 */
export interface CapacitySuggestion {
  readonly action: 'move_tasks' | 'reorder_priority' | 'adjust_limit' | 'split_work';
  readonly description: string;
  readonly impact: {
    readonly fromColumn: string;
    readonly toColumn?: string;
    readonly taskCount: number;
    readonly capacityChange: number;
  };
  readonly tasks?: Task[];
  readonly priority: 'high' | 'medium' | 'low';
}

/**
 * Real-time capacity monitoring data
 */
export interface CapacityMonitor {
  readonly timestamp: string;
  readonly columns: ColumnCapacity[];
  readonly totalViolations: number;
  readonly utilization: {
    readonly average: number;
    readonly max: number;
    readonly min: number;
  };
}

/**
 * Column capacity information
 */
export interface ColumnCapacity {
  readonly name: string;
  readonly current: number;
  readonly limit: number | null;
  readonly utilization: number;
  readonly status: 'healthy' | 'warning' | 'violation' | 'critical';
  readonly tasks: Task[];
}

/**
 * WIP limit violation record for audit trail
 */
export interface WIPViolation {
  readonly id: string;
  readonly timestamp: string;
  readonly taskId: string;
  readonly taskTitle: string;
  readonly fromStatus: string;
  readonly toStatus: string;
  readonly column: string;
  readonly current: number;
  readonly limit: number;
  readonly utilization: number;
  readonly severity: 'warning' | 'error' | 'critical';
  readonly blocked: boolean;
  readonly overrideReason?: string;
  readonly overrideBy?: string;
  readonly suggestions: CapacitySuggestion[];
}

/**
 * WIP Limit Enforcement Engine
 * 
 * Provides comprehensive WIP limit validation, real-time monitoring,
 * capacity balancing suggestions, and audit trail functionality.
 */
export class WIPLimitEnforcement {
  private readonly config: Awaited<ReturnType<typeof loadKanbanConfig>>['config'];
  private readonly eventLogManager?: EventLogManager;
  private readonly violationHistory: WIPViolation[] = [];
  private readonly capacityCache = new Map<string, ColumnCapacity>();
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds

  constructor(dependencies?: {
    config?: Awaited<ReturnType<typeof loadKanbanConfig>>['config'];
    eventLogManager?: EventLogManager;
  }) {
    this.config = dependencies?.config || null;
    this.eventLogManager = dependencies?.eventLogManager;
  }

  /**
   * Validate WIP limits for a specific column
   */
  async validateWIPLimits(
    columnName: string,
    proposedChange: number = 0,
    board?: Board,
  ): Promise<WIPValidationResult> {
    const currentCount = await this.getColumnTaskCount(columnName, board);
    const limit = this.getColumnLimit(columnName);
    
    if (limit === null) {
      // No WIP limit configured for this column
      return {
        valid: true,
        current: currentCount,
        limit: null,
        projected: currentCount + proposedChange,
        utilization: 0,
      };
    }

    const projectedCount = currentCount + proposedChange;
    const utilization = (currentCount / limit) * 100;

    const valid = projectedCount <= limit;
    const severity = this.calculateViolationSeverity(projectedCount, limit);

    if (!valid) {
      const suggestions = await this.generateCapacitySuggestions(columnName, board);
      return {
        valid: false,
        current: currentCount,
        limit,
        projected: projectedCount,
        utilization,
        violation: {
          reason: `Target column '${columnName}' would exceed WIP limit (${projectedCount}/${limit})`,
          severity,
          suggestions,
        },
      };
    }

    // Check for warning threshold (80% utilization)
    if (utilization >= 80 && proposedChange > 0) {
      const suggestions = await this.generateCapacitySuggestions(columnName, board);
      return {
        valid: true,
        current: currentCount,
        limit,
        projected: projectedCount,
        utilization,
        violation: {
          reason: `Target column '${columnName}' approaching capacity limit (${utilization.toFixed(1)}% utilization)`,
          severity: 'warning',
          suggestions,
        },
      };
    }

    return {
      valid: true,
      current: currentCount,
      limit,
      projected: projectedCount,
      utilization,
    };
  }

  /**
   * Intercept and validate status transitions
   */
  async interceptStatusTransition(
    taskId: string,
    fromStatus: string,
    toStatus: string,
    board?: Board,
    options?: {
      force?: boolean;
      overrideReason?: string;
      overrideBy?: string;
    },
  ): Promise<{
    blocked: boolean;
    reason?: string;
    suggestions?: CapacitySuggestion[];
    violation?: WIPViolation;
  }> {
    // Validate the target column capacity
    const validation = await this.validateWIPLimits(toStatus, +1, board);

    if (!validation.valid && !options?.force) {
      const violation: WIPViolation = {
        id: this.generateViolationId(),
        timestamp: new Date().toISOString(),
        taskId,
        taskTitle: await this.getTaskTitle(taskId, board),
        fromStatus,
        toStatus,
        column: toStatus,
        current: validation.current,
        limit: validation.limit!,
        utilization: validation.utilization,
        severity: validation.violation!.severity,
        blocked: true,
        suggestions: validation.violation!.suggestions,
      };

      this.recordViolation(violation);

      return {
        blocked: true,
        reason: validation.violation!.reason,
        suggestions: validation.violation!.suggestions,
        violation,
      };
    }

    if (!validation.valid && options?.force) {
      // Admin override case
      const violation: WIPViolation = {
        id: this.generateViolationId(),
        timestamp: new Date().toISOString(),
        taskId,
        taskTitle: await this.getTaskTitle(taskId, board),
        fromStatus,
        toStatus,
        column: toStatus,
        current: validation.current,
        limit: validation.limit!,
        utilization: validation.utilization,
        severity: validation.violation!.severity,
        blocked: false,
        overrideReason: options.overrideReason,
        overrideBy: options.overrideBy || 'system',
        suggestions: validation.violation!.suggestions,
      };

      this.recordViolation(violation);

      // Log override to event log
      if (this.eventLogManager) {
        await this.eventLogManager.logTransition(
          taskId,
          fromStatus,
          toStatus,
          'system',
          `WIP limit override: ${options.overrideReason || 'Admin override'}`,
          {
            override: true,
            violationId: violation.id,
          },
        );
      }

      return {
        blocked: false,
        reason: `WIP limit overridden by admin: ${options.overrideReason || 'Admin override'}`,
        suggestions: validation.violation!.suggestions,
        violation,
      };
    }

    return { blocked: false };
  }

  /**
   * Generate capacity balancing suggestions for an over-capacity column
   */
  async generateCapacitySuggestions(
    overCapacityColumn: string,
    board?: Board,
  ): Promise<CapacitySuggestion[]> {
    const suggestions: CapacitySuggestion[] = [];
    const targetBoard = board || await this.loadBoard();

    // Find underutilized columns
    const underutilizedColumns = targetBoard.columns.filter(col => {
      if (columnKey(col.name) === columnKey(overCapacityColumn)) return false;
      if (!col.limit) return false; // Skip columns without limits
      
      const utilization = (col.tasks.length / col.limit) * 100;
      return utilization < 70; // Under 70% utilization
    });

    // Get tasks in over-capacity column, sorted by priority (lowest priority first)
    const overCapacityCol = targetBoard.columns.find(col => 
      columnKey(col.name) === columnKey(overCapacityColumn)
    );
    
    if (!overCapacityCol || !overCapacityCol.limit) {
      return suggestions;
    }

    const sortedTasks = [...overCapacityCol.tasks].sort((a, b) => {
      const priorityA = this.getPriorityNumeric(a.priority);
      const priorityB = this.getPriorityNumeric(b.priority);
      return priorityA - priorityB; // Lower priority first (easier to move)
    });

    const excessTasks = overCapacityCol.tasks.length - overCapacityCol.limit;

    // Suggest moving tasks to underutilized columns
    for (const targetColumn of underutilizedColumns) {
      if (excessTasks <= 0) break;

      const availableCapacity = targetColumn.limit! - targetColumn.tasks.length;
      const tasksToMove = Math.min(availableCapacity, excessTasks);
      
      if (tasksToMove > 0) {
        const movableTasks = sortedTasks.slice(0, tasksToMove);
        
        suggestions.push({
          action: 'move_tasks',
          description: `Move ${tasksToMove} lowest priority task(s) from ${overCapacityColumn} to ${targetColumn.name}`,
          impact: {
            fromColumn: overCapacityColumn,
            toColumn: targetColumn.name,
            taskCount: tasksToMove,
            capacityChange: -tasksToMove,
          },
          tasks: movableTasks,
          priority: this.calculateSuggestionPriority(overCapacityColumn, targetColumn.name, tasksToMove),
        });
      }
    }

    // Suggest priority reordering if no movement options
    if (suggestions.length === 0) {
      suggestions.push({
        action: 'reorder_priority',
        description: `Reorder tasks in ${overCapacityColumn} by priority to ensure highest value work stays`,
        impact: {
          fromColumn: overCapacityColumn,
          taskCount: overCapacityCol.tasks.length,
          capacityChange: 0,
        },
        priority: 'medium',
      });
    }

    // Suggest limit adjustment for chronic violations
    const recentViolations = this.getRecentViolations(overCapacityColumn, 24); // Last 24 hours
    if (recentViolations.length >= 3) {
      suggestions.push({
        action: 'adjust_limit',
        description: `Consider increasing WIP limit for ${overCapacityColumn} (recent violations: ${recentViolations.length})`,
        impact: {
          fromColumn: overCapacityColumn,
          taskCount: 0,
          capacityChange: 0,
        },
        priority: 'low',
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get real-time capacity monitoring data
   */
  async getCapacityMonitor(board?: Board): Promise<CapacityMonitor> {
    const targetBoard = board || await this.loadBoard();
    const columns: ColumnCapacity[] = [];
    let totalViolations = 0;
    const utilizationValues: number[] = [];

    for (const column of targetBoard.columns) {
      const current = column.tasks.length;
      const limit = column.limit;
      const utilization = limit ? (current / limit) * 100 : 0;
      
      let status: ColumnCapacity['status'] = 'healthy';
      if (limit && current > limit) {
        status = 'critical';
        totalViolations++;
      } else if (limit && utilization >= 90) {
        status = 'violation';
        totalViolations++;
      } else if (limit && utilization >= 80) {
        status = 'warning';
      }

      columns.push({
        name: column.name,
        current,
        limit,
        utilization,
        status,
        tasks: column.tasks,
      });

      if (limit) {
        utilizationValues.push(utilization);
      }
    }

    const avgUtilization = utilizationValues.length > 0 
      ? utilizationValues.reduce((sum, val) => sum + val, 0) / utilizationValues.length 
      : 0;

    return {
      timestamp: new Date().toISOString(),
      columns,
      totalViolations,
      utilization: {
        average: avgUtilization,
        max: Math.max(...utilizationValues, 0),
        min: Math.min(...utilizationValues, 0),
      },
    };
  }

  /**
   * Get violation history for compliance reporting
   */
  getViolationHistory(options?: {
    limit?: number;
    column?: string;
    severity?: 'warning' | 'error' | 'critical';
    since?: string;
  }): WIPViolation[] {
    let filtered = [...this.violationHistory];

    if (options?.column) {
      filtered = filtered.filter(v => columnKey(v.column) === columnKey(options.column!));
    }

    if (options?.severity) {
      filtered = filtered.filter(v => v.severity === options.severity);
    }

    if (options?.since) {
      const sinceDate = new Date(options.since);
      filtered = filtered.filter(v => new Date(v.timestamp) >= sinceDate);
    }

    // Sort by timestamp (most recent first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    timeframe: string;
    totalViolations: number;
    violationsByColumn: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    overrideRate: number;
    topViolatedColumns: Array<{ column: string; violations: number }>;
    recommendations: string[];
  }> {
    const now = new Date();
    const since = new Date();

    switch (timeframe) {
      case '24h':
        since.setDate(now.getDate() - 1);
        break;
      case '7d':
        since.setDate(now.getDate() - 7);
        break;
      case '30d':
        since.setDate(now.getDate() - 30);
        break;
    }

    const violations = this.getViolationHistory({ since: since.toISOString() });
    const overrides = violations.filter(v => v.overrideReason);

    const violationsByColumn: Record<string, number> = {};
    const violationsBySeverity: Record<string, number> = {};

    for (const violation of violations) {
      violationsByColumn[violation.column] = (violationsByColumn[violation.column] || 0) + 1;
      violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] || 0) + 1;
    }

    const topViolatedColumns = Object.entries(violationsByColumn)
      .map(([column, count]) => ({ column, violations: count }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 5);

    const recommendations = this.generateComplianceRecommendations(violations, violationsByColumn);

    return {
      timeframe,
      totalViolations: violations.length,
      violationsByColumn,
      violationsBySeverity,
      overrideRate: violations.length > 0 ? (overrides.length / violations.length) * 100 : 0,
      topViolatedColumns,
      recommendations,
    };
  }

  // Private helper methods

  private async loadBoard(): Promise<Board> {
    if (!this.config) {
      throw new Error('Kanban config not loaded');
    }
    
    const { loadBoard } = await import('./kanban.js');
    return loadBoard(this.config.boardFile, this.config.tasksDir);
  }

  private async getColumnTaskCount(columnName: string, board?: Board): Promise<number> {
    if (board) {
      const column = board.columns.find(col => columnKey(col.name) === columnKey(columnName));
      return column?.tasks.length || 0;
    }

    // Use cached data if available and fresh
    const cacheKey = columnKey(columnName);
    const cached = this.capacityCache.get(cacheKey);
    
    if (cached && Date.now() - this.lastCacheUpdate < this.CACHE_TTL) {
      return cached.current;
    }

    // Load fresh data
    const targetBoard = await this.loadBoard();
    const column = targetBoard.columns.find(col => columnKey(col.name) === cacheKey);
    const count = column?.tasks.length || 0;

    // Update cache
    this.capacityCache.set(cacheKey, {
      name: columnName,
      current: count,
      limit: this.getColumnLimit(columnName),
      utilization: this.getColumnLimit(columnName) ? (count / this.getColumnLimit(columnName)!) * 100 : 0,
      status: 'healthy',
      tasks: column?.tasks || [],
    });
    this.lastCacheUpdate = Date.now();

    return count;
  }

  private getColumnLimit(columnName: string): number | null {
    if (!this.config) return null;
    return this.config.wipLimits[columnName] || null;
  }

  private calculateViolationSeverity(projected: number, limit: number): 'warning' | 'error' | 'critical' {
    const utilization = (projected / limit) * 100;
    
    if (utilization > 120) return 'critical';
    if (utilization > 100) return 'error';
    if (utilization >= 80) return 'warning';
    
    return 'error'; // Default for over-limit
  }

  private async getTaskTitle(taskId: string, board?: Board): Promise<string> {
    if (board) {
      const task = board.columns.flatMap(col => col.tasks).find(t => t.uuid === taskId);
      return task?.title || taskId;
    }

    const targetBoard = await this.loadBoard();
    const task = targetBoard.columns.flatMap(col => col.tasks).find(t => t.uuid === taskId);
    return task?.title || taskId;
  }

  private getPriorityNumeric(priority: string | number | undefined): number {
    if (typeof priority === 'number') return priority;
    if (typeof priority === 'string') {
      const match = priority.match(/P(\d+)/i);
      if (match?.[1]) return parseInt(match[1], 10);
      if (priority.toLowerCase() === 'critical') return 0;
      if (priority.toLowerCase() === 'high') return 1;
      if (priority.toLowerCase() === 'medium') return 2;
      if (priority.toLowerCase() === 'low') return 3;
    }
    return 3; // Default to low priority
  }

  private calculateSuggestionPriority(
    fromColumn: string, 
    toColumn: string, 
    taskCount: number
  ): 'high' | 'medium' | 'low' {
    // High priority: Moving multiple tasks to significantly underutilized column
    if (taskCount >= 2) return 'high';
    
    // Medium priority: Single task movement
    if (taskCount === 1) return 'medium';
    
    // Low priority: Other suggestions
    return 'low';
  }

  private generateViolationId(): string {
    return `wip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordViolation(violation: WIPViolation): void {
    this.violationHistory.push(violation);
    
    // Keep only last 1000 violations to prevent memory issues
    if (this.violationHistory.length > 1000) {
      this.violationHistory.splice(0, this.violationHistory.length - 1000);
    }

    // Log to console for immediate visibility
    const icon = violation.severity === 'critical' ? '🚨' : 
                 violation.severity === 'error' ? '❌' : '⚠️';
    
    console.log(`${icon} WIP Limit Violation: ${violation.reason}`);
    if (violation.overrideReason) {
      console.log(`   🔓 Override: ${violation.overrideReason} by ${violation.overrideBy}`);
    }
  }

  private getRecentViolations(columnName: string, hours: number): WIPViolation[] {
    const since = new Date();
    since.setHours(since.getHours() - hours);
    
    return this.violationHistory.filter(v => 
      columnKey(v.column) === columnKey(columnName) && 
      new Date(v.timestamp) >= since
    );
  }

  private generateComplianceRecommendations(
    violations: WIPViolation[], 
    violationsByColumn: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    if (violations.length === 0) {
      recommendations.push('✅ No WIP limit violations detected in the specified timeframe');
      return recommendations;
    }

    // Identify chronic violators
    const chronicViolators = Object.entries(violationsByColumn)
      .filter(([_, count]) => count >= 3)
      .map(([column, count]) => ({ column, count }));

    if (chronicViolators.length > 0) {
      recommendations.push(
        `🔍 Consider reviewing WIP limits for columns with chronic violations: ${chronicViolators.map(c => c.column).join(', ')}`
      );
    }

    // Check override patterns
    const overrides = violations.filter(v => v.overrideReason);
    const overrideRate = violations.length > 0 ? (overrides.length / violations.length) * 100 : 0;
    
    if (overrideRate > 20) {
      recommendations.push(
        '⚠️ High override rate detected. Consider adjusting WIP limits or reviewing workflow processes'
      );
    }

    // Capacity balancing suggestions
    if (violations.some(v => v.severity === 'critical')) {
      recommendations.push(
        '🚨 Critical violations detected. Immediate capacity balancing required'
      );
    }

    return recommendations;
  }
}

/**
 * Create a WIP Limit Enforcement engine instance
 */
export async function createWIPLimitEnforcement(dependencies?: {
  config?: Awaited<ReturnType<typeof loadKanbanConfig>>['config'];
  eventLogManager?: EventLogManager;
}): Promise<WIPLimitEnforcement> {
  const config = dependencies?.config || (await loadKanbanConfig()).config;
  return new WIPLimitEnforcement({ config, ...dependencies });
}