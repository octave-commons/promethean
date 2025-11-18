import test from "ava";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

const { Response, Headers } = globalThis;

test.serial("http stream transport lists tools and calls tools", async (t) => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  const responses = [
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        result: { tools: [{ name: "demo", description: "Demo tool" }] },
      }),
      {
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      },
    ),
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "2",
        result: { content: [{ type: "text", text: "ok" }] },
      }),
      {
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      },
    ),
  ];
  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    requests.push((init?.body as string) ?? "");
    return (
      responses.shift() ??
      new Response("{}", {
        status: 500,
        headers: new Headers({ "content-type": "application/json" }),
      })
    );
  };

  try {
    const { McpClient } = await import("../adapter.js");
    const client = new McpClient({
      serverId: "demo",
      transport: { kind: "http-stream", url: "https://mcp.example" },
    });

    t.deepEqual(await client.listTools(), [
      { name: "demo", description: "Demo tool" },
    ]);
    const result = await client.callTool({
      name: "demo",
      args: { value: 1 },
      ttlMs: 5000,
    });
    t.true(result.ok);
    t.deepEqual(result.result, { content: [{ type: "text", text: "ok" }] });

    t.is(requests.length, 2);
    const [listPayload, callPayload] = requests.map((body) => JSON.parse(body));
    t.is(listPayload.method, "tools/list");
    t.is(callPayload.method, "tools/call");

    await client.close();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial("http sse transport parses event stream", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      'data: {"jsonrpc":"2.0","id":"1","result":{"resources":[{"name":"notes"}]}}\n\n',
      {
        status: 200,
        headers: new Headers({ "content-type": "text/event-stream" }),
      },
    );

  try {
    const { McpClient } = await import("../adapter.js");
    const client = new McpClient({
      serverId: "demo",
      transport: { kind: "http-sse", url: "https://mcp.example" },
    });

    t.deepEqual(await client.listResources(), [{ name: "notes" }]);
    await client.close();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial("transport failures raise structured errors", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError("connect ECONNREFUSED");
  };

  try {
    const { McpClient, McpError } = await import("../adapter.js");
    const client = new McpClient({
      serverId: "offline",
      transport: { kind: "http-stream", url: "https://offline" },
    });

    await t.throwsAsync(() => client.listTools(), {
      instanceOf: McpError,
      message: /Failed to reach MCP server/,
    });
    const result = await client.callTool({ name: "demo", args: {}, ttlMs: 10 });
    t.false(result.ok);
    t.regex(result.error ?? "", /transport:/);

    await client.close();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial("http transport surfaces remote json-rpc errors", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        error: { code: -32000, message: "boom", data: { reason: "invalid" } },
      }),
      {
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      },
    );

  try {
    const { McpClient, McpError } = await import("../adapter.js");
    const client = new McpClient({
      serverId: "remote",
      transport: { kind: "http-stream", url: "https://mcp.example" },
    });

    await t.throwsAsync(() => client.listTools(), {
      instanceOf: McpError,
      message: /boom/,
    });

    const result = await client.callTool({
      name: "demo",
      args: {},
      ttlMs: 100,
    });
    t.false(result.ok);
    t.regex(result.error ?? "", /remote: boom/);
    t.deepEqual(result.result, { code: -32000, data: { reason: "invalid" } });

    await client.close();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial("http transport raises on non-ok status", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("server error", {
      status: 503,
      statusText: "Service Unavailable",
      headers: new Headers({ "content-type": "text/plain" }),
    });

  try {
    const { McpClient, McpError } = await import("../adapter.js");
    const client = new McpClient({
      serverId: "remote",
      transport: { kind: "http-stream", url: "https://mcp.example" },
    });

    await t.throwsAsync(() => client.listResources(), {
      instanceOf: McpError,
      message: /HTTP 503/,
    });
    await client.close();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial("http transport rejects empty payloads", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("", {
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
    });

  try {
    const { McpClient, McpError } = await import("../adapter.js");
    const client = new McpClient({
      serverId: "remote",
      transport: { kind: "http-stream", url: "https://mcp.example" },
    });

    await t.throwsAsync(() => client.listTools(), {
      instanceOf: McpError,
      message: /Empty response body/,
    });
    await client.close();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial("sse transport validates data frames", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(": keep-alive\n\n", {
      status: 200,
      headers: new Headers({ "content-type": "text/event-stream" }),
    });

  try {
    const { McpClient, McpError } = await import("../adapter.js");
    const client = new McpClient({
      serverId: "demo",
      transport: { kind: "http-sse", url: "https://mcp.example" },
    });

    await t.throwsAsync(() => client.listResources(), {
      instanceOf: McpError,
      message: /No data frames/,
    });
    await client.close();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.serial("stdio transport exchanges newline-delimited json", async (t) => {
  const requests: string[] = [];
  const spawnStub = ((..._args: unknown[]): ChildProcessWithoutNullStreams => {
    const stdout = new PassThrough();
    const stdin = new PassThrough();
    const stderr = new PassThrough();
    const emitter = new EventEmitter();
    const child = emitter as unknown as ChildProcessWithoutNullStreams & {
      kill: () => boolean;
    };
    Object.assign(child, { stdout, stdin, stderr });
    Object.defineProperty(child, "exitCode", {
      value: null,
      writable: true,
      configurable: true,
    });
    child.kill = () => {
      queueMicrotask(() => emitter.emit("exit", 0, null));
      return true;
    };
    stdin.on("data", (chunk) => {
      const text = chunk.toString();
      requests.push(text);
      const request = JSON.parse(text);
      if (request.method === "tools/list") {
        stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: request.id,
            result: { tools: [{ name: "stdio" }] },
          }) + "\n",
        );
      } else {
        stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: request.id,
            result: { ok: true },
          }) + "\n",
        );
      }
    });
    return child;
  }) as unknown as typeof import("node:child_process").spawn;

  const { McpClient } = await import("../adapter.js");
  const client = new McpClient(
    {
      serverId: "local",
      transport: { kind: "stdio", command: "fake" },
    },
    { spawn: spawnStub },
  );

  t.deepEqual(await client.listTools(), [{ name: "stdio" }]);
  const result = await client.callTool({ name: "stdio", args: {}, ttlMs: 100 });
  t.true(result.ok);

  t.true(requests.some((line) => line.includes('"tools/list"')));
  t.true(requests.some((line) => line.includes('"tools/call"')));

  await client.close();
});
