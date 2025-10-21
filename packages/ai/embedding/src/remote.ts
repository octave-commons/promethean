import { inspect } from "node:util";

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

const overrideState: { current: EmbeddingOverride | null } = {
  current: null,
};

export function setEmbeddingOverride(override: EmbeddingOverride | null): void {
  overrideState.current = override;
}

function resolveTimeout(value?: number | string | null): number {
  if (value === undefined || value === null) return DEFAULT_TIMEOUT_MS;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_TIMEOUT_MS;
  return numeric < 0 ? 0 : numeric;
}

type NormalisableInput =
  | string
  | {
      readonly type?: string;
      readonly data?: unknown;
      readonly text?: unknown;
    };

const stringifyUnknown = (value: unknown): string =>
  typeof value === "string" ? value : inspect(value, { depth: 2 });

const extractPayload = (
  item: Exclude<NormalisableInput, string>,
): string | null => {
  if (typeof item.data === "string") return item.data;
  if (typeof item.text === "string") return item.text;
  if (Array.isArray(item.data))
    return item.data.map((entry) => stringifyUnknown(entry)).join("\n");
  return null;
};

function normaliseInput(item: NormalisableInput): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object")
    return extractPayload(item) ?? stringifyUnknown(item);
  return stringifyUnknown(item ?? "");
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
type RemoteEmbeddingConstructorConfig = Readonly<{
  brokerUrl?: string;
  driver?: string;
  fn?: string;
  clientIdPrefix?: string;
  timeoutMs?: number | string | null;
}>;

type LegacyConstructorArgs = [
  string | undefined,
  string | undefined,
  string | undefined,
  unknown,
  string | undefined,
  number | string | null | undefined,
];

type RemoteEmbeddingConstructorArgs =
  | []
  | [RemoteEmbeddingConstructorConfig]
  | LegacyConstructorArgs;

const toConstructorConfig = (
  args: RemoteEmbeddingConstructorArgs,
): RemoteEmbeddingConstructorConfig => {
  if (args.length === 0) return {};
  const [first] = args;
  if (first && typeof first === "object" && !Array.isArray(first)) return first;
  const [brokerUrl, driver, fn, _broker, clientIdPrefix, timeoutMs] =
    args as LegacyConstructorArgs;
  return { brokerUrl, driver, fn, clientIdPrefix, timeoutMs };
};

export class RemoteEmbeddingFunction implements EmbeddingFunction {
  name = "remote";
  readonly driver: string;
  readonly fn: string;
  readonly timeoutMs: number;

  constructor(...args: RemoteEmbeddingConstructorArgs) {
    const cfg = toConstructorConfig(args);
    this.driver = cfg.driver ?? process.env.EMBEDDING_DRIVER ?? "ollama";
    this.fn = cfg.fn ?? process.env.EMBEDDING_FUNCTION ?? "nomic-embed-text";
    const timeoutSource =
      cfg.timeoutMs ?? process.env.EMBEDDING_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS;
    this.timeoutMs = resolveTimeout(timeoutSource);
  }

  static fromConfig(cfg: {
    driver: string;
    fn: string;
    brokerUrl?: string;
    clientIdPrefix?: string;
    timeoutMs?: number;
  }): RemoteEmbeddingFunction {
    return new RemoteEmbeddingFunction({
      brokerUrl: cfg.brokerUrl,
      driver: cfg.driver,
      fn: cfg.fn,
      clientIdPrefix: cfg.clientIdPrefix,
      timeoutMs: cfg.timeoutMs ?? process.env.EMBEDDING_TIMEOUT_MS ?? null,
    });
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
    const activeOverride = overrideState.current;
    if (activeOverride) {
      const vectors = await activeOverride({
        model,
        inputs,
        driver: this.driver,
        timeoutMs: this.timeoutMs,
      });
      return vectors.map((row) => [...row]);
    }
    return Promise.all(
      inputs.map((text) =>
        withTimeout(ollamaEmbed(model, text), this.timeoutMs),
      ),
    );
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
