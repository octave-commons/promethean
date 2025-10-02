import test from "node:test";
import assert from "node:assert/strict";
import { createHandshakeGuard } from "./handshake.mjs";

function createMockHandle(ready) {
  let closeCount = 0;
  return {
    ready,
    close: () => {
      closeCount += 1;
      return Promise.resolve();
    },
    get closeCount() {
      return closeCount;
    },
  };
}

function createMockWebSocket() {
  const sent = [];
  const closes = [];
  const ws = {
    OPEN: 1,
    readyState: 1,
    send: (data) => {
      sent.push(data);
    },
    close: (code, reason) => {
      closes.push({ code, reason });
      ws.readyState = 3;
    },
  };
  return {
    ws,
    sent,
    closes,
  };
}

test("handshake guard resolves once the handshake completes", async () => {
  const ready = new Promise((resolve) => setTimeout(resolve, 5));
  const handle = createMockHandle(ready);
  const { ws } = createMockWebSocket();
  const guard = createHandshakeGuard(handle, ws, { timeoutMs: 50 });

  await guard.wait();
  assert.equal(guard.isReady(), true);
  assert.equal(guard.error(), null);
});

test("handshake guard reports failures to the browser client", async () => {
  const ready = Promise.resolve().then(() => {
    throw new Error("nope");
  });
  const handle = createMockHandle(ready);
  const socket = createMockWebSocket();
  const guard = createHandshakeGuard(handle, socket.ws, { timeoutMs: 50 });

  await assert.rejects(guard.wait(), /nope/);
  assert.equal(socket.sent.length, 1);
  assert.deepEqual(JSON.parse(socket.sent[0]), {
    type: "error",
    reason: "nope",
  });
  assert.equal(socket.closes.length, 1);
  assert.equal(socket.closes[0].code, 1011);
  assert.equal(handle.closeCount, 1);
});

test("handshake guard times out and emits an error payload", async () => {
  const ready = new Promise(() => {});
  const handle = createMockHandle(ready);
  const socket = createMockWebSocket();
  const guard = createHandshakeGuard(handle, socket.ws, { timeoutMs: 20 });

  await assert.rejects(guard.wait(), /timed out/);
  assert.equal(socket.sent.length, 1);
  const payload = JSON.parse(socket.sent[0]);
  assert.equal(payload.type, "error");
  assert.match(payload.reason, /timed out/);
  assert.equal(socket.closes.length, 1);
  assert.equal(socket.closes[0].code, 1011);
  assert.equal(handle.closeCount, 1);
});
