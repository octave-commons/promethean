/**
 * Cleanup all dual store resources (functional API)
 */
export async function cleanup(): Promise<void> {
    // Cleanup all registered managers
    for (const [name, manager] of managerRegistry) {
        try {
            await manager.chromaWriteQueue.shutdown();
        } catch (error) {
            console.warn(`Failed to cleanup manager ${name}:`, error);
        }
    }

    // Clear registry
    managerRegistry.clear();

    // Cleanup clients
    const { cleanupClients } = await import('./clients.js');
    await cleanupClients();
}
