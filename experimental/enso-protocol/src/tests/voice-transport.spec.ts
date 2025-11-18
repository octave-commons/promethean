import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import test from "ava";
import type { RawData, WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { ContextRegistry } from "../registry.js";
import { EnsoClient } from "../client.js";
import { EnsoServer } from "../server.js";
import { connectLocal, connectWebSocket } from "../transport.js";
import type { HelloCaps } from "../types/privacy.js";
import { resolveHelloPrivacy } from "../types/privacy.js";
import type { Envelope } from "../types/envelope.js";
import type { ChatMessage } from "../types/content.js";

const HELLO: HelloCaps = {
  proto: "ENSO-1",
  caps: ["can.send.text", "can.voice.stream"],
  privacy: { profile: "pseudonymous" },
};

const BINARY_KEY = "__enso_binary__" as const;

interface BinaryTagged {
  [BINARY_KEY]: string;
}

type TransportFrame =
  | { type: "hello"; payload: HelloCaps }
  | { type: "envelope"; payload: Envelope }
  | { type: "ping"; ts: string }
  | { type: "pong"; ts: string };

function encodeFrame(frame: TransportFrame): string {
  return JSON.stringify(frame, (_key, value) => {
    if (value instanceof Uint8Array) {
      return {
        [BINARY_KEY]: Buffer.from(value).toString("base64"),
      } satisfies BinaryTagged;
    }
    return value;
  });
}

function decodeFrame(raw: string): TransportFrame {
  return JSON.parse(raw, (_key, value) => {
    if (
      value &&
      typeof value === "object" &&
      BINARY_KEY in (value as Record<string, unknown>)
    ) {
      const tagged = value as BinaryTagged;
      return Uint8Array.from(Buffer.from(tagged[BINARY_KEY], "base64"));
    }
    return value;
  }) as TransportFrame;
}

function createEnvelope<T>(input: {
  type: string;
  kind: "event" | "stream";
  room?: string;
  from?: string;
  seq?: number;
  payload: T;
}): Envelope<T> {
  return {
    id: randomUUID(),
    ts: new Date().toISOString(),
    room: input.room ?? "server",
    from: input.from ?? "enso-server",
    kind: input.kind,
    type: input.type,
    ...(input.seq !== undefined ? { seq: input.seq } : {}),
    payload: input.payload,
  };
}

test("websocket transport performs handshake and maintains keepalive", async (t) => {
  const server = new WebSocketServer({ port: 0 });
  const address = server.address();
  if (typeof address !== "object" || address === null) {
    t.fail("failed to acquire test port");
    return;
  }
  const url = `ws://127.0.0.1:${address.port}`;

  const received: Envelope[] = [];
  let pingCount = 0;
  const handshake = new Promise<void>((resolve) => {
    server.on("connection", (socket: WebSocket) => {
      socket.on("message", (raw: RawData) => {
        const text = typeof raw === "string" ? raw : raw.toString();
        const frame = decodeFrame(text);
        if (frame.type === "hello") {
          const requestedPrivacy = resolveHelloPrivacy(HELLO);
          const accepted = createEnvelope({
            kind: "event",
            type: "privacy.accepted",
            payload: {
              profile: requestedPrivacy.profile,
              wantsE2E: false,
              negotiatedCaps: HELLO.caps,
            },
          });
          const presence = createEnvelope({
            kind: "event",
            type: "presence.join",
            payload: { session: "session-1", caps: HELLO.caps },
          });
          socket.send(encodeFrame({ type: "envelope", payload: accepted }));
          socket.send(encodeFrame({ type: "envelope", payload: presence }));
          const transcript = createEnvelope({
            kind: "stream",
            type: "transcript.partial",
            payload: { text: "partial transcript" },
          });
          socket.send(encodeFrame({ type: "envelope", payload: transcript }));
          const agentReply = createEnvelope({
            kind: "event",
            type: "chat.msg",
            payload: {
              room: "chat",
              message: {
                role: "agent",
                parts: [{ kind: "text", text: "ack" }] as ChatMessage["parts"],
              },
            },
          });
          socket.send(encodeFrame({ type: "envelope", payload: agentReply }));
          resolve();
          return;
        }
        if (frame.type === "envelope") {
          received.push(frame.payload);
          return;
        }
        if (frame.type === "ping") {
          pingCount += 1;
          socket.send(encodeFrame({ type: "pong", ts: frame.ts }));
        }
      });
    });
  });

  const client = new EnsoClient(new ContextRegistry());
  const partials: string[] = [];
  client.on("stream:transcript.partial", (env) => {
    const payload = env.payload as { text?: string };
    if (payload.text) {
      partials.push(payload.text);
    }
  });
  const agentMessages: Envelope[] = [];
  client.on("event:chat.msg", (env) => {
    agentMessages.push(env);
  });

  const connection = connectWebSocket(client, url, HELLO, {
    pingIntervalMs: 25,
  });
  await connection.ready;
  await handshake;

  const agentMessage =
    agentMessages.length > 0
      ? agentMessages[0]!
      : await new Promise<Envelope>((resolve) => {
          const off = client.on("event:chat.msg", (env) => {
            off();
            resolve(env);
          });
        });

  await client.chat({
    role: "human",
    parts: [{ kind: "text", text: "hello" }],
  });
  await new Promise((resolve) => setTimeout(resolve, 50));

  t.true(partials.includes("partial transcript"));
  t.is(agentMessage.type, "chat.msg");
  t.true(received.some((env) => env.type === "chat.msg"));
  t.true(pingCount > 0);

  await connection.close();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

test("voice streaming issues flow control events", async (t) => {
  const server = new EnsoServer();
  const registry = new ContextRegistry();
  const client = new EnsoClient(registry);
  const voiceFrames: Envelope[] = [];
  const flowEvents: Envelope[] = [];

  server.register("voice.frame", (_ctx, env) => {
    voiceFrames.push(env);
  });
  server.register("flow.nack", (_ctx, env) => {
    flowEvents.push(env);
  });

  const connection = await connectLocal(client, server, HELLO, {
    adjustCapabilities: (caps) =>
      Array.from(new Set([...caps, "can.voice.stream"])),
  });

  const streamId = "stream-1";
  client.voice.register(streamId, 0);
  await client.voice.sendFrame({
    streamId,
    codec: "pcm16le/16000/1",
    seq: 0,
    pts: 0,
    data: new Uint8Array([1, 2]),
  });
  await client.voice.sendFrame({
    streamId,
    codec: "pcm16le/16000/1",
    seq: 1,
    pts: 20,
    data: new Uint8Array([3, 4]),
    eof: true,
  });

  t.is(voiceFrames.length, 2);
  const firstPayload = voiceFrames[0]?.payload as
    | { data?: unknown }
    | undefined;
  t.true(firstPayload?.data instanceof Uint8Array);

  const hooks: string[] = [];
  client.voice.onFlowControl({
    onPause: (id) => {
      hooks.push(`pause:${id}`);
    },
    onResume: (id) => {
      hooks.push(`resume:${id}`);
    },
  });

  client.receive(
    createEnvelope({
      kind: "stream",
      type: "voice.frame",
      seq: 0,
      payload: {
        streamId,
        codec: "pcm16le/16000/1",
        seq: 0,
        pts: 0,
        data: new Uint8Array([9]),
      },
    }),
  );
  client.receive(
    createEnvelope({
      kind: "stream",
      type: "voice.frame",
      seq: 2,
      payload: {
        streamId,
        codec: "pcm16le/16000/1",
        seq: 2,
        pts: 40,
        data: new Uint8Array([10]),
      },
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));

  t.true(
    flowEvents.some(
      (env) => (env.payload as { missing?: number[] }).missing?.includes(1),
    ),
  );

  client.receive(
    createEnvelope({
      kind: "event",
      type: "flow.pause",
      payload: { streamId },
    }),
  );
  client.receive(
    createEnvelope({
      kind: "event",
      type: "flow.resume",
      payload: { streamId },
    }),
  );

  t.deepEqual(hooks, [`pause:${streamId}`, `resume:${streamId}`]);

  connection.disconnect();
});
