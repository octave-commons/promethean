/**
 * Git synchronization module - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

/**
 * Git sync status - DISABLED VERSION
 */
export interface GitSyncStatus {
  status: 'idle' | 'syncing' | 'error';
  lastSync?: Date;
  lastSyncTime?: Date;
  error?: string;
  ahead?: number;
  behind?: number;
}

/**
 * Git sync options - DISABLED VERSION
 */
export interface GitSyncOptions {
  autoPush?: boolean;
  autoPull?: boolean;
  remote?: string;
  branch?: string;
  syncInterval?: number;
}

/**
 * Git sync callbacks - DISABLED VERSION
 */
export interface GitSyncCallbacks {
  onSyncStart?: () => void;
  onSyncComplete?: (status: GitSyncStatus) => void;
  onSyncError?: (error: string) => void;
}

/**
 * Kanban git sync manager - DISABLED
 *
 * This class provides no-op implementations of all git sync functionality.
 * All methods return safe default values and log warnings about disabled git operations.
 */
export class KanbanGitSync {
  private options: Required<GitSyncOptions>;
  private status: GitSyncStatus;
  private callbacks: GitSyncCallbacks;
  public autoPush: boolean;
  public autoPull: boolean;

  constructor(_repoRoot: string, options: GitSyncOptions = {}, callbacks: GitSyncCallbacks = {}) {
    this.options = {
      autoPush: options.autoPush ?? false,
      autoPull: options.autoPull ?? false,
      remote: options.remote ?? 'origin',
      branch: options.branch ?? 'main',
      syncInterval: options.syncInterval ?? 60000,
    };
    this.callbacks = callbacks;
    this.status = { status: 'idle' };
    this.autoPush = this.options.autoPush;
    this.autoPull = this.options.autoPull;

    // Trigger callback if provided
    if (this.callbacks.onSyncStart) {
      this.callbacks.onSyncStart();
    }

    console.warn(
      `[KanbanGitSync] Git functionality is disabled for repo ${_repoRoot} - no git operations will be performed`,
    );
  }

  /**
   * Start automatic sync - DISABLED
   */
  async startAutoSync(): Promise<void> {
    console.warn('[KanbanGitSync] startAutoSync called but git is disabled');
  }

  /**
   * Stop automatic sync - DISABLED
   */
  async stopAutoSync(): Promise<void> {
    console.warn('[KanbanGitSync] stopAutoSync called but git is disabled');
  }

  /**
   * Perform manual sync - DISABLED
   */
  async sync(): Promise<GitSyncStatus> {
    console.warn('[KanbanGitSync] sync called but git is disabled');
    return {
      status: 'error',
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Get current sync status - DISABLED
   */
  getStatus(): GitSyncStatus {
    console.warn('[KanbanGitSync] getStatus called but git is disabled');
    return this.status;
  }

  /**
   * Push changes to remote - DISABLED
   */
  async push(message?: string): Promise<GitSyncStatus> {
    console.warn(`[KanbanGitSync] push called with message "${message}" but git is disabled`);
    return {
      status: 'error',
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Pull changes from remote - DISABLED
   */
  async pull(): Promise<GitSyncStatus> {
    console.warn('[KanbanGitSync] pull called but git is disabled');
    return {
      status: 'error',
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Auto push changes - DISABLED
   */
  async performAutoPush(message?: string): Promise<GitSyncStatus> {
    console.warn(
      `[KanbanGitSync] performAutoPush called with message "${message}" but git is disabled`,
    );
    return {
      status: 'error',
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Auto pull changes - DISABLED
   */
  async performAutoPull(): Promise<GitSyncStatus> {
    console.warn('[KanbanGitSync] performAutoPull called but git is disabled');
    return {
      status: 'error',
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Check if sync is needed - DISABLED
   */
  async needsSync(): Promise<boolean> {
    console.warn('[KanbanGitSync] needsSync called but git is disabled');
    return false;
  }

  /**
   * Initialize git sync - DISABLED
   */
  async initialize(): Promise<void> {
    console.warn('[KanbanGitSync] initialize called but git is disabled');
  }

  /**
   * Sync with remote - DISABLED
   */
  async syncWithRemote(): Promise<GitSyncStatus> {
    console.warn('[KanbanGitSync] syncWithRemote called but git is disabled');
    return {
      status: 'error',
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Check if sync is in progress - DISABLED
   */
  isSyncInProgress(): boolean {
    console.warn('[KanbanGitSync] isSyncInProgress called but git is disabled');
    return false;
  }

  /**
   * Check for remote changes - DISABLED
   */
  async checkForRemoteChanges(): Promise<boolean> {
    console.warn('[KanbanGitSync] checkForRemoteChanges called but git is disabled');
    return false;
  }

  /**
   * Resolve conflicts - DISABLED
   */
  async resolveConflicts(): Promise<GitSyncStatus> {
    console.warn('[KanbanGitSync] resolveConflicts called but git is disabled');
    return {
      status: 'error',
      error: 'Git functionality is disabled',
    };
  }
}

/**
 * Default git sync options - DISABLED
 */
export const DEFAULT_GIT_SYNC_OPTIONS: Required<GitSyncOptions> = {
  autoPush: false,
  autoPull: false,
  remote: 'origin',
  branch: 'main',
  syncInterval: 60000,
};

/**
 * Convenience function to create git sync manager - DISABLED
 */
export function createKanbanGitSync(
  repoRoot: string,
  options: GitSyncOptions = {},
  callbacks: GitSyncCallbacks = {},
): KanbanGitSync {
  console.warn(
    '[createKanbanGitSync] Git functionality is disabled - returning no-op sync manager',
  );
  return new KanbanGitSync(repoRoot, options, callbacks);
}

export default KanbanGitSync;
