import type { ZodRawShape } from "zod";

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
}>;

export type ToolSpec = Readonly<{
  name: string;
  description: string;
  // IMPORTANT: the SDK expects a ZodRawShape (a plain object of fields), not a z.object(...)
  inputSchema?: ZodRawShape;
  outputSchema?: ZodRawShape;
}>;

export type Tool = Readonly<{
  spec: ToolSpec;
  invoke: (args: unknown) => Promise<unknown>;
}>;

export type ToolFactory = (ctx: ToolContext) => Tool;

export type Transport = Readonly<{
  start: (server?: unknown, options?: unknown) => Promise<void>;
  stop?: () => Promise<void>;
}>;
