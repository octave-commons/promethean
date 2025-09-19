import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { Envelope } from "./types/envelope.js";
import { Router, type RouteHandler } from "./router.js";
import type { HelloCaps, PrivacyProfile } from "./types/privacy.js";

export interface EnsoServerOptions {
  router?: Router;
  validate?: (raw: unknown) => Envelope;
}

export interface ServerSession {
  id: string;
}

interface SessionRecord {
  id: string;
  capabilities: string[];
  privacy: PrivacyProfile;
  wantsE2E: boolean;
  agent?: HelloCaps["agent"];
  cache?: HelloCaps["cache"];
  connectedAt: string;
}

interface HandshakeResult {
  session: ServerSession;
  accepted: Envelope<{
    profile: PrivacyProfile;
    wantsE2E: boolean;
    negotiatedCaps: string[];
    agent?: HelloCaps["agent"];
    cache?: HelloCaps["cache"];
  }>;
  presence: Envelope<{ session: string; caps: string[] }>;
}

interface HandshakeOptions {
  adjustCapabilities?: (requested: string[]) => string[];
  privacyProfile?: PrivacyProfile;
  wantsE2E?: boolean;
}

function mkEnvelope<T>(type: string, payload: T): Envelope<T> {
  return {
    id: randomUUID(),
    ts: new Date().toISOString(),
    room: "local",
    from: "enso-server",
    kind: "event",
    type,
    payload,
  };
}

export class EnsoServer extends EventEmitter {
  private readonly router: Router;
  private readonly validate: (raw: unknown) => Envelope;
  private readonly sessions = new Map<string, SessionRecord>();

  constructor(options: EnsoServerOptions = {}) {
    super();
    this.router = options.router ?? new Router();
    this.validate =
      options.validate ?? ((raw) => raw as Envelope);
  }

  register(type: string, handler: RouteHandler): void {
    this.router.register(type, handler);
  }

  createSession(): ServerSession {
    const session: ServerSession = { id: randomUUID() };
    this.emit("session", session);
    return session;
  }

  acceptHandshake(hello: HelloCaps, options: HandshakeOptions = {}): HandshakeResult {
    const negotiatedCaps = options.adjustCapabilities
      ? options.adjustCapabilities([...hello.caps])
      : [...hello.caps];
    const profile = options.privacyProfile ?? hello.privacy.profile;
    const wantsE2E = options.wantsE2E ?? (hello.privacy.wantsE2E ?? false);
    const session = this.createSession();
    const record: SessionRecord = {
      id: session.id,
      capabilities: negotiatedCaps,
      privacy: profile,
      wantsE2E,
      agent: hello.agent,
      cache: hello.cache,
      connectedAt: new Date().toISOString(),
    };
    this.sessions.set(session.id, record);
    const accepted = mkEnvelope("privacy.accepted", {
      profile,
      wantsE2E,
      negotiatedCaps,
      agent: hello.agent,
      cache: hello.cache,
    });
    const presence = mkEnvelope("presence.join", {
      session: session.id,
      caps: negotiatedCaps,
    });
    this.emit("message", session, presence);
    return { session, accepted, presence };
  }

  getSessionInfo(sessionId: string): SessionRecord | undefined {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return undefined;
    }
    return {
      ...record,
      capabilities: [...record.capabilities],
    };
  }

  async dispatch(session: ServerSession, raw: unknown): Promise<void> {
    const envelope = this.validate(raw);
    await this.router.handle(
      {
        sessionId: session.id,
        send: (response) => this.emit("message", session, response),
      },
      envelope,
    );
  }
}
