import { WebSocketServer, WebSocket } from 'ws';

// loosen typing to avoid cross-package type coupling
import { makeConnLimiter, makeTopicLimiter } from './server.rate.js';
// token bucket provided at runtime

export type AuthResult = { ok: true; subScopes?: string[] } | { ok: false; code: string; msg: string };
export type AuthFn = (token: string | undefined) => Promise<AuthResult>;

type Inflight = { event: any; deadline: number; attempt: number };

export type WSGatewayOptions = {
    auth?: AuthFn;
    ackTimeoutMs?: number; // default 30s
    maxInflightPerSub?: number; // default 100
    log?: (...args: any[]) => void;
};

export function startWSGateway(bus: any, port: number, opts: WSGatewayOptions = {}) {
    const wss = new WebSocketServer({ port });
    const log = opts.log ?? (() => {});
    void log;
    const ackTimeout = opts.ackTimeoutMs ?? 30_000;
    const maxInflight = opts.maxInflightPerSub ?? 100;

    type SubKey = string; // `${topic}::${group}`
    type SubState = {
        stop?: () => Promise<void>;
        inflight: Map<string, Inflight>;
        manualAck: boolean;
    };

    wss.on('connection', (ws: WebSocket) => {
        let authed = false;
        const subs = new Map<SubKey, SubState>();
        const inboundLimiter = makeConnLimiter();
        const outboundLimiter = makeConnLimiter();
        const topicLimiters = new Map<string, any>();

        const safeSend = (obj: any) => {
            if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
        };

        // Lease sweeper
        const sweep = setInterval(
            () => {
                for (const [_k, s] of subs) {
                    for (const [id, infl] of s.inflight) {
                        if (Date.now() > infl.deadline) {
                            // lease expired: drop from inflight; the bus cursor hasn’t advanced so it will redeliver soon
                            s.inflight.delete(id);
                        }
                    }
                }
            },
            Math.min(ackTimeout, 5_000),
        );

        ws.on('message', async (raw) => {
            let msg: any;
            try {
                msg = JSON.parse(raw.toString());
            } catch {
                return safeSend({ op: 'ERR', code: 'bad_json', msg: 'Invalid JSON' });
            }

            const corr = msg.corr;
            const err = (code: string, m: string) => safeSend({ op: 'ERR', code, msg: m, corr });

            // AUTH
            if (msg.op === 'AUTH') {
                const a: AuthResult = await (opts.auth?.(msg.token) ?? Promise.resolve({ ok: true } as AuthResult));
                if (!a.ok) {
                    const { code, msg } = a as { ok: false; code: string; msg: string };
                    return err(code, msg);
                }
                authed = true;
                return safeSend({ op: 'OK', corr });
            }

            if (!authed) return err('unauthorized', 'Call AUTH first.');

            // PUBLISH
            if (msg.op === 'PUBLISH') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn publish rate exceeded');
                const tl =
                    topicLimiters.get(msg.topic) ??
                    (topicLimiters.set(msg.topic, makeTopicLimiter(msg.topic)), topicLimiters.get(msg.topic)!);
                if (!tl.tryConsume(1)) return err('rate_limited', 'topic publish rate exceeded');
                try {
                    const rec = await bus.publish(msg.topic, msg.payload, msg.opts);
                    return safeSend({ op: 'OK', corr, id: rec.id });
                } catch (e: any) {
                    return err('publish_failed', e.message ?? String(e));
                }
            }

            // SUBSCRIBE
            if (msg.op === 'SUBSCRIBE') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn subscribe rate exceeded');
                const { topic, group, opts: subOpts = {} } = msg;
                const key: SubKey = `${topic}::${group}`;
                // prevent duplicate sub
                if (subs.has(key)) {
                    return err('already_subscribed', `${key}`);
                }
                const state: SubState = { inflight: new Map(), manualAck: true };
                subs.set(key, state);

                const stop = await bus.subscribe(
                    topic,
                    group,
                    async (e: any, ctx: any) => {
                        // backpressure
                        if (state.inflight.size >= maxInflight) return; // drop; will redeliver later
                        if (!outboundLimiter.tryConsume(1)) return; // slow push if client is hot
                        // dedupe if same id still inflight
                        if (state.inflight.has(e.id)) return;

                        const deadline = Date.now() + (subOpts.ackTimeoutMs ?? ackTimeout);
                        state.inflight.set(e.id, {
                            event: e,
                            deadline,
                            attempt: ctx.attempt ?? 1,
                        });

                        safeSend({
                            op: 'EVENT',
                            topic,
                            group,
                            event: e,
                            ctx: {
                                attempt: ctx.attempt ?? 1,
                                ack_deadline_ms: deadline - Date.now(),
                            },
                        });
                    },
                    { ...subOpts, manualAck: true },
                );
                state.stop = stop;
                return safeSend({ op: 'OK', corr });
            }

            // UNSUBSCRIBE
            if (msg.op === 'UNSUBSCRIBE') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn unsubscribe rate exceeded');
                const key: SubKey = `${msg.topic}::${msg.group}`;
                const s = subs.get(key);
                if (!s) return err('not_subscribed', key);
                await s.stop?.();
                subs.delete(key);
                return safeSend({ op: 'OK', corr });
            }

            // ACK / NACK / MODACK
            if (msg.op === 'ACK' || msg.op === 'NACK' || msg.op === 'MODACK') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn ack rate exceeded');
                const key: SubKey = `${msg.topic}::${msg.group}`;
                const s = subs.get(key);
                if (!s) return err('not_subscribed', key);

                const infl = s.inflight.get(msg.id);
                if (!infl) {
                    if (msg.op === 'MODACK') return err('unknown_id', 'no inflight to extend');
                    // benign for ACK/NACK of already-cleared IDs
                    return safeSend({ op: 'OK', corr });
                }

                if (msg.op === 'MODACK') {
                    infl.deadline = Date.now() + Math.max(1000, Number(msg.extend_ms) || ackTimeout);
                    return safeSend({ op: 'OK', corr });
                }

                // clear inflight first
                s.inflight.delete(msg.id);
                try {
                    if (msg.op === 'ACK') await bus.ack(msg.topic, msg.group, msg.id);
                    else await bus.nack(msg.topic, msg.group, msg.id, msg.reason);
                    safeSend({ op: 'OK', corr });
                } catch (e: any) {
                    return err('ack_failed', e.message ?? String(e));
                }
            }
        });

        ws.on('close', async () => {
            clearInterval(sweep);
            for (const [_k, s] of subs) await s.stop?.();
            subs.clear();
        });
    });

    return wss;
}
