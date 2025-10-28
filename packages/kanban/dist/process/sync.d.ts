export type ProcessSyncOptions = {
    processFile?: string;
    owner?: string;
    repo?: string;
    token?: string;
};
export declare function processSync(opts?: ProcessSyncOptions): Promise<{
    readonly ok: true;
    readonly boardFile: string;
    readonly tasksDir: string;
    readonly processFile: string;
}>;
//# sourceMappingURL=sync.d.ts.map