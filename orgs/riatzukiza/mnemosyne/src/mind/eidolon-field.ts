import type { DiscordMessagePayload } from "../types/index.js";

const DIMENSIONS = [
  "aionian",
  "dorian",
  "gnostic",
  "nemesian",
  "heuretic",
  "oneiric",
  "metisean",
  "anankean",
] as const;

export type EidolonDimension = (typeof DIMENSIONS)[number];

export class EidolonFieldState {
  private values = new Map<EidolonDimension, number>(DIMENSIONS.map((dimension) => [dimension, 0]));

  ingestDiscordMessage(payload: DiscordMessagePayload): void {
    const content = payload.content || "";
    const hasAttachments = Array.isArray(payload.attachments) && payload.attachments.length > 0;

    this.bump("aionian", payload.mentionsCephalon ? 2.5 : 0.6);
    this.bump("dorian", content.length > 0 ? 0.8 : 0.3);
    this.bump("gnostic", /(https?:\/\/|```|\bwhy\b|\bhow\b|\bexplain\b|\bwhat\b)/i.test(content) ? 1.4 : 0.4);
    this.bump("nemesian", /(sorry|should|wrong|fix|repair|please|thanks|careful)/i.test(content) ? 1.2 : 0.3);
    this.bump("heuretic", /(again|works?|failed?|error|bug|learn|better|improve|regress)/i.test(content) || payload.replyTo ? 1.1 : 0.25);
    this.bump("oneiric", hasAttachments || /(dream|imagine|meme|art|beautiful|weird|vision)/i.test(content) ? 1.5 : 0.2);
    this.bump("metisean", /(plan|build|design|system|architecture|refactor|protocol|workflow|deploy)/i.test(content) ? 1.6 : 0.25);
    this.bump("anankean", /(must|constraint|global|network|whole|all|truth|necessary|fate)/i.test(content) || payload.mentionsCephalon ? 0.9 : 0.15);
    this.decay();
  }

  ingestFeedSummary(summary: string): void {
    this.bump("gnostic", 0.6);
    this.bump("heuretic", 0.3);
    this.bump("oneiric", /(art|design|image|music|culture|dream)/i.test(summary) ? 0.8 : 0.2);
    this.bump("metisean", /(system|architecture|tool|workflow|policy|deploy)/i.test(summary) ? 0.7 : 0.2);
    this.bump("anankean", /(theory|philosophy|network|global|civilization)/i.test(summary) ? 0.6 : 0.15);
    this.decay();
  }

  summary(): string {
    return DIMENSIONS
      .map((dimension) => `${dimension}:${(this.values.get(dimension) ?? 0).toFixed(2)}`)
      .join(" | ");
  }

  private bump(dimension: EidolonDimension, amount: number): void {
    this.values.set(dimension, Math.min(12, (this.values.get(dimension) ?? 0) + amount));
  }

  private decay(): void {
    for (const dimension of DIMENSIONS) {
      this.values.set(dimension, Math.max(0, (this.values.get(dimension) ?? 0) * 0.985));
    }
  }
}
