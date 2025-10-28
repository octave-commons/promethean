/**
 * Automated Code Review System for Kanban Transitions
 *
 * This module provides comprehensive code analysis capabilities for validating
 * code quality during kanban board transitions. It integrates multiple analysis
 * tools including ESLint, TypeScript compiler, security scanners, and AI analysis.
 */
import type { CodeReviewConfig, CodeReviewResult, CodeReviewViolation, CodeReviewSuggestion, CodeReviewMetrics, ActionItem, CodeReviewRule, CodeReviewRequest, CodeReviewContext, TransitionCodeReviewConfig, ESLintResult, TypeScriptResult, SecurityResult, AIAnalysisResult, ReviewCacheEntry, KanbanTransitionReviewRequest, KanbanTransitionReviewResult, Task } from './types.js';
import { CodeReviewRulesEngine } from './rules-engine.js';
import { KanbanCodeReviewIntegration } from './integration/kanban-integration.js';
export type { CodeReviewConfig, CodeReviewResult, CodeReviewViolation, CodeReviewSuggestion, CodeReviewMetrics, ActionItem, CodeReviewRule, CodeReviewRequest, CodeReviewContext, TransitionCodeReviewConfig, ESLintResult, TypeScriptResult, SecurityResult, AIAnalysisResult, ReviewCacheEntry, KanbanTransitionReviewRequest, KanbanTransitionReviewResult, Task, };
export { CodeReviewRulesEngine } from './rules-engine.js';
export { ESLintAnalyzer } from './analyzers/eslint-analyzer.js';
export { TypeScriptAnalyzer } from './analyzers/typescript-analyzer.js';
export { SecurityAnalyzer } from './analyzers/security-analyzer.js';
export { AIAnalyzer } from './analyzers/ai-analyzer.js';
export { ReviewCache } from './cache/review-cache.js';
export { KanbanCodeReviewIntegration } from './integration/kanban-integration.js';
export declare const DEFAULT_CODE_REVIEW_CONFIG: CodeReviewConfig;
export declare function createCodeReviewSystem(config?: Partial<CodeReviewConfig>): CodeReviewRulesEngine;
export declare function integrateWithKanban(config?: Partial<CodeReviewConfig>): KanbanCodeReviewIntegration;
//# sourceMappingURL=index.d.ts.map