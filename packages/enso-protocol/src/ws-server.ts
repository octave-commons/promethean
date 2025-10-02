#!/usr/bin/env node
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';

import type { Envelope } from './types/envelope.js';
import type { HelloCaps, PrivacyProfile } from './types/privacy.js';
import { resolveHelloPrivacy } from './types/privacy.js';
import { EnsoServer, type ServerSession } from './server.js';

const PORT = Number(process.env.PORT ?? process.env.ENSO_PORT ?? 7766);

/** Transport frame used by enso-protocol's WS client */
type TransportFrame =
  | { type: 'hello'; payload: HelloCaps }
  | { type: 'envelope'; payload: Envelope }
  | { type: 'ping'; ts: string }
  | { type: 'pong'; ts: string };

function encodeFrame(frame: TransportFrame): string {
  return JSON.stringify(frame, (_k, v) => {
    if (v instanceof Uint8Array) {
      return { __enso_binary__: Buffer.from(v).toString('base64') };
    }
    return v;
  });
}
function decodeFrame(raw: string): TransportFrame {
  return JSON.parse(raw, (_k, v) => {
    if (v && typeof v === 'object' && '__enso_binary__' in (v as any)) {
      return Uint8Array.from(Buffer.from((v as any).__enso_binary__, 'base64'));
    }
    return v;
  }) as TransportFrame;
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('enso-protocol ws-server');
});

const wss = new WebSocketServer({ server, path: '/ws' });
const enso = new EnsoServer();

wss.on('connection', (ws) => {
  let session: ServerSession | undefined;
  let connected = false;
  const buffered: Envelope[] = [];

  const forward = (s: ServerSession, env: Envelope) => {
    if (!session || s.id !== session.id) return;
    if (!connected) { buffered.push(env); return; }
    ws.send(encodeFrame({ type: 'envelope', payload: env }));
  };

  const flush = () => {
    while (connected && buffered.length > 0) {
      const env = buffered.shift();
      if (env) ws.send(encodeFrame({ type: 'envelope', payload: env }));
    }
  };

  const onMessage = async (raw: Buffer) => {
    try {
      const frame = decodeFrame(String(raw));
      if (frame.type === 'ping') {
        ws.send(encodeFrame({ type: 'pong', ts: frame.ts }));
        return;
      }
      if (frame.type === 'hello') {
        // complete handshake
        const hello = frame.payload;
        const negotiated = enso.acceptHandshake(hello, {});
        session = negotiated.session;
        ws.send(encodeFrame({ type: 'envelope', payload: negotiated.accepted }));
        ws.send(encodeFrame({ type: 'envelope', payload: negotiated.presence }));
        connected = true;
        flush();
        return;
      }
      if (frame.type === 'envelope') {
        await enso.dispatch(session, frame.payload);
        return;
      }
    } catch (err) {
      console.error('ws-server message error', err);
      ws.close(1011, 'bad frame');
    }
  };

  const onClose = () => {
    try { if (session) enso.disconnectSession(session.id, 'ws-close'); } catch {}
    enso.off('message', forward);
  };

  enso.on('message', forward);
  ws.on('message', onMessage);
  ws.on('close', onClose);
});

server.listen(PORT, () => {
  console.log(`[enso] WebSocket server listening on :${PORT} (path /ws)`);
});
