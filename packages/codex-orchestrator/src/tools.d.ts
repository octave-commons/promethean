export declare function readFileSafe(p: string): Promise<string>;
export declare function summarize(s: string, maxLen?: number): string;
export declare function ripgrep(cwd: string, query: string): Promise<string>;
export declare function runTests(pattern?: string): Promise<{
    code: number;
    stdout: string;
    stderr: string;
}>;
export declare function applyPatch(repoRoot: string, diffText: string): Promise<{
    ok: boolean;
    output: string;
}>;
//# sourceMappingURL=tools.d.ts.map