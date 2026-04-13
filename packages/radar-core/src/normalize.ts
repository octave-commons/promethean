import { randomUUID } from "node:crypto";
import type { SignalEvent, SignalCategory } from "./schema.js";

// ---------------------------------------------------------------------------
// Category keyword dictionary
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: ReadonlyArray<{ category: SignalCategory; keywords: readonly string[] }> = [
  {
    category: "geopolitical",
    keywords: [
      "war", "conflict", "sanctions", "military", "nuclear", "diplomacy",
      "treaty", "invasion", "geopolitical", "nato", "missile", "ceasefire",
      "territory", "sovereignty", "coup", "regime", "embargo", "annexation",
    ],
  },
  {
    category: "infrastructure",
    keywords: [
      "energy", "grid", "power", "pipeline", "supply chain", "infrastructure",
      "electricity", "outage", "blackout", "transport", "logistics", "port",
      "bridge", "rail", "water supply", "telecom", "internet backbone",
    ],
  },
  {
    category: "economic",
    keywords: [
      "market", "inflation", "debt", "trade", "tariff", "gdp", "recession",
      "stock", "bond", "currency", "interest rate", "central bank", "fiscal",
      "subsidy", "deficit", "unemployment", "commodity", "oil price",
    ],
  },
  {
    category: "technology",
    keywords: [
      "ai", "artificial intelligence", "machine learning", "compute", "chip",
      "semiconductor", "gpu", "llm", "neural", "model training", "inference",
      "data center", "cloud computing", "quantum", "robotics", "autonomous",
    ],
  },
  {
    category: "community",
    keywords: [
      "open source", "community", "contributor", "maintainer", "developer",
      "hackathon", "governance", "fork", "license", "collaboration",
      "decentralized", "cooperative", "volunteer", "grassroots", "local action",
    ],
  },
  {
    category: "climate",
    keywords: [
      "climate", "emissions", "carbon", "renewable", "solar", "wind",
      "fossil fuel", "greenhouse", "temperature", "drought", "flood",
      "wildfire", "sea level", "deforestation", "methane", "sustainability",
    ],
  },
  {
    category: "security",
    keywords: [
      "cyber", "hack", "vulnerability", "exploit", "malware", "ransomware",
      "breach", "phishing", "zero-day", "encryption", "surveillance",
      "espionage", "threat actor", "botnet", "ddos", "authentication",
    ],
  },
];

// ---------------------------------------------------------------------------
// Text cleaning
// ---------------------------------------------------------------------------

/**
 * Strip HTML tags, collapse whitespace, trim, and normalize unicode
 * to produce clean plaintext from raw collector content.
 */
function cleanText(raw: string): string {
  let cleaned = raw;

  // Strip HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, " ");

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Remove markdown-style formatting (bold, italic)
  cleaned = cleaned.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1");

  // Collapse whitespace (multiple spaces, tabs, newlines → single space)
  cleaned = cleaned.replace(/\s+/g, " ");

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

// ---------------------------------------------------------------------------
// Category assignment via keyword heuristic
// ---------------------------------------------------------------------------

/**
 * Check if a keyword appears as a whole word (or phrase) in the text.
 * Uses word boundary logic: the character before/after the keyword must be
 * a non-alphanumeric character (or start/end of string).
 */
function keywordMatches(text: string, keyword: string): boolean {
  const idx = text.indexOf(keyword);
  if (idx === -1) return false;

  // Check word boundary before keyword
  if (idx > 0) {
    const charBefore = text[idx - 1];
    if (/[a-z0-9]/.test(charBefore)) return false;
  }

  // Check word boundary after keyword
  const afterIdx = idx + keyword.length;
  if (afterIdx < text.length) {
    const charAfter = text[afterIdx];
    if (/[a-z0-9]/.test(charAfter)) return false;
  }

  return true;
}

/**
 * Assign a category based on keyword frequency in the normalized text.
 * Returns the category with the highest match count, or "general" if no
 * keywords match.
 */
function assignCategory(normalizedContent: string): SignalCategory {
  const lower = normalizedContent.toLowerCase();

  let bestCategory: SignalCategory = "general";
  let bestScore = 0;

  for (const entry of CATEGORY_KEYWORDS) {
    let score = 0;
    for (const keyword of entry.keywords) {
      // Multi-word keywords use substring match (they're specific enough)
      // Single-word keywords use word boundary matching
      if (keyword.includes(" ")) {
        if (lower.includes(keyword)) score += 1;
      } else {
        if (keywordMatches(lower, keyword)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = entry.category;
    }
  }

  return bestCategory;
}

// ---------------------------------------------------------------------------
// Quality score computation
// ---------------------------------------------------------------------------

/**
 * Compute a quality score between 0 and 1 based on:
 *  - Content length (longer content tends to be more informative)
 *  - Presence of links (signals with references are higher quality)
 *  - Presence of structured data/metadata
 *  - Presence of a title
 */
function computeQualityScore(event: SignalEvent, normalizedContent: string): number {
  const components: number[] = [];

  // 1. Content length score (0-1)
  // <20 chars → 0.1, 20-100 → linear 0.2-0.5, 100-500 → linear 0.5-0.9, >500 → 1.0
  const len = normalizedContent.length;
  if (len < 20) {
    components.push(0.1);
  } else if (len < 100) {
    components.push(0.2 + (0.3 * (len - 20)) / 80);
  } else if (len < 500) {
    components.push(0.5 + (0.4 * (len - 100)) / 400);
  } else {
    components.push(1.0);
  }

  // 2. Has links score
  const hasLinks = event.links.length > 0;
  components.push(hasLinks ? 1.0 : 0.3);

  // 3. Has meaningful metadata score
  const metaKeys = Object.keys(event.metadata);
  const hasMeaningfulMeta = metaKeys.length > 0 && metaKeys.some((k) =>
    k !== "source_list" // skip trivial metadata keys
  );
  components.push(hasMeaningfulMeta ? 0.8 : 0.3);

  // 4. Has title score
  const hasTitle = typeof event.title === "string" && event.title.trim().length > 0;
  components.push(hasTitle ? 0.9 : 0.4);

  // Weighted average — content length is most important
  const weights = [0.4, 0.25, 0.15, 0.2];
  let weighted = 0;
  let totalWeight = 0;
  for (let i = 0; i < components.length; i++) {
    weighted += components[i] * weights[i];
    totalWeight += weights[i];
  }

  // Round to 2 decimal places
  return Math.round((weighted / totalWeight) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Input shape for the normalize function.
 * Accepts a full SignalEvent or a partial raw collector output.
 * Required fields: text, provenance (with source_type and retrieved_at).
 */
export interface RawCollectorOutput {
  /** Existing ID or omit to auto-generate */
  readonly id?: string;
  readonly radar_id?: string;
  readonly provenance: {
    readonly source_type: "bluesky" | "reddit" | "rss" | "api" | "manual" | "ais";
    readonly author?: string;
    readonly account_uri?: string;
    readonly post_uri?: string;
    readonly parent_uri?: string;
    readonly confidence_class?: "firsthand" | "commentary" | "rumor" | "synthesis" | "unknown";
    readonly retrieved_at: string;
  };
  readonly text: string;
  readonly title?: string;
  readonly links?: readonly string[];
  readonly embedding?: readonly number[];
  readonly domain_tags?: readonly string[];
  readonly observed_at?: string;
  readonly ingested_at?: string;
  readonly content_hash?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Normalize raw collector output into a fully-typed SignalEvent.
 *
 * This function:
 *  1. Assigns an id (uuid) if not present
 *  2. Cleans the raw text into normalizedContent
 *  3. Assigns a category via keyword heuristic
 *  4. Computes a qualityScore based on content characteristics
 *  5. Fills in default values for optional fields
 */
export function normalize(raw: RawCollectorOutput): SignalEvent {
  // Validate that text is non-empty after trimming whitespace
  if (!raw.text || raw.text.trim().length === 0) {
    throw new Error("Cannot normalize signal with empty text input");
  }

  const now = new Date().toISOString();

  const id = raw.id ?? randomUUID();
  const text = raw.text;
  const normalizedContent = cleanText(text);
  const links = raw.links ? [...raw.links] : [];
  const domainTags = raw.domain_tags ? [...raw.domain_tags] : [];
  const metadata = raw.metadata ? { ...raw.metadata } : {};

  // Build the full SignalEvent
  const event: SignalEvent = {
    id,
    radar_id: raw.radar_id,
    provenance: {
      source_type: raw.provenance.source_type,
      author: raw.provenance.author,
      account_uri: raw.provenance.account_uri,
      post_uri: raw.provenance.post_uri,
      parent_uri: raw.provenance.parent_uri,
      confidence_class: raw.provenance.confidence_class ?? "unknown",
      retrieved_at: raw.provenance.retrieved_at,
    },
    text,
    title: raw.title,
    links,
    embedding: raw.embedding ? [...raw.embedding] : undefined,
    domain_tags: domainTags,
    observed_at: raw.observed_at ?? now,
    ingested_at: raw.ingested_at ?? now,
    content_hash: raw.content_hash,
    metadata,
    // Normalization fields
    normalized_content: normalizedContent,
    category: assignCategory(normalizedContent),
    quality_score: 0, // placeholder, computed below
  };

  // Compute quality score after building the event (needs links, metadata, title)
  event.quality_score = computeQualityScore(event, normalizedContent);

  return event;
}

// Re-export helpers for testing
export { cleanText as _cleanText, assignCategory as _assignCategory, computeQualityScore as _computeQualityScore };
