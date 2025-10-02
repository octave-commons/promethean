import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { Envelope } from "./types/envelope.js";
import { Router, type RouteHandler } from "./router.js";
import type { HelloCaps, PrivacyProfile } from "./types/privacy.js";
import { resolveHelloPrivacy } from "./types/privacy.js";
import type { ToolCall } from "./types/tools.js";
import { GuardrailManager } from "./guardrails.js";

/** Options for configuring the reference server implementation. */
export type EnsoServerOptions = {
  router?: Router;
  validate?: (raw: unknown) => Envelope;
  guardrails?: GuardrailManager;
};

export type ServerSession = {
  id: string;
};

type SessionRecord = {
  readonly id: string;
  readonly capabilities: string[];
  readonly privacy: PrivacyProfile;
  readonly wantsE2E: boolean;
  readonly agent?: HelloCaps["agent"];
  readonly cache?: HelloCaps["cache"];
  readonly connectedAt: string;
  readonly auditLog: Envelope[];
  capRevision: number;
};

/** Result of a successful handshake. */
type HandshakeResult = {
  readonly session: ServerSession;
  readonly accepted: Envelope<{
    profile: PrivacyProfile;
    wantsE2E: boolean;
    negotiatedCaps: string[];
    agent?: HelloCaps["agent"];
    cache?: HelloCaps["cache"];
  }>;
  readonly presence: Envelope<{ session: string; caps: string[] }>;
};

/**
 * Controls the server response to an incoming handshake request.
 */
type HandshakeOptions = {
  readonly adjustCapabilities?: (requested: string[]) => string[];
  readonly privacyProfile?: PrivacyProfile;
  readonly wantsE2E?: boolean;
  readonly evaluationMode?: boolean;
};

type CapabilityUpdate = {
  readonly caps?: readonly string[];
  readonly grant?: readonly string[];
  readonly revoke?: readonly string[];
  readonly reason?: string;
  readonly requestId?: string;
  readonly broadcast?: boolean;
};

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
  private handshakeOverride: ((hello: HelloCaps) => HandshakeOptions) | null =
    null;

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

  /**
   * Configure how the next inbound handshake should be negotiated.
   *
   * This is primarily useful for tests that need to override capability
   * negotiation without standing up a bespoke server implementation.
   */
  prepareHandshake(
    override: HandshakeOptions | ((hello: HelloCaps) => HandshakeOptions),
  ): void {
    this.handshakeOverride =
      typeof override === "function" ? override : () => override;
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
      capRevision: 0,
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
    const result: HandshakeResult = { session, accepted, presence };
    this.emit("handshake", { ...result, hello });
    this.emit("message", session, accepted);
    this.emit("message", session, presence);
    return result;
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

  /**
   * Apply capability changes to a session and broadcast the authoritative set.
   */
  updateCapabilities(
    sessionId: string,
    update: CapabilityUpdate = {},
  ): Envelope | undefined {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return undefined;
    }
    const current = new Set(record.capabilities);
    let nextSet: Set<string>;
    if (update.caps) {
      nextSet = new Set(update.caps);
    } else {
      nextSet = new Set(current);
      update.grant?.forEach((cap) => nextSet.add(cap));
      update.revoke?.forEach((cap) => nextSet.delete(cap));
    }
    const nextCaps = Array.from(nextSet);
    const granted = nextCaps.filter((cap) => !current.has(cap));
    const revoked = [...current].filter((cap) => !nextSet.has(cap));
    if (granted.length === 0 && revoked.length === 0) {
      return undefined;
    }
    record.capabilities.splice(0, record.capabilities.length, ...nextCaps);
    record.capRevision += 1;
    const payload = {
      session: sessionId,
      caps: nextCaps,
      revision: record.capRevision,
      acknowledgedAt: new Date().toISOString(),
      ...(granted.length > 0 ? { granted } : {}),
      ...(revoked.length > 0 ? { revoked } : {}),
      ...(update.reason ? { reason: update.reason } : {}),
      ...(update.requestId ? { requestId: update.requestId } : {}),
    };
    const envelope = mkEnvelope("caps.update", payload);
    this.recordAudit(sessionId, envelope);
    this.emit("message", { id: sessionId }, envelope);
    if (update.broadcast !== false) {
      for (const [otherId] of this.sessions) {
        if (otherId === sessionId) {
          continue;
        }
        this.emit("message", { id: otherId }, envelope);
      }
    }
    return envelope;
  }

  /** Dispatch an inbound envelope through the registered router. */
  async dispatch(
    session: ServerSession | undefined,
    raw: unknown,
  ): Promise<void> {
    const envelope = this.validate(raw);
    if (envelope.kind === "event" && envelope.type === "hello") {
      const hello = envelope.payload as HelloCaps;
      const override = this.handshakeOverride;
      this.handshakeOverride = null;
      const options = override ? override(hello) : {};
      this.acceptHandshake(hello, options);
      return;
    }

    if (!session) {
      throw new Error("Session is required after handshake completion");
    }

    if (envelope.kind === "event") {
      if (envelope.type === "act.rationale") {
        const payload = envelope.payload as { callId?: string } | undefined;
        if (payload?.callId) {
          this.guardrails.recordRationale(session.id, payload.callId, payload);
        }
        this.recordAudit(session.id, envelope);
      }
      if (envelope.type === "act.intent") {
        const payload = envelope.payload as { callId?: string } | undefined;
        if (payload?.callId) {
          this.guardrails.recordIntent(session.id, payload.callId, payload);
        }
        this.recordAudit(session.id, envelope);
      }
      if (envelope.type === "tool.call") {
        const call = envelope.payload as ToolCall;
        const callId = call?.callId;
        if (callId) {
          const evaluation = this.guardrails.allowToolCall(session.id, callId);
          if (!evaluation.allowed) {
            const reason =
              evaluation.missing === "intent"
                ? "missing-intent"
                : "missing-rationale";
            const violation = mkEnvelope("guardrail.violation", {
              session: session.id,
              callId,
              reason,
            });
            this.emit("message", session, violation);
            return;
          }
          this.guardrails.consumeRationale(session.id, callId);
          this.guardrails.consumeIntent(session.id, callId);
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
