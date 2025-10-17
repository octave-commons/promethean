import { inferTaskCategory } from './inferTaskCategory.js';
import { Job } from './Job.js';

// eslint-disable-next-line max-lines-per-function
export async function calculatePerformanceScore(
  job: Job,
  result: unknown,
  executionTime: number,
): Promise<{
  score?: number;
  scoreSource?: 'deterministic' | 'user-feedback' | 'auto-eval';
  scoreReason?: string;
  taskCategory?: string;
  executionTime?: number;
  tokensUsed?: number;
}> {
  const taskCategory = inferTaskCategory(job);

  // Default performance data
  const performanceData = {
    taskCategory,
    executionTime,
  };

  // BuildFix deterministic scoring
  if (taskCategory.startsWith('buildfix-')) {
    return {
      ...performanceData,
      score: 1.0, // Success = positive score
      scoreSource: 'deterministic' as const,
      scoreReason: 'BuildFix job completed successfully',
    };
  }

  // Performance-based scoring for other tasks
  let score = 0.5; // Neutral baseline
  let scoreReason = 'Job completed successfully';

  // Fast execution bonus
  if (executionTime < 5000) {
    // Under 5 seconds
    score += 0.2;
    scoreReason += ' (fast execution)';
  } else if (executionTime > 30000) {
    // Over 30 seconds
    score -= 0.1;
    scoreReason += ' (slow execution)';
  }

  // Task-specific scoring
  if (taskCategory === 'code-review') {
    // Code reviews should be thorough but not too long
    if (executionTime > 10000 && executionTime < 60000) {
      score += 0.1;
      scoreReason += ' (appropriate review time)';
    }
  }

  return {
    ...performanceData,
    score: Math.max(-1, Math.min(1, score)), // Clamp to [-1, 1]
    scoreSource: 'auto-eval' as const,
    scoreReason,
  };
}
