export interface TaskSource {
  name: string;
  type: 'kanban' | 'github' | 'trello';
  enabled: boolean;
  config: Record<string, any>;
}

export interface TaskTarget {
  name: string;
  type: 'kanban' | 'github' | 'trello';
  enabled: boolean;
  config: Record<string, any>;
}

export interface SyncOperation {
  direction: 'pull' | 'push' | 'sync';
  sources: TaskSource[];
  targets: TaskTarget[];
  options: SyncOptions;
}

export interface SyncOptions {
  dryRun?: boolean;
  maxTasks?: number;
  filterByStatus?: string[];
  filterByLabel?: string[];
  force?: boolean;
  verbose?: boolean;
  deduplicationStrategy?: 'exact' | 'normalized' | 'slug-based' | 'fuzzy';
}

export interface Task {
  uuid: string;
  title: string;
  content?: string;
  status: string;
  priority: string;
  labels: string[];
  created_at: string;
  updated_at?: string;
  estimates?: Record<string, any>;
  slug?: string;
  source?: string;
  sourceId?: string;
}

export interface SyncResult {
  success: boolean;
  operation: SyncOperation;
  summary: {
    totalTasks: number;
    processedTasks: number;
    succeededTasks: number;
    failedTasks: number;
    conflicts: number;
  };
  errors: string[];
  conflicts: TaskConflict[];
  duration: number;
}

export interface TaskConflict {
  task: Task;
  sourceType: string;
  targetType: string;
  conflictType: 'duplicate' | 'status_mismatch' | 'content_mismatch' | 'version_conflict';
  sourceData: any;
  targetData: any;
  resolution?: 'keep_source' | 'keep_target' | 'merge' | 'skip';
}

export interface ManagerConfig {
  sources: TaskSource[];
  targets: TaskTarget[];
  defaultOptions: SyncOptions;
  conflictResolution: 'manual' | 'keep_source' | 'keep_target' | 'merge';
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
  };
}