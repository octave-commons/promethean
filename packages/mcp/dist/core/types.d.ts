import type { ZodRawShape } from "zod";
export type ToolExample = Readonly<{
    args: Readonly<Record<string, unknown>>;
    comment?: string;
}>;
export type ToolSpec = Readonly<{
    name: string;
    description: string;
    inputSchema?: ZodRawShape;
    outputSchema?: ZodRawShape;
    stability?: "stable" | "experimental" | "deprecated";
    since?: string;
    examples?: ReadonlyArray<ToolExample>;
    notes?: string;
}>;
export type Tool = Readonly<{
    spec: ToolSpec;
    invoke: (args: unknown) => Promise<unknown>;
}>;
export type ToolContext = Readonly<{
    env: Readonly<Record<string, string | undefined>>;
    fetch: typeof fetch;
    now: () => Date;
    cache?: Readonly<{
        etagGet: (key: string) => Promise<string | undefined>;
        etagSet: (key: string, etag: string) => Promise<void>;
        getBody: (key: string) => Promise<Uint8Array | undefined>;
        setBody: (key: string, body: Uint8Array) => Promise<void>;
    }>;
    listTools?: () => readonly Tool[];
}>;
export type ToolFactory = (ctx: ToolContext) => Tool;
export type Transport = Readonly<{
    start: (server?: unknown, options?: unknown) => Promise<void>;
    stop?: () => Promise<void>;
}>;
//# sourceMappingURL=types.d.ts.map