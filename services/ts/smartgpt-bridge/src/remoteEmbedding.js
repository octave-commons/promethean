// Promethean RemoteEmbeddingFunction wrapper (ESM)
import { randomUUID } from 'crypto';

const SHARED_IMPORT = process.env.SHARED_IMPORT || '@shared/js/brokerClient.js';

let BrokerClientMod = null;
async function getBrokerClient() {
    if (!BrokerClientMod) {
        BrokerClientMod = await import(SHARED_IMPORT);
    }
    return BrokerClientMod.default || BrokerClientMod.BrokerClient || BrokerClientMod;
}

export class RemoteEmbeddingFunction {
    constructor(
        brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
        driver = process.env.EMBEDDING_DRIVER,
        fn = process.env.EMBEDDING_FUNCTION,
        brokerInstance,
    ) {
        this.name = 'remote';
        this.driver = driver;
        this.fn = fn;
        this._pending = [];
        this._replyId = randomUUID();
        this._ready = (async () => {
            const BrokerClient = await getBrokerClient();
            this.broker =
                brokerInstance ||
                new BrokerClient({
                    url: brokerUrl,
                    id: `smartgpt-embed-${this._replyId}`,
                });
            await this.broker.connect();
            const unsub = this.broker.subscribe('embedding.result', (event) => {
                if (event.replyTo !== this._replyId) return;
                const resolve = this._pending.shift();
                if (resolve) resolve(event.payload.embeddings);
            });
            this._unsubscribe = typeof unsub === 'function' ? unsub : null;
        })();
    }

    async generate(texts) {
        const items = texts.map((t) =>
            String(t).startsWith('img:')
                ? { type: 'image_url', data: String(t).slice(4) }
                : { type: 'text', data: String(t) },
        );
        await this._ready;
        const timeoutMs = Number(process.env.EMBEDDING_TIMEOUT_MS || 30000);
        return new Promise((resolve, reject) => {
            let settled = false;
            const onResolve = (emb) => {
                if (!settled) {
                    settled = true;
                    clearTimeout(timer);
                    resolve(emb);
                }
            };
            const onReject = (err) => {
                if (!settled) {
                    settled = true;
                    clearTimeout(timer);
                    reject(err);
                }
            };
            const timer = setTimeout(() => onReject(new Error('embedding timeout')), timeoutMs);
            this._pending.push(onResolve);
            try {
                this.broker.enqueue('embedding.generate', {
                    items,
                    driver: this.driver,
                    function: this.fn,
                    replyTo: this._replyId,
                });
            } catch (e) {
                onReject(e);
            }
        });
    }

    defaultSpace() {
        return 'l2';
    }
    supportedSpaces() {
        return ['l2', 'cosine'];
    }
    static fromConfig(cfg) {
        return new RemoteEmbeddingFunction(cfg.brokerUrl, cfg.driver, cfg.fn);
    }

    dispose() {
        try {
            this._unsubscribe && this._unsubscribe();
        } catch {}
        try {
            this.broker?.disconnect?.();
        } catch {}
    }
}
