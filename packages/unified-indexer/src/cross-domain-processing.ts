/**
 * Cross-Domain Search Result Processing
 *
 * Handles result processing, filtering, grouping, and deduplication
 */

import type { ContentSource, SearchResult } from '@promethean-os/persistence';
import type { CrossDomainSearchOptions, EnhancedSearchResult } from './types/search.js';
import {
  calculateRecencyScore,
  calculateScoreBreakdown,
  generateScoreExplanation,
  applyWeights,
  applyTemporalBoost,
} from './cross-domain-scoring.js';

/**
 * Enhance search results with additional metadata
 */
export function enhanceResults(
  results: SearchResult[],
  options: CrossDomainSearchOptions,
): EnhancedSearchResult[] {
  const now = Date.now();

  return results.map((result) => {
    const content = result.content;
    const age = now - content.timestamp;
    const recencyScore = calculateRecencyScore(age, options.recencyDecay);

    const enhanced: EnhancedSearchResult = {
      ...result,
      sourceType: content.source,
      contentType: content.type,
      age,
      recencyScore,
    };

    if (options.explainScores) {
      const breakdown = calculateScoreBreakdown(result, age, options);
      enhanced.scoreBreakdown = breakdown;
      enhanced.explanation = generateScoreExplanation(breakdown);
    }

    return enhanced;
  });
}

/**
 * Process results with filtering, grouping, and deduplication
 */
export function processResults(
  results: EnhancedSearchResult[],
  options: CrossDomainSearchOptions,
): EnhancedSearchResult[] {
  const processedResults = [...results];

  const withWeights =
    options.sourceWeights || options.typeWeights
      ? applyWeights(processedResults, options)
      : processedResults;

  const withTemporalBoost = options.timeBoost ? applyTemporalBoost(withWeights) : withWeights;

  const withDeduplication =
    options.deduplicate !== false ? deduplicateResults(withTemporalBoost) : withTemporalBoost;

  const withGrouping = options.groupBySource
    ? groupResultsBySource(withDeduplication, options.maxResultsPerSource)
    : withDeduplication;

  return [...withGrouping].sort((a, b) => b.score - a.score);
}

/**
 * Remove duplicate results based on content similarity
 */
export function deduplicateResults(results: EnhancedSearchResult[]): EnhancedSearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.content.type}:${result.content.source}:${result.content.content.substring(0, 100)}`;
    return !seen.has(key) && seen.add(key), true;
  });
}

/**
 * Group results by source with optional per-source limits
 */
export function groupResultsBySource(
  results: EnhancedSearchResult[],
  maxPerSource?: number,
): EnhancedSearchResult[] {
  const grouped = new Map<ContentSource, EnhancedSearchResult[]>();

  results.forEach((result) => {
    const source = result.sourceType;
    if (!grouped.has(source)) {
      grouped.set(source, []);
    }
    grouped.get(source)!.push(result);
  });

  const finalResults: EnhancedSearchResult[] = [];
  grouped.forEach((sourceResults) => {
    const limitedResults = maxPerSource ? sourceResults.slice(0, maxPerSource) : sourceResults;
    finalResults.push(...limitedResults);
  });

  return finalResults;
}

/**
 * Expand query with related terms and synonyms
 */
export async function expandQuery(
  query: string,
): Promise<{ original: string; expanded: string[] }> {
  const terms = query.toLowerCase().split(/\s+/);
  const expanded = new Set<string>([query]);

  terms.forEach((term: string) => {
    if (term.includes('index')) {
      expanded.add(term.replace('index', 'search'));
      expanded.add(term.replace('index', 'query'));
    }
    if (term.includes('context')) {
      expanded.add(term.replace('context', 'background'));
      expanded.add(term.replace('context', 'information'));
    }
  });

  return {
    original: query,
    expanded: Array.from(expanded),
  };
}
