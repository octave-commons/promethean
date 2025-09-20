import { createHash, randomUUID } from "node:crypto";
import { ContextRegistry } from "./registry.js";
import type { Envelope } from "./types/envelope.js";
import type { ChatMessage } from "./types/content.js";
import type {
  Context,
  ContextInit,
  ContextParticipant,
} from "./types/context.js";
import type { HelloCaps, PrivacyProfile } from "./types/privacy.js";
import { resolveHelloPrivacy } from "./types/privacy.js";
import type { CID } from "./cache.js";

type Handler = (env: Envelope) => void;

const CAP_POST_TEXT = "can.send.text";
const CAP_ASSET_PUT = "can.asset.put";
const CAP_CONTEXT_WRITE = "can.context.write";
const CAP_CONTEXT_APPLY = "can.context.apply";

type ServerAdjustment = {
  capabilities?: string[];
  privacyProfile?: PrivacyProfile;
  emitAccepted?: boolean;
};

function createEnvelope<T>(
  partial: Omit<Envelope<T>, "id" | "ts"> & { payload: T },
): Envelope<T> {
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
  private capabilities = new Set<string>();
  private privacyProfile: PrivacyProfile | undefined;
  private outbound?: (env: Envelope) => Promise<void> | void;

  constructor(registry: ContextRegistry = new ContextRegistry()) {
    this.registry = registry;
  }

  attachTransport(transport: {
    send: (env: Envelope) => Promise<void> | void;
  }): void {
    this.outbound = transport.send;
  }

  async connect(
    hello: HelloCaps,
    adjustment: ServerAdjustment = {},
  ): Promise<void> {
    const requestedPrivacy = resolveHelloPrivacy(hello);
    const negotiatedCaps = adjustment.capabilities ?? hello.caps ?? [];
    const negotiatedProfile =
      adjustment.privacyProfile ?? requestedPrivacy.profile;

    this.capabilities = new Set(negotiatedCaps);
    this.privacyProfile = negotiatedProfile;
    this.connected = true;
    if (adjustment.emitAccepted !== false) {
      const requested: HelloCaps = {
        ...hello,
        privacy: requestedPrivacy,
      };
      const envelope = createEnvelope({
        room: "local",
        from: "enso-client",
        kind: "event",
        type: "privacy.accepted",
        payload: {
          profile: this.privacyProfile,
          negotiatedCaps: Array.from(this.capabilities.values()),
          requested,
        },
      });
      this.emit(envelope);
    }
  }

  updateCapabilities(caps: string[]): void {
    caps.forEach((cap) => this.capabilities.add(cap));
  }

  getPrivacyProfile(): PrivacyProfile | undefined {
    return this.privacyProfile;
  }

  on(key: string, fn: Handler): () => void {
    const handlers = this.handlers.get(key) ?? new Set<Handler>();
    handlers.add(fn);
    this.handlers.set(key, handlers);
    return () => handlers.delete(fn);
  }

  async send(env: Envelope): Promise<void> {
    if (!this.connected) {
      throw new Error("Client must be connected before sending envelopes");
    }
    if (this.outbound) {
      await this.outbound(env);
      return;
    }
    this.emit(env);
  }

  async post(message: ChatMessage): Promise<void> {
    this.requireCapability(CAP_POST_TEXT);
    const envelope = createEnvelope({
      room: "local",
      from: "enso-client",
      kind: "event",
      type: "content.post",
      payload: { room: "local", message },
    });
    await this.send(envelope);
  }

  assets = {
    putFile: async (path: string, mime: string) => {
      this.requireCapability(CAP_ASSET_PUT);
      const cid = computeCid(`${path}:${mime}`);
      return {
        uri: `enso://asset/${cid}`,
        cid,
      };
    },
  };

  contexts = {
    create: async (init: ContextInit) => {
      this.requireCapability(CAP_CONTEXT_WRITE);
      const ctx = this.registry.createContext(init);
      this.contextStore.set(ctx.ctxId, ctx);
      return ctx;
    },
    get: (ctxId: string) => this.contextStore.get(ctxId),
    apply: async (ctxId: string, participants: ContextParticipant[]) => {
      this.requireCapability(CAP_CONTEXT_APPLY);
      return this.registry.applyContext(ctxId, {
        participants,
      });
    },
  };

  receive(envelope: Envelope): void {
    this.emit(envelope);
  }

  private requireCapability(cap: string): void {
    if (!this.capabilities.has(cap)) {
      throw new Error(`missing capability: ${cap}`);
    }
  }

  private emit(env: Envelope): void {
    const key = `${env.kind}:${env.type}`;
    const handlers = this.handlers.get(key);
    handlers?.forEach((handler) => handler(env));
  }
}
