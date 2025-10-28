type GitArguments = readonly string[];
export declare class GitCommandError extends Error {
    readonly args: GitArguments;
    constructor(message: string, args: GitArguments, cause?: unknown);
}
export type SandboxInfo = Readonly<{
    id: string;
    path: string;
    head: string;
    branch?: string;
}>;
export type CreateSandboxOptions = Readonly<{
    repoPath: string;
    sandboxId: string;
    ref?: string;
    branch?: string;
}>;
export declare const createSandbox: (options: CreateSandboxOptions) => Promise<SandboxInfo>;
export type ListSandboxesOptions = Readonly<{
    repoPath: string;
}>;
export declare const listSandboxes: (options: ListSandboxesOptions) => Promise<readonly SandboxInfo[]>;
export type RemoveSandboxOptions = Readonly<{
    repoPath: string;
    sandboxId: string;
}>;
export declare const removeSandbox: (options: RemoveSandboxOptions) => Promise<void>;
export {};
//# sourceMappingURL=git.d.ts.map