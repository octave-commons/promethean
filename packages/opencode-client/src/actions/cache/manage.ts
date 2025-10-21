// SPDX-License-Identifier: GPL-3.0-only
// Cache management action

import {
  modelCaches,
  CACHE_SIMILARITY_THRESHOLD,
  CACHE_MAX_AGE_MS,
} from '@promethean/ollama-queue';
import type { CacheEntry } from './types.js';

// Manage cache with various actions
export async function manageCache(
  action: 'stats' | 'clear' | 'clear-expired' | 'performance-analysis',
) {
  switch (action) {
    case 'stats':
      const totalSize = Array.from(modelCaches.values()).reduce(
        (sum, cache) => sum + cache.size,
        0,
      );
      const modelStats = Array.from(modelCaches.entries()).map(([model, cache]) => ({
        model,
        size: cache.size,
      }));

      const stats = {
        totalSize,
        modelCount: modelCaches.size,
        models: modelStats,
        similarityThreshold: CACHE_SIMILARITY_THRESHOLD,
        maxAgeMs: CACHE_MAX_AGE_MS,
        maxAgeHours: CACHE_MAX_AGE_MS / (1000 * 60 * 60),
      };
      return stats;

    case 'clear':
      const totalCleared = Array.from(modelCaches.values()).reduce(
        (sum, cache) => sum + cache.size,
        0,
      );
      modelCaches.clear();
      console.log(`Prompt cache cleared for all models (${totalCleared} entries)`);
      return {
        message: 'Cache cleared successfully',
        clearedEntries: totalCleared,
        size: 0,
      };

    case 'clear-expired':
      // For in-memory cache, we'd need to iterate and remove expired entries
      // For now, just return info about this limitation
      const currentSize = Array.from(modelCaches.values()).reduce(
        (sum, cache) => sum + cache.size,
        0,
      );
      return {
        message:
          'Clear expired not implemented for in-memory cache. Use "clear" to remove all entries.',
        size: currentSize,
      };

    case 'performance-analysis':
      // Analyze performance across all cached entries
      const analysis: any = {
        totalEntries: 0,
        models: {},
        taskCategories: {},
        averageScores: {},
        performanceByCategory: {},
      };

      for (const [modelName] of modelCaches.entries()) {
        const entries: any[] = []; // TODO: Implement proper cache entries retrieval
        analysis.models[modelName] = {
          entries: entries.length,
          averageScore: 0,
          taskDistribution: {},
        };

        let totalScore = 0;
        let scoredEntries = 0;

        for (const entry of entries) {
          const metadata = entry.metadata as CacheEntry;
          if (metadata.score !== undefined) {
            totalScore += metadata.score;
            scoredEntries++;
          }

          if (metadata.taskCategory) {
            analysis.models[modelName].taskDistribution[metadata.taskCategory] =
              (analysis.models[modelName].taskDistribution[metadata.taskCategory] || 0) + 1;

            if (!analysis.performanceByCategory[metadata.taskCategory]) {
              analysis.performanceByCategory[metadata.taskCategory] = {
                totalScore: 0,
                count: 0,
                models: {},
              };
            }

            analysis.performanceByCategory[metadata.taskCategory].totalScore += metadata.score || 0;
            analysis.performanceByCategory[metadata.taskCategory].count++;

            if (!analysis.performanceByCategory[metadata.taskCategory].models[modelName]) {
              analysis.performanceByCategory[metadata.taskCategory].models[modelName] = {
                totalScore: 0,
                count: 0,
              };
            }

            analysis.performanceByCategory[metadata.taskCategory].models[modelName].totalScore +=
              metadata.score || 0;
            analysis.performanceByCategory[metadata.taskCategory].models[modelName].count++;
          }
        }

        analysis.models[modelName].averageScore =
          scoredEntries > 0 ? totalScore / scoredEntries : 0;
        analysis.totalEntries += entries.length;
      }

      // Calculate category averages
      for (const [category, data] of Object.entries(analysis.performanceByCategory)) {
        const dataAny = data as any;
        analysis.performanceByCategory[category].averageScore =
          dataAny.count > 0 ? dataAny.totalScore / dataAny.count : 0;

        for (const [model, modelData] of Object.entries(dataAny.models)) {
          const modelDataAny = modelData as any;
          analysis.performanceByCategory[category].models[model].averageScore =
            modelDataAny.count > 0 ? modelDataAny.totalScore / modelDataAny.count : 0;
        }
      }

      return analysis;

    default:
      throw new Error(`Unknown cache action: ${action}`);
  }
}
