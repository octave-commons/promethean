// SPDX-License-Identifier: GPL-3.0-only
// Ollama API actions

import { OllamaError, OLLAMA_URL } from '@promethean/ollama-queue';
import { OllamaOptions } from './types.js';

export async function check(res: Readonly<Response>, ctx: string): Promise<Response> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const snippet = text ? `: ${text.slice(0, 400)}${text.length > 400 ? '…' : ''}` : '';
    throw new OllamaError(res.status, `ollama ${ctx} ${res.status}${snippet}`);
  }
  return res;
}

export async function callOllamaChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: OllamaOptions,
): Promise<unknown> {
  const requestBody = {
    model,
    messages,
    stream: false,
    options: {
      temperature: 0.7,
      ...options,
    },
  };

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  await check(res, 'chat');
  const data = await res.json();

  if (!data.message?.content) {
    throw new Error('Invalid chat response from ollama');
  }

  return data.message.content;
}

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
