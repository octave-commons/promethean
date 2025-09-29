import {
  RemoteEmbeddingFunction,
  setEmbeddingOverride as baseSetEmbeddingOverride,
  type EmbeddingOverride,
  type EmbeddingOverrideContext,
} from "@promethean/embedding";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }
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

export { RemoteEmbeddingFunction };

export type { EmbeddingOverride, EmbeddingOverrideContext };

export function setEmbeddingOverride(override: EmbeddingOverride | null): void {
  if (!override) {
    baseSetEmbeddingOverride(null);
    return;
  }
  baseSetEmbeddingOverride((ctx: EmbeddingOverrideContext) =>
    withTimeout(override(ctx), ctx.timeoutMs),
  );
}
