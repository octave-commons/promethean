/**
 * Utilities for enforcing Morganna guardrails during tool execution.
 *
 * Evaluation mode requires agents to emit both `act.rationale` and
 * `act.intent` events for each pending tool call. The guardrail manager tracks
 * the latest payloads per session and denies subsequent tool invocations if
 * either envelope is missing.
 */
export type ToolCallEvaluation =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly missing: "rationale" | "intent" };

export class GuardrailManager {
  private readonly evaluationSessions = new Set<string>();
  private readonly rationaleBySession = new Map<string, Map<string, unknown>>();
  private readonly intentBySession = new Map<string, Map<string, unknown>>();

  /**
   * Enable or disable evaluation mode for a session.
   */
  setEvaluationMode(sessionId: string, enabled: boolean): void {
    if (enabled) {
      this.evaluationSessions.add(sessionId);
    } else {
      this.evaluationSessions.delete(sessionId);
      this.rationaleBySession.delete(sessionId);
      this.intentBySession.delete(sessionId);
    }
  }

  /**
   * Returns true when the session is currently under evaluation mode.
   */
  isEvaluationMode(sessionId: string): boolean {
    return this.evaluationSessions.has(sessionId);
  }

  /**
   * Persist the latest rationale payload for a tool call.
   */
  recordRationale(sessionId: string, callId: string, rationale: unknown): void {
    if (!this.evaluationSessions.has(sessionId)) {
      return;
    }
    const store = this.ensureSessionStore(this.rationaleBySession, sessionId);
    store.set(callId, rationale);
  }

  /** Persist the latest intent payload for a tool call. */
  recordIntent(sessionId: string, callId: string, intent: unknown): void {
    if (!this.evaluationSessions.has(sessionId)) {
      return;
    }
    const store = this.ensureSessionStore(this.intentBySession, sessionId);
    store.set(callId, intent);
  }

  /**
   * Determines whether a tool call should be allowed. When evaluation mode is
   * active, both rationale and intent payloads must exist for the given call
   * identifier.
   */
  allowToolCall(sessionId: string, callId: string): ToolCallEvaluation {
    if (!this.evaluationSessions.has(sessionId)) {
      return { allowed: true };
    }
    const rationales = this.rationaleBySession.get(sessionId);
    if (!rationales?.has(callId)) {
      return { allowed: false, missing: "rationale" };
    }
    const intents = this.intentBySession.get(sessionId);
    if (!intents?.has(callId)) {
      return { allowed: false, missing: "intent" };
    }
    return { allowed: true };
  }

  /**
   * Mark stored envelopes as consumed so subsequent tool calls require a fresh
   * justification and intent declaration.
   */
  consumeRationale(sessionId: string, callId: string): void {
    this.consumeForSession(this.rationaleBySession, sessionId, callId);
  }

  consumeIntent(sessionId: string, callId: string): void {
    this.consumeForSession(this.intentBySession, sessionId, callId);
  }

  private ensureSessionStore<T>(
    collection: Map<string, Map<string, T>>,
    sessionId: string,
  ): Map<string, T> {
    const existing = collection.get(sessionId);
    if (existing) {
      return existing;
    }
    const created = new Map<string, T>();
    collection.set(sessionId, created);
    return created;
  }

  private consumeForSession<T>(
    collection: Map<string, Map<string, T>>,
    sessionId: string,
    callId: string,
  ): void {
    const store = collection.get(sessionId);
    if (!store) {
      return;
    }
    store.delete(callId);
    if (store.size === 0) {
      collection.delete(sessionId);
    }
  }
}
