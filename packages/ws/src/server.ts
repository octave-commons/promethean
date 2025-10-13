import { WebSocketServer, WebSocket } from 'ws';

// loosen typing to avoid cross-package type coupling
import { makeConnLimiter, makeTopicLimiter } from './server.rate.js';
import { TokenBucket } from '@promethean/monitoring';
// token bucket provided at runtime

export type AuthResult = { ok: true; subScopes?: string[] } | { ok: false; code: string; msg: string };
export type AuthFn = (token: string | undefined) => Promise<AuthResult>;

export type BusRecord = { id: string };
export type BusEvent = unknown;
export type BusContext = { attempt?: number };
export type BusPublishOptions = unknown;

export interface MessageBus {
    publish(topic: string, payload: unknown, opts?: BusPublishOptions): Promise<BusRecord>;
    subscribe(
        topic: string,
        group: string,
        handler: (event: BusEvent, ctx: BusContext) => Promise<void> | void,
        opts?: { manualAck?: boolean },
    ): Promise<() => Promise<void>>;
    ack(topic: string, group: string, id: string): Promise<void>;
    nack(topic: string, group: string, id: string, reason?: string): Promise<void>;
}

export type WSMessage = {
    op: string;
    corr?: string;
    token?: string;
    topic?: string;
    group?: string;
    payload?: unknown;
    opts?: BusPublishOptions;
    id?: string;
    reason?: string;
    extend_ms?: number;
    ackTimeoutMs?: number;
};

type Inflight = { event: unknown; deadline: number; attempt: number };

export type WSGatewayOptions = {
    auth?: AuthFn;
    ackTimeoutMs?: number; // default 30s
    maxInflightPerSub?: number; // default 100
    log?: (...args: unknown[]) => void;
};

export function startWSGateway(bus: MessageBus, port: number, opts: WSGatewayOptions = {}) {
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
        const topicLimiters = new Map<string, TokenBucket>();

        const safeSend = (obj: unknown) => {
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
            let msg: unknown;
            try {
                msg = JSON.parse(raw.toString());
            } catch {
                return safeSend({ op: 'ERR', code: 'bad_json', msg: 'Invalid JSON' });
            }

            // Validate message structure
            if (!msg || typeof msg !== 'object' || !('op' in msg) || typeof msg.op !== 'string') {
                return safeSend({ op: 'ERR', code: 'invalid_message', msg: 'Invalid message format' });
            }

            const wsMsg = msg as WSMessage;

            const corr = wsMsg.corr;
            const err = (code: string, m: string) => safeSend({ op: 'ERR', code, msg: m, corr });

            // AUTH
            if (wsMsg.op === 'AUTH') {
                const a: AuthResult = await (opts.auth?.(wsMsg.token) ?? Promise.resolve({ ok: true } as AuthResult));
                if (!a.ok) {
                    const { code, msg } = a as { ok: false; code: string; msg: string };
                    return err(code, msg);
                }
                authed = true;
                return safeSend({ op: 'OK', corr });
            }

            if (!authed) return err('unauthorized', 'Call AUTH first.');

            // PUBLISH
            if (wsMsg.op === 'PUBLISH') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn publish rate exceeded');
                if (!wsMsg.topic) return err('invalid_topic', 'Topic is required');
                const tl =
                    topicLimiters.get(wsMsg.topic) ??
                    (topicLimiters.set(wsMsg.topic, makeTopicLimiter(wsMsg.topic)), topicLimiters.get(wsMsg.topic)!);
                if (!tl.tryConsume(1)) return err('rate_limited', 'topic publish rate exceeded');
                try {
                    const rec = await bus.publish(wsMsg.topic, wsMsg.payload, wsMsg.opts);
                    return safeSend({ op: 'OK', corr, id: rec.id });
                } catch (e: any) {
                    return err('publish_failed', e.message ?? String(e));
                }
            }

            // SUBSCRIBE
            if (wsMsg.op === 'SUBSCRIBE') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn subscribe rate exceeded');
                if (!wsMsg.topic || !wsMsg.group) return err('invalid_params', 'Topic and group are required');
                const { topic, group } = wsMsg;
                const subOpts = wsMsg.opts as Record<string, unknown> | undefined;
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
                    async (e: BusEvent, ctx: BusContext) => {
                        // backpressure
                        if (state.inflight.size >= maxInflight) return; // drop; will redeliver later
                        if (!outboundLimiter.tryConsume(1)) return; // slow push if client is hot
                        // dedupe if same id still inflight
                        if (state.inflight.has((e as any).id)) return;

                        const deadline = Date.now() + ((subOpts?.ackTimeoutMs as number) ?? ackTimeout);
                        state.inflight.set((e as any).id, {
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
                    { ...(subOpts || {}), manualAck: true },
                );
                state.stop = stop;
                return safeSend({ op: 'OK', corr });
            }

            // UNSUBSCRIBE
            if (wsMsg.op === 'UNSUBSCRIBE') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn unsubscribe rate exceeded');
                if (!wsMsg.topic || !wsMsg.group) return err('invalid_params', 'Topic and group are required');
                const key: SubKey = `${wsMsg.topic}::${wsMsg.group}`;
                const s = subs.get(key);
                if (!s) return err('not_subscribed', key);
                await s.stop?.();
                subs.delete(key);
                return safeSend({ op: 'OK', corr });
            }

            // ACK / NACK / MODACK
            if (wsMsg.op === 'ACK' || wsMsg.op === 'NACK' || wsMsg.op === 'MODACK') {
                if (!inboundLimiter.tryConsume(1)) return err('rate_limited', 'conn ack rate exceeded');
                if (!wsMsg.topic || !wsMsg.group) return err('invalid_params', 'Topic and group are required');
                const key: SubKey = `${wsMsg.topic}::${wsMsg.group}`;
                const s = subs.get(key);
                if (!s) return err('not_subscribed', key);

                if (!wsMsg.id) return err('invalid_params', 'Message ID is required');
                const infl = s.inflight.get(wsMsg.id);
                if (!infl) {
                    if (wsMsg.op === 'MODACK') return err('unknown_id', 'no inflight to extend');
                    // benign for ACK/NACK of already-cleared IDs
                    return safeSend({ op: 'OK', corr });
                }

                if (wsMsg.op === 'MODACK') {
                    infl.deadline = Date.now() + Math.max(1000, Number(wsMsg.extend_ms) || ackTimeout);
                    return safeSend({ op: 'OK', corr });
                }

                // clear inflight first
                s.inflight.delete(wsMsg.id);
                try {
                    if (wsMsg.op === 'ACK') await bus.ack(wsMsg.topic, wsMsg.group, wsMsg.id);
                    else await bus.nack(wsMsg.topic, wsMsg.group, wsMsg.id, wsMsg.reason);
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
