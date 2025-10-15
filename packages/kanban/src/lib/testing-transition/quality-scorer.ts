import type { TestQualityScore } from './types.js';

/**
 * Calculate a comprehensive quality score for tests.
 * Combines complexity, pass rate, and flakiness into a 0-100 score.
 */
export function calculateQualityScore(details: {
  complexity: number; // average cyclomatic complexity per test
  passRate: number; // percentage 0-100
  flakiness: number; // indicator 0-100 where lower is better
}): TestQualityScore {
  // Normalize metrics: complexity (higher worse), flakiness (higher worse), passRate (higher better)
  const complexityScore = Math.max(0, 100 - details.complexity * 10);
  const passScore = details.passRate;
  const flakinessScore = Math.max(0, 100 - details.flakiness);

  // Weighted sum: passRate 50%, complexity 30%, flakiness 20%
  const score =
    (passScore * 0.5 + complexityScore * 0.3 + flakinessScore * 0.2);

  return {
    score: Math.round(score),
    details: { ...details },
  };
}