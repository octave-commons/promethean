import { reconstructAt } from './reconstruct.js';
// loosen typing to avoid cross-package type coupling

export async function processAt(store: any, processId: string, atTs: number) {
    return reconstructAt(store, {
        topic: 'process.state',
        key: processId,
        atTs,
        apply: (_prev: any, e: any) => e.payload,
    });
}
