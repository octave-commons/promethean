import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

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

export class StdioHttpProxy {
  private readonly stdio: StdioClientTransport;
  private readonly http: StreamableHTTPServerTransport;

  constructor(
    readonly spec: StdioServerSpec,
    private readonly logger: (msg: string, ...rest: unknown[]) => void,
  ) {
    this.stdio = new StdioClientTransport({
      command: spec.command,
      args: [...spec.args],
      env: { ...spec.env },
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
