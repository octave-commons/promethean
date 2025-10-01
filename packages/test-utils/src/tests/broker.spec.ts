import test from 'ava';

import {
    getMemoryBroker,
    resetMemoryBroker,
    type MemoryBrokerClient,
    type MemoryBrokerEvent,
    type MemoryBrokerTask,
} from '../broker.js';

test.beforeEach(() => {
    resetMemoryBroker('ns');
});

test('getMemoryBroker returns singleton per namespace', (t) => {
    const a = getMemoryBroker('ns');
    const b = getMemoryBroker('ns');
    t.is(a, b);
});

test('publish delivers to subscribers; unsubscribe stops delivery', (t) => {
    const broker = getMemoryBroker('ns');
    const received: MemoryBrokerEvent[] = [];
    const client: MemoryBrokerClient = { id: 'c1', onEvent: (event) => received.push(event) };

    broker.subscribe(client, 'topic');
    broker.publish({ type: 'topic', payload: { x: 1 } });
    t.is(received.length, 1);
    t.deepEqual(received[0].payload, { x: 1 });

    broker.unsubscribe(client, 'topic');
    broker.publish({ type: 'topic', payload: { x: 2 } });
    t.is(received.length, 1);
});

test('enqueue assigns to ready worker immediately', (t) => {
    const broker = getMemoryBroker('ns');
    const assigned: MemoryBrokerTask[] = [];
    broker.readyWorker('q', { id: 'w1', assign: (task) => assigned.push(task) });
    broker.enqueue('q', { a: 1 });
    t.is(assigned.length, 1);
    t.is(assigned[0].queue, 'q');
    t.deepEqual(assigned[0].payload, { a: 1 });
});

test('enqueue queues when no workers; first ready worker gets earliest task', (t) => {
    const broker = getMemoryBroker('ns');
    const assigned: MemoryBrokerTask[] = [];
    broker.enqueue('q', { a: 1 });
    broker.enqueue('q', { a: 2 });
    broker.readyWorker('q', { id: 'w1', assign: (task) => assigned.push(task) });
    broker.readyWorker('q', { id: 'w2', assign: (task) => assigned.push(task) });

    t.is(assigned.length, 2);
    t.deepEqual(assigned[0].payload, { a: 1 });
    t.deepEqual(assigned[1].payload, { a: 2 });
});

test('resetMemoryBroker clears state and instances', (t) => {
    const a = getMemoryBroker('ns');
    a.record('note', { ok: true });
    t.true(a.logs.length > 0);

    resetMemoryBroker('ns');
    const b = getMemoryBroker('ns');
    t.not(a, b);
    t.is(b.logs.length, 0);
});
