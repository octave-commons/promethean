// SPDX-License-Identifier: GPL-3.0-only
// Cache management action

import {
  modelCaches,
  CACHE_SIMILARITY_THRESHOLD,
  CACHE_MAX_AGE_MS,
} from '@promethean/ollama-queue';

import type {
  CacheEntry,
  CacheStats,
  CacheClearResult,
  CacheExpiredResult,
  CacheAnalysis,
  CacheEntryWithMetadata,
} from './types.js';

const getCacheStats = (): CacheStats => {
  const totalSize = Array.from(modelCaches.values()).reduce((sum, cache) => sum + cache.size, 0);
  const modelStats = Array.from(modelCaches.entries()).map(([model, cache]) => ({
    model,
    size: cache.size,
  }));

  return {
    totalSize,
    modelCount: modelCaches.size,
    models: modelStats,
    similarityThreshold: CACHE_SIMILARITY_THRESHOLD,
    maxAgeMs: CACHE_MAX_AGE_MS,
    maxAgeHours: CACHE_MAX_AGE_MS / (1000 * 60 * 60),
  };
};

const clearAllCache = (): CacheClearResult => {
  const totalCleared = Array.from(modelCaches.values()).reduce((sum, cache) => sum + cache.size, 0);
  // Note: This violates functional immutability but is required for cache clearing
  (modelCaches as Map<string, unknown>).clear();
  console.log(`Prompt cache cleared for all models (${totalCleared} entries)`);
  return {
    message: 'Cache cleared successfully',
    clearedEntries: totalCleared,
    size: 0,
  };
};

const clearExpiredCache = (): CacheExpiredResult => {
  const currentSize = Array.from(modelCaches.values()).reduce((sum, cache) => sum + cache.size, 0);
  return {
    message:
      'Clear expired not implemented for in-memory cache. Use "clear" to remove all entries.',
    size: currentSize,
  };
};

const processEntryMetadata = (
  entry: CacheEntryWithMetadata,
  modelName: string,
  analysis: CacheAnalysis,
): void => {
  const metadata = entry.metadata as CacheEntry;

  if (metadata.score !== undefined) {
    // Score processing would be handled here
  }

  if (metadata.taskCategory) {
    const modelData = analysis.models[modelName];
    if (modelData) {
      modelData.taskDistribution[metadata.taskCategory] =
        (modelData.taskDistribution[metadata.taskCategory] || 0) + 1;
    }

    if (!analysis.performanceByCategory[metadata.taskCategory]) {
      analysis.performanceByCategory[metadata.taskCategory] = {
        totalScore: 0,
        count: 0,
        models: {},
      };
    }

    const categoryData = analysis.performanceByCategory[metadata.taskCategory];
    if (categoryData) {
      categoryData.totalScore += metadata.score || 0;
      categoryData.count++;

      if (!categoryData.models[modelName]) {
        categoryData.models[modelName] = {
          totalScore: 0,
          count: 0,
        };
      }

      const modelCategoryData = categoryData.models[modelName];
      if (modelCategoryData) {
        modelCategoryData.totalScore += metadata.score || 0;
        modelCategoryData.count++;
      }
    }
  }
};

const calculateCategoryAverages = (analysis: CacheAnalysis): void => {
  for (const [, data] of Object.entries(analysis.performanceByCategory)) {
    const categoryData = data as {
      totalScore: number;
      count: number;
      averageScore?: number;
      models: Record<string, unknown>;
    };
    categoryData.averageScore =
      categoryData.count > 0 ? categoryData.totalScore / categoryData.count : 0;

    for (const [, modelData] of Object.entries(categoryData.models)) {
      const modelInfo = modelData as { totalScore: number; count: number; averageScore?: number };
      modelInfo.averageScore = modelInfo.count > 0 ? modelInfo.totalScore / modelInfo.count : 0;
    }
  }
};

const analyzePerformance = (): CacheAnalysis => {
  const analysis: CacheAnalysis = {
    totalEntries: 0,
    models: {},
    taskCategories: {},
    averageScores: {},
    performanceByCategory: {},
  };

  for (const [modelName] of modelCaches.entries()) {
    const entries: CacheEntryWithMetadata[] = []; // TODO: Implement proper cache entries retrieval
    analysis.models[modelName] = {
      entries: entries.length,
      averageScore: 0,
      taskDistribution: {},
    };

    for (const entry of entries) {
      processEntryMetadata(entry, modelName, analysis);
    }

    analysis.totalEntries += entries.length;
  }

  calculateCategoryAverages(analysis);
  return analysis;
};

// Manage cache with various actions
export const manageCache = async (
  action: 'stats' | 'clear' | 'clear-expired' | 'performance-analysis',
): Promise<CacheStats | CacheClearResult | CacheExpiredResult | CacheAnalysis> => {
  switch (action) {
    case 'stats':
      return getCacheStats();

    case 'clear':
      return clearAllCache();

    case 'clear-expired':
      return clearExpiredCache();

    case 'performance-analysis':
      return analyzePerformance();

    default:
      throw new Error(`Unknown cache action: ${action}`);
  }
};
