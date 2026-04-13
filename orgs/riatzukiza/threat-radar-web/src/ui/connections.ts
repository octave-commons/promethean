// ---------------------------------------------------------------------------
// Client-side connection detection engine for the Π (connections) lane.
//
// A browser-compatible adaptation of radar-core/connections.ts that generates
// ConnectionOpportunity-like and ActionCard-like objects from thread data
// available in RadarTile. No node:crypto dependency — uses simple counter IDs.
// ---------------------------------------------------------------------------

import type { ThreadData } from "../api/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConnectionType = "causal" | "correlative" | "predictive";
export type BridgeType = "global_to_local" | "local_to_global_hypothesis" | "shared_campaign" | "shared_indicator";
export type UrgencyLevel = "critical" | "high" | "moderate" | "low";

export interface BridgeCardData {
  readonly id: string;
  readonly globalThread: ThreadData;
  readonly localThread: ThreadData;
  readonly connectionType: ConnectionType;
  readonly bridgeType: BridgeType;
  readonly strength: number;
  readonly semanticSimilarity: number | null;
  readonly title: string;
  readonly summary: string;
  readonly realism: number;
  readonly fear: number;
  readonly public_benefit: number;
  readonly polarization_risk: number;
  readonly compression_loss: number;
  readonly suggestedActions: readonly string[];
  readonly coordinationPath: string;
  readonly rationale: readonly string[];
}

export interface PiActionCardData {
  readonly id: string;
  readonly bridgeId: string;
  readonly title: string;
  readonly description: string;
  readonly urgency: number;
  readonly urgencyLevel: UrgencyLevel;
  readonly scope: string;
  readonly effort: string;
  readonly risk: string;
  readonly actionableSteps: readonly string[];
  readonly timeWindow: string;
  readonly expectedBenefit: string;
  readonly feedbackMetric: string;
}

export interface ConnectionResult {
  readonly bridges: BridgeCardData[];
  readonly actionCards: PiActionCardData[];
}

// ---------------------------------------------------------------------------
// ID generation (browser-compatible, deterministic for stable renders)
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic ID from a prefix and key components.
 * This ensures IDs are stable across re-renders when inputs haven't changed.
 */
function deterministicId(prefix: string, ...parts: string[]): string {
  return `${prefix}-${parts.join("-")}`;
}

// ---------------------------------------------------------------------------
// Stop-words (consistent with radar-core)
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an",
  "and", "any", "are", "as", "at", "be", "because", "been", "before",
  "being", "below", "between", "both", "but", "by", "can", "could", "did",
  "do", "does", "doing", "down", "during", "each", "few", "for", "from",
  "further", "get", "got", "had", "has", "have", "having", "he", "her",
  "here", "hers", "herself", "him", "himself", "his", "how", "if",
  "in", "into", "is", "it", "its", "itself", "just", "me", "might",
  "more", "most", "must", "my", "myself", "no", "nor", "not", "now", "of",
  "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves",
  "out", "over", "own", "same", "she", "should", "so", "some", "such",
  "than", "that", "the", "their", "theirs", "them", "themselves", "then",
  "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when",
  "where", "which", "while", "who", "whom", "why", "will", "with", "would",
  "you", "your", "yours", "yourself", "yourselves",
]);

// ---------------------------------------------------------------------------
// Tokenization & term vectors
// ---------------------------------------------------------------------------

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
}

type TermVector = Map<string, number>;

function buildTermVector(tokens: string[]): TermVector {
  const freq: TermVector = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  const total = tokens.length;
  if (total > 0) {
    for (const [term, count] of freq) {
      freq.set(term, count / total);
    }
  }
  return freq;
}

function cosineSimilarity(a: TermVector, b: TermVector): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [term, valA] of a) {
    normA += valA * valA;
    const valB = b.get(term);
    if (valB !== undefined) dot += valA * valB;
  }
  for (const valB of b.values()) normB += valB * valB;
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function keywordOverlap(tokensA: string[], tokensB: string[]): number {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) { if (setB.has(t)) intersection++; }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ---------------------------------------------------------------------------
// Inference helpers
// ---------------------------------------------------------------------------

function inferConnectionType(
  globalThread: ThreadData,
  localThread: ThreadData,
  kwOverlap: number,
): ConnectionType {
  const globalFirst = new Date(globalThread.timeline.first_seen).getTime();
  const localFirst = new Date(localThread.timeline.first_seen).getTime();
  const deltaMs = localFirst - globalFirst;
  const ONE_DAY = 86_400_000;

  if (deltaMs > ONE_DAY && kwOverlap > 0.15) return "causal";
  if (deltaMs > 0 && kwOverlap > 0.05) return "predictive";
  return "correlative";
}

function inferBridgeType(ct: ConnectionType): BridgeType {
  switch (ct) {
    case "causal": return "global_to_local";
    case "predictive": return "shared_indicator";
    case "correlative": return "shared_campaign";
  }
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function scoreRealism(g: ThreadData, l: ThreadData, strength: number): number {
  const avgConf = (g.confidence + l.confidence) / 2;
  const gSrc = Object.keys(g.source_distribution).length;
  const lSrc = Object.keys(l.source_distribution).length;
  const srcDiv = Math.min(1, (gSrc + lSrc) / 6);
  return round2(Math.min(100, (avgConf * 40 + srcDiv * 30 + strength * 30) * 100));
}

function scoreFear(g: ThreadData): number {
  const kind: Record<string, number> = { event: 0.8, narrative: 0.5, local_opportunity: 0.2 };
  const status: Record<string, number> = { emerging: 0.9, active: 0.7, cooling: 0.3, archived: 0.1 };
  return round2((kind[g.kind] ?? 0.5) * 60 + (status[g.status] ?? 0.5) * 40);
}

function scorePublicBenefit(l: ThreadData, strength: number): number {
  const kind: Record<string, number> = { local_opportunity: 0.9, narrative: 0.5, event: 0.3 };
  const kScore = kind[l.kind] ?? 0.5;
  const communityBoost = l.domain_tags.includes("community") ? 0.15 : 0;
  return round2(Math.min(100, (kScore + communityBoost + strength * 0.2) * 80));
}

function scorePolarizationRisk(g: ThreadData, l: ThreadData): number {
  const confDiff = Math.abs(g.confidence - l.confidence);
  const gSrcCount = Object.keys(g.source_distribution).length;
  const concentration = gSrcCount <= 1 ? 0.8 : gSrcCount <= 2 ? 0.5 : 0.2;
  return round2(concentration * 60 + confDiff * 40);
}

function scoreCompressionLoss(g: ThreadData, l: ThreadData): number {
  const gTags = new Set(g.domain_tags);
  const lTags = new Set(l.domain_tags);
  const all = new Set([...gTags, ...lTags]);
  let shared = 0;
  for (const t of gTags) { if (lTags.has(t)) shared++; }
  const ratio = all.size > 0 ? shared / all.size : 0;
  return round2(Math.min(100, (1 - ratio) * 80));
}

// ---------------------------------------------------------------------------
// Strength calculation
// ---------------------------------------------------------------------------

function calculateStrength(
  g: ThreadData, l: ThreadData,
  gTokens: string[], lTokens: string[],
  gVec: TermVector, lVec: TermVector,
): number {
  const cosine = cosineSimilarity(gVec, lVec);
  const overlap = keywordOverlap(gTokens, lTokens);

  const gTags = new Set(g.domain_tags);
  const lTags = new Set(l.domain_tags);
  let tagIntersection = 0;
  for (const t of gTags) { if (lTags.has(t)) tagIntersection++; }
  const tagUnion = gTags.size + lTags.size - tagIntersection;
  const tagOverlap = tagUnion > 0 ? tagIntersection / tagUnion : 0;

  return round2(Math.min(1, Math.max(0, cosine * 0.5 + overlap * 0.3 + tagOverlap * 0.2)));
}

// ---------------------------------------------------------------------------
// Description generation
// ---------------------------------------------------------------------------

function generateDescription(
  g: ThreadData, l: ThreadData,
  ct: ConnectionType, strength: number,
): string {
  const sLabel = strength > 0.7 ? "Strong" : strength > 0.4 ? "Moderate" : "Weak";
  const typeLabels: Record<ConnectionType, string> = {
    causal: "appears to influence",
    correlative: "correlates with",
    predictive: "may foreshadow changes in",
  };
  return `${sLabel} ${ct} link: "${g.title}" ${typeLabels[ct]} "${l.title}"`;
}

// ---------------------------------------------------------------------------
// Action steps
// ---------------------------------------------------------------------------

function deriveActionSteps(
  g: ThreadData, l: ThreadData, ct: ConnectionType,
): string[] {
  const steps: string[] = [];
  steps.push(`Monitor "${g.title}" for developments affecting local context`);
  switch (ct) {
    case "causal":
      steps.push(`Assess direct impact of ${g.kind} signals on "${l.title}"`);
      steps.push("Identify mitigation strategies if negative impact detected");
      steps.push("Coordinate with community stakeholders on response plan");
      break;
    case "predictive":
      steps.push(`Prepare contingency plans for "${l.title}" based on global trajectory`);
      steps.push("Set up alert thresholds for early warning indicators");
      steps.push("Document baseline metrics to measure future changes");
      break;
    case "correlative":
      steps.push(`Investigate whether correlation with "${g.title}" implies shared root cause`);
      steps.push("Gather additional data points to establish or refute causal link");
      steps.push("Share findings with relevant community members");
      break;
  }
  if (l.kind === "local_opportunity") {
    steps.push("Evaluate opportunity window and community readiness");
  }
  return steps;
}

function inferUrgencyLevel(urgency: number): UrgencyLevel {
  if (urgency >= 0.8) return "critical";
  if (urgency >= 0.6) return "high";
  if (urgency >= 0.35) return "moderate";
  return "low";
}

function inferScope(l: ThreadData, ct: ConnectionType): string {
  if (ct === "correlative") return "team";
  if (l.kind === "local_opportunity") return "community";
  if (l.domain_tags.includes("community")) return "community";
  return "individual";
}

function inferEffort(g: ThreadData, l: ThreadData): string {
  const total = (g.members?.length ?? 0) + (l.members?.length ?? 0);
  if (total > 10) return "weeks";
  if (total > 5) return "days";
  if (total > 2) return "hours";
  return "minutes";
}

function inferRisk(g: ThreadData): string {
  if (g.kind === "event" && g.status === "emerging") return "high";
  if (g.kind === "event") return "medium";
  if (g.status === "emerging") return "low";
  return "none";
}

// ---------------------------------------------------------------------------
// Main: detect connections from thread data
// ---------------------------------------------------------------------------

/** Minimum strength for including a connection at all */
const MIN_STRENGTH = 0.05;
/** Threshold above which to generate ActionCards */
const ACTION_THRESHOLD = 0.3;

export interface SimilarityLookup {
  get(globalTitle: string, localTitle: string): number | null;
}

/**
 * Detect connections between global and local threads.
 * Accepts an optional similarity lookup for browser-embedding similarity scores.
 */
export function detectClientConnections(
  globalThreads: readonly ThreadData[],
  localThreads: readonly ThreadData[],
  similarityLookup?: SimilarityLookup,
): ConnectionResult {
  if (globalThreads.length === 0 || localThreads.length === 0) {
    return { bridges: [], actionCards: [] };
  }

  const bridges: BridgeCardData[] = [];
  const actionCards: PiActionCardData[] = [];

  // Pre-compute
  const gData = globalThreads.map((t) => {
    const text = [t.title, t.summary ?? ""].join(" ");
    const tokens = tokenize(text);
    const vector = buildTermVector(tokens);
    return { thread: t, tokens, vector };
  });

  const lData = localThreads.map((t) => {
    const text = [t.title, t.summary ?? ""].join(" ");
    const tokens = tokenize(text);
    const vector = buildTermVector(tokens);
    return { thread: t, tokens, vector };
  });

  for (const g of gData) {
    for (const l of lData) {
      const strength = calculateStrength(
        g.thread, l.thread,
        g.tokens, l.tokens,
        g.vector, l.vector,
      );
      if (strength < MIN_STRENGTH) continue;

      const kwOverlap = keywordOverlap(g.tokens, l.tokens);
      const ct = inferConnectionType(g.thread, l.thread, kwOverlap);
      const bt = inferBridgeType(ct);
      const semSim = similarityLookup?.get(g.thread.title, l.thread.title) ?? null;
      const actions = deriveActionSteps(g.thread, l.thread, ct);

      const bridgeId = deterministicId("bridge", g.thread.id, l.thread.id);
      const bridge: BridgeCardData = {
        id: bridgeId,
        globalThread: g.thread,
        localThread: l.thread,
        connectionType: ct,
        bridgeType: bt,
        strength,
        semanticSimilarity: semSim,
        title: `${g.thread.title} → ${l.thread.title}`,
        summary: generateDescription(g.thread, l.thread, ct, strength),
        realism: scoreRealism(g.thread, l.thread, strength),
        fear: scoreFear(g.thread),
        public_benefit: scorePublicBenefit(l.thread, strength),
        polarization_risk: scorePolarizationRisk(g.thread, l.thread),
        compression_loss: scoreCompressionLoss(g.thread, l.thread),
        suggestedActions: actions.slice(0, 3),
        coordinationPath: `Coordinate ${l.thread.kind === "local_opportunity" ? "community response" : "information sharing"} through federated assessment exchange`,
        rationale: [
          `Keyword overlap: ${round2(kwOverlap * 100)}%`,
          `Term cosine: ${round2(cosineSimilarity(g.vector, l.vector) * 100)}%`,
          `Type: ${ct}`,
        ],
      };
      bridges.push(bridge);

      // Generate action card for connections above threshold
      if (strength > ACTION_THRESHOLD) {
        const statusUrg: Record<string, number> = {
          emerging: 0.9, active: 0.7, cooling: 0.3, archived: 0.1,
        };
        const urgency = round2(strength * 0.6 + (statusUrg[g.thread.status] ?? 0.5) * 0.4);
        const timeLabel = urgency > 0.7 ? "within 24 hours" : urgency > 0.4 ? "this week" : "coordination opportunity";

        actionCards.push({
          id: deterministicId("action", g.thread.id, l.thread.id),
          bridgeId,
          title: `Action: ${l.thread.title} — respond to ${g.thread.title}`,
          description: `${ct.charAt(0).toUpperCase() + ct.slice(1)} connection detected (strength ${round2(strength)}). ${actions.length} actionable steps identified.`,
          urgency,
          urgencyLevel: inferUrgencyLevel(urgency),
          scope: inferScope(l.thread, ct),
          effort: inferEffort(g.thread, l.thread),
          risk: inferRisk(g.thread),
          actionableSteps: actions,
          timeWindow: timeLabel,
          expectedBenefit: `Improved preparedness for "${l.thread.title}" based on "${g.thread.title}"`,
          feedbackMetric: "Proportion of actionable steps completed within time window",
        });
      }
    }
  }

  // Sort bridges by strength descending
  bridges.sort((a, b) => b.strength - a.strength);
  // Sort action cards by urgency descending
  actionCards.sort((a, b) => b.urgency - a.urgency);

  return { bridges, actionCards };
}

// Re-export for testing
export {
  tokenize as _tokenize,
  buildTermVector as _buildTermVector,
  cosineSimilarity as _cosineSimilarity,
  keywordOverlap as _keywordOverlap,
  calculateStrength as _calculateStrength,
  inferConnectionType as _inferConnectionType,
  deriveActionSteps as _deriveActionSteps,
  inferUrgencyLevel as _inferUrgencyLevel,
  MIN_STRENGTH,
  ACTION_THRESHOLD,
};
