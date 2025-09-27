import { Buffer } from "node:buffer";
import WebSocket from "ws";
import type { HelloCaps, PrivacyProfile } from "./types/privacy.js";
import { resolveHelloPrivacy } from "./types/privacy.js";
import type { Envelope } from "./types/envelope.js";
import { EnsoClient } from "./client.js";
import { EnsoServer } from "./server.js";
import type { ServerSession } from "./server.js";

const WS_OPEN = 1;
const BINARY_KEY = "__enso_binary__" as const;

type BinaryTagged = {
  [BINARY_KEY]: string;
};

type TransportFrame =
  | { type: "hello"; payload: HelloCaps }
  | { type: "envelope"; payload: Envelope }
  | { type: "ping"; ts: string }
  | { type: "pong"; ts: string };

type Listener<T = unknown> = (value: T) => void;

interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  terminate?: () => void;
  on?: (event: string, handler: Listener) => void;
  off?: (event: string, handler: Listener) => void;
  addEventListener?: (event: string, handler: Listener) => void;
  removeEventListener?: (event: string, handler: Listener) => void;
}

export interface WebSocketClientOptions {
  protocols?: string | string[];
  pingIntervalMs?: number;
  logger?: {
    debug?: (message: string) => void;
    warn?: (message: string) => void;
    error?: (message: string, error?: unknown) => void;
  };
  now?: () => Date;
  factory?: (url: string, protocols?: string | string[]) => WebSocketLike;
}

export interface WebSocketConnectionHandle {
  ready: Promise<void>;
  close(code?: number, reason?: string): Promise<void>;
}

function deferred(): {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
} {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function attach(
  socket: WebSocketLike,
  event: string,
  handler: Listener,
): () => void {
  if (typeof socket.on === "function" && typeof socket.off === "function") {
    socket.on(event, handler);
    return () => socket.off?.(event, handler);
  }
  if (
    typeof socket.addEventListener === "function" &&
    typeof socket.removeEventListener === "function"
  ) {
    const target = socket as {
      addEventListener: (event: string, listener: Listener) => void;
      removeEventListener: (event: string, listener: Listener) => void;
    };
    target.addEventListener(event, handler);
    return () => target.removeEventListener(event, handler);
  }
  throw new Error("Unsupported WebSocket implementation");
}

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

/**
 * Options for establishing a local in-memory transport between the client and
 * server reference implementations.
 */
export interface LocalTransportOptions {
  adjustCapabilities?: (requested: string[]) => string[];
  privacyProfile?: PrivacyProfile;
  wantsE2E?: boolean;
  evaluationMode?: boolean;
}

/**
 * Handle returned by {@link connectLocal}. Allows tests to inspect the
 * negotiated handshake envelopes and tear down the implicit listener when
 * finished.
 */
export interface LocalConnection {
  session: ServerSession;
  accepted: Envelope<{
    profile: PrivacyProfile;
    wantsE2E: boolean;
    negotiatedCaps: string[];
  }>;
  presence: Envelope<{ session: string; caps: string[] }>;
  disconnect(): void;
}

/**
 * Wire up {@link EnsoClient} and {@link EnsoServer} using an in-memory
 * transport. This mirrors a WebSocket-like connection for unit and integration
 * tests without requiring network sockets.
 */
export async function connectLocal(
  client: EnsoClient,
  server: EnsoServer,
  hello: HelloCaps,
  options: LocalTransportOptions = {},
): Promise<LocalConnection> {
  const handshakeHello: HelloCaps = {
    ...hello,
    caps: [...hello.caps],
    ...(hello.privacy ? { privacy: { ...hello.privacy } } : {}),
    ...(hello.agent ? { agent: { ...hello.agent } } : {}),
    ...(hello.cache ? { cache: { ...hello.cache } } : {}),
  };
  let sessionHandle: ServerSession | undefined;
  let acceptedEnvelope:
    | Envelope<{
        profile: PrivacyProfile;
        wantsE2E: boolean;
        negotiatedCaps: string[];
        agent?: HelloCaps["agent"];
        cache?: HelloCaps["cache"];
      }>
    | undefined;
  let presenceEnvelope:
    | Envelope<{ session: string; caps: string[] }>
    | undefined;
  const bufferedEnvelopes: Envelope[] = [];
  let clientConnected = false;

  const flushBuffered = () => {
    while (clientConnected && bufferedEnvelopes.length > 0) {
      const envelope = bufferedEnvelopes.shift();
      if (envelope) {
        client.receive(envelope);
      }
    }
  };

  const forward = (serverSession: ServerSession, envelope: Envelope): void => {
    if (sessionHandle && serverSession.id === sessionHandle.id) {
      if (clientConnected) {
        client.receive(envelope);
        return;
      }
      bufferedEnvelopes.push(envelope);
    }
  };

  const handshakeOptions = {
    adjustCapabilities: options.adjustCapabilities,
    privacyProfile: options.privacyProfile,
    wantsE2E: options.wantsE2E,
    evaluationMode: options.evaluationMode,
  };

  const handshakeResult = new Promise<void>((resolve) => {
    const handler = (payload: unknown) => {
      const {
        session,
        accepted,
        presence,
        hello: emittedHello,
      } = payload as {
        session: ServerSession;
        accepted: Envelope<{
          profile: PrivacyProfile;
          wantsE2E: boolean;
          negotiatedCaps: string[];
          agent?: HelloCaps["agent"];
          cache?: HelloCaps["cache"];
        }>;
        presence: Envelope<{ session: string; caps: string[] }>;
        hello: HelloCaps;
      };
      if (emittedHello !== handshakeHello) {
        return;
      }
      sessionHandle = session;
      acceptedEnvelope = accepted;
      presenceEnvelope = presence;
      server.off("handshake", handler);
      resolve();
    };
    server.on("handshake", handler);
  });

  server.on("message", forward);

  client.attachTransport({
    send: async (env) => {
      await server.dispatch(sessionHandle, env);
    },
  });

  const negotiated = server.acceptHandshake(handshakeHello, handshakeOptions);

  await handshakeResult;

  await client.connect(handshakeHello, {
    capabilities: negotiated.accepted.payload.negotiatedCaps,
    privacyProfile: negotiated.accepted.payload.profile,
    emitAccepted: false,
  });

  clientConnected = true;
  flushBuffered();

  if (!sessionHandle || !acceptedEnvelope || !presenceEnvelope) {
    throw new Error("Handshake did not complete");
  }

  return {
    session: sessionHandle,
    accepted: acceptedEnvelope,
    presence: presenceEnvelope,
    disconnect: () => {
      if (sessionHandle) {
        server.disconnectSession(sessionHandle.id);
      }
      server.off("message", forward);
      bufferedEnvelopes.length = 0;
      clientConnected = false;
      sessionHandle = undefined;
    },
  };
}

export function connectWebSocket(
  client: EnsoClient,
  url: string,
  hello: HelloCaps,
  options: WebSocketClientOptions = {},
): WebSocketConnectionHandle {
  const factory =
    options.factory ??
    ((target: string, protocols?: string | string[]) =>
      new WebSocket(target, protocols));
  const socket = factory(url, options.protocols) as WebSocketLike;
  const { promise, resolve, reject } = deferred();
  let settled = false;
  const resolveReady = (): void => {
    if (!settled) {
      settled = true;
      resolve();
    }
  };
  const rejectReady = (error: Error): void => {
    if (!settled) {
      settled = true;
      reject(error);
    }
  };

  let disposed = false;
  let awaitingPong = false;
  let pingTimer: ReturnType<typeof setInterval> | undefined;
  let connected = false;
  let connecting = false;
  let pending: Envelope[] = [];
  const now = options.now ?? (() => new Date());
  const logger = options.logger;

  const sendFrame = (frame: TransportFrame): void => {
    if (disposed) {
      return;
    }
    if (socket.readyState !== WS_OPEN) {
      return;
    }
    try {
      socket.send(encodeFrame(frame));
    } catch (error) {
      logger?.error?.("failed to send frame", error);
    }
  };

  const deliverPending = (): void => {
    if (!connected) {
      return;
    }
    const toDeliver = pending;
    pending = [];
    toDeliver.forEach((envelope) => client.receive(envelope));
  };

  const handleEnvelope = (envelope: Envelope): void => {
    pending = [...pending, envelope];
    if (
      !connected &&
      !connecting &&
      envelope.kind === "event" &&
      envelope.type === "privacy.accepted"
    ) {
      connecting = true;
      const payload = envelope.payload as
        | { negotiatedCaps?: string[]; profile?: PrivacyProfile }
        | undefined;
      const resolvedPrivacy = resolveHelloPrivacy(hello, payload?.profile);
      const negotiatedCaps = payload?.negotiatedCaps ?? hello.caps;
      void client
        .connect(hello, {
          capabilities: negotiatedCaps,
          privacyProfile: payload?.profile ?? resolvedPrivacy.profile,
          emitAccepted: false,
        })
        .then(() => {
          connected = true;
          deliverPending();
          resolveReady();
        })
        .catch((error) => {
          rejectReady(
            error instanceof Error ? error : new Error(String(error)),
          );
        });
      return;
    }
    if (connected) {
      deliverPending();
    }
  };

  const cleanup = (error?: Error): void => {
    if (disposed) {
      return;
    }
    disposed = true;
    pending = [];
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = undefined;
    }
    if (error && !connected) {
      rejectReady(error);
    }
  };

  const startPing = (): void => {
    const interval = options.pingIntervalMs ?? 15000;
    if (interval <= 0) {
      return;
    }
    pingTimer = setInterval(() => {
      if (socket.readyState !== WS_OPEN) {
        return;
      }
      if (awaitingPong) {
        logger?.warn?.("missed pong, closing websocket");
        cleanup();
        if (typeof socket.terminate === "function") {
          socket.terminate();
        } else {
          socket.close(4000, "ping timeout");
        }
        return;
      }
      awaitingPong = true;
      sendFrame({ type: "ping", ts: now().toISOString() });
    }, interval);
  };

  const detachOpen = attach(socket, "open", () => {
    logger?.debug?.("websocket open");
    client.attachTransport({
      send: async (env) => {
        sendFrame({ type: "envelope", payload: env });
      },
    });
    sendFrame({ type: "hello", payload: hello });
    startPing();
  });

  const detachMessage = attach(socket, "message", (raw) => {
    const text = typeof raw === "string" ? raw : raw?.toString?.() ?? "";
    if (!text) {
      return;
    }
    let frame: TransportFrame;
    try {
      frame = decodeFrame(text);
    } catch (error) {
      logger?.error?.("failed to decode transport frame", error);
      return;
    }
    if (frame.type === "envelope") {
      handleEnvelope(frame.payload);
      return;
    }
    if (frame.type === "ping") {
      sendFrame({ type: "pong", ts: now().toISOString() });
      return;
    }
    if (frame.type === "pong") {
      awaitingPong = false;
    }
  });

  const detachError = attach(socket, "error", (error) => {
    logger?.error?.("websocket error", error);
    cleanup(error instanceof Error ? error : new Error(String(error)));
  });

  const detachClose = attach(socket, "close", () => {
    logger?.debug?.("websocket closed");
    cleanup();
    detachOpen();
    detachMessage();
    detachError();
    detachClose();
    if (!connected) {
      rejectReady(new Error("WebSocket closed before handshake"));
    }
  });

  const close = async (code?: number, reason?: string): Promise<void> => {
    cleanup(
      !connected ? new Error("WebSocket closed before handshake") : undefined,
    );
    detachOpen();
    detachMessage();
    detachError();
    detachClose();
    socket.close(code, reason);
  };

  return {
    ready: promise,
    close,
  };
}
