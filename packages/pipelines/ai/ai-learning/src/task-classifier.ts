import type { TaskCategory } from './types.js';

/**
 * Task Classifier - Categorizes AI tasks for routing and performance tracking
 */
export class TaskClassifier {
  private static readonly KEYWORD_PATTERNS: Record<TaskCategory, RegExp[]> = {
    'buildfix-ts-errors': [
      /typescript.*error/i,
      /ts\d+:/i,
      /cannot find name/i,
      /property.*does not exist/i,
      /type.*is not assignable/i,
      /argument of type.*is not assignable/i,
      /module.*cannot be found/i,
    ],
    'buildfix-general': [
      /fix the error/i,
      /compilation error/i,
      /build failed/i,
      /syntax error/i,
      /resolve.*error/i,
    ],
    'code-review': [
      /review/i,
      /critique/i,
      /improve/i,
      /suggest.*improvement/i,
      /code quality/i,
      /best practices/i,
    ],
    'tdd-analysis': [/test/i, /tdd/i, /spec/i, /unit test/i, /test case/i, /assertion/i, /mock/i],
    documentation: [/document/i, /readme/i, /explain/i, /comment/i, /docstring/i, /api.*doc/i],
    coding: [
      /code/i,
      /function/i,
      /implement/i,
      /write.*code/i,
      /create.*function/i,
      /develop/i,
      /program/i,
    ],
    testing: [/test.*case/i, /write.*test/i, /create.*test/i, /testing/i, /assert/i, /verify/i],
    refactoring: [
      /refactor/i,
      /restructure/i,
      /optimize/i,
      /clean up/i,
      /improve.*code/i,
      /reorganize/i,
    ],
    debugging: [/debug/i, /fix.*bug/i, /troubleshoot/i, /diagnose/i, /issue/i, /problem/i],
    general: [], // fallback category
  };

  /**
   * Classify a task based on its prompt/content
   */
  static classifyTask(
    prompt: string,
    context?: {
      jobType?: 'generate' | 'chat' | 'embedding';
      messages?: Array<{ role: string; content: string }>;
    },
  ): TaskCategory {
    const text = this.extractText(prompt, context);
    const scores = this.calculateCategoryScores(text);

    // Return the category with the highest score
    const bestCategory = Object.entries(scores).reduce(
      (best, [category, score]) =>
        score > best.score ? { category: category as TaskCategory, score } : best,
      { category: 'general' as TaskCategory, score: 0 },
    );

    return bestCategory.category;
  }

  /**
   * Get confidence scores for all categories
   */
  static getClassificationScores(
    prompt: string,
    context?: {
      jobType?: 'generate' | 'chat' | 'embedding';
      messages?: Array<{ role: string; content: string }>;
    },
  ): Record<TaskCategory, number> {
    const text = this.extractText(prompt, context);
    return this.calculateCategoryScores(text);
  }

  /**
   * Extract text from prompt or messages
   */
  private static extractText(
    prompt: string,
    context?: {
      jobType?: 'generate' | 'chat' | 'embedding';
      messages?: Array<{ role: string; content: string }>;
    },
  ): string {
    if (context?.messages) {
      return context.messages.map((m) => m.content).join(' ') + ' ' + prompt;
    }
    return prompt;
  }

  /**
   * Calculate scores for each category based on keyword matching
   */
  private static calculateCategoryScores(text: string): Record<TaskCategory, number> {
    const scores: Partial<Record<TaskCategory, number>> = {};
    const normalizedText = text.toLowerCase();

    for (const [category, patterns] of Object.entries(this.KEYWORD_PATTERNS)) {
      let score = 0;

      for (const pattern of patterns) {
        const matches = normalizedText.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }

      // Apply category-specific weighting
      score = this.applyCategoryWeighting(category as TaskCategory, score, normalizedText);

      scores[category as TaskCategory] = score;
    }

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(scores), 1);
    const normalizedScores: Record<TaskCategory, number> = {} as any;

    for (const [category, score] of Object.entries(scores)) {
      normalizedScores[category as TaskCategory] = score / maxScore;
    }

    return normalizedScores;
  }

  /**
   * Apply category-specific weighting logic
   */
  private static applyCategoryWeighting(
    category: TaskCategory,
    baseScore: number,
    text: string,
  ): number {
    let weightedScore = baseScore;

    switch (category) {
      case 'buildfix-ts-errors':
        // Boost score if we see specific TypeScript error patterns
        if (/\b(TS\d+)\b/.test(text)) {
          weightedScore += 2;
        }
        break;

      case 'tdd-analysis':
        // Boost if we see testing frameworks mentioned
        if (/(jest|vitest|mocha|jasmine|ava)/i.test(text)) {
          weightedScore += 1.5;
        }
        break;

      case 'code-review':
        // Boost if we see specific review keywords
        if (/(pull request|pr|merge request|code review)/i.test(text)) {
          weightedScore += 1.5;
        }
        break;

      case 'documentation':
        // Boost if we see documentation formats
        if (/(markdown|md|api docs|javadoc|jsdoc)/i.test(text)) {
          weightedScore += 1.2;
        }
        break;
    }

    return weightedScore;
  }

  /**
   * Get all available task categories
   */
  static getAllCategories(): TaskCategory[] {
    return Object.keys(this.KEYWORD_PATTERNS) as TaskCategory[];
  }

  /**
   * Get keywords for a specific category
   */
  static getCategoryKeywords(category: TaskCategory): string[] {
    const patterns = this.KEYWORD_PATTERNS[category] || [];
    return patterns.map((p) => p.source);
  }

  /**
   * Add custom keywords to a category (for runtime customization)
   */
  static addKeywords(category: TaskCategory, keywords: string[]): void {
    if (!this.KEYWORD_PATTERNS[category]) {
      this.KEYWORD_PATTERNS[category] = [];
    }

    for (const keyword of keywords) {
      try {
        this.KEYWORD_PATTERNS[category].push(new RegExp(keyword, 'i'));
      } catch (error) {
        console.warn(`Invalid regex pattern for ${category}: ${keyword}`, error);
      }
    }
  }
}
