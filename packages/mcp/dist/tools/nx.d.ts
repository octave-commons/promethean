import type { ToolContext, ToolFactory } from '../core/types.js';
declare const PRESETS: readonly ["ts-lib", "base", "web-frontend", "fastify-service"];
export type NxPreset = (typeof PRESETS)[number];
export type NxGenerateResult = Readonly<{
    command: string;
    args: readonly string[];
    cwd: string;
    exitCode: number | null;
    signal?: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
    error?: string;
}>;
type NxExecutor = (args: readonly string[]) => Promise<NxGenerateResult>;
export declare const resolvePreset: (input?: string) => NxPreset;
export declare const buildNxGenerateArgs: (options: Readonly<{
    name: string;
    preset: NxPreset;
    dryRun: boolean;
}>) => readonly string[];
export declare const nxGeneratePackage: ToolFactory;
export declare const __test__: {
    createTool: (_ctx: ToolContext, executor: NxExecutor) => ReturnType<ToolFactory>;
    resolvePreset: (input?: string) => NxPreset;
    buildNxGenerateArgs: (options: Readonly<{
        name: string;
        preset: NxPreset;
        dryRun: boolean;
    }>) => readonly string[];
    runNxCommand: (ctx: ToolContext, args: readonly string[]) => Promise<NxGenerateResult>;
};
export {};
//# sourceMappingURL=nx.d.ts.map