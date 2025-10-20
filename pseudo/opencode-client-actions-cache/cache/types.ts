// SPDX-License-Identifier: GPL-3.0-only
// Cache types for action-based architecture

import { JobType } from '@promethean/ollama-queue';

// Prompt cache functions
export type CacheEntry = {
  prompt: string;
  response: unknown;
  modelName: string;
  jobType: JobType;
  createdAt: number;
  embedding?: number[];
  // AI Learning System - Performance Tracking
  score?: number; // -1 to 1 (negative = failed, positive = succeeded)
  scoreSource?: 'deterministic' | 'user-feedback' | 'auto-eval';
  scoreReason?: string; // Why it got this score
  taskCategory?: string; // e.g., 'buildfix-ts-errors', 'code-review', 'tdd-analysis'
  executionTime?: number; // How long the response took to generate
  tokensUsed?: number; // Token usage for cost tracking
};

// Cache management result types
export type CacheStats = {
  totalSize: number;
  modelCount: number;
  models: Array<{
    model: string;
    size: number;
  }>;
  similarityThreshold: number;
  maxAgeMs: number;
  maxAgeHours: number;
};

export type CacheClearResult = {
  message: string;
  clearedEntries: number;
  size: number;
};

export type CacheExpiredResult = {
  message: string;
  size: number;
};

export type ModelPerformanceData = {
  totalScore: number;
  count: number;
  averageScore?: number;
};

export type CategoryPerformanceData = {
  totalScore: number;
  count: number;
  averageScore?: number;
  models: Record<string, ModelPerformanceData>;
};

export type ModelAnalysis = {
  entries: number;
  averageScore: number;
  taskDistribution: Record<string, number>;
};

export type CacheAnalysis = {
  totalEntries: number;
  models: Record<string, ModelAnalysis>;
  taskCategories: Record<string, number>;
  averageScores: Record<string, number>;
  performanceByCategory: Record<string, CategoryPerformanceData>;
};

// Cache entry with metadata for performance analysis
export type CacheEntryWithMetadata = {
  metadata: CacheEntry;
};
