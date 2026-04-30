// ---------------------------------------------------------------------------
// usePersonalization — manages dashboard personalization state.
// Stores dimension weights (0–100), toggle switches, and persists
// everything to localStorage so preferences survive page reloads.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Available weight dimensions. Add new dimensions here. */
export const DIMENSIONS = [
  "geopolitical",
  "infrastructure",
  "economic",
  "security",
  "climate",
  "technology",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export type DimensionWeights = Record<Dimension, number>;

export interface PersonalizationToggles {
  /** Highlight actionable vs informational signals */
  readonly agencyBias: boolean;
  /** Show more disagreement detail */
  readonly criticalThinking: boolean;
  /** Enable/disable Π lane federation */
  readonly federation: boolean;
}

export interface PersonalizationState {
  readonly weights: DimensionWeights;
  readonly toggles: PersonalizationToggles;
}

export interface UsePersonalizationReturn {
  readonly weights: DimensionWeights;
  readonly toggles: PersonalizationToggles;
  readonly setWeight: (dimension: Dimension, value: number) => void;
  readonly setToggle: (key: keyof PersonalizationToggles, value: boolean) => void;
  /** Reset all preferences to defaults */
  readonly resetToDefaults: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_WEIGHT = 50;

export function defaultWeights(): DimensionWeights {
  const w: Partial<DimensionWeights> = {};
  for (const d of DIMENSIONS) {
    w[d] = DEFAULT_WEIGHT;
  }
  return w as DimensionWeights;
}

export function defaultToggles(): PersonalizationToggles {
  return {
    agencyBias: false,
    criticalThinking: false,
    federation: true,
  };
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "threat-radar-personalization";

function loadFromStorage(): PersonalizationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;

    // Validate weights
    const weights = { ...defaultWeights() };
    if (typeof obj.weights === "object" && obj.weights !== null) {
      const w = obj.weights as Record<string, unknown>;
      for (const d of DIMENSIONS) {
        if (typeof w[d] === "number" && w[d] >= 0 && w[d] <= 100) {
          weights[d] = w[d] as number;
        }
      }
    }

    // Validate toggles
    const toggles = { ...defaultToggles() };
    if (typeof obj.toggles === "object" && obj.toggles !== null) {
      const t = obj.toggles as Record<string, unknown>;
      if (typeof t.agencyBias === "boolean") toggles.agencyBias = t.agencyBias;
      if (typeof t.criticalThinking === "boolean") toggles.criticalThinking = t.criticalThinking;
      if (typeof t.federation === "boolean") toggles.federation = t.federation;
    }

    return { weights, toggles };
  } catch {
    return null;
  }
}

function saveToStorage(state: PersonalizationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePersonalization(): UsePersonalizationReturn {
  const [weights, setWeights] = useState<DimensionWeights>(() => {
    const stored = loadFromStorage();
    return stored?.weights ?? defaultWeights();
  });

  const [toggles, setToggles] = useState<PersonalizationToggles>(() => {
    const stored = loadFromStorage();
    return stored?.toggles ?? defaultToggles();
  });

  // Persist whenever state changes
  useEffect(() => {
    saveToStorage({ weights, toggles });
  }, [weights, toggles]);

  const setWeight = useCallback((dimension: Dimension, value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setWeights((prev) => ({ ...prev, [dimension]: clamped }));
  }, []);

  const setToggle = useCallback((key: keyof PersonalizationToggles, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setWeights(defaultWeights());
    setToggles(defaultToggles());
  }, []);

  return { weights, toggles, setWeight, setToggle, resetToDefaults };
}

// ---------------------------------------------------------------------------
// Dimension name normalization — maps variant dimension names from radar
// data (e.g. subreddit names, alternative spellings) to canonical
// personalization dimension names.
// ---------------------------------------------------------------------------

/** Mapping of variant dimension names to canonical Dimension values */
const DIMENSION_ALIASES: Readonly<Record<string, Dimension>> = {
  // Geopolitical variants
  geopolitics: "geopolitical",
  geopolitic: "geopolitical",
  "geo-political": "geopolitical",
  political: "geopolitical",
  diplomacy: "geopolitical",
  // Infrastructure variants
  infra: "infrastructure",
  energy: "infrastructure",
  "supply chain": "infrastructure",
  logistics: "infrastructure",
  // Economic variants
  economy: "economic",
  economics: "economic",
  financial: "economic",
  finance: "economic",
  market: "economic",
  // Security variants
  cybersecurity: "security",
  "cyber-security": "security",
  "cyber security": "security",
  infosec: "security",
  // Climate variants
  environmental: "climate",
  environment: "climate",
  weather: "climate",
  // Technology variants
  tech: "technology",
  ai: "technology",
  "artificial intelligence": "technology",
  "machine learning": "technology",
  computing: "technology",
};

/**
 * Normalize a dimension name to its canonical Dimension value.
 * Returns the matching Dimension if found (exact match or alias),
 * otherwise returns undefined.
 */
export function normalizeDimension(name: string): Dimension | undefined {
  const lower = name.toLowerCase();
  // Exact match
  if (DIMENSIONS.includes(lower as Dimension)) {
    return lower as Dimension;
  }
  // Alias match
  return DIMENSION_ALIASES[lower];
}

// ---------------------------------------------------------------------------
// Utility: apply weights to score ranges
// ---------------------------------------------------------------------------

/** Apply dimension weights to produce weighted scores.
 *  Returns a mapping from dimension → weighted value (0–100 scale).
 *  Weights of 50 = neutral (no change), <50 = reduce, >50 = amplify.
 */
export function applyWeights(
  scoreRanges: readonly { dimension: string; median: number; min: number; max: number }[],
  weights: DimensionWeights,
): { dimension: string; weighted: number; original: number }[] {
  return scoreRanges.map((sr) => {
    const dim = normalizeDimension(sr.dimension);
    const weight = dim !== undefined ? weights[dim] : DEFAULT_WEIGHT;
    // Scale factor: 0 at weight=0, 1 at weight=50, 2 at weight=100
    const factor = weight / 50;
    const original = sr.median * 100;
    const weighted = Math.max(0, Math.min(100, original * factor));
    return { dimension: sr.dimension, weighted, original };
  });
}

/** Compute a single composite score from weighted dimensions */
export function computeCompositeScore(
  scoreRanges: readonly { dimension: string; median: number; min: number; max: number }[],
  weights: DimensionWeights,
): number {
  if (scoreRanges.length === 0) return 0;
  const applied = applyWeights(scoreRanges, weights);
  const totalWeight = applied.reduce((sum, a) => {
    const dim = normalizeDimension(a.dimension);
    return sum + (dim !== undefined ? weights[dim] : DEFAULT_WEIGHT);
  }, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = applied.reduce((sum, a) => {
    const dim = normalizeDimension(a.dimension);
    return sum + a.weighted * (dim !== undefined ? weights[dim] : DEFAULT_WEIGHT);
  }, 0);
  return weightedSum / totalWeight;
}
