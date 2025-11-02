import { randomUUID } from "node:crypto";
import type { Envelope } from "./types/envelope.js";
import type {
  ToolAdvertisement,
  ToolCall,
  ToolResult,
  ToolProvider,
  ToolResource,
} from "./types/tools.js";

export interface ToolDefinition {
  name: string;
  handler: (args: unknown) => Promise<unknown> | unknown;
  schema?: unknown;
  resources?: ToolResource[];
  timeoutMs?: number;
}

interface RegisteredTool {
  name: string;
  handler: (args: unknown) => Promise<unknown> | unknown;
  schema?: unknown;
  resources?: ToolResource[];
  timeoutMs?: number;
  provider: ToolProvider;
  serverId?: string;
}

function canonicalNow(): string {
  return new Date().toISOString();
}

function mkEnvelope<T>(type: string, payload: T): Envelope<T> {
  return {
    id: randomUUID(),
    ts: canonicalNow(),
    room: "tool",
    from: "enso-tool-registry",
    kind: "event",
    type,
    payload,
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  ttlMs: number | undefined,
  onTimeout: () => void,
): Promise<T> {
  if (!ttlMs || ttlMs <= 0) {
    return promise;
  }
  let timeoutHandle: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      onTimeout();
      reject(new Error("timeout"));
    }, ttlMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  register(
    provider: ToolProvider,
    definition: ToolDefinition,
    serverId?: string,
  ): void {
    const key = this.key(provider, definition.name, serverId);
    const record: RegisteredTool = {
      name: definition.name,
      handler: definition.handler,
      provider,
    };
    if (definition.schema !== undefined) {
      record.schema = definition.schema;
    }
    if (definition.resources && definition.resources.length > 0) {
      record.resources = [...definition.resources];
    }
    if (definition.timeoutMs !== undefined) {
      record.timeoutMs = definition.timeoutMs;
    }
    if (serverId) {
      record.serverId = serverId;
    }
    this.tools.set(key, record);
  }

  unregister(provider: ToolProvider, name: string, serverId?: string): boolean {
    return this.tools.delete(this.key(provider, name, serverId));
  }

  advertisement(provider: ToolProvider, serverId?: string): ToolAdvertisement {
    const tools = Array.from(this.tools.values()).filter(
      (tool) => tool.provider === provider && tool.serverId === serverId,
    );
    const resources: ToolResource[] = [];
    for (const tool of tools) {
      if (tool.resources) {
        resources.push(...tool.resources);
      }
    }
    const advert: ToolAdvertisement = {
      provider,
      tools: tools.map(({ name, schema }) => ({ name, schema })),
    };
    if (serverId) {
      advert.serverId = serverId;
    }
    if (resources.length) {
      advert.resources = resources;
    }
    return advert;
  }

  advertisementEnvelope(
    provider: ToolProvider,
    serverId?: string,
  ): Envelope<ToolAdvertisement> {
    return mkEnvelope("tool.advertise", this.advertisement(provider, serverId));
  }

  callEnvelope(call: ToolCall): Envelope<ToolCall> {
    return mkEnvelope("tool.call", call);
  }

  async invoke(call: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(
      this.key(call.provider, call.name, call.serverId),
    );
    if (!tool) {
      return {
        callId: call.callId,
        ok: false,
        error: `unknown tool: ${call.name}`,
      };
    }
    const ttl = call.ttlMs ?? tool.timeoutMs;
    let timedOut = false;
    try {
      const result = await withTimeout(
        Promise.resolve(tool.handler(call.args)),
        ttl,
        () => {
          timedOut = true;
        },
      );
      return {
        callId: call.callId,
        ok: true,
        result,
      };
    } catch (error) {
      if (timedOut) {
        return { callId: call.callId, ok: false, error: "timeout" };
      }
      return {
        callId: call.callId,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async invokeEnvelope(call: ToolCall): Promise<Envelope<ToolResult>> {
    const result = await this.invoke(call);
    return mkEnvelope("tool.result", result);
  }

  private key(provider: ToolProvider, name: string, serverId?: string): string {
    return `${provider}:${serverId ?? "_"}:${name}`;
  }
}
