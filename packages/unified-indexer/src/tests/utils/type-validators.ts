/**
 * Type Validation Utilities
 *
 * Runtime type checking and validation functions for unified indexer types
 */

import type {
  UnifiedIndexerServiceConfig,
  ServiceStatus,
  UnifiedIndexerStats,
} from '../../types/service.js';
import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from '../../types/search.js';
import type {
  ContentType,
  ContentSource,
  SearchQuery,
  SearchResult,
  ContextMessage,
} from '@promethean-os/persistence';

/**
 * Result type for validation functions
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate UnifiedIndexerServiceConfig
 */
export function validateUnifiedIndexerServiceConfig(config: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Configuration must be an object');
    return { valid: false, errors, warnings };
  }

  const cfg = config as Record<string, unknown>;

  // Check required top-level properties
  if (!cfg.indexing) {
    errors.push('Missing required property: indexing');
  }
  if (!cfg.contextStore) {
    errors.push('Missing required property: contextStore');
  }
  if (!cfg.sources) {
    errors.push('Missing required property: sources');
  }
  if (!cfg.sync) {
    errors.push('Missing required property: sync');
  }

  // Validate indexing configuration
  if (cfg.indexing && typeof cfg.indexing === 'object') {
    const indexing = cfg.indexing as Record<string, unknown>;
    if (!indexing.vectorStore) {
      errors.push('Missing required property: indexing.vectorStore');
    }
    if (!indexing.metadataStore) {
      errors.push('Missing required property: indexing.metadataStore');
    }
    if (!indexing.embedding) {
      errors.push('Missing required property: indexing.embedding');
    }
  }

  // Validate context store configuration
  if (cfg.contextStore && typeof cfg.contextStore === 'object') {
    const contextStore = cfg.contextStore as Record<string, unknown>;
    if (!contextStore.collections) {
      errors.push('Missing required property: contextStore.collections');
    } else if (typeof contextStore.collections === 'object') {
      const collections = contextStore.collections as Record<string, unknown>;
      const requiredCollections = ['files', 'discord', 'opencode', 'kanban', 'unified'];
      for (const collection of requiredCollections) {
        if (!collections[collection]) {
          errors.push(`Missing required collection: contextStore.collections.${collection}`);
        }
      }
    }
  }

  // Validate sources configuration
  if (cfg.sources && typeof cfg.sources === 'object') {
    const sources = cfg.sources as Record<string, unknown>;
    const requiredSources = ['files', 'discord', 'opencode', 'kanban'];
    for (const source of requiredSources) {
      if (!sources[source]) {
        errors.push(`Missing required source: sources.${source}`);
      } else if (typeof sources[source] === 'object') {
        const sourceConfig = sources[source] as Record<string, unknown>;
        if (typeof sourceConfig.enabled !== 'boolean') {
          errors.push(`Source ${source} must have boolean 'enabled' property`);
        }
      }
    }
  }

  // Validate sync configuration
  if (cfg.sync && typeof cfg.sync === 'object') {
    const sync = cfg.sync as Record<string, unknown>;
    if (typeof sync.interval !== 'number' || sync.interval <= 0) {
      errors.push('sync.interval must be a positive number');
    }
    if (typeof sync.batchSize !== 'number' || sync.batchSize <= 0) {
      errors.push('sync.batchSize must be a positive number');
    }
    if (typeof sync.retryAttempts !== 'number' || sync.retryAttempts < 0) {
      errors.push('sync.retryAttempts must be a non-negative number');
    }
    if (typeof sync.retryDelay !== 'number' || sync.retryDelay < 0) {
      errors.push('sync.retryDelay must be a non-negative number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate ServiceStatus
 */
export function validateServiceStatus(status: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!status || typeof status !== 'object') {
    errors.push('ServiceStatus must be an object');
    return { valid: false, errors, warnings };
  }

  const s = status as Record<string, unknown>;

  if (typeof s.healthy !== 'boolean') {
    errors.push('ServiceStatus.healthy must be a boolean');
  }

  if (typeof s.indexing !== 'boolean') {
    errors.push('ServiceStatus.indexing must be a boolean');
  }

  if (typeof s.lastSync !== 'number' || s.lastSync < 0) {
    errors.push('ServiceStatus.lastSync must be a non-negative number');
  }

  if (typeof s.nextSync !== 'number' || s.nextSync < 0) {
    errors.push('ServiceStatus.nextSync must be a non-negative number');
  }

  if (!Array.isArray(s.activeSources)) {
    errors.push('ServiceStatus.activeSources must be an array');
  }

  if (!Array.isArray(s.issues)) {
    errors.push('ServiceStatus.issues must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate UnifiedIndexerStats
 */
export function validateUnifiedIndexerStats(stats: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!stats || typeof stats !== 'object') {
    errors.push('UnifiedIndexerStats must be an object');
    return { valid: false, errors, warnings };
  }

  const s = stats as Record<string, unknown>;

  if (!s.total) {
    errors.push('Missing required property: total');
  }

  if (!s.bySource || typeof s.bySource !== 'object') {
    errors.push('Missing or invalid property: bySource');
  }

  if (!s.byType || typeof s.byType !== 'object') {
    errors.push('Missing or invalid property: byType');
  }

  if (typeof s.lastSync !== 'number' || s.lastSync < 0) {
    errors.push('UnifiedIndexerStats.lastSync must be a non-negative number');
  }

  if (typeof s.syncDuration !== 'number' || s.syncDuration < 0) {
    errors.push('UnifiedIndexerStats.syncDuration must be a non-negative number');
  }

  if (!Array.isArray(s.errors)) {
    errors.push('UnifiedIndexerStats.errors must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate CrossDomainSearchOptions
 */
export function validateCrossDomainSearchOptions(options: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!options || typeof options !== 'object') {
    errors.push('CrossDomainSearchOptions must be an object');
    return { valid: false, errors, warnings };
  }

  const opts = options as Record<string, unknown>;

  // Check base SearchQuery properties
  if (typeof opts.query !== 'string' || opts.query.trim() === '') {
    errors.push('CrossDomainSearchOptions.query must be a non-empty string');
  }

  if (opts.limit !== undefined && (typeof opts.limit !== 'number' || opts.limit <= 0)) {
    errors.push('CrossDomainSearchOptions.limit must be a positive number');
  }

  // Validate context options
  if (
    opts.contextLimit !== undefined &&
    (typeof opts.contextLimit !== 'number' || opts.contextLimit <= 0)
  ) {
    errors.push('CrossDomainSearchOptions.contextLimit must be a positive number');
  }

  // Validate weighting options
  if (opts.sourceWeights && typeof opts.sourceWeights === 'object') {
    const validSources: ContentSource[] = [
      'filesystem',
      'discord',
      'opencode',
      'kanban',
      'agent',
      'user',
      'system',
      'external',
    ];
    const sourceWeights = opts.sourceWeights as Record<string, unknown>;
    for (const [source, weight] of Object.entries(sourceWeights)) {
      if (!validSources.includes(source as ContentSource)) {
        warnings.push(`Unknown source in sourceWeights: ${source}`);
      }
      if (typeof weight !== 'number' || weight < 0) {
        errors.push(`sourceWeights.${source} must be a non-negative number`);
      }
    }
  }

  if (opts.typeWeights && typeof opts.typeWeights === 'object') {
    const validTypes: ContentType[] = [
      'file',
      'document',
      'message',
      'task',
      'event',
      'session',
      'attachment',
      'thought',
      'board',
    ];
    const typeWeights = opts.typeWeights as Record<string, unknown>;
    for (const [type, weight] of Object.entries(typeWeights)) {
      if (!validTypes.includes(type as ContentType)) {
        warnings.push(`Unknown type in typeWeights: ${type}`);
      }
      if (typeof weight !== 'number' || weight < 0) {
        errors.push(`typeWeights.${type} must be a non-negative number`);
      }
    }
  }

  // Validate temporal options
  if (
    opts.recencyDecay !== undefined &&
    (typeof opts.recencyDecay !== 'number' || opts.recencyDecay <= 0)
  ) {
    errors.push('CrossDomainSearchOptions.recencyDecay must be a positive number');
  }

  // Validate semantic options
  if (
    opts.semanticThreshold !== undefined &&
    (typeof opts.semanticThreshold !== 'number' ||
      opts.semanticThreshold < 0 ||
      opts.semanticThreshold > 1)
  ) {
    errors.push('CrossDomainSearchOptions.semanticThreshold must be between 0 and 1');
  }

  if (
    opts.keywordWeight !== undefined &&
    (typeof opts.keywordWeight !== 'number' || opts.keywordWeight < 0 || opts.keywordWeight > 1)
  ) {
    errors.push('CrossDomainSearchOptions.keywordWeight must be between 0 and 1');
  }

  // Validate result processing options
  if (
    opts.maxResultsPerSource !== undefined &&
    (typeof opts.maxResultsPerSource !== 'number' || opts.maxResultsPerSource <= 0)
  ) {
    errors.push('CrossDomainSearchOptions.maxResultsPerSource must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate EnhancedSearchResult
 */
export function validateEnhancedSearchResult(result: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result || typeof result !== 'object') {
    errors.push('EnhancedSearchResult must be an object');
    return { valid: false, errors, warnings };
  }

  const r = result as Record<string, unknown>;

  // Check base SearchResult properties
  if (!r.content) {
    errors.push('Missing required property: content');
  }

  if (typeof r.score !== 'number') {
    errors.push('EnhancedSearchResult.score must be a number');
  }

  // Check enhanced properties
  if (!r.sourceType) {
    errors.push('Missing required property: sourceType');
  }

  if (!r.contentType) {
    errors.push('Missing required property: contentType');
  }

  if (typeof r.age !== 'number' || r.age < 0) {
    errors.push('EnhancedSearchResult.age must be a non-negative number');
  }

  if (typeof r.recencyScore !== 'number' || r.recencyScore < 0 || r.recencyScore > 1) {
    errors.push('EnhancedSearchResult.recencyScore must be between 0 and 1');
  }

  // Validate optional properties
  if (r.context && !Array.isArray(r.context)) {
    errors.push('EnhancedSearchResult.context must be an array');
  }

  if (
    r.contextRelevance !== undefined &&
    (typeof r.contextRelevance !== 'number' || r.contextRelevance < 0 || r.contextRelevance > 1)
  ) {
    errors.push('EnhancedSearchResult.contextRelevance must be between 0 and 1');
  }

  if (r.scoreBreakdown && typeof r.scoreBreakdown === 'object') {
    const breakdown = r.scoreBreakdown as Record<string, unknown>;
    const requiredFields = ['semantic', 'keyword', 'temporal', 'source', 'type', 'final'];
    for (const field of requiredFields) {
      if (typeof breakdown[field] !== 'number') {
        errors.push(`scoreBreakdown.${field} must be a number`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate CrossDomainSearchResponse
 */
export function validateCrossDomainSearchResponse(response: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('CrossDomainSearchResponse must be an object');
    return { valid: false, errors, warnings };
  }

  const resp = response as Record<string, unknown>;

  if (!Array.isArray(resp.results)) {
    errors.push('CrossDomainSearchResponse.results must be an array');
  }

  if (typeof resp.total !== 'number' || resp.total < 0) {
    errors.push('CrossDomainSearchResponse.total must be a non-negative number');
  }

  if (typeof resp.took !== 'number' || resp.took < 0) {
    errors.push('CrossDomainSearchResponse.took must be a non-negative number');
  }

  if (!resp.query) {
    errors.push('Missing required property: query');
  }

  // Validate analytics if present
  if (resp.analytics && typeof resp.analytics === 'object') {
    const analytics = resp.analytics as Record<string, unknown>;

    if (!Array.isArray(analytics.sourcesSearched)) {
      errors.push('analytics.sourcesSearched must be an array');
    }

    if (!Array.isArray(analytics.typesFound)) {
      errors.push('analytics.typesFound must be an array');
    }

    if (typeof analytics.averageScore !== 'number') {
      errors.push('analytics.averageScore must be a number');
    }

    if (analytics.temporalRange && typeof analytics.temporalRange === 'object') {
      const temporalRange = analytics.temporalRange as Record<string, unknown>;
      if (
        typeof temporalRange.oldest !== 'number' ||
        typeof temporalRange.newest !== 'number' ||
        typeof temporalRange.span !== 'number'
      ) {
        errors.push('analytics.temporalRange properties must be numbers');
      }
    }
  }

  // Validate context if present
  if (resp.context && !Array.isArray(resp.context)) {
    errors.push('CrossDomainSearchResponse.context must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Type guard functions
 */
export function isUnifiedIndexerServiceConfig(obj: unknown): obj is UnifiedIndexerServiceConfig {
  return validateUnifiedIndexerServiceConfig(obj).valid;
}

export function isServiceStatus(obj: unknown): obj is ServiceStatus {
  return validateServiceStatus(obj).valid;
}

export function isUnifiedIndexerStats(obj: unknown): obj is UnifiedIndexerStats {
  return validateUnifiedIndexerStats(obj).valid;
}

export function isCrossDomainSearchOptions(obj: unknown): obj is CrossDomainSearchOptions {
  return validateCrossDomainSearchOptions(obj).valid;
}

export function isEnhancedSearchResult(obj: unknown): obj is EnhancedSearchResult {
  return validateEnhancedSearchResult(obj).valid;
}

export function isCrossDomainSearchResponse(obj: unknown): obj is CrossDomainSearchResponse {
  return validateCrossDomainSearchResponse(obj).valid;
}
