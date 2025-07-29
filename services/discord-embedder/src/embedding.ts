import type { EmbeddingFunction, EmbeddingFunctionSpace } from "chromadb";

export class SimpleEmbeddingFunction implements EmbeddingFunction {
    name = "simple";

    async generate(texts: string[]): Promise<number[][]> {
        return texts.map(t => {
            const vec = new Array(256).fill(0);
            for (const char of t) {
                vec[char.charCodeAt(0) % 256]++;
            }
            const norm = Math.hypot(...vec);
            return vec.map(v => norm ? v / norm : 0);
        });
    }

    defaultSpace(): EmbeddingFunctionSpace { return "l2"; }
    supportedSpaces(): EmbeddingFunctionSpace[] { return ["l2", "cosine"]; }
    static buildFromConfig(): SimpleEmbeddingFunction { return new SimpleEmbeddingFunction(); }
    getConfig() { return {}; }
}
