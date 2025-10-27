/**
 * Cross-Domain Search Scoring Algorithms
 *
 * Handles scoring, weighting, and analytics for search results
 */

import type { SearchResult, ContentSource, ContentType } from '@promethean-os/persistence';
import type { CrossDomainSearchOptions, EnhancedSearchResult } from './types/search.js';

/**
 * Calculate recency score based on age
 */
export function calculateRecencyScore(age: number, decayHours?: number): number {
  const decayMs = (decayHours || 24) * 60 * 60 * 1000;
  return Math.exp(-age / decayMs);
}

/**
 * Calculate detailed score breakdown
 */
export function calculateScoreBreakdown(
  result: SearchResult,
  age: number,
  options: CrossDomainSearchOptions,
): {
  semantic: number;
  keyword: number;
  temporal: number;
  source: number;
  type: number;
  final: number;
} {
  const baseScore = result.score;
  const recencyScore = calculateRecencyScore(age, options.recencyDecay);

  const sourceWeight = options.sourceWeights?.[result.content.source] || 1.0;
  const typeWeight = options.typeWeights?.[result.content.type] || 1.0;

  return {
    semantic: baseScore * 0.6,
    keyword: baseScore * 0.3,
    temporal: recencyScore * 0.1,
    source: sourceWeight,
    type: typeWeight,
    final:
      baseScore * sourceWeight * typeWeight * (options.timeBoost ? 1 + recencyScore * 0.2 : 1.0),
  };
}

/**
 * Generate human-readable score explanation
 */
export function generateScoreExplanation(breakdown: {
  semantic: number;
  keyword: number;
  temporal: number;
  source: number;
  type: number;
  final: number;
}): string {
  return `Score: ${breakdown.final.toFixed(3)} (semantic: ${breakdown.semantic.toFixed(3)}, keyword: ${breakdown.keyword.toFixed(3)}, temporal: ${breakdown.temporal.toFixed(3)}, source: ${breakdown.source.toFixed(2)}, type: ${breakdown.type.toFixed(2)})`;
}

/**
 * Apply source and type weights to results
 */
export function applyWeights(
  results: EnhancedSearchResult[],
  options: CrossDomainSearchOptions,
): EnhancedSearchResult[] {
  return results.map((result) => {
    const sourceWeight = options.sourceWeights?.[result.sourceType] || 1.0;
    const typeWeight = options.typeWeights?.[result.contentType] || 1.0;

    return {
      ...result,
      score: result.score * sourceWeight * typeWeight,
    };
  });
}

/**
 * Apply temporal boost to recent content
 */
export function applyTemporalBoost(results: EnhancedSearchResult[]): EnhancedSearchResult[] {
  return results.map((result) => ({
    ...result,
    score: result.score * (1 + result.recencyScore * 0.2),
  }));
}

/**
 * Calculate score distribution statistics
 */
export function calculateScoreDistribution(scores: number[]): Record<string, number> {
  const sorted = [...scores].sort((a, b) => a - b);
  return {
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
    median: sorted[Math.floor(sorted.length / 2)] || 0,
    mean: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
  };
}

/**
 * Generate search analytics
 */
export function generateAnalytics(
  results: EnhancedSearchResult[],
  _options: CrossDomainSearchOptions,
) {
  const sourcesSet = new Set(results.map((r) => r.sourceType));
  const typesSet = new Set(results.map((r) => r.contentType));
  const sources = Array.from(sourcesSet);
  const types = Array.from(typesSet);
  const scores = results.map((r) => r.score);
  const timestamps = results.map((r) => r.content.timestamp);

  return {
    sourcesSearched: sources,
    typesFound: types,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    scoreDistribution: calculateScoreDistribution(scores),
    temporalRange: {
      oldest: Math.min(...timestamps),
      newest: Math.max(...timestamps),
      span: Math.max(...timestamps) - Math.min(...timestamps),
    },
  };
}

/**
 * Default search options
 */
export const DEFAULT_SEARCH_OPTIONS: Partial<CrossDomainSearchOptions> = {
  semantic: true,
  hybridSearch: true,
  keywordWeight: 0.3,
  timeBoost: true,
  recencyDecay: 24,
  deduplicate: true,
  includeAnalytics: false,
  explainScores: false,
  sourceWeights: {
    filesystem: 1.2,
    discord: 1.0,
    opencode: 1.1,
    kanban: 1.0,
    agent: 1.0,
    user: 1.0,
    system: 1.0,
    external: 0.8,
  },
  typeWeights: {
    file: 1.2,
    document: 1.1,
    message: 1.0,
    task: 1.3,
    event: 0.9,
    session: 1.0,
    attachment: 0.8,
    thought: 1.1,
    board: 1.0,
  },
};
