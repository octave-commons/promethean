export interface QueueOptions {
  name: string;
  concurrency?: number;
  timeout?: number;
}

export interface Task {
  id: string;
  data: any;
  priority?: number;
  createdAt: Date;
}

export class QueueManager {
  constructor(options: QueueOptions);
  add(task: Omit<Task, 'id' | 'createdAt'>): Promise<string>;
  process(handler: (task: Task) => Promise<any>): void;
  get(taskId: string): Promise<Task | null>;
  remove(taskId: string): Promise<boolean>;
  stats(): Promise<{ pending: number; processing: number; completed: number }>;
}

export function createQueueManager(options: QueueOptions): QueueManager;
