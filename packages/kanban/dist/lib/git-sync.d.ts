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
export declare class KanbanGitSync {
    private readonly git;
    private readonly options;
    private readonly callbacks;
    private syncInProgress;
    private lastStatus;
    /**
     * Creates a new KanbanGitSync instance
     * @param options - Configuration options for git synchronization
     * @param callbacks - Event callback functions
     */
    constructor(options: GitSyncOptions, callbacks?: GitSyncCallbacks);
    /**
     * Initializes the git synchronization service
     *
     * Validates that we're in a git repository, checks for remote connectivity,
     * and gets the initial status.
     * @throws Error if not in a git repository or other initialization failures
     */
    initialize(): Promise<void>;
    updateStatus(): Promise<GitSyncStatus>;
    /**
     * Automatically pushes changes to remote repository
     * @param message - Optional commit message
     * @returns True if push was successful, false otherwise
     */
    autoPush(message?: string): Promise<boolean>;
    /**
     * Automatically pulls changes from remote repository
     * @returns True if pull was successful, false otherwise
     */
    autoPull(): Promise<boolean>;
    syncWithRemote(): Promise<boolean>;
    checkForRemoteChanges(): Promise<boolean>;
    /**
     * Gets the last known git status
     * @returns GitSyncStatus or null if no status available
     */
    getStatus(): GitSyncStatus | null;
    /**
     * Checks if a sync operation is currently in progress
     * @returns True if syncing, false otherwise
     */
    isSyncInProgress(): boolean;
    /**
     * Attempts to resolve git conflicts using the specified strategy
     * @param strategy - Conflict resolution strategy
     * @returns True if conflicts were resolved, false otherwise
     */
    resolveConflicts(strategy: 'ours' | 'theirs' | 'manual'): Promise<boolean>;
}
export default KanbanGitSync;
//# sourceMappingURL=git-sync.d.ts.map