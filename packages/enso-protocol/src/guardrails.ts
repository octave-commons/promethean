/**
 * Utilities for enforcing Morganna guardrails during tool execution.
 *
 * Evaluation mode requires agents to emit `act.rationale` events for each
 * pending tool call. The guardrail manager tracks rationale payloads per
 * session and denies subsequent tool invocations if no matching rationale
 * exists.
 */
export class GuardrailManager {
  private readonly evaluationSessions = new Set<string>();
  private readonly rationaleBySession = new Map<string, Map<string, unknown>>();

  /**
   * Enable or disable evaluation mode for a session.
   */
  setEvaluationMode(sessionId: string, enabled: boolean): void {
    if (enabled) {
      this.evaluationSessions.add(sessionId);
    } else {
      this.evaluationSessions.delete(sessionId);
      this.rationaleBySession.delete(sessionId);
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
    const existing =
      this.rationaleBySession.get(sessionId) ?? new Map<string, unknown>();
    existing.set(callId, rationale);
    this.rationaleBySession.set(sessionId, existing);
  }

  /**
   * Determines whether a tool call should be allowed. When evaluation mode is
   * active, a rationale must exist for the given call identifier.
   */
  allowToolCall(sessionId: string, callId: string): boolean {
    if (!this.evaluationSessions.has(sessionId)) {
      return true;
    }
    const rationales = this.rationaleBySession.get(sessionId);
    if (!rationales) {
      return false;
    }
    return rationales.has(callId);
  }

  /**
   * Mark the rationale as consumed so subsequent tool calls require a fresh
   * justification.
   */
  consumeRationale(sessionId: string, callId: string): void {
    const rationales = this.rationaleBySession.get(sessionId);
    if (!rationales) {
      return;
    }
    rationales.delete(callId);
  }
}
