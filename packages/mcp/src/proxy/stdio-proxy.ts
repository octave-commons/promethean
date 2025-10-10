import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

import type { StdioServerSpec } from "./config.js";

type JsonRpcWithId = JSONRPCMessage & { id: string | number };

const hasRequestId = (message: JSONRPCMessage): message is JsonRpcWithId =>
  typeof (message as { id?: unknown }).id === "string" ||
  typeof (message as { id?: unknown }).id === "number";

const isResponse = (message: JSONRPCMessage): boolean =>
  Object.prototype.hasOwnProperty.call(message, "result") ||
  Object.prototype.hasOwnProperty.call(message, "error");

const isRequest = (message: JSONRPCMessage): boolean =>
  typeof (message as { method?: unknown }).method === "string";

const isValidJsonRpcMessage = (message: unknown): boolean => {
  // Must be an object
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const msg = message as Record<string, unknown>;

  // Must have jsonrpc: "2.0"
  if (msg.jsonrpc !== "2.0") {
    return false;
  }

  // Must be either a request (has method) or a response (has result or error)
  const hasMethod = typeof msg.method === "string";
  const hasResult = "result" in msg;
  const hasError = "error" in msg;

  return hasMethod || hasResult || hasError;
};
export const createStdioEnv = (
  overrides: Readonly<Record<string, string>> = {},
  baseEnv: NodeJS.ProcessEnv = process.env,
  nodeExecPath: string = process.execPath,
): Readonly<Record<string, string>> => {
  const base = Object.fromEntries(
    Object.entries(baseEnv).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : [],
    ),
  );
  const initial: Record<string, string> = { ...base, ...overrides };

  const hasPath = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

  const candidatePath = hasPath(initial.PATH)
    ? initial.PATH
    : hasPath(initial.Path)
      ? initial.Path
      : "";

  const execDir = path.dirname(nodeExecPath);
  const segments = candidatePath
    .split(path.delimiter)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
  const withExec = segments.includes(execDir)
    ? segments
    : [...segments, execDir];
  const finalPath = withExec.join(path.delimiter);

  const result: Record<string, string> = { ...initial, PATH: finalPath };
  if (result.Path === undefined && typeof baseEnv.Path === "string") {
    return { ...result, Path: baseEnv.Path };
  }
  return result;
};

const pathExtensions = (
  env: Readonly<Record<string, string>>,
  platform: NodeJS.Platform,
): readonly string[] => {
  if (platform !== "win32") {
    return [""];
  }
  const raw = env.PATHEXT ?? process.env.PATHEXT;
  return raw ? raw.split(";") : [".EXE", ".CMD", ".BAT", ".COM"];
};

const isExecutableFile = (candidate: string): boolean => {
  try {
    const stat = fs.statSync(candidate);
    return stat.isFile() && (stat.mode & 0o111) !== 0;
  } catch {
    return false;
  }
};

export const resolveCommandPath = (
  command: string,
  env: Readonly<Record<string, string>>,
  platform: NodeJS.Platform = process.platform,
): string => {
  if (path.isAbsolute(command) || command.startsWith("." + path.sep)) {
    return command;
  }

  const pathValue = env.PATH ?? env.Path ?? process.env.PATH ?? "";
  const directories = pathValue.split(path.delimiter).filter(Boolean);
  const extensions = pathExtensions(env, platform);

  for (const dir of directories) {
    for (const ext of extensions) {
      const candidate = path.join(dir, ext ? `${command}${ext}` : command);
      if (isExecutableFile(candidate)) {
        return candidate;
      }
    }
  }

  return command;
};

export class StdioHttpProxy {
  private readonly stdio: StdioClientTransport;
  private readonly http: StreamableHTTPServerTransport;
  private rawStdoutBuffer = Buffer.from("");

  constructor(
    readonly spec: StdioServerSpec,
    private readonly logger: (msg: string, ...rest: unknown[]) => void,
  ) {
    const env = createStdioEnv(spec.env);
    const command = resolveCommandPath(spec.command, env);
    const args = [...spec.args];

    this.stdio = new StdioClientTransport({
      command,
      args,
      env,
      cwd: spec.cwd,
      stderr: "pipe",
    });

    this.http = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    // Hook into the stdio transport to capture raw stdout for debugging
    this.hookStdioOutput();

    this.http.onmessage = async (message: JSONRPCMessage) => {
      try {
        await this.stdio.send(message);
      } catch (error) {
        this.logger(
          `failed to forward message to stdio server ${spec.name}:`,
          error,
        );
        if (isRequest(message) && hasRequestId(message)) {
          const errorResponse: JSONRPCMessage = {
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32000,
              message: "Proxy failed to forward request to stdio server",
              data: error instanceof Error ? error.message : String(error),
            },
          };
          await this.http.send(errorResponse, {
            relatedRequestId: message.id,
          });
        }
      }
    };

    this.stdio.onmessage = async (rawMessage: unknown) => {
      try {
        // Validate that the message is a proper JSON-RPC message before processing
        if (!isValidJsonRpcMessage(rawMessage)) {
          this.logger(`[filtered debug output] ${spec.name}:`, rawMessage);
          return;
        }

        const message = rawMessage as JSONRPCMessage;
        const related =
          isResponse(message) && hasRequestId(message) ? message.id : undefined;
        await this.http.send(
          message,
          related === undefined ? undefined : { relatedRequestId: related },
        );
      } catch (error) {
        this.logger(`failed to send HTTP response for ${spec.name}:`, error);
      }
    };

    const stderr = this.stdio.stderr;
    if (stderr) {
      stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString().trim();
        if (text.length > 0) {
          this.logger(`[stderr] ${text}`);
        }
      });
    }

    this.stdio.onclose = () => {
      this.logger(`stdio transport closed for ${spec.name}`);
    };

    this.stdio.onerror = (error: unknown) => {
      this.logger(`stdio transport error for ${spec.name}:`, error);
    };
  }

  private hookStdioOutput(): void {
    // Try to access the underlying process stdout if available
    // This is a best-effort approach since the SDK may not expose this directly
    try {
      const stdioTransport = this.stdio as any;
      if (stdioTransport._process && stdioTransport._process.stdout) {
        const originalOnData = stdioTransport._process.stdout.listeners?.("data");
        if (originalOnData && Array.isArray(originalOnData)) {
          stdioTransport._process.stdout.removeAllListeners("data");
          
          stdioTransport._process.stdout.on("data", (chunk: Buffer) => {
            this.rawStdoutBuffer = Buffer.concat([this.rawStdoutBuffer, chunk]);
            
            // Try to extract complete lines from the buffer
            const data = this.rawStdoutBuffer.toString();
            const lines = data.split("\n");
            
            // Keep the incomplete last line in the buffer
            this.rawStdoutBuffer = Buffer.from(lines[lines.length - 1] || "", "utf-8");
            
            // Process complete lines
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i]?.trim() || "";
              if (line.length > 0) {
                // Check if this looks like a debug line (not JSON-RPC)
                if (!line.startsWith("{") || !line.endsWith("}")) {
                  this.logger(`[stdout debug] ${this.spec.name}: ${line}`);
                }
              }
            }
            
            // Call original listeners
            originalOnData.forEach((listener: (chunk: Buffer) => void) => {
              try {
                listener(chunk);
              } catch (error) {
                this.logger(`error in original stdout listener for ${this.spec.name}:`, error);
              }
            });
          });
        }
      }
    } catch (error) {
      // If we can't hook into stdout, that's okay - the message validation will still work
      this.logger(`could not hook stdout for ${this.spec.name}:`, error);
    }
  }

async start(): Promise<void> {
    await this.stdio.start();
    await this.http.start();
  }

  async handle(
    req: IncomingMessage,
    res: ServerResponse,
    parsedBody?: unknown,
  ): Promise<void> {
    if (
      this.http.sessionId !== undefined &&
      !req.headers["mcp-session-id"]
    ) {
      req.headers["mcp-session-id"] = this.http.sessionId;
    }
    await this.http.handleRequest(req, res, parsedBody);
  }

  get sessionId(): string | undefined {
    return this.http.sessionId;
  }

  async stop(): Promise<void> {
    await this.stdio.close();
    await this.http.close();
  }

}
