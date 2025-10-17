import { check } from './check.js';
import { OLLAMA_URL } from './ollama-queue.js';
import { OllamaOptions } from './OllamaOptions.js';

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
