import test from 'ava';
import { InMemoryEventBus } from './memory.js';

test('event bus: publish/subscribe earliest', async (t) => {
    const bus = new InMemoryEventBus();
    const seen: string[] = [];

    const unsub = await bus.subscribe(
        't.a',
        'g1',
        async (e) => {
            seen.push(e.payload as string);
        },
        { from: 'earliest' },
    );

    await bus.publish('t.a', 'one');
    await bus.publish('t.a', 'two');

    await new Promise((r) => setTimeout(r, 50));
    t.deepEqual(seen, ['one', 'two']);

    const cur = await bus.getCursor('t.a', 'g1');
    t.truthy(cur?.lastId);
    await unsub();
});

test('event bus: nack leaves cursor and retries', async (t) => {
    const bus = new InMemoryEventBus();
    let attempts = 0;

    const unsub = await bus.subscribe(
        't.b',
        'g1',
        async (_e) => {
            attempts++;
            if (attempts === 1) throw new Error('boom');
        },
        { from: 'earliest' },
    );

    await bus.publish('t.b', 'x');
    await new Promise((r) => setTimeout(r, 80));
    t.true(attempts >= 2);
    await unsub();
});

test('event bus: manual ack requires explicit ack', async (t) => {
    const bus = new InMemoryEventBus();
    let lastId: string | undefined;

    const unsub = await bus.subscribe(
        't.c',
        'g1',
        async (e) => {
            lastId = e.id;
        },
        { from: 'earliest', manualAck: true },
    );

    await bus.publish('t.c', 'one');
    await new Promise((r) => setTimeout(r, 50));

    let cur = await bus.getCursor('t.c', 'g1');
    t.is(cur?.lastId, undefined);

    await bus.ack('t.c', 'g1', lastId!);
    cur = await bus.getCursor('t.c', 'g1');
    t.is(cur?.lastId, lastId);
    await unsub();
});
