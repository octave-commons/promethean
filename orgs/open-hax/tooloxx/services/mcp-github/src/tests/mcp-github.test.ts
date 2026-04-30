import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

test("mcp-github exposes health and github-only tool list", async () => {
  const legacyServer = createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/mcp") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }

    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      const payload = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { method?: string; id?: unknown };
      const body = payload.method === "tools/list"
        ? {
            jsonrpc: "2.0",
            id: payload.id ?? null,
            result: {
              tools: [
                { name: "github_request" },
                { name: "process_enqueue_task" },
              ],
            },
          }
        : { jsonrpc: "2.0", id: payload.id ?? null, result: { ok: true } };
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(body));
    });
  });

  legacyServer.listen(0, "127.0.0.1");
  await once(legacyServer, "listening");
  const legacyAddress = legacyServer.address();
  if (!legacyAddress || typeof legacyAddress === "string") {
    throw new Error("failed to determine legacy server port");
  }

  process.env.LEGACY_MCP_URL = `http://127.0.0.1:${legacyAddress.port}`;
  process.env.ALLOW_UNAUTH_LOCAL = "true";

  const { createApp } = await import("../main.js");
  const app = await createApp();
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("failed to determine mcp-github server port");
  }

  try {
    const health = await fetch(`http://127.0.0.1:${address.port}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true, service: "mcp-github" });

    const list = await fetch(`http://127.0.0.1:${address.port}/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
    });
    assert.equal(list.status, 200);
    const payload = await list.json() as { result?: { tools?: Array<{ name: string }> } };
    const names = (payload.result?.tools ?? []).map((tool) => tool.name);
    assert.deepEqual(names, ["github_request"]);
  } finally {
    server.close();
    await once(server, "close");
    legacyServer.close();
    await once(legacyServer, "close");
  }
});
