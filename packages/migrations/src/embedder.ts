export type EmbedderConfig = {
    modelId: string; // e.g., qwen2.5-embed:2025-08-01
    dim: number; // e.g., 1536
};

export type Embedder = {
    readonly modelId: string;
    readonly dim: number;
    embedOne(text: string | { type: string; data: string }): Promise<number[]>;
    embedMany(texts: Array<string | { type: string; data: string }>): Promise<number[][]>;
};

export function makeDeterministicEmbedder(cfg: EmbedderConfig): Embedder {
    const hashToVec = (s: string, dim: number): number[] => {
        const base = Array.from(s).reduce(
            (h, ch) => Math.imul((h ^ ch.charCodeAt(0)) >>> 0, 16777619),
            2166136261 >>> 0,
        );
        return Array.from({ length: dim }, (_, i) => {
            const h = Math.imul((base ^ i) >>> 0, 16777619);
            return ((h >>> 0) % 1000) / 1000; // [0,1)
        });
    };

    return {
        modelId: cfg.modelId,
        dim: cfg.dim,
        async embedOne(text: string | { type: string; data: string }): Promise<number[]> {
            const s = typeof text === 'string' ? text : `${text.type}:${text.data}`;
            const v = hashToVec(s, cfg.dim);
            assertDim(v, cfg.dim);
            return v;
        },
        async embedMany(texts: Array<string | { type: string; data: string }>): Promise<number[][]> {
            const vs = texts.map((t) => {
                const s = typeof t === 'string' ? t : `${t.type}:${t.data}`;
                return hashToVec(s, cfg.dim);
            });
            vs.forEach((v) => assertDim(v, cfg.dim));
            return vs;
        },
    };
}

export function assertDim(vec: number[] | number[][], dim: number): void {
    if (Array.isArray((vec as number[][])[0])) {
        if ((vec as number[][]).some((v) => v.length !== dim)) throw new Error('Embedding dim mismatch');
    } else if ((vec as number[]).length !== dim) {
        throw new Error(`Embedding dim mismatch: ${(vec as number[]).length} != ${dim}`);
    }
}
