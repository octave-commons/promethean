import WebSocket from 'ws';

export type Handler = (event: any, ctx: { attempt: number; ack_deadline_ms: number }) => Promise<void> | void;

export class EventClient {
    private ws: WebSocket;
    private pending = new Map<string, (ok: boolean, payload?: any) => void>();
    private handlers = new Map<string, Handler>(); // key = `${topic}::${group}`

    constructor(url: string, token?: string) {
        // Prevent misuse of this client for the broker
        if (process.env.BROKER_WS_URL && url.startsWith(process.env.BROKER_WS_URL)) {
            throw new Error(
                'Do not use ws/client to talk to the broker. Use @promethean/legacy/brokerClient.js (or AgentBus wrapping it).',
            );
        }
        this.ws = new WebSocket(url);
        this.ws.on('open', () => {
            this.send({ op: 'AUTH', token }, true);
        });
        this.ws.on('message', (raw) => this.onMessage(raw.toString()));
    }

    private send(obj: any, wait = false): Promise<any> | void {
        if (!wait) return this.ws.send(JSON.stringify(obj));
        const corr = Math.random().toString(16).slice(2);
        obj.corr = corr;
        this.ws.send(JSON.stringify(obj));
        return new Promise((resolve, reject) => {
            this.pending.set(corr, (ok, payload) => (ok ? resolve(payload) : reject(payload)));
            setTimeout(() => {
                if (this.pending.delete(corr)) reject(new Error('timeout'));
            }, 15_000);
        });
    }

    private async onMessage(s: string) {
        const msg = JSON.parse(s);
        if (msg.op === 'OK' || msg.op === 'ERR') {
            const cb = this.pending.get(msg.corr);
            if (typeof cb === 'function') {
                this.pending.delete(msg.corr);
                return cb(msg.op === 'OK', msg);
            }
            this.pending.delete(msg.corr);
        }
        if (msg.op === 'EVENT') {
            const key = `${msg.topic}::${msg.group}`;
            const h = this.handlers.get(key);
            if (typeof h !== 'function') {
                this.handlers.delete(key);
                return;
            }
            try {
                await h(msg.event, msg.ctx);
                // default: immediate ack
                this.send({
                    op: 'ACK',
                    topic: msg.topic,
                    group: msg.group,
                    id: msg.event.id,
                });
            } catch (e: any) {
                this.send({
                    op: 'NACK',
                    topic: msg.topic,
                    group: msg.group,
                    id: msg.event.id,
                    reason: e.message ?? String(e),
                });
            }
        }
    }

    async publish(topic: string, payload: any, opts?: any) {
        return this.send({ op: 'PUBLISH', topic, payload, opts }, true);
    }

    async subscribe(topic: string, group: string, handler: Handler, opts?: any) {
        if (typeof handler !== 'function') {
            throw new TypeError('handler must be a function');
        }
        this.handlers.set(`${topic}::${group}`, handler);
        return this.send({ op: 'SUBSCRIBE', topic, group, opts }, true);
    }

    async unsubscribe(topic: string, group: string) {
        this.handlers.delete(`${topic}::${group}`);
        return this.send({ op: 'UNSUBSCRIBE', topic, group }, true);
    }

    modAck(topic: string, group: string, id: string, extend_ms: number) {
        this.send({ op: 'MODACK', topic, group, id, extend_ms });
    }
}
