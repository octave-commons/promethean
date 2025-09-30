import { SchemaRegistry } from './registry.js';
import type { EventRecord } from './types.js';

export type Upcaster = (event: Readonly<EventRecord>) => EventRecord;

type UpcastAccumulator = {
    readonly event: EventRecord;
    readonly halted: boolean;
};

const UPCAST_STATE = new WeakMap<UpcastChain, ReadonlyMap<string, ReadonlyMap<number, Upcaster>>>();

export class UpcastChain {
    constructor() {
        UPCAST_STATE.set(this, new Map());
    }

    #chains(): ReadonlyMap<string, ReadonlyMap<number, Upcaster>> {
        return UPCAST_STATE.get(this) ?? new Map();
    }

    add(topic: string, fromVersion: number, fn: Upcaster): void {
        const chains = this.#chains();
        const topicEntries = [...(chains.get(topic)?.entries() ?? [])].filter(([version]) => version !== fromVersion);
        const nextTopic = new Map<number, Upcaster>([...topicEntries, [fromVersion, fn]]);
        const chainEntries = [...chains.entries()].filter(([key]) => key !== topic);
        UPCAST_STATE.set(this, new Map<string, ReadonlyMap<number, Upcaster>>([...chainEntries, [topic, nextTopic]]));
    }

    toLatest(topic: string, event: Readonly<EventRecord>, reg: SchemaRegistry): EventRecord {
        const chain = this.#chains().get(topic);
        const latest = reg.latest(topic)?.version;

        if (!chain || latest == null) {
            return {
                ...event,
                ...(event.headers ? { headers: { ...event.headers } } : {}),
            };
        }

        const rawVersion = Number(event.headers?.['x-schema-version']);
        const startVersion = Number.isFinite(rawVersion) ? rawVersion : latest;

        const versions = Array.from({ length: Math.max(latest - startVersion, 0) }, (_, idx) => startVersion + idx);

        const { event: upcasted } = versions.reduce<UpcastAccumulator>(
            (acc: UpcastAccumulator, version: number) => {
                if (acc.halted) {
                    return acc;
                }

                const step = chain.get(version);
                if (!step) {
                    return { ...acc, halted: true };
                }

                return { event: step(acc.event), halted: false };
            },
            { event: { ...event, headers: { ...(event.headers ?? {}) } }, halted: false },
        );

        return {
            ...upcasted,
            headers: {
                ...(upcasted.headers ?? {}),
                'x-schema-version': String(latest),
            },
        };
    }
}
