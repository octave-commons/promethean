export type TransitionResult = {
  allowed: boolean;
  reason: string;
  ruleViolations: string[];
  suggestions: string[];
  suggestedAlternatives: string[];
  warnings: string[];
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
  storyPoints?: number;
  frontmatter?: Record<string, any>;
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

export type Status = string;
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type Estimates = Readonly<{
  complexity?: number;
  scale?: string;
  time_to_completion?: string;
}>;

export type TaskFM = Readonly<{
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  owner: string;
  labels: ReadonlyArray<string>;
  created: string;
  updated?: string;
  uuid?: string;
  created_at?: string;
  rel?: {
    readonly blocks?: ReadonlyArray<string>;
    readonly blockedBy?: ReadonlyArray<string>;
    readonly links?: ReadonlyArray<string>;
  };
  milestone?: string;
  estimates?: Estimates;
  lastCommitSha?: string;
  commitHistory?: ReadonlyArray<{
    sha: string;
    timestamp: string;
    message: string;
    author: string;
    type: 'create' | 'update' | 'status_change' | 'move';
  }>;
}>;
