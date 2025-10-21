import { Job } from './Job.js';

// AI Learning System - Performance Analysis Functions
// eslint-disable-next-line complexity
export function inferTaskCategory(job: Job): string {
  const prompt = job.prompt || job.messages?.map((m) => m.content).join(' ') || '';
  const lowerPrompt = prompt.toLowerCase();

  // BuildFix detection
  if (lowerPrompt.includes('typescript') && lowerPrompt.includes('error')) {
    return 'buildfix-ts-errors';
  }
  if (lowerPrompt.includes('fix the error') || lowerPrompt.includes('compilation error')) {
    return 'buildfix-general';
  }

  // Code review detection
  if (
    lowerPrompt.includes('review') ||
    lowerPrompt.includes('critique') ||
    lowerPrompt.includes('improve')
  ) {
    return 'code-review';
  }

  // TDD detection
  if (lowerPrompt.includes('test') || lowerPrompt.includes('tdd') || lowerPrompt.includes('spec')) {
    return 'tdd-analysis';
  }

  // Documentation generation
  if (
    lowerPrompt.includes('document') ||
    lowerPrompt.includes('readme') ||
    lowerPrompt.includes('explain')
  ) {
    return 'documentation';
  }

  // General coding
  if (
    lowerPrompt.includes('code') ||
    lowerPrompt.includes('function') ||
    lowerPrompt.includes('implement')
  ) {
    return 'coding';
  }

  return 'general';
}
