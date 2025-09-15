import { openLevelCache } from "@promethean/level-cache";
import type { Cache } from "@promethean/level-cache";

export type BootstrapState = Readonly<{
  rootPath: string;
  mode?: string;
  cursor?: number;
  fileList?: ReadonlyArray<string>;
  startedAt?: number;
  finishedAt?: number;
  fileInfo?: Record<
    string,
    { readonly size: number; readonly mtimeMs: number }
  >;
}>;

const CACHE_PATH = ".cache/smartgpt-bridge";

async function withCache<T>(
  fn: (cache: Cache<BootstrapState>) => Promise<T>,
): Promise<T> {
  const cache = await openLevelCache<BootstrapState>({ path: CACHE_PATH });
  try {
    return await fn(cache);
  } finally {
    await cache.close().catch(() => {});
  }
}

export function loadBootstrapState(
  rootPath: string,
): Promise<BootstrapState | null> {
  return withCache(async (cache) => {
    const state = await cache.get(rootPath);
    return state && state.rootPath === rootPath ? state : null;
  }).catch(() => null);
}

export function saveBootstrapState(
  rootPath: string,
  state: Readonly<Omit<BootstrapState, "rootPath">>,
): Promise<void> {
  return withCache(async (cache) => {
    const next: BootstrapState = { ...state, rootPath };
    await cache.set(rootPath, next);
  }).catch(() => {});
}

export function deleteBootstrapState(rootPath: string): Promise<void> {
  return withCache(async (cache) => {
    await cache.del(rootPath);
  }).catch(() => {});
}
