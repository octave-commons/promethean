import { Task, TaskSource, TaskTarget } from '../../types';

export abstract class BaseAdapter {
  protected config: TaskSource | TaskTarget;

  constructor(config: TaskSource | TaskTarget) {
    this.config = config;
  }

  abstract getTasks(options?: any): Promise<Task[]>;
  abstract createTask(task: Task): Promise<Task>;
  abstract updateTask(task: Task): Promise<Task>;
  abstract deleteTask(taskId: string): Promise<boolean>;
  abstract getTaskById(taskId: string): Promise<Task | null>;
  abstract testConnection(): Promise<boolean>;

  protected normalizeTask(rawTask: any, sourceType: string): Task {
    // Base normalization logic - can be overridden by specific adapters
    return {
      uuid: rawTask.uuid || rawTask.id || rawTask.taskId || '',
      title: rawTask.title || rawTask.name || '',
      content: rawTask.content || rawTask.description || rawTask.body || '',
      status: rawTask.status || 'todo',
      priority: rawTask.priority || rawTask.prio || 'P3',
      labels: Array.isArray(rawTask.labels) ? rawTask.labels : [],
      created_at: rawTask.created_at || rawTask.createdAt || new Date().toISOString(),
      updated_at: rawTask.updated_at || rawTask.updatedAt,
      estimates: rawTask.estimates || {},
      slug: rawTask.slug || '',
      source: sourceType,
      sourceId: rawTask.id || rawTask.uuid || ''
    };
  }

  protected serializeTask(task: Task): any {
    // Base serialization logic - can be overridden by specific adapters
    return {
      uuid: task.uuid,
      title: task.title,
      content: task.content,
      status: task.status,
      priority: task.priority,
      labels: task.labels,
      created_at: task.created_at,
      updated_at: task.updated_at,
      estimates: task.estimates,
      slug: task.slug
    };
  }
}