import test from 'ava';

import { World } from './ecs.js';

test('ECS double-buffer: add readable in-frame; set visible after endTick', (t) => {
    const w = new World();
    const Pos = w.defineComponent<{ x: number }>({ name: 'Pos' });
    const e = w.createEntity();

    // Add comp in a tick → prev is seeded for new rows; readable same frame
    w.beginTick();
    w.addComponent(e, Pos, { x: 1 });
    t.deepEqual(w.get(e, Pos), { x: 1 });
    w.endTick();
    t.deepEqual(w.get(e, Pos), { x: 1 });

    // Update in next tick, observe staged write is not visible until swap
    w.beginTick();
    w.set(e, Pos, { x: 2 });
    t.deepEqual(w.get(e, Pos), { x: 1 }); // prev still
    w.endTick();
    t.deepEqual(w.get(e, Pos), { x: 2 });
});

test('ECS double-buffer: unwritten rows carry forward', (t) => {
    const w = new World();
    const Pos = w.defineComponent<{ n: number }>({ name: 'Pos' });
    const e = w.createEntity();
    w.beginTick();
    w.addComponent(e, Pos, { n: 10 });
    w.endTick();
    t.is(w.get(e, Pos)!.n, 10);

    // No writes this frame → value should carry
    w.beginTick();
    w.endTick();
    t.is(w.get(e, Pos)!.n, 10);
});

test('ECS double-buffer: changed mask flags rows written last tick', (t) => {
    const w = new World();
    const Pos = w.defineComponent<{ v: number }>({ name: 'Pos' });
    const e = w.createEntity();

    // frame 1: add
    w.beginTick();
    w.addComponent(e, Pos, { v: 1 });
    w.endTick();

    // frame 2: set
    w.beginTick();
    w.set(e, Pos, { v: 2 });
    w.endTick();

    // frame 3: query 'changed' should see the entity
    const q = w.makeQuery({ changed: [Pos], all: [Pos] });
    const seen = Array.from(w.iter(q)).length;
    t.is(seen, 1);
});

test('ECS double-buffer: double write warns once and last wins', (t) => {
    const w = new World();
    const Pos = w.defineComponent<{ n: number }>({ name: 'Pos' });
    const e = w.createEntity();
    w.beginTick();
    w.addComponent(e, Pos, { n: 0 });
    w.endTick();

    const origWarn = console.warn;
    let warnCount = 0;
    console.warn = ((..._args: ReadonlyArray<unknown>) => {
        warnCount++;
    }) as typeof console.warn;
    try {
        w.beginTick();
        w.set(e, Pos, { n: 1 });
        w.set(e, Pos, { n: 2 });
        w.endTick();
    } finally {
        console.warn = origWarn;
    }
    t.true(warnCount > 0);
    t.is(w.get(e, Pos)!.n, 2);
});

test('ECS double-buffer: nested beginTick throws', (t) => {
    const w = new World();
    w.beginTick();
    t.throws(() => w.beginTick());
    w.endTick();
});
