import { randomUUID } from "node:crypto";
import type { SignalEvent, Thread, ThreadMembership } from "./schema.js";

// ---------------------------------------------------------------------------
// Stop-words — common English words excluded from term frequency
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
  // Additional common low-signal words
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
 * Tokenize text into words, filtering stop-words and short tokens.
 * Returns lowercase tokens of 3+ characters.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

// ---------------------------------------------------------------------------
// TF-IDF computation
// ---------------------------------------------------------------------------

type TermFrequencyVector = Map<string, number>;

/**
 * Build a term frequency vector from a list of tokens.
 * Each entry is `count / totalTokens` (normalized term frequency).
 */
function buildTfVector(tokens: string[]): TermFrequencyVector {
  const freq: TermFrequencyVector = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  // Normalize by total token count
  const total = tokens.length;
  if (total > 0) {
    for (const [term, count] of freq) {
      freq.set(term, count / total);
    }
  }
  return freq;
}

/**
 * Compute IDF (inverse document frequency) for all terms across a corpus
 * of documents. IDF = log(N / df) where df = number of documents containing term.
 */
function buildIdfMap(documentVectors: ReadonlyArray<TermFrequencyVector>): Map<string, number> {
  const docCount = documentVectors.length;
  if (docCount === 0) return new Map();

  const documentFrequency = new Map<string, number>();

  for (const vec of documentVectors) {
    for (const term of vec.keys()) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const idfMap = new Map<string, number>();
  for (const [term, df] of documentFrequency) {
    // Use log(1 + N/df) to prevent division by zero and dampen extreme values
    idfMap.set(term, Math.log(1 + docCount / df));
  }

  return idfMap;
}

/**
 * Build a TF-IDF vector by multiplying TF by IDF.
 */
function buildTfIdfVector(
  tfVec: TermFrequencyVector,
  idfMap: Map<string, number>,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const [term, tf] of tfVec) {
    const idf = idfMap.get(term) ?? 0;
    result.set(term, tf * idf);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Cosine similarity
// ---------------------------------------------------------------------------

/**
 * Compute cosine similarity between two sparse vectors (as Maps).
 * Returns a value between 0 and 1 (we only deal with non-negative TF-IDF).
 */
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
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
// Thread title generation
// ---------------------------------------------------------------------------

/**
 * Generate a human-readable title from the top-N terms in a merged TF-IDF
 * vector. Capitalizes the first letter of each word.
 */
function generateTitle(
  mergedVector: Map<string, number>,
  maxTerms: number = 4,
): string {
  // Sort terms by TF-IDF score descending
  const sorted = [...mergedVector.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTerms)
    .map(([term]) => term);

  if (sorted.length === 0) return "Uncategorized Thread";

  // Capitalize each word
  const capitalized = sorted.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );

  return capitalized.join(" / ");
}

// ---------------------------------------------------------------------------
// Thread kind inference
// ---------------------------------------------------------------------------

/**
 * Infer the thread kind based on the dominant category of member signals.
 */
function inferThreadKind(
  categories: string[],
): "event" | "narrative" | "local_opportunity" {
  const counts = new Map<string, number>();
  for (const cat of categories) {
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }

  // If most signals are community-related, it's a local opportunity
  const communityCount = counts.get("community") ?? 0;
  if (communityCount > 0 && communityCount >= categories.length / 2) {
    return "local_opportunity";
  }

  // Geopolitical/security signals tend to be events
  const eventCategories = ["geopolitical", "security", "infrastructure"];
  const eventCount = eventCategories.reduce(
    (sum, cat) => sum + (counts.get(cat) ?? 0),
    0,
  );
  if (eventCount >= categories.length / 2) {
    return "event";
  }

  return "narrative";
}

// ---------------------------------------------------------------------------
// Source distribution
// ---------------------------------------------------------------------------

/**
 * Compute the source distribution for a set of signals.
 * Returns a map of source_type → proportion.
 */
function computeSourceDistribution(
  signals: ReadonlyArray<SignalEvent>,
): Record<string, number> {
  const counts = new Map<string, number>();
  for (const signal of signals) {
    const src = signal.provenance.source_type;
    counts.set(src, (counts.get(src) ?? 0) + 1);
  }

  const total = signals.length;
  const distribution: Record<string, number> = {};
  for (const [src, count] of counts) {
    distribution[src] = Math.round((count / total) * 100) / 100;
  }
  return distribution;
}

// ---------------------------------------------------------------------------
// Clustering algorithm (agglomerative single-linkage)
// ---------------------------------------------------------------------------

/** Default similarity threshold for merging signals into threads */
const DEFAULT_SIMILARITY_THRESHOLD = 0.15;

export interface ClusterOptions {
  /** Cosine similarity threshold for grouping (0-1). Default 0.15. */
  readonly similarityThreshold?: number;
}

/**
 * Cluster an array of SignalEvents into Thread objects by topic similarity.
 *
 * Uses TF-IDF vectors and cosine similarity with agglomerative clustering:
 *  1. Build TF-IDF vector for each signal's normalized_content (or text).
 *  2. Compute pairwise cosine similarity.
 *  3. Greedily merge signals whose similarity exceeds the threshold.
 *  4. Produce a Thread for each resulting cluster.
 *
 * @param signals - Array of SignalEvent objects (must have text or normalized_content)
 * @param options - Optional clustering configuration
 * @returns Array of Thread objects
 */
export function cluster(
  signals: ReadonlyArray<SignalEvent>,
  options?: ClusterOptions,
): Thread[] {
  if (signals.length === 0) return [];

  const threshold = options?.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD;

  // --- Step 1: Tokenize and build TF vectors ---
  const tokenSets: string[][] = signals.map((signal) => {
    const content = signal.normalized_content ?? signal.text ?? "";
    return tokenize(content);
  });

  const tfVectors = tokenSets.map(buildTfVector);

  // --- Step 2: Build IDF map from all documents ---
  const idfMap = buildIdfMap(tfVectors);

  // --- Step 3: Build TF-IDF vectors ---
  const tfidfVectors = tfVectors.map((tf) => buildTfIdfVector(tf, idfMap));

  // --- Step 4: Agglomerative clustering via union-find ---
  // Each signal starts in its own cluster
  const parent: number[] = signals.map((_, i) => i);

  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression
      x = parent[x];
    }
    return x;
  }

  function union(a: number, b: number): void {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent[rootB] = rootA;
    }
  }

  // Compute pairwise similarities and merge above threshold
  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      const similarity = cosineSimilarity(tfidfVectors[i], tfidfVectors[j]);
      if (similarity >= threshold) {
        union(i, j);
      }
    }
  }

  // --- Step 5: Group signals by cluster ---
  const clusters = new Map<number, number[]>();
  for (let i = 0; i < signals.length; i++) {
    const root = find(i);
    if (!clusters.has(root)) {
      clusters.set(root, []);
    }
    clusters.get(root)!.push(i);
  }

  // --- Step 6: Build Thread objects ---
  const now = new Date().toISOString();
  const threads: Thread[] = [];

  for (const memberIndices of clusters.values()) {
    const memberSignals = memberIndices.map((i) => signals[i]);

    // Merge TF-IDF vectors for title generation
    const mergedVector = new Map<string, number>();
    for (const idx of memberIndices) {
      for (const [term, score] of tfidfVectors[idx]) {
        mergedVector.set(term, (mergedVector.get(term) ?? 0) + score);
      }
    }

    const title = generateTitle(mergedVector);

    // Collect categories from member signals
    const categories: string[] = memberSignals
      .map((s) => s.category)
      .filter((c): c is NonNullable<typeof c> => c !== undefined);

    // Collect domain tags (deduplicated)
    const domainTagSet = new Set<string>();
    for (const signal of memberSignals) {
      for (const tag of signal.domain_tags) {
        domainTagSet.add(tag);
      }
      // Also include signal category as a domain tag if present
      if (signal.category) {
        domainTagSet.add(signal.category);
      }
    }

    // Compute timestamps from member signals
    const timestamps = memberSignals.map((s) => s.observed_at);
    const sortedTimestamps = [...timestamps].sort();
    const firstSeen = sortedTimestamps[0];
    const lastUpdated = sortedTimestamps[sortedTimestamps.length - 1];

    // Compute average confidence from quality scores
    const qualityScores = memberSignals
      .map((s) => s.quality_score)
      .filter((q): q is number => q !== undefined);
    const avgConfidence = qualityScores.length > 0
      ? Math.round(
          (qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length) * 100,
        ) / 100
      : 0.5;

    // Build members list
    const members: ThreadMembership[] = memberSignals.map((signal) => ({
      signal_event_id: signal.id,
      relevance: 1,
      added_at: now,
    }));

    const thread: Thread = {
      id: randomUUID(),
      kind: inferThreadKind(categories),
      title,
      summary: undefined,
      members,
      source_distribution: computeSourceDistribution(memberSignals),
      confidence: avgConfidence,
      timeline: {
        first_seen: firstSeen,
        last_updated: lastUpdated,
        peak_activity: undefined,
      },
      domain_tags: [...domainTagSet],
      status: "emerging",
    };

    threads.push(thread);
  }

  return threads;
}

// Re-export helpers for testing
export {
  tokenize as _tokenize,
  buildTfVector as _buildTfVector,
  buildIdfMap as _buildIdfMap,
  cosineSimilarity as _cosineSimilarity,
  generateTitle as _generateTitle,
};
