import type {
  ScarContext,
  EventLogEntry,
  ScarRecord,
  SearchResult,
  LLMOperation,
  GitCommit,
  HealingStatus,
  HealingResult,
} from './scar-context-types.js';

/**
 * Type guard functions for runtime validation of scar context types
 */

/**
 * Validates if a value is a valid EventLogEntry
 */
export function isEventLogEntry(value: any): value is EventLogEntry {
  return (
    value &&
    typeof value === 'object' &&
    value.timestamp instanceof Date &&
    typeof value.operation === 'string' &&
    typeof value.details === 'object' &&
    typeof value.severity === 'string' &&
    ['info', 'warning', 'error'].includes(value.severity)
  );
}

/**
 * Validates if a value is a valid ScarRecord
 */
export function isScarRecord(value: any): value is ScarRecord {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.start === 'string' &&
    typeof value.end === 'string' &&
    typeof value.tag === 'string' &&
    typeof value.story === 'string' &&
    value.timestamp instanceof Date
  );
}

/**
 * Validates if a value is a valid SearchResult
 */
export function isSearchResult(value: any): value is SearchResult {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.taskId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.relevance === 'number' &&
    value.relevance >= 0 &&
    value.relevance <= 1 &&
    typeof value.snippet === 'string'
  );
}

/**
 * Validates if a value is a valid LLMOperation
 */
export function isLLMOperation(value: any): value is LLMOperation {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.operation === 'string' &&
    value.timestamp instanceof Date &&
    (value.tokensUsed === undefined || typeof value.tokensUsed === 'number')
  );
}

/**
 * Validates if a value is a valid GitCommit
 */
export function isGitCommit(value: any): value is GitCommit {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.sha === 'string' &&
    typeof value.message === 'string' &&
    typeof value.author === 'string' &&
    value.timestamp instanceof Date &&
    Array.isArray(value.files) &&
    value.files.every((file: any) => typeof file === 'string')
  );
}

/**
 * Validates if a value is a valid HealingStatus
 */
export function isHealingStatus(value: any): value is HealingStatus {
  return (
    typeof value === 'string' &&
    ['pending', 'in_progress', 'completed', 'failed', 'rolled_back'].includes(value)
  );
}

/**
 * Validates if a value is a valid HealingResult
 */
export function isHealingResult(value: any): value is HealingResult {
  return (
    value &&
    typeof value === 'object' &&
    isHealingStatus(value.status) &&
    typeof value.summary === 'string' &&
    typeof value.tasksModified === 'number' &&
    typeof value.filesChanged === 'number' &&
    Array.isArray(value.errors) &&
    value.errors.every((error: any) => typeof error === 'string') &&
    (value.completedAt === undefined || value.completedAt instanceof Date)
  );
}

/**
 * Validates if a value is a valid ScarContext
 */
export function isScarContext(value: any): value is ScarContext {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.reason === 'string' &&
    Array.isArray(value.eventLog) &&
    value.eventLog.every(isEventLogEntry) &&
    Array.isArray(value.previousScars) &&
    value.previousScars.every(isScarRecord) &&
    Array.isArray(value.searchResults) &&
    value.searchResults.every(isSearchResult) &&
    typeof value.metadata === 'object' &&
    typeof value.metadata.tag === 'string' &&
    typeof value.metadata.narrative === 'string' &&
    Array.isArray(value.llmOperations) &&
    value.llmOperations.every(isLLMOperation) &&
    Array.isArray(value.gitHistory) &&
    value.gitHistory.every(isGitCommit)
  );
}

/**
 * Validates scar context integrity and returns detailed validation results
 */
export function validateScarContextIntegrity(context: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isScarContext(context)) {
    errors.push('Object is not a valid ScarContext');
    return { isValid: false, errors, warnings };
  }

  // Check for empty required fields
  if (!context.reason.trim()) {
    errors.push('Reason cannot be empty');
  }

  if (!context.metadata.tag.trim()) {
    errors.push('Metadata tag cannot be empty');
  }

  if (!context.metadata.narrative.trim()) {
    warnings.push('Metadata narrative is empty');
  }

  // Check for reasonable array sizes
  if (context.eventLog.length > 1000) {
    warnings.push('Event log is very large (>1000 entries)');
  }

  if (context.previousScars.length > 100) {
    warnings.push('Previous scars count is high (>100)');
  }

  // Check for valid git SHAs
  const invalidShas = context.previousScars.filter(
    (scar: ScarRecord) => !/^[a-f0-9]{40}$/i.test(scar.start) || !/^[a-f0-9]{40}$/i.test(scar.end),
  ).length;

  if (invalidShas > 0) {
    errors.push(`${invalidShas} scar records have invalid git SHAs`);
  }

  // Check for valid task IDs in search results
  const invalidTaskIds = context.searchResults.filter(
    (result: SearchResult) => !/^[a-f0-9-]{36}$/.test(result.taskId),
  ).length;

  if (invalidTaskIds > 0) {
    warnings.push(`${invalidTaskIds} search results have invalid task IDs`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Creates a safe EventLogEntry with validation
 */
export function createEventLogEntry(
  operation: string,
  details: Record<string, any>,
  severity: 'info' | 'warning' | 'error' = 'info',
): EventLogEntry {
  return {
    timestamp: new Date(),
    operation: String(operation),
    details: { ...details },
    severity,
  };
}

/**
 * Creates a safe ScarRecord with validation
 */
export function createScarRecord(
  start: string,
  end: string,
  tag: string,
  story: string,
): ScarRecord {
  return {
    start: String(start),
    end: String(end),
    tag: String(tag),
    story: String(story),
    timestamp: new Date(),
  };
}
