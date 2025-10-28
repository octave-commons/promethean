import type { Collection as ChromaCollection } from 'chromadb';
interface WriteQueueConfig {
    batchSize: number;
    flushIntervalMs: number;
    maxRetries: number;
    retryDelayMs: number;
    enabled: boolean;
}
export declare class ChromaWriteQueue {
    private queue;
    private processing;
    private flushTimer;
    private chromaCollection;
    private config;
    constructor(chromaCollection: ChromaCollection, config?: Partial<WriteQueueConfig>);
    private startFlushTimer;
    add(id: string, document: string, metadata: Record<string, string | number | boolean | null>): Promise<void>;
    private flush;
    forceFlush(): Promise<void>;
    getQueueStats(): {
        queueLength: number;
        processing: boolean;
        config: WriteQueueConfig;
    };
    shutdown(): Promise<void>;
    updateConfig(newConfig: Partial<WriteQueueConfig>): void;
}
export declare const getOrCreateQueue: (collectionName: string, chromaCollection: ChromaCollection, config?: Partial<WriteQueueConfig>) => ChromaWriteQueue;
export declare const shutdownAllQueues: () => Promise<void>;
export {};
//# sourceMappingURL=chroma-write-queue.d.ts.map