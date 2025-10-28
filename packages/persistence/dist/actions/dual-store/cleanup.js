export const cleanup = async (_inputs, dependencies) => {
    await dependencies.chroma.queue.shutdown();
    if (dependencies.cleanupClients) {
        try {
            await dependencies.cleanupClients();
        }
        catch (error) {
            dependencies.logger.warn('Dual store cleanup encountered an error', error);
        }
    }
};
//# sourceMappingURL=cleanup.js.map