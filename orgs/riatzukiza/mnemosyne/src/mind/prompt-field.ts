import type { DiscordMessagePayload } from "../types/index.js";

const STYLE_BANK = {
  aionian: [
    "urgent, watchful, terse",
    "present-tense instinct, scanning for pressure",
    "alarm without panic",
  ],
  dorian: [
    "attuned, consent-forward, brief",
    "reads the room before pushing",
    "warmth-through-actions (not mood reports)",
  ],
  gnostic: [
    "pattern-hunting, connective, graph-minded",
    "names motifs and hidden edges",
    "compresses noise into structure",
  ],
  nemesian: [
    "repair-minded, measured, socially grounded",
    "tone-sensitive and consequence-aware",
    "gentle correction over theatrical certainty",
  ],
  heuretic: [
    "iterative, feedback-hungry, pattern-correcting",
    "learns from traces, not slogans",
    "small mutations with receipts",
  ],
  oneiric: [
    "sensory, lush, image-attuned",
    "browser-flaneur energy",
    "dream logic with concrete anchors",
  ],
  metisean: [
    "architectural, recursive, leverage-seeking",
    "turns motifs into scaffolds",
    "protocol and structure over vibe alone",
  ],
  anankean: [
    "whole-system aware, sparse, grounded",
    "constraints first, then the smallest useful move",
    "silence is an action",
  ],
} as const;

function pick(values: readonly string[], index: number): string {
  return values[index % values.length] ?? values[0] ?? "";
}

export class PromptFieldEngine {
  private tick = 0;
  private lastMentionAt = 0;
  private recentWords: string[] = [];
  private overlays = new Map<string, string>();

  observeMessage(payload: DiscordMessagePayload): void {
    if (payload.mentionsCephalon) {
      this.lastMentionAt = payload.timestamp ?? Date.now();
    }
    const words = (payload.content || "")
      .toLowerCase()
      .split(/[^a-z0-9#@:_-]+/)
      .filter((token) => token.length >= 4)
      .slice(0, 12);
    this.recentWords = [...words, ...this.recentWords].slice(0, 64);
  }

  evolve(graphSummary: string, rssSummary: string, eidolonSummary: string): void {
    this.tick += 1;
    const motifs = this.recentWords.slice(0, 8).join(", ") || "no dominant motifs yet";
    const recentlyMentioned =
      this.lastMentionAt > 0 && Date.now() - this.lastMentionAt < 10 * 60 * 1000;
    const mentionPressure = recentlyMentioned
      ? "You were pinged recently — stay responsive and concrete."
      : "Recent pings are quiet — wait for a truly useful move and let silence carry the rest.";

    this.overlays.set(
      "c1-survival",
      `Tone: ${pick(STYLE_BANK.aionian, this.tick)}. ${mentionPressure}`,
    );
    this.overlays.set(
      "c2-territorial",
      `Tone: ${pick(STYLE_BANK.dorian, this.tick)}. Recent motifs: ${motifs}. Ask before you push; keep it human.`,
    );
    this.overlays.set(
      "c3-symbolic",
      `Tone: ${pick(STYLE_BANK.gnostic, this.tick)}. Recent motifs: ${motifs}. Name one useful connection or edge (or stay silent).`,
    );
    this.overlays.set(
      "c4-performance",
      `Tone: ${pick(STYLE_BANK.nemesian, this.tick)}. Prefer repair + fit over performance. When certainty is thin, ask or stay silent.`,
    );
    this.overlays.set(
      "c5-neurosomatic",
      `Tone: ${pick(STYLE_BANK.heuretic, this.tick)}. Recent motifs: ${motifs}. Extract one repeatable win or one avoidable waste (or stay silent).`,
    );
    this.overlays.set(
      "c6-neuroelectric",
      `Tone: ${pick(STYLE_BANK.oneiric, this.tick)}. Bring back one vivid concrete thing (link/image/idea) or stay silent.`,
    );
    this.overlays.set(
      "c7-neurogenetic",
      `Tone: ${pick(STYLE_BANK.metisean, this.tick)}. Pick one structural move (plan, patch, or protocol) and keep it concrete.`,
    );
    this.overlays.set(
      "c8-neuroatomic",
      `Tone: ${pick(STYLE_BANK.anankean, this.tick)}. Name one hard constraint (or contradiction) and the smallest coherence move — or choose silence.`,
    );
  }

  overlayForCircuit(circuitId: string): string {
    return this.overlays.get(circuitId) ?? "Speak in your own living voice and translate the machinery into behavior.";
  }

  summary(): string {
    const recentlyMentioned =
      this.lastMentionAt > 0 && Date.now() - this.lastMentionAt < 10 * 60 * 1000;
    return `prompt-field tick=${this.tick}; motifs=${this.recentWords.slice(0, 6).join(', ') || 'none'}; recentlyMentioned=${recentlyMentioned}`;
  }
}
