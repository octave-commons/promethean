// SPDX-License-Identifier: GPL-3.0-only
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import { createWsServer } from './wsListener.js';

dotenv.config();

export interface StartOptions {
    port?: number;
    bridgeUrl?: string;
}

export function startServer(opts: StartOptions = {}) {
    const port = opts.port ?? Number(process.env.MCP_SERVER_PORT || 4410);
    let server;
    if (process.env.MCP_TLS_CERT && process.env.MCP_TLS_KEY) {
        server = createHttpsServer({
            cert: readFileSync(process.env.MCP_TLS_CERT),
            key: readFileSync(process.env.MCP_TLS_KEY),
        });
    } else {
        server = createHttpServer();
    }
    createWsServer(server);
    return new Promise<{ port: number; close: () => void }>((resolve) => {
        server.listen(port, () => {
            const address = server.address();
            const actualPort = typeof address === 'object' && address ? address.port : port;
            resolve({
                port: actualPort,
                close: () => new Promise<void>((r) => server.close(() => r())),
            });
        });
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}
