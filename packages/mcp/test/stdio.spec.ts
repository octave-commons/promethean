import { once } from "events";
import type { AddressInfo } from "net";
import { spawn } from "child_process";

import { WebSocketServer } from "ws";
import test from "ava";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

test.skip("forwards stdin lines to websocket and prints responses", async (t) => {
  const wss = new WebSocketServer({ port: 0 });
  const messages: string[] = [];
  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      messages.push(data.toString());
      ws.send(data.toString());
    });
  });
  await once(wss, "listening");
  const port = (wss.address() as AddressInfo).port;

  const proc = spawn("node", ["dist/stdio.js"], {
    env: { ...process.env, MCP_SERVER_URL: `ws://localhost:${port}` },
  });
  const stdout: string[] = [];
  proc.stdout.on("data", (d) => stdout.push(d.toString()));

  await once(wss, "connection");
  proc.stdin.write('{"jsonrpc":"2.0","id":1,"method":"ping"}\n');
  await sleep(200);

  for (const client of wss.clients) client.close();
  const code = await new Promise<number>((res) =>
    proc.on("exit", (c) => res(c || 0)),
  );

  t.is(messages[0], '{"jsonrpc":"2.0","id":1,"method":"ping"}');
  t.true(stdout[0]?.includes('"method":"ping"'));
  t.is(code, 0);

  await new Promise((res) => wss.close(res));
});
