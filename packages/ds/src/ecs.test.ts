import test from 'ava';
import { World } from './ecs.js';

test('ecs: creates entity and iterates components', (t) => {
    const world = new World();
    const Pos = world.defineComponent<{ x: number; y: number }>({
        name: 'Position',
    });
    const Vel = world.defineComponent<{ x: number; y: number }>({
        name: 'Velocity',
    });
    const e = world.createEntity();
    world.addComponent(e, Pos, { x: 1, y: 2 });
    world.addComponent(e, Vel, { x: 3, y: 4 });
    const q = world.makeQuery({ all: [Pos, Vel] });
    const res = [...world.iter(q, Pos, Vel)];
    t.is(res.length, 1);
    const [ent, , pos, vel] = res[0];
    t.is(ent, e);
    t.deepEqual(pos, { x: 1, y: 2 });
    t.deepEqual(vel, { x: 3, y: 4 });
});
