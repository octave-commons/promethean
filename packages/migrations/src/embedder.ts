import { makeDeterministicEmbedder as canonicalMakeDeterministicEmbedder, assertDim } from '@promethean-os/embedding';

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

export { assertDim };

export function makeDeterministicEmbedder(cfg: EmbedderConfig): Embedder {
    return canonicalMakeDeterministicEmbedder(cfg);
}
