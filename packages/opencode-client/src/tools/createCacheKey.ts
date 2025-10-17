import { JobType } from './ollama-queue.js';

export function createCacheKey(prompt: string, modelName: string, jobType: JobType): string {
  return `${jobType}:${modelName}:${Buffer.from(prompt).toString('base64').slice(0, 32)}`;
}
