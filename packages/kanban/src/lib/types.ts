// AI Learning System Types
export type AIPerformanceScore = {
  score: number; // -1 to 1 (negative = failed, positive = succeeded)
  scoreSource: 'deterministic' | 'user-feedback' | 'auto-eval';
  scoreReason?: string; // Why it got this score
  taskCategory?: string; // e.g., 'buildfix-ts-errors', 'code-review', 'tdd-analysis'
  executionTime?: number; // How long the response took to generate
  tokensUsed?: number; // Token usage for cost tracking
  modelName?: string; // Which AI model was used
  timestamp?: string; // When the performance was recorded
};

export type AIModelPerformance = {
  modelName: string;
  taskCategory: string;
  averageScore: number;
  totalJobs: number;
  successRate: number;
  averageExecutionTime: number;
  lastUpdated: string;
  recentScores: number[]; // Last 10 scores for trend analysis
};

export type AIRoutingDecision = {
  taskId?: string;
  prompt: string;
  taskCategory: string;
  selectedModel: string;
  alternativeModels: string[];
  confidence: number; // 0 to 1
  reasoning: string;
  timestamp: string;
};

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
  // Story points for agile estimation
  storyPoints?: number;
  // Epic functionality
  type?: 'task' | 'epic';
  epicId?: string; // If this is a subtask, references the epic UUID
  subtaskIds?: string[]; // If this is an epic, contains array of subtask UUIDs
  epicStatus?: 'pending' | 'in_progress' | 'completed' | 'blocked'; // Aggregate status of epic
  // AI Learning System
  aiPerformance?: AIPerformanceScore[];
  aiRouting?: AIRoutingDecision;
  // Frontmatter for file-based metadata
  frontmatter?: Record<string, any>;
  // Commit tracking for auditability
  lastCommitSha?: string;
  commitHistory?: Array<{
    sha: string;
    timestamp: string;
    message: string;
    author: string;
    type: 'create' | 'update' | 'status_change' | 'move';
  }>;
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
