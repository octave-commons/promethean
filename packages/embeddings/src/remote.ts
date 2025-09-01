import type { EmbeddingFunction, EmbeddingFunctionSpace } from 'chromadb';
import { BrokerClient } from '@promethean/legacy/brokerClient.js';
import { randomUUID } from 'node:crypto';

export type RemoteEmbeddingOptions = {
    brokerUrl?: string;
    driver?: string;
    fn?: string;
    broker?: BrokerClient;
    clientIdPrefix?: string; // e.g., 'cephalon-embed' | 'discord-embed'
    timeoutMs?: number;
};

// Shared RemoteEmbeddingFunction that requests vectors via the message broker.
export class RemoteEmbeddingFunction implements EmbeddingFunction {
    name = 'remote';
    driver: string | undefined;
    fn: string | undefined;
    broker: BrokerClient;
    #ready: Promise<void>;
    #pending: {
        resolve: (embeddings: number[][]) => void;
        reject: (err: unknown) => void;
    }[] = [];
    #replyId: string;
    timeoutMs: number;

    constructor(
        brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
        driver = process.env.EMBEDDING_DRIVER,
        fn = process.env.EMBEDDING_FUNCTION,
        broker?: BrokerClient,
        clientIdPrefix = 'embed',
        timeoutMs = Number(process.env.EMBEDDING_TIMEOUT_MS) || 10000,
    ) {
        this.driver = driver;
        this.fn = fn;
        this.#replyId = randomUUID();
        this.timeoutMs = timeoutMs;
        this.broker =
            broker ||
            new BrokerClient({
                url: brokerUrl,
                id: `${clientIdPrefix}-${this.#replyId}`,
            });
        this.#ready = this.broker
            .connect()
            .then(() => {
                this.broker.subscribe(
                    'embedding.result',
                    (event: { replyTo: string; payload: { embeddings: number[][] } }) => {
                        if (event.replyTo !== this.#replyId) return;
                        const pending = this.#pending.shift();
                        if (pending) pending.resolve(event.payload.embeddings);
                    },
                );
            })
            .catch((err: unknown) => {
                const error = new Error('Failed to connect to broker', { cause: err });
                this.#pending.forEach((p) => {
                    p.reject(error);
                });
                this.#pending = [];
                throw error;
            });
    }

    static fromConfig(cfg: {
        driver: string;
        fn: string;
        brokerUrl?: string;
        clientIdPrefix?: string;
        timeoutMs?: number;
    }): RemoteEmbeddingFunction {
        return new RemoteEmbeddingFunction(
            cfg.brokerUrl,
            cfg.driver,
            cfg.fn,
            undefined,
            cfg.clientIdPrefix,
            cfg.timeoutMs,
        );
    }

    async generate(texts: Array<string | { type: string; data: string }>): Promise<number[][]> {
        const items = texts.map((t) => (typeof t === 'string' ? { type: 'text', data: t } : t));
        await this.#ready;
        let pending:
            | {
                  resolve: (embeddings: number[][]) => void;
                  reject: (err: unknown) => void;
              }
            | undefined;
        const requestPromise = new Promise<number[][]>((resolve, reject) => {
            pending = {
                resolve: (embeddings) => resolve(embeddings),
                reject: (err) => reject(err),
            };
            this.#pending.push(pending);
            this.broker.enqueue('embedding.generate', {
                items,
                driver: this.driver,
                function: this.fn,
                replyTo: this.#replyId,
            });
        });
        const timeoutPromise = new Promise<number[][]>((_, reject) => {
            const timeoutId = setTimeout(() => {
                if (pending) {
                    const idx = this.#pending.indexOf(pending);
                    if (idx !== -1) this.#pending.splice(idx, 1);
                }
                reject(new Error('Embedding request timed out'));
            }, this.timeoutMs);
            requestPromise.finally(() => clearTimeout(timeoutId)).catch(() => {});
        });
        return Promise.race([requestPromise, timeoutPromise]);
    }

    defaultSpace(): EmbeddingFunctionSpace {
        return 'l2';
    }

    supportedSpaces(): EmbeddingFunctionSpace[] {
        return ['l2', 'cosine'];
    }

    getConfig() {
        return {};
    }
}
