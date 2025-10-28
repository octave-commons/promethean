import type { VectorSearchDriver, VectorSearchConfig, DualStoreMetadata } from '../interfaces.js';
/**
 * ChromaDB implementation of VectorSearchDriver
 * Extracted from existing DualStoreManager logic with write queue integration
 */
export declare class ChromaDriver implements VectorSearchDriver {
    readonly name: string;
    readonly config: VectorSearchConfig;
    private collection;
    private writeQueue;
    constructor(name: string, config: VectorSearchConfig);
    private getCollection;
    private getEmbeddingFunction;
    private flattenMetadata;
    add(ids: string[], documents: string[], metadatas: Record<string, string | number | boolean | null>[]): Promise<void>;
    query(queryTexts: string[], limit: number, where?: Record<string, unknown>): Promise<{
        ids: string[][];
        documents: string[][];
        metadatas: (DualStoreMetadata | null)[][];
    }>;
    get(ids: string[]): Promise<{
        ids: string[];
        metadatas: (DualStoreMetadata | null)[];
    }>;
    retryVectorWrite(id: string, document: string, metadata: Record<string, string | number | boolean | null>): Promise<boolean>;
    cleanup(): Promise<void>;
}
/**
 * Factory for creating ChromaDB drivers
 */
export declare class ChromaDriverFactory {
    static readonly supportedTypes: readonly ["chromadb"];
    static validateConfig(config: VectorSearchConfig): boolean;
    static create(name: string, config: VectorSearchConfig): Promise<VectorSearchDriver>;
}
//# sourceMappingURL=chromadb.d.ts.map