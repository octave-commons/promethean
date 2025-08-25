import test from 'ava';
import { World } from './ecs';
import { Scheduler } from './ecs.scheduler';

test('Scheduler: orders systems, respects conflicts, skips empty', async (t) => {
    const world = new World();
    const Pos = world.defineComponent<{ x: number }>({ name: 'Pos' });
    const Vel = world.defineComponent<{ v: number }>({ name: 'Vel' });
    const e = world.createEntity();
    world.addComponent(e, Pos, { x: 0 });

    const sched = new Scheduler(world);
    sched.resourcesBag().define('count', 0);

    const calls: string[] = [];
    sched
        .register({
            name: 'writer',
            writes: ['count'],
            writesComponents: [Pos],
            query: () => ({ all: [Pos] }),
            run: ({ world, resources }) => {
                const q = world.makeQuery({ all: [Pos] });
                for (const [, , pos] of world.iter(q, Pos)) {
                    (pos as { x: number }).x += 1;
                }
                const c = resources.get<number>('count');
                resources.set('count', c + 1);
                calls.push('writer');
            },
        })
        .register({
            name: 'reader',
            reads: ['count'],
            readsComponents: [Pos],
            query: () => ({ all: [Pos] }),
            run: ({ resources }) => {
                calls.push(`reader:${resources.get<number>('count')}`);
            },
        })
        .register({
            name: 'render',
            stage: 'render',
            readsComponents: [Pos],
            query: () => ({ all: [Pos] }),
            run: () => {
                calls.push('render');
            },
        })
        .register({
            name: 'skipper',
            writesComponents: [Vel],
            query: () => ({ all: [Vel] }),
            skipIfEmpty: true,
            run: () => {
                calls.push('skip');
            },
        });

    await sched.runFrame(0, 0, { parallel: false });

    t.deepEqual(calls, ['writer', 'reader:1', 'render']);
    const q = world.makeQuery({ all: [Pos] });
    const [[, , pos]] = [...world.iter(q, Pos)];
    t.is((pos as { x: number }).x, 1);
    t.is(sched.resourcesBag().get<number>('count'), 1);
});
