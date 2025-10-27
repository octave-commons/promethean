/**
 * Cross-Domain Search Result Processing
 *
 * Handles result processing, filtering, grouping, and deduplication
 */

import type { ContentSource } from '@promethean-os/persistence';
import type { CrossDomainSearchOptions, EnhancedSearchResult } from './types/search.js';
import { calculateRecencyScore } from './cross-domain-scoring.js';

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
      const {
        calculateScoreBreakdown,
        generateScoreExplanation,
      } = require('./cross-domain-scoring.js');
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
  let processedResults = [...results];

  if (options.sourceWeights || options.typeWeights) {
    const { applyWeights } = require('./cross-domain-scoring.js');
    processedResults = applyWeights(processedResults, options);
  }

  if (options.timeBoost) {
    const { applyTemporalBoost } = require('./cross-domain-scoring.js');
    processedResults = applyTemporalBoost(processedResults);
  }

  if (options.deduplicate !== false) {
    processedResults = deduplicateResults(processedResults);
  }

  if (options.groupBySource) {
    processedResults = groupResultsBySource(processedResults, options.maxResultsPerSource);
  }

  processedResults.sort((a, b) => b.score - a.score);

  return processedResults;
}

/**
 * Remove duplicate results based on content similarity
 */
export function deduplicateResults(results: EnhancedSearchResult[]): EnhancedSearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.content.type}:${result.content.source}:${result.content.content.substring(0, 100)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
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
