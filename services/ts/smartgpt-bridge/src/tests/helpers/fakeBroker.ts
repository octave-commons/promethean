// @ts-nocheck
export default class FakeBroker {
    constructor(opts) {
        this.opts = opts;
        this.handlers = new Map();
    }
    async connect() {
        /* no-op */
    }
    subscribe(topic, cb) {
        if (!this.handlers.has(topic)) this.handlers.set(topic, new Set());
        this.handlers.get(topic).add(cb);
        return () => {
            this.handlers.get(topic)?.delete(cb);
        };
    }
    enqueue(topic, payload) {
        if (topic === 'embedding.generate') {
            const replyTo = payload.replyTo;
            const n = (payload.items || []).length;
            const embeddings = Array.from({ length: n }, () => [0.1, 0.2, 0.3]);
            const ev = { replyTo, payload: { embeddings } };
            const subs = this.handlers.get('embedding.result') || new Set();
            for (const cb of subs) {
                try {
                    cb(ev);
                } catch {}
            }
        }
    }
    disconnect() {
        this.handlers.clear();
    }
}
