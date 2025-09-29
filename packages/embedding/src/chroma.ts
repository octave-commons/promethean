type UpsertItem = Readonly<{
  id: string;
  embedding: ReadonlyArray<number>;
  metadata?: Readonly<Record<string, unknown>>;
  document?: string;
}>;

export type ChromaConfig = Readonly<{
  url: string; // CHROMA_URL
  prefix?: string; // collection prefix e.g., prom_
  collection: string; // logical collection name
  embeddingDim: number; // guard
}>;

export type ChromaWrapper = {
  ensureCollection(): Promise<void>;
  upsert(items: ReadonlyArray<UpsertItem>): Promise<void>;
  delete(ids: ReadonlyArray<string>): Promise<void>;
  count(): Promise<number>;
};

class StateRef {
  static readonly #store = new WeakMap<
    StateRef,
    ReadonlyMap<string, UpsertItem>
  >();

  constructor() {
    StateRef.#store.set(this, new Map<string, UpsertItem>());
  }

  get(): ReadonlyMap<string, UpsertItem> {
    return StateRef.#store.get(this)!;
  }

  update(
    updater: (
      current: ReadonlyArray<readonly [string, UpsertItem]>,
    ) => ReadonlyArray<readonly [string, UpsertItem]>,
  ): void {
    const nextEntries = updater([...this.get().entries()]);
    StateRef.#store.set(this, new Map(nextEntries));
  }
}

export function makeChromaWrapper(cfg: ChromaConfig): ChromaWrapper {
  // Minimal, adapter-agnostic wrapper. Replace internals with real chromadb client as needed.
  const stateRef = new StateRef();
  return {
    async ensureCollection() {
      // In a real client: create/get collection, validate metadata embeddingDim
      // Here: no-op, guard stored in cfg
      if (!cfg.collection || !cfg.embeddingDim)
        throw new Error("Invalid ChromaConfig");
    },
    async upsert(items: ReadonlyArray<UpsertItem>) {
      stateRef.update((current) => [
        ...current,
        ...items.map((it) => [it.id, it] as const),
      ]);
    },
    async delete(ids: ReadonlyArray<string>) {
      const toDelete = new Set(ids);
      stateRef.update((current) => current.filter(([id]) => !toDelete.has(id)));
    },
    async count() {
      return stateRef.get().size;
    },
  };
}
