import { JobType } from '@promethean/ollama-queue';

export function createCacheKey(prompt: string, modelName: string, jobType: JobType): string {
  return `${jobType}:${modelName}:${Buffer.from(prompt).toString('base64').slice(0, 32)}`;
}
