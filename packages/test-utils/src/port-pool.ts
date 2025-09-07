// GPL-3.0-only
import net from 'node:net';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const getFreePort = async (host = '127.0.0.1'): Promise<number> => {
    // Bind to 0 to let OS assign an actually free port, then close.
    // Low risk of race; keep AVA concurrency small and you’re fine.
    const server = net.createServer();
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen({ host, port: 0 }, () => resolve());
    });
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // brief pause reduces “close→reuse” races on some kernels
    await wait(10);
    return port;
};
