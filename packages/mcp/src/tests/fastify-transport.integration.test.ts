import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import type { IncomingMessage, ServerResponse } from "node:http";

import test from "ava";
import esmock from "esmock";

import { fastifyTransport } from "../core/transports/fastify.js";
import type { HttpEndpointDescriptor } from "../core/transports/fastify.js";
import { createMcpServer } from "../core/mcp-server.js";
import type { StdioServerSpec } from "../proxy/config.js";

const allocatePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", (error) => {
      server.close();
      reject(error);
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo | null;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        if (!address) {
          reject(new Error("Failed to allocate ephemeral port"));
          return;
        }
        resolve(address.port);
      });
    });
  });

test("fastify transport forwards proxy requests", async (t) => {
  const forwardedBodies: unknown[] = [];
  let httpStarts = 0;
  let httpStops = 0;
  let stdioStarts = 0;
  let stdioStops = 0;

  class FakeStreamableHTTPServerTransport {
    public onmessage?: (message: unknown) => void | Promise<void>;

    constructor(_options?: unknown) {}

    async start(): Promise<void> {
      httpStarts += 1;
    }

    async handleRequest(
      _req: IncomingMessage,
      res: ServerResponse,
      body?: unknown,
    ): Promise<void> {
      forwardedBodies.push(body);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    }

    async close(): Promise<void> {
      httpStops += 1;
    }

    async send(): Promise<void> {
      // no-op for tests
    }
  }

  class FakeStdioClientTransport {
    public stderr = {
      on: (_event: string, _listener: (chunk: Buffer) => void) => {
        // ignore stderr output in tests
      },
    } as const;

    async start(): Promise<void> {
      stdioStarts += 1;
    }

    async send(): Promise<void> {
      // no-op for tests
    }

    async close(): Promise<void> {
      stdioStops += 1;
    }
  }

  const modulePath = new URL("../proxy/stdio-proxy.js", import.meta.url)
    .pathname;
  const { StdioHttpProxy } = await esmock<
    typeof import("../proxy/stdio-proxy.js")
  >(modulePath, {
    "@modelcontextprotocol/sdk/client/stdio.js": {
      StdioClientTransport: FakeStdioClientTransport,
    },
    "@modelcontextprotocol/sdk/server/streamableHttp.js": {
      StreamableHTTPServerTransport: FakeStreamableHTTPServerTransport,
    },
  });

  const spec: StdioServerSpec = {
    name: "fake-proxy",
    command: "/bin/echo",
    args: ["hello"],
    env: {},
    httpPath: "/proxy",
  };

  const proxy = new StdioHttpProxy(spec, () => {});
  const port = await allocatePort();
  const transport = fastifyTransport({ host: "127.0.0.1", port });

  const descriptors: HttpEndpointDescriptor[] = [
    { path: spec.httpPath, kind: "proxy", handler: proxy },
  ];

  await transport.start(descriptors);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${spec.httpPath}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {},
      }),
    });

    t.is(response.status, 200);
    const payload = await response.json();
    t.deepEqual(payload, { ok: true });
    t.is(httpStarts, 1);
    t.is(stdioStarts, 1);
    t.is(forwardedBodies.length, 1);

    const forwarded = forwardedBodies[0];
    const parsed = Buffer.isBuffer(forwarded)
      ? JSON.parse(forwarded.toString("utf8"))
      : typeof forwarded === "string"
        ? JSON.parse(forwarded)
        : forwarded;
    t.deepEqual(parsed, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-10-01",
        clientInfo: { name: "promethean-mcp", version: "dev" },
      },
    });
  } finally {
    await transport.stop?.();
  }

  t.is(httpStops, 1);
  t.is(stdioStops, 1);
});

test("fastify registry accepts batched initialize request", async (t) => {
  const port = await allocatePort();
  const server = createMcpServer([]);
  const transport = fastifyTransport({ host: "127.0.0.1", port });

  await transport.start([
    { path: "/mcp", kind: "registry", handler: server },
  ]);

  try {
    const response = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body: JSON.stringify([
        {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-10-01",
            clientInfo: { name: "ava-test", version: "0.0.0" },
            capabilities: {},
          },
        },
      ]),
    });

    t.is(response.status, 200);
    t.truthy(response.headers.get("mcp-session-id"));
    await response.body?.cancel();
  } finally {
    await transport.stop?.();
  }
});
