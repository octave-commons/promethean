export interface EmbedderConfig {
    modelId: string; // e.g., qwen2.5-embed:2025-08-01
    dim: number; // e.g., 1536
}

export interface Embedder {
    readonly modelId: string;
    readonly dim: number;
    embedOne(text: string | { type: string; data: string }): Promise<number[]>;
    embedMany(texts: Array<string | { type: string; data: string }>): Promise<number[][]>;
}

export function makeDeterministicEmbedder(cfg: EmbedderConfig): Embedder {
    function hashToVec(s: string, dim: number): number[] {
        // Simple deterministic pseudo-embedding for scaffolding/testing only.
        const out = new Array(dim).fill(0);
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        for (let i = 0; i < dim; i++) {
            h ^= i;
            h = Math.imul(h, 16777619);
            out[i] = ((h >>> 0) % 1000) / 1000; // [0,1)
        }
        return out;
    }

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
            for (const v of vs) assertDim(v, cfg.dim);
            return vs;
        },
    };
}

export function assertDim(vec: number[] | number[][], dim: number) {
    if (Array.isArray(vec[0])) {
        for (const v of vec as number[][])
            if (v.length !== dim) throw new Error(`Embedding dim mismatch: ${v.length} != ${dim}`);
    } else {
        if ((vec as number[]).length !== dim)
            throw new Error(`Embedding dim mismatch: ${(vec as number[]).length} != ${dim}`);
    }
}
