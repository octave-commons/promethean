export type TimetravelEvent<TPayload> = Readonly<{
    ts: number;
    key: string;
    payload: TPayload;
}>;

export type TimetravelScanOptions = Readonly<{
    ts: number;
    limit: number;
}>;

export type TimetravelStore<TEvent extends TimetravelEvent<unknown>> = Readonly<{
    scan: (topic: string, opts: TimetravelScanOptions) => Promise<ReadonlyArray<TEvent>>;
}>;

export type ReconstructSnapshot<TState> = Readonly<{
    state: TState | null;
    ts: number;
}>;

export type ReconstructOpts<TState, TEvent extends TimetravelEvent<unknown>> = Readonly<{
    topic: string;
    snapshotTopic?: string;
    key: string;
    atTs: number;
    apply: (prev: TState | null, event: TEvent) => TState | null;
    fetchSnapshot?: (key: string, upTo: number) => Promise<ReconstructSnapshot<TState> | null>;
}>;

export const reconstructAt = async <TState, TEvent extends TimetravelEvent<unknown>>(
    store: TimetravelStore<TEvent>,
    opts: ReconstructOpts<TState, TEvent>,
): Promise<ReconstructSnapshot<TState>> => {
    const baseline = opts.fetchSnapshot ? await opts.fetchSnapshot(opts.key, opts.atTs) : null;

    const initial: ReconstructSnapshot<TState> = baseline ?? {
        state: null,
        ts: 0,
    };

    const events = await store.scan(opts.topic, { ts: initial.ts, limit: 1_000_000 });

    return events.reduce<ReconstructSnapshot<TState>>((accumulator, event) => {
        if (event.ts > opts.atTs || event.key !== opts.key) {
            return accumulator;
        }

        return {
            state: opts.apply(accumulator.state, event),
            ts: event.ts,
        } as const;
    }, initial);
};
