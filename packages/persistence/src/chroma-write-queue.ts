import type { Collection as ChromaCollection } from 'chromadb';

interface QueuedWrite {
    id: string;
    document: string;
    metadata: Record<string, string | number | boolean | null>;
    resolve: () => void;
    reject: (error: Error) => void;
    timestamp: number;
    retryCount?: number;
}

interface WriteQueueConfig {
    batchSize: number;
    flushIntervalMs: number;
    maxRetries: number;
    retryDelayMs: number;
    enabled: boolean;
}

export class ChromaWriteQueue {
    private queue: QueuedWrite[] = [];
    private processing = false;
    private flushTimer: NodeJS.Timeout | null = null;
    private chromaCollection: ChromaCollection;
    private config: WriteQueueConfig;

    constructor(chromaCollection: ChromaCollection, config: Partial<WriteQueueConfig> = {}) {
        this.chromaCollection = chromaCollection;
        this.config = {
            batchSize: 10,
            flushIntervalMs: 1000,
            maxRetries: 3,
            retryDelayMs: 2000,
            enabled: true,
            ...config,
        };

        // Start periodic flush
        this.startFlushTimer();
    }

    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            if (this.queue.length > 0) {
                this.flush().catch((error) => {
                    console.error('[ChromaWriteQueue] Error in periodic flush:', error);
                });
            }
        }, this.config.flushIntervalMs);
    }

    async add(id: string, document: string, metadata: Record<string, string | number | boolean | null>): Promise<void> {
        if (!this.config.enabled) {
            // If queue is disabled, write directly
            await this.chromaCollection.add({
                ids: [id],
                documents: [document],
                metadatas: [metadata],
            });
            return;
        }

        return new Promise<void>((resolve, reject) => {
            const write: QueuedWrite = {
                id,
                document,
                metadata,
                resolve,
                reject,
                timestamp: Date.now(),
                retryCount: 0,
            };

            this.queue.push(write);

            // Auto-flush if batch size reached
            if (this.queue.length >= this.config.batchSize) {
                this.flush().catch((error) => {
                    console.error('[ChromaWriteQueue] Error in auto-flush:', error);
                });
            }
        });
    }

    private async flush(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        try {
            // Process in batches to avoid overwhelming ChromaDB
            const batch = this.queue.splice(0, this.config.batchSize);

            if (batch.length === 0) {
                return;
            }

            const ids = batch.map((write) => write.id);
            const documents = batch.map((write) => write.document);
            const metadatas = batch.map((write) => write.metadata);

            try {
                await this.chromaCollection.add({
                    ids,
                    documents,
                    metadatas,
                });

                // Resolve all promises in the batch
                batch.forEach((write) => write.resolve());

                console.log(`[ChromaWriteQueue] Successfully batched ${batch.length} writes`);
            } catch (error) {
                const chromaError = error instanceof Error ? error : new Error(String(error));

                // Handle retries for failed writes
                const retryableWrites: QueuedWrite[] = [];

                for (const write of batch) {
                    const currentRetryCount = write.retryCount || 0;
                    write.retryCount = currentRetryCount + 1;

                    if (write.retryCount <= this.config.maxRetries) {
                        retryableWrites.push(write);
                    } else {
                        // Max retries exceeded, reject the promise
                        write.reject(chromaError);
                        console.error(
                            `[ChromaWriteQueue] Max retries exceeded for write ${write.id}:`,
                            chromaError.message,
                        );
                    }
                }

                // Re-queue retryable writes with delay
                if (retryableWrites.length > 0) {
                    const firstRetry = retryableWrites[0];
                    const retryCount = firstRetry?.retryCount || 1;
                    setTimeout(
                        () => {
                            this.queue.unshift(...retryableWrites);
                        },
                        this.config.retryDelayMs * Math.pow(2, retryCount - 1),
                    ); // Exponential backoff
                }
            }
        } finally {
            this.processing = false;
        }
    }

    async forceFlush(): Promise<void> {
        await this.flush();
    }

    getQueueStats(): {
        queueLength: number;
        processing: boolean;
        config: WriteQueueConfig;
    } {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            config: { ...this.config },
        };
    }

    async shutdown(): Promise<void> {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        // Flush remaining writes
        await this.forceFlush();

        // Reject any remaining writes
        const remaining = this.queue.splice(0);
        remaining.forEach((write) => {
            write.reject(new Error('ChromaWriteQueue shutdown - write cancelled'));
        });
    }

    updateConfig(newConfig: Partial<WriteQueueConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // Restart timer if interval changed
        if (newConfig.flushIntervalMs) {
            this.startFlushTimer();
        }
    }
}

// Global queue instances per collection
const queueInstances = new Map<string, ChromaWriteQueue>();

export const getOrCreateQueue = (
    collectionName: string,
    chromaCollection: ChromaCollection,
    config?: Partial<WriteQueueConfig>,
): ChromaWriteQueue => {
    let queue = queueInstances.get(collectionName);

    if (!queue) {
        queue = new ChromaWriteQueue(chromaCollection, config);
        queueInstances.set(collectionName, queue);
    }

    return queue;
};

export const shutdownAllQueues = async (): Promise<void> => {
    const shutdownPromises = Array.from(queueInstances.values()).map((queue) => queue.shutdown());
    await Promise.all(shutdownPromises);
    queueInstances.clear();
};
