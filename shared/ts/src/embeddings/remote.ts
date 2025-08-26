import type { EmbeddingFunction, EmbeddingFunctionSpace } from 'chromadb';
// @ts-ignore import js module without types
import { BrokerClient } from '@shared/js/brokerClient.js';
import { randomUUID } from 'crypto';

export type RemoteEmbeddingOptions = {
    brokerUrl?: string;
    driver?: string;
    fn?: string;
    broker?: BrokerClient;
    clientIdPrefix?: string; // e.g., 'cephalon-embed' | 'discord-embed'
};

// Shared RemoteEmbeddingFunction that requests vectors via the message broker.
export class RemoteEmbeddingFunction implements EmbeddingFunction {
    name = 'remote';
    driver: string | undefined;
    fn: string | undefined;
    broker: BrokerClient;
    #ready: Promise<void>;
    #pending: ((embeddings: number[][]) => void)[] = [];
    #replyId: string;

    constructor(
        brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
        driver = process.env.EMBEDDING_DRIVER,
        fn = process.env.EMBEDDING_FUNCTION,
        broker?: BrokerClient,
        clientIdPrefix = 'embed',
    ) {
        this.driver = driver;
        this.fn = fn;
        this.#replyId = randomUUID();
        this.broker =
            broker ||
            new BrokerClient({
                url: brokerUrl,
                id: `${clientIdPrefix}-${this.#replyId}`,
            });
        this.#ready = this.broker
            .connect()
            .then(() => {
                this.broker.subscribe('embedding.result', (event: any) => {
                    if (event.replyTo !== this.#replyId) return;
                    const resolve = this.#pending.shift();
                    if (resolve) resolve(event.payload.embeddings);
                });
            })
            .catch((err: unknown) => {
                console.error('Failed to connect to broker', err);
            });
    }

    static fromConfig(cfg: {
        driver: string;
        fn: string;
        brokerUrl?: string;
        clientIdPrefix?: string;
    }): RemoteEmbeddingFunction {
        return new RemoteEmbeddingFunction(cfg.brokerUrl, cfg.driver, cfg.fn, undefined, cfg.clientIdPrefix);
    }

    async generate(texts: Array<string | { type: string; data: string }>): Promise<number[][]> {
        const items = texts.map((t) => (typeof t === 'string' ? { type: 'text', data: t } : t));
        await this.#ready;
        return new Promise((resolve) => {
            this.#pending.push(resolve);
            this.broker.enqueue('embedding.generate', {
                items,
                driver: this.driver,
                function: this.fn,
                replyTo: this.#replyId,
            });
        });
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
