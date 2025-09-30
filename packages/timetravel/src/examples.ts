import type { ReconstructSnapshot, TimetravelEvent, TimetravelStore } from './reconstruct.js';
import { reconstructAt } from './reconstruct.js';

export type ProcessStateEvent<TState> = TimetravelEvent<TState>;

export const processAt = async <TState>(
    store: TimetravelStore<ProcessStateEvent<TState>>,
    processId: string,
    atTs: number,
): Promise<ReconstructSnapshot<TState>> =>
    reconstructAt<TState, ProcessStateEvent<TState>>(store, {
        topic: 'process.state',
        key: processId,
        atTs,
        apply: (_prev, event) => event.payload,
    });
