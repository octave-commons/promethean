import { check } from './check.js';
import { OLLAMA_URL } from './ollama-queue.js';

export async function callOllamaEmbed(model: string, input: string | string[]): Promise<number[]> {
  const requestBody = {
    model,
    input: Array.isArray(input) ? input : [input],
  };

  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  await check(res, 'embeddings');
  const data = await res.json();

  if (!data.embeddings || !Array.isArray(data.embeddings)) {
    throw new Error('Invalid embeddings response from ollama');
  }

  // Return first embedding for single input, or all for batch
  return Array.isArray(input) ? data.embeddings : data.embeddings[0];
}
