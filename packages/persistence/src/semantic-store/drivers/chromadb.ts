import type { Collection as ChromaCollection } from 'chromadb';
import { getChromaClient } from '../../clients.js';
import { getOrCreateQueue } from '../../chroma-write-queue.js';
import type { VectorSearchDriver, VectorSearchConfig, DualStoreMetadata } from '../interfaces.js';
import { SemanticStoreError } from '../interfaces.js';

/**
 * ChromaDB implementation of VectorSearchDriver
 * Extracted from existing DualStoreManager logic with write queue integration
 */
export class ChromaDriver implements VectorSearchDriver {
    readonly name: string;
    readonly config: VectorSearchConfig;
    private collection: ChromaCollection | undefined;
    private writeQueue: ReturnType<typeof getOrCreateQueue> | undefined;

    constructor(name: string, config: VectorSearchConfig) {
        this.name = name;
        this.config = config;
    }

    private async getCollection(): Promise<ChromaCollection> {
        if (!this.collection) {
            const chromaClient = await getChromaClient();

            // Get embedding function from config or use default
            const embeddingFunction = this.config.embeddingFunction
                ? await this.getEmbeddingFunction(this.config.embeddingFunction)
                : undefined;

            this.collection = await chromaClient.getOrCreateCollection({
                name: this.config.collection || this.name,
                embeddingFunction,
            });

            // Initialize write queue
            this.writeQueue = getOrCreateQueue(this.name, this.collection);
        }
        return this.collection;
    }

    private async getEmbeddingFunction(config: VectorSearchConfig['embeddingFunction']) {
        if (!config) return undefined;

        // This would need to be implemented based on available embedding functions
        // For now, return undefined to use ChromaDB's default
        return undefined;
    }

    private flattenMetadata(metadata: Record<string, any>): Record<string, string | number | boolean | null> {
        const flattened: Record<string, string | number | boolean | null> = {};

        for (const [key, value] of Object.entries(metadata)) {
            if (value === null || value === undefined) {
                flattened[key] = null;
            } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                flattened[key] = value;
            } else if (typeof value === 'object') {
                // Convert objects to JSON strings for ChromaDB compatibility
                flattened[key] = JSON.stringify(value);
            } else {
                flattened[key] = String(value);
            }
        }

        return flattened;
    }

    async add(
        ids: string[],
        documents: string[],
        metadatas: Record<string, string | number | boolean | null>[],
    ): Promise<void> {
        try {
            const collection = await this.getCollection();

            // Flatten all metadata objects
            const flattenedMetadatas = metadatas.map((metadata) => this.flattenMetadata(metadata));

            await collection.add({
                ids,
                documents,
                metadatas: flattenedMetadatas,
            });
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to add documents to ChromaDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'add',
                    driver: 'chromadb',
                    originalError: error,
                },
            );
        }
    }

    async query(
        queryTexts: string[],
        limit: number,
        where?: Record<string, unknown>,
    ): Promise<{
        ids: string[][];
        documents: string[][];
        metadatas: (DualStoreMetadata | null)[][];
    }> {
        try {
            const collection = await this.getCollection();

            const query: any = {
                queryTexts,
                nResults: limit,
            };

            if (where) {
                query.where = where;
            }

            const result = await collection.query(query);

            // Convert ChromaDB metadata format back to DualStoreMetadata
            const metadatas = result.metadatas.map((metadataArray) =>
                metadataArray.map((metadata) => {
                    if (!metadata) return null;

                    // Try to parse JSON strings back to objects
                    const parsedMetadata: Record<string, any> = {};
                    for (const [key, value] of Object.entries(metadata)) {
                        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                            try {
                                parsedMetadata[key] = JSON.parse(value);
                            } catch {
                                parsedMetadata[key] = value;
                            }
                        } else {
                            parsedMetadata[key] = value;
                        }
                    }

                    return parsedMetadata;
                }),
            );

            return {
                ids: result.ids as string[][],
                documents: result.documents as string[][],
                metadatas,
            };
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to query ChromaDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'query',
                    driver: 'chromadb',
                    originalError: error,
                },
            );
        }
    }

    async get(ids: string[]): Promise<{
        ids: string[];
        metadatas: (DualStoreMetadata | null)[];
    }> {
        try {
            const collection = await this.getCollection();
            const result = await collection.get({ ids });

            // Convert ChromaDB metadata format back to DualStoreMetadata
            const metadatas = result.metadatas.map((metadata) => {
                if (!metadata) return null;

                const parsedMetadata: Record<string, any> = {};
                for (const [key, value] of Object.entries(metadata)) {
                    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                        try {
                            parsedMetadata[key] = JSON.parse(value);
                        } catch {
                            parsedMetadata[key] = value;
                        }
                    } else {
                        parsedMetadata[key] = value;
                    }
                }

                return parsedMetadata;
            });

            return {
                ids: result.ids,
                metadatas,
            };
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to get documents from ChromaDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'get',
                    driver: 'chromadb',
                    originalError: error,
                },
            );
        }
    }

    async retryVectorWrite(
        id: string,
        document: string,
        metadata: Record<string, string | number | boolean | null>,
        maxRetries: number = 3,
    ): Promise<boolean> {
        try {
            // Use the write queue for retry logic
            await this.writeQueue.add(id, document, metadata);
            return true;
        } catch (error) {
            throw new SemanticStoreError(
                `Failed to retry vector write in ChromaDB: ${error instanceof Error ? error.message : String(error)}`,
                {
                    operation: 'retryVectorWrite',
                    driver: 'chromadb',
                    documentId: id,
                    originalError: error,
                },
            );
        }
    }

    async cleanup(): Promise<void> {
        if (this.writeQueue) {
            await this.writeQueue.shutdown();
        }
        this.collection = undefined;
    }
}

/**
 * Factory for creating ChromaDB drivers
 */
export class ChromaDriverFactory {
    static readonly supportedTypes = ['chromadb'] as const;

    static validateConfig(config: VectorSearchConfig): boolean {
        return config.type === 'chromadb';
    }

    static async create(name: string, config: VectorSearchConfig): Promise<VectorSearchDriver> {
        if (!this.validateConfig(config)) {
            throw new SemanticStoreError('Invalid ChromaDB configuration', { driver: 'chromadb', operation: 'create' });
        }

        return new ChromaDriver(name, config);
    }
}
