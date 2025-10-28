import type { DualStoreDependencies } from './types.js';

export const getChromaQueueStats = <TextKey extends string, TimeKey extends string>(
    _inputs: void,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
) => dependencies.chroma.queue.getQueueStats();

