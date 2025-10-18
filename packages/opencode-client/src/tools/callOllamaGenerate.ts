import { check } from './check.js';
import { OLLAMA_URL } from '@promethean/ollama-queue';
import { OllamaOptions } from './OllamaOptions.js';

export async function callOllamaGenerate(
  model: string,
  prompt: string,
  options?: OllamaOptions,
): Promise<unknown> {
  const requestBody = {
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      ...options,
    },
  };

  if (options?.format) {
    (requestBody as any).format = options.format;
  }

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  await check(res, 'generate');
  const data = await res.json();

  if (!data.response) {
    throw new Error('Invalid generate response from ollama');
  }

  return data.response;
}
