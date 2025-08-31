import test from 'ava';
import { World } from './ecs';
import { makeBlueprint, spawn } from './ecs.prefab';

test('prefab: spawns entities from blueprint with overrides', (t) => {
    const world = new World();
    const Pos = world.defineComponent<{ x: number }>({ name: 'Pos' });
    const Vel = world.defineComponent<{ v: number }>({ name: 'Vel' });

    const bp = makeBlueprint('Mover', [
        { c: Pos, v: (i: number) => ({ x: i }) },
        { c: Vel, v: { v: 0 } },
    ]);

    const ids = spawn(world, bp, 2, { [Vel.id]: { v: 5 } });
    t.is(ids.length, 2);

    const q = world.makeQuery({ all: [Pos, Vel] });
    const res = [...world.iter(q, Pos, Vel)];
    t.is(res.length, 2);
    res.forEach(([e, , pos, vel], i) => {
        t.true(ids.includes(e));
        t.deepEqual(pos, { x: i });
        t.deepEqual(vel, { v: 5 });
    });
});
