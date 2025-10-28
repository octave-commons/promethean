import type { Tool, ToolFactory, ToolContext } from './types.js';
export declare const buildRegistry: (factories: readonly ToolFactory[], ctx: ToolContext, toolNames?: readonly string[]) => Readonly<{
    list: () => readonly Tool[];
    get: (name: string) => Readonly<{
        spec: import("./types.js").ToolSpec;
        invoke: (args: unknown) => Promise<unknown>;
    }> | undefined;
}>;
//# sourceMappingURL=registry.d.ts.map