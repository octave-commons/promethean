// SPDX-License-Identifier: GPL-3.0-only
// Cache key generation and embedding action

import { JobType, OLLAMA_URL } from '@promethean/ollama-queue';
import { check } from '../ollama/api.js';

export function createCacheKey(prompt: string, modelName: string, jobType: JobType): string {
  return `${jobType}:${modelName}:${Buffer.from(prompt).toString('base64').slice(0, 32)}`;
}

// Get prompt embedding for similarity search
export async function getPromptEmbedding(prompt: string, modelName: string): Promise<number[]> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt,
      }),
    });

    await check(res, 'get embedding');
    const data = await res.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error('Invalid embedding response from ollama');
    }

    return data.embedding;
  } catch (error) {
    throw new Error(
      `Failed to get embedding: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
