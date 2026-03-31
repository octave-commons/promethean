// GPL-3.0-only
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import matter from 'gray-matter';

export type OllamaConfig = {
  url?: string;
  model?: string;
  truncateChars?: number;
  timeoutMs?: number;
};

export type SemanticDoc = {
  path: string;
  title?: string;
  frontmatter?: Record<string, unknown>;
  content: string;
  hash: string;
};

export type SemanticLocalHit = {
  path: string;
  title?: string;
  frontmatter?: Record<string, unknown>;
  score: number;
};

export async function embedWithOllama(text: string, config: OllamaConfig): Promise<number[]> {
  const url = config.url ?? 'http://localhost:11434';
  const model = config.model ?? 'nomic-embed-text';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 20_000);
  try {
    const res = await fetch(`${url}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`ollama embeddings failed (${res.status})`);
    }
    const data = (await res.json()) as { embedding?: number[] };
    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error('invalid embeddings response from ollama');
    }
    return data.embedding;
  } finally {
    clearTimeout(timeout);
  }
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function truncateContent(content: string, max: number): string {
  if (content.length <= max) return content;
  return content.slice(0, max);
}

export async function loadDocsForEmbedding(
  files: string[],
  cwd: string,
  truncateChars: number,
  absolute = false,
): Promise<SemanticDoc[]> {
  const docs: SemanticDoc[] = [];
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = matter(raw);
    const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
    const content = truncateContent(parsed.content, truncateChars);
    const hash = createHash('sha256').update(content).digest('hex');
    docs.push({
      path: absolute ? file : path.relative(cwd, file),
      title: (parsed.data.title as string | undefined) ?? heading,
      frontmatter: parsed.data,
      content,
      hash,
    });
  }
  return docs;
}

export async function semanticSearchOllama(
  query: string,
  docs: SemanticDoc[],
  config: OllamaConfig,
  limit?: number,
): Promise<SemanticLocalHit[]> {
  const queryEmbedding = await embedWithOllama(query, config);
  const results: SemanticLocalHit[] = [];
  for (const doc of docs) {
    const text = `${doc.title ?? ''}\n\n${doc.content}`.trim();
    const embedding = await embedWithOllama(text, config);
    const score = cosine(queryEmbedding, embedding);
    results.push({ path: doc.path, title: doc.title, frontmatter: doc.frontmatter, score });
  }
  results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return typeof limit === 'number' ? results.slice(0, limit) : results;
}
