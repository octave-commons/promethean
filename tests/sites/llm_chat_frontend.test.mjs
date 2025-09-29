import test from "ava";
import http from "node:http";

process.env.NODE_ENV = "test";
const { start: startProxy, stop: stopProxy } = await import(
  "../../services/js/proxy/index.js"
);

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function startMockLLM() {
  const server = http.createServer((req, res) => {
    if (req.url === "/generate" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ reply: "hi" }));
      });
      return;
    }
    res.statusCode = 404;
    res.end();
  });
  await new Promise((resolve) => server.listen(0, resolve));
  return server;
}

test("LLM chat served and proxied via proxy service", async (t) => {
  const llm = await startMockLLM();
  t.teardown(() => closeServer(llm));

  const llmPort = llm.address().port;
  const proxy = await startProxy(0, { "/llm": `http://127.0.0.1:${llmPort}` });
  await new Promise((resolve) => proxy.on("listening", resolve));
  t.teardown(async () => {
    await stopProxy();
  });

  const proxyPort = proxy.address().port;

  const page = await fetch(`http://127.0.0.1:${proxyPort}/llm-chat/`);
  const text = await page.text();
  t.true(text.includes("LLM Chat"));

  const res = await fetch(`http://127.0.0.1:${proxyPort}/llm/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "hi", context: [] }),
  });
  const data = await res.json();
  t.is(data.reply, "hi");
});
