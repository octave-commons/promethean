// SPDX-License-Identifier: GPL-3.0-only
// loose typing
import type { defineAgentComponents } from '../components';

export function enqueueUtterance(
    w: any,
    agent: any,
    C: ReturnType<typeof import('../components').defineAgentComponents>,
    rawOpts: {
        id?: string;
        priority?: number;
        group?: string;
        bargeIn?: 'none' | 'duck' | 'pause' | 'stop';
        factory: () => Promise<any>;
    },
) {
    const { Turn, PlaybackQ, Utterance, AudioRes, Policy } = C as ReturnType<typeof defineAgentComponents>;
    const defaultBarge = (w.get(agent, Policy)?.defaultBargeIn ?? 'pause') as 'none' | 'duck' | 'pause' | 'stop';
    const opts = {
        id: rawOpts?.id,
        priority: rawOpts?.priority ?? 1,
        group: rawOpts?.group,
        bargeIn: rawOpts?.bargeIn ?? defaultBarge,
        factory: rawOpts?.factory,
    };

    if (typeof opts.factory !== 'function') {
        console.warn('[enqueueUtterance] missing factory; dropping', { rawOpts });
        return; // or throw if you want hard fail
    }

    const turnId = w.get(agent, Turn)?.id || 0;
    const pq = w.get(agent, PlaybackQ) ?? { items: [] as number[] };

    if (opts.group) {
        for (const uEid of pq.items) {
            const u = w.get(uEid, Utterance)!;
            if (u && u.group === opts.group && u.status === 'queued' && u.priority <= (opts.priority ?? 1)) {
                const cancelled: typeof u = { ...u, status: 'cancelled' };
                w.set(uEid, Utterance, cancelled);
            }
        }
    }

    const e = w.createEntity();
    // ---- create utterance entity
    const utt = {
        id: opts.id ?? globalThis.crypto?.randomUUID?.() ?? String(Math.random()),
        turnId,
        priority: opts.priority,
        group: opts.group, // may be undefined, fine
        bargeIn: opts.bargeIn,
        status: 'queued' as const,
        token: Math.floor(Math.random() * 1e9),
    };
    w.addComponent(e, Utterance, utt);
    w.addComponent(e, AudioRes, { factory: opts.factory });

    // ---- append immutably to next buffer
    const currentQ = w.get(agent, PlaybackQ) ?? { items: [] as number[] };
    console.log('adding utterance to queue', currentQ.items, e, 'agent', agent);
    w.set(agent, PlaybackQ, { items: [...currentQ.items, e] });
}
