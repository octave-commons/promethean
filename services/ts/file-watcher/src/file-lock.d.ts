export declare class FileLocks {
    private locks;
    isLocked(path: string): boolean;
    lock(path: string): void;
    unlock(path: string): void;
    unlockAfter(path: string, delay?: number): void;
}
//# sourceMappingURL=file-lock.d.ts.map