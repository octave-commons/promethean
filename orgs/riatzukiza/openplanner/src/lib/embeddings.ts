import { IEmbeddingFunction } from "chromadb";

export class OllamaEmbeddingFunction implements IEmbeddingFunction {
  private model: string;
  private url: string;
  private truncate: boolean;
  private numCtx?: number;
  private apiKey?: string;

  constructor(
    model: string,
    url: string = "http://localhost:11434",
    opts?: { truncate?: boolean; numCtx?: number; apiKey?: string }
  ) {
    this.model = model;
    this.url = url;
    this.truncate = opts?.truncate ?? true;
    this.numCtx = typeof opts?.numCtx === "number" && Number.isFinite(opts.numCtx) ? opts.numCtx : undefined;
    this.apiKey = typeof opts?.apiKey === "string" && opts.apiKey.length > 0 ? opts.apiKey : undefined;
  }

  async generate(texts: string[]): Promise<number[][]> {
    // Prefer Ollama /api/embed which supports batching and explicit truncation control.
    // Docs: https://docs.ollama.com/api/embed
    try {
      const body: any = {
        model: this.model,
        input: texts,
        truncate: this.truncate,
      };
      if (this.numCtx) {
        body.options = { num_ctx: this.numCtx };
      }

      const res = await fetch(`${this.url}/api/embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Ollama embed failed: ${res.status} ${res.statusText}${msg ? `\n${msg}` : ""}`);
      }

      const data = (await res.json()) as { embeddings?: number[][] };
      const out = Array.isArray(data.embeddings) ? data.embeddings : [];
      if (out.length !== texts.length) {
        throw new Error(`Ollama embed returned ${out.length} embeddings for ${texts.length} inputs`);
      }
      return out;
    } catch (err) {
      // Fail loud by default; callers can decide how to handle upstream.
      // Returning zero vectors here silently corrupts retrieval quality and makes truncation bugs invisible.
      console.error("Ollama embedding error:", err);
      throw err;
    }
  }
}
