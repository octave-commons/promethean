/**
 * Automated Code Review System for Kanban Transitions
 *
 * This module provides comprehensive code analysis capabilities for validating
 * code quality during kanban board transitions. It integrates multiple analysis
 * tools including ESLint, TypeScript compiler, security scanners, and AI analysis.
 */

import type {
  CodeReviewConfig,
  CodeReviewResult,
  CodeReviewViolation,
  CodeReviewSuggestion,
  CodeReviewMetrics,
  ActionItem,
  CodeReviewRule,
  CodeReviewRequest,
  CodeReviewContext,
  TransitionCodeReviewConfig,
  ESLintResult,
  TypeScriptResult,
  SecurityResult,
  AIAnalysisResult,
  ReviewCacheEntry,
  KanbanTransitionReviewRequest,
  KanbanTransitionReviewResult,
  Task,
} from './types.js';

import { CodeReviewRulesEngine } from './rules-engine.js';
import { ESLintAnalyzer } from './analyzers/eslint-analyzer.js';
import { TypeScriptAnalyzer } from './analyzers/typescript-analyzer.js';
import { SecurityAnalyzer } from './analyzers/security-analyzer.js';
import { AIAnalyzer } from './analyzers/ai-analyzer.js';
import { ReviewCache } from './cache/review-cache.js';
import { KanbanCodeReviewIntegration } from './integration/kanban-integration.js';

// Re-export types
export type {
  CodeReviewConfig,
  CodeReviewResult,
  CodeReviewViolation,
  CodeReviewSuggestion,
  CodeReviewMetrics,
  ActionItem,
  CodeReviewRule,
  CodeReviewRequest,
  CodeReviewContext,
  TransitionCodeReviewConfig,
  ESLintResult,
  TypeScriptResult,
  SecurityResult,
  AIAnalysisResult,
  ReviewCacheEntry,
  KanbanTransitionReviewRequest,
  KanbanTransitionReviewResult,
  Task,
};

// Main rules engine
export { CodeReviewRulesEngine } from './rules-engine.js';

// Analyzers
export { ESLintAnalyzer } from './analyzers/eslint-analyzer.js';
export { TypeScriptAnalyzer } from './analyzers/typescript-analyzer.js';
export { SecurityAnalyzer } from './analyzers/security-analyzer.js';
export { AIAnalyzer } from './analyzers/ai-analyzer.js';

// Cache system
export { ReviewCache } from './cache/review-cache.js';

// Integration layer
export { KanbanCodeReviewIntegration } from './integration/kanban-integration.js';

// Utilities
export const DEFAULT_CODE_REVIEW_CONFIG = {
  enabled: true,
  tools: {
    eslint: { enabled: true, threshold: 80 },
    typescript: { enabled: true, threshold: 85 },
    security: { enabled: true, threshold: 90 },
    ai: { enabled: false, threshold: 75 },
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000,
  },
  rules: {
    'testing->review': {
      requiredScore: 80,
      blockedCategories: ['security', 'critical'],
      tools: { eslint: true, typescript: true, security: true, ai: false },
    },
    'review->done': {
      requiredScore: 90,
      blockedCategories: ['security', 'critical', 'error'],
      tools: { eslint: true, typescript: true, security: true, ai: true },
    },
    'in_progress->testing': {
      requiredScore: 70,
      blockedCategories: ['security', 'critical'],
      tools: { eslint: true, typescript: true, security: false, ai: false },
    },
  },
} as const;

// Factory function for easy setup
export function createCodeReviewSystem(config: Partial<CodeReviewConfig> = {}) {
  const mergedConfig = {
    ...DEFAULT_CODE_REVIEW_CONFIG,
    ...config,
    tools: { ...DEFAULT_CODE_REVIEW_CONFIG.tools, ...config.tools },
    rules: { ...DEFAULT_CODE_REVIEW_CONFIG.rules, ...config.rules },
  };

  return new CodeReviewRulesEngine(mergedConfig);
}

// Integration helper
export function integrateWithKanban(kanbanSystem: any, config: Partial<CodeReviewConfig> = {}) {
  const reviewEngine = createCodeReviewSystem(config);
  return new KanbanCodeReviewIntegration(kanbanSystem, reviewEngine);
}
