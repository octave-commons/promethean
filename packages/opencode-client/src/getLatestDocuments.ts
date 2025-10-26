import type { GenericEntry } from '@promethean/persistence';
import { contextStore } from './index.js';

export async function getLatestDocuments(limit: number = 100): Promise<GenericEntry[]> {
  return contextStore.getLatestDocuments(limit);
}
