export type DirectoryContentCapture = {
    /**
     * When true, file contents are read for entries that match the capture filters.
     * Defaults to false to keep snapshots lightweight.
     */
    contents?: boolean;
    /**
     * Restrict captured file contents to entries whose names end with one of these suffixes.
     * When omitted, all files within the intent scope are eligible.
     */
    suffixes?: string[];
    /**
     * Encoding applied when reading file contents. `utf8` by default.
     */
    encoding?: BufferEncoding;
};

export type DirectoryIntentState = {
    /** Absolute path to the directory (or file parent) that should be synchronised. */
    path: string;
    /** Options forwarded to the directory walk helper. */
    walk?: import('../util.js').WalkOptions;
    /** Options forwarded to the tree builder helper. */
    tree?: import('../tree.js').TreeOptions;
    /** Optional file-content capture configuration. */
    capture?: DirectoryContentCapture;
};

export type DirectorySnapshotState = {
    /** List of entries returned from the latest walk. */
    entries: import('../util.js').FileEntry[];
    /** Optional structural tree representation. */
    tree: import('../tree.js').TreeNode | null;
    /** Relative path -> file payload map for captured contents. */
    files: Record<string, string>;
    /** Monotonically increasing version bumped whenever the snapshot changes. */
    version: number;
    /** Timestamp (ms) of the last successful refresh. */
    updatedAt: number;
    /** Cached signature used to detect changes across scans. */
    signature: string;
    /** Captured error if the walk failed. */
    error: { message: string } | null;
};

export type WriteBufferEntry = {
    path: string;
    data: string | Uint8Array;
    encoding?: BufferEncoding;
};

export type DeleteEntry = {
    path: string;
    recursive?: boolean;
};

export type WriteBufferState = {
    ensure: string[];
    writes: WriteBufferEntry[];
    deletes: DeleteEntry[];
    lastFlush?: {
        at: number;
        ensured: number;
        wrote: number;
        deleted: number;
        error?: { message: string } | null;
    };
};

export const defineFsComponents = (w: any) => {
    const DirectoryIntent = w.defineComponent({
        name: 'DirectoryIntent',
        defaults: () => ({
            path: '',
            walk: undefined,
            tree: undefined,
            capture: undefined,
        }),
    });

    const DirectorySnapshot = w.defineComponent({
        name: 'DirectorySnapshot',
        defaults: () => ({
            entries: [],
            tree: null,
            files: {},
            version: 0,
            updatedAt: 0,
            signature: '',
            error: null,
        }),
    });

    const WriteBuffer = w.defineComponent({
        name: 'WriteBuffer',
        defaults: () => ({ ensure: [], writes: [], deletes: [], lastFlush: undefined }),
    });

    return {
        DirectoryIntent,
        DirectorySnapshot,
        WriteBuffer,
    } as const;
};
