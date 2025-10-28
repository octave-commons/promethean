import type { Tool, ToolContext, ToolFactory } from '../core/types.js';
export type FilterInput = string | readonly string[] | undefined;
export type PnpmResult = Readonly<{
    command: string;
    args: readonly string[];
    cwd: string;
    exitCode: number | null;
    signal?: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
    error?: string;
}>;
type PnpmExecutor = (args: readonly string[]) => Promise<PnpmResult>;
export declare const normalizeStringList: (value: string | readonly string[]) => readonly string[];
export declare const normalizeFilters: (filter?: FilterInput) => readonly string[];
export declare const buildPnpmArgs: (command: readonly string[], options?: Readonly<{
    filter?: FilterInput;
}>) => readonly string[];
export declare const pnpmInstall: ToolFactory;
export declare const pnpmAdd: ToolFactory;
export declare const pnpmRemove: ToolFactory;
export declare const pnpmRunScript: ToolFactory;
export declare const __test__: {
    createInstallTool: (ctx: ToolContext, exec?: PnpmExecutor) => Tool;
    createAddTool: (ctx: ToolContext, exec?: PnpmExecutor) => Tool;
    createRemoveTool: (ctx: ToolContext, exec?: PnpmExecutor) => Tool;
    createRunScriptTool: (ctx: ToolContext, exec?: PnpmExecutor) => Tool;
    createExecutor: (ctx: ToolContext) => PnpmExecutor;
    runPnpmCommand: (ctx: ToolContext, args: readonly string[]) => Promise<PnpmResult>;
    normalizeDependencies: (value: string | readonly string[]) => readonly string[];
};
export {};
//# sourceMappingURL=pnpm.d.ts.map