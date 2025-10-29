/**
 * Git synchronization module - DISABLED
 * 
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import type { GitSyncOptions, GitSyncStatus, GitSyncCallbacks } from './git-sync.js';

/**
 * Status information for git synchronization - DISABLED VERSION
 */
export type GitSyncStatus = {
  readonly isClean: boolean;
  readonly hasChanges: boolean;
  readonly hasRemoteChanges: boolean;
  readonly lastSyncTime?: Date;
  readonly currentBranch: string;
  readonly aheadCount: number;
  readonly behindCount: number;
  readonly conflictCount: number;
};

/**
 * Configuration options for git synchronization - DISABLED VERSION
 */
export type GitSyncOptions = {
  readonly workingDir: string;
  readonly autoPush?: boolean;
  readonly autoPull?: boolean;
  readonly debounceMs?: number;
  readonly remoteName?: string;
  readonly branchName?: string;
};

/**
 * Callback functions for git synchronization events - DISABLED VERSION
 */
export type GitSyncCallbacks = {
  readonly onSyncStart?: (operation: 'push' | 'pull' | 'status') => void;
  readonly onSyncComplete?: (operation: 'push' | 'pull' | 'status', result: GitSyncStatus) => void;
  readonly onSyncError?: (operation: 'push' | 'pull' | 'status', error: Error) => void;
  readonly onConflict?: (conflictedFiles: ReadonlyArray<string>) => void;
};

/**
 * Git synchronization service for kanban development mode - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class KanbanGitSync {
  private readonly options: GitSyncOptions;
  private readonly callbacks: GitSyncCallbacks;
  private syncInProgress = false;
  private lastStatus: GitSyncStatus | null = null;

  constructor(options: GitSyncOptions, callbacks: GitSyncCallbacks = {}) {
    this.options = options;
    this.callbacks = callbacks;
    console.warn('[kanban-dev] Git sync is DISABLED - no git operations will be performed');
  }

  async initialize(): Promise<void> {
    console.warn('[kanban-dev] Git sync initialization skipped - functionality disabled');
    this.lastStatus = {
      isClean: true,
      hasChanges: false,
      hasRemoteChanges: false,
      currentBranch: 'main',
      aheadCount: 0,
      behindCount: 0,
      conflictCount: 0,
      lastSyncTime: new Date()
    };
  }

  async updateStatus(): Promise<GitSyncStatus> {
    const status = {
      isClean: true,
      hasChanges: false,
      hasRemoteChanges: false,
      currentBranch: 'main',
      aheadCount: 0,
      behindCount: 0,
      conflictCount: 0,
      lastSyncTime: new Date()
    };
    this.lastStatus = status;
    return status;
  }

  async autoPush(message?: string): Promise<boolean> {
    console.warn('[kanban-dev] Auto-push skipped - git functionality disabled');
    this.callbacks.onSyncStart?.('push');
    const status = await this.updateStatus();
    this.callbacks.onSyncComplete?.('push', status);
    return true;
  }

  async autoPull(): Promise<boolean> {
    console.warn('[kanban-dev] Auto-pull skipped - git functionality disabled');
    this.callbacks.onSyncStart?.('pull');
    const status = await this.updateStatus();
    this.callbacks.onSyncComplete?.('pull', status);
    return true;
  }

  async syncWithRemote(): Promise<boolean> {
    console.warn('[kanban-dev] Sync with remote skipped - git functionality disabled');
    return true;
  }

  async checkForRemoteChanges(): Promise<boolean> {
    console.warn('[kanban-dev] Check for remote changes skipped - git functionality disabled');
    return false;
  }

  getStatus(): GitSyncStatus | null {
    return this.lastStatus;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  async resolveConflicts(strategy: 'ours' | 'theirs' | 'manual'): Promise<boolean> {
    console.warn(`[kanban-dev] Conflict resolution skipped - git functionality disabled (strategy: ${strategy})`);
    if (strategy === 'manual') {
      console.log('[kanban-dev] No conflicts to resolve - git is disabled');
    }
    return true;
  }
}

export default KanbanGitSync;/**
 * Git synchronization module - DISABLED
 * 
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import type { GitSyncOptions, GitSyncStatus, GitSyncCallbacks } from './git-sync.js';

/**
 * Status information for git synchronization - DISABLED VERSION
 */
export type GitSyncStatus = {
  readonly isClean: boolean;
  readonly hasChanges: boolean;
  readonly hasRemoteChanges: boolean;
  readonly lastSyncTime?: Date;
  readonly currentBranch: string;
  readonly aheadCount: number;
  readonly behindCount: number;
  readonly conflictCount: number;
};

/**
 * Configuration options for git synchronization - DISABLED VERSION
 */
export type GitSyncOptions = {
  readonly workingDir: string;
  readonly autoPush?: boolean;
  readonly autoPull?: boolean;
  readonly debounceMs?: number;
  readonly remoteName?: string;
  readonly branchName?: string;
};

/**
 * Callback functions for git synchronization events - DISABLED VERSION
 */
export type GitSyncCallbacks = {
  readonly onSyncStart?: (operation: 'push' | 'pull' | 'status') => void;
  readonly onSyncComplete?: (operation: 'push' | 'pull' | 'status', result: GitSyncStatus) => void;
  readonly onSyncError?: (operation: 'push' | 'pull' | 'status', error: Error) => void;
  readonly onConflict?: (conflictedFiles: ReadonlyArray<string>) => void;
};

/**
 * Git synchronization service for kanban development mode - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class KanbanGitSync {
  private readonly options: GitSyncOptions;
  private readonly callbacks: GitSyncCallbacks;
  private syncInProgress = false;
  private lastStatus: GitSyncStatus | null = null;

  constructor(options: GitSyncOptions, callbacks: GitSyncCallbacks = {}) {
    this.options = options;
    this.callbacks = callbacks;
    console.warn('[kanban-dev] Git sync is DISABLED - no git operations will be performed');
  }

  async initialize(): Promise<void> {
    console.warn('[kanban-dev] Git sync initialization skipped - functionality disabled');
    this.lastStatus = {
      isClean: true,
      hasChanges: false,
      hasRemoteChanges: false,
      currentBranch: 'main',
      aheadCount: 0,
      behindCount: 0,
      conflictCount: 0,
      lastSyncTime: new Date()
    };
  }

  async updateStatus(): Promise<GitSyncStatus> {
    const status = {
      isClean: true,
      hasChanges: false,
      hasRemoteChanges: false,
      currentBranch: 'main',
      aheadCount: 0,
      behindCount: 0,
      conflictCount: 0,
      lastSyncTime: new Date()
    };
    this.lastStatus = status;
    return status;
  }

  async autoPush(message?: string): Promise<boolean> {
    console.warn('[kanban-dev] Auto-push skipped - git functionality disabled');
    this.callbacks.onSyncStart?.('push');
    const status = await this.updateStatus();
    this.callbacks.onSyncComplete?.('push', status);
    return true;
  }

  async autoPull(): Promise<boolean> {
    console.warn('[kanban-dev] Auto-pull skipped - git functionality disabled');
    this.callbacks.onSyncStart?.('pull');
    const status = await this.updateStatus();
    this.callbacks.onSyncComplete?.('pull', status);
    return true;
  }

  async syncWithRemote(): Promise<boolean> {
    console.warn('[kanban-dev] Sync with remote skipped - git functionality disabled');
    return true;
  }

  async checkForRemoteChanges(): Promise<boolean> {
    console.warn('[kanban-dev] Check for remote changes skipped - git functionality disabled');
    return false;
  }

  getStatus(): GitSyncStatus | null {
    return this.lastStatus;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  async resolveConflicts(strategy: 'ours' | 'theirs' | 'manual'): Promise<boolean> {
    console.warn(`[kanban-dev] Conflict resolution skipped - git functionality disabled (strategy: ${strategy})`);
    if (strategy === 'manual') {
      console.log('[kanban-dev] No conflicts to resolve - git is disabled');
    }
    return true;
  }
}

export default KanbanGitSync;