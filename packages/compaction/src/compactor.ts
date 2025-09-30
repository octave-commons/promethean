// Module types resolved at runtime; loosen compile-time types here

import type { EventRecord, PublishOptions } from '@promethean/event/types.js';
import type { ReadonlyDeep } from 'type-fest';

type SnapshotRecord = ReadonlyDeep<Partial<EventRecord> & { readonly payload?: unknown }>;

type SnapshotMessage = {
    readonly key: string;
    readonly payload: unknown;
    readonly ts: number;
};

export type CompactorStore = {
    readonly latestByKey: (
        topic: string,
        keys: ReadonlyArray<string>,
    ) => Promise<ReadonlyDeep<Record<string, SnapshotRecord | undefined>>>;
};

export type CompactorBus = {
    readonly publish: <T>(topic: string, payload: ReadonlyDeep<T>, opts?: PublishOptions) => Promise<unknown>;
};

export type CompactorOptions = {
    readonly topic: string;
    readonly snapshotTopic: string;
    readonly keySource?: (record: SnapshotRecord) => string | undefined;
    readonly intervalMs?: number;
    readonly batchKeys?: ReadonlyArray<string>;
};

const deriveKey = (recordKey: string, record: SnapshotRecord, keySource?: CompactorOptions['keySource']) =>
    keySource?.(record) ?? record.key ?? recordKey;

const toSnapshotEntries = (
    latest: ReadonlyDeep<Record<string, SnapshotRecord | undefined>>,
    keySource: CompactorOptions['keySource'],
): ReadonlyArray<SnapshotMessage> =>
    (Object.entries(latest) as ReadonlyArray<readonly [string, SnapshotRecord | undefined]>)
        .map(([recordKey, record]: readonly [string, SnapshotRecord | undefined]) => {
            if (!record) return null;
            const key = deriveKey(recordKey, record, keySource);
            if (!key) return null;
            const ts = typeof record.ts === 'number' ? record.ts : Date.now();
            return {
                key,
                payload: record.payload,
                ts,
            } satisfies SnapshotMessage;
        })
        .filter((entry): entry is SnapshotMessage => entry !== null);

export function startCompactor(store: CompactorStore, bus: CompactorBus, opts: CompactorOptions): () => void {
    const every = opts.intervalMs ?? 30_000;
    const abortController = new AbortController();

    const runCycle = async (): Promise<void> => {
        if (abortController.signal.aborted) return;
        const latest = await store.latestByKey(opts.topic, opts.batchKeys ?? []);
        const snapshots = toSnapshotEntries(latest, opts.keySource);
        if (snapshots.length === 0) return;

        await Promise.all(
            snapshots.map(({ key, payload, ts }) => bus.publish(opts.snapshotTopic, { key, payload, ts }, { key })),
        );
    };

    const schedule = (): void => {
        if (abortController.signal.aborted) return;

        const timer = setTimeout(() => {
            void runCycle()
                .catch(() => undefined)
                .finally(() => {
                    schedule();
                });
        }, every);

        abortController.signal.addEventListener(
            'abort',
            () => {
                clearTimeout(timer);
            },
            { once: true },
        );
    };

    void runCycle().catch(() => undefined);
    schedule();

    return () => {
        abortController.abort();
    };
}
