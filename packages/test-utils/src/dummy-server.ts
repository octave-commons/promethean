// GPL-3.0-only
import http from 'node:http';

export type RunningServer = {
    port: number;
    url: string; // e.g., http://127.0.0.1:0/ -> becomes actual port after listen
    stop: () => Promise<void>;
};

export const startDummyServer = async (port = 0): Promise<RunningServer> => {
    const server = http.createServer((req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
            return;
        }
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end('hello');
    });

    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen({ host: '127.0.0.1', port }, () => resolve());
    });

    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : port;
    const stop = async () => new Promise<void>((resolve) => server.close(() => resolve()));

    return { port: actualPort, url: `http://127.0.0.1:${actualPort}/`, stop };
};
