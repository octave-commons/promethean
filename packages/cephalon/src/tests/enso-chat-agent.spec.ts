import test from "ava";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { WebSocketServer } from "ws";
import type WebSocket from "ws";

import { createEnsoChatAgent } from "../enso/chat-agent.js";

type Envelope<T = unknown> = {
  id: string;
  ts: string;
  room: string;
  from: string;
  kind: "event" | "stream";
  type: string;
  payload: T;
};

type TransportFrame =
  | { type: "hello"; payload: Record<string, unknown> }
  | { type: "envelope"; payload: Envelope };

const encodeFrame = (frame: TransportFrame) =>
  JSON.stringify(frame, (_key, value) => {
    if (value instanceof Uint8Array) {
      return { __enso_binary__: Buffer.from(value).toString("base64") };
    }
    return value;
  });

const createEnvelope = <T>(input: {
  kind: "event" | "stream";
  type: string;
  payload: T;
  room?: string;
  from?: string;
}): Envelope<T> => ({
  id: randomUUID(),
  ts: new Date().toISOString(),
  room: input.room ?? "server",
  from: input.from ?? "enso-server",
  kind: input.kind,
  type: input.type,
  payload: input.payload,
});

// smoke test: local loop, send & receive a chat message
// uses connectLocal when no URL is provided

test("EnsoChatAgent local echo", async (t) => {
  const agent = createEnsoChatAgent({ room: "duck:test" });
  await agent.connect();

  const p = once(agent as any, "message");
  await agent.sendText("human", "ping");
  const [evt] = (await Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2000)),
  ])) as any;

  t.truthy(evt?.type === "message");
  t.is(evt.message.parts[0].kind, "text");
  t.is(evt.message.parts[0].text, "ping");

  await agent.dispose();
});

test.serial(
  "EnsoChatAgent waits for privacy.accepted before sending envelopes",
  async (t) => {
    const server = new WebSocketServer({ port: 0 });

    let address = server.address();
    if (!address || typeof address === "string") {
      await once(server, "listening");
      address = server.address();
    }

    if (!address || typeof address === "string") {
      t.fail("websocket server did not expose a usable port");
      server.close();
      return;
    }

    const frames: TransportFrame[] = [];
    server.on("connection", (socket: WebSocket) => {
      socket.on("message", (raw: Buffer | string) => {
        const text = typeof raw === "string" ? raw : raw.toString();
        frames.push(JSON.parse(text));
      });
    });

    const agent = createEnsoChatAgent({
      url: `ws://127.0.0.1:${address.port}`,
    });

    try {
      const connectPromise = agent.connect();
      const [socket] = (await once(server, "connection")) as [WebSocket];

      await new Promise((resolve) => setImmediate(resolve));

      t.deepEqual(
        frames.map((frame) => frame.type),
        ["hello"],
      );
      t.is(
        frames.findIndex((frame) => frame.type === "envelope"),
        -1,
      );

      const caps = ["can.send.text", "can.context.apply", "can.tool.call"];
      const accepted = createEnvelope({
        kind: "event",
        type: "privacy.accepted",
        payload: {
          profile: "pseudonymous",
          wantsE2E: false,
          negotiatedCaps: caps,
        },
      });
      const presence = createEnvelope({
        kind: "event",
        type: "presence.join",
        payload: { session: "session-1", caps },
      });

      socket.send(encodeFrame({ type: "envelope", payload: accepted }));
      socket.send(encodeFrame({ type: "envelope", payload: presence }));

      await connectPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      await new Promise((resolve) => setImmediate(resolve));

      const firstEnvelopeIndex = frames.findIndex(
        (frame) => frame.type === "envelope",
      );
      t.true(firstEnvelopeIndex > 0);
      t.is(
        (frames[firstEnvelopeIndex] as any)?.payload?.type,
        "tool.advertise",
      );
    } finally {
      const handle = (agent as any).wsHandle;
      if (handle && typeof handle.close === "function") {
        const originalClose = handle.close.bind(handle);
        handle.close = async (...args: unknown[]) => {
          try {
            await originalClose(...args);
          } catch {
            // ignore close errors during cleanup
          }
        };
      }
      await agent.dispose().catch(() => {});
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  },
);
