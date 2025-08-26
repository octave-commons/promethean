import test from 'ava';
import request from 'supertest';
import { BrokerClient } from '@shared/js/brokerClient.js';
import os from 'os';
import { start, stop, reset } from '../index.js';
import { start as startBroker, stop as stopBroker } from '../../broker/index.js';

let server;
let broker;
let brokerPort;

async function sendHeartbeat(payload) {
    const client = new BrokerClient({ url: `ws://127.0.0.1:${brokerPort}` });
    await client.connect();
    client.publish('heartbeat', payload);
    await new Promise((r) => setTimeout(r, 50));
    client.socket.close();
}

test.before(async () => {
    broker = await startBroker(0);
    brokerPort = broker.address().port;
    process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
    process.env.HEARTBEAT_TIMEOUT = '10000';
    server = await start(0);
});

test.after.always(async () => {
    await stop();
    if (broker) await stopBroker(broker);
});

test.beforeEach(() => {
    reset();
});

test.serial('returns aggregated metrics', async (t) => {
    await sendHeartbeat({ name: 'svc', cpu: 10, memory: 1024 });
    const res = await request(server).get('/health').expect(200);
    t.is(res.body.status, 'ok');
    t.true(res.body.cpu.total >= 10);
    t.true(res.body.memory.total >= 1024);
});

test.serial('reports critical when load high', async (t) => {
    await sendHeartbeat({ name: 'svc', cpu: 0, memory: os.totalmem() * 0.95 });
    const res = await request(server).get('/health').expect(200);
    t.is(res.body.status, 'critical');
});
