import { createHash, randomUUID } from "node:crypto";
import { ContextRegistry } from "./registry.js";
import type { Envelope } from "./types/envelope.js";
import type { ChatMessage } from "./types/content.js";
import type {
  Context,
  ContextInit,
  ContextParticipant,
} from "./types/context.js";
import type { HelloCaps } from "./types/privacy.js";
import type { CID } from "./cache.js";

type Handler = (env: Envelope) => void;

function createEnvelope<T>(partial: Omit<Envelope<T>, "id" | "ts"> & { payload: T }): Envelope<T> {
  return {
    id: randomUUID(),
    ts: new Date().toISOString(),
    ...partial,
  };
}

function computeCid(input: string): CID {
  const hash = createHash("sha256").update(input).digest("hex");
  return `cid:sha256-${hash}` as CID;
}

export class EnsoClient {
  private readonly handlers = new Map<string, Set<Handler>>();
  private readonly registry: ContextRegistry;
  private readonly contextStore = new Map<string, Context>();
  private connected = false;

  constructor(registry: ContextRegistry = new ContextRegistry()) {
    this.registry = registry;
  }

  async connect(hello: HelloCaps): Promise<void> {
    this.connected = true;
    const envelope = createEnvelope({
      room: "local",
      from: "enso-client",
      kind: "event",
      type: "privacy.accepted",
      payload: { hello },
    });
    this.emit(envelope);
  }

  on(key: string, fn: Handler): () => void {
    const handlers = this.handlers.get(key) ?? new Set<Handler>();
    handlers.add(fn);
    this.handlers.set(key, handlers);
    return () => handlers.delete(fn);
  }

  send(env: Envelope): void {
    if (!this.connected) {
      throw new Error("Client must be connected before sending envelopes");
    }
    this.emit(env);
  }

  async post(message: ChatMessage): Promise<void> {
    const envelope = createEnvelope({
      room: "local",
      from: "enso-client",
      kind: "event",
      type: "content.post",
      payload: { room: "local", message },
    });
    this.emit(envelope);
  }

  assets = {
    putFile: async (path: string, mime: string) => {
      const cid = computeCid(`${path}:${mime}`);
      return {
        uri: `enso://asset/${cid}`,
        cid,
      };
    },
  };

  contexts = {
    create: async (init: ContextInit) => {
      const ctx = this.registry.createContext(init);
      this.contextStore.set(ctx.ctxId, ctx);
      return ctx;
    },
    get: (ctxId: string) => this.contextStore.get(ctxId),
    apply: async (ctxId: string, participants: ContextParticipant[]) => {
      return this.registry.applyContext(ctxId, {
        participants,
      });
    },
  };

  private emit(env: Envelope): void {
    const key = `${env.kind}:${env.type}`;
    const handlers = this.handlers.get(key);
    handlers?.forEach((handler) => handler(env));
  }
}
