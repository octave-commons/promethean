export type Status = 'open' | 'doing' | 'blocked' | 'done' | 'dropped';
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
  // Commit tracking for auditability
  lastCommitSha?: string;
  commitHistory?: ReadonlyArray<{
    sha: string;
    timestamp: string;
    message: string;
    author: string;
    type: 'create' | 'update' | 'status_change' | 'move';
  }>;
}>;

export type IndexedTask = TaskFM & Readonly<{ path: string; content?: string }>;
