import { Task, ConflictResolver } from './types.js';

export type ConflictResolutionStrategy =
  | 'mcp_wins'
  | 'kanban_wins'
  | 'most_recent'
  | 'manual'
  | 'merge';

export interface ConflictDetectionOptions {
  checkFields?: (keyof Task)[];
  ignoreFields?: (keyof Task)[];
  timestampTolerance?: number; // milliseconds
}

export interface MergeOptions {
  preferMcp?: string[];
  preferKanban?: string[];
  mergeFields?: string[];
}

export class DefaultConflictResolver implements ConflictResolver {
  constructor(
    private strategy: ConflictResolutionStrategy = 'most_recent',
    private options: ConflictDetectionOptions = {},
  ) {}

  detectConflict(mcpTask: Task, kanbanTask: Task): boolean {
    const fieldsToCheck = this.options.checkFields || [
      'title',
      'description',
      'status',
      'priority',
      'assignee',
      'tags',
    ];

    const ignoreFields = this.options.ignoreFields || [];
    const relevantFields = fieldsToCheck.filter((field) => !ignoreFields.includes(field));

    for (const field of relevantFields) {
      if (!this.areFieldsEqual(mcpTask[field], kanbanTask[field], field)) {
        return true;
      }
    }

    // Check timestamps if both exist
    if (mcpTask.updatedAt && kanbanTask.updatedAt) {
      const timeDiff = Math.abs(mcpTask.updatedAt.getTime() - kanbanTask.updatedAt.getTime());
      const tolerance = this.options.timestampTolerance || 5000; // 5 seconds default

      if (timeDiff > tolerance) {
        return true; // Different update times suggest potential conflict
      }
    }

    return false;
  }

  async resolve(mcpTask: Task, kanbanTask: Task): Promise<Task> {
    switch (this.strategy) {
      case 'mcp_wins':
        return this.resolveWithMcpWins(mcpTask, kanbanTask);

      case 'kanban_wins':
        return this.resolveWithKanbanWins(mcpTask, kanbanTask);

      case 'most_recent':
        return this.resolveWithMostRecent(mcpTask, kanbanTask);

      case 'merge':
        return this.resolveWithMerge(mcpTask, kanbanTask);

      case 'manual':
        throw new Error('Manual conflict resolution requires human intervention');

      default:
        throw new Error(`Unknown conflict resolution strategy: ${this.strategy}`);
    }
  }

  private resolveWithMcpWins(mcpTask: Task, kanbanTask: Task): Task {
    return {
      ...mcpTask,
      metadata: {
        ...mcpTask.metadata,
        conflictResolved: true,
        resolutionStrategy: 'mcp_wins',
        originalKanbanData: kanbanTask,
        resolvedAt: new Date().toISOString(),
      },
    };
  }

  private resolveWithKanbanWins(mcpTask: Task, kanbanTask: Task): Task {
    return {
      ...kanbanTask,
      id: mcpTask.id, // Keep MCP ID for consistency
      metadata: {
        ...kanbanTask.metadata,
        conflictResolved: true,
        resolutionStrategy: 'kanban_wins',
        originalMcpData: mcpTask,
        resolvedAt: new Date().toISOString(),
      },
    };
  }

  private resolveWithMostRecent(mcpTask: Task, kanbanTask: Task): Task {
    const mcpTime = mcpTask.updatedAt?.getTime() || 0;
    const kanbanTime = kanbanTask.updatedAt?.getTime() || 0;

    const winner = mcpTime > kanbanTime ? mcpTask : kanbanTask;
    const loser = mcpTime > kanbanTime ? kanbanTask : mcpTask;

    return {
      ...winner,
      metadata: {
        ...winner.metadata,
        conflictResolved: true,
        resolutionStrategy: 'most_recent',
        originalData: loser,
        resolvedAt: new Date().toISOString(),
      },
    };
  }

  private resolveWithMerge(mcpTask: Task, kanbanTask: Task): Task {
    const mergedTask: Task = {
      id: mcpTask.id, // Keep MCP ID
      title: this.mergeField(mcpTask.title, kanbanTask.title, 'title'),
      description: this.mergeField(mcpTask.description, kanbanTask.description, 'description'),
      status: this.mergeStatus(mcpTask.status, kanbanTask.status),
      priority: this.mergePriority(mcpTask.priority, kanbanTask.priority),
      assignee: this.mergeField(mcpTask.assignee, kanbanTask.assignee, 'assignee'),
      tags: this.mergeTags(mcpTask.tags, kanbanTask.tags),
      createdAt:
        mcpTask.createdAt < kanbanTask.createdAt ? mcpTask.createdAt : kanbanTask.createdAt,
      updatedAt: new Date(), // Set to now since we're merging
      dueDate: this.mergeField(mcpTask.dueDate, kanbanTask.dueDate, 'dueDate'),
      metadata: {
        ...mcpTask.metadata,
        ...kanbanTask.metadata,
        conflictResolved: true,
        resolutionStrategy: 'merge',
        originalMcpData: mcpTask,
        originalKanbanData: kanbanTask,
        resolvedAt: new Date().toISOString(),
      },
    };

    return mergedTask;
  }

  private mergeField(mcpValue: any, kanbanValue: any, fieldName: string): any {
    // Simple merge strategy - prefer non-null/non-empty values
    if (mcpValue && !kanbanValue) return mcpValue;
    if (!mcpValue && kanbanValue) return kanbanValue;

    // For strings, concatenate if both exist and are different
    if (typeof mcpValue === 'string' && typeof kanbanValue === 'string') {
      if (mcpValue !== kanbanValue) {
        return `${mcpValue} (merged with: ${kanbanValue})`;
      }
    }

    // For arrays, merge and deduplicate
    if (Array.isArray(mcpValue) && Array.isArray(kanbanValue)) {
      return [...new Set([...mcpValue, ...kanbanValue])];
    }

    // Default to MCP value
    return mcpValue;
  }

  private mergeStatus(mcpStatus: string, kanbanStatus: string): string {
    // Status merge logic - prefer more "advanced" status
    const statusHierarchy = [
      'incoming',
      'backlog',
      'in_progress',
      'doing',
      'in_review',
      'testing',
      'ready',
      'completed',
      'done',
    ];

    const mcpIndex = statusHierarchy.indexOf(mcpStatus.toLowerCase());
    const kanbanIndex = statusHierarchy.indexOf(kanbanStatus.toLowerCase());

    if (mcpIndex === -1 && kanbanIndex === -1) return mcpStatus;
    if (mcpIndex === -1) return kanbanStatus;
    if (kanbanIndex === -1) return mcpStatus;

    return mcpIndex > kanbanIndex ? mcpStatus : kanbanStatus;
  }

  private mergePriority(mcpPriority: string, kanbanPriority: string): string {
    // Priority merge - prefer higher priority (lower number)
    const priorityOrder = ['P0', 'P1', 'P2', 'P3'];
    const mcpIndex = priorityOrder.indexOf(mcpPriority);
    const kanbanIndex = priorityOrder.indexOf(kanbanPriority);

    if (mcpIndex === -1 && kanbanIndex === -1) return mcpPriority;
    if (mcpIndex === -1) return kanbanPriority;
    if (kanbanIndex === -1) return mcpPriority;

    return mcpIndex < kanbanIndex ? mcpPriority : kanbanPriority;
  }

  private mergeTags(mcpTags: string[], kanbanTags: string[]): string[] {
    const allTags = [...(mcpTags || []), ...(kanbanTags || [])];
    return [...new Set(allTags)]; // Deduplicate
  }

  private areFieldsEqual(value1: any, value2: any, field: keyof Task): boolean {
    // Handle different field types appropriately
    switch (field) {
      case 'tags':
        if (!Array.isArray(value1) || !Array.isArray(value2)) return false;
        return JSON.stringify(value1.sort()) === JSON.stringify(value2.sort());

      case 'createdAt':
      case 'updatedAt':
      case 'dueDate':
        if (!value1 && !value2) return true;
        if (!value1 || !value2) return false;
        return value1.getTime() === value2.getTime();

      default:
        return value1 === value2;
    }
  }
}

export class ConfigurableConflictResolver implements ConflictResolver {
  constructor(
    private strategy: ConflictResolutionStrategy,
    private mergeOptions: MergeOptions = {},
  ) {}

  detectConflict(mcpTask: Task, kanbanTask: Task): boolean {
    const defaultResolver = new DefaultConflictResolver('most_recent');
    return defaultResolver.detectConflict(mcpTask, kanbanTask);
  }

  async resolve(mcpTask: Task, kanbanTask: Task): Promise<Task> {
    if (this.strategy !== 'merge') {
      const defaultResolver = new DefaultConflictResolver(this.strategy);
      return defaultResolver.resolve(mcpTask, kanbanTask);
    }

    return this.resolveWithCustomMerge(mcpTask, kanbanTask);
  }

  private resolveWithCustomMerge(mcpTask: Task, kanbanTask: Task): Task {
    const mergedTask: Task = {
      id: mcpTask.id,
      title: mcpTask.title,
      description: mcpTask.description,
      status: mcpTask.status,
      priority: mcpTask.priority,
      assignee: mcpTask.assignee,
      tags: mcpTask.tags,
      createdAt: mcpTask.createdAt,
      updatedAt: new Date(),
      dueDate: mcpTask.dueDate,
      metadata: {
        ...mcpTask.metadata,
        conflictResolved: true,
        resolutionStrategy: 'custom_merge',
        originalMcpData: mcpTask,
        originalKanbanData: kanbanTask,
        resolvedAt: new Date().toISOString(),
      },
    };

    // Apply custom merge preferences
    for (const field of this.mergeOptions.preferMcp || []) {
      if (field in mcpTask) {
        (mergedTask as any)[field] = mcpTask[field as keyof Task];
      }
    }

    for (const field of this.mergeOptions.preferKanban || []) {
      if (field in kanbanTask) {
        (mergedTask as any)[field] = kanbanTask[field as keyof Task];
      }
    }

    return mergedTask;
  }
}

export class ConflictResolverFactory {
  static create(
    strategy: ConflictResolutionStrategy,
    options?: ConflictDetectionOptions & MergeOptions,
  ): ConflictResolver {
    if (strategy === 'merge' && options && ('preferMcp' in options || 'preferKanban' in options)) {
      return new ConfigurableConflictResolver(strategy, options as MergeOptions);
    }

    return new DefaultConflictResolver(strategy, options);
  }
}
