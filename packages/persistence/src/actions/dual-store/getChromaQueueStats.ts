export function getChromaQueueStats(): {
    queueLength: number;
    processing: boolean;
    config: {
        batchSize: number;
        flushIntervalMs: number;
        maxRetries: number;
        retryDelayMs: number;
        enabled: boolean;
    };
} {
    return this.chromaWriteQueue.getQueueStats();
}
