import type { DualStoreDependencies } from './types.js';

export const cleanup = async <TextKey extends string, TimeKey extends string>(
    _inputs: undefined,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<void> => {
    await dependencies.chroma.queue.shutdown();

    if (dependencies.cleanupClients) {
        try {
            await dependencies.cleanupClients();
        } catch (error) {
            dependencies.logger.warn('Dual store cleanup encountered an error', error);
        }
    }
};

