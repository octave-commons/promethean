import type { ZodRawShape } from "zod";

// Tool context carried into each factory - env, fetch, now, and optional cache hooks.
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

// Piece of metadata about a tool. These feed straight into the agent ui:

// - inflight params & defaults
// - result shape
// - examples (runnable copy-paste)
// - notes (gotchas, etc).
export type ToolSpec = Readonly<{
  name: string;
  description: string;
  // IMPORTANT: the SDK expects a ZodRawShape (a flat object of fields), not a z.object(...)
  inputSchema?: ZodRawShape;
  outputSchema?: ZodRawShape;
  // New: agent-facing hints.
  examples?: ReadonlyArray<{ args: unknown; comment?: string }>;
  notes?: string;
}>;

// Runtime instance of a tool.
export type Tool = Readonly<{
  spec: ToolSpec;
  invoke: (args: unknown) => Promise<unknown>;
}>;

// Factory that creates a tool given the runtime context.
export type ToolFactory = (ctx: ToolContext) => Tool;

// Transports which can start/Stop the Model Control Protocol server.
export type Transport = Readonly<{
  start: (server?: unknown, options?: unknown) => Promise<void>;
  stop?: () => Promise<void>;
}>;
