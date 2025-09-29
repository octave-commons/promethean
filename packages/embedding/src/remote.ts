import type { EmbeddingFunction, EmbeddingFunctionSpace } from "chromadb";
import { ollamaEmbed } from "@promethean/utils";

const DEFAULT_TIMEOUT_MS = 10_000;

export type EmbeddingOverrideContext = {
  readonly model: string;
  readonly inputs: readonly string[];
  readonly driver: string;
  readonly timeoutMs: number;
};

export type EmbeddingOverride = (
  ctx: EmbeddingOverrideContext,
) => Promise<readonly (readonly number[])[]>;

let overrideImpl: EmbeddingOverride | null = null;

export function setEmbeddingOverride(override: EmbeddingOverride | null): void {
  overrideImpl = override;
}

function resolveTimeout(value?: number | string | null): number {
  if (value === undefined || value === null) return DEFAULT_TIMEOUT_MS;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_TIMEOUT_MS;
  return numeric < 0 ? 0 : numeric;
}

function normaliseInput(
  item:
    | string
    | {
        readonly type?: string;
        readonly data?: unknown;
        readonly text?: unknown;
      },
): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const payload =
      typeof item.data === "string"
        ? item.data
        : typeof item.text === "string"
          ? item.text
          : Array.isArray(item.data)
            ? item.data.join("\n")
            : undefined;
    if (typeof payload === "string") return payload;
    try {
      return JSON.stringify(item);
    } catch {
      return String(item);
    }
  }
  return String(item ?? "");
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  if (timeoutMs <= 0) return promise;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("embedding timeout"));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Shared RemoteEmbeddingFunction that now calls Ollama directly for embeddings.
export class RemoteEmbeddingFunction implements EmbeddingFunction {
  name = "remote";
  driver: string;
  fn: string;
  timeoutMs: number;

  constructor(
    _brokerUrl = process.env.BROKER_URL || "ws://localhost:7000",
    driver = process.env.EMBEDDING_DRIVER || "ollama",
    fn = process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
    _broker?: unknown,
    _clientIdPrefix = "embed",
    timeoutMs = resolveTimeout(process.env.EMBEDDING_TIMEOUT_MS),
  ) {
    this.driver = driver;
    this.fn = fn;
    this.timeoutMs = resolveTimeout(timeoutMs);
  }

  static fromConfig(cfg: {
    driver: string;
    fn: string;
    brokerUrl?: string;
    clientIdPrefix?: string;
    timeoutMs?: number;
  }): RemoteEmbeddingFunction {
    return new RemoteEmbeddingFunction(
      cfg.brokerUrl,
      cfg.driver,
      cfg.fn,
      undefined,
      cfg.clientIdPrefix,
      cfg.timeoutMs ?? resolveTimeout(process.env.EMBEDDING_TIMEOUT_MS),
    );
  }

  async generate(
    texts: Array<
      | string
      | {
          readonly type?: string;
          readonly data?: string;
          readonly text?: string;
        }
    >,
  ): Promise<number[][]> {
    const inputs = texts.map(normaliseInput);
    const model =
      this.fn || process.env.EMBEDDING_FUNCTION || "nomic-embed-text";
    if (overrideImpl) {
      const vectors = await overrideImpl({
        model,
        inputs,
        driver: this.driver,
        timeoutMs: this.timeoutMs,
      });
      return vectors.map((row) => row.slice()) as number[][];
    }
    const out: number[][] = [];
    for (const text of inputs) {
      const embedding = await withTimeout(
        ollamaEmbed(model, text),
        this.timeoutMs,
      );
      out.push(embedding);
    }
    return out;
  }

  defaultSpace(): EmbeddingFunctionSpace {
    return "l2";
  }

  supportedSpaces(): EmbeddingFunctionSpace[] {
    return ["l2", "cosine"];
  }

  getConfig(): Record<string, unknown> {
    return {};
  }

  dispose(): void {
    // no-op retained for legacy API symmetry
  }
}
