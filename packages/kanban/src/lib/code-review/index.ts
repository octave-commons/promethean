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
export const DEFAULT_CODE_REVIEW_CONFIG: CodeReviewConfig = {
  enabled: true,
  enforcement: 'warn',
  transitions: {},
  rules: [],
  thresholds: {
    overall: {
      minScore: 80,
      maxViolations: 10,
      maxErrors: 0,
    },
    byCategory: {},
  },
  tools: {
    eslint: {
      enabled: true,
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      timeout: 30000,
    },
    typescript: {
      enabled: true,
      strict: true,
      timeout: 30000,
    },
    security: {
      enabled: true,
      tools: ['semgrep'],
      timeout: 60000,
    },
    ai: {
      enabled: false,
      model: 'gpt-4',
      temperature: 0.1,
      maxTokens: 1000,
      timeout: 30000,
    },
  },
  reporting: {
    includeDetails: true,
    generateActionItems: true,
    appendToTask: false,
    createSeparateReport: false,
  },
  caching: {
    enabled: true,
    ttl: 300,
    maxSize: 1000,
  },
};

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
export function integrateWithKanban(config: Partial<CodeReviewConfig> = {}) {
  const reviewEngine = createCodeReviewSystem(config);
  return new KanbanCodeReviewIntegration(reviewEngine);
}
