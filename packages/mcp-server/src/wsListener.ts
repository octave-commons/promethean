import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { attachRouter } from './router.js';
import { authorize } from './auth.js';
import { trackSession } from './metrics.js';

export function createWsServer(server: any) {
    const wss = new WebSocketServer({ noServer: true });
    server.on('upgrade', (req: any, socket: any, head: any) => {
        if (req.url !== '/mcp') return;
        const url = new URL(req.url, 'http://localhost');
        const token =
            req.headers['authorization']?.replace('Bearer ', '') || url.searchParams.get('token');
        const origin = req.headers['origin'];
        if (!authorize(token, origin)) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
        wss.handleUpgrade(req, socket, head, (ws: import('ws').WebSocket) => {
            const sessionId = randomUUID();
            trackSession(1);
            attachRouter(ws, sessionId);
            ws.on('close', () => trackSession(-1));
        });
    });
    return wss;
}
