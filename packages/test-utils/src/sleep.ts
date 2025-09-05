export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        const id = setTimeout(resolve, Math.max(0, ms | 0));
        // In Node, allow the event loop to exit naturally.
        (id as any).unref?.();
    });
}
