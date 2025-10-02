import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

export type McpTransport =
  | { kind: "http-stream"; url: string }
  | { kind: "http-sse"; url: string }
  | { kind: "stdio"; command: string; args?: string[] };

export interface McpMount {
  serverId: string;
  transport: McpTransport;
  metadata?: Record<string, unknown>;
}

export interface McpToolInvocationResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

export class McpError extends Error {
  constructor(
    readonly kind: "transport" | "remote",
    message: string,
    readonly details?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "McpError";
  }
}

type JsonRpcId = string | number;

type JsonRpcRequest = {
  readonly jsonrpc: "2.0";
  readonly id: JsonRpcId;
  readonly method: string;
  readonly params?: unknown;
};

type JsonRpcSuccess = {
  readonly jsonrpc: "2.0";
  readonly id: JsonRpcId;
  readonly result: unknown;
};

type JsonRpcFailure = {
  readonly jsonrpc: "2.0";
  readonly id: JsonRpcId;
  readonly error: {
    readonly code: number;
    readonly message: string;
    readonly data?: unknown;
  };
};

type JsonRpcResponse = JsonRpcSuccess | JsonRpcFailure;

export interface McpClientOptions {
  fetch?: typeof fetch;
  spawn?: typeof spawn;
}

interface JsonRpcTransport {
  request(payload: JsonRpcRequest): Promise<JsonRpcResponse>;
  close(): Promise<void>;
}

export class McpClient {
  private readonly transport: JsonRpcTransport;

  constructor(
    readonly mount: McpMount,
    options: McpClientOptions = {},
  ) {
    this.transport = createTransport(mount.transport, options);
  }

  async listTools(): Promise<unknown[]> {
    const result = await this.send("tools/list");
    if (
      result &&
      typeof result === "object" &&
      "tools" in result &&
      Array.isArray((result as { tools?: unknown[] }).tools)
    ) {
      return (result as { tools: unknown[] }).tools;
    }
    return [];
  }

  async listResources(): Promise<unknown[]> {
    const result = await this.send("resources/list");
    if (
      result &&
      typeof result === "object" &&
      "resources" in result &&
      Array.isArray((result as { resources?: unknown[] }).resources)
    ) {
      return (result as { resources: unknown[] }).resources;
    }
    return [];
  }

  async callTool(request: {
    name: string;
    args: unknown;
    ttlMs: number;
  }): Promise<McpToolInvocationResult> {
    try {
      const result = await this.send("tools/call", {
        name: request.name,
        arguments: request.args,
        ttlMs: request.ttlMs,
      });
      return { ok: true, result };
    } catch (error: unknown) {
      if (error instanceof McpError) {
        return {
          ok: false,
          error: `${error.kind}: ${error.message}`,
          result:
            error.kind === "remote" &&
            error.details &&
            typeof error.details === "object"
              ? error.details
              : undefined,
        };
      }
      return {
        ok: false,
        error: `unknown: ${(error as Error)?.message ?? "tool call failed"}`,
      };
    }
  }

  async close(): Promise<void> {
    await this.transport.close();
  }

  private async send(method: string, params?: unknown): Promise<unknown> {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: randomUUID(),
      method,
      params,
    };
    try {
      const response = await this.transport.request(request);
      if ("error" in response) {
        throw new McpError("remote", response.error.message, {
          code: response.error.code,
          data: response.error.data,
        });
      }
      return response.result;
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        "transport",
        `Failed to send ${method} to MCP server`,
        undefined,
        { cause: error },
      );
    }
  }
}

function createTransport(
  transport: McpTransport,
  options: McpClientOptions,
): JsonRpcTransport {
  switch (transport.kind) {
    case "http-stream":
      return new HttpJsonRpcTransport(
        transport.url,
        "http-stream",
        options.fetch ?? fetch,
      );
    case "http-sse":
      return new HttpJsonRpcTransport(
        transport.url,
        "http-sse",
        options.fetch ?? fetch,
      );
    case "stdio":
      return new StdioJsonRpcTransport(
        transport.command,
        transport.args ?? [],
        options.spawn ?? spawn,
      );
    default:
      throw new McpError(
        "transport",
        `Unsupported transport kind ${(transport as { kind: string }).kind}`,
      );
  }
}

class HttpJsonRpcTransport implements JsonRpcTransport {
  constructor(
    private readonly url: string,
    private readonly mode: "http-stream" | "http-sse",
    private readonly doFetch: typeof fetch,
  ) {}

  async request(payload: JsonRpcRequest): Promise<JsonRpcResponse> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (this.mode === "http-sse") {
      headers.accept = "text/event-stream";
    }
    try {
      const response = await this.doFetch(this.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new McpError(
          "transport",
          `HTTP ${response.status} ${response.statusText}`,
        );
      }
      const contentType = response.headers.get("content-type") ?? "";
      const bodyText = await response.text();
      const data =
        contentType.includes("text/event-stream") || this.mode === "http-sse"
          ? parseSseBody(bodyText)
          : parseJsonBody(bodyText);
      return asJsonRpcResponse(data);
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        "transport",
        `Failed to reach MCP server at ${this.url}`,
        undefined,
        { cause: error },
      );
    }
  }

  async close(): Promise<void> {
    // Stateless HTTP transport has nothing to close.
  }
}

class StdioJsonRpcTransport implements JsonRpcTransport {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly pending = new Map<
    string,
    {
      resolve: (value: JsonRpcResponse) => void;
      reject: (reason: unknown) => void;
    }
  >();
  private buffer = "";
  private closed = false;

  constructor(
    command: string,
    args: readonly string[] = [],
    spawnImpl: typeof spawn = spawn,
  ) {
    this.child = spawnImpl(command, [...args], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.child.stdout.setEncoding?.("utf8");
    this.child.stdout.on("data", (chunk) => this.onData(chunk));
    this.child.on("error", (error) =>
      this.rejectAll(
        new McpError("transport", error.message, undefined, { cause: error }),
      ),
    );
    this.child.on("exit", (code, signal) => {
      if (this.closed) return;
      const reason =
        code === null
          ? `Process exited via signal ${signal ?? "unknown"}`
          : `Process exited with code ${code}`;
      this.rejectAll(new McpError("transport", reason));
    });
  }

  async request(payload: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (!this.child.stdin.writable) {
      throw new McpError("transport", "MCP stdio transport is not writable");
    }
    const id = String(payload.id);
    return await new Promise<JsonRpcResponse>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const data = JSON.stringify(payload) + "\n";
      this.child.stdin.write(data, (error) => {
        if (error) {
          this.pending.delete(id);
          reject(
            new McpError("transport", error.message, undefined, {
              cause: error,
            }),
          );
        }
      });
    });
  }

  async close(): Promise<void> {
    this.closed = true;
    for (const [id, entry] of this.pending.entries()) {
      entry.reject(new McpError("transport", "Transport closed"));
      this.pending.delete(id);
    }
    this.child.stdin.end();
    if (this.child.exitCode === null) {
      this.child.kill();
      await once(this.child, "exit").catch(() => undefined);
    }
  }

  private onData(chunk: string | Buffer): void {
    this.buffer += chunk.toString();
    while (true) {
      const newline = this.buffer.indexOf("\n");
      if (newline === -1) {
        break;
      }
      const raw = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      if (!raw) {
        continue;
      }
      let payload: unknown;
      try {
        payload = JSON.parse(raw);
      } catch (error) {
        this.rejectAll(
          new McpError(
            "transport",
            "Received invalid JSON from MCP process",
            undefined,
            {
              cause: error,
            },
          ),
        );
        continue;
      }
      const response = asJsonRpcResponse(payload);
      const id = String(response.id);
      const handler = this.pending.get(id);
      if (handler) {
        this.pending.delete(id);
        handler.resolve(response);
      }
    }
  }

  private rejectAll(error: McpError): void {
    for (const [id, handler] of this.pending.entries()) {
      handler.reject(error);
      this.pending.delete(id);
    }
  }
}

function parseJsonBody(body: string): unknown {
  if (!body.trim()) {
    throw new McpError("transport", "Empty response body");
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new McpError("transport", "Invalid JSON body", undefined, {
      cause: error,
    });
  }
}

function parseSseBody(body: string): unknown {
  const lines = body.split(/\r?\n/);
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (dataLines.length === 0) {
    throw new McpError("transport", "No data frames in SSE response");
  }
  const payload = dataLines.join("\n").trim();
  if (!payload) {
    throw new McpError("transport", "Empty SSE data frame");
  }
  try {
    return JSON.parse(payload);
  } catch (error) {
    throw new McpError("transport", "Invalid SSE payload", undefined, {
      cause: error,
    });
  }
}

function asJsonRpcResponse(payload: unknown): JsonRpcResponse {
  if (!payload || typeof payload !== "object") {
    throw new McpError("transport", "Invalid JSON-RPC response payload");
  }
  const record = payload as Record<string, unknown>;
  if (record.jsonrpc !== "2.0" || record.id === undefined) {
    throw new McpError("transport", "Malformed JSON-RPC response");
  }
  if ("error" in record) {
    const error = record.error as {
      code: number;
      message: string;
      data?: unknown;
    };
    if (
      !error ||
      typeof error.message !== "string" ||
      typeof error.code !== "number"
    ) {
      throw new McpError("transport", "Malformed JSON-RPC error response");
    }
    return {
      jsonrpc: "2.0",
      id: record.id as JsonRpcId,
      error,
    };
  }
  if (!("result" in record)) {
    throw new McpError("transport", "Missing result in JSON-RPC response");
  }
  return {
    jsonrpc: "2.0",
    id: record.id as JsonRpcId,
    result: record.result,
  };
}
