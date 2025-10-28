import type { ScarContext, EventLogEntry, ScarRecord, SearchResult, LLMOperation, GitCommit, HealingStatus, HealingResult } from './scar-context-types.js';
/**
 * Type guard functions for runtime validation of scar context types
 */
/**
 * Validates if a value is a valid EventLogEntry
 */
export declare function isEventLogEntry(value: any): value is EventLogEntry;
/**
 * Validates if a value is a valid ScarRecord
 */
export declare function isScarRecord(value: any): value is ScarRecord;
/**
 * Validates if a value is a valid SearchResult
 */
export declare function isSearchResult(value: any): value is SearchResult;
/**
 * Validates if a value is a valid LLMOperation
 */
export declare function isLLMOperation(value: any): value is LLMOperation;
/**
 * Validates if a value is a valid GitCommit
 */
export declare function isGitCommit(value: any): value is GitCommit;
/**
 * Validates if a value is a valid HealingStatus
 */
export declare function isHealingStatus(value: any): value is HealingStatus;
/**
 * Validates if a value is a valid HealingResult
 */
export declare function isHealingResult(value: any): value is HealingResult;
/**
 * Validates if a value is a valid ScarContext
 */
export declare function isScarContext(value: any): value is ScarContext;
/**
 * Validates scar context integrity and returns detailed validation results
 */
export declare function validateScarContextIntegrity(context: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Creates a safe EventLogEntry with validation
 */
export declare function createEventLogEntry(operation: string, details: Record<string, any>, severity?: 'info' | 'warning' | 'error'): EventLogEntry;
/**
 * Creates a safe ScarRecord with validation
 */
export declare function createScarRecord(start: string, end: string, tag: string, story: string): ScarRecord;
//# sourceMappingURL=type-guards.d.ts.map