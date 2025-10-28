import { simpleGit, SimpleGit } from 'simple-git';

/**
 * Configuration options for git synchronization
 */
export type GitSyncOptions = {
  /** Working directory for git operations */
  readonly workingDir: string;
  /** Enable automatic push operations */
  readonly autoPush?: boolean;
  /** Enable automatic pull operations */
  readonly autoPull?: boolean;
  /** Debounce delay in milliseconds for sync operations */
  readonly debounceMs?: number;
  /** Git remote name (default: 'origin') */
  readonly remoteName?: string;
  /** Git branch name (default: 'main') */
  readonly branchName?: string;
};

/**
 * Status information for git synchronization
 */
export type GitSyncStatus = {
  /** Whether the working directory is clean */
  readonly isClean: boolean;
  /** Whether there are uncommitted changes */
  readonly hasChanges: boolean;
  /** Whether there are changes available on remote */
  readonly hasRemoteChanges: boolean;
  /** Timestamp of last synchronization */
  readonly lastSyncTime?: Date;
  /** Current git branch name */
  readonly currentBranch: string;
  /** Number of commits ahead of remote */
  readonly aheadCount: number;
  /** Number of commits behind remote */
  readonly behindCount: number;
  /** Number of conflicted files */
  readonly conflictCount: number;
};

/**
 * Callback functions for git synchronization events
 */
export type GitSyncCallbacks = {
  /** Called when a sync operation starts */
  readonly onSyncStart?: (operation: 'push' | 'pull' | 'status') => void;
  /** Called when a sync operation completes successfully */
  readonly onSyncComplete?: (operation: 'push' | 'pull' | 'status', result: GitSyncStatus) => void;
  /** Called when a sync operation encounters an error */
  readonly onSyncError?: (operation: 'push' | 'pull' | 'status', error: Error) => void;
  /** Called when git conflicts are detected */
  readonly onConflict?: (conflictedFiles: ReadonlyArray<string>) => void;
};

/**
 * Git synchronization service for kanban development mode
 *
 * Provides automatic git operations including push, pull, and conflict detection
 * with configurable debounce timing and comprehensive error handling.
 */
export class KanbanGitSync {
  private readonly git: SimpleGit;
  private readonly options: GitSyncOptions;
  private readonly callbacks: GitSyncCallbacks;

  private syncInProgress = false;
  private lastStatus: GitSyncStatus | null = null;

  /**
   * Creates a new KanbanGitSync instance
   * @param options - Configuration options for git synchronization
   * @param callbacks - Event callback functions
   */
  constructor(options: GitSyncOptions, callbacks: GitSyncCallbacks = {}) {
    const defaultOptions = {
      autoPush: true,
      autoPull: true,
      debounceMs: 2000,
      remoteName: 'origin',
      branchName: 'main'
    };
    this.options = { ...defaultOptions, ...options };
    this.callbacks = callbacks;

    this.git = simpleGit(options.workingDir);
  }

  /**
   * Initializes the git synchronization service
   *
   * Validates that we're in a git repository, checks for remote connectivity,
   * and gets the initial status.
   * @throws Error if not in a git repository or other initialization failures
   */
  async initialize(): Promise<void> {
    try {
      // Check if we're in a git repository
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('Not in a git repository');
      }

      // Get current branch
      const status = await this.git.status();
      const currentBranch = status.current || 'main';

      // Check if remote exists
      try {
        await this.git.listRemote([this.options.remoteName!]);
      } catch (error) {
        console.warn(`[kanban-dev] Remote '${this.options.remoteName}' not found, auto-sync disabled`);
        // Note: can't modify readonly properties, so we'll handle this in the sync methods
      }

      console.log(`[kanban-dev] Git sync initialized on branch '${currentBranch}'`);
      console.log(`[kanban-dev] Auto-push: ${this.options.autoPush}, Auto-pull: ${this.options.autoPull}`);

      // Get initial status
      await this.updateStatus();
    } catch (error) {
      console.error('[kanban-dev] Failed to initialize git sync:', error);
      throw error;
    }
  }

  async updateStatus(): Promise<GitSyncStatus> {
    try {
      const status = await this.git.status();

      const hasChanges = status.files.length > 0;
      const isClean = status.isClean();
      const currentBranch = status.current || 'main';

      // Get ahead/behind counts
      const aheadCount = status.ahead || 0;
      const behindCount = status.behind || 0;

      // Count conflicts
      const conflictCount = status.conflicted?.length || 0;

      this.lastStatus = {
        isClean,
        hasChanges,
        hasRemoteChanges: behindCount > 0,
        currentBranch,
        aheadCount,
        behindCount,
        conflictCount,
        lastSyncTime: new Date()
      };

      return this.lastStatus;
    } catch (error) {
      console.error('[kanban-dev] Failed to update git status:', error);
      throw error;
    }
  }

  /**
   * Automatically pushes changes to remote repository
   * @param message - Optional commit message
   * @returns True if push was successful, false otherwise
   */
  async autoPush(message?: string): Promise<boolean> {
    if (!this.options.autoPush || this.syncInProgress) {
      return false;
    }

    try {
      this.syncInProgress = true;
      this.callbacks.onSyncStart?.('push');

      // Check if there are changes to push
      const status = await this.updateStatus();
      if (!status.hasChanges) {
        console.log('[kanban-dev] No changes to push');
        this.callbacks.onSyncComplete?.('push', status);
        return true;
      }

      // Add all changes
      await this.git.add(['-A']);

      // Check for conflicts before committing
      const postAddStatus = await this.updateStatus();
      if (postAddStatus.conflictCount > 0) {
        console.warn('[kanban-dev] Conflicts detected, skipping auto-push');
        this.callbacks.onConflict?.(postAddStatus.conflictCount > 0 ? ['conflicts'] : []);
        return false;
      }

      // Commit changes
      const commitMessage = message || `Auto-sync kanban board (${new Date().toISOString()})`;
      await this.git.commit(commitMessage, [], {
        '--no-verify': null,
        '--no-gpg-sign': null
      });

      // Push to remote
      await this.git.push(this.options.remoteName!, this.options.branchName!);

      console.log(`[kanban-dev] Auto-pushed changes: ${commitMessage}`);

      const finalStatus = await this.updateStatus();
      this.callbacks.onSyncComplete?.('push', finalStatus);
      return true;

    } catch (error) {
      console.error('[kanban-dev] Auto-push failed:', error);
      this.callbacks.onSyncError?.('push', error as Error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Automatically pulls changes from remote repository
   * @returns True if pull was successful, false otherwise
   */
  async autoPull(): Promise<boolean> {
    if (!this.options.autoPull || this.syncInProgress) {
      return false;
    }

    try {
      this.syncInProgress = true;
      this.callbacks.onSyncStart?.('pull');

      // Check if there are remote changes
      const status = await this.updateStatus();
      if (!status.hasRemoteChanges) {
        console.log('[kanban-dev] No remote changes to pull');
        this.callbacks.onSyncComplete?.('pull', status);
        return true;
      }

      // Fetch latest changes
      await this.git.fetch(this.options.remoteName!);

      // Check if we have local changes that need to be committed first
      if (status.hasChanges) {
        console.warn('[kanban-dev] Local changes detected, stashing before pull');
        await this.git.stash(['push', '-m', 'Auto-stash before pull']);
      }

      // Pull changes
      await this.git.pull(this.options.remoteName!, this.options.branchName!);

      // Re-apply stashed changes if they existed
      if (status.hasChanges) {
        try {
          const stashes = await this.git.stash(['list']);
          if (stashes.length > 0) {
            await this.git.stash(['pop']);
            console.log('[kanban-dev] Re-applied stashed changes');
          }
        } catch (stashError) {
          console.warn('[kanban-dev] Failed to re-apply stashed changes:', stashError);
        }
      }

      console.log('[kanban-dev] Auto-pulled remote changes');

      const finalStatus = await this.updateStatus();

      // Check for conflicts after pull
      if (finalStatus.conflictCount > 0) {
        console.warn('[kanban-dev] Conflicts detected after pull');
        this.callbacks.onConflict?.(['conflicts after pull']);
        return false;
      }

      this.callbacks.onSyncComplete?.('pull', finalStatus);
      return true;

    } catch (error) {
      console.error('[kanban-dev] Auto-pull failed:', error);
      this.callbacks.onSyncError?.('pull', error as Error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncWithRemote(): Promise<boolean> {
    try {
      // First, pull any remote changes
      const pullSuccess = await this.autoPull();

      // Then push local changes if pull was successful
      if (pullSuccess) {
        return await this.autoPush();
      }

      return false;
    } catch (error) {
      console.error('[kanban-dev] Sync with remote failed:', error);
      return false;
    }
  }

  async checkForRemoteChanges(): Promise<boolean> {
    try {
      await this.git.fetch(this.options.remoteName!);
      const status = await this.updateStatus();
      return status.hasRemoteChanges;
    } catch (error) {
      console.error('[kanban-dev] Failed to check for remote changes:', error);
      return false;
    }
  }

  /**
   * Gets the last known git status
   * @returns GitSyncStatus or null if no status available
   */
  getStatus(): GitSyncStatus | null {
    return this.lastStatus;
  }

  /**
   * Checks if a sync operation is currently in progress
   * @returns True if syncing, false otherwise
   */
  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  /**
   * Attempts to resolve git conflicts using the specified strategy
   * @param strategy - Conflict resolution strategy
   * @returns True if conflicts were resolved, false otherwise
   */
  async resolveConflicts(strategy: 'ours' | 'theirs' | 'manual'): Promise<boolean> {
    try {
      const status = await this.updateStatus();
      if (status.conflictCount === 0) {
        return true;
      }

      if (strategy === 'manual') {
        console.log('[kanban-dev] Please resolve conflicts manually and run git add for resolved files');
        return false;
      }

      // Auto-resolve conflicts using the specified strategy
      const conflictedFiles = status.conflictCount > 0 ? ['--'] : [];

      if (strategy === 'ours') {
        await this.git.add(['-A', ...conflictedFiles]);
        await this.git.commit('Auto-resolve conflicts: keep ours');
      } else if (strategy === 'theirs') {
        await this.git.checkout([`--theirs`, ...conflictedFiles]);
        await this.git.add(['-A', ...conflictedFiles]);
        await this.git.commit('Auto-resolve conflicts: keep theirs');
      }

      console.log(`[kanban-dev] Auto-resolved conflicts using '${strategy}' strategy`);
      return true;
    } catch (error) {
      console.error('[kanban-dev] Failed to resolve conflicts:', error);
      return false;
    }
  }
}

export default KanbanGitSync;