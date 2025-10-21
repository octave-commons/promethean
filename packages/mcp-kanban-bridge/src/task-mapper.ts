import { Task, TaskMapper } from './types';
import { z } from 'zod';

// MCP task schema (from external MCP systems)
const McpTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  due_date: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Kanban task schema (from @promethean/kanban)
const KanbanTaskSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  content: z.string().optional(),
  status: z.string(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  assignee: z.string().optional(),
  labels: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  dueDate: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export class DefaultTaskMapper implements TaskMapper {
  async mcpToKanban(mcpTask: any): Promise<Task> {
    const validated = McpTaskSchema.parse(mcpTask);

    return {
      id: validated.id,
      title: validated.title,
      description: validated.description,
      status: this.mapStatusToKanban(validated.status),
      priority: validated.priority || 'P2',
      assignee: validated.assignee,
      tags: validated.tags || [],
      createdAt: validated.created_at ? new Date(validated.created_at) : new Date(),
      updatedAt: validated.updated_at ? new Date(validated.updated_at) : new Date(),
      dueDate: validated.due_date ? new Date(validated.due_date) : undefined,
      metadata: {
        ...validated.metadata,
        source: 'mcp',
        originalId: validated.id,
      },
    };
  }

  async kanbanToMcp(kanbanTask: any): Promise<Task> {
    const validated = KanbanTaskSchema.parse(kanbanTask);

    return {
      id: validated.uuid,
      title: validated.title,
      description: validated.content,
      status: this.mapStatusToMcp(validated.status),
      priority: validated.priority || 'P2',
      assignee: validated.assignee,
      tags: validated.labels || [],
      createdAt: validated.created_at ? new Date(validated.created_at) : new Date(),
      updatedAt: validated.updated_at ? new Date(validated.updated_at) : new Date(),
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      metadata: {
        ...validated.metadata,
        source: 'kanban',
        originalId: validated.uuid,
      },
    };
  }

  async normalizeTask(task: any, source: 'mcp' | 'kanban'): Promise<Task> {
    if (source === 'mcp') {
      return this.mcpToKanban(task);
    } else {
      return this.kanbanToMcp(task);
    }
  }

  private mapStatusToKanban(status: string): string {
    // Map common MCP status values to Kanban column names
    const statusMap: Record<string, string> = {
      todo: 'incoming',
      in_progress: 'in_progress',
      doing: 'in_progress',
      done: 'completed',
      completed: 'completed',
      blocked: 'blocked',
      review: 'in_review',
      testing: 'testing',
      ready: 'ready',
      backlog: 'backlog',
    };

    return statusMap[status.toLowerCase()] || status;
  }

  private mapStatusToMcp(status: string): string {
    // Map Kanban column names back to common MCP status values
    const statusMap: Record<string, string> = {
      incoming: 'todo',
      backlog: 'todo',
      in_progress: 'in_progress',
      doing: 'in_progress',
      completed: 'done',
      done: 'done',
      blocked: 'blocked',
      in_review: 'review',
      testing: 'testing',
      ready: 'ready',
    };

    return statusMap[status.toLowerCase()] || status;
  }
}

// Factory for creating task mappers with custom configurations
export class TaskMapperFactory {
  static create(config?: {
    statusMappings?: {
      mcpToKanban?: Record<string, string>;
      kanbanToMcp?: Record<string, string>;
    };
  }): TaskMapper {
    if (config?.statusMappings) {
      return new ConfigurableTaskMapper(config.statusMappings);
    }

    return new DefaultTaskMapper();
  }
}

class ConfigurableTaskMapper implements TaskMapper {
  constructor(
    private statusMappings: {
      mcpToKanban?: Record<string, string>;
      kanbanToMcp?: Record<string, string>;
    },
  ) {}

  async mcpToKanban(mcpTask: any): Promise<Task> {
    const validated = McpTaskSchema.parse(mcpTask);
    const defaultMapper = new DefaultTaskMapper();
    const task = await defaultMapper.mcpToKanban(mcpTask);

    if (this.statusMappings.mcpToKanban) {
      task.status = this.statusMappings.mcpToKanban[validated.status] || task.status;
    }

    return task;
  }

  async kanbanToMcp(kanbanTask: any): Promise<Task> {
    const validated = KanbanTaskSchema.parse(kanbanTask);
    const defaultMapper = new DefaultTaskMapper();
    const task = await defaultMapper.kanbanToMcp(kanbanTask);

    if (this.statusMappings.kanbanToMcp) {
      task.status = this.statusMappings.kanbanToMcp[validated.status] || task.status;
    }

    return task;
  }

  async normalizeTask(task: any, source: 'mcp' | 'kanban'): Promise<Task> {
    if (source === 'mcp') {
      return this.mcpToKanban(task);
    } else {
      return this.kanbanToMcp(task);
    }
  }
}
