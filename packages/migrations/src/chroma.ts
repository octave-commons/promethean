type UpsertItem = {
    id: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
    document?: string;
};

export type ChromaConfig = {
    url: string; // CHROMA_URL
    prefix?: string; // collection prefix e.g., prom_
    collection: string; // logical collection name
    embeddingDim: number; // guard
};

export type ChromaWrapper = {
    ensureCollection(): Promise<void>;
    upsert(items: UpsertItem[]): Promise<void>;
    delete(ids: string[]): Promise<void>;
    count(): Promise<number>;
};

export function makeChromaWrapper(cfg: ChromaConfig): ChromaWrapper {
    // Minimal, adapter-agnostic wrapper. Replace internals with real chromadb client as needed.
    const state = new Map<string, UpsertItem>(); // in-memory stub fallback
    return {
        async ensureCollection() {
            // In a real client: create/get collection, validate metadata embeddingDim
            // Here: no-op, guard stored in cfg
            if (!cfg.collection || !cfg.embeddingDim) throw new Error('Invalid ChromaConfig');
        },
        async upsert(items: UpsertItem[]) {
            for (const it of items) state.set(it.id, it);
        },
        async delete(ids: string[]) {
            for (const id of ids) state.delete(id);
        },
        async count() {
            return state.size;
        },
    };
}
