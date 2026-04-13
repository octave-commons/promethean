import {
  knownEmbeddingFunctions,
  registerEmbeddingFunction,
  type EmbeddingFunction,
  type EmbeddingFunctionSpace,
} from "chromadb";

interface OllamaEmbeddingConfig {
  readonly url: string;
  readonly model_name: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toVector(value: unknown): number[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const vector = value.filter((entry): entry is number => typeof entry === "number" && Number.isFinite(entry));
  return vector.length > 0 ? vector : null;
}

export class OllamaEmbeddingFunction implements EmbeddingFunction {
  public readonly name = "ollama";

  public constructor(
    private readonly config: {
      readonly url: string;
      readonly model: string;
    },
  ) {}

  public async generate(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const batchEmbeddings = await this.generateBatch(texts);
    if (batchEmbeddings !== null) {
      return batchEmbeddings;
    }

    return Promise.all(texts.map(async (text) => this.generateLegacy(text)));
  }

  public async generateForQueries(texts: string[]): Promise<number[][]> {
    return this.generate(texts);
  }

  public defaultSpace(): EmbeddingFunctionSpace {
    return "cosine";
  }

  public supportedSpaces(): EmbeddingFunctionSpace[] {
    return ["cosine", "l2", "ip"];
  }

  public getConfig(): OllamaEmbeddingConfig {
    return {
      url: this.config.url,
      model_name: this.config.model,
    };
  }

  public validateConfig(config: Record<string, unknown>): void {
    if (typeof config.url !== "string" || config.url.trim().length === 0) {
      throw new Error("Ollama embedding config requires a non-empty url");
    }

    const modelName = typeof config.model_name === "string"
      ? config.model_name
      : typeof config.model === "string"
        ? config.model
        : "";
    if (modelName.trim().length === 0) {
      throw new Error("Ollama embedding config requires a non-empty model_name");
    }
  }

  public validateConfigUpdate(_newConfig: Record<string, unknown>): void {
    // Chroma may ask whether updates are allowed. This embedding function accepts no runtime mutation.
  }

  public static buildFromConfig(config: Record<string, unknown>): OllamaEmbeddingFunction {
    const url = typeof config.url === "string" && config.url.trim().length > 0
      ? config.url.trim()
      : "http://127.0.0.1:11434";
    const model = typeof config.model_name === "string" && config.model_name.trim().length > 0
      ? config.model_name.trim()
      : typeof config.model === "string" && config.model.trim().length > 0
        ? config.model.trim()
        : "nomic-embed-text:latest";

    return new OllamaEmbeddingFunction({ url, model });
  }

  private async generateBatch(texts: readonly string[]): Promise<number[][] | null> {
    const response = await fetch(new URL("/api/embed", `${this.config.url}/`).toString(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        input: texts,
      }),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Ollama /api/embed request failed: ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.embeddings)) {
      throw new Error("Ollama /api/embed response missing embeddings");
    }

    const vectors = payload.embeddings
      .map((entry) => toVector(entry))
      .filter((entry): entry is number[] => entry !== null);
    if (vectors.length !== texts.length) {
      throw new Error("Ollama /api/embed returned an unexpected embedding count");
    }

    return vectors;
  }

  private async generateLegacy(text: string): Promise<number[]> {
    const response = await fetch(new URL("/api/embeddings", `${this.config.url}/`).toString(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama /api/embeddings request failed: ${response.status}`);
    }

    const payload: unknown = await response.json();
    const vector = isRecord(payload) ? toVector(payload.embedding) : null;
    if (vector === null) {
      throw new Error("Ollama /api/embeddings response missing embedding");
    }

    return vector;
  }
}

export function registerOllamaEmbeddingFunction(): void {
  if (knownEmbeddingFunctions.has("ollama")) {
    return;
  }

  registerEmbeddingFunction("ollama", OllamaEmbeddingFunction as never);
}
