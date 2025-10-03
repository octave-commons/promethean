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

    this.stdio.onmessage = async (message: JSONRPCMessage) => {
      try {
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

  async start(): Promise<void> {
    await this.stdio.start();
    await this.http.start();
  }

  async handle(
    req: IncomingMessage,
    res: ServerResponse,
    parsedBody?: unknown,
  ): Promise<void> {
    await this.http.handleRequest(req, res, parsedBody);
  }

  async stop(): Promise<void> {
    await this.stdio.close();
    await this.http.close();
  }
}
