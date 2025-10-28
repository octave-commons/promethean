/**
 * Core types for Kanban system
 * Extracted from kanban.ts for better organization
 */

// Define our own frontmatter type since the import is causing issues
export interface BaseFrontmatter {
  [key: string]: unknown;
}

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface TaskEstimates {
  storyPoints?: number;
  hours?: number;
  days?: number;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface Task {
  uuid: string;
  title: string;
  status: string;
  priority?: TaskPriority;
  labels?: string[];
  created_at: string;
  estimates?: TaskEstimates;
  content?: string;
  slug?: string;
  sourcePath?: string;
  blockedBy?: string[];
  blocking?: string[];
  assignee?: string;
  storyPoints?: number;
  tags?: string[];
  epic?: string;
  subtasks?: string[];
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface ColumnData {
  name: string;
  key: string;
  tasks: Task[];
  count: number;
  wipLimit?: number;
}

export interface Board {
  title: string;
  columns: ColumnData[];
  metadata?: Record<string, unknown>;
}

export interface EpicTask extends Omit<Task, 'subtasks'> {
  subtasks: Task[];
}

export interface CreateTaskInput {
  title: string;
  content?: string;
  body?: string;
  labels?: string[];
  priority?: Task['priority'];
  estimates?: Task['estimates'];
  created_at?: string;
  uuid?: string;
  slug?: string;
  templatePath?: string;
  defaultTemplatePath?: string;
  blocking?: string[];
  blockedBy?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  content?: string;
  status?: string;
  priority?: Task['priority'];
  labels?: string[];
  estimates?: Task['estimates'];
  assignee?: string;
  storyPoints?: number;
  tags?: string[];
  epic?: string;
  subtasks?: string[];
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface MoveTaskInput {
  fromColumn: string;
  toColumn: string;
  position?: number;
}

export interface TaskFilter {
  status?: string | string[];
  priority?: TaskPriority | TaskPriority[];
  labels?: string[];
  assignee?: string;
  tags?: string[];
  epic?: string;
  search?: string;
}

export interface TaskValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Frontmatter type for markdown parsing
export type KanbanFrontmatter = BaseFrontmatter & {
  title?: string;
  status?: string;
  priority?: TaskPriority;
  labels?: string[];
  created_at?: string;
  estimates?: TaskEstimates;
  uuid?: string;
  slug?: string;
  assignee?: string;
  storyPoints?: number;
  tags?: string[];
  epic?: string;
  subtasks?: string[];
  dependencies?: string[];
  metadata?: Record<string, unknown>;
};
