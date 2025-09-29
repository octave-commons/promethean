import type { UUID } from "./envelope.js";

export type ToolProvider = "native" | "mcp";

export interface ToolSchema {
  name: string;
  schema?: unknown;
}

export interface ToolResource {
  name: string;
  uri: string;
  title?: string;
}

export interface ToolAdvertisement {
  provider: ToolProvider;
  serverId?: string;
  tools: ToolSchema[];
  resources?: ToolResource[];
}

export interface ToolCall {
  callId: UUID;
  provider: ToolProvider;
  serverId?: string;
  name: string;
  args: unknown;
  ttlMs?: number;
}

export interface ToolResult {
  callId: UUID;
  ok: boolean;
  result?: unknown;
  error?: string;
  resources?: unknown[];
}
