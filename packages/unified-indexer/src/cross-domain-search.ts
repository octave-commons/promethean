/**
 * Cross-Domain Search Utility
 *
 * This utility provides advanced cross-domain search capabilities that leverage
 * the unified indexer service and contextStore compilation to deliver
 * comprehensive search results across all data sources.
 */

import type { SearchResult, ContentSource } from '@promethean-os/persistence';
import type { ContextMessage } from '@promethean-os/persistence/dist/actions/context-store/types.js';
import type { UnifiedIndexerServiceState } from './unified-indexer-service.js';
import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from './types/search.js';

/**
 * Cross-Domain Search Engine
 */
export class CrossDomainSearchEngine {
  private indexerService: UnifiedIndexerService;
  private defaultOptions: Partial<CrossDomainSearchOptions>;

  constructor(
    indexerService: UnifiedIndexerService,
    defaultOptions: Partial<CrossDomainSearchOptions> = {},
  ) {
    this.indexerService = indexerService;
    this.defaultOptions = defaultOptions;
  }

  /**
   * Perform cross-domain search with enhanced capabilities
   */
  async search(query: CrossDomainSearchOptions): Promise<CrossDomainSearchResponse> {
    const startTime = Date.now();
    const options = { ...this.defaultOptions, ...query };

    try {
      console.log(
        `[cross-domain-search] Searching for: "${query.query}" across ${options.source ? (Array.isArray(options.source) ? options.source.join(', ') : options.source) : 'all'} sources`,
      );

      // Step 1: Perform base search using unified indexer
      const baseResponse = await this.indexerService.search({
        query: options.query,
        type: options.type,
        source: options.source,
        dateFrom: options.dateFrom,
        dateTo: options.dateTo,
        metadata: options.metadata,
        tags: options.tags,
        limit: options.limit ? options.limit * 2 : 200, // Get more for processing
        fuzzy: options.fuzzy,
        semantic: options.semantic,
        includeContent: true,
      });

      // Step 2: Enhance results with additional metadata
      let enhancedResults = await this.enhanceResults(baseResponse.results, options);

      // Step 3: Apply advanced filtering and processing
      enhancedResults = this.processResults(enhancedResults, options);

      // Step 4: Compile context if requested
      let context: ContextMessage[] | undefined;
      if (options.includeContext && enhancedResults.length > 0) {
        context = await this.compileContext(enhancedResults, options);
      }

      // Step 5: Generate analytics if requested
      let analytics;
      if (options.includeAnalytics) {
        analytics = this.generateAnalytics(enhancedResults, options);
      }

      // Step 6: Limit final results
      const finalResults = enhancedResults.slice(0, options.limit || 50);

      const response: CrossDomainSearchResponse = {
        results: finalResults,
        total: baseResponse.total,
        took: Date.now() - startTime,
        query: options,
        analytics,
        context,
      };

      console.log(
        `[cross-domain-search] Found ${finalResults.length} enhanced results in ${response.took}ms`,
      );
      return response;
    } catch (error) {
      throw new Error(
        `Cross-domain search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Search with intelligent query expansion
   */
  async intelligentSearch(
    query: string,
    options: Partial<CrossDomainSearchOptions> = {},
  ): Promise<CrossDomainSearchResponse> {
    // Expand query with related terms
    const expandedQuery = await this.expandQuery(query);

    return this.search({
      ...options,
      query: expandedQuery.original,
      semantic: true,
      hybridSearch: true,
      keywordWeight: 0.3,
      includeAnalytics: true,
      ...options,
    });
  }

  /**
   * Get contextual search results for LLM consumption
   */
  async getContextualSearch(
    queries: string[],
    options: Partial<CrossDomainSearchOptions> = {},
  ): Promise<{
    searchResults: CrossDomainSearchResponse;
    context: ContextMessage[];
  }> {
    const searchResponse = await this.search({
      query: queries.join(' '),
      limit: 20,
      semantic: true,
      includeContext: true,
      contextLimit: 10,
      formatForLLM: true,
      includeAnalytics: true,
      ...options,
    });

    return {
      searchResults: searchResponse,
      context: searchResponse.context || [],
    };
  }

  /**
   * Enhance search results with additional metadata
   */
  private async enhanceResults(
    results: SearchResult[],
    options: CrossDomainSearchOptions,
  ): Promise<EnhancedSearchResult[]> {
    const now = Date.now();

    return results.map((result) => {
      const content = result.content;
      const age = now - content.timestamp;
      const recencyScore = this.calculateRecencyScore(age, options.recencyDecay);

      const enhanced: EnhancedSearchResult = {
        ...result,
        sourceType: content.source,
        contentType: content.type,
        age,
        recencyScore,
      };

      // Add score breakdown if explanation is requested
      if (options.explainScores) {
        const breakdown = this.calculateScoreBreakdown(result, age, options);
        enhanced.scoreBreakdown = breakdown;
        enhanced.explanation = this.generateScoreExplanation(breakdown);
      }

      return enhanced;
    });
  }

  /**
   * Process results with filtering, grouping, and deduplication
   */
  private processResults(
    results: EnhancedSearchResult[],
    options: CrossDomainSearchOptions,
  ): EnhancedSearchResult[] {
    let processedResults = [...results];

    // Apply source and type weights
    if (options.sourceWeights || options.typeWeights) {
      processedResults = this.applyWeights(processedResults, options);
    }

    // Apply temporal boost
    if (options.timeBoost) {
      processedResults = this.applyTemporalBoost(processedResults);
    }

    // Deduplicate if requested
    if (options.deduplicate !== false) {
      processedResults = this.deduplicateResults(processedResults);
    }

    // Group by source if requested
    if (options.groupBySource) {
      processedResults = this.groupResultsBySource(processedResults, options.maxResultsPerSource);
    }

    // Sort by final score
    processedResults.sort((a, b) => b.score - a.score);

    return processedResults;
  }

  /**
   * Compile context from search results
   */
  private async compileContext(
    _results: EnhancedSearchResult[],
    options: CrossDomainSearchOptions,
  ): Promise<ContextMessage[]> {
    const contextLimit = options.contextLimit || 10;

    // Use indexer service to get properly formatted context
    const queries = options.query ? [options.query] : [];
    return this.indexerService.getContext(queries, {
      recentLimit: contextLimit,
      queryLimit: 5,
      limit: contextLimit,
      formatAssistantMessages: options.formatForLLM || false,
    });
  }

  /**
   * Generate search analytics
   */
  private generateAnalytics(results: EnhancedSearchResult[], _options: CrossDomainSearchOptions) {
    const sources = [...new Set(results.map((r) => r.sourceType))];
    const types = [...new Set(results.map((r) => r.contentType))];
    const scores = results.map((r) => r.score);
    const timestamps = results.map((r) => r.content.timestamp);

    return {
      sourcesSearched: sources,
      typesFound: types,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      scoreDistribution: this.calculateScoreDistribution(scores),
      temporalRange: {
        oldest: Math.min(...timestamps),
        newest: Math.max(...timestamps),
        span: Math.max(...timestamps) - Math.min(...timestamps),
      },
    };
  }

  /**
   * Calculate recency score based on age
   */
  private calculateRecencyScore(age: number, decayHours?: number): number {
    const decayMs = (decayHours || 24) * 60 * 60 * 1000; // Default 24 hours
    return Math.exp(-age / decayMs);
  }

  /**
   * Calculate detailed score breakdown
   */
  private calculateScoreBreakdown(
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
    const recencyScore = this.calculateRecencyScore(age, options.recencyDecay);

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
  private generateScoreExplanation(breakdown: {
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
  private applyWeights(
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
  private applyTemporalBoost(results: EnhancedSearchResult[]): EnhancedSearchResult[] {
    return results.map((result) => ({
      ...result,
      score: result.score * (1 + result.recencyScore * 0.2),
    }));
  }

  /**
   * Remove duplicate results based on content similarity
   */
  private deduplicateResults(results: EnhancedSearchResult[]): EnhancedSearchResult[] {
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
  private groupResultsBySource(
    results: EnhancedSearchResult[],
    maxPerSource?: number,
  ): EnhancedSearchResult[] {
    const grouped = new Map<ContentSource, EnhancedSearchResult[]>();

    // Group by source
    results.forEach((result) => {
      const source = result.sourceType;
      if (!grouped.has(source)) {
        grouped.set(source, []);
      }
      grouped.get(source)!.push(result);
    });

    // Apply per-source limits and flatten
    const finalResults: EnhancedSearchResult[] = [];
    grouped.forEach((sourceResults) => {
      const limitedResults = maxPerSource ? sourceResults.slice(0, maxPerSource) : sourceResults;
      finalResults.push(...limitedResults);
    });

    return finalResults;
  }

  /**
   * Calculate score distribution statistics
   */
  private calculateScoreDistribution(scores: number[]): Record<string, number> {
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
   * Expand query with related terms and synonyms
   */
  private async expandQuery(query: string): Promise<{ original: string; expanded: string[] }> {
    // This could integrate with a thesaurus or semantic expansion service
    // For now, return simple expansion
    const terms = query.toLowerCase().split(/\s+/);
    const expanded = new Set<string>([query]);

    // Add common variations
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
}

/**
 * Factory function to create cross-domain search engine
 */
export function createCrossDomainSearchEngine(
  indexerService: UnifiedIndexerService,
  defaultOptions?: Partial<CrossDomainSearchOptions>,
): CrossDomainSearchEngine {
  return new CrossDomainSearchEngine(indexerService, defaultOptions);
}

/**
 * Default search options
 */
export const DEFAULT_SEARCH_OPTIONS: Partial<CrossDomainSearchOptions> = {
  semantic: true,
  hybridSearch: true,
  keywordWeight: 0.3,
  timeBoost: true,
  recencyDecay: 24, // 24 hours
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
