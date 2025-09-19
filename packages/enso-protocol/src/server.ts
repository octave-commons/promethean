import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { Envelope } from "./types/envelope.js";
import { Router, type RouteHandler } from "./router.js";
import type { HelloCaps, PrivacyProfile } from "./types/privacy.js";
import { resolveHelloPrivacy } from "./types/privacy.js";
import type { ToolCall } from "./types/tools.js";
import { GuardrailManager } from "./guardrails.js";

/** Options for configuring the reference server implementation. */
export interface EnsoServerOptions {
  router?: Router;
  validate?: (raw: unknown) => Envelope;
  guardrails?: GuardrailManager;
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
  auditLog: Envelope[];
}

/** Result of a successful handshake. */
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

/**
 * Controls the server response to an incoming handshake request.
 */
interface HandshakeOptions {
  adjustCapabilities?: (requested: string[]) => string[];
  privacyProfile?: PrivacyProfile;
  wantsE2E?: boolean;
  evaluationMode?: boolean;
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

/**
 * Minimal event-driven server capable of handling ENSO envelopes.
 */
export class EnsoServer extends EventEmitter {
  private readonly router: Router;
  private readonly validate: (raw: unknown) => Envelope;
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly guardrails: GuardrailManager;
  private readonly complianceLog: Envelope[] = [];

  constructor(options: EnsoServerOptions = {}) {
    super();
    this.router = options.router ?? new Router();
    this.validate = options.validate ?? ((raw) => raw as Envelope);
    this.guardrails = options.guardrails ?? new GuardrailManager();
  }

  /** Register a route handler for a specific envelope type. */
  register(type: string, handler: RouteHandler): void {
    this.router.register(type, handler);
  }

  /** Create a new session descriptor and emit a lifecycle event. */
  createSession(): ServerSession {
    const session: ServerSession = { id: randomUUID() };
    this.emit("session", session);
    return session;
  }

  /** Accept the initial handshake and emit presence + privacy events. */
  acceptHandshake(
    hello: HelloCaps,
    options: HandshakeOptions = {},
  ): HandshakeResult {
    const negotiatedCaps = options.adjustCapabilities
      ? options.adjustCapabilities([...hello.caps])
      : [...hello.caps];
    const requestedPrivacy = resolveHelloPrivacy(hello);
    const profile = options.privacyProfile ?? requestedPrivacy.profile;
    const wantsE2E = options.wantsE2E ?? requestedPrivacy.wantsE2E ?? false;
    const session = this.createSession();
    const record: SessionRecord = {
      id: session.id,
      capabilities: negotiatedCaps,
      privacy: profile,
      wantsE2E,
      agent: hello.agent,
      cache: hello.cache,
      connectedAt: new Date().toISOString(),
      auditLog: [],
    };
    this.sessions.set(session.id, record);
    this.guardrails.setEvaluationMode(
      session.id,
      options.evaluationMode ?? false,
    );
    const accepted = mkEnvelope("privacy.accepted", {
      profile,
      wantsE2E,
      negotiatedCaps,
      agent: hello.agent,
      cache: hello.cache,
    });
    record.auditLog.push(accepted);
    this.complianceLog.push(accepted);
    const presence = mkEnvelope("presence.join", {
      session: session.id,
      caps: negotiatedCaps,
    });
    record.auditLog.push(presence);
    this.complianceLog.push(presence);
    this.emit("message", session, presence);
    return { session, accepted, presence };
  }

  /** Retrieve immutable session metadata. */
  getSessionInfo(sessionId: string): SessionRecord | undefined {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return undefined;
    }
    return {
      ...record,
      capabilities: [...record.capabilities],
      auditLog: [...record.auditLog],
    };
  }

  /** Retrieve an immutable copy of the compliance log. */
  getComplianceLog(): Envelope[] {
    return [...this.complianceLog];
  }

  /** Toggle evaluation mode guardrails for a session. */
  enableEvaluationMode(sessionId: string, enabled: boolean): void {
    this.guardrails.setEvaluationMode(sessionId, enabled);
  }

  /**
   * Disconnect a session, emit `presence.part`, and purge stored state.
   */
  disconnectSession(sessionId: string, reason: string = "client-closed"): void {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return;
    }
    this.guardrails.setEvaluationMode(sessionId, false);
    const part = mkEnvelope("presence.part", { session: sessionId, reason });
    this.recordAudit(sessionId, part);
    this.emit("message", { id: sessionId }, part);
    this.sessions.delete(sessionId);
  }

  /** Dispatch an inbound envelope through the registered router. */
  async dispatch(session: ServerSession, raw: unknown): Promise<void> {
    const envelope = this.validate(raw);
    if (envelope.kind === "event") {
      if (envelope.type === "act.rationale") {
        const payload = envelope.payload as { callId?: string } | undefined;
        if (payload?.callId) {
          this.guardrails.recordRationale(session.id, payload.callId, payload);
          this.recordAudit(session.id, envelope);
        }
      }
      if (envelope.type === "tool.call") {
        const call = envelope.payload as ToolCall;
        const callId = call?.callId;
        if (callId && !this.guardrails.allowToolCall(session.id, callId)) {
          const violation = mkEnvelope("guardrail.violation", {
            session: session.id,
            callId,
            reason: "missing-rationale",
          });
          this.emit("message", session, violation);
          return;
        }
        if (callId) {
          this.guardrails.consumeRationale(session.id, callId);
        }
        this.recordAudit(session.id, envelope);
      }
    }
    await this.router.handle(
      {
        sessionId: session.id,
        send: (response) => {
          this.recordAudit(session.id, response);
          this.emit("message", session, response);
        },
      },
      envelope,
    );
  }

  private recordAudit(sessionId: string, envelope: Envelope): void {
    const record = this.sessions.get(sessionId);
    if (record) {
      record.auditLog.push(envelope);
    }
    this.complianceLog.push(envelope);
  }
}
