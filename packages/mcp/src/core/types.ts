export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

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
  inputSchema?: Json;
  outputSchema?: Json;
}>;

export type Tool = Readonly<{
  spec: ToolSpec;
  invoke: (args: Json) => Promise<Json>;
}>;

export type ToolFactory = (ctx: ToolContext) => Tool;

export type Transport = Readonly<{
  start: (server: unknown) => Promise<void>;
  stop?: () => Promise<void>;
}>;
