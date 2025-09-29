import { once } from 'node:events';
import type { AddressInfo } from 'node:net';

import test from 'ava';
import type { ReadonlyDeep } from 'type-fest';
import WebSocket from 'ws';

import { startWSGateway } from '../server.js';

type GatewayError = {
    readonly op: 'ERR';
    readonly code: string;
    readonly msg: string;
    readonly corr: string;
};

type BusStub = {
    readonly publish: () => Promise<{ readonly id: string }>;
    readonly subscribe: () => Promise<() => Promise<void>>;
    readonly ack: () => Promise<void>;
    readonly nack: () => Promise<void>;
};

const bus: BusStub = {
    publish: async () => ({ id: 'noop' }),
    subscribe: async () => async () => {},
    ack: async () => {},
    nack: async () => {},
};

type GatewayHandles = {
    readonly ws: WebSocket;
    readonly close: () => Promise<void>;
};

async function startGateway(): Promise<GatewayHandles> {
    const wss = startWSGateway(bus, 0, { ackTimeoutMs: 50 });
    await once(wss, 'listening');
    const address = wss.address();
    if (!address || typeof address === 'string') {
        throw new Error('failed to acquire server address');
    }

    const ws = new WebSocket(`ws://127.0.0.1:${(address as AddressInfo).port}`);
    await once(ws, 'open');

    const close = async () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
        }
        if (ws.readyState !== WebSocket.CLOSED) {
            await once(ws, 'close').catch(() => {});
        }
        await new Promise<void>((resolve, reject) => {
            wss.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    return { ws, close } as const;
}

function isGatewayError(value: unknown): value is GatewayError {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Partial<GatewayError>;
    return (
        candidate.op === 'ERR' &&
        typeof candidate.code === 'string' &&
        typeof candidate.msg === 'string' &&
        typeof candidate.corr === 'string'
    );
}

async function receiveError(ws: ReadonlyDeep<WebSocket>): Promise<GatewayError> {
    const [raw] = (await once(ws, 'message')) as [WebSocket.RawData];
    const parsed: unknown = JSON.parse(raw.toString());
    if (!isGatewayError(parsed)) {
        throw new TypeError('unexpected gateway response');
    }
    return parsed;
}

test('gateway rejects operations before auth', async (t) => {
    const { ws, close } = await startGateway();
    t.teardown(close);
    ws.send(
        JSON.stringify({
            op: 'PUBLISH',
            topic: 'demo',
            payload: { hello: 'world' },
            corr: 'corr-1',
        }),
    );
    const err = await receiveError(ws);
    t.deepEqual(err, {
        op: 'ERR',
        code: 'unauthorized',
        msg: 'Call AUTH first.',
        corr: 'corr-1',
    });
});
