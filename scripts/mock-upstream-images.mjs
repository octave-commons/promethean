import { createServer } from "node:http";

const port = Number.parseInt(process.env.MOCK_UPSTREAM_PORT ?? "9999", 10);

const PNG_1X1_BYTES = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 4, 0, 0, 0, 181, 28,
  12, 2, 0, 0, 0, 11, 73, 68, 65, 84, 120, 218, 99, 252, 255, 31, 0, 3, 3, 2, 0, 239, 151, 39, 20, 0, 0, 0, 0, 73,
  69, 78, 68, 174, 66, 96, 130,
]);
const PNG_1X1_BASE64 = Buffer.from(PNG_1X1_BYTES).toString("base64");

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  // minimal CORS for browser callers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (method === "POST" && url.startsWith("/v1/images/generations")) {
    await readBody(req);
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ created: 1, data: [{ b64_json: PNG_1X1_BASE64 }] }));
    return;
  }

  if (method === "POST" && url.startsWith("/v1/chat/completions")) {
    await readBody(req);
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        id: "chatcmpl-mock",
        object: "chat.completion",
        created: 1,
        model: "mock",
        choices: [{ index: 0, message: { role: "assistant", content: "ok" }, finish_reason: "stop" }],
      }),
    );
    return;
  }

  if (method === "POST" && url.startsWith("/v1/responses")) {
    await readBody(req);
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ id: "resp-mock", object: "response" }));
    return;
  }

  if (method === "POST" && (url === "/api/embed" || url === "/api/embeddings")) {
    await readBody(req);
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ embeddings: [[0.1, 0.2, 0.3]] }));
    return;
  }

  if (method === "GET" && url.startsWith("/api/tags")) {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ models: [] }));
    return;
  }

  res.statusCode = 404;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ error: "not found", method, url }));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[mock-upstream] listening on http://127.0.0.1:${port}`);
});
