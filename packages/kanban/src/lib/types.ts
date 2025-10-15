export type Task = {
  uuid: string;
  title: string;
  status: string;
  priority?: string | number;
  labels?: string[];
  created_at?: string;
  estimates?: {
    complexity?: number;
    scale?: number;
    time_to_completion?: string;
  };
  content?: string;
  slug?: string;
  sourcePath?: string;
  corrections?: {
    count: number;
    history: Array<{
      timestamp: string;
      from: string;
      to: string;
      reason: string;
    }>;
  };
  // Epic functionality
  type?: 'task' | 'epic';
  epicId?: string; // If this is a subtask, references the epic UUID
  subtaskIds?: string[]; // If this is an epic, contains array of subtask UUIDs
  epicStatus?: 'pending' | 'in_progress' | 'completed' | 'blocked'; // Aggregate status of epic
};

export type ColumnData = {
  name: string;
  count: number;
  limit?: number | null;
  tasks: Task[];
};

export type Board = {
  columns: ColumnData[];
};

// Epic-specific types
export type EpicTask = Task & {
  type: 'epic';
  subtaskIds: string[];
  epicStatus: 'pending' | 'in_progress' | 'completed' | 'blocked';
};

export type Subtask = Task & {
  type: 'task';
  epicId: string;
};

export type EpicValidationResult = {
  allowed: boolean;
  reason?: string;
  blockedBy?: string[]; // UUIDs of subtasks blocking the transition
  warnings?: string[];
};

export type EpicTransitionRule = {
  fromStatus: string;
  toStatus: string;
  requiredSubtaskStatuses: string[];
  allowPartialCompletion: boolean;
};

// Re-export scar context types for convenience
export type {
  ScarContext,
  EventLogEntry,
  ScarRecord,
  SearchResult,
  LLMOperation,
  GitCommit,
  ScarContextOptions,
  HealingStatus,
  HealingResult,
} from './heal/scar-context-types.js';
