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
import { FlowController } from "./flow.js";
import type { StreamFrame } from "./types/streams.js";

type Handler = (env: Envelope) => void;

const CAP_POST_TEXT = "can.send.text";
const CAP_ASSET_PUT = "can.asset.put";
const CAP_CONTEXT_WRITE = "can.context.write";
const CAP_CONTEXT_APPLY = "can.context.apply";
const CAP_VOICE_STREAM = "can.voice.stream";

interface VoiceHooks {
  onPause?: (streamId: string) => void | Promise<void>;
  onResume?: (streamId: string) => void | Promise<void>;
}

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
  private readonly voiceController = new FlowController("voice");
  private connected = false;
  private capabilities = new Set<string>();
  private privacyProfile: PrivacyProfile | undefined;
  private outbound?: (env: Envelope) => Promise<void> | void;
  private voiceHooks: VoiceHooks | undefined;

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
    const requestedPrivacy = resolveHelloPrivacy(
      hello,
      adjustment.privacyProfile,
    );
    const negotiatedCaps = adjustment.capabilities ?? hello.caps ?? [];
    this.capabilities = new Set(negotiatedCaps);
    this.privacyProfile = adjustment.privacyProfile ?? requestedPrivacy.profile;
    this.connected = true;
    if (adjustment.emitAccepted !== false) {
      const requested: HelloCaps = {
        ...hello,
        privacy: { ...requestedPrivacy },
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

  async post(
    message: ChatMessage,
    options: { room?: string } = {},
  ): Promise<void> {
    this.requireCapability(CAP_POST_TEXT);
    const room = options.room ?? "local";
    const envelope = createEnvelope({
      room,
      from: "enso-client",
      kind: "event",
      type: "content.post",
      payload: { room, message },
    });
    await this.send(envelope);
  }

  async chat(
    message: ChatMessage,
    options: { room?: string; replyTo?: string; parents?: string[] } = {},
  ): Promise<void> {
    this.requireCapability(CAP_POST_TEXT);
    const room = options.room ?? "local";
    const rel =
      options.replyTo || options.parents
        ? {
            ...(options.replyTo ? { replyTo: options.replyTo } : {}),
            ...(options.parents ? { parents: options.parents } : {}),
          }
        : undefined;
    const envelope = createEnvelope({
      room,
      from: "enso-client",
      kind: "event",
      type: "chat.msg",
      ...(rel ? { rel } : {}),
      payload: { room, message },
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

  voice = {
    register: (streamId: string, initialSeq = 0) => {
      this.voiceController.register(streamId, initialSeq);
    },
    sendFrame: async (frame: StreamFrame, options: { room?: string } = {}) => {
      this.requireCapability(CAP_VOICE_STREAM);
      const room = options.room ?? "voice";
      const envelope = createEnvelope({
        room,
        from: "enso-client",
        kind: "stream",
        type: "voice.frame",
        seq: frame.seq,
        payload: frame,
      });
      await this.send(envelope);
    },
    pause: async (streamId: string): Promise<Envelope | undefined> => {
      const envelope = this.voiceController.pause(streamId);
      if (!envelope) {
        return undefined;
      }
      await this.send(envelope);
      return envelope as Envelope;
    },
    resume: async (streamId: string): Promise<Envelope | undefined> => {
      const envelope = this.voiceController.resume(streamId);
      if (!envelope) {
        return undefined;
      }
      await this.send(envelope);
      return envelope as Envelope;
    },
    markDegraded: async (streamId: string): Promise<Envelope | undefined> => {
      const envelope = this.voiceController.markDegraded(streamId);
      if (!envelope) {
        return undefined;
      }
      await this.send(envelope);
      return envelope as Envelope;
    },
    onFlowControl: (hooks: VoiceHooks) => {
      this.voiceHooks = hooks;
    },
  };

  receive(envelope: Envelope): void {
    if (envelope.kind === "stream" && envelope.type === "voice.frame") {
      const frame = envelope.payload as StreamFrame;
      const responses = this.voiceController.handleFrame(frame);
      responses.forEach((flowEnvelope) => {
        void this.send(flowEnvelope).catch(() => {
          // Flow control failures should not crash the client; upstream handlers
          // can inspect transport logs if needed.
        });
      });
    }
    if (envelope.kind === "event" && envelope.type === "flow.pause") {
      const payload = envelope.payload as { streamId?: string } | undefined;
      const streamId = payload?.streamId;
      if (streamId && this.voiceHooks?.onPause) {
        void Promise.resolve(this.voiceHooks.onPause(streamId));
      }
    }
    if (envelope.kind === "event" && envelope.type === "flow.resume") {
      const payload = envelope.payload as { streamId?: string } | undefined;
      const streamId = payload?.streamId;
      if (streamId && this.voiceHooks?.onResume) {
        void Promise.resolve(this.voiceHooks.onResume(streamId));
      }
    }
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
