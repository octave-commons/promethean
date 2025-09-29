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

async function startMockBridge() {
  const server = http.createServer((req, res) => {
    if (req.url === "/auth/me") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ auth: true }));
      return;
    }
    res.statusCode = 404;
    res.end();
  });
  await new Promise((resolve) => server.listen(0, resolve));
  return server;
}

test("SmartGPT dashboard served and proxied via proxy service", async (t) => {
  const bridge = await startMockBridge();
  t.teardown(() => closeServer(bridge));

  const bridgePort = bridge.address().port;
  const proxy = await startProxy(0, {
    "/bridge": `http://127.0.0.1:${bridgePort}`,
  });
  await new Promise((resolve) => proxy.on("listening", resolve));
  t.teardown(async () => {
    await stopProxy();
  });

  const proxyPort = proxy.address().port;

  const page = await fetch(`http://127.0.0.1:${proxyPort}/smartgpt-dashboard/`);
  const text = await page.text();
  t.true(text.includes("SmartGPT Bridge"));

  const res = await fetch(`http://127.0.0.1:${proxyPort}/bridge/auth/me`);
  const data = await res.json();
  t.is(data.auth, true);
});
