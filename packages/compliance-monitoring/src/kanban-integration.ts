/**
 * Kanban System Integration
 * 
 * Integrates the compliance monitoring system with the existing
 * Promethean kanban package for seamless monitoring and enforcement.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { Task, Board } from './types.js';

export interface KanbanConfig {
  boardPath: string;
  tasksPath: string;
  configPath: string;
}

export interface KanbanTask {
  uuid: string;
  title: string;
  priority?: string;
  status?: string;
  content?: string;
  estimates?: {
    complexity?: number;
    time?: number;
  };
  tags?: string[];
  origin?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KanbanColumn {
  name: string;
  limit?: number;
  tasks: KanbanTask[];
  count: number;
}

/**
 * Kanban integration service
 */
export class KanbanIntegration {
  private config: KanbanConfig;
  private boardCache?: Board;
  private lastBoardUpdate?: Date;

  constructor(config: KanbanConfig) {
    this.config = config;
  }

  /**
   * Get current board state
   */
  async getCurrentBoard(): Promise<Board> {
    // Check cache validity
    if (this.boardCache && this.lastBoardUpdate) {
      const cacheAge = Date.now() - this.lastBoardUpdate.getTime();
      if (cacheAge < 30000) { // 30 seconds cache
        return this.boardCache;
      }
    }

    try {
      // Import kanban package dynamically
      const kanbanPath = resolve(process.cwd(), 'packages/kanban');
      if (existsSync(kanbanPath)) {
        const { getBoard } = await import('@promethean/kanban');
        this.boardCache = await getBoard();
      } else {
        // Fallback to file-based parsing
        this.boardCache = await this.parseBoardFromFile();
      }

      this.lastBoardUpdate = new Date();
      return this.boardCache;

    } catch (error) {
      console.error('Failed to get board from kanban package:', error);
      // Fallback to mock board for testing
      return this.getMockBoard();
    }
  }

  /**
   * Parse board from markdown file
   */
  private async parseBoardFromFile(): Promise<Board> {
    const boardPath = resolve(this.config.boardPath);
    
    if (!existsSync(boardPath)) {
      throw new Error(`Board file not found: ${boardPath}`);
    }

    const boardContent = readFileSync(boardPath, 'utf-8');
    const columns = this.parseMarkdownBoard(boardContent);
    
    return {
      columns,
      metadata: {
        lastUpdated: new Date(),
        totalTasks: columns.reduce((sum, col) => sum + col.count, 0)
      }
    };
  }

  /**
   * Parse kanban board from markdown format
   */
  private parseMarkdownBoard(content: string): KanbanColumn[] {
    const lines = content.split('\n');
    const columns: KanbanColumn[] = [];
    let currentColumn: KanbanColumn | null = null;

    for (const line of lines) {
      const headingMatch = line.match(/^##\s+(.+)$/);
      if (headingMatch) {
        if (currentColumn) {
          columns.push(currentColumn);
        }
        
        const title = headingMatch[1].trim();
        currentColumn = {
          name: title,
          limit: this.extractLimitFromTitle(title),
          tasks: [],
          count: 0
        };
        continue;
      }

      const taskMatch = line.match(/^- \[.\]\s+\[\[([^\]]+)\]\](?:\s+(.+))?$/);
      if (currentColumn && taskMatch) {
        const taskTitle = taskMatch[2] || taskMatch[1];
        const taskSlug = taskMatch[1];
        
        const task: KanbanTask = {
          uuid: this.generateTaskId(taskSlug),
          title: taskTitle,
          content: await this.loadTaskContent(taskSlug)
        };

        // Extract metadata from task content
        if (task.content) {
          this.extractTaskMetadata(task);
        }

        currentColumn.tasks.push(task);
        currentColumn.count++;
      }
    }

    if (currentColumn) {
      columns.push(currentColumn);
    }

    return columns;
  }

  /**
   * Extract WIP limit from column title
   */
  private extractLimitFromTitle(title: string): number | undefined {
    const limitMatch = title.match(/\((\d+)\)/);
    return limitMatch ? parseInt(limitMatch[1]) : undefined;
  }

  /**
   * Generate task ID from slug
   */
  private generateTaskId(slug: string): string {
    return slug.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  }

  /**
   * Load task content from file
   */
  private async loadTaskContent(slug: string): Promise<string | undefined> {
    try {
      const taskPath = resolve(this.config.tasksPath, `${slug}.md`);
      if (existsSync(taskPath)) {
        return readFileSync(taskPath, 'utf-8');
      }
    } catch (error) {
      // Task file not found, continue without content
    }
    return undefined;
  }

  /**
   * Extract metadata from task content
   */
  private extractTaskMetadata(task: KanbanTask): void {
    if (!task.content) return;

    // Extract priority
    const priorityMatch = task.content.match(/priority:\s*(P[0-3])/i);
    if (priorityMatch) {
      task.priority = priorityMatch[1];
    }

    // Extract estimates
    const complexityMatch = task.content.match(/complexity:\s*(\d+)/i);
    if (complexityMatch) {
      task.estimates = task.estimates || {};
      task.estimates.complexity = parseInt(complexityMatch[1]);
    }

    // Extract tags
    const tagMatches = task.content.matchAll(/#(\w+)/g);
    if (tagMatches) {
      task.tags = Array.from(tagMatches).map(match => `#${match[1]}`);
    }

    // Extract origin
    const originMatch = task.content.match(/origin:\s*([^\n]+)/i);
    if (originMatch) {
      task.origin = originMatch[1].trim();
    }
  }

  /**
   * Get mock board for testing/fallback
   */
  private getMockBoard(): Board {
    return {
      columns: [
        {
          name: 'In Progress',
          limit: 5,
          count: 2,
          tasks: [
            {
              uuid: 'task-1',
              title: 'Test Task 1',
              priority: 'P1',
              status: 'in_progress',
              content: 'Test content',
              estimates: { complexity: 3 }
            }
          ]
        },
        {
          name: 'Testing',
          limit: 5,
          count: 1,
          tasks: [
            {
              uuid: 'task-2',
              title: 'P0 Security Task',
              priority: 'P0',
              status: 'testing',
              content: 'Security implementation',
              estimates: { complexity: 5 }
            }
          ]
        }
      ],
      metadata: {
        lastUpdated: new Date(),
        totalTasks: 3
      }
    };
  }

  /**
   * Get task by UUID
   */
  async getTask(taskId: string): Promise<Task | undefined> {
    const board = await this.getCurrentBoard();
    
    for (const column of board.columns) {
      const task = column.tasks.find(t => t.uuid === taskId);
      if (task) {
        return task;
      }
    }
    
    return undefined;
  }

  /**
   * Get tasks by priority
   */
  async getTasksByPriority(priority: string): Promise<Task[]> {
    const board = await this.getCurrentBoard();
    const tasks: Task[] = [];
    
    for (const column of board.columns) {
      const columnTasks = column.tasks.filter(t => t.priority === priority);
      tasks.push(...columnTasks);
    }
    
    return tasks;
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: string): Promise<Task[]> {
    const board = await this.getCurrentBoard();
    const tasks: Task[] = [];
    
    for (const column of board.columns) {
      if (column.name.toLowerCase().includes(status.toLowerCase())) {
        tasks.push(...column.tasks);
      }
    }
    
    return tasks;
  }

  /**
   * Validate transition rules
   */
  async validateTransition(
    taskId: string,
    fromStatus: string,
    toStatus: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Import transition rules engine from kanban package
      const { TransitionRulesEngine } = await import('@promethean/kanban');
      
      const engine = new TransitionRulesEngine();
      await engine.initialize();
      
      const task = await this.getTask(taskId);
      if (!task) {
        return { allowed: false, reason: 'Task not found' };
      }
      
      const board = await this.getCurrentBoard();
      const result = await engine.validateTransition(fromStatus, toStatus, task, board);
      
      return {
        allowed: result.allowed,
        reason: result.allowed ? undefined : result.reason
      };
      
    } catch (error) {
      console.error('Failed to validate transition:', error);
      // Fallback to basic validation
      return this.validateTransitionBasic(fromStatus, toStatus);
    }
  }

  /**
   * Basic transition validation (fallback)
   */
  private validateTransitionBasic(
    fromStatus: string,
    toStatus: string
  ): { allowed: boolean; reason?: string } {
    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      'incoming': ['accepted'],
      'accepted': ['breakdown'],
      'breakdown': ['ready'],
      'ready': ['todo'],
      'todo': ['in_progress'],
      'in_progress': ['testing', 'todo'],
      'testing': ['review', 'in_progress'],
      'review': ['document', 'testing'],
      'document': ['done', 'review'],
      'done': ['archived']
    };

    const allowedTargets = validTransitions[fromStatus.toLowerCase()];
    if (!allowedTargets) {
      return { allowed: false, reason: `Unknown source status: ${fromStatus}` };
    }

    const isAllowed = allowedTargets.includes(toStatus.toLowerCase());
    if (!isAllowed) {
      return { 
        allowed: false, 
        reason: `Invalid transition from ${fromStatus} to ${toStatus}. Valid targets: ${allowedTargets.join(', ')}` 
      };
    }

    return { allowed: true };
  }

  /**
   * Get WIP limits for all columns
   */
  async getWIPLimits(): Promise<Map<string, number>> {
    const board = await this.getCurrentBoard();
    const limits = new Map<string, number>();
    
    for (const column of board.columns) {
      if (column.limit) {
        limits.set(column.name, column.limit);
      }
    }
    
    return limits;
  }

  /**
   * Check if column is over WIP limit
   */
  async isColumnOverLimit(columnName: string): Promise<boolean> {
    const board = await this.getCurrentBoard();
    const column = board.columns.find(c => c.name === columnName);
    
    if (!column || !column.limit) {
      return false;
    }
    
    return column.count > column.limit;
  }

  /**
   * Get board statistics
   */
  async getBoardStatistics(): Promise<{
    totalTasks: number;
    columnsCount: number;
    averageTasksPerColumn: number;
    columnsOverLimit: string[];
    p0TaskCount: number;
    tasksByPriority: Record<string, number>;
  }> {
    const board = await this.getCurrentBoard();
    const columnsOverLimit: string[] = [];
    const tasksByPriority: Record<string, number> = {};
    let p0TaskCount = 0;

    for (const column of board.columns) {
      if (column.limit && column.count > column.limit) {
        columnsOverLimit.push(column.name);
      }

      for (const task of column.tasks) {
        const priority = task.priority || 'UNSET';
        tasksByPriority[priority] = (tasksByPriority[priority] || 0) + 1;
        
        if (task.priority === 'P0') {
          p0TaskCount++;
        }
      }
    }

    return {
      totalTasks: board.metadata.totalTasks,
      columnsCount: board.columns.length,
      averageTasksPerColumn: board.metadata.totalTasks / board.columns.length,
      columnsOverLimit,
      p0TaskCount,
      tasksByPriority
    };
  }

  /**
   * Clear board cache
   */
  clearCache(): void {
    this.boardCache = undefined;
    this.lastBoardUpdate = undefined;
  }
}

/**
 * Create kanban integration with default paths
 */
export function createKanbanIntegration(basePath?: string): KanbanIntegration {
  const root = basePath || process.cwd();
  
  return new KanbanIntegration({
    boardPath: resolve(root, 'docs/agile/boards/kanban.md'),
    tasksPath: resolve(root, 'docs/agile/tasks'),
    configPath: resolve(root, 'promethean.kanban.json')
  });
}