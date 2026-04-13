import { randomUUID } from "node:crypto";
import type {
  Thread,
  ConnectionOpportunity,
  ActionCard,
} from "./schema.js";

// ---------------------------------------------------------------------------
// Stop-words (reused from cluster.ts for consistency)
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an",
  "and", "any", "are", "as", "at", "be", "because", "been", "before",
  "being", "below", "between", "both", "but", "by", "can", "could", "did",
  "do", "does", "doing", "down", "during", "each", "few", "for", "from",
  "further", "get", "got", "had", "has", "have", "having", "he", "her",
  "here", "hers", "herself", "him", "himself", "his", "how", "i", "if",
  "in", "into", "is", "it", "its", "itself", "just", "me", "might",
  "more", "most", "must", "my", "myself", "no", "nor", "not", "now", "of",
  "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves",
  "out", "over", "own", "same", "she", "should", "so", "some", "such",
  "than", "that", "the", "their", "theirs", "them", "themselves", "then",
  "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when",
  "where", "which", "while", "who", "whom", "why", "will", "with", "would",
  "you", "your", "yours", "yourself", "yourselves",
  "also", "new", "one", "two", "like", "well", "back", "even", "still",
  "way", "many", "much", "first", "last", "long", "great", "little",
  "right", "old", "big", "high", "different", "small", "large", "next",
  "early", "every", "keep", "never", "say", "says", "said", "make",
  "made", "us", "let", "going", "go", "come", "came", "take", "took",
  "know", "known", "think", "see", "look", "good", "give", "use", "used",
  "work", "day", "part", "may", "than",
]);

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

/**
 * Tokenize text into lowercase words, filtering stop-words and short tokens.
 * Returns tokens of length >= 3.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

// ---------------------------------------------------------------------------
// Term vector construction & cosine similarity
// ---------------------------------------------------------------------------

type TermVector = Map<string, number>;

/**
 * Build a normalized term frequency vector from a list of tokens.
 */
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

/**
 * Compute cosine similarity between two sparse term vectors.
 * Returns value in [0, 1] (non-negative TF vectors).
 */
function cosineSimilarity(a: TermVector, b: TermVector): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, valA] of a) {
    normA += valA * valA;
    const valB = b.get(term);
    if (valB !== undefined) {
      dotProduct += valA * valB;
    }
  }

  for (const valB of b.values()) {
    normB += valB * valB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// ---------------------------------------------------------------------------
// Keyword overlap computation
// ---------------------------------------------------------------------------

/**
 * Compute keyword overlap ratio between two sets of tokens.
 * Returns the Jaccard similarity: |A ∩ B| / |A ∪ B|.
 */
function keywordOverlap(tokensA: string[], tokensB: string[]): number {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  if (union === 0) return 0;

  return intersection / union;
}

// ---------------------------------------------------------------------------
// Connection type inference
// ---------------------------------------------------------------------------

type ConnectionType = "causal" | "correlative" | "predictive";

/**
 * Infer the connection type between a global and local thread based on their
 * characteristics and temporal relationship.
 *
 * - causal: global thread likely influences local (high keyword overlap +
 *   global thread appeared first)
 * - predictive: global patterns could foreshadow local changes
 * - correlative: signals co-occur but causal direction unclear
 */
function inferConnectionType(
  globalThread: Thread,
  localThread: Thread,
  kwOverlap: number,
): ConnectionType {
  const globalFirstSeen = new Date(globalThread.timeline.first_seen).getTime();
  const localFirstSeen = new Date(localThread.timeline.first_seen).getTime();

  // If global thread appeared significantly before local and overlap is high → causal
  const timeDeltaMs = localFirstSeen - globalFirstSeen;
  const ONE_DAY_MS = 86_400_000;

  if (timeDeltaMs > ONE_DAY_MS && kwOverlap > 0.15) {
    return "causal";
  }

  // If global thread appeared before local but overlap is moderate → predictive
  if (timeDeltaMs > 0 && kwOverlap > 0.05) {
    return "predictive";
  }

  // Default: correlative
  return "correlative";
}

// ---------------------------------------------------------------------------
// Connection strength calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the connection strength between a global and local thread.
 *
 * Combines:
 *  - Cosine similarity of term vectors (weighted 0.5)
 *  - Keyword (Jaccard) overlap (weighted 0.3)
 *  - Domain tag overlap bonus (weighted 0.2)
 *
 * Returns value in [0, 1].
 */
function calculateStrength(
  globalThread: Thread,
  localThread: Thread,
  globalTokens: string[],
  localTokens: string[],
  globalVector: TermVector,
  localVector: TermVector,
): number {
  // 1. Cosine similarity of term vectors
  const cosine = cosineSimilarity(globalVector, localVector);

  // 2. Keyword overlap (Jaccard)
  const overlap = keywordOverlap(globalTokens, localTokens);

  // 3. Domain tag overlap
  const globalTags = new Set(globalThread.domain_tags);
  const localTags = new Set(localThread.domain_tags);
  let tagOverlap = 0;
  if (globalTags.size > 0 || localTags.size > 0) {
    let tagIntersection = 0;
    for (const tag of globalTags) {
      if (localTags.has(tag)) tagIntersection++;
    }
    const tagUnion = globalTags.size + localTags.size - tagIntersection;
    tagOverlap = tagUnion > 0 ? tagIntersection / tagUnion : 0;
  }

  // Weighted combination
  const strength = cosine * 0.5 + overlap * 0.3 + tagOverlap * 0.2;

  // Clamp to [0, 1] and round to 4 decimal places
  return Math.round(Math.min(1, Math.max(0, strength)) * 10000) / 10000;
}

// ---------------------------------------------------------------------------
// Description generation
// ---------------------------------------------------------------------------

/**
 * Generate a human-readable description for a connection.
 */
function generateConnectionDescription(
  globalThread: Thread,
  localThread: Thread,
  connectionType: ConnectionType,
  strength: number,
): string {
  const strengthLabel = strength > 0.7 ? "strong" : strength > 0.4 ? "moderate" : "weak";
  const typeLabels: Record<ConnectionType, string> = {
    causal: "appears to influence",
    correlative: "correlates with",
    predictive: "may foreshadow changes in",
  };

  return `${strengthLabel.charAt(0).toUpperCase() + strengthLabel.slice(1)} ${connectionType} link: "${globalThread.title}" ${typeLabels[connectionType]} "${localThread.title}"`;
}

// ---------------------------------------------------------------------------
// Bridge type inference
// ---------------------------------------------------------------------------

/**
 * Map connection type to a bridge_type for ConnectionOpportunity.
 */
function inferBridgeType(
  connectionType: ConnectionType,
): "global_to_local" | "local_to_global_hypothesis" | "shared_campaign" | "shared_indicator" {
  switch (connectionType) {
    case "causal":
      return "global_to_local";
    case "predictive":
      return "shared_indicator";
    case "correlative":
      return "shared_campaign";
  }
}

// ---------------------------------------------------------------------------
// Scoring helpers for ConnectionOpportunity
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Score the realism of a connection based on source diversity and confidence.
 */
function scoreRealism(globalThread: Thread, localThread: Thread, strength: number): number {
  const avgConf = (globalThread.confidence + localThread.confidence) / 2;
  const globalSources = Object.keys(globalThread.source_distribution).length;
  const localSources = Object.keys(localThread.source_distribution).length;
  const sourceDiversity = Math.min(1, (globalSources + localSources) / 6);
  return round2(Math.min(100, (avgConf * 40 + sourceDiversity * 30 + strength * 30) * 100));
}

/**
 * Score the fear factor: higher for event-type global threads with high urgency.
 */
function scoreFear(globalThread: Thread): number {
  const kindScores: Record<string, number> = {
    event: 0.8,
    narrative: 0.5,
    local_opportunity: 0.2,
  };
  const statusScores: Record<string, number> = {
    emerging: 0.9,
    active: 0.7,
    cooling: 0.3,
    archived: 0.1,
  };
  const kindScore = kindScores[globalThread.kind] ?? 0.5;
  const statusScore = statusScores[globalThread.status] ?? 0.5;
  return round2((kindScore * 60 + statusScore * 40));
}

/**
 * Score public benefit: higher for local_opportunity threads.
 */
function scorePublicBenefit(localThread: Thread, strength: number): number {
  const kindScores: Record<string, number> = {
    local_opportunity: 0.9,
    narrative: 0.5,
    event: 0.3,
  };
  const kindScore = kindScores[localThread.kind] ?? 0.5;
  const communityBoost = localThread.domain_tags.includes("community") ? 0.15 : 0;
  return round2(Math.min(100, (kindScore + communityBoost + strength * 0.2) * 80));
}

/**
 * Score polarization risk: higher when sources are concentrated and confidence diverges.
 */
function scorePolarizationRisk(globalThread: Thread, localThread: Thread): number {
  const confDiff = Math.abs(globalThread.confidence - localThread.confidence);
  const globalSourceCount = Object.keys(globalThread.source_distribution).length;
  const concentration = globalSourceCount <= 1 ? 0.8 : globalSourceCount <= 2 ? 0.5 : 0.2;
  return round2((concentration * 60 + confDiff * 40));
}

/**
 * Score compression loss: how much nuance is lost when linking these threads.
 */
function scoreCompressionLoss(
  globalThread: Thread,
  localThread: Thread,
): number {
  const globalTags = new Set(globalThread.domain_tags);
  const localTags = new Set(localThread.domain_tags);
  const allTags = new Set([...globalTags, ...localTags]);
  let sharedTags = 0;
  for (const tag of globalTags) {
    if (localTags.has(tag)) sharedTags++;
  }
  // Higher loss when fewer tags overlap (more information compressed)
  const overlapRatio = allTags.size > 0 ? sharedTags / allTags.size : 0;
  return round2(Math.min(100, (1 - overlapRatio) * 80));
}

// ---------------------------------------------------------------------------
// ActionCard generation
// ---------------------------------------------------------------------------

/**
 * Derive actionable steps from connected threads.
 */
function deriveActionableSteps(
  globalThread: Thread,
  localThread: Thread,
  connectionType: ConnectionType,
): string[] {
  const steps: string[] = [];

  // Always start with monitoring
  steps.push(`Monitor "${globalThread.title}" for developments affecting local context`);

  // Add type-specific steps
  switch (connectionType) {
    case "causal":
      steps.push(`Assess direct impact of ${globalThread.kind} signals on "${localThread.title}"`);
      steps.push("Identify mitigation strategies if negative impact detected");
      steps.push("Coordinate with community stakeholders on response plan");
      break;
    case "predictive":
      steps.push(`Prepare contingency plans for "${localThread.title}" based on global trajectory`);
      steps.push("Set up alert thresholds for early warning indicators");
      steps.push("Document baseline metrics to measure future changes");
      break;
    case "correlative":
      steps.push(`Investigate whether correlation with "${globalThread.title}" implies shared root cause`);
      steps.push("Gather additional data points to establish or refute causal link");
      steps.push("Share findings with relevant community members");
      break;
  }

  // Add thread-kind-specific steps
  if (localThread.kind === "local_opportunity") {
    steps.push("Evaluate opportunity window and community readiness");
  }

  return steps;
}

/**
 * Infer ActionCard scope from connection type and thread characteristics.
 */
function inferScope(
  localThread: Thread,
  connectionType: ConnectionType,
): "individual" | "team" | "community" | "network" {
  if (connectionType === "correlative") return "team";
  if (localThread.kind === "local_opportunity") return "community";
  if (localThread.domain_tags.includes("community")) return "community";
  return "individual";
}

/**
 * Infer effort level from thread complexity.
 */
function inferEffort(
  globalThread: Thread,
  localThread: Thread,
): "minutes" | "hours" | "days" | "weeks" {
  const totalMembers =
    (globalThread.members?.length ?? 0) + (localThread.members?.length ?? 0);
  if (totalMembers > 10) return "weeks";
  if (totalMembers > 5) return "days";
  if (totalMembers > 2) return "hours";
  return "minutes";
}

/**
 * Infer risk level from global thread characteristics.
 */
function inferRisk(globalThread: Thread): "none" | "low" | "medium" | "high" {
  if (globalThread.kind === "event" && globalThread.status === "emerging") return "high";
  if (globalThread.kind === "event") return "medium";
  if (globalThread.status === "emerging") return "low";
  return "none";
}

/**
 * Generate an ActionCard for a strong connection.
 */
function generateActionCard(
  connection: ConnectionOpportunity,
  globalThread: Thread,
  localThread: Thread,
  connectionType: ConnectionType,
): ActionCard {
  const now = new Date().toISOString();
  const steps = deriveActionableSteps(globalThread, localThread, connectionType);
  const scope = inferScope(localThread, connectionType);
  const effort = inferEffort(globalThread, localThread);
  const risk = inferRisk(globalThread);

  // Urgency derived from connection strength and global thread status
  const statusUrgency: Record<string, number> = {
    emerging: 0.9,
    active: 0.7,
    cooling: 0.3,
    archived: 0.1,
  };
  const urgency = round2(
    connection.score * 0.6 + (statusUrgency[globalThread.status] ?? 0.5) * 0.4,
  );

  // Time window label based on urgency
  const timeLabel = urgency > 0.7 ? "within 24 hours" : urgency > 0.4 ? "this week" : "coordination opportunity";

  return {
    id: randomUUID(),
    connection_opportunity_id: connection.id,
    title: `Action: ${localThread.title} — respond to ${globalThread.title}`,
    description: `${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} connection detected (strength ${round2(connection.score)}). ${steps.length} actionable steps identified to address the link between global and local signals.`,
    scope,
    effort,
    expected_benefit: `Improved preparedness and response capability for "${localThread.title}" based on insights from "${globalThread.title}"`,
    risk,
    risk_description: risk !== "none"
      ? `Global ${globalThread.kind} thread in ${globalThread.status} status may evolve unpredictably`
      : undefined,
    feedback_metric: {
      name: "response_effectiveness",
      measurement: "Proportion of actionable steps completed within time window",
      baseline: 0,
      target: 0.8,
    },
    time_window: {
      label: timeLabel,
    },
    status: "proposed",
    created_at: now,
    updated_at: now,
  };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/** Minimum strength threshold for generating ActionCards */
const ACTION_CARD_THRESHOLD = 0.5;

/** Minimum strength for including a connection at all */
const MIN_CONNECTION_STRENGTH = 0.05;

export interface DetectConnectionsResult {
  readonly connections: ConnectionOpportunity[];
  readonly actionCards: ActionCard[];
}

/**
 * Detect meaningful connections between η (global) threads and μ (local) threads.
 *
 * For each global-local pair:
 *  1. Compute keyword overlap (Jaccard similarity)
 *  2. Compute cosine similarity of term frequency vectors
 *  3. Compute domain tag overlap bonus
 *  4. Combine into a connection strength score (0-1)
 *  5. Infer connection type (causal / correlative / predictive)
 *  6. Generate ConnectionOpportunity if strength > minimum threshold
 *  7. Generate ActionCard for strong connections (strength > 0.5)
 *
 * @param globalThreads - η-categorized threads (geopolitical, infrastructure, etc.)
 * @param localThreads  - μ-categorized threads (community, local, technology, etc.)
 * @returns Object containing arrays of ConnectionOpportunity and ActionCard objects
 */
export function detectConnections(
  globalThreads: ReadonlyArray<Thread>,
  localThreads: ReadonlyArray<Thread>,
): DetectConnectionsResult {
  if (globalThreads.length === 0 || localThreads.length === 0) {
    return { connections: [], actionCards: [] };
  }

  const now = new Date().toISOString();
  const connections: ConnectionOpportunity[] = [];
  const actionCards: ActionCard[] = [];

  // Pre-compute tokens and vectors for all threads
  const globalData = globalThreads.map((thread) => {
    const text = [thread.title, thread.summary ?? ""].join(" ");
    const tokens = tokenize(text);
    const vector = buildTermVector(tokens);
    return { thread, tokens, vector };
  });

  const localData = localThreads.map((thread) => {
    const text = [thread.title, thread.summary ?? ""].join(" ");
    const tokens = tokenize(text);
    const vector = buildTermVector(tokens);
    return { thread, tokens, vector };
  });

  // Compare every global thread with every local thread
  for (const global of globalData) {
    for (const local of localData) {
      const strength = calculateStrength(
        global.thread,
        local.thread,
        global.tokens,
        local.tokens,
        global.vector,
        local.vector,
      );

      // Skip negligible connections
      if (strength < MIN_CONNECTION_STRENGTH) continue;

      const kwOverlap = keywordOverlap(global.tokens, local.tokens);
      const connectionType = inferConnectionType(global.thread, local.thread, kwOverlap);

      const connection: ConnectionOpportunity = {
        id: randomUUID(),
        global_thread_id: global.thread.id,
        local_thread_ids: [local.thread.id],
        bridge_type: inferBridgeType(connectionType),
        title: `${global.thread.title} → ${local.thread.title}`,
        summary: generateConnectionDescription(
          global.thread,
          local.thread,
          connectionType,
          strength,
        ),
        score: strength,
        confidence: round2((global.thread.confidence + local.thread.confidence) / 2),
        rationale: [
          `Keyword overlap: ${round2(kwOverlap * 100)}%`,
          `Cosine similarity: ${round2(cosineSimilarity(global.vector, local.vector) * 100)}%`,
          `Connection type: ${connectionType}`,
        ],
        user_expertise_tags: [...new Set([...global.thread.domain_tags, ...local.thread.domain_tags])],
        community_refs: local.thread.domain_tags.filter((tag) =>
          tag === "community" || tag === "open source" || tag === "contributor",
        ),
        public_benefit: scorePublicBenefit(local.thread, strength),
        fear_factor: scoreFear(global.thread),
        realism: scoreRealism(global.thread, local.thread, strength),
        polarization_risk: scorePolarizationRisk(global.thread, local.thread),
        compression_loss: scoreCompressionLoss(global.thread, local.thread),
        suggested_actions: deriveActionableSteps(global.thread, local.thread, connectionType).slice(0, 3),
        coordination_path: `Coordinate ${local.thread.kind === "local_opportunity" ? "community response" : "information sharing"} through federated assessment exchange`,
        created_at: now,
        updated_at: now,
      };

      connections.push(connection);

      // Generate ActionCard for strong connections
      if (strength > ACTION_CARD_THRESHOLD) {
        const actionCard = generateActionCard(
          connection,
          global.thread,
          local.thread,
          connectionType,
        );
        actionCards.push(actionCard);
      }
    }
  }

  return { connections, actionCards };
}

// Re-export helpers for testing (prefixed with _conn to avoid conflict with cluster.ts)
export {
  tokenize as _connTokenize,
  buildTermVector as _connBuildTermVector,
  cosineSimilarity as _connCosineSimilarity,
  keywordOverlap as _connKeywordOverlap,
  calculateStrength as _connCalculateStrength,
  inferConnectionType as _connInferConnectionType,
  deriveActionableSteps as _connDeriveActionableSteps,
  generateActionCard as _connGenerateActionCard,
  ACTION_CARD_THRESHOLD,
  MIN_CONNECTION_STRENGTH,
};
