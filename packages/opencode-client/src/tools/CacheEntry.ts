import { JobType } from './ollama-queue.js';

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
