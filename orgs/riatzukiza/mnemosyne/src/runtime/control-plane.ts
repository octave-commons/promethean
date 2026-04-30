const WINDOW_MS = 20 * 60_000;
const ERROR_WINDOW_MS = 10 * 60_000;
const POSITIVE_TOKENS = [
  "thanks",
  "thank",
  "nice",
  "good",
  "great",
  "cool",
  "love",
  "welcome",
  "lol",
  "lmao",
  "haha",
  "perfect",
  "based",
];
const NEGATIVE_TOKENS = [
  "stop",
  "spam",
  "annoying",
  "cringe",
  "quiet",
  "shut",
  "unwelcome",
  "too much",
  "leave",
  "go away",
  "not now",
  "wtf",
  "ugh",
];

type ObservedHumanMessage = {
  readonly timestamp: number;
  readonly content: string;
  readonly mentionsCephalon: boolean;
};

type ObservedError = {
  readonly timestamp: number;
  readonly message: string;
  readonly rateLimit: boolean;
};

export interface ControlPlaneSnapshot {
  readonly healthScore: number;
  readonly welcomeScore: number;
  readonly pacingMultiplier: number;
  readonly queuePressure: number;
  readonly errorPressure: number;
  readonly rateLimitPressure: number;
  readonly recentHumanMessages: number;
  readonly statusLine: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9#@:_-]+/)
    .filter((token) => token.length >= 2);
}

function includesPhrase(text: string, phrase: string): boolean {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

export class CephalonControlPlane {
  private readonly recentHumanMessages: ObservedHumanMessage[] = [];
  private readonly recentErrors: ObservedError[] = [];

  private healthScore = 1;
  private welcomeScore = 0.62;
  private pacingMultiplier = 1;
  private queuePressure = 0;
  private errorPressure = 0;
  private rateLimitPressure = 0;

  observeMessage(payload: { authorIsBot?: boolean; content?: string; timestamp?: number; mentionsCephalon?: boolean }): void {
    if (payload.authorIsBot) {
      return;
    }

    this.prune();
    this.recentHumanMessages.push({
      timestamp: payload.timestamp ?? Date.now(),
      content: payload.content ?? "",
      mentionsCephalon: Boolean(payload.mentionsCephalon),
    });
  }

  observeTurnError(message: string | undefined): void {
    const normalized = (message ?? "").trim();
    if (!normalized) {
      return;
    }

    this.prune();
    const lowered = normalized.toLowerCase();
    this.recentErrors.push({
      timestamp: Date.now(),
      message: normalized,
      rateLimit: lowered.includes("429")
        || lowered.includes("rate limit")
        || lowered.includes("all_keys_rate_limited")
        || lowered.includes("no_available_key"),
    });
  }

  runHomeostasisTick(input: {
    readonly totalQueuedEvents: number;
    readonly runningSessions: number;
    readonly activeLlmLoopCount: number;
  }): ControlPlaneSnapshot {
    this.prune();

    const loopCount = Math.max(1, input.activeLlmLoopCount);
    this.queuePressure = clamp(input.totalQueuedEvents / (loopCount * 6), 0, 1);

    const recentErrors = this.recentErrors.filter((entry) => Date.now() - entry.timestamp <= ERROR_WINDOW_MS);
    const rateLimitedErrors = recentErrors.filter((entry) => entry.rateLimit).length;
    this.errorPressure = clamp(recentErrors.length / Math.max(3, loopCount), 0, 1);
    this.rateLimitPressure = clamp(rateLimitedErrors / Math.max(2, loopCount / 2), 0, 1);

    this.healthScore = clamp(
      1 - (this.queuePressure * 0.22) - (this.errorPressure * 0.28) - (this.rateLimitPressure * 0.5),
      0.05,
      1,
    );

    this.pacingMultiplier = clamp(
      1
        + (this.queuePressure * 0.9)
        + (this.errorPressure * 1.1)
        + (this.rateLimitPressure * 2.2)
        + ((1 - this.welcomeScore) * 0.6),
      1,
      6,
    );

    return this.snapshot();
  }

  runSentimentTick(): ControlPlaneSnapshot {
    this.prune();

    const messages = this.recentHumanMessages.filter((entry) => Date.now() - entry.timestamp <= WINDOW_MS);
    if (messages.length === 0) {
      this.welcomeScore = clamp(this.welcomeScore * 0.9 + 0.1 * 0.62, 0.05, 0.95);
      return this.snapshot();
    }

    let positive = 0;
    let negative = 0;

    for (const message of messages) {
      const lowered = message.content.toLowerCase();
      const tokens = tokenize(lowered);
      for (const token of POSITIVE_TOKENS) {
        if (token.includes(" ") ? includesPhrase(lowered, token) : tokens.includes(token)) {
          positive += message.mentionsCephalon ? 2 : 1;
        }
      }
      for (const token of NEGATIVE_TOKENS) {
        if (token.includes(" ") ? includesPhrase(lowered, token) : tokens.includes(token)) {
          negative += message.mentionsCephalon ? 3 : 1;
        }
      }
    }

    const normalizedSignal = (positive - negative) / Math.max(2, messages.length * 2);
    this.welcomeScore = clamp(0.58 + normalizedSignal, 0.05, 0.95);
    return this.snapshot();
  }

  getSuggestedDelayMs(baseIntervalMs: number, circuitIndex: number, loopKind: "llm" | "control" = "llm"): number {
    if (loopKind === "control") {
      return baseIntervalMs;
    }

    const sensitivity = clamp(1 + Math.max(0, circuitIndex - 3) * 0.18, 1, 2.2);
    return Math.max(
      baseIntervalMs,
      Math.round(baseIntervalMs * clamp(1 + ((this.pacingMultiplier - 1) * sensitivity), 1, 8)),
    );
  }

  overlayForCircuit(circuitId: string): string {
    const snapshot = this.snapshot();
    if (circuitId === "c1-survival") {
      return `Control plane / homeostasis: ${snapshot.statusLine}`;
    }
    if (circuitId === "c2-territorial") {
      return `Control plane / social weather: welcome=${round(snapshot.welcomeScore)} queue=${round(snapshot.queuePressure)} pace=x${round(snapshot.pacingMultiplier)}.`;
    }

    return [
      `Control plane: ${snapshot.statusLine}`,
      "Avoid duplicated pile-ons. If another circuit likely has the same context, prefer novelty, different evidence, or silence.",
    ].join("\n");
  }

  snapshot(): ControlPlaneSnapshot {
    return {
      healthScore: round(this.healthScore),
      welcomeScore: round(this.welcomeScore),
      pacingMultiplier: round(this.pacingMultiplier),
      queuePressure: round(this.queuePressure),
      errorPressure: round(this.errorPressure),
      rateLimitPressure: round(this.rateLimitPressure),
      recentHumanMessages: this.recentHumanMessages.length,
      statusLine:
        `health=${round(this.healthScore)} welcome=${round(this.welcomeScore)} `
        + `queue=${round(this.queuePressure)} errors=${round(this.errorPressure)} `
        + `rateLimits=${round(this.rateLimitPressure)} pace=x${round(this.pacingMultiplier)}`,
    };
  }

  private prune(): void {
    const now = Date.now();
    while (this.recentHumanMessages.length > 0 && now - this.recentHumanMessages[0]!.timestamp > WINDOW_MS) {
      this.recentHumanMessages.shift();
    }
    while (this.recentErrors.length > 0 && now - this.recentErrors[0]!.timestamp > ERROR_WINDOW_MS) {
      this.recentErrors.shift();
    }
  }
}
