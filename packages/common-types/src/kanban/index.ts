import { z } from 'zod';

export type TaskStatus =
  | 'backlog'
  | 'ready'
  | 'in-progress'
  | 'testing'
  | 'done'
  | 'blocked'
  | 'archived';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TaskContext {
  readonly uuid: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly title: string;
  readonly description?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly assignee?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly dependencies?: ReadonlyArray<string>;
  readonly estimatedHours?: number;
  readonly actualHours?: number;
}

export interface KanbanColumn {
  readonly id: string;
  readonly name: string;
  readonly status: TaskStatus;
  readonly tasks: ReadonlyArray<string>; // Task UUIDs
  readonly wipLimit?: number;
  readonly order: number;
}

export interface KanbanBoard {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly columns: ReadonlyArray<KanbanColumn>;
  readonly tasks: ReadonlyArray<TaskContext>;
  readonly settings: Readonly<Record<string, unknown>>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TransitionRule {
  readonly from: TaskStatus;
  readonly to: TaskStatus;
  readonly condition?: (task: TaskContext, context: TransitionContext) => boolean;
  readonly action?: (task: TaskContext, context: TransitionContext) => Promise<void>;
  readonly requiredFields?: ReadonlyArray<string>;
  readonly blockedBy?: ReadonlyArray<TaskStatus>;
}

export interface TransitionContext {
  readonly board: KanbanBoard;
  readonly actor: string;
  readonly reason?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface TransitionEvent {
  readonly taskId: string;
  readonly fromStatus: TaskStatus;
  readonly toStatus: TaskStatus;
  readonly actor: string;
  readonly reason?: string;
  readonly timestamp: Date;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export const TaskStatusSchema = z.enum([
  'backlog',
  'ready',
  'in-progress',
  'testing',
  'done',
  'blocked',
  'archived',
]);

export const TaskPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);

export const TaskContextSchema = z.object({
  uuid: z.string(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  title: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
});

export const KanbanColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: TaskStatusSchema,
  tasks: z.array(z.string()),
  wipLimit: z.number().optional(),
  order: z.number(),
});

export const KanbanBoardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(KanbanColumnSchema),
  tasks: z.array(TaskContextSchema),
  settings: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TaskTransitionHandler = (
  task: TaskContext,
  context: TransitionContext,
) => Promise<boolean>;
export type BoardEventHandler = (event: TransitionEvent, board: KanbanBoard) => Promise<void>;
