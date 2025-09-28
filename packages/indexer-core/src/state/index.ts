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

export type IndexerStateBody = Readonly<Omit<BootstrapState, "rootPath">>;

export interface IndexerStateStore {
  load(rootPath: string): Promise<BootstrapState | null>;
  save(rootPath: string, state: IndexerStateBody): Promise<void>;
  delete(rootPath: string): Promise<void>;
}

const DEFAULT_CACHE_PATH = ".cache/indexer-core";

function withCache<T>(
  cachePath: string,
  fn: (cache: Cache<BootstrapState>) => Promise<T>,
): Promise<T> {
  return openLevelCache<BootstrapState>({ path: cachePath })
    .then(async (cache) => {
      try {
        return await fn(cache);
      } finally {
        await cache.close().catch(() => {});
      }
    })
    .catch((error) => {
      throw error;
    });
}

export function createLevelCacheStateStore(
  cachePath: string = DEFAULT_CACHE_PATH,
): IndexerStateStore {
  return {
    async load(rootPath) {
      try {
        const state = await withCache(cachePath, (cache) =>
          cache.get(rootPath),
        );
        return state && state.rootPath === rootPath ? state : null;
      } catch (error: any) {
        if (
          error?.code === "LEVEL_NOT_FOUND" ||
          error?.code === "NotFoundError"
        ) {
          return null;
        }
        return null;
      }
    },
    async save(rootPath, state) {
      await withCache(cachePath, (cache) =>
        cache.set(rootPath, { ...state, rootPath }),
      ).catch(() => {});
    },
    async delete(rootPath) {
      await withCache(cachePath, (cache) => cache.del(rootPath)).catch(
        () => {},
      );
    },
  };
}

export function createMemoryStateStore(): IndexerStateStore {
  const store = new Map<string, BootstrapState>();
  return {
    async load(rootPath) {
      return store.get(rootPath) ?? null;
    },
    async save(rootPath, state) {
      store.set(rootPath, { ...state, rootPath });
    },
    async delete(rootPath) {
      store.delete(rootPath);
    },
  };
}

let stateStore: IndexerStateStore = createLevelCacheStateStore();

export function setIndexerStateStore(store: IndexerStateStore): void {
  stateStore = store;
}

export function getIndexerStateStore(): IndexerStateStore {
  return stateStore;
}

export function loadBootstrapState(
  rootPath: string,
): Promise<BootstrapState | null> {
  return stateStore.load(rootPath);
}

export function saveBootstrapState(
  rootPath: string,
  state: IndexerStateBody,
): Promise<void> {
  return stateStore.save(rootPath, state);
}

export function deleteBootstrapState(rootPath: string): Promise<void> {
  return stateStore.delete(rootPath);
}
