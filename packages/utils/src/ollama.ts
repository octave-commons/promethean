import { retry } from './retry.js';

export const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export class OllamaError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function check(res: Readonly<Response>, ctx: string) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const snippet = text ? `: ${text.slice(0, 400)}${text.length > 400 ? '…' : ''}` : '';
    throw new OllamaError(res.status, `ollama ${ctx} ${res.status}${snippet}`);
  }
  return res;
}

function isNumberArray(val: unknown): val is number[] {
  return Array.isArray(val) && val.every((n) => typeof n === 'number');
}

export type EmbeddingResponse = {
  embedding: number[];
};

export type BatchEmbeddingResponse = {
  data: { embedding: number[] }[];
};

function isEmbeddingResponse(val: unknown): val is EmbeddingResponse {
  return (
    typeof val === 'object' &&
    val !== null &&
    'embedding' in val &&
    isNumberArray((val as { embedding: unknown }).embedding)
  );
}

function isBatchEmbeddingResponse(val: unknown): val is BatchEmbeddingResponse {
  if (typeof val !== 'object' || val === null || !('data' in val)) return false;
  const data = (val as { data: unknown }).data;
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    data[0] !== null &&
    'embedding' in data[0] &&
    isNumberArray((data[0] as { embedding: unknown }).embedding)
  );
}

export async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  return retry(
    async () => {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 60_000);
      try {
        const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // send both fields for wider server compatibility
          body: JSON.stringify({ model, prompt: text, input: text }),
          signal: ac.signal,
        });
        await check(res, 'embeddings');
        const data: unknown = await res.json();
        if (isEmbeddingResponse(data)) return data.embedding;
        if (isBatchEmbeddingResponse(data)) return data.data[0]!.embedding;
        throw new Error('invalid embeddings response');
      } finally {
        clearTimeout(timer);
      }
    },
    {
      attempts: 3,
      backoff: (n) => 1_000 * n,
      shouldRetry: (err) => err instanceof OllamaError && err.status >= 500,
    },
  );
}

export type GenerateRequest = {
  model: string;
  prompt: string;
  stream: false;
  options: { temperature: number };
  format?: object | 'json';
};

export type GenerateResponse = {
  readonly response: unknown;
};

function isGenerateResponse(val: unknown): val is GenerateResponse {
  return typeof val === 'object' && val !== null && 'response' in val;
}

export async function ollamaJSON(
  model: string,
  prompt: string,
  options?: { schema?: object },
): Promise<unknown> {
  if (String(process.env.OLLAMA_DISABLE ?? 'false').toLowerCase() === 'true') {
    throw new Error('ollama disabled');
  }

  const requestBody: GenerateRequest = {
    model,
    prompt,
    stream: false,
    options: { temperature: 0 },
  };

  // Use structured schema if provided, otherwise fall back to basic json
  if (options?.schema) {
    requestBody.format = options.schema;
  } else {
    requestBody.format = 'json';
  }

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  await check(res, 'generate');
  const data: unknown = await res.json();
  if (!isGenerateResponse(data)) throw new Error('invalid generate response');
  const raw = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
  return JSON.parse(
    String(raw)
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim(),
  );
}
